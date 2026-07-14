# ADR-014 — Choosing Conventional Commits for commit messages

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Tech Lead, Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-014-conventional-commits.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md, decisions/ADR-012-audit-tokens-script.md

---

## Context

The git history is one of the system's sources of decision memory. A commit that
says `fix stuff` conveys no exploitable information — not to a human doing a
review, not to an agent looking for when a behavior changed, not to a CI
pipeline deciding whether a change needs governance review.

In an agentic system, commits have an additional role: they are
machine-readable events. A commit of type `token` can automatically trigger a
governance review. A commit of type `a11y` can trigger a priority re-run of
axe-core tests.

The question was:

> **How do we make commit messages exploitable by agents and CI pipelines,
> while staying readable and frictionless for humans?**

---

## Decision

Adopt the **Conventional Commits** specification with an additional type
specific to the design system: `token`.

Format: `[type]([scope]): [short description]`

The types allowed in this project:

| Type | Usage | CI trigger |
|------|-------|------------|
| `feat` | New component or feature | — |
| `fix` | Bug fix | — |
| `token` | Token modification | **Mandatory governance review** |
| `docs` | Documentation only | — |
| `a11y` | Accessibility improvement | Priority axe-core re-run |
| `style` | Style change with no functional impact | — |
| `refactor` | Refactor with no behavior change | — |
| `test` | Adding or modifying tests | — |
| `chore` | Maintenance, dependencies | — |
| `ci` | CI/CD configuration | — |

The `token` type is a local extension to Conventional Commits. It explicitly
signals that a token file modification is included — triggering a governance
review and potentially a TCR.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Free-form commit messages** | Not machine-parsable. An agent looking for "when did `color.action.primary` change?" has to read every commit message. With Conventional Commits, it filters by `token(semantic)`. |
| **Semantic Versioning in commits (e.g. v1.2.3)** | Versioning each commit individually is heavy and duplicates the information already carried by git tags. Conventional Commits + git tags cover this need without the verbosity. |
| **Homegrown prefixes** (`[DS]`, `[TOKEN]`, `[FIX]`) | Without a shared specification, prefixes drift quickly: `[DS-fix]`, `[ds fix]`, `[FixDS]`. Conventional Commits is a public specification with validation tooling (`commitlint`) — no need to write and maintain our own. |
| **Gitmoji** | Visually expressive but hard to filter by machine (`🐛` for fix, `✨` for feat). The team can add emojis as a complement but not as a replacement for the textual type. |
| **AngularJS commit convention** | Conventional Commits is directly derived from the Angular convention and is its public standardization. Adopting the standard specification rather than a specific framework's version. |

---

## Consequences

**For AI agents:**
- An agent generating a commit must choose the appropriate type — `token` if a
  `tokens/*.json` file is modified, `a11y` if the change targets accessibility
- The `token` type is a governance rule encoded in the commit message: an agent
  writing `token(semantic): ...` knows it triggers a human review
- Agents can filter the git history by type to answer questions:
  `git log --grep="^token" -- tokens/semantic.json` → every semantic token change

**For CI/CD:**
- `commitlint` can validate each commit's format in a pre-commit hook
- The `token` type can trigger a specific GitHub Action: notification to the
  Principal Designer, associated TCR check, automatic drift audit
- The `docs` type is excluded from visual regression test pipelines — no need to
  run Chromatic for a documentation change

**For humans:**
- The PR is easier to understand: the title (`token(semantic): add color.feedback.warning`)
  immediately says which governance applies
- The changelog generated automatically from commits is structured and readable
- Searching the history is predictable: `git log --grep="^feat(button)"`

**For system memory (ADR-013):**
- Commits are a layer of the project's decision memory
- A commit `token(semantic): add color.feedback.warning` + its associated TCR in
  `decisions/` form a complete trace: the what (commit), the why (ADR/TCR)

**Accepted cost:**
- Light friction for contributors unfamiliar with Conventional Commits
- Commit linting (`commitlint`) can be frustrating in case of a typo in the type
- The `token` type is a local extension — generic changelog tools don't know it
  and may ignore it

---

## Incidents or triggers

Foundational decision. The indirect trigger: during tests with generative agents
on the project's git history, agents couldn't answer "when was this token
modified?" with free-form commit messages. With Conventional Commits, the same
question becomes a structured `git log` query.

<!-- FR -->

# ADR-014 — Choix de Conventional Commits pour les messages de commit

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Tech Lead, Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-014-conventional-commits.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md, decisions/ADR-012-audit-tokens-script.md

---

## Contexte

L'historique git est l'une des sources de mémoire décisionnelle du système.
Un commit qui dit `fix stuff` ne transmet aucune information exploitable —
ni par un humain qui fait une revue, ni par un agent qui cherche quand
un comportement a changé, ni par un pipeline CI qui décide si un changement
nécessite une revue de gouvernance.

