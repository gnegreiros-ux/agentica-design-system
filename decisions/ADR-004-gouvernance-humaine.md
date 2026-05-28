# ADR-004 — Gouvernance humaine : le dernier mot est toujours humain

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer, Direction produit
> **Type:** contract
> **Chemin logique:** decisions/ADR-004-gouvernance-humaine.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/git-workflow.md, decisions/ADR-001-trois-niveaux-tokens.md

---

## Contexte

Ce système de design est conçu pour être utilisé par des agents IA. Cette réalité
pose une question de gouvernance fondamentale que la plupart des équipes évitent
de formuler explicitement :

> **Jusqu'où un agent peut-il aller sans approbation humaine ?**

La question n'est pas technique. Elle est organisationnelle, éthique et légale.

Trois types de risques ont guidé la réflexion :

**1. Risque d'accessibilité**
Un agent qui modifie un token de couleur peut faire passer un ratio de contraste
de 4.5:1 à 3.8:1 — en dessous du seuil WCAG AA. Le composant reste visuellement
cohérent, le CI ne plante pas, mais l'interface devient inaccessible pour les
utilisateurs malvoyants. Ce type de dérive est invisible sans regard humain.

**2. Risque de marque**
Les tokens sémantiques encodent des intentions de marque (`color.action.primary`,
`color.feedback.danger`). Un agent peut renommer ou remanier ces intentions de
manière cohérente localement mais incohérente avec la stratégie de marque de
l'organisation. Aucun test automatisé ne détecte qu'un bleu a changé de signification.

**3. Risque d'irréversibilité**
Certaines décisions sont difficiles à défaire une fois déployées : un composant
supprimé que des équipes consommatrices utilisent, un token renommé sans période
de dépréciation, un comportement `critical` modifié sans audit. La vitesse d'un
agent amplifie l'impact d'une erreur de jugement.

---

## Décision

Adoption du principe **"le dernier mot est toujours humain"** comme règle de
gouvernance non négociable et non contournable.

Ce principe se traduit par des frontières d'action explicites :

### Ce qu'un agent PEUT faire sans approbation

```
✅ Lire tous les fichiers du système
✅ Analyser les dérives (tokens en dur, tokens dépréciés, violations d'accessibilité)
✅ Générer du code depuis les tokens existants
✅ Créer une branche feature/, fix/ ou docs/
✅ Faire des commits sur une branche non protégée
✅ Ouvrir une PR avec description complète
✅ Produire des rapports et des recommandations
```

### Ce qu'un agent NE PEUT PAS faire sans approbation explicite

```
❌ Merger une PR (sur main ou develop)
❌ Pusher directement sur main ou develop
❌ Modifier tokens/component.json
❌ Supprimer un token (toute couche)
❌ Renommer un token sémantique
❌ Déployer en production
❌ Ignorer une violation d'accessibilité critique
```

### La règle d'escalade

Tout changement touchant :
- un token sémantique → TCR requis
- un contrat de composant → approbation Principal Designer
- un comportement `critical` → approbation Principal Designer + Sécurité

En cas de doute : **escalader. Ne jamais improviser.**

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Autonomie complète des agents** (merge sans review) | Aucune traçabilité de l'intention derrière un changement. Un agent optimise pour la cohérence locale, pas pour la stratégie organisationnelle. Risque légal : qui est responsable d'une interface inaccessible déployée par un agent ? |
| **Aucun agent** (humains uniquement) | Manque les gains réels : détection de dérive à grande échelle, génération de code conforme, rapports de conformité automatiques. L'objectif n'est pas d'exclure les agents mais de les encadrer. |
| **Agents autonomes sur les tokens primitifs seulement** | En apparence sûr, mais les primitifs sont la fondation de tout. Modifier `blue-700` sans revue humaine peut casser silencieusement des dizaines de composants via les couches sémantique et composant. |
| **Autonomie par score de confiance** (agent autorisé si confiance > 95%) | Le score de confiance d'un LLM ne mesure pas le risque organisationnel. Un agent peut être "certain" d'un renommage de token qui casse un contrat d'équipe non documenté. La confiance technique ne remplace pas le jugement humain. |
| **Revue asynchrone légère** (approbation par un bot de revue IA) | Déplace le problème sans le résoudre. Une IA qui approuve une autre IA retire le regard humain. Les boucles d'auto-validation sont un angle mort documenté des systèmes agentiques. |

---

## Conséquences

**Pour les équipes :**
- Les agents produisent du travail que les humains évaluent — pas l'inverse
- Chaque décision impactante est traçable dans git, dans les ADRs, dans les TCRs
- L'adoption par les équipes produit est facilitée : elles savent qu'aucun agent ne
  peut déployer sans qu'un humain ait vu le changement

**Pour les agents :**
- Les frontières sont explicites, non ambiguës, vérifiables dans les règles
- Un agent qui atteint une frontière sait quoi faire : escalader, pas improviser
- Cette contrainte améliore la qualité des sorties : l'agent sait qu'un humain va
  relire, ce qui l'incite à produire un travail documenté et justifié

**Pour la gouvernance des tokens :**
- Le Token Change Request (TCR) est le mécanisme d'approbation formel
- Toute modification de token sémantique sans TCR approuvé = violation de gouvernance
- L'historique des TCRs constitue la mémoire décisionnelle du système (voir `decisions/`)

**Coût accepté :**
- Vélocité réduite sur les changements qui nécessitent approbation
- Friction intentionnelle : toute décision de contourner la gouvernance doit être
  consciente et documentée — jamais silencieuse
- Ce coût est jugé inférieur au coût d'un incident d'accessibilité, de marque
  ou de conformité causé par une action autonome non supervisée

---

## Note sur l'évolution de ce principe

Ce principe n'est pas une méfiance envers les agents IA. C'est une reconnaissance
que la confiance se construit progressivement.

À mesure que le système accumule des preuves de fiabilité — ADRs, TCRs validés,
rapports de conformité propres — les frontières d'action des agents pourront être
revues et élargies par décision humaine explicite.

Tout élargissement de l'autonomie des agents fera l'objet d'un ADR qui remplacera
partiellement ou totalement celui-ci.

---

## Incidents ou déclencheurs

Décision fondatrice, prise avant tout incident.
Motivée par les retours d'expérience d'équipes ayant accordé trop d'autonomie à
des agents d'interface : dérive visuelle non détectée pendant plusieurs sprints,
tokens renommés sans période de dépréciation, composants supprimés en production
sans audit d'impact sur les équipes consommatrices.
