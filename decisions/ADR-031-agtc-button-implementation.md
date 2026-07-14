# ADR-031 — agtc-button: Lit Web Component implementation

**Date:** 2026-05-30
**Status:** Accepted
**Decision-makers:** Guilherme Negreiros
**Scope:** `agtc-button` component — implementation contract

---

## Reference UX patterns applied

> Added on 2026-06-01 via the `ux-pattern-review` workflow (ADR-036). Decision: **all approved**.
> Details and links: `guidelines/components/button.md` § REFERENCE UX PATTERNS.

| Pattern | Source |
|---------|--------|
| A single primary action per context | IxDF — clear primary action |
| Explicit confirmation for `critical` | NN/g — error prevention |
| Width preserved during `loading` | Smashing |
| Never disable without stating why | Smashing — hidden vs disabled |
| Label describing the consequence | NN/g |

---

## Context

The design system has a complete button component contract (`tokens/component.json`,
`guidelines/components/button.md`, `.claude/rules/components/button.md`). This ADR documents
the technical decisions made to turn that contract into a functional Lit Web Component.

---

## Decisions

### 1. Confirmation pattern for the `critical` variant

**Problem:** The absolute rule requires confirmation before any critical action
(`requiresConfirmation: true` in the token). How do we implement this in a Web Component
without depending on an external modal system?

**Decision: inline double-click with automatic reset.**

```
1st click → _confirming = true → agtc-confirm-request event → label becomes "Confirm?"
  ├─ 2nd click  → action confirmed, agtc-confirm + agtc-click events → reset
  ├─ blur       → reset (the user left the button)
  ├─ Escape     → reset (the user explicitly cancels)
  └─ 3s timeout → automatic reset (prevents "zombie" confirmations)
```

**Reason:** A 100% self-contained solution, with no external dependency. The `critical`
variant always enforces this pattern — it isn't conditional on an attribute. The token
`requiresConfirmation: true` is a governance contract read by agents, not
a runtime flag.

**Exposed events:**
- `agtc-confirm-request` — 1st click, so the host can display an external UI
- `agtc-confirm` — actual confirmation (2nd click)
- `agtc-click` — any confirmed click (all variants)

### 2. Width preservation during loading

**Problem:** The contract rule states "Width preserved during async states (loading)."
A spinner replacing the text would change the button's size.

**Decision: `visibility: hidden` on `.label` + spinner with `position: absolute; inset: 0; margin: auto`.**

```css
button.loading .label { visibility: hidden; }   /* visually hides it, preserves the layout */
.spinner { position: absolute; inset: 0; margin: auto; display: none; }
button.loading .spinner { display: block; }      /* centered, floating spinner */
```

`visibility: hidden` (unlike `display: none` or `opacity: 0`) preserves
the space occupied by the text. The spinner floats on top without altering the size.

**Loading accessibility:**
- `aria-busy="true"` on the `<button>`
- `aria-hidden="true"` on `.label` (the visible text is hidden)
- `<span class="sr-only">${loadingLabel}</span>` for screen readers
- `loadingLabel` is a configurable attribute (default: "In progress…")

### 3. CSS tokens — shared padding and radius

**Problem:** `tokens/component.json` only defines the `padding-x`, `padding-y`,
`radius` tokens for the `primary` variant. The `secondary`, `ghost`, `critical`
variants don't have their own dimension tokens.

**Decision: all variants reuse the primary tokens for dimensions.**

```css
/* Applied to all variants */
padding: var(--agtc-button-primary-padding-y) var(--agtc-button-primary-padding-x);
border-radius: var(--agtc-button-primary-radius);
```

**Reason:** The `primary` tokens point to semantic tokens
(`--agtc-semantic-space-control-padding-x`, `--agtc-semantic-radius-control`).
All variants share the same control geometry — that's intentional.
Adding redundant per-variant tokens would be duplication with no value.

If a variant needed a different geometry, new component tokens
would be created at that point.

