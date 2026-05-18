# Contrat : Button

```
variant="primary" · intent="primary action" · owner="design-system-team"
version: 2.1.0 · dernière mise à jour: 2026-05-18
```

---

## INTENT — Pourquoi ce composant existe

Le bouton déclenche une action dans l'interface.
Il représente la volonté explicite de l'utilisateur d'initier quelque chose.

**Ce composant résout :** permettre à l'utilisateur d'agir de façon intentionnelle et claire.

**Ce composant ne résout PAS :**
- La navigation entre pages → utiliser un lien natif `<a>`
- L'envoi de formulaires multiples → structurer les étapes
- Les actions purement décoratives → ne pas utiliser de bouton

---

## RÈGLES — Quand utiliser, quand éviter

### Utiliser Button quand
- L'action modifie l'état de l'application ou des données
- L'action déclenche un processus (envoi, confirmation, traitement)
- L'action ouvre un dialogue modal (modale de confirmation, de saisie)

### Ne pas utiliser Button quand
- L'action navigue vers une autre page sans changement d'état → `<a>` natif
- L'action est purement cosmétique ou décorative
- L'action est implicite ou ambiguë → clarifier l'intention d'abord

### Règles de hiérarchie — absolues
```
✅ Maximum 1 bouton primary par section ou formulaire
✅ Maximum 1 bouton critical par flux complet
❌ Jamais deux boutons primary dans la même zone
❌ Jamais un bouton critical sans pattern de confirmation
```

---

## VARIANTES

| Variante | Token | Emphase | Usage |
|----------|-------|---------|-------|
| `primary` | `component.button.primary` | Haute | Action principale d'une section |
| `secondary` | `component.button.secondary` | Moyenne | Action alternative ou complémentaire |
| `critical` | `component.button.critical` | Haute + danger | Action irréversible — voir règles spéciales |
| `ghost` | `component.button.ghost` | Basse | Action tertiaire, faible emphase |

### Variante `critical` — règles spéciales

```
OBLIGATOIRE :
  ✅ Confirmation explicite avant exécution (dialogue ou double-étape)
  ✅ Prévention du double-clic (disabled après premier clic)
  ✅ Libellé qui décrit l'action irréversible
       → "Supprimer définitivement le dossier" ✅
       → "OK" ❌ · "Confirmer" seul ❌
  ✅ Contraste minimum 4.5:1 sur fond blanc
  ✅ Traçabilité haute (audit log)
```

---

## ACCESSIBILITÉ

| Exigence | Valeur | Standard |
|----------|--------|----------|
| Contraste texte/fond | ≥ 4.5:1 | WCAG 2.1 AA |
| Zone cliquable minimale | 44×44px | WCAG 2.1 SC 2.5.5 |
| Focus visible | `outline: 2px solid color.border.focus` | WCAG 2.1 SC 2.4.7 |
| Navigation clavier | `Enter` et `Space` activent le bouton | WAI-ARIA Button |
| État désactivé | `aria-disabled="true"` + visuel | WAI-ARIA |
| Bouton en chargement | `aria-busy="true"` + label mis à jour | WAI-ARIA |
| Icône seule | `aria-label` obligatoire | WAI-ARIA |

---

## COMPORTEMENT

### États
| État | Déclencheur | Apparence |
|------|-------------|-----------|
| Default | — | Background token normal |
| Hover | Pointeur sur le bouton | Background légèrement assombri |
| Focus | Navigation clavier | Anneau de focus visible |
| Active | Clic tenu | Background plus sombre |
| Loading | Action async en cours | Spinner + texte "En cours…" · largeur préservée |
| Disabled | `disabled` prop | Background désactivé · `aria-disabled` |
| Success | Action complétée | Icône checkmark transitoire (optionnel) |

### Comportements spéciaux
- **Largeur préservée en état loading** : empêche le layout shift
- **Double-clic prévenu en état critical** : premier clic = disabled immédiat
- **Confirmation dialog pour critical** : le bouton ne déclenche pas directement l'action

---

## DÉPENDANCES

### Tokens consommés
```json
{
  "button.primary": [
    "semantic.color.action.primary",
    "semantic.color.text.onAction",
    "semantic.radius.control",
    "semantic.space.control.padding-x",
    "semantic.space.control.padding-y",
    "semantic.typography.label.size",
    "semantic.typography.label.weight"
  ],
  "button.critical": [
    "semantic.color.action.critical",
    "semantic.color.text.onAction",
    "semantic.radius.control",
    "semantic.space.control.padding-x",
    "semantic.space.control.padding-y"
  ]
}
```

### Composants qui utilisent Button
- `Modal` → bouton de confirmation en footer
- `Form` → bouton de soumission
- `Alert` → bouton d'action contextuel
- `Toolbar` → actions groupées

### Composants dont Button peut dépendre
- `Icon` → pour les boutons avec icône
- `Spinner` → pour l'état loading

---

## ANTI-PATTERNS

```
❌ <button style="background: red;">Supprimer</button>
   Problème : valeur en dur, pas de token, variante non reconnue

❌ <ds-button variant="critical">OK</ds-button>
   Problème : libellé non explicite pour une action critique

❌ Deux <ds-button variant="primary"> dans le même formulaire
   Problème : hiérarchie cassée, l'utilisateur ne sait pas quelle action est principale

❌ <ds-button variant="danger">
   Problème : variante inexistante — utiliser "critical"

❌ <ds-button disabled> sans aria-disabled
   Problème : non accessible aux technologies d'assistance

❌ Bouton critical sans confirmation
   Problème : violation du contrat — escalader
```

---

## GOUVERNANCE

| Dimension | Valeur |
|-----------|--------|
| Owner | design-system-team |
| Approbation pour modification | Principal Designer |
| Approbation pour modification de `critical` | Principal Designer + Architecte UX |
| Niveau d'escalade | 4 (modification de contrat) |
| Audit automatique | À chaque PR touchant button.* |
| Traçabilité des boutons critical | Obligatoire (audit log) |

### Processus de modification
1. Demande formelle avec justification
2. Impact assessment (quels composants / équipes sont touchés)
3. Approbation Principal Designer
4. PR avec tests et Storybook mis à jour
5. Communication aux équipes consommatrices

---

## IMPLÉMENTATION

### Web Component (Lit)
```html
<!-- Primary -->
<ds-button variant="primary">Soumettre la demande</ds-button>

<!-- Secondary -->
<ds-button variant="secondary">Annuler</ds-button>

<!-- Critical — avec confirmation obligatoire -->
<ds-button variant="critical" requires-confirmation>
  Supprimer définitivement le dossier
</ds-button>

<!-- Ghost -->
<ds-button variant="ghost">En savoir plus</ds-button>

<!-- Loading -->
<ds-button variant="primary" loading>En cours…</ds-button>

<!-- Disabled -->
<ds-button variant="primary" disabled aria-disabled="true">
  Non disponible
</ds-button>

<!-- Icône seule — aria-label obligatoire -->
<ds-button variant="ghost" aria-label="Fermer le panneau">
  <ds-icon name="close"></ds-icon>
</ds-button>
```

### Consommation Angular
```html
<ds-button variant="critical" (ds-confirm)="onDeleteConfirmed()">
  Supprimer définitivement le dossier
</ds-button>
```

### Consommation React
```jsx
<DsButton variant="primary" onClick={handleSubmit}>
  Soumettre la demande
</DsButton>
```
