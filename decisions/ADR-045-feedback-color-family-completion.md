# ADR-045 — Complétion de la famille de couleurs sémantiques `feedback`

> **Date :** 2026-06-05
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-045-feedback-color-family-completion.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/primitives.json, .claude/rules/tokens-system.md, .claude/rules/feedback_site_dogfooding.md, site/build.js

> **English summary:** Completes the `semantic.color.feedback` family so every severity (danger,
> success, warning, info) exposes all three roles — text, subtle background, border — eliminating
> the last hardcoded feedback colors (including a previously-missing warning family) in
> `site/build.js`.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
