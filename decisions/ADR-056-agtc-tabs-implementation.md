# ADR-056 — Implémentation de `agtc-tabs`

> **Date :** 2026-06-12
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation) · Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-056-agtc-tabs-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** components/agtc-tabs.js, guidelines/components/tabs.md, tokens/component.json, decisions/ADR-047-no-visited-nav.md

---

## Contexte

Phase D3 du redesign site : le doc-chrome nécessite un composant d'onglets pour structurer
les pages composant (ex. `Aperçu | Tokens | Bonnes pratiques`). Aucun `agtc-tabs` n'existait.

---

## Décisions

### 1. Type de tabs — in-page + `href` optionnel

**Décision :** in-page par défaut (changement de panneau dans le DOM), avec attribut `href`
optionnel par tab pour les liens de navigation externe.

**Pourquoi :** La majorité des usages doc-chrome sont in-page. Le `href` optionnel permet
des tabs mixtes (ex. `Aperçu | Storybook ↗`) sans créer deux composants distincts.

**Source :** NN/g — [Tabs: Used Right](https://www.nngroup.com/articles/tabs-used-right/)

---

### 2. Activation automatique au focus

**Décision :** `activation="auto"` par défaut — naviguer avec les flèches active le tab
immédiatement. `activation="manual"` disponible en opt-in (nécessite Entrée/Espace).

**Pourquoi :** L'APG recommande l'activation automatique quand le contenu est préchargé
(notre cas — tout le contenu de panel est dans le DOM). Réduit le nombre de frappes.

**Source :** W3C APG — [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

---

### 3. Tabs fermables — différé

**Décision :** Non implémenté en D3. Aucun cas d'usage identifié dans le doc-chrome.
À reconsidérer lors d'un futur éditeur multi-doc.

---

### 4. Orientation — horizontal uniquement

**Décision :** Tablist horizontal (liste en ligne). Pas d'orientation verticale en D3.

**Pourquoi :** Tous les usages actuels sont horizontaux. L'orientation verticale sera
ajoutée si un cas d'usage précis émerge.

---

### 5. Pattern ARIA — tablist / tab / tabpanel

**Décision :** Structure ARIA strictement conforme au W3C APG :
- `role="tablist"` + `aria-label` sur le conteneur
- `role="tab"` + `aria-selected` + `aria-controls` sur chaque onglet
- `role="tabpanel"` + `aria-labelledby` sur chaque panneau
- Roving tabindex : tab actif `tabindex="0"`, les autres `-1`
- Navigation clavier : `ArrowLeft/Right` (circulaire) · `Home/End` · `Tab` sort du groupe

---

### 6. Règle no-visited-nav — ADR-047

**Décision :** `:visited` neutralisé sur `.tab` (color = même que `:link`).

**Pourquoi :** Les tabs sont des éléments de navigation — la règle système ADR-047 s'applique.

---

## Tokens de composant

| Token | Valeur sémantique |
|-------|------------------|
| `tabs.default.tab-text` | `semantic.color.text.secondary` |
| `tabs.default.tab-text-hover` | `semantic.color.text.primary` |
| `tabs.default.tab-text-active` | `semantic.color.action.primary` |
| `tabs.default.indicator` | `semantic.color.action.primary` |
| `tabs.default.border` | `semantic.color.border.default` |
| `tabs.default.border-focus` | `semantic.color.border.focus` |
| `tabs.default.padding-x` | `semantic.space.control.padding-x` |
| `tabs.default.padding-y` | `semantic.space.control.padding-y` |

---

## Patterns UX de référence appliqués

| Pattern | Source | Appliqué |
|---------|--------|----------|
| Tablist au-dessus du panel | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ |
| In-page tabs (changement instantané) | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ |
| Activation automatique au focus | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ |
| Flèches + Home/End + roving tabindex | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ |
| ARIA tablist/tab/tabpanel complet | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ |
| Labels en casse naturelle (jamais ALL-CAPS) | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ |
| `:visited` neutralisé (navigation) | [ADR-047](decisions/ADR-047-no-visited-nav.md) | ✅ |
| `href` optionnel (navigation tabs) | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ |

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|----------------|
| `role="group"` + `aria-current` (comme agtc-segmented) | Les tabs changent un panneau — `tablist` est le pattern ARIA correct |
| Activation manuelle par défaut | APG recommande l'auto quand contenu préchargé |
| Tabs fermables dès D3 | Pas de cas d'usage dans le doc-chrome actuel |

---

## Conséquences

- `agtc-segmented` reste le pattern pour les réglages à effet immédiat (≤ 5 options, sans panneau).
- `agtc-tabs` est le pattern pour la navigation in-page avec panneau de contenu.
- La distinction est documentée dans les guidelines des deux composants.
