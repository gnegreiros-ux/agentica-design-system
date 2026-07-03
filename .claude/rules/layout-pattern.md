# Rule : layout-pattern

> Un seul pattern de layout pour toutes les pages du site. Non négociable.
> **Type:** rule
> **Chemin logique:** .claude/rules/layout-pattern.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/code-style.md, .claude/rules/development.md, site/build.js (function layout)

---

## Règle absolue

> **Toutes les pages du site utilisent la fonction `layout()` de `site/build.js`.**
> Il n'existe qu'un seul pattern de layout avec sidebar. Aucun autre conteneur grid ou flex
> ne doit être inventé pour positionner une sidebar.

---

## Architecture — unique source de vérité

```
layout()
  ├── <div class="layout">          ← flex, pour toutes les pages avec sidebar
  │     ├── <aside class="sidebar"> ← landmark navigation, HORS de <main>
  │     └── <main class="…">        ← contenu principal
  │
  └── <div class="home-layout">     ← UNIQUEMENT pour index.html (pas de sidebar)
```

### Classes `<main>` selon le type de page

| Type de page | Paramètre `layout()` | `class` de `<main>` | CSS |
|---|---|---|---|
| Documentation (fondations, composants, tokens…) | `fullWidth:false, sidebar:X` | `content` | `padding:52px 64px; max-width:960px` |
| Marketing avec sidebar (pourquoi, ia, documentation…) | `fullWidth:true, sidebar:X` | `page-content` | sections full-width avec `.shell` |
| Home (index.html, sans sidebar) | `fullWidth:true, sidebar:null` | `''` | `home-layout` |

---

## Règles absolues

```
✅ Passer sidebar comme paramètre à layout() — jamais dans le body HTML
✅ Les fonctions sidebar* (sidebarFoundations, sidebarComponents, v2Sidebar…)
   retournent UNIQUEMENT le contenu interne (div.sidebar-group + liens)
   — jamais un <aside> ou un wrapper externe
✅ layout() est la SEULE fonction qui émet le <aside class="sidebar">
✅ <aside class="sidebar"> est TOUJOURS en dehors de <main> (WCAG landmarks)

❌ Ne jamais créer un conteneur .with-sidebar, .sidebar-layout ou équivalent dans le body
❌ Ne jamais imbriquer <aside> dans <main>
❌ Ne jamais écrire de règles CSS .nouvelle-classe .sidebar — utiliser les règles génériques
❌ Ne jamais créer un nouveau layout sans modifier layout() elle-même
```

---

## Pourquoi `<aside>` hors de `<main>` (WCAG 1.3.6 + 4.1.2)

Les régions de landmarks ARIA doivent être sémantiquement distinctes :
- `<main>` = contenu principal de la page (landmark `main`)
- `<aside>` = navigation complémentaire (landmark `navigation` ou `complementary`)

Mettre `<aside class="sidebar">` DANS `<main>` casse la hiérarchie de landmarks
et nuit à la navigation au clavier et aux lecteurs d'écran.

---

## Sidebar interne — format de retour des fonctions

```js
// ✅ CORRECT — retourne uniquement le contenu interne
function sidebarFoundations(base, current) {
  return `<div class="sidebar-group">
    <span class="sidebar-label">Fondations</span>
    <a href="..." class="active" aria-current="page">Vue d'ensemble</a>
    ...
  </div>`;
}

// ❌ INTERDIT — encapsule dans <aside> (layout() le ferait en double)
function sidebarFoundations(base, current) {
  return `<aside class="sidebar">
    <div class="sidebar-group">...</div>
  </aside>`;
}
```

---

## Ajouter une nouvelle page avec sidebar

```js
// Étape 1 : créer ou réutiliser une fonction sidebar* qui retourne div.sidebar-group
// Étape 2 : passer sidebar au paramètre de layout()
write(path.join(DIST, 'ma-page.html'), layout({
  title: 'Ma page',
  depth: 0,
  fullWidth: false,          // true si page marketing avec sections shell
  context: '',               // 'marketing' si page data-context="marketing"
  sidebar: maSidebarFn(),    // contenu interne seulement
  body: `<h1>...</h1>...`,  // contenu de <main> uniquement
}));
```

---

## Règles pour les agents

```
✅ Utiliser layout() pour toutes les nouvelles pages
✅ Vérifier que la fonction sidebar retourne div.sidebar-group (pas <aside>)
✅ Tester avec grep que le HTML généré ne contient qu'un seul <aside class="sidebar">
❌ Créer un conteneur intermédiaire pour positionner la sidebar
❌ Dupliquer le CSS de layout dans un bloc .ma-nouvelle-classe .sidebar
❌ Modifier la structure de layout() sans mettre à jour cette règle et les tests Playwright
```
