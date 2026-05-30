# ADR-030 — Style Dictionary : build multi-plateforme avec formats custom

**Date :** 2026-05-30
**Statut :** Accepté
**Décideurs :** Guilherme Negreiros
**Scope :** Infrastructure de compilation des tokens

---

## Contexte

Les tokens Agentica sont définis en JSON (3 niveaux : primitif → sémantique → composant).
Ils doivent être compilés en artefacts consommables par plusieurs stacks :

- **CSS custom properties** — Web Components Lit, toute équipe web
- **JavaScript ES6** — outillage, scripts, tests
- **Tailwind CSS** — équipes React/Shadcn qui étendent leur config Tailwind
- **Material Angular M3** — équipes Angular qui définissent leur thème M3
- **iOS Swift** — équipes mobile Apple
- **Android XML** — équipes mobile Android

Style Dictionary (ADR-003) a été choisi comme compilateur. Ce ADR documente les
décisions techniques prises pour le faire fonctionner correctement avec notre
structure de tokens.

---

## Problèmes résolus

### 1. Inconsistance de format DTCG
Les primitifs utilisent `$value`/`$type` (format DTCG W3C), les sémantiques
utilisent `value`/`$type` (format SD v2). Style Dictionary v3 ne gère pas les
deux simultanément.

**Solution :** parseur personnalisé (`registerParser`) qui normalise `$value → value`
et `$type → type` avant que SD traite les fichiers.

### 2. Filtrage par niveau sans attribut natif
Les tokens sont filtrés par niveau (primitif / sémantique / composant) pour générer
des fichiers CSS séparés. SD v3 ne définit pas cet attribut automatiquement.

**Solution :** transform custom `attribute/level` qui lit `token.path[0]` et définit
`token.attributes.level` en conséquence.

### 3. Double préfixe dans les formats custom
Dans les formats custom (Tailwind, Angular), `token.name` inclut déjà le préfixe
défini dans la plateforme. Écrire `var(--agtc-${t.name})` produit un double préfixe.

**Solution :** utiliser `var(--${t.name})` dans les formats custom.

### 4. Tokens `_readme` dans les sorties CSS
Des clés de documentation (`_readme`) dans les fichiers JSON se retrouvaient en
CSS variables (`--agtc-semantic-space-density-readme: Densité...`).

**Solution :** prédicat `isReadme(t)` qui filtre tout token dont un segment de
chemin commence par `_`. Appliqué dans tous les filtres de fichiers.

### 5. Collisions `$schema` / `$metadata`
Les clés racines `$schema` et `$metadata` présentes dans plusieurs fichiers JSON
causaient des avertissements "Property Value Collision" à la fusion.

**Solution :** le parseur strip les clés `ROOT_META_KEYS = {$schema, $metadata, _note}`
au niveau racine uniquement (depth === 0).

---

## Décisions

### Préfixe CSS
`agtc` — remplace l'ancien préfixe `sda` (renommage de marque, voir historique git).

### Chaîne de références CSS (`outputReferences: true`)
Les fichiers `semantic.css` et `components.css` utilisent `outputReferences: true`.
Cela produit des références CSS en cascade :

```css
/* components.css */
--agtc-button-primary-background: var(--agtc-semantic-color-action-primary);

/* semantic.css */
--agtc-semantic-color-action-primary: var(--agtc-primitive-color-teal-9);

/* primitives.css */
--agtc-primitive-color-teal-9: #12a594;
```

Avantage : modifier un primitif se propage automatiquement à runtime.
Contrainte : charger les 3 fichiers ensemble, ou utiliser `all.css`.

### Mapping Tailwind
Le fichier `dist/tokens/tailwind/tokens.js` exporte uniquement les tokens sémantiques
(pas les primitifs). Les clés Tailwind sont préfixées `agtc-` pour éviter les
collisions avec le namespace Tailwind natif.

### Mapping Material Angular M3
Radix UI utilise 12 steps (1=plus clair, 12=plus foncé).
M3 utilise des stops tonaux (0-100, 100=plus clair, 0=plus foncé).
Mapping : step Radix → stop M3 : `{1:99, 2:95, 3:90, 4:80, 5:70, 6:60, 7:50, 8:40, 9:30, 10:20, 11:10, 12:0}`.

Palettes mappées aux rôles M3 :
- `teal` → `primary`
- `red` → `error`
- `gray` → `neutral`
- `accent` → `secondary`

---

## Artefacts générés

| Fichier | Destination | Usage |
|---------|-------------|-------|
| `dist/tokens/css/primitives.css` | Web | Valeurs brutes |
| `dist/tokens/css/semantic.css` | Web | Intentions UX (avec `var()` refs) |
| `dist/tokens/css/components.css` | Web | Contrats composants (avec `var()` refs) |
| `dist/tokens/css/all.css` | Web | Tout en un fichier |
| `dist/tokens/js/tokens.js` | JS/TS | Exports ES6 nommés |
| `dist/tokens/tailwind/tokens.js` | React/Shadcn | Extension `theme.extend` |
| `dist/tokens/angular/_m3-theme.scss` | Angular M3 | Palettes + alias SCSS |
| `dist/tokens/ios/AgenticaTokens.swift` | iOS | Classe Swift |
| `dist/tokens/android/tokens.colors.xml` | Android | Ressources couleurs |
| `dist/tokens/android/tokens.dimens.xml` | Android | Ressources dimensions |

---

## Commande de build

```bash
npm run tokens        # build unique
npm run tokens:watch  # rebuild automatique sur changement dans tokens/
```

---

## Avertissements attendus (non bloquants)

```
⚠️ semantic.css — filtered out token references were found
⚠️ components.css — filtered out token references were found
```

Ces avertissements sont normaux et attendus. Ils indiquent que `semantic.css` contient
des `var()` pointant vers des tokens définis dans `primitives.css`. C'est le comportement
voulu — les fichiers sont conçus pour être chargés ensemble.
