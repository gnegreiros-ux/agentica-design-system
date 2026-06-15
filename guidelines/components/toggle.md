# Composant : Toggle — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-01
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/toggle.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-039-agtc-toggle-implementation.md, guidelines/components/checkbox.md

---

## INTENTION

**Pourquoi ce composant existe :**
Activer/désactiver un réglage binaire avec **effet immédiat** — le changement s'applique
instantanément, sans bouton « Enregistrer ».

**Ce composant n'est pas :**
- Une sélection de formulaire validée à la soumission (utiliser `<agtc-checkbox>`)
- Un choix exclusif parmi plusieurs (utiliser `<agtc-radio>`)

---

## CHECKBOX vs TOGGLE — la règle

| | Checkbox | Toggle |
|--|----------|--------|
| Effet | À la soumission | **Immédiat** |
| Usage | Sélection 0–N dans un formulaire | Réglage on/off instantané |
| Exemple | « J'accepte les CGU » | « Mode sombre » |

> Ne jamais mélanger un toggle (effet immédiat) avec des champs soumis ensemble — cela crée
> une ambiguïté sur le moment où le changement s'applique (NN/g).

---

## PROPRIÉTÉS

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `label` | String | — | Libellé concis décrivant l'état « on » — ou texte en slot |
| `checked` | Boolean | `false` | État activé (on) |
| `disabled` | Boolean | `false` | Désactivé |
| `name` | String | — | Nom du champ pour les formulaires |
| `value` | String | `'on'` | Valeur soumise quand activé |

---

## ÉVÉNEMENTS

| Événement | Détail | Déclenchement |
|-----------|--------|---------------|
| `agtc-change` | `{ checked, name, value }` | Immédiatement à la bascule |

---

## TOKENS UTILISÉS

| Propriété | Token composant |
|-----------|-----------------|
| Piste off | `component.toggle.default.track-off` |
| Piste off survol | `component.toggle.default.track-off-hover` |
| Piste on | `component.toggle.default.track-on` |
| Piste on survol | `component.toggle.default.track-on-hover` |
| Curseur | `component.toggle.default.knob` |
| Bordure focus | `component.toggle.default.border-focus` |
| Libellé | `component.toggle.default.label` |

> `track-off` est un proxy vers `primitive.color.gray.9` (#8d8d8d) : aucun token sémantique
> de gris neutre-médium n'existe encore. Choisi pour un contraste ≥ 3:1 du curseur blanc sur la
> piste (WCAG 1.4.11). Voir ADR-039.

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Élément accessible | `<input type="checkbox" role="switch">` natif |
| État sans couleur seule | Signalé par la **position du curseur** (WCAG 1.4.1) |
| Contraste curseur/piste | ≥ 3:1 dans les deux états (WCAG 1.4.11) — curseur blanc + ombre |
| Focus visible | `outline` sur la piste via `:focus-visible` |
| Cible tactile | ≥ 24px de haut (WCAG 2.5.8) |
| Nom accessible | `<label>` implicite englobant |

---

## COMPORTEMENTS ET ÉTATS

| État | Comportement |
|------|-------------|
| Off | Piste grise, curseur à gauche |
| On | Piste teal, curseur à droite |
| Hover | Piste assombrie |
| Focus | Outline teal — clavier (Espace bascule) |
| Disabled | Opacité réduite, non interactif |

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| Toggle dans un formulaire soumis | Ambiguïté effet immédiat vs submit (NN/g) |
| État signalé par la couleur seule | Échoue WCAG 1.4.1 |
| Libellé interrogatif (« Voulez-vous… ? ») | Préférer un libellé concis frontload (NN/g) |
| Toggle pour un choix non binaire | Utiliser radio/checkbox |
| Couleur ou taille en dur | Contourne les tokens |

---

## Patterns UX de référence

> Patterns approuvés par le Design System Lead via le workflow `ux-pattern-review`
> (voir `.claude/rules/ux-patterns-sources.md` et ADR-036). Décision : **tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| `role="switch"` + `aria-checked` | [NN/g — toggle switch](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | `<input type="checkbox" role="switch">` natif |
| **Effet immédiat** (pas de submit) | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | `agtc-change` émis à la bascule |
| **État par position du curseur** (pas couleur seule) | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Curseur glisse gauche/droite (WCAG 1.4.1) |
| Curseur délimité (contraste ≥ 3:1) | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Blanc + ombre, piste gray.9 (WCAG 1.4.11) |
| Label concis décrivant l'état « on », frontload | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Règle d'écriture du `label` |
| Label cliquable + cible ≥ 24px | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `<label>` englobant, `min-height: 24px` |
| Binaire uniquement | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Sinon radio/checkbox |

---

## IMPLÉMENTATION

```html
<!-- Basique -->
<agtc-toggle label="Notifications par e-mail" name="email-notif"></agtc-toggle>

<!-- Activé -->
<agtc-toggle label="Mode sombre" checked></agtc-toggle>

<!-- Désactivé -->
<agtc-toggle label="Synchronisation" disabled></agtc-toggle>
```

```javascript
document.querySelector('agtc-toggle')
  .addEventListener('agtc-change', (e) => {
    // Effet immédiat — appliquer le changement maintenant
    console.log(e.detail); // { checked, name, value }
  });
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Modification token de composant | Principal Designer |
| Création d'un token sémantique neutre-track | Design System Lead |
| Correction bug accessibilité | Review design system team |
