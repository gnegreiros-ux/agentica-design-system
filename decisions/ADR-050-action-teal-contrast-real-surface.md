# ADR-050 — Teal d'action conforme sur le fond réel : teal.11 `#008573` → `#007a68`

> **Date :** 2026-06-06
> **Statut :** ✅ Actif
> **Décideurs :** Principal Designer (valeur de jeton primitif)
> **Type:** contract
> **Chemin logique:** decisions/ADR-050-action-teal-contrast-real-surface.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-048-action-teal-wcag-contrast.md, tokens/primitives.json, tokens/semantic.json, .claude/skills/pipelines/axe-core.md, guidelines/components/button.md

> **English summary:** Corrects ADR-048's teal.11 value: it was validated against pure white
> (#ffffff), but the real page background is `#fcfcfc`, causing the first axe-core run to surface
> 76 contrast violations. Retunes `primitive.color.teal.11` from `#008573` to `#007a68`, restoring
> AA compliance (5.14:1) on the actual background with a comfortable safety margin.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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

`teal.11` n'est consommé que par deux rôles sémantiques — `action.primary` et `border.focus` — qui
héritent automatiquement de la nouvelle valeur. Aucun autre consommateur (rayon d'impact contenu).

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
