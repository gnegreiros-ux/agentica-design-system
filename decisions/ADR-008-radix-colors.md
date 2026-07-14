# ADR-008 — Choosing Radix UI Colors for the primitive palette

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Principal Designer
> **Type:** contract
> **Logical path:** decisions/ADR-008-radix-colors.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/color.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-007-axe-core-accessibilite.md

---

## Context

ADR-001 establishes that primitive tokens are **raw values with no UX intent**.
Yet not all color palettes are equivalent for an agentic system: some implicitly
encode accessibility and usage constraints, others don't.

The project needed a primitive palette satisfying three simultaneous constraints:

**1. Structurally guaranteed accessibility**
The choice of palette must not shift onto every designer or developer the
responsibility of checking contrast ratios. The palette must be designed so that
the correct combinations are the natural combinations.

**2. Readability by AI agents**
An agent that must choose a hue for an action background needs to be able to
infer which value to use without scanning every shade of a flat palette. The
palette must have internal usage semantics, not just values.

**3. Native dark mode with no extra effort**
The system must support dark mode by remapping only semantic tokens. The
primitive palette must provide the dark equivalent of every shade without the
team having to manually define a second palette.

---

## Decision

Adopt **Radix UI Colors** as the source for all of the system's primitive colors.

Radix provides 30 chromatic palettes (gray, mauve, slate, sage, olive, sand,
tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan,
teal, jade, green, grass, brown, bronze, gold, sky, mint, lime, yellow, amber, orange)
plus the `white` and `black` alpha palettes.

Each palette is structured into **12 steps** with documented usage semantics:

| Steps | Semantic usage |
|-------|-----------------|
| 1–2 | App background and subtle background |
| 3–4 | UI component background, hover, pressed |
| 5–6 | Borders and separators |
| 7–8 | Muted text, subtle fills |
| 9–10 | **Solids** — CTA, brand, action background |
| 11–12 | High-contrast text, icons |

This semantics is encoded directly in `primitives.json` via each token's
`$description` field, and documented in the color section's `_readme`.

---

## Why the 12-step system matters for agents

An agent given the instruction "choose a background color for an action button"
can reason as follows with Radix:

```
Step 9 or 10 = "Solid fills (brand, CTA)"
→ primitive.color.blue.9 = #0090ff  ← blue CTA background
→ primitive.color.blue.10 = #0588f0 ← hover state
```

Without this system, the agent would have to scan every value in the palette and
evaluate the contrast of each shade to find a usable value. With Radix, the
usage semantics lives in the token itself.

This principle is consistent with ADR-005 (`critical` rather than `danger`):
**name by behavior, not by value**.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Tailwind CSS colors** | A flat palette with no per-shade usage semantics. `blue-700` doesn't say whether the value works for a CTA background, text, or a border. An agent facing this palette has to compute contrasts itself. Popular but semantically poor for an agentic system. |
| **Material Design color system (Google)** | A palette designed for the Material ecosystem. Names (`Primary`, `Secondary`, `Tertiary`) are roles, not shade levels — they already anticipate the semantic layer and blur the two levels defined in ADR-001. Less adaptable to a custom design system. |
| **Custom palette defined by the team** | Requires expertise in color science (perceptual space, APCA/WCAG contrast, cross-hue consistency). Without dedicated tooling, accessibility guarantees must be verified manually for every shade. High maintenance cost the moment a hue changes. |
| **IBM Carbon Design System colors** | A quality, accessible palette, but coupled to Carbon's naming conventions (`carbon-10` to `carbon-100`). Integration requires mapping Carbon levels to the local system's levels. Radix offers the same quality without that coupling. |
| **Open Color** | A lightweight, simple open-source palette. 12 hues × 10 shades each. No documented per-shade usage semantics, no alpha palettes, no native dark mode. Insufficient for the system's needs. |
| **Auto-generated Figma palette** | Figma variables can auto-generate gradients. But the generated values aren't tested for WCAG contrast and don't provide a coherent dark mode. Also breaks digital sovereignty — the palette becomes dependent on Figma. |

---

## Consequences

**For AI agents:**
- Each step's `$description` field (e.g., `"Solid background — brand / CTA"`) is
  directly readable — an agent can choose the right step with no contrast calculation
- The convention "step 9 = solid CTA background, step 11 = readable text" is
  predictable and consistent across all 30 palettes: learning the rule once
  covers every hue
- An agent generating a semantic token knows the combinations `step 9
  (background) + white` and `step 11 (text) + step 1 (background)` are
  accessible by construction

