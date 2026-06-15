# Composant : Radio — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-01
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/radio.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-038-agtc-radio-implementation.md, guidelines/components/checkbox.md

---

## INTENTION

**Pourquoi ce composant existe :**
Permettre de choisir **exactement une** option dans un ensemble mutuellement exclusif.

**Ce composant n'est pas :**
- Une sélection multiple indépendante (utiliser `<agtc-checkbox>`)
- Un réglage on/off à effet immédiat (utiliser `<agtc-toggle>`)
- Un sélecteur pour de nombreuses options (préférer un futur `<agtc-select>` au-delà de ~7 choix)

---

## DEUX COMPOSANTS

| Élément | Rôle |
|---------|------|
| `<agtc-radio-group>` | Conteneur — `role="radiogroup"`, gère exclusivité, focus roving, clavier, événement |
| `<agtc-radio>` | Un choix — `role="radio"`, forme ronde |

> Un `<agtc-radio>` **doit** vivre dans un `<agtc-radio-group>` : des `<input type="radio">`
> dans des shadow DOM séparés ne forment pas un groupe natif (voir ADR-038).

---

## FORME — DÉCISION

**Ronde.** NN/g : le rond est la convention du bouton radio ; le carré signale une checkbox.

---

## PROPRIÉTÉS

### `<agtc-radio-group>`
| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `value` | String | `''` | Valeur du radio sélectionné |
| `name` | String | — | Nom du groupe pour les formulaires |
| `label` | String | — | Libellé accessible du groupe (`aria-label`) |
| `disabled` | Boolean | `false` | Désactive le groupe |

### `<agtc-radio>`
| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `value` | String | `''` | Valeur de cette option |
| `label` | String | — | Libellé — ou texte en slot |
| `checked` | Boolean | `false` | Géré par le groupe (lecture) |
| `disabled` | Boolean | `false` | Option désactivée |

---

## ÉVÉNEMENTS

| Événement | Émis par | Détail | Déclenchement |
|-----------|----------|--------|---------------|
| `agtc-change` | `agtc-radio-group` | `{ value, name }` | À chaque changement de sélection |

---

## NAVIGATION CLAVIER

| Touche | Action |
|--------|--------|
| `Tab` | Entre/sort du groupe (un seul radio tabbable — focus roving) |
| `↓` / `→` | Option suivante (sélectionne, boucle) |
| `↑` / `←` | Option précédente (sélectionne, boucle) |
| `Espace` | Sélectionne l'option focalisée (`Entrée` réservé à la soumission de formulaire) |

---

## TOKENS UTILISÉS

| Propriété | Token composant |
|-----------|-----------------|
| Fond | `component.radio.default.background` |
| Bordure | `component.radio.default.border` |
| Bordure survol | `component.radio.default.border-hover` |
| Bordure focus | `component.radio.default.border-focus` |
| Pastille sélectionnée | `component.radio.default.fill` |
| Libellé | `component.radio.default.label` |

> Taille : `--agtc-semantic-icon-size-control` (20px). Forme ronde : `border-radius: 9999px`.

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Groupe | `role="radiogroup"` + `aria-label` |
| Option | `role="radio"` + `aria-checked` |
| Focus roving | Un seul radio `tabindex="0"` à la fois |
| Navigation | Flèches sélectionnent (comportement radio natif) |
| Cible tactile | ≥ 24px de haut (WCAG 2.5.8) |
| Label cliquable | Toute l'option (pastille + texte) |

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| Forme carrée | Convention checkbox — confusion (NN/g) |
| `<agtc-radio>` hors d'un groupe | Pas d'exclusivité ni de clavier |
| Sélection multiple attendue | Utiliser des checkboxes |
| Aucun défaut quand un défaut sensé existe | Étape inutile pour l'utilisateur (NN/g) |
| Défaut présomptueux (genre, civilité) | Laisser vide (NN/g, exception) |

---

## Patterns UX de référence

> Patterns approuvés par le Design System Lead via le workflow `ux-pattern-review`
> (voir `.claude/rules/ux-patterns-sources.md` et ADR-036). Décision : **tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| **Forme ronde** (le carré = checkbox) | [NN/g — checkboxes vs radio](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | `border-radius: 9999px` |
| Sélection mutuellement exclusive (exactement 1) | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Groupe gère l'exclusivité |
| Pré-sélectionner un défaut sensé (sauf exceptions) | [NN/g — radio default selection](https://www.nngroup.com/articles/radio-buttons-default-selection/) | ✅ | `value` du groupe — guidance d'usage |
| Empilement vertical, une option par ligne | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Recommandation de mise en page |
| Label cliquable (pastille **ou** texte) — Fitts | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Toute l'option est cliquable |
| Cible tactile ≥ 24×24px | [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `min-height: 24px` (WCAG 2.5.8) |
| Navigation flèches = sélection (radio natif) | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Géré par le groupe (WAI-ARIA radiogroup) |
| États visibles complets | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | default/hover/focus/selected/disabled |

---

## IMPLÉMENTATION

```html
<!-- Groupe avec défaut sélectionné -->
<agtc-radio-group name="plan" value="pro" label="Formule">
  <agtc-radio value="free">Gratuit</agtc-radio>
  <agtc-radio value="pro">Pro</agtc-radio>
  <agtc-radio value="team">Équipe</agtc-radio>
</agtc-radio-group>

<!-- Sans pré-sélection -->
<agtc-radio-group name="ship" label="Livraison">
  <agtc-radio value="standard">Standard</agtc-radio>
  <agtc-radio value="express">Express</agtc-radio>
</agtc-radio-group>
```

```javascript
document.querySelector('agtc-radio-group')
  .addEventListener('agtc-change', (e) => console.log(e.detail)); // { value, name }
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Modification token de composant | Principal Designer |
| Changement de comportement clavier | Design system team |
| Correction bug accessibilité | Review design system team |
