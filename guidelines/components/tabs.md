# Composant : Tabs — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-12
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/tabs.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-056-agtc-tabs-implementation.md, guidelines/components/segmented.md, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Afficher plusieurs sections de contenu dans un même espace, accessibles par onglets horizontaux.
Chaque onglet est associé à un panneau de contenu — l'utilisateur choisit quelle section lire.

**Ce composant n'est pas :**
- Un réglage à effet immédiat (`agtc-segmented`) — pas de panneau, 2-5 options courtes
- Un groupe radio de formulaire (`agtc-radio-group`)
- Un menu déroulant

---

## DISTINCTION AVEC `agtc-segmented`

| | `agtc-tabs` | `agtc-segmented` |
|---|-------------|------------------|
| Effet | Affiche un **panneau de contenu** | **Réglage immédiat** (langue, densité…) |
| ARIA | `role="tablist"` + `tabpanel` | `role="group"` + `aria-current` |
| Clavier | **Flèches** + roving tabindex | **Tab** natif entre segments |
| Usage | Navigation doc-chrome, sections | Bascule langue, vue liste/grille |

---

## PROPRIÉTÉS

| Attribut / Propriété | Type | Défaut | Description |
|----------------------|------|--------|-------------|
| `.tabs` | Array | `[]` | `[{ value, label, href? }]` — liste des onglets |
| `selected` | String | Premier sans href | Valeur de l'onglet actif |
| `label` | String | — | **aria-label du tablist (requis pour les AT)** |
| `activation` | String | `"auto"` | `"auto"` (flèches activent) ou `"manual"` (Enter requis) |

Émet **`change`** (`detail: { value }`) sur changement d'onglet in-page.

**Slots :** un slot nommé par valeur d'onglet in-page (sans `href`).

```html
<agtc-tabs label="Documentation Button" selected="overview">
  <div slot="overview">Contenu Aperçu</div>
  <div slot="tokens">Contenu Tokens</div>
</agtc-tabs>
<script>
  document.querySelector('agtc-tabs').tabs = [
    { value: 'overview', label: 'Aperçu' },
    { value: 'tokens',   label: 'Tokens' },
  ];
</script>
```

**Tab avec lien externe (`href`) :**
```js
{ value: 'storybook', label: 'Storybook ↗', href: 'https://…' }
```
→ Rendu comme `<a role="tab">`, pas de slot associé.

---

## ÉTATS

| État | Comportement |
|------|-------------|
| Default | Onglet inactif — `color.text.secondary` |
| Hover | `color.text.primary` |
| Active (sélectionné) | `color.action.primary` · indicateur bas 2px · `font-weight: 700` |
| Focus | Anneau `border.focus` 2px offset |
| Visited | Identique à Default — ADR-047 (no-visited-nav) |

---

## CLAVIER

| Touche | Effet |
|--------|-------|
| `ArrowRight` | Focus onglet suivant (circulaire). Activation si `activation="auto"` |
| `ArrowLeft` | Focus onglet précédent (circulaire). Activation si `activation="auto"` |
| `Home` | Focus premier onglet |
| `End` | Focus dernier onglet |
| `Enter` / `Space` | Active l'onglet focusé (toujours) |
| `Tab` | Sort du groupe d'onglets vers le panneau actif |

---

## ACCESSIBILITÉ

- `role="tablist"` + `aria-label` sur le conteneur
- `role="tab"` + `aria-selected` + `aria-controls` sur chaque onglet
- `role="tabpanel"` + `aria-labelledby` sur chaque panneau
- Roving tabindex : onglet actif `tabindex="0"`, les autres `tabindex="-1"`
- `:focus-visible` tokenisé (`border-focus`)
- `:visited` neutralisé (ADR-047)
- Contraste texte actif (teal sur blanc) : 5.14:1 ✅ WCAG AA

---

## RÈGLES ABSOLUES

```
✅ Toujours un label sur le tablist (attribut label="…")
✅ Minimum 2 onglets — un seul onglet = pas de tabs
✅ Labels en casse naturelle (jamais ALL-CAPS)
✅ Le tablist est positionné AU-DESSUS du panneau
✅ :visited neutralisé (règle no-visited-nav ADR-047)
❌ Jamais de tabs pour un réglage à effet immédiat sans panneau (→ agtc-segmented)
❌ Jamais de valeur codée en dur (toujours via token)
```

---

## TOKENS DE COMPOSANT

| Token CSS | Référence sémantique |
|-----------|---------------------|
| `--agtc-component-tabs-default-tab-text` | `semantic.color.text.secondary` |
| `--agtc-component-tabs-default-tab-text-hover` | `semantic.color.text.primary` |
| `--agtc-component-tabs-default-tab-text-active` | `semantic.color.action.primary` |
| `--agtc-component-tabs-default-indicator` | `semantic.color.action.primary` |
| `--agtc-component-tabs-default-border` | `semantic.color.border.default` |
| `--agtc-component-tabs-default-border-focus` | `semantic.color.border.focus` |
| `--agtc-component-tabs-default-padding-x` | `semantic.space.control.padding-x` |
| `--agtc-component-tabs-default-padding-y` | `semantic.space.control.padding-y` |

---

## Patterns UX de référence

| Pattern | Source (lien) | Appliqué | Justification |
|---------|---------------|----------|---------------|
| Tablist au-dessus du panel | [NN/g — Tabs Used Right](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Découvrabilité maximale du contenu |
| In-page tabs (changement instantané) | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Maintient l'utilisateur en place |
| Activation automatique au focus | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Contenu préchargé — APG recommande auto |
| ARIA tablist/tab/tabpanel | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Pattern d'accessibilité standard |
| Flèches + Home/End + roving tabindex | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Navigation clavier conforme |
| Labels en casse naturelle | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Lisibilité — jamais ALL-CAPS |
| `:visited` neutralisé | [ADR-047](decisions/ADR-047-no-visited-nav.md) | ✅ | Règle système — navigation |
| `href` optionnel (navigation tabs) | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Tabs mixtes in-page + lien externe |