**For designers:**
- The Radix dark-mode palette is natively available — remapping happens only at
  the semantic-token level (e.g., `color.background.page` points to `gray.1` in
  light mode and `gray.2` in dark mode), without redefining the primitive layer
- Figma: the 30 palettes are importable via Tokens Studio directly from the JSON

**For accessibility (ADR-007):**
- Radix guarantees that steps 9-10 on a white background reach a ratio ≥ 4.5:1
  for saturated hues, and that steps 11-12 reach ≥ 7:1 — the WCAG AA and AAA thresholds
- axe-core detects contrast violations at runtime, but Radix reduces the
  likelihood of introducing them at design time

**For governance:**
- Radix Colors is open source (MIT) — no commercial dependency, no license-change risk
- Values are stable across major versions — a Radix update doesn't break existing
  primitive tokens without an explicit changelog

**Point of vigilance:**
The current semantic tokens (`semantic.json`) reference primitives using a
`{color.blue.700}` notation inherited from a Tailwind convention (100–900), which
doesn't directly correspond to the Radix steps (1–12) defined in
`primitives.json`. This reference mismatch must be resolved in a dedicated TCR to
align the two layers and ensure Style Dictionary resolves references correctly.

---

## Incidents or triggers

Foundational decision, made before any incident.
Motivated by tests conducted with generative agents: when given a flat palette
with no usage semantics, agents chose shades that were visually coherent but
inaccessible (e.g., `blue-300` on a white background, ratio < 3:1).
With the Radix palette and its step descriptions, agents naturally converged on
accessible steps with no explicit rule injected.

<!-- FR -->

# ADR-008 — Choix de Radix UI Colors pour la palette primitive

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-008-radix-colors.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/color.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-007-axe-core-accessibilite.md

---

## Contexte

L'ADR-001 établit que les tokens primitifs sont des **valeurs brutes sans intention UX**.
Pourtant, toutes les palettes de couleurs ne sont pas équivalentes pour un système agentique :
certaines encodent implicitement des contraintes d'accessibilité et d'usage, d'autres non.

Le projet avait besoin d'une palette primitive qui satisfasse trois contraintes simultanées :

**1. Accessibilité garantie structurellement**
Le choix de la palette ne doit pas reporter sur chaque designer ou développeur
la responsabilité de vérifier les ratios de contraste. La palette doit être conçue
pour que les combinaisons correctes soient les combinaisons naturelles.

**2. Lisibilité par les agents IA**
Un agent qui doit choisir une teinte pour un fond d'action doit pouvoir inférer
quelle valeur utiliser sans scanner toutes les nuances d'une palette plate.
La palette doit avoir une sémantique d'usage interne, pas seulement des valeurs.

**3. Dark mode natif sans effort**
Le système doit supporter le dark mode en remappant uniquement les tokens sémantiques.
La palette primitive doit fournir les équivalents dark de chaque nuance sans
que l'équipe ait à définir une deuxième palette manuellement.

---

## Décision

Adoption de **Radix UI Colors** comme source de toutes les couleurs primitives du système.

Radix fournit 30 palettes chromatiques (gray, mauve, slate, sage, olive, sand,
tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan,
teal, jade, green, grass, brown, bronze, gold, sky, mint, lime, yellow, amber, orange)
plus les palettes alpha `white` et `black`.

Chaque palette est structurée en **12 steps** avec une sémantique d'usage documentée :

| Steps | Usage sémantique |
|-------|-----------------|
| 1–2 | Fond d'application et fond subtil |
| 3–4 | Fond de composant UI, hover, pressed |
| 5–6 | Bordures et séparateurs |
| 7–8 | Texte atténué, fills discrets |
| 9–10 | **Solides** — CTA, brand, fond d'action |
| 11–12 | Texte haute contrast, icônes |

Cette sémantique est encodée directement dans `primitives.json` via le champ
`$description` de chaque token, et documentée dans le `_readme` de la section couleur.

---

## Pourquoi le système 12 steps est central pour les agents

Un agent qui reçoit l'instruction "choisir une couleur de fond pour un bouton d'action"
peut raisonner ainsi avec Radix :

```
Step 9 ou 10 = "Solid fills (brand, CTA)"
→ primitive.color.blue.9 = #0090ff  ← fond CTA bleu
→ primitive.color.blue.10 = #0588f0 ← état hover
```

Sans ce système, l'agent devrait scanner toutes les valeurs de la palette
et évaluer le contraste de chaque nuance pour trouver une valeur utilisable.
Avec Radix, la sémantique d'usage est dans le token lui-même.

