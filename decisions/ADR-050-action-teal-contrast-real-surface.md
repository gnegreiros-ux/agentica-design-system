# ADR-050 — Compliant action teal on the real surface: teal.11 `#008573` → `#007a68`

> **Date:** 2026-06-06
> **Status:** ✅ Active
> **Decision-makers:** Principal Designer (primitive token value)
> **Type:** contract
> **Logical path:** decisions/ADR-050-action-teal-contrast-real-surface.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-048-action-teal-wcag-contrast.md, tokens/primitives.json, tokens/semantic.json, .claude/skills/pipelines/axe-core.md, guidelines/components/button.md

---

## Context

**ADR-048** raised `action.primary` to `teal.11` (`#008573`), certifying it at
**4.56:1**, a value measured **against pure white `#ffffff`**. But the system's real page
background is **`gray.1` = `#fcfcfc`** ("App background" token), not pure white.

The **first run of the axe-core gate** (ADR-007, enabled in reporting mode — commit
`2d84e75`) revealed **76 violations**, with one dominant, **systemic** root cause:

| Pair measured | Real ratio | AA text (4.5:1) |
|---------------|-----------|------------------|
| `action.primary` teal.11 `#008573` as **text** on `#fcfcfc` (gray.1) | **4.45:1** | ❌ fails by a hair |
| White text on primary button teal.11 `#008573` | 4.56:1 | ✅ (borderline) |

The failure is **uniform** everywhere the action teal serves as **text**: active links
(nav / TOC / sidebar), `secondary`/`ghost` button text, inline code (`td code`), prose
links. ADR-048's margin (0.06 above threshold) was calibrated against the wrong surface;
on `#fcfcfc` it drops below the threshold.

> The Radix teal ramp offers **no step** between teal.11 (`#008573`) and teal.12
> (`#0d3d38`, near-black, 11.75:1). The fix is therefore not an existing step but a
> **slightly darker action teal** — a **primitive token value** decision (Principal
> Designer governance), not a CSS patch.

---

## Decision

Retune the **`teal.11`** primitive from `#008573` to **`#007a68`**.

`teal.11` is consumed by only two semantic roles — `action.primary` and `border.focus`
— which automatically inherit the new value. No other consumer (contained blast radius).

| Token | Before | After | As text on `#fcfcfc` | White text on top |
|-------|-------|-------|------------------------|--------------------|
| `primitive.color.teal.11` | `#008573` | **`#007a68`** | 4.45 → **5.14:1** ✅ AA | 4.56 → **5.27:1** ✅ AA |
| `semantic.action.primary` (→ teal.11) | — | inherits | **5.14:1** ✅ | **5.27:1** ✅ |
| `semantic.border.focus` (→ teal.11) | — | inherits | **5.14:1** (≥3:1, non-text) ✅ | — |
| `action.primary-hover` (teal.12 `#0d3d38`) | unchanged | unchanged | 11.75:1 ✅ | — |
| `brand.primary` (teal.9 `#12a594`, identity) | unchanged | unchanged | — (logotype, exempt) | — |

