# decisions/

> Registre des décisions architecturales du système de design (ADRs).
> **Type:** instruction
> **Chemin logique:** decisions/README.md
> **Lecture avant:** AGENTS.md, DESIGN.md
> **Relations:** .claude/instructions/session-spec.md, tokens/semantic.json, guidelines/components/

---

## Pourquoi ce dossier existe

Un design system accumule des décisions invisibles : pourquoi ce token est nommé ainsi,
pourquoi cette variante a été rejetée, pourquoi cette règle de gouvernance est là.
Sans ce registre, les agents répètent les erreurs passées et les équipes redébattent
des décisions déjà tranchées.

> « Le système de design est devenu un dataset, pas un deliverable. »
> — The Design System Guide, 2026

---

## Format d'un ADR

```markdown
# ADR-[NNN] — [Titre court]

> **Date :** AAAA-MM-JJ
> **Statut :** [proposé | actif | remplacé par ADR-NNN | déprécié]
> **Décideurs :** [noms ou rôles]

## Contexte

[Quel problème ou besoin a déclenché cette décision ?]

## Décision

[Quelle décision a été prise, en une phrase directe.]

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| [option A]  | [pourquoi non]  |

## Conséquences

[Qu'est-ce que cette décision implique concrètement pour les agents, les développeurs, les designers ?]

## Incidents ou déclencheurs

[Si cette décision a été provoquée par un incident réel, le noter ici.]
```

---

## Index des ADRs

| ADR | Titre | Date | Statut |
|-----|-------|------|--------|
| [ADR-001](ADR-001-trois-niveaux-tokens.md) | Architecture 3 niveaux de tokens | 2026-05-28 | ✅ Actif |
| [ADR-002](ADR-002-lit-web-components.md) | Choix de Lit pour les Web Components | 2026-05-28 | ✅ Actif |
| [ADR-003](ADR-003-style-dictionary.md) | Choix de Style Dictionary pour la compilation des tokens | 2026-05-28 | ✅ Actif |
| [ADR-004](ADR-004-gouvernance-humaine.md) | Gouvernance humaine : le dernier mot est toujours humain | 2026-05-28 | ✅ Actif |
| [ADR-005](ADR-005-variante-critical-vs-danger.md) | Remplacement de la variante `danger` par `critical` | 2026-05-28 | ✅ Actif |
| [ADR-006](ADR-006-chromatic-tests-visuels.md) | Choix de Chromatic pour les tests de régression visuelle | 2026-05-28 | ✅ Actif |
| [ADR-007](ADR-007-axe-core-accessibilite.md) | Choix de axe-core pour les tests d'accessibilité | 2026-05-28 | ✅ Actif |

---

## Règles de ce registre

- Un ADR ne se supprime jamais — on le marque `remplacé` ou `déprécié`
- Un ADR est immutable une fois `actif` — toute modification = nouvel ADR
- Les agents lisent ce dossier pour comprendre les *pourquoi*, pas les *quoi*
- Tout TCR (Token Change Request) majeur doit référencer ou créer un ADR
