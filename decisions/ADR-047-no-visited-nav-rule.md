# ADR-047 — Règle système : pas d'état `:visited` sur la navigation

> **Date :** 2026-06-05
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** governance
> **Chemin logique:** decisions/ADR-047-no-visited-nav-rule.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** .claude/rules/no-visited-nav.md, .claude/rules/development.md, guidelines/components/link.md, site/build.js

---

## Contexte

Au cours du redesign du site, un défaut de pattern a été relevé : les éléments de **navigation**
peuvent hériter de l'état `:visited` du navigateur (teinte violette, ou dérive de couleur), ce qui
casse la cohérence visuelle et la hiérarchie. Un menu, un onglet, une sidebar, une table des matières
ou un bouton-icône d'en-tête n'est **pas du contenu « lu / non lu »** : son apparence ne doit pas
dépendre de l'historique de navigation.

Le site neutralisait déjà `:visited` de façon **ponctuelle et dispersée** (uniquement `.top-nav` et
`.github-btn`), tandis que d'autres surfaces de navigation (`.sidebar`, `.toc`, `.footer-links`,
`.audit-footer-link`) ne l'étaient pas. La demande humaine est explicite : **en faire une règle de
portée système entière**, pas seulement une correction locale du site web.

---

## Décision

Adoption d'une règle de gouvernance **`no-visited-nav`** (voir `.claude/rules/no-visited-nav.md`) :

> Tout **élément de navigation** réaligne sa couleur `:visited` sur l'état non-visité.
> La règle s'applique au **site, aux composants `agtc-*` et aux applications consommatrices**.

### Périmètre de la règle

| ✅ Concerné (pas d'état visité) | ❌ Non concerné (état visité autorisé) |
|-------------------------------|----------------------------------------|
| Nav header (+ CTA), sidebar, TOC, onglets, fil d'Ariane, pagination, menus, boutons-icônes header/footer, liens de pied de navigation | Liens de **contenu** dans la prose, listes de résultats/archives où « déjà lu » aide l'utilisateur |

> Critère de tri : si l'élément sert à **se déplacer** dans le produit → navigation → pas d'état
> visité. S'il pointe vers une **ressource à lire** → état visité autorisé.

### Implémentation de référence (site)

Bloc CSS unique et commenté dans `site/build.js`, neutralisant `:visited` sur toutes les surfaces de
navigation via **token sémantique** (jamais de valeur en dur), déclaré **avant** les règles
`:hover`/`.active` (à spécificité égale, le sélecteur le plus tardif l'emporte sur un lien visité ET
survolé). Les déclarations `:visited` ponctuelles préexistantes (`.top-nav`, `.github-btn`) sont
supprimées au profit de ce bloc consolidé.

---

## Accessibilité (WCAG 2.2)

Neutre, voire bénéfique : supprimer la distinction `:visited` ne réduit aucune information utile sur
de la navigation (l'état actif/courant reste porté par `.active` + `aria-current`). Aucun ratio de
contraste n'est dégradé — la couleur visitée devient **identique** à la couleur non-visitée déjà
validée. Sur les liens de **contenu**, où `:visited` peut aider l'orientation, la règle ne s'applique
pas (WCAG 1.4.1 — ne pas véhiculer l'information par la seule couleur reste de toute façon respecté
par les états `.active`/soulignement).

---

## Alternatives rejetées

- **Garder l'état `:visited` par défaut du navigateur** sur la navigation : teinte violette
  incohérente avec la marque, casse la hiérarchie — rejeté.
- **Limiter la correction au seul site web** (sans règle système) : reconduit la dérive dans les
  composants et les applications consommatrices — contraire à la demande explicite « au système
  complet ».
- **Neutraliser `:visited` globalement sur tout `<a>`** (y compris contenu) : prive les liens de
  contenu/archives d'un repère d'orientation parfois utile — trop large, rejeté au profit d'un
  périmètre « navigation ».

---

## Conséquences

- Nouvelle règle versionnée `.claude/rules/no-visited-nav.md`, applicable à tout agent et toute
  surface (site + composants + apps).
- `site/build.js` : neutralisation `:visited` **consolidée** sur 6 surfaces de navigation
  (`top-nav`, `sidebar`, `toc`, `footer-links`, `audit-footer-link`, boutons-icônes), via tokens
  sémantiques. Build : **662 défini · 177 référencé · 0 fantôme**.
- Les futurs composants exposant de la navigation (`agtc-link` en usage nav, `agtc-segmented`, futur
  `agtc-tabs`) devront neutraliser `:visited` dans leur shadow DOM selon la même règle.
- Aucun token ajouté ou modifié — décision purement de gouvernance/pattern.
