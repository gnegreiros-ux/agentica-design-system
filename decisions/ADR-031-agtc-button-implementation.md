# ADR-031 — agtc-button : implémentation Web Component Lit

**Date :** 2026-05-30
**Statut :** Accepté
**Décideurs :** Guilherme Negreiros
**Scope :** Composant `agtc-button` — contrat d'implémentation

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

`variant`, `disabled`, `loading` sont reflétés sur le host (`reflect: true`).
Cela permet :
- `:host([disabled])` → `pointer-events: none` (belt + suspenders en plus du `disabled` natif)
- Sélecteurs CSS externes sur `agtc-button[variant="critical"]`
- Inspection d'état par les agents IA via `element.getAttribute('variant')`

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

- **Icône intégrée** — utiliser `<agtc-icon>` dans le slot : `<agtc-button><agtc-icon name="trash-2"></agtc-icon> Supprimer</agtc-button>`
- **Rendu `<a>`** — pour les liens, utiliser `<a>` natif ou un futur `<agtc-link>`
- **Modal de confirmation** — `agtc-confirm-request` permet au host d'afficher sa propre UI de confirmation si nécessaire
- **Audit log** — responsabilité du host sur l'événement `agtc-confirm`