Ce principe est cohérent avec ADR-005 (`critical` plutôt que `danger`) :
**nommer par comportement, pas par valeur**.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Tailwind CSS colors** | Palette plate sans sémantique d'usage par nuance. `blue-700` ne dit pas si la valeur convient pour un fond CTA, du texte ou une bordure. Un agent face à cette palette doit calculer les contrastes lui-même. Populaire mais sémantiquement pauvre pour un système agentique. |
| **Material Design color system (Google)** | Palette conçue pour l'écosystème Material. Les noms (`Primary`, `Secondary`, `Tertiary`) sont des rôles, pas des niveaux de nuance — ils anticipent déjà la couche sémantique et confondent les deux niveaux de l'ADR-001. Moins adaptable à un système de design custom. |
| **Palette personnalisée définie par l'équipe** | Requiert une expertise en science des couleurs (espace perceptuel, contraste APCA/WCAG, cohérence entre teintes). Sans outillage dédié, les garanties d'accessibilité doivent être vérifiées manuellement pour chaque nuance. Coût de maintenance élevé dès qu'une teinte est modifiée. |
| **IBM Carbon Design System colors** | Palette de qualité et accessible, mais couplée aux conventions de nommage Carbon (`carbon-10` à `carbon-100`). L'intégration nécessite de mapper les niveaux Carbon vers les niveaux du système local. Radix offre la même qualité sans ce couplage. |
| **Open Color** | Palette open source légère et simple. 12 teintes × 10 nuances chacune. Pas de sémantique d'usage documentée par nuance, pas de palettes alpha ni de dark mode natif. Insuffisant pour les besoins du système. |
| **Palette Figma auto-générée** | Les variables Figma peuvent générer des dégradés automatiquement. Mais les valeurs générées ne sont pas testées pour le contraste WCAG et ne fournissent pas de dark mode cohérent. Rompt également la souveraineté numérique — la palette devient dépendante de Figma. |

---

## Conséquences

**Pour les agents IA :**
- Le champ `$description` de chaque step (ex: `"Solid background — brand / CTA"`) est
  lisible directement — un agent peut choisir le step approprié sans calcul de contraste
- La convention step 9 = fond solide CTA et step 11 = texte lisible est prévisible et
  cohérente sur les 30 palettes : apprendre la règle une fois suffit pour toutes les teintes
- Un agent qui génère un token sémantique sait que les combinaisons `step 9 (fond) + white`
  et `step 11 (texte) + step 1 (fond)` sont accessibles par construction

**Pour les designers :**
- La palette dark mode Radix est disponible nataly — le remapping se fait uniquement
  au niveau des tokens sémantiques (ex: `color.background.page` pointe vers `gray.1`
  en light et `gray.2` en dark), sans redéfinir la couche primitive
- Figma : les 30 palettes sont importables via Tokens Studio directement depuis le JSON

**Pour l'accessibilité (ADR-007) :**
- Radix garantit que les steps 9-10 sur fond blanc atteignent un ratio ≥ 4.5:1 pour
  les teintes saturées, et que les steps 11-12 atteignent ≥ 7:1 — les seuils WCAG AA et AAA
- axe-core détecte les violations de contraste au runtime, mais Radix réduit la
  probabilité d'en introduire au moment de la conception

**Pour la gouvernance :**
- Radix Colors est open source (MIT) — pas de dépendance commerciale, pas de risque de
  changement de licence
- Les valeurs sont stables entre versions majeures — une mise à jour Radix ne casse
  pas les tokens primitifs existants sans changelog explicite

**Point de vigilance :**
Les tokens sémantiques actuels (`semantic.json`) référencent les primitifs avec
une notation `{color.blue.700}` héritée d'une convention Tailwind (100–900),
qui ne correspond pas directement aux steps Radix (1–12) définis dans `primitives.json`.
Cette incohérence de référence doit être résolue dans un TCR dédié pour aligner
les deux couches et garantir que Style Dictionary résout les références correctement.

---

## Incidents ou déclencheurs

Décision fondatrice, prise avant incident.
Motivée par les tests menés avec des agents génératifs : lorsqu'une palette plate
sans sémantique d'usage était fournie, les agents choisissaient des nuances visuellement
cohérentes mais inaccessibles (ex: `blue-300` sur fond blanc, ratio < 3:1).
Avec la palette Radix et ses descriptions de step, les agents convergeaient
naturellement vers des steps accessibles sans règle explicite injectée.
