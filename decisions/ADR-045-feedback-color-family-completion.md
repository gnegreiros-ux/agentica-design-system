# ADR-045 — Completion of the `feedback` semantic color family

> **Date:** 2026-06-05
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-045-feedback-color-family-completion.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/primitives.json, .claude/rules/tokens-system.md, .claude/rules/feedback_site_dogfooding.md, site/build.js

---

## Context

The site's *dogfooding* (category A) tokenized the hardcoded feedback **text** colors
(`.icon-no`, `.icon-ok`, pass/fail audit) on 2026-06-04. There remained a debt explicitly logged:
the **subtle backgrounds**, **borders**, and the **warning palette** still hardcoded in
`site/build.js`:

- `.rule-can` / `.rule-cannot` — `#ecfdf5` / `#bbf7d0`, `#fef2f2` / `#fecaca`
- `.do-section` / `.dont-section` — `#f0fdf4` / `#86efac`, `#fef2f2` / `#fecaca`
- `.audit-badge.pass/.fail` — `#ecfdf5`, `#fff1f2`
- `.audit-card--pass/--warn/--fail` (borders) — `#86efac`, `#fde68a`, `#fca5a5`
- `.audit-card--warn .audit-number` — `#d97706` (**warning, absent from the system**)

These values could not be routed: the semantic level only exposed `danger`, `danger-subtle`,
`success`, `info` — the **subtle** (background) and **border** variants were missing, as was
**the entire `warning` family**.

---

## Decision

Complete the `semantic.color.feedback` family so it covers the **three roles** of each severity
— **text** (`-11`), **subtle background** (`-3`), **border** (`-6`) — across the **four**
standard severities: `danger`, `success`, `warning`, `info`.

| Semantic token added | Primitive | Role |
|-------------------------|----------|------|
| `feedback.danger-border` | `red.6` | Danger border |
| `feedback.success-subtle` | `green.3` | Success subtle background |
| `feedback.success-border` | `green.6` | Success border |
| `feedback.warning` | `orange.11` | Warning text |
| `feedback.warning-subtle` | `orange.3` | Warning subtle background |
| `feedback.warning-border` | `orange.6` | Warning border |
| `feedback.info-subtle` | `blue.3` | Info subtle background |
| `feedback.info-border` | `blue.6` | Info border |

> `danger`, `danger-subtle`, `success`, `info` already existed — unchanged.

The choice of steps (`-11` text / `-3` background / `-6` border) follows the Radix convention
already in effect in `component.badge` (ADR-034) and `component.banner` (ADR-042): cross-component
consistency guaranteed.

---

## Accessibility (WCAG 2.2)

| Pair | Ratio | Verdict |
|-------|-------|---------|
| `warning` (`#cc4e00`) on white | **4.51:1** | ✅ AA normal text |
| `success` (`#18794e`) on `success-subtle` (`#e6f6eb`) | ✅ | proven Radix pair (badge) |
| `danger` (`#ce2c31`) on `danger-subtle` (`#feebec`) | ✅ | proven Radix pair (badge) |

The `*-border` (`-6`) tokens are **non-text** (decorative separators/outlines) — exempt from the
4.5:1 requirement (WCAG 1.4.3); they never carry severity information alone (WCAG 1.4.1).

---

## Scope

| Included | Excluded (future evolution) |
|--------|--------------------------|
| 8 new feedback semantic tokens (subtle/border + warning family) | Dedicated **component** tokens (still derived as needed) |
| Full symmetry across the 4 severities × 3 roles | "Solid" variants (full background + light text) |
| `info-subtle` / `info-border` added for **symmetry** (not yet consumed on the site) | New severities (e.g. `neutral`) |

`info-subtle`/`info-border` are added for family consistency even though not yet consumed: contract
regularity takes precedence, and a future `banner info` component or site infobox will need them.

---

## Rejected alternatives

- **Keeping hardcoded colors in `build.js`**: violates `tokens-system.md` (never a hardcoded
  value) and `feedback_site_dogfooding.md` (the site must consume the DS) — rejected.
- **Creating ad hoc component tokens** (`component.site.audit.*`): oversized for generic feedback
  backgrounds/borders; these roles belong at the **semantic** level.
- **Reusing `*-subtle` as the border**: a background and a border don't share the same target
  contrast; `-3` (background) and `-6` (border) remain distinct, per Radix.

---

## Consequences

- `site/build.js` now routes **all** its feedback surfaces through the semantic level:
  `.rule-can/.rule-cannot`, `.do-section/.dont-section`, `.audit-badge`, `.audit-card--*`. The
  debt logged on 2026-06-04 is **settled**, zero remaining hardcoded feedback color.
- The `feedback` family is now **symmetric and predictable**: any agent can route a severity to
  its three roles without inventing a value.
- Governance: adding **semantic** tokens → **Design System Lead** (human) approval, per
  `tokens-system.md`. No primitive or component token modified.

<!-- FR -->

# ADR-045 — Complétion de la famille de couleurs sémantiques `feedback`

> **Date :** 2026-06-05
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-045-feedback-color-family-completion.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/primitives.json, .claude/rules/tokens-system.md, .claude/rules/feedback_site_dogfooding.md, site/build.js

---