### 4. Typography — the `label` token

Buttons use `--agtc-semantic-typography-label-*` (size `sm`, weight `medium`).
This choice is semantically correct: a button is an action label, not body text.

### 5. Hover on `critical.confirming`

When the button is in the confirming state (after the 1st click), hover no longer
shows the subtle danger background — it keeps the solid danger background:

```css
button.critical.confirming:not(:disabled):hover {
  background: var(--agtc-button-critical-background);
  color: var(--agtc-button-critical-text);
}
```

**Reason:** The confirming state must signal to the user that a 2nd click will trigger
an irreversible action. Showing the subtle background (which signals a "resting state")
would be a misleading visual cue.

### 6. Attribute reflection (`reflect: true`)

`variant`, `disabled`, `loading`, `icon-only` are reflected onto the host (`reflect: true`).
This enables:
- `:host([disabled])` → `pointer-events: none` (belt and suspenders in addition to the native `disabled`)
- External CSS selectors on `agtc-button[variant="critical"]`
- State inspection by AI agents via `element.getAttribute('variant')`

### 7. Icon support — named slots and `display: contents`

**Problem:** How do we integrate icons before/after the text without coupling the component
to a specific icon system, and without creating stray gaps when the slots are empty?

**Decision: two named slots (`prefix` / `suffix`) with `display: contents`.**

```html
<slot name="prefix"></slot>  <!-- icon before -->
<span class="label"><slot></slot></span>  <!-- text -->
<slot name="suffix"></slot>  <!-- icon after -->
```

```css
slot[name="prefix"],
slot[name="suffix"] {
  display: contents; /* transparent to the flex layout */
}
```

`display: contents` makes the `<slot>` invisible to the layout: the slotted element
(e.g. `<agtc-icon>`) becomes a direct flex item of the `<button>`. An empty slot
generates neither a box nor a stray gap — the behavior is identical to the slot's absence.

**Reason:** Named slots are agnostic to the icon system. Any
element can be slotted (SVG, `<agtc-icon>`, image). The button's CSS `gap`
only applies between flex items that are actually present.

### 8. `.content` wrapper for loading with icons

**Problem:** With the addition of icon slots, `visibility: hidden` on `.label`
alone is no longer sufficient — the icons stayed visible during loading.

**Decision: a `.content { display: contents }` wrapper enclosing prefix + label + suffix.**

```css
.content { display: contents; }
button.loading .content { visibility: hidden; }
```

`visibility: hidden` is an inherited property. Even on a `display: contents` element
(which has no box of its own), it propagates to children through the CSS cascade.
The children (icons + text) inherit `visibility: hidden`, are visually hidden
and removed from the accessibility tree, but keep their flex boxes — the button's
width is preserved.

The spinner remains visible because it sits outside `.content` (a sibling in the shadow DOM).

### 10. Hybrid icon approach — properties + slots

**Problem:** Named slots (decision 7) are ideal in a standard Web Component but
create two concrete incompatibilities:
- **Figma Code Connect** generates flat code (`<agtc-button icon="plus">`) — it can't
  generate nested HTML with slots.
- **React < 19**: in JSX, `slot="prefix"` doesn't work natively on children
  because JSX doesn't produce real DOM nodes before rendering.

**Decision: `icon` and `icon-suffix` properties as a fallback for the named slots.**

```javascript
// Property → Figma Code Connect, React, all frameworks
<agtc-button icon="plus">Add</agtc-button>
<agtc-button variant="secondary" icon-suffix="arrow-right">Continue</agtc-button>
<agtc-button icon-only icon="x" label="Close"></agtc-button>

// Slot → advanced composition, custom SVG, out-of-system cases
<agtc-button>
  <agtc-icon slot="prefix" name="plus"></agtc-icon>
  Add
</agtc-button>
```

**Mechanism: native Web Component slot fallback content.**

