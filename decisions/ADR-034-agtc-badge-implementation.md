# ADR-034 — Implémentation de `agtc-badge`

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-034-agtc-badge-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-033-agtc-input-implementation.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.
> Détail et liens : `guidelines/components/badge.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Statut pas encodé uniquement par la couleur (recommandé icône/libellé pour danger/warning) | NN/g — indicators |
| `role="status"` pour annoncer les changements aux AT | NN/g |
| Mapping sémantique cohérent (traffic-light) | Dashboard — color/semantic |
| Badge non interactif — encapsuler si cliquable | NN/g |

---

## Contexte

`agtc-badge` est un label non interactif qui encode une information de statut,
de catégorie ou de compteur. Il est utilisé dans les cartes, les tableaux,
les listes et les en-têtes de composants.

Trois questions ont guidé les décisions :

1. **Combien de variantes sémantiques ?** — Les badges portent une intention
   (succès, danger, info) qui doit être lisible par les agents comme par les
   humains. Une palette de 6 couvre les cas courants sans surcharger le système.

2. **Forme pill ou rectangle ?** — Le pill (radius 9999px) est la convention
   dominante pour les badges d'état. Il différencie visuellement le badge
   des boutons et des inputs (radius 6px).

3. **Rôle ARIA ?** — Un badge statique n'a pas besoin de `role`. Un badge
   dynamique (compteur mis à jour) bénéficie de `role="status"`. On adopte
   `role="status"` par défaut pour couvrir les deux cas.

---

## Décisions

### Décision 1 — 6 variantes sémantiques, pas de variante `solid`

Les 6 variantes (`neutral`, `brand`, `success`, `warning`, `danger`, `info`)
couvrent tous les états d'une interface : état neutre, identité de marque,
retour positif, avertissement, erreur, information.

La version 1 n'inclut pas de style `solid` (fond plein + texte blanc).
Raison : le style subtil (fond clair + texte foncé) offre un meilleur contraste
WCAG dans la majorité des contextes. Le style `solid` sera ajouté si un besoin
concret émerge (éviter la conception spéculative).

### Décision 2 — Tokens badge dans `component.json` avec structure plate

Les couleurs sont encodées par variante (`badge.neutral.*`, `badge.brand.*`…)
et les dimensions par taille (`badge.md.*`, `badge.sm.*`).

Cette séparation permet de changer la couleur d'une variante sans affecter
les dimensions, et vice versa — conformément au principe des trois niveaux
(ADR-001).

### Décision 3 — Radius pill (9999px) encodé comme token composant

`9999px` est une valeur intentionnellement exagérée pour obtenir une forme pill
indépendamment de la hauteur du composant. Cette valeur est un token composant
(`badge.md.radius` et `badge.sm.radius`) — pas une valeur en dur dans le CSS.

Il n'existe pas de token sémantique `radius.pill` car le pill est une décision
spécifique au badge, pas un contrat partagé entre composants.

### Décision 4 — `role="status"` par défaut

`role="status"` permet aux lecteurs d'écran d'annoncer les changements de
contenu (ex : compteur qui passe de 3 à 4). Pour un badge purement statique,
ce rôle est inoffensif. Pour un badge dynamique, il est nécessaire.

Le contenu du slot est annoncé via le contenu textuel — pas besoin d'`aria-live`
supplémentaire car `role="status"` implique `aria-live="polite"`.

### Décision 5 — Pas d'interactivité

`agtc-badge` est un `<span>` non interactif. Si un badge doit déclencher une
action (ex : badge "×" pour supprimer un tag), utiliser `agtc-button variant="ghost"`
avec un badge custom via slot, ou créer un composant `agtc-tag` dédié.

### Décision 6 — Correction du script tokens (CJS → `.cjs`)

L'ajout de `"type": "module"` dans `package.json` (Phase 3 — Storybook) a cassé
le script Style Dictionary qui utilisait `require()` CommonJS. Résolu en
renommant `style-dictionary/build.js` → `style-dictionary/build.cjs` et en
mettant à jour les scripts `package.json`. La logique du script est inchangée.

---

## Périmètre v1

| Inclus | Exclu (version future) |
|--------|------------------------|
| 6 variantes subtil | Style `solid` (fond plein) |
| 2 tailles sm / md | Taille `lg` |
| Icône prefix | Badge "×" removable (→ `agtc-tag`) |
| Icon-only + label WCAG | Compteur animé |

---

## Tokens ajoutés dans `component.json`

| Token | Valeur résolue |
|-------|----------------|
| `--agtc-badge-neutral-background` | gray-3 (#f0f0f0) |
| `--agtc-badge-neutral-text` | gray-11 (#646464) |
| `--agtc-badge-brand-background` | teal-3 (#e0f8f3) |
| `--agtc-badge-brand-text` | teal-11 (#008573) |
| `--agtc-badge-success-background` | green-3 (#e6f6eb) |
| `--agtc-badge-success-text` | green-11 (#18794e) |
| `--agtc-badge-warning-background` | orange-3 (#ffefd6) |
| `--agtc-badge-warning-text` | orange-11 (#cc4e00) |
| `--agtc-badge-danger-background` | red-3 (feedback-danger-subtle) |
| `--agtc-badge-danger-text` | red-11 (feedback-danger) |
| `--agtc-badge-info-background` | blue-3 (#e6f4fe) |
| `--agtc-badge-info-text` | blue-11 (#0d74ce) |
| `--agtc-badge-md-radius` | 9999px |
| `--agtc-badge-sm-radius` | 9999px |