## Contexte

Le *dogfooding* du site (catégorie A) a tokenisé les couleurs de **texte** feedback en dur
(`.icon-no`, `.icon-ok`, audit pass/fail) le 2026-06-04. Restait une dette explicitement
consignée au log : les **fonds subtils**, **bordures** et la **palette warning** encore en dur
dans `site/build.js` :

- `.rule-can` / `.rule-cannot` — `#ecfdf5` / `#bbf7d0`, `#fef2f2` / `#fecaca`
- `.do-section` / `.dont-section` — `#f0fdf4` / `#86efac`, `#fef2f2` / `#fecaca`
- `.audit-badge.pass/.fail` — `#ecfdf5`, `#fff1f2`
- `.audit-card--pass/--warn/--fail` (bordures) — `#86efac`, `#fde68a`, `#fca5a5`
- `.audit-card--warn .audit-number` — `#d97706` (**warning, absent du système**)

Ces valeurs ne pouvaient pas être routées : le niveau sémantique n'exposait que
`danger`, `danger-subtle`, `success`, `info` — il manquait les variantes **subtle** (fond) et
**border**, ainsi que **toute la famille `warning`**.

---

## Décision

Compléter la famille `semantic.color.feedback` pour qu'elle couvre les **trois rôles** de chaque
sévérité — **texte** (`-11`), **fond subtil** (`-3`), **bordure** (`-6`) — sur les **quatre**
sévérités standard : `danger`, `success`, `warning`, `info`.

| Token sémantique ajouté | Primitif | Rôle |
|-------------------------|----------|------|
| `feedback.danger-border` | `red.6` | Bordure danger |
| `feedback.success-subtle` | `green.3` | Fond subtil succès |
| `feedback.success-border` | `green.6` | Bordure succès |
| `feedback.warning` | `orange.11` | Texte avertissement |
| `feedback.warning-subtle` | `orange.3` | Fond subtil avertissement |
| `feedback.warning-border` | `orange.6` | Bordure avertissement |
| `feedback.info-subtle` | `blue.3` | Fond subtil information |
| `feedback.info-border` | `blue.6` | Bordure information |

> `danger`, `danger-subtle`, `success`, `info` préexistaient — inchangés.

Le choix des échelons (`-11` texte / `-3` fond / `-6` bordure) suit la convention Radix déjà
en vigueur dans `component.badge` (ADR-034) et `component.banner` (ADR-042) : cohérence
inter-composants garantie.

---

## Accessibilité (WCAG 2.2)

| Paire | Ratio | Verdict |
|-------|-------|---------|
| `warning` (`#cc4e00`) sur blanc | **4.51:1** | ✅ AA texte normal |
| `success` (`#18794e`) sur `success-subtle` (`#e6f6eb`) | ✅ | paire Radix éprouvée (badge) |
| `danger` (`#ce2c31`) sur `danger-subtle` (`#feebec`) | ✅ | paire Radix éprouvée (badge) |

Les tokens `*-border` (`-6`) sont **non textuels** (séparateurs/contours décoratifs) — exemptés
du 4.5:1 (WCAG 1.4.3) ; ils ne portent jamais seuls l'information de sévérité (WCAG 1.4.1).

---

## Périmètre

| Inclus | Exclu (évolution future) |
|--------|--------------------------|
| 8 nouveaux tokens sémantiques feedback (subtle/border + famille warning) | Tokens de **composant** dédiés (restent dérivés au besoin) |
| Symétrie complète des 4 sévérités × 3 rôles | Variantes « solid » (fond plein + texte clair) |
| `info-subtle` / `info-border` ajoutés par **symétrie** (pas encore consommés sur le site) | Nouvelles sévérités (ex. `neutral`) |

`info-subtle`/`info-border` sont ajoutés pour la cohérence de la famille même s'ils ne sont pas
encore consommés : la régularité du contrat prime, et un futur composant `banner info` ou une
infobox du site les attend.

---

## Alternatives rejetées

- **Garder les couleurs en dur dans `build.js`** : viole `tokens-system.md` (jamais de valeur en
  dur) et `feedback_site_dogfooding.md` (le site doit consommer le DS) — rejeté.
- **Créer des tokens de composant ad hoc** (`component.site.audit.*`) : surdimensionné pour des
  fonds/bordures de feedback génériques ; ces rôles appartiennent au niveau **sémantique**.
- **Réutiliser `*-subtle` comme bordure** : un fond et une bordure n'ont pas le même contraste
  cible ; `-3` (fond) et `-6` (bordure) restent distincts, conformément à Radix.

---

## Conséquences

- `site/build.js` route désormais **toutes** ses surfaces feedback via le niveau sémantique :
  `.rule-can/.rule-cannot`, `.do-section/.dont-section`, `.audit-badge`, `.audit-card--*`. Dette
  du log du 2026-06-04 **soldée**, zéro couleur de feedback en dur subsistante.
- La famille `feedback` est désormais **symétrique et prévisible** : tout agent peut router une
  sévérité vers ses trois rôles sans inventer de valeur.
- Gouvernance : ajout de tokens **sémantiques** → approbation **Design System Lead** (humain),
  conforme à `tokens-system.md`. Aucun token primitif ni de composant modifié.
