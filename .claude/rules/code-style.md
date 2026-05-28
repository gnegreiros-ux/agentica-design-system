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

## Nommage des CSS Custom Properties

Format : `--[prefix]-[niveau]-[composant]-[variant]-[propriété]`

```css
/* Primitif */
--ds-primitive-color-blue-700: #1D4ED8;

/* Sémantique */
--ds-semantic-color-action-primary: var(--ds-primitive-color-blue-700);

/* Composant */
--ds-component-button-primary-background: var(--ds-semantic-color-action-primary);
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
