# Agentica — starter kit

Exemple minimal et fonctionnel montrant comment consommer `@agentica-ds/tokens` et
`@agentica-ds/components` dans un projet neuf, sans rien du reste de ce dépôt. Copiez
ce dossier tel quel comme point de départ pour une nouvelle application.

## Contenu

| Fichier | Rôle |
|---|---|
| `package.json` | Dépendances réelles publiées sur npm (`@agentica-ds/*`, `lit`) |
| `index.html` | Page HTML avec quelques composants `agtc-*` |
| `main.js` | Import des tokens (CSS clair + sombre) et du barrel de composants |
| `style.css` | Mise en page de la démo, entièrement via tokens (`var(--agtc-semantic-*)`) |

## Démarrer

```bash
cd starter-kit
npm install
npm run dev
```

Ouvre `http://localhost:5173`. Le bouton en haut à droite bascule entre les thèmes
clair et sombre (`data-theme` sur `<html>`), pour vérifier que les deux jeux de
tokens sont bien chargés.

## Ce que la démo illustre

- **Tokens** : `style.css` n'utilise que des `var(--agtc-semantic-*)` — jamais de
  valeur codée en dur (couleur, espacement) — conformément à la règle du design
  system ([`tokens-system.md`](../.claude/rules/tokens-system.md)).
- **Composants** : `agtc-button`, `agtc-card`, `agtc-input`, `agtc-badge` chargés via
  le barrel `@agentica-ds/components` — aucun bundling ni build maison requis.
- **Thème sombre** : chargement de `@agentica-ds/tokens/css/dark` en plus du jeu de
  base, activé simplement en posant `data-theme="dark"` sur `<html>`.

## Aller plus loin

- Import par composant (tree-shaking) plutôt que le barrel :
  `import '@agentica-ds/components/agtc-button.js'`
- Liste complète des composants et leur contrat (variantes, états, accessibilité) :
  `guidelines/components/` dans le dépôt principal.
- Mise à jour de version et gestion des régressions visuelles :
  `guidelines/foundations/testing.md`.

## Pourquoi Vite ?

Les paquets Agentica sont publiés en ESM avec des imports « nus »
(`import '@agentica-ds/components'`). Un navigateur ne sait pas résoudre ce type de
spécificateur sans bundler ou import map. Vite est le choix le plus simple pour ça —
aucune config nécessaire, remplaçable par n'importe quel autre bundler (Webpack,
esbuild, Rollup…) côté équipe produit.
