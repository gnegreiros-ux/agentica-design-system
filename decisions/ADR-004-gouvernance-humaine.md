# ADR-004 — Human governance: the human always has the final word

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Principal Designer, Product Leadership
> **Type:** contract
> **Logical path:** decisions/ADR-004-gouvernance-humaine.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/git-workflow.md, decisions/ADR-001-trois-niveaux-tokens.md

---

## Context

This design system is designed to be used by AI agents. That reality raises a
fundamental governance question that most teams avoid stating explicitly:

> **How far can an agent go without human approval?**

The question isn't technical. It's organizational, ethical, and legal.

Three types of risk guided the thinking:

**1. Accessibility risk**
An agent that changes a color token can drop a contrast ratio from 4.5:1 to 3.8:1 —
below the WCAG AA threshold. The component stays visually consistent, CI doesn't
break, but the interface becomes inaccessible to low-vision users. This kind of
drift is invisible without human eyes on it.

**2. Brand risk**
Semantic tokens encode brand intent (`color.action.primary`, `color.feedback.danger`).
An agent can rename or rework these intentions in a way that's locally coherent but
inconsistent with the organization's brand strategy. No automated test detects that
a blue has changed meaning.

**3. Irreversibility risk**
Some decisions are hard to undo once deployed: a deleted component that consuming
teams rely on, a renamed token with no deprecation period, a `critical` behavior
changed without an audit. An agent's speed amplifies the impact of a bad judgment call.

---

## Decision

Adopt the principle **"the human always has the final word"** as a non-negotiable,
non-bypassable governance rule.

This principle translates into explicit action boundaries:

### What an agent CAN do without approval

```
✅ Read every file in the system
✅ Analyze drift (hardcoded tokens, deprecated tokens, accessibility violations)
✅ Generate code from existing tokens
✅ Create a feature/, fix/, or docs/ branch
✅ Make commits on a non-protected branch
✅ Open a PR with a complete description
✅ Produce reports and recommendations
```

### What an agent CANNOT do without explicit approval

```
❌ Merge a PR (into main or develop)
❌ Push directly to main or develop
❌ Modify tokens/component.json
❌ Delete a token (any layer)
❌ Rename a semantic token
❌ Deploy to production
❌ Ignore a critical accessibility violation
```

### The escalation rule

Any change touching:
- a semantic token → TCR required
- a component contract → Principal Designer approval
- a `critical` behavior → Principal Designer + Security approval

When in doubt: **escalate. Never improvise.**

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Full agent autonomy** (merge without review) | No traceability of the intent behind a change. An agent optimizes for local consistency, not organizational strategy. Legal risk: who is liable for an inaccessible interface deployed by an agent? |
| **No agents** (humans only) | Misses the real gains: large-scale drift detection, compliant code generation, automatic compliance reports. The goal isn't to exclude agents but to govern them. |
| **Autonomous agents on primitive tokens only** | Seemingly safe, but primitives are the foundation of everything. Changing `blue-700` without human review can silently break dozens of components through the semantic and component layers. |
| **Confidence-score-based autonomy** (agent authorized if confidence > 95%) | An LLM's confidence score doesn't measure organizational risk. An agent can be "certain" about a token rename that breaks an undocumented team contract. Technical confidence doesn't replace human judgment. |
| **Lightweight async review** (approval by an AI review bot) | Displaces the problem instead of solving it. An AI approving another AI removes the human eye. Self-validation loops are a documented blind spot of agentic systems. |

---

## Consequences

**For teams:**
- Agents produce work that humans evaluate — not the other way around
- Every impactful decision is traceable in git, in ADRs, in TCRs
- Adoption by product teams is easier: they know no agent can deploy without a
  human having seen the change

**For agents:**
- Boundaries are explicit, unambiguous, verifiable in the rules
- An agent that hits a boundary knows what to do: escalate, not improvise
- This constraint improves output quality: the agent knows a human will review,
  which incentivizes documented, justified work

**For token governance:**
- The Token Change Request (TCR) is the formal approval mechanism
- Any semantic token change without an approved TCR = governance violation
- The history of TCRs constitutes the system's decision memory (see `decisions/`)

**Accepted cost:**
- Reduced velocity on changes that require approval
- Intentional friction: any decision to bypass governance must be conscious and
  documented — never silent
- This cost is judged lower than the cost of an accessibility, brand, or compliance
  incident caused by unsupervised autonomous action

---

## Note on the evolution of this principle

This principle isn't distrust of AI agents. It's a recognition that trust is built
progressively.

As the system accumulates evidence of reliability — ADRs, validated TCRs, clean
compliance reports — agents' action boundaries can be revisited and widened by
explicit human decision.

Any widening of agent autonomy will be the subject of an ADR that partially or
fully replaces this one.

---

## Incidents or triggers

Foundational decision, made before any incident. Motivated by the experience of
teams that granted too much autonomy to interface agents: undetected visual drift
over several sprints, tokens renamed with no deprecation period, components
deleted in production with no impact audit on consuming teams.

<!-- FR -->

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
