# Composant : Top-nav — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-15
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/top-nav.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-060-agtc-top-nav-implementation.md, guidelines/components/tabs.md, .claude/rules/no-visited-nav.md

---

## INTENTION

**Pourquoi ce composant existe :**
Fournir la navigation principale horizontale du produit sous forme de liens inter-pages.
Visuellement inspiré du pattern tabs (indicateur border-bottom pleine hauteur), mais sémantiquement
correct : `<nav>` + `<a>` + `aria-current="page"`, pas `role="tablist"`.

**Ce composant n'est pas :**
- `agtc-tabs` — qui affiche des panneaux de contenu in-page avec `role="tablist"`
- `agtc-segmented` — réglage à effet immédiat (langue, densité)
- Un menu déroulant (dropdown)

---

## DISTINCTION AVEC `agtc-tabs`

| | `agtc-top-nav` | `agtc-tabs` |
|---|----------------|-------------|
| Sémantique ARIA | `role=navigation` + `<a>` | `role=tablist` + `role=tab` + `role=tabpanel` |
| Navigation clavier | Tab + Enter (liens standard) | Flèches ←/→ + Home/End (roving tabindex) |
| État actif | `aria-current="page"` | `aria-selected="true"` |
| Effet | Navigation inter-pages | Panneau de contenu in-page |
| CTA | Oui (bouton Démarrer intégré) | Non |

---

## PROPRIÉTÉS

| Propriété / Attribut | Type | Défaut | Description |
|----------------------|------|--------|-------------|
| `items` | Array | `[]` | `[{ label?, labelFr?, labelEn?, href, cta? }]` — liste des liens |
| `current` | String | `window.location.pathname` | Pathname pour détection du lien actif |
| `nav-label` | String | `"Navigation principale"` | `aria-label` de l'élément `<nav>` (**requis** pour les AT) |

### Structure d'un item

```javascript
{
  labelFr: 'Tokens',        // texte français (affiché quand data-lang="fr")
  labelEn: 'Tokens',        // texte anglais (affiché quand data-lang="en")
  label:   'Tokens',        // fallback langue neutre (si labelFr/labelEn absents)
  href:    '../tokens/',    // URL de destination
  cta:     false,           // true → bouton CTA d'adoption (Démarrer)
}
```

### Bilinguisme

Le composant observe `document.documentElement[data-lang]` via `MutationObserver`
et re-render automatiquement quand la langue change. Il n'est pas nécessaire de
re-assigner `.items` lors d'un changement de langue.

### Mobile — état ouvert

Ajouter la classe CSS `.open` sur l'hôte `<agtc-top-nav>` pour ouvrir le drawer mobile.
Le composant gère son propre CSS responsive via `@media (max-width: 768px)` en shadow DOM.

```javascript
document.querySelector('agtc-top-nav').classList.toggle('open');
```

---

## USAGE

```html
<agtc-top-nav nav-label="Navigation principale"></agtc-top-nav>
<script>
  const nav = document.querySelector('agtc-top-nav');
  nav.items = [
    { label: 'Tokens',      href: '../tokens/' },
    { label: 'Composants',  href: '../components/' },
    { label: 'Fondations',  href: '../foundations/' },
    { label: 'Agents',      href: '../agents/' },
    { label: 'Décisions',   href: '../decisions/' },
    { label: 'Démarrer',    href: '../get-started.html', cta: true },
  ];
  nav.current = window.location.pathname;
</script>
```

---

## VARIANTS

| Variant | Description |
|---------|-------------|
| Tab link (défaut) | Lien de navigation pleine hauteur, indicateur border-bottom au hover actif |
| CTA (`cta: true`) | Bouton d'adoption visuellement distinct — arrondi, fond action-primary, séparé des tabs |

---

## TOKENS

### Tokens de composant (source de vérité)

