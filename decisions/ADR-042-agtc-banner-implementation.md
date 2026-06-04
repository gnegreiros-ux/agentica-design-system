# ADR-042 — Implémentation de `agtc-banner`

> **Date :** 2026-06-03
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-042-agtc-banner-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, decisions/ADR-034-agtc-badge-implementation.md, decisions/ADR-040-agtc-table-implementation.md, decisions/ADR-041-agtc-code-block-implementation.md, guidelines/components/banner.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-03 via le workflow `ux-pattern-review` (ADR-036). Décision : **N1–N9 tous approuvés**.
> Détail et liens : `guidelines/components/banner.md` § PATTERNS UX DE RÉFÉRENCE.

| # | Pattern | Source |
|---|---------|--------|
| N1 | Variantes sémantiques (6) | NN/g |
| N2 | Sens jamais par la couleur seule (icône + texte AT) | NN/g |
| N3 | Icône par variante | NN/g |
| N4 | Statique par défaut (pas de live region) | MDN — status role |
| N5 | `role="alert"` assertif avec parcimonie | A11Y Collective |
| N6 | Bouton fermer accessible sans piège de focus | MDN — alert role |
| N7 | Titre + corps + zone d'action | NN/g |
| N8 | Bordure d'accent gauche + fond subtil | Dashboard |
| N9 | Pas d'auto-dismiss du critique | NN/g |

---

## Contexte

Le site utilise un `contribution-banner` (16 usages) — un callout info avec bordure d'accent
gauche, icône, titre + corps, et une action (« Voir sur GitHub »). C'est un cas particulier d'un
besoin plus large : un **message inline contextuel** à plusieurs niveaux de sévérité.

`agtc-banner` généralise ce besoin. C'est le 3ᵉ composant de la gap-analysis du 2026-06-03
(catégorie B), après `agtc-table` et `agtc-code-block`.

---

## Décisions

### Décision 1 — Message inline, pas toast ni modale

`agtc-banner` reste **dans le flux** de la page. Les notifications flottantes temporaires (toast)
et les interruptions bloquantes (modale / `alertdialog`) sont des composants distincts ultérieurs.
Cette délimitation évite de surcharger un seul composant de responsabilités contradictoires.

### Décision 2 — 6 variantes alignées sur `agtc-badge`

`neutral, brand, info, success, warning, danger` — mêmes intentions sémantiques que le badge, pour
qu'un agent comme un humain raisonnent de façon cohérente sur la sévérité à travers le système.

### Décision 3 — Statique par défaut ; live region en opt-in (N4/N5)

Point central d'accessibilité : un banner **présent au chargement** ne doit pas être une live
region (sinon il s'annonce, ce qui perturbe). Le défaut est donc `live="off"` (aucun `role`).
Pour un message **inséré dynamiquement**, le consommateur choisit `live="polite"` (→ `role="status"`)
ou `live="assertive"` (→ `role="alert"`, réservé à l'urgent). La sévérité reste accessible même
sans live region grâce à un **préfixe masqué** (« Erreur : », « Attention : »…), l'icône étant décorative.

### Décision 4 — Architecture « mix » (cohérente avec ADR-040/041)

Composant `<agtc-banner>` (shadow DOM, slots `default` + `actions`) pour apps/Storybook **+** classe
`.agtc-banner` pour le HTML statique du site. Les deux consomment `component.banner.*`. Le
`contribution-banner` sera migré vers `.agtc-banner` lors du *dogfooding* (catégorie A).

### Décision 5 — Tokens par variante : `background` + `accent`

Pour limiter le nombre de tokens, chaque variante porte deux tokens (`background`, `accent`),
l'`accent` servant à la **fois** la bordure gauche et l'icône. Les textes (titre/corps) sont
partagés (`heading-text` = text.primary, `body-text` = text.secondary). Conforme au précédent
`agtc-badge` (réutilisation des intentions feedback sémantiques).

---

## Périmètre v1

| Inclus | Exclu (composant/évolution future) |
|--------|------------------------------------|
| 6 variantes, icône par variante (+ override / `no-icon`) | Toast (flottant temporaire) |
| Titre, corps, zone d'action (slots) | Modale / `alertdialog` |
| `dismissible` + événement `dismiss` | Auto-dismiss temporisé |
| `live` opt-in (off/polite/assertive) | Empilement / file de notifications |
| Bordure d'accent + fond subtil tokenisés | Variantes « solid » (fond plein) |

---

## Alternatives rejetées

- **`role="alert"` par défaut** : annoncerait tout banner statique au chargement — perturbant (N4).
- **Sévérité par la couleur seule** : inaccessible — icône + préfixe masqué obligatoires (N2).
- **Fusionner toast/modale dans ce composant** : responsabilités contradictoires (flottant vs inline vs bloquant).
- **Un token par sous-élément et par variante** : explosion de tokens — `accent` mutualisé (bordure + icône).

---

## Conséquences

- Le `contribution-banner` du site pourra migrer vers `.agtc-banner variant="brand"` au *dogfooding*.
- Toast et modale restent à concevoir (chacun son ADR).

---

## Tokens ajoutés — `component.banner.*`

| Token | Référence |
|-------|-----------|
| `neutral.background` / `neutral.accent` | `background.subtle` / `text.secondary` |
| `brand.background` / `brand.accent` | `brand.primary-subtle` / `brand.primary` |
| `info.background` / `info.accent` | `primitive.blue.3` / `feedback.info` |
| `success.background` / `success.accent` | `primitive.green.3` / `feedback.success` |
| `warning.background` / `warning.accent` | `primitive.orange.3` / `primitive.orange.11` |
| `danger.background` / `danger.accent` | `feedback.danger-subtle` / `feedback.danger` |
| `heading-text` / `body-text` | `text.primary` / `text.secondary` |
| `close-color` / `close-hover` | `text.secondary` / `text.primary` |
| `border-focus` / `radius` / `padding-x` / `padding-y` | `border.focus` / `radius.card` / `space.5` / `space.4` |
