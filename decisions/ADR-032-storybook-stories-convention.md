# ADR-032 — Convention des stories Storybook pour les composants Agentica

> **Date :** 2026-05-30
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-032-storybook-stories-convention.md
> **Lecture avant:** AGENTS.md, DESIGN.md, decisions/ADR-009-storybook.md, decisions/ADR-006-chromatic-tests-visuels.md
> **Relations:** decisions/ADR-009-storybook.md, decisions/ADR-006-chromatic-tests-visuels.md, decisions/ADR-031-agtc-button-implementation.md, .claude/rules/development.md

---

## Contexte

ADR-009 décide d'utiliser Storybook. ADR-032 précise **comment** écrire les stories
dans ce système — la convention de structure, de nommage et de contenu obligatoire
pour chaque composant.

Sans convention explicite, deux problèmes émergent :

1. **Incohérence entre composants** — chaque développeur ou agent structure ses
   stories différemment, rendant le catalogue illisible et Chromatic imprévisible.
2. **Stories incomplètes** — les états critiques (loading, disabled, confirming)
   ne sont pas systématiquement documentés, créant des angles morts dans les
   tests de régression visuelle.

---

## Décision

### Structure obligatoire d'un fichier `.stories.js`

Chaque composant possède un fichier `[composant].stories.js` colocalisé avec
`[composant].js` dans `components/`.

```
components/
  agtc-button.js
  agtc-button.stories.js    ← colocalisé
  agtc-icon.js
  agtc-icon.stories.js
```

### Stories minimales obligatoires pour tout composant

| Story | Contenu |
|-------|---------|
| `[Variante]` (une par variante) | Composant isolé, état default |
| `Disabled` | Toutes les variantes en état `disabled` |
| `Loading` | Toutes les variantes en état `loading` (si applicable) |
| `AllVariants` | Vue d'ensemble des variantes × états — entrée Chromatic principale |

### Stories spécifiques à `agtc-button`

| Story | Raison |
|-------|--------|
| `CriticalConfirmFlow` | Documenter le flux 2-clics de la variante critical (ADR-031) |
| `WithIconPrefix` / `WithIconSuffix` | Documenter l'approche hybride icônes (property + slot) |
| `WithCustomSlot` | Documenter la composition libre via slot SVG |

### Règles de nommage

```javascript
// ✅ Story de variante isolée
export const Primary = { name: 'Primary — action principale', ... };

// ✅ Story d'état groupé
export const Disabled = { name: 'États — Disabled (toutes variantes)', ... };

// ✅ Story de comportement
export const CriticalConfirmFlow = { name: 'Critical — flux de confirmation (2 clics)', ... };

// ✅ Vue d'ensemble (toujours présente, entrée Chromatic)
export const AllVariants = { name: "Vue d'ensemble — toutes les variantes", ... };
```

### Configuration Storybook

- **Stories path** : `components/**/*.stories.@(js|jsx|mjs|ts|tsx)` (colocalisé)
- **Tokens CSS** : `dist/tokens/css/all.css` importé dans `preview.js`
- **Addon a11y** : `test: 'error'` — les violations WCAG bloquent en CI (ADR-007)
- **Addon vitest** : retiré de la config principale (pas encore activé)

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Stories dans `stories/` (dossier séparé)** | Crée une distance entre le composant et sa documentation. Un composant renommé ou supprimé laisse une story orpheline sans avertissement évident. La colocation force la synchronisation. |
| **Une story par état (fichier séparé)** | Fragmentation excessive. Chromatic capture toutes les stories d'un composant — regrouper les états dans un fichier unique réduit le bruit dans l'interface de review. |
| **Stories en TypeScript (`.stories.ts`)** | Le projet utilise JavaScript ES6+ pour les composants (ADR-002). Introduire TypeScript uniquement pour les stories crée une incohérence de stack sans bénéfice proportionnel. |

---

## Conséquences

**Pour les développeurs et agents :**
- Tout nouveau composant requiert son `.stories.js` avec les stories minimales listées ci-dessus
- C'est une condition de merge (`.claude/rules/development.md`) — une PR sans story est incomplète
- Les stories sont l'entrée de Chromatic : leur structure détermine quelles captures sont générées

**Pour Chromatic (ADR-006) :**
- `AllVariants` est la story de référence principale — son rendu est la baseline visuelle
- Chaque story isolée par variante permet de cibler précisément quelle variante a régressé

**Pour les agents IA :**
- Un agent peut vérifier la couverture des stories en comparant les variantes de `component.json`
  aux exports du fichier `.stories.js` — toute variante sans story est un angle mort
- La colocation composant/story permet à un agent de trouver la story à partir du composant
  sans connaissance préalable de la structure du projet

**Coût accepté :**
- Maintenir les stories en synchronisation avec les composants est une discipline active
- Une story qui ne reflète plus le comportement réel est pire que pas de story
  (elle donne une fausse confiance aux reviewers Chromatic)