| Token CSS | Valeur résolue | Usage |
|-----------|----------------|-------|
| `--agtc-component-top-nav-tab-color` | `semantic.color.text.secondary` | Lien au repos |
| `--agtc-component-top-nav-tab-color-hover` | `semantic.color.text.primary` | Lien au survol |
| `--agtc-component-top-nav-tab-background-hover` | `semantic.color.background.subtle` | Fond au survol |
| `--agtc-component-top-nav-tab-color-active` | `semantic.color.action.primary` | Lien de la page active |
| `--agtc-component-top-nav-tab-indicator-color` | `semantic.color.action.primary` | Couleur de l'indicateur |
| `--agtc-component-top-nav-tab-indicator-width` | `2px` | Épaisseur de l'indicateur |
| `--agtc-component-top-nav-tab-padding-x` | `14px` | Espacement horizontal des tabs |
| `--agtc-component-top-nav-tab-font-size` | `semantic.typography.label.size` | Taille de texte |
| `--agtc-component-top-nav-tab-font-weight` | `semantic.typography.label.weight` | Graisse par défaut |
| `--agtc-component-top-nav-tab-font-weight-active` | `semantic.fontWeight.bold` | Graisse page active |
| `--agtc-component-top-nav-tab-focus-ring` | `semantic.color.border.focus` | Ring de focus clavier |
| `--agtc-component-top-nav-cta-gap` | `8px` | Séparation tabs → CTA |
| `--agtc-component-top-nav-cta-background` | `semantic.color.action.primary` | Fond CTA |
| `--agtc-component-top-nav-cta-background-hover` | `semantic.color.action.primary-hover` | Fond CTA hover |
| `--agtc-component-top-nav-cta-color` | `semantic.color.text.on-action` | Texte CTA |
| `--agtc-component-top-nav-cta-padding-x` | `semantic.space.control.padding-x` | Espacement horizontal CTA |
| `--agtc-component-top-nav-cta-padding-y` | `semantic.space.control.padding-y` | Espacement vertical CTA |
| `--agtc-component-top-nav-cta-radius` | `semantic.radius.control` | Arrondi CTA |

---

## ÉTATS

| État | Sélecteur CSS | Comportement |
|------|---------------|--------------|
| Repos | `a` | Texte `text-secondary`, pas de fond |
| Survol | `a:hover` | Fond `background-subtle`, texte `text-primary` — plat, pas de border-radius |
| Clic | `a:active` | Identique hover — pas d'effet de pression (lien, pas bouton) |
| Focus clavier | `a:focus-visible` | `outline:2px solid border-focus; outline-offset:2px` |
| Page active | `a[aria-current="page"]` | Texte `action-primary`, bold, `border-bottom-color:action-primary` |
| Visité | `a:visited` | Identique repos — navigation ne montre pas l'état lu (ADR-047) |

---

## ACCESSIBILITÉ

- `<nav aria-label="...">` — landmark obligatoire, nommé via `nav-label`
- `aria-current="page"` — appliqué automatiquement sur le lien actif
- `:focus-visible` — ring visible sur tous les liens (WCAG 2.4.7)
- Navigation clavier : **Tab** pour traverser les liens, **Enter** pour activer
- `:visited` neutralisé — cohérence visuelle (ADR-047, ADR-059 pour Safari)
- Cibles tactiles ≥ 44px (hauteur du header = 64px) — WCAG 2.5.5

---

## PATTERNS UX DE RÉFÉRENCE

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Navigation landmark `<nav aria-label>` | [W3C WAI Landmarks](https://www.w3.org/WAI/ARIA/apg/) | ✅ | Invisible aux AT sans landmark |
| `aria-current="page"` sur le lien actif | [WCAG 2.4.4 / 4.1.2](https://www.w3.org/WAI/WCAG22/) | ✅ | Classe CSS seule insuffisante |
| Indicateur border-bottom pleine hauteur | [NN/g — Horizontal Navigation](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Fond rempli = bouton togglé |
| Pas de `role="tablist"` pour nav inter-pages | [W3C APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Sémantique incorrecte sans panneau |
| CTA visuellement distinct (bouton pill) | [IxDF — Clear primary action](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | L'adoption est une action, pas une destination |
| `:visited` neutralisé | ADR-047 | ✅ | Navigation ≠ contenu lu/non lu |
| Mobile hamburger + `aria-expanded` | [NN/g — Mobile nav](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Pas de défilement horizontal |

---

## RÈGLES POUR LES AGENTS

```
✅ Toujours fournir nav-label — l'aria-label est obligatoire pour les AT
✅ Utiliser aria-current="page" (géré automatiquement par le composant)
✅ Marquer le bouton d'adoption avec cta:true — jamais comme un tab standard
✅ Gérer la langue (labelFr/labelEn) côté consommateur, pas dans le composant
❌ Ne pas utiliser role="tablist" sur cet élément — c'est de la navigation inter-pages
❌ Ne pas ajouter de border-radius sur les liens-tabs
❌ Ne pas mettre de fond rempli persistant sur le lien actif
```
