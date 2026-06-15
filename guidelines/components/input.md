# Composant : Input — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-05-31
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/input.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Permettre à l'utilisateur de saisir des données textuelles ou structurées dans un formulaire.

**Ce composant n'est pas :**
- Un sélecteur (utiliser `<agtc-select>`)
- Une zone de texte longue (utiliser `<agtc-textarea>`)
- Un bouton (utiliser `<agtc-button>`)

---

## TYPES SUPPORTÉS

| Type | Usage |
|------|-------|
| `text` | Saisie libre (défaut) |
| `email` | Adresse e-mail avec validation native |
| `password` | Mot de passe avec toggle show/hide intégré |
| `number` | Valeur numérique (spinners natifs supprimés) |
| `search` | Champ de recherche |
| `tel` | Numéro de téléphone |
| `url` | URL avec validation native |

---

## PROPRIÉTÉS

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `label` | String | — | **Obligatoire** — libellé accessible (WCAG 1.3.1) |
| `type` | String | `text` | Type HTML de l'input |
| `name` | String | — | Nom du champ pour les formulaires |
| `value` | String | `''` | Valeur courante |
| `placeholder` | String | — | Texte indicatif — jamais seul comme étiquette |
| `helper-text` | String | — | Aide contextuelle sous le champ |
| `error-message` | String | — | Message d'erreur (visible si `invalid`) |
| `invalid` | Boolean | `false` | État d'erreur — bordure rouge + role=alert |
| `disabled` | Boolean | `false` | Désactivé — fond subtle, non interactif |
| `readonly` | Boolean | `false` | Lecture seule — fond transparent |
| `required` | Boolean | `false` | Obligatoire — marqueur `*` + aria-required |
| `icon` | String | — | Icône Lucide en prefix |
| `icon-suffix` | String | — | Icône Lucide en suffix |
| `maxlength` | Number | — | Longueur maximale |
| `autocomplete` | String | — | Hint autocomplete HTML |

---

## ÉVÉNEMENTS

| Événement | Détail | Déclenchement |
|-----------|--------|---------------|
| `agtc-input` | `{ value, name }` | À chaque frappe |
| `agtc-change` | `{ value, name }` | À la perte de focus |

---

## TOKENS UTILISÉS

| Propriété | Token composant |
|-----------|-----------------|
| Fond | `component.input.default.background` |
| Bordure | `component.input.default.border` |
| Bordure focus | `component.input.default.border-focus` |
| Bordure erreur | `component.input.default.border-error` |
| Texte | `component.input.default.text` |
| Placeholder | `component.input.default.placeholder` |
| Rayon | `component.input.default.radius` |
| Padding X | `component.input.default.padding-x` |
| Padding Y | `component.input.default.padding-y` |

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Label obligatoire | WCAG 1.3.1 — jamais placeholder seul |
| Contraste texte | 4.5:1 minimum (WCAG AA) |
| Focus visible | `outline` sur le wrapper `.control` |
| État invalide | `aria-invalid="true"` + `role="alert"` sur le message |
| Champ requis | `aria-required="true"` + marqueur visuel `*` |
| Password toggle | `aria-label` dynamique (afficher/masquer) |
| Descriptions liées | `aria-describedby` sur helper-text et error-message |

---

## COMPORTEMENTS ET ÉTATS

| État | Comportement |
|------|-------------|
| Default | Bordure default, fond surface |
| Focus | Bordure + outline teal (border-focus) |
| Invalid | Bordure rouge, message d'erreur avec role=alert |
| Disabled | Fond subtle, pointer-events none |
| Readonly | Fond transparent, non éditable |
| Password | Bouton show/hide intégré, aria-label dynamique |

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| Input sans `label` | Inaccessible (WCAG 1.3.1) |
| Placeholder comme seule étiquette | Disparaît à la saisie, échoue WCAG |
| Valeur `invalid` sans `error-message` | Erreur signalée sans explication |
| Style inline sur le champ | Contourne les tokens de composant |
| Type non supporté | Comportement indéfini |

---

## Patterns UX de référence

> Patterns approuvés par le Design System Lead via le workflow `ux-pattern-review`
> (voir `.claude/rules/ux-patterns-sources.md` et ADR-036). Décision : **tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Label visible toujours présent (jamais placeholder seul) | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | WCAG 1.3.1 — `label` obligatoire |
| **Validation à la perte de focus (`onBlur`)** par défaut | [NN/g — Forms](https://www.nngroup.com/articles/design-pattern-guidelines/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Ne pas signaler l'erreur pendant la frappe initiale |
| **Re-validation à la frappe une fois le champ en erreur** | [NN/g — How to Report Errors in Forms](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Récompenser la correction immédiatement |
| Erreur inline sous le champ + `role="alert"` | [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Erreur localisée et annoncée aux AT |
| Message d'erreur constructif (dit quoi corriger) | [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Règle d'écriture du `error-message` |
| Help text persistant, distinct de l'erreur, `aria-describedby` | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `helper-text` lié par `aria-describedby` |
| Required marker `*` + `aria-required` | [NN/g — Forms](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Champ obligatoire signalé visuellement et aux AT |
| Forgiving format (tolérer espaces/formats : `tel`, `number`) | [IxDF — forgiving formats](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Réduire les erreurs de saisie |
| Éviter les hostile patterns (pas de blocage agressif, pas d'effacement du champ en erreur) | [NN/g — Hostile Patterns in Error Messages](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Anti-dark-pattern |

**Contrat de validation (synthèse des patterns 2 + 3) :** valider à `onBlur`, puis re-valider à
chaque frappe tant que le champ est en état d'erreur. Ne jamais valider à la première frappe.

---

## IMPLÉMENTATION

### Web Component (Lit)
```html
<!-- Champ texte basique -->
<agtc-input label="Nom complet" name="fullname"></agtc-input>

<!-- Avec aide contextuelle -->
<agtc-input
  label="Adresse e-mail"
  type="email"
  name="email"
  helper-text="Utilisée pour les notifications uniquement"
></agtc-input>

<!-- État d'erreur -->
<agtc-input
  label="Identifiant"
  invalid
  error-message="Cet identifiant n'existe pas"
></agtc-input>

<!-- Mot de passe avec toggle intégré -->
<agtc-input
  label="Mot de passe"
  type="password"
  name="password"
  required
></agtc-input>

<!-- Avec icône prefix -->
<agtc-input
  label="Rechercher"
  type="search"
  icon="search"
  placeholder="Rechercher un composant…"
></agtc-input>

<!-- Désactivé -->
<agtc-input label="Code postal" disabled value="75001"></agtc-input>
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'un nouveau type | Principal Designer + Tech Lead |
| Modification token de composant | Principal Designer |
| Changement comportement validation | Design system team |
| Correction bug accessibilité | Review design system team |
