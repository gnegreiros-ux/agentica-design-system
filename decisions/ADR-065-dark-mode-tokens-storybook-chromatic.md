# ADR-065 — Dark mode dual-mode : `semantic.dark.json` + Style Dictionary + Storybook/Chromatic

**Date :** 2026-06-29
**Statut :** Actif
**Auteur :** Guilherme Negreiros
**Relations :** ADR-003 (Style Dictionary), ADR-006 (Chromatic), ADR-009 (Storybook), ADR-058 (thème sombre), ADR-064 (light mode V2)

---

## Contexte

Chromatic signalait 10 violations d'accessibilité « Color contrast — Serious » sur la story
`Feature Card : Grid` (contraste 1.12). Diagnostic :

- `dist/tokens/css/all.css` ne contenait qu'un seul mode — `--agtc-semantic-color-text-primary`
  résolvait toujours à `#202020` (gris sombre, mode clair), quelle que soit la préférence du navigateur.
- Storybook chargeait `all.css` sans aucun override dark mode → les composants sur fond sombre
  affichaient du texte sombre (contraste insuffisant).
- `agtc-feature-card` avait un fond **toujours sombre** (`rgba(12,15,25,.78)` — glassmorphism dark-only)
  mais utilisait `text.primary` au lieu de `text.on-dark`.

Cause structurelle : Style Dictionary ne générait qu'un seul fichier CSS (`:root { ... }`) sans
pendant `[data-theme="dark"]`. Le dark mode était géré exclusivement dans `site/build.js`
(Site Dictionary) — invisible de Storybook et Chromatic.

Recherche de référence conduite sur les sources : dbanks.design, Primer/GitHub, styledictionary.com,
Chromatic docs, EightShapes/Nathan Curtis.

---

## Décision

### 1. Fichier delta : `tokens/semantic.dark.json`

Nouveau fichier contenant **uniquement les 38 tokens sémantiques dont la valeur change** entre
le mode clair et le mode sombre. Pattern « deux fichiers, un seul build CSS » — recommandé par
Primer (GitHub) et documenté sur dbanks.design.

Structure miroir de `semantic.json`, DTCG-conforme, déltas seulement :

```
tokens/
  semantic.json        ← valeurs light (source de référence)
  semantic.dark.json   ← overrides dark (38 tokens delta)
```

Aucune valeur dupliquée : si un token n'apparaît pas dans `semantic.dark.json`, il garde
sa valeur light dans les deux modes.

### 2. Second run Style Dictionary → `dist/tokens/css/dark.css`

`style-dictionary/build.cjs` enregistre un format `css/dark-mode` et exécute un second
`StyleDictionary.extend()` :

```js
// Format — wrapper [data-theme="dark"]
StyleDictionary.registerFormat({
  name: 'css/dark-mode',
  formatter: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .filter(t => !isReadme(t))
      .map(t => `  --${t.name}: ${t.value};`)
      .join('\n');
    return `[data-theme="dark"] {\n${vars}\n  color-scheme: dark;\n}\n`;
  },
});

// Second run — source: semantic.dark.json uniquement
const sdDark = StyleDictionary.extend({
  source: ['tokens/semantic.dark.json'],
  platforms: {
    'css-dark': {
      transformGroup: 'css/agtc',
      prefix: 'agtc',
      buildPath: 'dist/tokens/css/',
      files: [{ destination: 'dark.css', format: 'css/dark-mode' }],
    },
  },
});
sdDark.buildAllPlatforms();
```

`npm run tokens` produit maintenant 5 fichiers CSS :
`primitives.css` · `semantic.css` · `components.css` · `all.css` · **`dark.css`**

### 3. Storybook — `@storybook/addon-themes` + import `dark.css`

`.storybook/preview.js` :
- Importe `../dist/tokens/css/dark.css` après `all.css`
- Décore toutes les stories avec `withThemeByDataAttribute` :
  - `defaultTheme: 'dark'` (cohérent avec le site)
  - `attributeName: 'data-theme'`
  - Themes disponibles : `light` / `dark`

`.storybook/main.js` : `@storybook/addon-themes` ajouté aux addons.

### 4. Chromatic Story Modes — deux snapshots par story

