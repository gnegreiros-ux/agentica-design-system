# ADR-019 — Résolution dynamique des tokens dans le build

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-019-resolution-dynamique-tokens-build.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, site/build.js, decisions/ADR-018-migration-references-primitives-radix.md

> **English summary:** ADR-018 left two technical debts: `site/build.js` hardcoded all semantic token values in a static 37-line object, and non-color semantic references pointed to primitives that didn't exist. This decision adds five new primitive categories (space, fontSize, fontWeight, lineHeight, radius) and replaces the hardcoded object with a dynamic resolver, with zero visual change to the output.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

ADR-018 avait documenté deux dettes techniques restantes :

1. `site/build.js` hardcodait toutes les valeurs sémantiques dans un objet `SEM` statique
2. Les tokens non-couleur de `semantic.json` (`{space.4}`, `{fontSize.md}`, etc.)
   référençaient des primitives inexistantes dans `primitives.json`

Ces deux dettes s'adressaient ensemble : l'une rendait l'autre inévitable.

### La dette dans `build.js`

```js
// Avant — 37 lignes hardcodées, source de dérive possible
const SEM = {
  'color-action-primary': '#0d74ce',
  'space-control-padding-x': '16px',
  // ...
};
```

Si une valeur changeait dans `primitives.json` ou `semantic.json`, elle ne se
propageait pas automatiquement dans le CSS généré — un humain devait mettre à jour
`build.js` manuellement.

### Les références non-couleur non résolues

`semantic.json` utilisait `{space.4}`, `{radius.sm}`, `{fontSize.md}`, etc.
Aucune de ces références n'existait dans `primitives.json` (qui ne contenait que
des couleurs). `build.js` contournait silencieusement ce problème avec les valeurs
hardcodées.

---

## Décision

### 1. Ajout des primitives non-couleur dans `primitives.json`

Cinq nouvelles catégories ajoutées sous `primitive` (au même niveau que `color`) :

| Catégorie | Steps | Valeurs |
|-----------|-------|---------|
| `space` | 2, 4, 5, 8 | 8px, 16px, 20px, 32px |
| `fontSize` | sm, md, xl | 14px, 16px, 24px |
| `fontWeight` | regular, medium, bold | 400, 500, 700 |
| `lineHeight` | tight, normal | 1.25, 1.5 |
| `radius` | sm, md | 6px, 10px |

### 2. Mise à jour des références dans `semantic.json`

Toutes les références non-couleur migrent vers `{primitive.X.Y}` :

```json
"padding-x": { "value": "{primitive.space.4}" }
"control":   { "value": "{primitive.radius.sm}" }
"size":      { "value": "{primitive.fontSize.md}" }
```

L'ensemble des 35 tokens sémantiques (19 couleurs + 16 non-couleur) référencent
maintenant des chemins résolvables dans `primitives.json`.

### 3. Résolveur dynamique dans `build.js`

L'objet `SEM` hardcodé (37 lignes) est remplacé par trois fonctions :

```js
// Parcourt l'arbre de tokens par chemin pointé
function resolveRef(ref, data) {
  return ref.split('.').reduce((node, key) => node?.[key], data);
}

// Résout une valeur {primitive.X.Y} → valeur CSS finale
function resolveValue(val, data) { ... }

// Aplatit les tokens imbriqués en clés CSS 'category-sub-name'
function flattenTokens(obj, data, prefix = '') { ... }

const SEM = flattenTokens(semanticData.semantic, primitives);
```

La résolution est faite au moment du build — toute modification dans `primitives.json`
ou `semantic.json` se propage automatiquement dans `site/dist/tokens.css`.

### 4. Correction de `extractColorScales`

Ajout d'un guard `if (step === '_readme') continue` dans la boucle interne,
pour protéger contre les entrées de documentation dans les scales de couleur.

---

## Invariant de sortie — zéro changement visuel

Les 35 valeurs résolues après migration sont **strictement identiques** à celles
de l'objet `SEM` hardcodé qu'elles remplacent. Vérifiable par diff :

```
--agtc-semantic-color-action-primary: #0d74ce    ← inchangé
--agtc-semantic-space-control-padding-x: 16px    ← inchangé
--agtc-semantic-typography-body-line-height: 1.5 ← inchangé
```

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Utiliser Style Dictionary** | Dépendance externe pour un build qui n'en a pas. Style Dictionary ajoute une configuration non triviale et une abstraction pour un résolveur qui s'écrit en ~20 lignes. Choix cohérent avec la philosophie du projet : pas de dépendance sans justification. |
| **Garder le SEM hardcodé + ajouter des primitives** | Résout la dette dans `semantic.json` mais laisse `build.js` désynchronisé. Un changement de token nécessiterait toujours deux modifications manuelles. |
| **Résolveur récursif multi-niveaux (tokens référençant des tokens)** | Non nécessaire : dans ce système, les tokens sémantiques référencent uniquement des primitives, jamais d'autres sémantiques. Le résolveur single-level est suffisant et plus simple à auditer. |

---

## Conséquences

**Pour le pipeline de build :**
- Toute modification dans `tokens/primitives.json` ou `tokens/semantic.json`
  se propage automatiquement dans `site/dist/tokens.css` au prochain build
- Plus de désynchronisation silencieuse possible entre tokens et CSS généré

**Pour les agents IA :**
- La chaîne de résolution complète est maintenant traçable :
  `semantic.json` → `{primitive.X.Y}` → `primitives.json` → valeur CSS
- Aucune valeur "magique" ne subsiste dans `build.js`

**Dette technique soldée :**
- Toutes les références dans `semantic.json` se résolvent désormais
- `build.js` ne contient plus de valeurs hardcodées pour les tokens
- Les deux dettes documentées dans ADR-018 sont closes
