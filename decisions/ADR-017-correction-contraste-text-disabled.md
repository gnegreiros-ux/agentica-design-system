# ADR-017 — Correction du contraste de `text.disabled` et ajout de `background.hover`

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** token
> **Chemin logique:** decisions/ADR-017-correction-contraste-text-disabled.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, site/build.js, decisions/ADR-008-radix-colors.md, decisions/ADR-007-axe-core-accessibilite.md

---

## Contexte

L'audit WCAG 2.2 intégré au build a détecté deux types de non-conformités :

### 1. Valeur du token `text.disabled` inaccessible

Le token `semantic.color.text.disabled` référençait `{color.neutral.300}`, résolu en `#d9d9d9`.
Ce gris très clair produit un ratio de contraste de **1.57:1** sur fond blanc — bien en dessous
du seuil AA (4.5:1).

WCAG 1.4.3 exempte les composants UI inactifs du critère de contraste. Cependant, deux problèmes
se posaient :

- **Usage incorrect** : le token `text-disabled` était appliqué à des éléments non désactivés
  (labels de groupe dans la sidebar, tags de pipeline). L'exemption WCAG ne s'appliquait donc pas.
- **Valeur trop faible** : même pour du texte réellement désactivé, maintenir une lisibilité
  minimale est préférable par convention — notamment pour les utilisateurs avec déficience visuelle
  légère non couverte par les seuils WCAG.

### 2. Token `background.hover` manquant

Le fond au survol des lignes de tableau utilisait une valeur codée en dur (`#eff6ff`,
un bleu clair hors palette). Aucun token sémantique ne couvrait cet usage.

### 3. Incohérence structurelle préexistante (non résolue dans cet ADR)

`tokens/semantic.json` utilise une nomenclature Tailwind (`neutral.0`–`neutral.900`, `blue.700`),
tandis que `tokens/primitives.json` utilise la nomenclature Radix UI (`gray.1`–`gray.12`, `blue.1`–`blue.12`).
Les références de `semantic.json` ne se résolvent pas dans `primitives.json` — `site/build.js`
contourne ce problème avec des valeurs codées en dur. Cette incohérence est documentée mais
hors scope de cet ADR (voir section *Alternatives rejetées*).

---

## Décision

### Token `text.disabled`

Valeur changée de `{color.neutral.300}` → **`{color.neutral.500}`**

| | Avant | Après |
|---|---|---|
| Référence | `{color.neutral.300}` | `{color.neutral.500}` |
| Valeur résolue | `#d9d9d9` | `#767676` |
| Ratio sur blanc | 1.57:1 ❌ | 4.54:1 ✅ |
| WCAG 1.4.3 (texte normal) | Échec | Passe AA |

`neutral.500` correspond à la position médiane d'une échelle neutre (≈ Tailwind `#737373`),
ce qui est sémantiquement cohérent pour un texte réduit mais lisible.

L'intention du token est mise à jour pour documenter explicitement :
- la valeur résolue attendue (`#767676`)
- le ratio de contraste
- l'exemption WCAG 1.4.3 applicable aux UI inactives, maintenue accessible par convention

### Token `background.hover`

Ajout de `semantic.color.background.hover` → **`{color.neutral.50}`** (`#fafafa`)

Couvre le fond au survol des tableaux et listes sans recourir à une valeur codée en dur.
Remplace l'usage antérieur de `#eff6ff` (bleu clair hors palette) et de
`background.subtle` (#f0f0f0, trop contrasté pour un effet de survol discret).

### Usages incorrects de `text-disabled` corrigés

Les éléments non désactivés qui utilisaient `text-disabled` ont été basculés sur `text-secondary` :
- `.sidebar-label` (labels de groupe de navigation)
- `.pipeline-tag` (étiquettes de catégorie dans la section pipeline)

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Garder `#d9d9d9` et invoquer l'exemption WCAG 1.4.3** | L'exemption ne s'appliquait pas aux usages concrets (sidebar labels, pipeline tags), qui ne sont pas des UI inactives. Corriger uniquement les usages sans changer la valeur du token aurait laissé le token intrinsèquement risqué. |
| **Utiliser `{color.neutral.700}` (#646464) comme `text.disabled`** | Identique à `text-secondary`. Efface la distinction sémantique entre texte secondaire et texte désactivé. |
| **Résoudre l'incohérence structurelle Tailwind / Radix dans cet ADR** | Changement de périmètre beaucoup plus large : impacte toutes les références de `semantic.json` et nécessite une migration coordonnée de `build.js`, de `tokens.css` et de la documentation. Traité séparément. |
| **Ajouter un primitif `gray.10.5` (#767676) dans `primitives.json`** | Casse la cohérence de l'échelle Radix (pas de demi-steps). La valeur #767676 n'existe pas dans Radix UI et serait un écart difficile à justifier. |

---

## Conséquences

**Pour les agents IA :**
- `color.text.disabled` encode désormais une intention accessible par défaut
- L'intent mis à jour documente la valeur résolue et le ratio — un agent peut vérifier
  la conformité sans résoudre la chaîne de tokens

**Pour les composants :**
- Tout composant utilisant `var(--ds-semantic-color-text-disabled)` bénéficie
  automatiquement du contraste corrigé
- `var(--ds-semantic-color-background-hover)` est disponible pour les survols de lignes

**Incohérence structurelle restante :**
- `tokens/semantic.json` référence `{color.neutral.500}` qui ne se résout pas dans
  `tokens/primitives.json` (nomenclature incompatible)
- `site/build.js` continue de hardcoder les valeurs résolues
- Un ADR dédié à la migration vers une nomenclature unifiée est à créer

---

## Incidents ou déclencheurs

Détection lors de l'audit WCAG 2.2 automatique (`npm run build`) après déploiement
sur GitHub Pages. L'audit a signalé des paires de contraste sous le seuil 4.5:1
impliquant `text-disabled` sur des éléments non désactivés.