In standard HTML, the content inside a `<slot>` is fallback content —
it's displayed only if no node is assigned to that slot from the light DOM.

```html
<!-- Component's Shadow DOM -->
<slot name="prefix">
  <!-- Rendered if no slot="prefix" exists in the light DOM -->
  <agtc-icon name="${this.icon}" size="control"></agtc-icon>
</slot>
```

- `icon="plus"` → no slotted node → the `<agtc-icon name="plus">` fallback is displayed
- `<agtc-icon slot="prefix">` → a slotted node is provided → the fallback is ignored, slot content is displayed
- Both at once: slotted content always takes priority

**Prerequisite:** `agtc-icon` must be registered by the consumer before using
the `icon` / `icon-suffix` properties. The slots accept any HTML element.

**Framework compatibility:**

| Framework | `icon="..."` property | `slot="prefix"` slot |
|-----------|----------------------|----------------------|
| Native HTML | ✅ | ✅ |
| React 18 | ✅ | ⚠️ needs `ref` + `setAttribute` |
| React 19 | ✅ | ✅ |
| Angular | ✅ | ✅ |
| Vue 3 | ✅ | ✅ |
| Svelte | ✅ | ✅ |
| Figma Code Connect | ✅ | ❌ |

### 12. `icon-only` mode — square padding and mandatory accessibility

**Problem:** A button with no visible text must have equal padding and an accessible
label. How do we enforce this without excessive complexity?

**Decision: boolean `icon-only` attribute + mandatory `label` property.**

```css
button.icon-only {
  padding: var(--agtc-button-primary-padding-y); /* same value on all 4 sides */
}
```

```javascript
updated() {
  if (this.iconOnly && !this.label) {
    console.warn('[agtc-button] icon-only without label="" — inaccessible (WCAG 1.1.1).');
  }
}
```

The `label` property is forwarded to `aria-label` on the internal `<button>`.
It automatically switches to `loadingLabel` while loading.

**Reason:** `aria-label` on the `<agtc-button>` host wouldn't be read by assistive
technologies (it applies to the custom element, not to the `<button>` inside the shadow DOM).
Forwarding to the internal `<button>` is mandatory for accessibility.

---

## Events

| Event | When | `detail` |
|-----------|-------|----------|
| `agtc-click` | Any validated click (not disabled, not loading) | `{ variant }` |
| `agtc-confirm-request` | 1st click on critical | — |
| `agtc-confirm` | 2nd click on critical (action confirmed) | — |

All events: `bubbles: true, composed: true` (they cross the Shadow DOM).

---

## Usage

```html
<!-- Primary — main action -->
<agtc-button>Submit request</agtc-button>

<!-- Secondary -->
<agtc-button variant="secondary">Cancel</agtc-button>

<!-- Ghost -->
<agtc-button variant="ghost">Learn more</agtc-button>

<!-- Critical — 2-click confirmation, auto-reset after 3s or blur/Escape -->
<agtc-button variant="critical">Permanently delete the folder</agtc-button>

<!-- Loading — width preserved, aria-busy, configurable SR label -->
<agtc-button loading loading-label="Sending…">Submit</agtc-button>

<!-- Disabled -->
<agtc-button disabled>Unavailable</agtc-button>

<!-- Submit in a form -->
<agtc-button type="submit">Validate</agtc-button>

<!-- Icon before the text (prefix slot) -->
<agtc-button>
  <agtc-icon slot="prefix" name="plus"></agtc-icon>
  Add an item
</agtc-button>

<!-- Icon after the text (suffix slot) -->
<agtc-button variant="secondary">
  Continue
  <agtc-icon slot="suffix" name="arrow-right"></agtc-icon>
</agtc-button>

<!-- Icon before AND after -->
<agtc-button variant="ghost">
  <agtc-icon slot="prefix" name="download"></agtc-icon>
  Download the report
  <agtc-icon slot="suffix" name="external-link"></agtc-icon>
</agtc-button>

<!-- Icon-only — label="" mandatory (WCAG 1.1.1) -->
<agtc-button icon-only label="Close the panel">
  <agtc-icon slot="prefix" name="x"></agtc-icon>
</agtc-button>

<!-- Icon-only critical -->
<agtc-button variant="critical" icon-only label="Permanently delete">
  <agtc-icon slot="prefix" name="trash-2"></agtc-icon>
</agtc-button>

<!-- Icon-only loading — aria-label switches to loadingLabel -->
<agtc-button icon-only label="Save" loading loading-label="Saving…">
  <agtc-icon slot="prefix" name="save"></agtc-icon>
</agtc-button>
```