`.storybook/modes.js` définit `allModes` (light et dark).
`parameters.chromatic.modes: allModes` en global dans `preview.js` → Chromatic capture
**deux snapshots indépendants par story**, avec des baselines séparées.

```js
// .storybook/modes.js
export const allModes = {
  light: { theme: 'light', backgrounds: { value: '#fcfcfc' } },
  dark:  { theme: 'dark',  backgrounds: { value: '#0a0c11' } },
};
```

### 5. Correction token `agtc-feature-card`

`text.primary` → `text.on-dark` pour `.heading` et `text.on-dark-secondary` pour `.body`.
La carte est un composant glassmorphism à fond toujours sombre — le token `text.primary`
(valeur unique, pas de mode) donnait du texte sombre sur fond sombre (contraste 1.12).

### 6. Convention `on-dark` (amende ADR-046)

Les tokens `text.on-inverse*` et `border.on-inverse` sont renommés `text.on-dark*` et
`border.on-dark`. Convention EightShapes : `on-dark`/`on-light` est la formulation la plus
directe pour les équipes produit. `on-inverse` (Material Design 3) est ambigu sur la direction
de l'inversion.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|---|---|
| Garder un seul fichier CSS + media query `prefers-color-scheme` | Incompatible avec le toggle `data-theme` existant (ADR-058) ; ne répond pas à la préférence utilisateur explicite |
| Overrides dark dans `semantic.json` via une clé `$dark` custom | Hors standard DTCG ; nécessite un parser custom non maintenable |
| Un seul `StyleDictionary.extend()` avec merge conditionnel | Complexité injustifiée ; le pattern deux fichiers est la référence sectorielle |
| Decorator Storybook manuel sans `@storybook/addon-themes` | Perd le toggle visuel dans l'UI Storybook, pas utilisable par les équipes produit |
| Chromatic : pas de modes configurés | Testera uniquement le mode par défaut (dark) → regressions light non détectées |

---

## Conséquences

### Pour les équipes produit

- Toggle `light` / `dark` visible dans la toolbar Storybook → les designers et développeurs
  voient les composants dans les deux thèmes sans configuration manuelle.
- Chromatic capture désormais **deux baselines** par story — les régressions light et dark
  sont détectées indépendamment.

### Pour les agents

- `dist/tokens/css/dark.css` est la **source de vérité** des overrides dark — ne jamais
  modifier ces valeurs directement dans `site/build.js` : modifier `tokens/semantic.dark.json`
  puis relancer `npm run tokens`.
- Tout nouveau token qui **change de valeur entre light et dark** doit être ajouté dans
  `tokens/semantic.dark.json` avec sa valeur dark.
- Les composants à fond sombre fixe (glassmorphism) doivent utiliser `text.on-dark` et non
  `text.primary` pour le texte.

### Pour les consommateurs du design system

- Charger `all.css` + `dark.css` pour bénéficier du dual-mode.
- Appliquer `data-theme="dark"` sur `<html>` pour activer le mode sombre.

### Fichiers impactés

| Fichier | Changement |
|---|---|
| `tokens/semantic.dark.json` | Créé — 38 tokens delta dark |
| `dist/tokens/css/dark.css` | Généré — `[data-theme="dark"] { ... }` |
| `style-dictionary/build.cjs` | Format `css/dark-mode` + second run `sdDark` |
| `.storybook/preview.js` | Import `dark.css` + `withThemeByDataAttribute` + modes Chromatic |
| `.storybook/main.js` | Ajout `@storybook/addon-themes` |
| `.storybook/modes.js` | Créé — `allModes` light/dark |
| `tokens/semantic.json` | Renommage `on-inverse` → `on-dark` (tous les tokens) |
| `components/agtc-feature-card.js` | `text.primary` → `text.on-dark` (contraste 1.12 → ✅) |

---

## Résultat vérifié

| Token | Light | Dark |
|---|---|---|
| `--agtc-semantic-color-text-primary` | `#202020` ✅ | `#edeef0` ✅ |
| `--agtc-semantic-color-background-page` | `#fcfcfc` ✅ | `#0a0c11` ✅ |
| `--agtc-semantic-color-action-primary` | `#007a68` ✅ | `#34d3bb` ✅ |
| `agtc-feature-card` violations Storybook | 10 ❌ (contraste 1.12) | **0 ✅** |
