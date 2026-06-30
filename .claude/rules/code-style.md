# Rule : code-style

> Conventions de style et de nommage pour ce projet.
> **Type:** rule
> **Chemin logique:** .claude/rules/code-style.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/git-workflow.md, .claude/rules/development.md

---

## Nommage des fichiers

| Type | Convention | Exemple |
|------|-----------|---------|
| Composant Web | kebab-case | `ds-button.js`, `ds-input.js` |
| Token JSON | kebab-case | `primitives.json`, `semantic.json` |
| Documentation | kebab-case | `button.md`, `color.md` |
| Config | kebab-case | `config.json`, `style-dictionary.json` |

---

## Nommage des classes CSS — règle absolue (ADR-2026-06-30)

> **Zéro préfixe de version dans les noms de classes CSS et custom properties.**
> Cette règle s'applique au site Agentica, aux composants `agtc-*`, et à tout futur projet consommateur.

```
❌ INTERDIT : .v2-hero, .v2-section, .v2-button, --v2-shell, .ds-btn
✅ OBLIGATOIRE : .hero, .site-section, .cta-btn, --site-shell, .agtc-button
```

### Classes de composants Web

Format : `agtc-[nom]` (kebab-case, pas de version)

```html
✅ <agtc-button>, <agtc-card>, <agtc-top-nav>
❌ <ds-button>, <v2-button>, <agtc-button-v2>
```

### Classes CSS du site

Deux namespaces autorisés, aucun préfixe de version :

| Namespace | Préfixe | Usage | Exemples |
|-----------|---------|-------|---------|
| Chrome site | `site-` | Header, nav, footer — distingue du HTML element | `.site-header`, `.site-nav`, `.site-footer` |
| Contenu/sections | *(aucun)* | Sections, grilles, éléments de page | `.hero`, `.shell`, `.overlap`, `.kicker`, `.copy` |
| Boutons CTA (liens stylisés) | `cta-` | Liens `<a>` stylisés en bouton, distincts de `<agtc-button>` | `.cta-btn`, `.cta-btn-primary` |

```css
/* ✅ Noms sémantiques — décrivent le contenu ou le rôle */
.hero { … }
.shell { … }
.site-nav { … }
.overlap { … }
.kicker { … }
.cta-btn { … }

/* ❌ Noms avec version ou position */
.v2-hero { … }
.v2-section { … }
.v2-nav { … }
.v2-btn-primary { … }
```

### Custom properties du site (shorthand CSS)

Format : `--site-[rôle]`

```css
/* ✅ */
--site-shell: min(var(--agtc-content-max, 1180px), calc(100vw - 48px));
--site-teal: var(--agtc-semantic-color-action-primary);
--site-text: var(--agtc-semantic-color-text-on-dark);

/* ❌ */
--v2-shell: …
--v2-teal: …
```

### Table de migration complète (2026-06-30)

Cette table documente tous les renames effectués lors de la migration de la dette `v2-` :

| Ancien nom | Nouveau nom | Catégorie |
|-----------|------------|-----------|
| `.v2-header` | `.site-header` | Chrome |
| `.v2-nav` | `.site-nav` | Chrome |
| `.v2-footer` | `.site-footer` | Chrome |
| `.v2-docs` | `.docs-menu` | Chrome |
| `.v2-docs-panel` | `.docs-panel` | Chrome |
| `.v2-docs-trigger` | `.docs-trigger` | Chrome |
| `.v2-nav-action` | `.nav-cta` | Chrome |
| `.v2-menu-button` | `.menu-btn` | Chrome |
| `.v2-shell` | `.shell` | Structure |
| `.v2-page` | `.page` | Structure |
| `.v2-page-content` | `.page-content` | Structure |
| `.v2-sidebar` | `.sidebar` | Structure |
| `.v2-with-sidebar` | `.with-sidebar` | Structure |
| `.v2-section` | `.site-section` | Section |
| `.v2-section-heading` | `.section-heading` | Section |
| `.v2-hero` | `.hero` | Section |
| `.v2-immersive` | `.immersive` | Section |
| `.v2-overlap` | `.overlap` | Grille |
| `.v2-split` | `.split` | Grille |
| `.v2-final` | `.section-final` | Section |
| `.v2-copy` | `.copy` | Contenu |
| `.v2-kicker` | `.kicker` | Contenu |
| `.v2-button` | `.cta-btn` | CTA |
| `.v2-button-primary` | `.cta-btn-primary` | CTA |
| `.v2-button-secondary` | `.cta-btn-secondary` | CTA |
| `--v2-shell` | `--site-shell` | Custom prop |
| `--v2-text` | `--site-text` | Custom prop |
| `--v2-teal` | `--site-teal` | Custom prop |
| `@keyframes v2-float` | `@keyframes float-illus` | Animation |

*(Table complète dans le commit `refactor(css): supprime préfixe v2-` du 2026-06-30)*

---

## Nommage des CSS Custom Properties (tokens design system)

Format : `--[prefix]-[niveau]-[composant]-[variant]-[propriété]`

```css
/* Primitif */
--agtc-primitive-color-blue-700: #1D4ED8;

/* Sémantique */
--agtc-semantic-color-action-primary: var(--agtc-primitive-color-blue-700);

/* Composant */
--agtc-component-button-primary-background: var(--agtc-semantic-color-action-primary);
```

---

## Commentaires dans le code

```javascript
// ✅ Bon commentaire — explique le POURQUOI
// Le bouton critique nécessite une confirmation car l'action est irréversible (contrat token)

// ❌ Mauvais commentaire — décrit le QUOI (déjà lisible dans le code)
// Définit la couleur de fond du bouton
```

---

## JavaScript / TypeScript

- ES6+ uniquement
- Pas de `var` — utiliser `const` et `let`
- Fonctions arrow pour les callbacks
- Destructuration préférée
- Nommage des variables en camelCase
- Nommage des constantes en UPPER_SNAKE_CASE

---

## JSON (tokens)

- Indentation : 2 espaces
- Clés en camelCase pour les valeurs composées
- Toujours inclure `$type` pour chaque token
- Toujours inclure `intent` pour les tokens sémantiques
- Toujours inclure `$metadata` au niveau racine

---

## Markdown (documentation)

- Titres H1 (`#`) uniquement pour le nom du fichier/composant
- H2 (`##`) pour les sections principales
- H3 (`###`) pour les sous-sections
- Tableaux pour les comparaisons et propriétés
- Code blocks avec spécification du langage (` ```json `, ` ```css `, etc.)
- Jamais plus de 100 caractères par ligne dans les descriptions

---

## Git

Voir `.claude/rules/git-workflow.md` pour les conventions de commit et de branch.
