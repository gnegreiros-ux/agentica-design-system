# ADR-048 — Teal interactif accessible : `action.primary` teal.9 → teal.11

> **Date :** 2026-06-05
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-048-action-teal-wcag-contrast.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, decisions/ADR-024-brand-palette-migration.md, guidelines/components/button.md, site/build.js

---

## Contexte

Le redesign du site (mise en évidence du CTA « Démarrer » comme bouton primaire) a révélé une
**non-conformité WCAG AA préexistante et systémique** : la couleur d'action `action.primary` était
`teal.9` (`#12a594`), et le bouton primaire pose du **texte blanc** dessus.

| Usage de teal.9 | Paire | Ratio | AA texte (4.5:1) |
|------------------|-------|-------|------------------|
| Bouton primaire (CTA hero, nav-cta) | blanc sur teal.9 | **3.07:1** | ❌ échec |
| Survol bouton primaire | blanc sur teal.10 (`#0d9b8a`) | **3.46:1** | ❌ échec |
| Lien actif (nav / TOC / sidebar) | teal.9 en **texte** sur blanc | **3.07:1** | ❌ échec |
| Anneau de focus (`border.focus`) | teal.9 sur blanc | 3.07:1 | ✅ (non-textuel, 3:1 requis) |

> Le contraste étant **symétrique**, l'affirmation de l'**ADR-024 (ligne 109)** — « teal.9 = 4.6:1
> sur blanc » — est **factuellement erronée** : la valeur 4.6:1 correspond à **teal.11**
> (`#008573`), pas à teal.9. Le contrat `guidelines/components/button.md` exige pourtant « 4.5:1
> minimum ». Le bouton phare violait donc son propre contrat.

---

## Décision

Séparer le **teal d'identité (brand)** du **teal interactif (action)**, et porter ce dernier à un
échelon conforme AA.

| Jeton sémantique | Avant | Après | Texte blanc / sur blanc |
|------------------|-------|-------|--------------------------|
| `color.action.primary` | teal.9 `#12a594` | **teal.11 `#008573`** | **4.56:1** ✅ AA |
| `color.action.primary-hover` | teal.10 `#0d9b8a` | **teal.12 `#0d3d38`** | 12.06:1 ✅ (assombrissement) |
| `color.border.focus` | teal.9 | **teal.11 `#008573`** | 4.56:1 ✅ (unifié avec l'action) |
| `color.brand.primary` | teal.9 `#12a594` | **teal.9 (inchangé)** | identité / logotype |

### Principe : deux teals, deux rôles

- **`brand.primary` = teal.9** — couleur d'**identité**. Correspond au logo SVG (`#12A594`, codé en
  dur) et au `theme_color` du manifest. Usage logotype/marque, exempt de contraste (WCAG 1.4.3).
- **`action.primary` = teal.11** — couleur d'**affordance interactive** (boutons, liens actifs,
  focus). Doit être accessible : texte blanc dessus **et** teal en texte sur blanc = 4.56:1.

> Cette séparation résout la tension de fond : une **seule** valeur ne pouvait pas être à la fois la
> teinte de marque vive (teal.9) **et** un fond/texte d'action accessible. ADR-024 les avait fusionnées.

---

## Accessibilité (WCAG 2.2)

| Élément | Après | Verdict |
|---------|-------|---------|
| Texte bouton primaire (blanc / teal.11) | 4.56:1 | ✅ AA |
| Survol bouton primaire (blanc / teal.12) | 12.06:1 | ✅ AAA |
| Lien actif (teal.11 texte / blanc) | 4.56:1 | ✅ AA |
| Anneau de focus (teal.11 / blanc, non-textuel) | 4.56:1 | ✅ (≥ 3:1) |
| Mot-symbole « Agentica » (teal.9, logotype) | — | exempt (WCAG 1.4.3) |

Le survol passe par un **assombrissement marqué** (teal.11 → teal.12) : seul échelon teal plus
sombre garantissant 4.5:1 avec du texte blanc. Direction correcte (s'assombrit au survol) ; le design
pourra ultérieurement introduire un échelon intermédiaire si une transition plus douce est souhaitée.

---

## Périmètre

| Inclus | Exclu |
|--------|-------|
| `action.primary`, `action.primary-hover`, `border.focus` → teal interactif accessible | `brand.primary` (identité, reste teal.9) |
| Mise à jour de l'affichage de code du token dans `site/build.js` (`#12A594` → `#008573`) | Logo SVG et `manifest.theme_color` (identité, restent `#12A594`) |
| Correction de l'erreur de contraste de l'ADR-024 (documentée ici) | Diagramme pédagogique pipeline (`blue.11`/`#0d74ce`, illustratif — hors sujet) |

---

## Alternatives rejetées

- **Garder teal.9, passer le texte du bouton en sombre (gray.12)** : 5.30:1 ✅ pour le bouton, mais
  **ne corrige pas** les liens actifs (teal.9 en texte sur blanc reste 3.07:1) et donne une allure
  inhabituelle (texte foncé sur teal vif). Fix partiel — rejeté.
- **Déplacer aussi `brand.primary` vers teal.11** : désaligne la marque du logo SVG (`#12A594`) —
  rejeté ; l'identité doit rester fidèle au mot-symbole.
- **Ne rien changer, documenter la dette** : contraire à la valeur non négociable d'accessibilité
  (WCAG AA) et au contrat explicite du bouton (4.5:1) — rejeté.

---

## Conséquences

- Tous les boutons primaires, liens actifs et anneaux de focus du système passent **WCAG AA**.
  Build : **662 défini · 177 référencé · 0 fantôme**.
- Le système distingue désormais **teal d'identité** (teal.9) et **teal d'action** (teal.11) — base
  d'architecture plus saine, réutilisable.
- `guidelines/components/button.md` (« 4.5:1 minimum ») est désormais **réellement** satisfait.
- L'erreur de contraste de l'ADR-024 est corrigée et tracée ici (les ADR sont immuables ; cet ADR
  fait foi sur la valeur de `action.primary`).
- Gouvernance : changement de **jetons sémantiques** (action/border) — approbation Design System
  Lead. Aucun primitif ajouté, aucun jeton de composant modifié, aucune valeur en dur introduite.
