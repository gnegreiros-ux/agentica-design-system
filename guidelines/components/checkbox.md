# Composant : Checkbox — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-01
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/checkbox.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-037-agtc-checkbox-implementation.md, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Permettre une sélection binaire **indépendante** — cocher/décocher une option, accepter une
condition, ou marquer une tâche comme faite.

**Ce composant n'est pas :**
- Un réglage à effet immédiat on/off (utiliser un futur `<agtc-toggle>` — cf. NN/g checkbox vs toggle)
- Un choix mutuellement exclusif dans une liste (utiliser un futur `<agtc-radio>`)
- Un bouton d'action (utiliser `<agtc-button>`)

---

## FORME — DÉCISION

**Carré uniquement.** NN/g recommande explicitement le carré pour une case à cocher ; le rond
signale conventionnellement un bouton radio. La référence ToDo (cercles) a été écartée au profit
de la convention d'usabilité. Voir ADR-037.

---

## PROPRIÉTÉS

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `label` | String | — | Libellé cliquable — fournir `label` **ou** du texte en slot |
| `checked` | Boolean | `false` | État coché |
| `indeterminate` | Boolean | `false` | État partiel (`aria-checked="mixed"`) — pour un parent « tout cocher » |
| `disabled` | Boolean | `false` | Désactivé — non interactif |
| `required` | Boolean | `false` | Obligatoire — `aria-required` |
| `name` | String | — | Nom du champ pour les formulaires |
| `value` | String | `'on'` | Valeur soumise quand coché |

---

## ÉVÉNEMENTS

| Événement | Détail | Déclenchement |
|-----------|--------|---------------|
| `agtc-change` | `{ checked, name, value }` | À chaque bascule (cocher/décocher) |

---

## TOKENS UTILISÉS

| Propriété | Token composant |
|-----------|-----------------|
| Fond (case vide) | `component.checkbox.default.background` |
| Bordure | `component.checkbox.default.border` |
| Bordure survol | `component.checkbox.default.border-hover` |
| Bordure focus | `component.checkbox.default.border-focus` |
| Remplissage coché | `component.checkbox.default.fill` |
| Remplissage coché survol | `component.checkbox.default.fill-hover` |
| Coche / tiret | `component.checkbox.default.check` |
| Libellé | `component.checkbox.default.label` |
| Rayon | `component.checkbox.default.radius` |

> Taille de la case : `--agtc-semantic-icon-size-control` (20px). Écart entre case et texte :
> `--agtc-semantic-space-control-gap`.

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Élément accessible | `<input type="checkbox">` natif (rôle, état, clavier) |
| Nom accessible | `<label>` implicite enveloppant — texte du libellé |
| Focus visible | `outline` sur la case via `:focus-visible` |
| Cible tactile | ≥ 24px de haut (WCAG 2.5.8) |
| État indéterminé | propriété DOM `indeterminate` → `aria-checked="mixed"` |
| Contraste case/coche | ≥ 3:1 (composant UI, WCAG 1.4.11) |

---

## COMPORTEMENTS ET ÉTATS

| État | Comportement |
|------|-------------|
| Default | Carré vide, bordure default, fond surface |
| Hover | Bordure teal (border-hover) |
| Focus | Outline teal (border-focus) — clavier |
| Checked | Remplissage teal + coche blanche |
| Indeterminate | Remplissage teal + tiret blanc |
| Disabled | Fond subtle, non interactif, libellé atténué |

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| Case ronde | Convention radio — confusion (NN/g) |
| Case pré-cochée pour un consentement | Dark pattern (IxDF / RGPD) |
| Libellé en négation (« Ne pas m'envoyer… ») | Ambiguïté coché/décoché (NN/g) |
| Checkbox pour un réglage à effet immédiat | Préférer un toggle (NN/g) |
| Valeur ou taille codée en dur | Contourne les tokens |

---

## PATTERNS UX DE RÉFÉRENCE

> Patterns approuvés par le Design System Lead via le workflow `ux-pattern-review`
> (voir `.claude/rules/ux-patterns-sources.md` et ADR-036). Décision : **tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Checkbox (pas toggle) pour un item indépendant | [NN/g — checkbox vs toggle](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Sélection 0–N indépendante, pas un réglage à effet immédiat |
| **Forme carrée** (le rond signale un radio) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Convention d'usabilité ; écart assumé vs la maquette ToDo ronde |
| Label cliquable (case **ou** texte) — loi de Fitts | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `<label>` implicite englobant case + texte |
| Cible tactile ≥ 24×24px | [IxDF — touch targets](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `.root` min-height 24px (WCAG 2.5.8) |
| États visibles complets (default/hover/focus/checked/disabled) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Affordance et retour immédiat |
| Libellé en formulation positive (pas de négation) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Règle d'écriture du `label` (anti-pattern documenté) |
| Pas de pré-cochage de consentement (anti-dark-pattern) | [IxDF — deceptive patterns](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `checked` à `false` par défaut |
| Sémantique ARIA native (`role=checkbox`, `aria-checked`) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | `<input type="checkbox">` natif, `indeterminate` → `mixed` |

---

## IMPLÉMENTATION

### Web Component (Lit)
```html
<!-- Basique -->
<agtc-checkbox label="Recevoir la newsletter" name="newsletter"></agtc-checkbox>

<!-- Cochée par défaut -->
<agtc-checkbox label="Activer les notifications" checked></agtc-checkbox>

<!-- Parent d'un groupe « tout cocher » -->
<agtc-checkbox label="Tout sélectionner" indeterminate></agtc-checkbox>

<!-- Désactivée -->
<agtc-checkbox label="Option indisponible" disabled></agtc-checkbox>

<!-- Texte en slot plutôt que via l'attribut label -->
<agtc-checkbox>J'accepte les <a href="/cgu">conditions</a></agtc-checkbox>
```

### Écoute de l'événement
```javascript
document.querySelector('agtc-checkbox')
  .addEventListener('agtc-change', (e) => {
    console.log(e.detail); // { checked, name, value }
  });
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'une variante de forme (ex. rond) | Principal Designer (écart NN/g à justifier) |
| Modification token de composant | Principal Designer |
| Changement de comportement | Design system team |
| Correction bug accessibilité | Review design system team |