```javascript
// Listening for events
document.querySelector('agtc-button[variant="critical"]')
  .addEventListener('agtc-confirm', () => {
    // The user has confirmed — execute the irreversible action
  });
```

---

## What is NOT in this component

- **`<a>` rendering** — for links, use native `<a>` or a future `<agtc-link>`
- **Confirmation modal** — `agtc-confirm-request` lets the host display its own UI if needed
- **Audit log** — the host's responsibility, on the `agtc-confirm` event
- **Tooltip on icon-only** — to be implemented at the host level; the component is limited to the `aria-label`

<!-- FR -->

# ADR-031 — agtc-button : implémentation Web Component Lit

**Date :** 2026-05-30
**Statut :** Accepté
**Décideurs :** Guilherme Negreiros
**Scope :** Composant `agtc-button` — contrat d'implémentation

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.
> Détail et liens : `guidelines/components/button.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Une seule action primaire par contexte | IxDF — clear primary action |
| Confirmation explicite pour `critical` | NN/g — error prevention |
| Largeur préservée pendant le `loading` | Smashing |
| Ne jamais désactiver sans indiquer la raison | Smashing — hidden vs disabled |
| Libellé décrivant la conséquence | NN/g |

---

## Contexte

Le système de design dispose d'un contrat de composant button complet (`tokens/component.json`,
`guidelines/components/button.md`, `.claude/rules/components/button.md`). Ce ADR documente
les décisions techniques prises pour transformer ce contrat en Web Component Lit fonctionnel.

---

## Décisions

### 1. Pattern de confirmation pour la variante `critical`

**Problème :** La règle absolue exige une confirmation avant toute action critique
(`requiresConfirmation: true` dans le token). Comment l'implémenter dans un Web Component
sans dépendre d'un système de modal externe ?

**Décision : double clic inline avec reset automatique.**

```
1er clic → _confirming = true → event agtc-confirm-request → label devient "Confirmer ?"
  ├─ 2e clic    → action confirmée, events agtc-confirm + agtc-click → reset
  ├─ blur       → reset (l'utilisateur a quitté le bouton)
  ├─ Escape     → reset (l'utilisateur annule explicitement)
  └─ timeout 3s → reset automatique (prévient les confirmations "zombie")
```

**Raison :** Solution 100% self-contained, sans dépendance externe. La variante `critical`
enforce toujours ce pattern — il n'est pas conditionnel à un attribut. Le token
`requiresConfirmation: true` est un contrat de gouvernance lu par les agents, pas
un flag runtime.

**Événements exposés :**
- `agtc-confirm-request` — 1er clic, pour que le host puisse afficher une UI externe
- `agtc-confirm` — confirmation effective (2e clic)
- `agtc-click` — tout clic confirmé (toutes variantes)

### 2. Préservation de la largeur pendant le loading

**Problème :** Le règle du contrat dit « Largeur préservée pendant les états async (loading) ».
Un spinner qui remplace le texte ferait changer la taille du bouton.

**Décision : `visibility: hidden` sur `.label` + spinner `position: absolute; inset: 0; margin: auto`.**

```css
button.loading .label { visibility: hidden; }   /* cache visuellement, préserve le layout */
.spinner { position: absolute; inset: 0; margin: auto; display: none; }
button.loading .spinner { display: block; }      /* spinner centré, flottant */
```

`visibility: hidden` (contrairement à `display: none` ou `opacity: 0`) préserve
l'espace occupé par le texte. Le spinner flotte par-dessus sans altérer la taille.

**Accessibilité loading :**
- `aria-busy="true"` sur le `<button>`
- `aria-hidden="true"` sur `.label` (le texte visible est masqué)
- `<span class="sr-only">${loadingLabel}</span>` pour les lecteurs d'écran
- `loadingLabel` est un attribut configurable (défaut : « En cours… »)

### 3. Tokens CSS — padding et radius partagés

**Problème :** `tokens/component.json` ne définit les tokens `padding-x`, `padding-y`,
`radius` que pour la variante `primary`. Les variantes `secondary`, `ghost`, `critical`
n'ont pas leurs propres tokens de dimension.

**Décision : toutes les variantes réutilisent les tokens primary pour les dimensions.**

```css
/* Appliqué à toutes les variantes */
padding: var(--agtc-button-primary-padding-y) var(--agtc-button-primary-padding-x);
border-radius: var(--agtc-button-primary-radius);
```

**Raison :** Les tokens `primary` pointent vers les tokens sémantiques
(`--agtc-semantic-space-control-padding-x`, `--agtc-semantic-radius-control`).
Toutes les variantes partagent la même géométrie de contrôle — c'est voulu.
Ajouter des tokens redondants par variante serait de la duplication sans valeur.

Si une variante devait avoir une géométrie différente, de nouveaux tokens composant
seraient créés à ce moment-là.

### 4. Typographie — token `label`

Les boutons utilisent `--agtc-semantic-typography-label-*` (taille `sm`, poids `medium`).
Ce choix est sémantiquement correct : un bouton est un libellé d'action, pas un corps de texte.

### 5. Hover sur `critical.confirming`

Quand le bouton est en état confirming (après le 1er clic), le hover ne montre plus
le fond subtil danger — il maintient le fond plein danger :

```css
button.critical.confirming:not(:disabled):hover {
  background: var(--agtc-button-critical-background);
  color: var(--agtc-button-critical-text);
}
```

**Raison :** L'état confirming doit signaler à l'utilisateur qu'un 2e clic va déclencher
une action irréversible. L'affichage du fond subtil (qui signifie « état de repos »)
serait une fausse piste visuelle.

### 6. Réflexion des attributs (`reflect: true`)

`variant`, `disabled`, `loading`, `icon-only` sont reflétés sur le host (`reflect: true`).
Cela permet :
- `:host([disabled])` → `pointer-events: none` (belt + suspenders en plus du `disabled` natif)
- Sélecteurs CSS externes sur `agtc-button[variant="critical"]`
- Inspection d'état par les agents IA via `element.getAttribute('variant')`

### 7. Support des icônes — slots nommés et `display: contents`

**Problème :** Comment intégrer des icônes avant/après le texte sans coupler le composant
à un système d'icônes spécifique, et sans créer de gaps parasites quand les slots sont vides ?

**Décision : deux slots nommés (`prefix` / `suffix`) avec `display: contents`.**

```html
<slot name="prefix"></slot>  <!-- icône avant -->
<span class="label"><slot></slot></span>  <!-- texte -->
<slot name="suffix"></slot>  <!-- icône après -->
```

```css
slot[name="prefix"],
slot[name="suffix"] {
  display: contents; /* transparent au flex layout */
}
```

`display: contents` rend le `<slot>` invisible pour le layout : l'élément slotté
(ex. `<agtc-icon>`) devient un flex item direct du `<button>`. Un slot vide
ne génère ni boîte ni gap superflu — le comportement est identique à l'absence de slot.

**Raison :** Les slots nommés sont agnostiques au système d'icônes. N'importe quel
élément peut être slotté (SVG, `<agtc-icon>`, image). Le `gap` CSS du button ne
s'applique qu'entre les flex items réellement présents.

### 8. Wrapper `.content` pour le loading avec icônes

**Problème :** Avec l'ajout des slots d'icônes, le `visibility: hidden` sur `.label`
seul ne suffit plus — les icônes restaient visibles pendant le loading.

**Décision : wrapper `.content { display: contents }` englobant prefix + label + suffix.**

```css
.content { display: contents; }
button.loading .content { visibility: hidden; }
```

`visibility: hidden` est une propriété héritée. Même sur un élément `display: contents`
(qui n'a pas de boîte propre), elle se propage aux enfants via la cascade CSS.
Les enfants (icônes + texte) héritent `visibility: hidden`, sont cachés visuellement
et retirés de l'arbre d'accessibilité, mais conservent leurs boîtes flex — la largeur
du bouton est préservée.

Le spinner reste visible car il est en dehors de `.content` (frère dans le shadow DOM).

### 10. Approche hybride icônes — propriétés + slots

**Problème :** Les slots nommés (décision 7) sont idéaux en Web Component standard mais
créent deux incompatibilités concrètes :
- **Figma Code Connect** génère du code plat (`<agtc-button icon="plus">`) — il ne peut
  pas générer du HTML imbriqué avec des slots.
- **React < 19** : dans JSX, `slot="prefix"` ne fonctionne pas nativement sur les enfants
  car JSX ne produit pas de vrais nœuds DOM avant le rendu.

**Décision : propriétés `icon` et `icon-suffix` comme fallback des slots nommés.**

```javascript
// Propriété → Figma Code Connect, React, tous frameworks
<agtc-button icon="plus">Ajouter</agtc-button>
<agtc-button variant="secondary" icon-suffix="arrow-right">Continuer</agtc-button>
<agtc-button icon-only icon="x" label="Fermer"></agtc-button>

// Slot → composition avancée, SVG custom, cas hors-système
<agtc-button>
  <agtc-icon slot="prefix" name="plus"></agtc-icon>
  Ajouter
</agtc-button>
```

**Mécanisme : fallback content natif des slots Web Component.**

En HTML standard, le contenu à l'intérieur d'un `<slot>` est du contenu de remplacement —
il s'affiche uniquement si aucun nœud n'est assigné à ce slot depuis le light DOM.

```html
<!-- Shadow DOM du composant -->
<slot name="prefix">
  <!-- Rendu si aucun slot="prefix" dans le light DOM -->
  <agtc-icon name="${this.icon}" size="control"></agtc-icon>
</slot>
```

- `icon="plus"` → aucun nœud slotté → fallback `<agtc-icon name="plus">` s'affiche
- `<agtc-icon slot="prefix">` → nœud slotté fourni → fallback ignoré, slot content affiché
- Les deux simultanément : le contenu slotté a toujours la priorité

**Prérequis :** `agtc-icon` doit être enregistré par le consommateur avant d'utiliser
les propriétés `icon` / `icon-suffix`. Les slots acceptent n'importe quel élément HTML.

**Compatibilité frameworks :**

| Framework | Propriété `icon="..."` | Slot `slot="prefix"` |
|-----------|----------------------|----------------------|
| HTML natif | ✅ | ✅ |
| React 18 | ✅ | ⚠️ besoin de `ref` + `setAttribute` |
| React 19 | ✅ | ✅ |
| Angular | ✅ | ✅ |
| Vue 3 | ✅ | ✅ |
| Svelte | ✅ | ✅ |
| Figma Code Connect | ✅ | ❌ |

### 12. Mode `icon-only` — padding carré et accessibilité obligatoire

**Problème :** Un bouton sans texte visible doit avoir un padding égal et un label
accessible. Comment enforcer cela sans complexité excessive ?

**Décision : attribut booléen `icon-only` + propriété `label` obligatoire.**

```css
button.icon-only {
  padding: var(--agtc-button-primary-padding-y); /* même valeur sur les 4 côtés */
}
```

```javascript
updated() {
  if (this.iconOnly && !this.label) {
    console.warn('[agtc-button] icon-only sans label="" — inaccessible (WCAG 1.1.1).');
  }
}
```

La propriété `label` se forwarde vers `aria-label` sur le `<button>` interne.
Elle bascule automatiquement vers `loadingLabel` pendant le chargement.

**Raison :** `aria-label` sur le host `<agtc-button>` ne serait pas lu par les assistants
techniques (il s'applique à l'élément custom, pas au `<button>` dans le shadow DOM).
Le forwarding vers le `<button>` interne est obligatoire pour l'accessibilité.

---

## Événements

| Événement | Quand | `detail` |
|-----------|-------|----------|
| `agtc-click` | Tout clic validé (non-disabled, non-loading) | `{ variant }` |
| `agtc-confirm-request` | 1er clic sur critical | — |
| `agtc-confirm` | 2e clic sur critical (action confirmée) | — |

Tous les événements : `bubbles: true, composed: true` (traversent le Shadow DOM).

---

## Usage

```html
<!-- Primary — action principale -->
<agtc-button>Soumettre la demande</agtc-button>

<!-- Secondary -->
<agtc-button variant="secondary">Annuler</agtc-button>

<!-- Ghost -->
<agtc-button variant="ghost">En savoir plus</agtc-button>

<!-- Critical — confirmation en 2 clics, auto-reset après 3s ou blur/Escape -->
<agtc-button variant="critical">Supprimer définitivement le dossier</agtc-button>

<!-- Loading — largeur préservée, aria-busy, label SR configurable -->
<agtc-button loading loading-label="Envoi en cours…">Soumettre</agtc-button>

<!-- Disabled -->
<agtc-button disabled>Non disponible</agtc-button>

<!-- Submit dans un formulaire -->
<agtc-button type="submit">Valider</agtc-button>

<!-- Icône avant le texte (slot prefix) -->
<agtc-button>
  <agtc-icon slot="prefix" name="plus"></agtc-icon>
  Ajouter un élément
</agtc-button>

<!-- Icône après le texte (slot suffix) -->
<agtc-button variant="secondary">
  Continuer
  <agtc-icon slot="suffix" name="arrow-right"></agtc-icon>
</agtc-button>

<!-- Icône avant ET après -->
<agtc-button variant="ghost">
  <agtc-icon slot="prefix" name="download"></agtc-icon>
  Télécharger le rapport
  <agtc-icon slot="suffix" name="external-link"></agtc-icon>
</agtc-button>

<!-- Icon-only — label="" obligatoire (WCAG 1.1.1) -->
<agtc-button icon-only label="Fermer le panneau">
  <agtc-icon slot="prefix" name="x"></agtc-icon>
</agtc-button>

<!-- Icon-only critical -->
<agtc-button variant="critical" icon-only label="Supprimer définitivement">
  <agtc-icon slot="prefix" name="trash-2"></agtc-icon>
</agtc-button>

<!-- Icon-only loading — aria-label bascule vers loadingLabel -->
<agtc-button icon-only label="Enregistrer" loading loading-label="Enregistrement…">
  <agtc-icon slot="prefix" name="save"></agtc-icon>
</agtc-button>
```

```javascript
// Écoute des événements
document.querySelector('agtc-button[variant="critical"]')
  .addEventListener('agtc-confirm', () => {
    // L'utilisateur a confirmé — exécuter l'action irréversible
  });
```

---

## Ce qui n'est PAS dans ce composant

- **Rendu `<a>`** — pour les liens, utiliser `<a>` natif ou un futur `<agtc-link>`
- **Modal de confirmation** — `agtc-confirm-request` permet au host d'afficher sa propre UI si nécessaire
- **Audit log** — responsabilité du host sur l'événement `agtc-confirm`
- **Tooltip sur icon-only** — à implémenter au niveau du host ; le composant se limite à l'`aria-label`
