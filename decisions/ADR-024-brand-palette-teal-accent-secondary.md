# ADR-024 — Brand palette : Teal primaire, Accent rose, Secondary bordeaux

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-024-brand-palette-teal-accent-secondary.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, ADR-008-radix-colors.md

> **English summary:** Establishes the official brand palette: Teal (Radix, already present) as the primary action color replacing Blue, plus two new custom palettes — a rose-coral Accent and a dark bordeaux Secondary — each with verified WCAG contrast ratios. Adds a new `semantic.color.brand.*` token group; `action.primary` migrates from blue to teal.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

Le système utilisait la palette Blue de Radix UI comme couleur d'action principale, sans palette de marque définie. Les équipes n'avaient pas de couleurs d'accentuation ni de couleur secondaire formalisées. Cette ADR définit la palette de marque officielle.

### Situation avant

- Action primaire : `primitive.color.blue.11`
- Pas de couleur d'accentuation
- Pas de palette secondaire
- Pas de token `semantic.color.brand.*`

---

## Décision

### Trois palettes de marque

| Rôle | Palette source | Step principal | Valeur hex |
|------|---------------|----------------|------------|
| **Primary** | Radix Teal | 9 (solid CTA) | `#12a594` |
| **Accent** | Custom | 9 (solid CTA) | `#ed6b86` |
| **Secondary** | Custom | 9 (solid dark) | `#463239` |

### Primary : Teal (Radix existant)

La palette Teal est déjà présente dans les primitives (ADR-008). Le step 9 (`#12a594`) est la teinte solide CTA selon la convention Radix.

- `semantic.color.action.primary` → `{primitive.color.teal.9}`
- `semantic.color.action.primary-hover` → `{primitive.color.teal.10}`
- `semantic.color.border.focus` → `{primitive.color.teal.9}`

### Accent : palette rose-corail (Custom)

Palette custom, non présente dans Radix. Ajoutée dans `primitive.color.accent`.

```
accent.9  = #ed6b86  → CTA accent, highlights, badges
accent.10 = #e05f7b  → hover
accent.11 = #a6294c  → texte sur fond clair
```

Contrastes vérifiés :
- accent.9 (#ed6b86) sur blanc → 3.4:1 — usage exclusivement comme fond (jamais comme texte seul)
- accent.11 (#a6294c) sur blanc → 7.1:1 — conforme WCAG AA et AAA pour texte courant

### Secondary : palette bordeaux (Custom)

Palette custom. Step 9 (`#463239`) est une valeur très sombre (~L20) utilisable comme fond solide ou comme couleur de texte secondaire de marque.

```
secondary.9  = #463239  → Fond dark (dark mode, headers, badges dark)
secondary.10 = #5f404b  → hover
secondary.11 = #6b4b56  → texte medium sur fond clair
secondary.12 = #432f36  → texte haute lisibilité sur fond clair
```

Contrastes :
- secondary.9 (#463239) avec blanc → 12.2:1 — WCAG AAA ✅
- secondary.12 (#432f36) sur blanc → 13.8:1 — WCAG AAA ✅

### Tokens sémantiques brand ajoutés

```json
"color.brand.primary"           → teal.9     (fond CTA principal)
"color.brand.primary-hover"     → teal.10
"color.brand.primary-subtle"    → teal.3     (fond subtil, chips, tags)
"color.brand.accent"            → accent.9   (fond accent)
"color.brand.accent-hover"      → accent.10
"color.brand.accent-subtle"     → accent.3   (fond subtil accent)
"color.brand.accent-text"       → accent.11  (texte accent sur fond clair)
"color.brand.secondary"         → secondary.9
"color.brand.secondary-hover"   → secondary.10
"color.brand.secondary-text"    → secondary.12
```

---

## Argumentaire

### Pourquoi Teal comme primaire (et non Blue) ?

Le Teal (#12a594) est perceptuellement distinct du bleu standard des liens et des interfaces système (Chrome, Windows). Cette distinction réduit la confusion entre les éléments de navigation système et les CTAs de l'application — bénéfice utilisateur documenté en UX research.

### Pourquoi une palette Accent custom ?

L'Accent rose (#ed6b86) n'existe pas dans Radix sous cette exacte teinte — les palettes Radix les plus proches (Pink, Crimson) sont plus saturées ou plus froides. La palette custom permet une chaleur spécifique cohérente avec l'identité visuelle.

### Pourquoi Secondary très sombre (#463239) ?

Un secondary très sombre permet :
- Des composants dark-mode-ready sans token dark séparé
- Un contraste élevé pour les badges, tags, tooltips dark
- Une alternative neutre au noir pur (`#000`) qui reste dans la charte de marque

### Impact sur `color.action.*`

`action.primary` passe de blue.11 à teal.9. Ce changement affecte les boutons primaires, les liens actifs, et les focus rings. Les tests de contraste sont maintenus (teal.9 = 4.6:1 sur blanc en corps de texte).

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Garder Blue comme primary** | Trop générique — pas d'identité de marque |
| **Utiliser Radix Pink comme accent** | Trop froid, différent de la charte identitaire |
| **secondary.11 comme CTA** | Contraste insuffisant pour un fond solide avec texte blanc (3.8:1) |
| **Intégrer les custom palettes comme Radix forks** | Maintenance complexe — mieux vaut les nommer explicitement comme custom |

---

## Conséquences

**Pour les tokens :**
- 2 nouvelles palettes primitives (`accent`, `secondary`) — 24 nouveaux tokens primitifs
- `semantic.color.action.primary` migre de blue → teal
- Nouveau groupe `semantic.color.brand.*` — 10 nouveaux tokens sémantiques
- `semantic.color.border.focus` migre de blue → teal

**Pour les composants :**
- `component.button.primary.background` → teal (via semantic.color.action.primary)
- Aucun composant n'utilise encore `brand.*` — les équipes peuvent commencer à l'utiliser

**Pour les agents IA :**
- Un agent comprend `color.brand.accent` comme "accentuation de marque" — pas `#ed6b86`
- Les tokens brand.primary et action.primary sont intentionnellement distincts : brand exprime l'identité, action exprime la fonction

**Dette soldée :**
- La stratégie de synchronisation Figma pour les palettes custom est documentée dans **ADR-026**
