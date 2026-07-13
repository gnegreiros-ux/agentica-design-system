# ADR-007 — Choix de axe-core pour les tests d'accessibilité

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-007-axe-core-accessibilite.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** .claude/rules/development.md, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md, decisions/ADR-006-chromatic-tests-visuels.md

> **English summary:** Adopts axe-core (via Playwright and the Storybook a11y addon) as the automated accessibility engine, blocking merges on any `critical` or `serious` WCAG violation. Agents treat a critical violation as a mandatory escalation, never an optional warning — and the ADR is explicit that axe-core covers only ~30-40% of WCAG 2.1 AA, a floor rather than a ceiling.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

`DESIGN.md` établit que l'accessibilité est **non négociable** : WCAG 2.1 AA minimum
sur tous les composants, en toutes circonstances. Cette exigence n'est pas une
recommandation — c'est une règle de gouvernance au même niveau que les règles de tokens.

Deux problèmes structurels rendaient une réponse outil nécessaire :

**1. L'accessibilité est invisible au moment de l'écriture du code**
Un ratio de contraste insuffisant, un attribut `aria-label` manquant, un `role`
incorrect — aucune de ces violations n'est détectable à la lecture du code ou
lors d'un test fonctionnel standard. Elles nécessitent une analyse spécialisée.

**2. La revue manuelle ne passe pas à l'échelle**
Avec plusieurs composants, plusieurs variantes, plusieurs états chacun, un audit
manuel complet par PR est irréaliste. Les violations passent en production et
impactent tous les consommateurs du système simultanément.

La question posée était :

> **Comment garantir zéro violation WCAG 2.1 AA critique à chaque PR,
> automatiquement, sans dépendre de la vigilance individuelle des reviewers ?**

---

## Décision

Adoption de **axe-core** (Deque Systems) comme moteur d'audit d'accessibilité
automatisé, intégré à deux niveaux complémentaires :

**Niveau composant** — via `@axe-core/playwright` dans les tests Playwright :
chaque composant dans chaque variante et état est audité en conditions réelles
de rendu navigateur. Zéro violation critique = condition de passage du CI.

**Niveau Storybook** — via `@storybook/addon-a11y` (basé sur axe-core) :
audit en direct dans le canvas Storybook pendant le développement, avant même
d'ouvrir une PR.

La règle est stricte : **zéro violation de niveau `critical` ou `serious`**.
Les violations `moderate` et `minor` génèrent un avertissement mais ne bloquent
pas le merge — elles sont documentées et adressées dans un ticket dédié.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Lighthouse (Google)** | Conçu pour auditer des pages entières, pas des composants isolés. Son intégration dans un pipeline de tests unitaires ou Storybook est indirecte. Pertinent pour les tests E2E de pages, pas pour la validation composant par composant en CI. Utilisé en complément, pas en remplacement. |
| **WAVE (WebAIM)** | Extension navigateur uniquement. Non automatisable en CI/CD. Indispensable pour la revue manuelle approfondie, mais ne peut pas bloquer un merge. |
| **Pa11y** | CLI accessible et open source. Moins bien intégré à l'écosystème Playwright + Storybook. Le règlement de règles WCAG est moins granulaire qu'axe-core, et la communauté de maintenance est significativement plus petite. |
| **IBM Equal Access Checker** | Couverture WCAG complète et règles supplémentaires intéressantes. Moins adopté dans l'écosystème JS/Node. L'intégration Playwright et Storybook nécessite plus de configuration personnalisée. Retenu pour des audits ponctuels manuels, pas pour le CI continu. |
| **Audit manuel par un expert accessibilité** | Non substituable pour la validation finale et les cas limites. Mais ne passe pas à l'échelle comme filet de sécurité continu. Le choix d'axe-core ne remplace pas l'expertise humaine — il garantit un plancher minimal automatique à chaque PR. |
| **ESLint + eslint-plugin-jsx-a11y** | Détecte les problèmes statiques dans le JSX (attributs manquants, rôles incorrects). Complémentaire mais insuffisant : il analyse le code source, pas le rendu. Un composant syntaxiquement correct peut produire un arbre d'accessibilité incorrect à l'exécution (Shadow DOM, slots, états dynamiques). |

---

## Conséquences

**Pour le CI/CD :**
- Toute PR introduisant une violation `critical` ou `serious` est bloquée au merge
- Le rapport axe-core est inclus dans les artefacts de PR — visible dans GitHub Actions
- La règle `exit 1` sur violation critique est alignée avec le comportement de `audit-tokens.js --ci`

**Pour les agents IA :**
- Une violation d'accessibilité critique détectée par axe-core est une **escalade obligatoire**,
  pas un avertissement optionnel (voir `.claude/rules/development.md`)
- Un agent ne peut pas approuver ou ignorer une violation critique — il doit la signaler
  et bloquer la PR jusqu'à correction humaine
- axe-core fournit un rapport structuré (JSON) qu'un agent peut lire et analyser
  pour identifier précisément quelle règle WCAG est violée, sur quel élément, et
  quelle correction appliquer

**Pour les développeurs :**
- Le retour est immédiat : l'addon Storybook signale les violations dans le panneau
  d'accessibilité pendant le développement, avant le commit
- Le rapport axe-core nomme la règle violée, l'élément cible, et renvoie vers
  la documentation WCAG correspondante — pas besoin de chercher

**Pour les designers :**
- Les violations de contraste (ratio insuffisant) sont détectées automatiquement
- Un composant qui passe axe-core en toutes variantes et états est certifié WCAG AA
  pour les critères testables automatiquement
- Les critères non testables automatiquement (ordre de lecture logique, alternatives
  textuelles pertinentes, comportement avec lecteur d'écran réel) restent sous
  responsabilité humaine — axe-core ne couvre pas 100% de WCAG

**Périmètre exact de couverture :**
axe-core détecte automatiquement environ 30 à 40% des violations WCAG 2.1 AA.
Ce chiffre est intentionnellement communiqué aux équipes pour éviter une fausse
confiance : zéro violation axe-core n'est pas équivalent à "accessible".
C'est un plancher, pas un plafond.

**Coût accepté :**
- Les tests Playwright avec axe-core allongent le pipeline CI (rendu navigateur réel)
- Les faux positifs sont rares avec axe-core mais existent — chaque suppression de règle
  doit être documentée dans le code avec justification (`axe.disable` commenté)
- La couverture partielle de WCAG doit être explicitement communiquée pour ne pas
  créer de fausse confiance dans les équipes consommatrices

---

## Relation avec Chromatic (ADR-006)

axe-core et Chromatic sont complémentaires, pas redondants :

| | Chromatic | axe-core |
|--|-----------|----------|
| **Détecte** | Régressions visuelles pixel | Violations sémantiques WCAG |
| **Exemple** | Couleur de fond qui change | Ratio de contraste insuffisant |
| **Exemple** | Espacement qui se décale | `aria-label` manquant |
| **Approbation** | Humaine (interface Chromatic) | Automatique (zéro tolérance critique) |

Un composant peut passer Chromatic (visuellement stable) et échouer axe-core
(sémantiquement inaccessible), et inversement.

---

## Incidents ou déclencheurs

Décision fondatrice, prise avant incident.
Motivée par le constat que les design systems livrant des composants sans tests
d'accessibilité automatisés génèrent des violations en cascade dans toutes
les applications consommatrices — chaque équipe hérite des mêmes problèmes
et les corrige localement, sans remonter au système source.
axe-core au niveau du système garantit que le problème est résolu une fois,
pour tous les consommateurs.
