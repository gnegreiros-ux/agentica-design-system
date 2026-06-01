# ADR-033 — Implémentation de `agtc-input`

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-033-agtc-input-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/development.md
> **Relations:** decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-002-lit-web-components.md, tokens/component.json

---

## Contexte

`agtc-input` est le deuxième composant du système. Il couvre la saisie de texte
dans les formulaires — le point d'entrée le plus fréquent des données utilisateur.

Trois contraintes ont guidé les décisions :

1. **Accessibilité** — un champ de saisie sans label visible est inaccessible
   (WCAG 1.3.1). Chaque état (erreur, désactivé, lecture seule) doit être
   communiqué à l'arbre d'accessibilité, pas seulement visuellement.

2. **Shadow DOM** — l'association `<label for="id">` ne traverse pas les
   frontières Shadow DOM. L'implémentation doit contourner cette limite.

3. **Cohérence avec `agtc-button`** — même approche icône hybride (propriété +
   slot), mêmes conventions d'événements, même structure de tokens.

---

## Décisions

### Décision 1 — Label et input colocalisés dans le Shadow DOM

**Problème :** `<label for="id">` externe ne peut pas pointer vers un `<input>`
dans le Shadow DOM.

**Décision :** Le label est rendu à l'intérieur du Shadow DOM avec un `for`
pointant vers l'`id` interne de l'`<input>`. Un compteur statique garantit
l'unicité des ids entre instances.

**Alternative rejetée :** `aria-label` sur l'input à la place du label visible.
Rejeté : viole WCAG 1.3.1 (le label doit être persistant et visible, pas seulement
déclaré pour les AT).

---

### Décision 2 — Focus ring sur le wrapper `.control`, pas sur l'input

**Problème :** L'input natif a `outline: none` pour permettre un style custom.
Le focus doit rester visible (WCAG 2.4.7).

**Décision :** Le wrapper `.control` porte le focus ring via `:focus-within`.
`outline: 2.5px solid` + `outline-offset: 2px` — identique à `agtc-button`.

**Justification :** Le focus ring sur le wrapper est visuellement plus propre
(encadre l'ensemble du contrôle incluant les icônes) et reste WCAG conforme
car l'indicateur de focus est clairement visible.

---

### Décision 3 — `aria-describedby` pour helper-text et error-message

Les ids `{_id}-helper` et `{_id}-error` sont toujours présents dans le DOM.
`aria-describedby` est construit dynamiquement : seuls les ids pertinents
sont inclus selon l'état du composant.

Le message d'erreur porte `role="alert"` pour annoncer l'erreur aux lecteurs
d'écran dès qu'elle apparaît, sans nécessiter de navigation vers l'élément.

---

### Décision 4 — Toggle show/hide natif pour `type="password"`

Un bouton interne est rendu automatiquement quand `type="password"`. Il bascule
l'attribut `type` de l'input entre `password` et `text`.

**Justification :** Permettre à l'utilisateur de vérifier sa saisie est une
exigence d'accessibilité (évite les erreurs sur les mots de passe masqués).
L'aria-label du bouton bascule entre "Afficher le mot de passe" et
"Masquer le mot de passe".

Le slot `suffix` reste disponible pour la composition libre si le consommateur
veut remplacer le toggle natif.

---

### Décision 5 — Directive `live()` pour la synchronisation de valeur

L'input utilise `.value="${live(this.value)}"` pour synchroniser la valeur
de la propriété Lit avec la valeur native de l'input lors des re-renders.

Sans `live()`, Lit ne met pas à jour la valeur native si l'utilisateur a
commencé à taper (DOM drift). `live()` compare toujours contre la valeur
DOM actuelle, garantissant la cohérence.

---

### Décision 6 — Suppression des spinners natifs sur `type="number"`

Les spinners CSS natifs (`-webkit-inner-spin-button`) sont supprimés.
Le contrôle de la valeur numérique se fait via clavier (`↑`/`↓`) et saisie directe.

**Justification :** Les spinners natifs sont visuellement incohérents entre
navigateurs et ne peuvent pas être stylés avec les tokens du système.

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036). Décision du
> Design System Lead : **tous les patterns approuvés**. Détail et liens dans
> `guidelines/components/input.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Validation à `onBlur`, re-validation à la frappe une fois en erreur | NN/g — How to Report Errors in Forms |
| Erreur inline + `role="alert"` | NN/g — Error-Message Guidelines |
| Message d'erreur constructif | NN/g — Error-Message Guidelines |
| Help text persistant via `aria-describedby` | NN/g |
| Required marker `*` + `aria-required` | NN/g — Forms |
| Forgiving format (`tel`/`number`) | IxDF — forgiving formats |
| Label visible toujours présent | NN/g |
| Anti hostile patterns (pas d'effacement du champ en erreur) | NN/g — Hostile Patterns in Error Messages |

---

## Périmètre de la version 1.0

| Inclus | Exclu (version future) |
|--------|------------------------|
| 7 types natifs | `type="date"`, `type="file"` |
| États : default / focus / invalid / disabled / readonly | État success (validation positive) |
| Icônes prefix/suffix (hybride prop+slot) | Compteur de caractères |
| Toggle password intégré | Suggestions / autocomplete custom |
| helper-text + error-message | Champ multiligne (`agtc-textarea`) |

---

## Tokens utilisés

| Token | Usage |
|-------|-------|
| `--agtc-input-default-*` | Tokens composant compilés depuis `tokens/component.json` |
| `--agtc-semantic-color-feedback-danger` | Couleur message d'erreur |
| `--agtc-semantic-color-background-subtle` | Fond état disabled |
| `--agtc-semantic-color-text-disabled` | Texte état disabled |
| `--agtc-semantic-color-text-secondary` | Helper text + icônes |
| `--agtc-semantic-typography-body-*` | Typographie de la valeur saisie |
| `--agtc-semantic-typography-label-*` | Typographie du label, helper, erreur |
