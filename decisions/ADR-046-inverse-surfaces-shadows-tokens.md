# ADR-046 — Surfaces inversées, ombres et jetons décoratifs

> **Date :** 2026-06-05
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-046-inverse-surfaces-shadows-tokens.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, .claude/rules/feedback_site_dogfooding.md, decisions/ADR-045-feedback-color-family-completion.md, site/build.js

---

## Contexte

Après la complétion de la famille `feedback` (ADR-045), il restait dans `site/build.js` une dette
de couleurs en dur sans équivalent sémantique : **surfaces sombres** (bandeau de stats, pied de
page, tooltips), **textes/bordures blancs sur fond sombre**, **ombres** (`box-shadow`) et une
**barre décorative** de visualisation d'espacement. Aucune de ces valeurs ne pouvait être routée :
le niveau sémantique n'exposait ni surface inversée, ni texte « on-inverse », ni ombre, ni jeton de
visualisation.

Découverte clé : les **échelles d'alpha existaient déjà** au niveau primitif (`color.white.*` =
blanc alpha, `color.black.*` = noir alpha, façon Radix) mais n'étaient **jamais consommées**. Elles
fournissent exactement les valeurs nécessaires aux textes/ombres sur fond sombre.

---

## Décision

### 1 — Deux primitifs « presque noirs » (surfaces inversées)

Aucun primitif plus sombre que `gray.12` (#202020) n'existait. Ajout de deux ancres neutres
(convention Tailwind neutral-900/950) :

| Primitif | Valeur | Rôle |
|----------|--------|------|
| `neutral.900` | `#1a1e24` | Surface sombre surélevée (tooltip/popover) |
| `neutral.950` | `#0f1117` | Surface sombre la plus profonde (bandeau, pied de page) |

### 2 — Jetons sémantiques (référencent les primitifs existants)

| Jeton sémantique | Référence | Rôle |
|------------------|-----------|------|
| `color.background.inverse` | `neutral.950` | Bandeau de stats, pied de page |
| `color.background.inverse-raised` | `neutral.900` | Tooltips de la palette |
| `color.text.on-inverse` | `white.1` (#fff) | Texte fort / lien survolé sur fond sombre |
| `color.text.on-inverse-secondary` | `white.8` (.75) | Liens sur fond sombre — **10.8:1** |
| `color.text.on-inverse-muted` | `white.10` (.52) | Texte atténué — **plancher AA, 5.69:1** |
| `color.border.on-inverse` | `white.12` (.18) | Séparateur sur fond sombre (non textuel) |
| `color.border.swatch` | `black.2` (.10) | Filet de contour des échantillons (non textuel) |
| `color.viz.scale-bar` | `red.6` | Barre décorative de la démo d'espacement (non sémantique) |
| `shadow.header` | `0 2px 24px rgba(0,0,0,.12)` | Ombre de l'en-tête fixe |
| `shadow.raised` | `0 4px 16px rgba(0,0,0,.10)` | Menus déroulants, nav mobile |
| `shadow.card-hover` | `0 4px 16px rgba(13,116,206,.10)` | Lift de carte teinté marque |

> Les ombres sont des composites `$type: "other"` portant des `rgba` littéraux — **même
> convention que le jeton préexistant `component.card.elevated.shadow`**. La dette résorbée est
> celle du **consommateur** (le site) : la valeur vit désormais dans une couche nommée.

---

## Accessibilité (WCAG 2.2) — un correctif au passage

Contrastes mesurés sur `background.inverse` (#0f1117) :

| Jeton | Alpha | Ratio | Verdict |
|-------|-------|-------|---------|
| `text.on-inverse` | 1.00 | 19.6:1 | ✅ AAA |
| `text.on-inverse-secondary` | .75 | **10.8:1** | ✅ AAA |
| `text.on-inverse-muted` | .52 | **5.69:1** | ✅ AA (plancher retenu) |

**Correctif :** le pied de page (`.footer-credit` à blanc .35) et le lien de pied d'audit
(`.audit-footer-link` à blanc .30) **échouaient AA** (~3:1) avant ce travail. Leur tokenisation vers
`text.on-inverse-muted` (.52) les porte à **5.69:1** — conforme. C'est un cas d'**auto-guérison
encadrée** : une dérive détectée et corrigée avec approbation humaine.

Les jetons `border.on-inverse` (.18) et `border.swatch` (.10) sont **non textuels** (séparateurs /
contours décoratifs) — exemptés du 4.5:1 (WCAG 1.4.3). `viz.scale-bar` est purement décoratif et ne
porte aucune information (la valeur d'espacement est donnée par le libellé adjacent).

---

## Périmètre

| Inclus | Exclu |
|--------|-------|
| 2 primitifs neutres + 11 jetons sémantiques (inverse, on-inverse, swatch, viz, shadow) | Mode sombre global du site (hors sujet) |
| Migration de `site/build.js` : bandeau stats, pied de page, en-tête, nav mobile, tooltips, nav-card hover, échantillons, barre d'espacement | Démo `toggle` (voir résidu ci-dessous) |

### Résidu assumé (hors périmètre, documenté)

La **démo illustrative du composant `toggle`** (`buildToggle()`) utilise encore `#8d8d8d` (= `gray.9`
exact) pour le rail OFF et `rgba(0,0,0,.25)` pour l'ombre du bouton — un raccourci **déjà annoté
« (proxy) »** dans la table de jetons de la page. C'est une dette de *dogfooding de démo* (la démo
devrait consommer le contrat `component.toggle.*`), distincte du chantier surfaces/ombres. Le site
n'émet pas les variables `--agtc-component-toggle-*` (non consommées ailleurs) : les router exigerait
un travail séparé. **Reporté** à une passe de dogfooding des démos de composants.

### Restent légitimement en dur (exemptés)

Logo SVG (`#12A594`), **affichages de valeurs de jetons** (tables de doc montrant le hex résolu),
**exemples de code** (anti-pattern `color: #0d74ce`), et `manifest.json` (`theme_color`).

---

## Alternatives rejetées

- **Préserver les blancs alpha exacts** (.35/.30) en pied de page : reconduit un échec WCAG —
  rejeté au profit du plancher AA `on-inverse-muted`.
- **Réutiliser `brand.secondary`** (#463239) pour les surfaces sombres : c'est un brun de marque,
  pas un neutre — inadapté à un pied de page neutre.
- **Jetons d'ombre par interpolation de primitifs alpha** : Style Dictionary n'interpole pas
  proprement les `rgba` dans une chaîne composite ; on garde la convention `$type: other` existante.
- **Tokeniser la démo toggle dans ce lot** : créerait des variables fantômes ou gonflerait la
  surface de jetons pour une seule démo — reporté (voir résidu).

---

## Conséquences

- `site/build.js` ne contient plus aucune surface sombre, ombre ou bordure décorative en dur
  (hors résidu toggle documenté). Build : **655 défini · 173 référencé · 0 fantôme**.
- Les échelles `white.*` / `black.*` (jusqu'ici orphelines) sont désormais **consommées via le
  sémantique** — fin de leur statut de primitifs morts.
- Le système dispose d'un socle **« surface inversée »** réutilisable (futur mode sombre, bandeaux,
  tooltips de composants) et d'une **échelle d'ombres** nommée.
- Gouvernance : 2 primitifs (approbation Principal Designer) + 11 sémantiques (Design System Lead).
  Aucun jeton de composant modifié.