Dans un système agentique, les commits ont un rôle supplémentaire :
ils sont des événements lisibles par machine. Un commit de type `token`
peut déclencher automatiquement une revue de gouvernance. Un commit de type
`a11y` peut déclencher une re-exécution des tests axe-core en priorité.

La question posée était :

> **Comment rendre les messages de commit exploitables par les agents
> et les pipelines CI, tout en restant lisibles et sans friction pour les humains ?**

---

## Décision

Adoption de la spécification **Conventional Commits** avec un type supplémentaire
spécifique au système de design : `token`.

Format : `[type]([scope]): [description courte]`

Les types autorisés dans ce projet :

| Type | Usage | Déclencheur CI |
|------|-------|----------------|
| `feat` | Nouveau composant ou fonctionnalité | — |
| `fix` | Correction de bug | — |
| `token` | Modification de tokens | **Revue de gouvernance obligatoire** |
| `docs` | Documentation uniquement | — |
| `a11y` | Amélioration accessibilité | Re-run axe-core en priorité |
| `style` | Changement de style sans impact fonctionnel | — |
| `refactor` | Refactoring sans changement de comportement | — |
| `test` | Ajout ou modification de tests | — |
| `chore` | Maintenance, dépendances | — |
| `ci` | Configuration CI/CD | — |

Le type `token` est une extension locale à Conventional Commits.
Il signale explicitement qu'une modification de fichier de tokens est incluse —
déclenchant une revue de gouvernance et potentiellement un TCR.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Messages de commit libres** | Non parsables par machine. Un agent qui cherche "quand `color.action.primary` a-t-il changé ?" doit lire chaque message de commit. Avec Conventional Commits, il filtre par `token(semantic)`. |
| **Semantic Versioning dans les commits (ex: v1.2.3)** | Versionner chaque commit individuellement est lourd et duplique l'information portée par les tags git. Conventional Commits + git tags couvrent ce besoin sans verbosité. |
| **Préfixes maison** (`[DS]`, `[TOKEN]`, `[FIX]`)  | Sans spécification partagée, les préfixes dérivent rapidement : `[DS-fix]`, `[ds fix]`, `[FixDS]`. Conventional Commits est une spécification publique avec des outils de validation (`commitlint`) — pas besoin d'écrire et maintenir la nôtre. |
| **Gitmoji** | Expressif visuellement mais difficile à filtrer par machine (`🐛` pour fix, `✨` pour feat). L'équipe peut ajouter des emojis en complément mais pas en remplacement du type textuel. |
| **AngularJS commit convention** | Conventional Commits est directement dérivé de la convention Angular et en est la standardisation publique. Adopter la spécification standard plutôt que la version d'un framework spécifique. |

---

## Conséquences

**Pour les agents IA :**
- Un agent qui génère un commit doit choisir le type approprié — `token` si un fichier
  `tokens/*.json` est modifié, `a11y` si la modification cible l'accessibilité
- Le type `token` est une règle de gouvernance encodée dans le message de commit :
  un agent qui écrit `token(semantic): ...` sait qu'il déclenche une revue humaine
- Les agents peuvent filtrer l'historique git par type pour répondre à des questions :
  `git log --grep="^token" -- tokens/semantic.json` → tous les changements de tokens sémantiques

**Pour le CI/CD :**
- `commitlint` peut valider le format de chaque commit en pre-commit hook
- Le type `token` peut déclencher une GitHub Action spécifique : notification
  au Principal Designer, check de TCR associé, audit de dérive automatique
- Le type `docs` est exclu des pipelines de test de régression visuelle —
  pas besoin de faire tourner Chromatic pour un changement de documentation

**Pour les humains :**
- La PR est plus facile à comprendre : le titre (`token(semantic): ajouter color.feedback.warning`)
  dit immédiatement quelle gouvernance s'applique
- Le changelog généré automatiquement depuis les commits est structuré et lisible
- La recherche dans l'historique est prévisible : `git log --grep="^feat(button)"`

**Pour la mémoire du système (ADR-013) :**
- Les commits sont une couche de la mémoire décisionnelle du projet
- Un commit `token(semantic): ajouter color.feedback.warning` + le TCR associé dans
  `decisions/` constituent une trace complète : le quoi (commit), le pourquoi (ADR/TCR)

**Coût accepté :**
- Friction légère pour les contributeurs non familiers avec Conventional Commits
- Le linting des commits (`commitlint`) peut frustrer en cas de typo dans le type
- Le type `token` est une extension locale — les outils génériques de changelog
  ne le connaissent pas et peuvent l'ignorer

---

## Incidents ou déclencheurs

Décision fondatrice. Le déclencheur indirect : lors de tests avec des agents génératifs
sur l'historique git du projet, les agents ne pouvaient pas répondre à "quand ce token
a-t-il été modifié ?" avec des messages de commit libres. Avec Conventional Commits,
la même question devient une requête `git log` structurée.