The retained margin (~0.6 above threshold) is robust to rounding and to any slightly
tinted surface, while remaining **visibly teal** (no drift toward teal.12's near-black).

---

## Accessibility (WCAG 2.2)

| Element | After (`#007a68`) | Verdict |
|---------|-------------------|---------|
| Active link / code / ghost button text (teal as text on `#fcfcfc`) | 5.14:1 | ✅ AA |
| Primary button text (white on teal.11) | 5.27:1 | ✅ AA |
| Primary button hover (white on teal.12) | 11.75:1 | ✅ AAA |
| Focus ring (teal.11 on `#fcfcfc`, non-text) | 5.14:1 | ✅ (≥ 3:1) |
| "Agentica" wordmark (teal.9, logotype) | — | exempt (WCAG 1.4.3) |

---

## Scope

| Included | Excluded |
|--------|-------|
| `primitive.color.teal.11`: `#008573` → `#007a68` | `brand.primary` (teal.9, identity — SVG logo / manifest) |
| `action.primary` + `border.focus` intents (ref. real surface, ADR-050) | `action.primary-hover` (teal.12, already compliant) |
| Token code display in `site/build.js` (`#008573` → `#007a68`) | ADR-048 (immutable; this ADR corrects the record) |
| `axe-core.md` pipeline docs (root cause marked resolved) | Recompiling `dist/` + `site/dist/` (artifacts regenerated at build) |

---

## Rejected alternatives

- **Dedicated off-ramp action primitive** (leave teal.11 = `#008573`, add `teal.action` =
  `#007a68`): keeps the canonical Radix ramp, but introduces an unnumbered off-scale
  primitive. Rejected — `teal.11` has only two interactive consumers; retuning it in
  place is contained and avoids an exception primitive.
- **Finer value `#007e6c`** (4.87:1): compliant but only ~0.37 of margin — fragile
  against rounding / marginally darker surfaces. Rejected in favor of a comfortable margin.
- **Lighten the page background** (`#fcfcfc` → pure white): touches a much broader
  surface foundation to save a single pair, and displaces the problem. Rejected.
- **Change nothing, document the debt**: contrary to the non-negotiable WCAG AA value
  and the button contract ("4.5:1 minimum"). Rejected.

---

## Consequences

- The action teal is AA-compliant **on the real surface** (`#fcfcfc`), not just on
  theoretical white. The root cause of the 76 violations (the `color-contrast` category)
  is resolved.
- Still to address before the axe-core gate can become **blocking**:
  `aria-prohibited-attr` (decorative `<div>` → `role="img"`) and `label` (×2 controls with
  no label). Out of scope for this (token) ADR.
- `guidelines/components/button.md` ("4.5:1 minimum") is now genuinely satisfied on the
  page background.
- ADR-048 remains the historical record of the "two teals, two roles" split (brand
  teal.9 / action teal.11); this ADR-050 **only corrects the action teal's value** and
  the reference-surface error. ADRs are immutable; **ADR-050 is authoritative** on the
  value of `teal.11`.
- Governance: change to a **primitive token value** — **Principal Designer** approval.
  No token added, no component token modified, no hardcoded value introduced.

<!-- FR -->

# ADR-050 — Teal d'action conforme sur le fond réel : teal.11 `#008573` → `#007a68`

> **Date :** 2026-06-06
> **Statut :** ✅ Actif
> **Décideurs :** Principal Designer (valeur de jeton primitif)
> **Type:** contract
> **Chemin logique:** decisions/ADR-050-action-teal-contrast-real-surface.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-048-action-teal-wcag-contrast.md, tokens/primitives.json, tokens/semantic.json, .claude/skills/pipelines/axe-core.md, guidelines/components/button.md

---

## Contexte

L'**ADR-048** a porté `action.primary` à `teal.11` (`#008573`) en le certifiant à **4.56:1**, valeur
mesurée **sur du blanc pur `#ffffff`**. Or le fond de page réel du système est **`gray.1` = `#fcfcfc`**
(jeton « App background »), pas du blanc pur.

La **première exécution du gate axe-core** (ADR-007, activé en mode rapport — commit `2d84e75`) a
révélé **76 violations**, dont une cause racine dominante et **systémique** :

| Paire mesurée | Ratio réel | AA texte (4.5:1) |
|---------------|-----------|------------------|
| `action.primary` teal.11 `#008573` en **texte** sur `#fcfcfc` (gray.1) | **4.45:1** | ❌ échec d'un cheveu |
| Texte blanc sur bouton primaire teal.11 `#008573` | 4.56:1 | ✅ (limite) |

L'échec est **uniforme** partout où le teal d'action sert de **texte** : liens actifs (nav / TOC /
sidebar), texte des boutons `secondary`/`ghost`, code inline (`td code`), liens de prose. La marge de
l'ADR-048 (0.06 au-dessus du seuil) était calibrée sur la mauvaise surface ; sur `#fcfcfc` elle passe
sous le seuil.

> Le ramp Radix teal ne propose **aucun palier** entre teal.11 (`#008573`) et teal.12 (`#0d3d38`,
> quasi-noir, 11.75:1). Le correctif n'est donc pas un palier existant mais un **teal d'action un peu
> plus sombre** — une décision de **valeur de jeton primitif** (gouvernance Principal Designer), pas
> un patch CSS.

---

## Décision

Retuner le primitif **`teal.11`** de `#008573` à **`#007a68`**.

`teal.11` n'est consommé que par deux rôles sémantiques — `action.primary` et `border.focus` —
qui héritent automatiquement de la nouvelle valeur. Aucun autre consommateur (rayon d'impact contenu).

| Jeton | Avant | Après | En texte sur `#fcfcfc` | Texte blanc dessus |
|-------|-------|-------|------------------------|--------------------|
| `primitive.color.teal.11` | `#008573` | **`#007a68`** | 4.45 → **5.14:1** ✅ AA | 4.56 → **5.27:1** ✅ AA |
| `semantic.action.primary` (→ teal.11) | — | hérite | **5.14:1** ✅ | **5.27:1** ✅ |
| `semantic.border.focus` (→ teal.11) | — | hérite | **5.14:1** (≥3:1, non textuel) ✅ | — |
| `action.primary-hover` (teal.12 `#0d3d38`) | inchangé | inchangé | 11.75:1 ✅ | — |
| `brand.primary` (teal.9 `#12a594`, identité) | inchangé | inchangé | — (logotype, exempt) | — |

La marge retenue (~0.6 au-dessus du seuil) est robuste aux arrondis et à toute surface légèrement
teintée, tout en restant **visiblement teal** (pas de dérive vers le quasi-noir de teal.12).

---

## Accessibilité (WCAG 2.2)

| Élément | Après (`#007a68`) | Verdict |
|---------|-------------------|---------|
| Lien actif / code / texte de bouton ghost (teal en texte sur `#fcfcfc`) | 5.14:1 | ✅ AA |
| Texte bouton primaire (blanc sur teal.11) | 5.27:1 | ✅ AA |
| Survol bouton primaire (blanc sur teal.12) | 11.75:1 | ✅ AAA |
| Anneau de focus (teal.11 sur `#fcfcfc`, non textuel) | 5.14:1 | ✅ (≥ 3:1) |
| Mot-symbole « Agentica » (teal.9, logotype) | — | exempt (WCAG 1.4.3) |

---

## Périmètre

| Inclus | Exclu |
|--------|-------|
| `primitive.color.teal.11` : `#008573` → `#007a68` | `brand.primary` (teal.9, identité — logo SVG / manifest) |
| Intentions `action.primary` + `border.focus` (réf. surface réelle, ADR-050) | `action.primary-hover` (teal.12, déjà conforme) |
| Affichage de code du token dans `site/build.js` (`#008573` → `#007a68`) | ADR-048 (immuable ; cet ADR corrige le record) |
| Doc du pipeline `axe-core.md` (cause racine marquée résolue) | Recompilation `dist/` + `site/dist/` (artefacts régénérés au build) |

---

## Alternatives rejetées

- **Primitif d'action dédié hors-ramp** (laisser teal.11 = `#008573`, ajouter `teal.action` =
  `#007a68`) : garde le ramp Radix canonique, mais introduit un primitif non numéroté hors échelle.
  Rejeté — `teal.11` n'a que deux consommateurs interactifs ; le retuner en place est contenu et
  évite un primitif d'exception.
- **Valeur plus fine `#007e6c`** (4.87:1) : conforme mais ~0.37 de marge seulement — fragile face aux
  arrondis / surfaces marginalement plus sombres. Rejeté au profit d'une marge confortable.
- **Éclaircir le fond de page** (`#fcfcfc` → blanc pur) : touche une fondation de surface bien plus
  large pour sauver une seule paire, et déplace le problème. Rejeté.
- **Ne rien changer, documenter la dette** : contraire à la valeur non négociable WCAG AA et au
  contrat du bouton (« 4.5:1 minimum »). Rejeté.

---

## Conséquences

- Le teal d'action est conforme AA **sur la surface réelle** (`#fcfcfc`), pas seulement sur blanc
  théorique. La cause racine des 76 violations (volet `color-contrast`) est résorbée.
- Restent à traiter pour basculer le gate axe-core en **bloquant** : `aria-prohibited-attr` (`<div>`
  décoratifs → `role="img"`) et `label` (×2 contrôles sans libellé). Hors périmètre de cet ADR (token).
- `guidelines/components/button.md` (« 4.5:1 minimum ») est désormais réellement satisfait sur le fond
  de page.
- ADR-048 reste l'historique de la séparation « deux teals, deux rôles » (brand teal.9 / action
  teal.11) ; cet ADR-050 **corrige uniquement la valeur du teal d'action** et l'erreur de surface de
  référence. Les ADR sont immuables ; **ADR-050 fait foi** sur la valeur de `teal.11`.
- Gouvernance : changement de **valeur de jeton primitif** — approbation **Principal Designer**.
  Aucun jeton ajouté, aucun jeton de composant modifié, aucune valeur en dur introduite.
