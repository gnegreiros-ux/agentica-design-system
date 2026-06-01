# Rule : post-change-pipeline

> Quality gate obligatoire avant tout commit — non négociable pour tout agent ou session.
> **Type:** rule
> **Chemin logique:** .claude/rules/post-change-pipeline.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/skills/quality-gate.md, .claude/skills/pipelines/, .claude/rules/git-workflow.md, decisions/ADR-029-quality-gate-pre-commit.md

---

## Règle absolue

> **Aucun commit sans que le quality gate ait été exécuté et approuvé par l'humain.**

Ce quality gate s'applique à **toute modification**, quelle que soit sa taille.
Il ne peut pas être sauté, raccourci ou différé.

---

## Référence d'exécution

Voir `.claude/skills/quality-gate.md` — orchestrateur de tous les pipelines.

Pipelines actifs (bloquants) :

| # | Pipeline | Fichier |
|---|----------|---------|
| 1 | Cohérence tokens | `pipelines/tokens-audit.md` |
| 2 | WCAG 2.2 | `pipelines/wcag.md` |
| 3 | Revue patterns UX | `pipelines/ux-patterns.md` |
| 4 | Conformité règles / ADRs | `pipelines/adr-conformity.md` |
| 5 | ADRs manquants | `pipelines/adr-triggers.md` |
| 6 | Documentation | `pipelines/docs.md` |
| 7 | Site rebuild | `pipelines/site.md` |
| 8 | Commit | `pipelines/commit.md` |

Pipelines planifiés (non bloquants jusqu'à activation) :
`style-dictionary.md` · `storybook.md` · `chromatic.md` · `axe-core.md` · `playwright.md`

---

## Violations de cette règle

Commiter sans quality gate approuvé est une violation grave du contrat de gouvernance.
Le dernier mot est toujours humain — ce pipeline en est la garantie opérationnelle.
