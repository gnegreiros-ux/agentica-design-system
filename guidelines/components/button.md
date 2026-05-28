# Composant : Button — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : [DATE]
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/button.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/components/button.md
> **Relations:** tokens/component.json, .claude/rules/components/button.md, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Permettre à l'utilisateur de déclencher une action dans l'interface.

**Ce composant n'est pas :**
- Un lien de navigation (utiliser `<a>` ou `<ds-link>`)
- Un toggle (utiliser `<ds-toggle>`)
- Un menu déroulant (utiliser `<ds-dropdown>`)

---

## VARIANTES AUTORISÉES

| Variante | Usage | Quand utiliser |
|----------|-------|----------------|
| `primary` | Action principale de la page | Une seule par contexte |
| `secondary` | Action secondaire | Alternative moins prioritaire |
| `ghost` | Action tertiaire ou navigation | Contextes à faible hiérarchie visuelle |
| `critical` | Action irréversible ou destructrice | Suppression, annulation définitive |

**Règle absolue :** Ne jamais utiliser `primary` pour une action irréversible. Toujours `critical`.

---

## TOKENS UTILISÉS

| Propriété | Token sémantique |
|-----------|-----------------|
| Fond primary | `semantic.color.action.primary` |
| Fond primary hover | `semantic.color.action.primary-hover` |
| Fond primary disabled | `semantic.color.action.primary-disabled` |
| Fond critical | `semantic.color.feedback.danger` |
| Texte sur action | `semantic.color.text.on-action` |
| Padding X | `semantic.space.control.padding-x` |
| Padding Y | `semantic.space.control.padding-y` |
| Rayon | `semantic.radius.control` |

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Contraste minimum | 4.5:1 (WCAG AA) |
| Navigation clavier | Focus visible obligatoire |
| Bouton icône seule | `aria-label` obligatoire |
| État désactivé | `disabled` + `aria-disabled="true"` |
| État chargement | `aria-busy="true"` + texte alternatif |

---

## COMPORTEMENTS ET ÉTATS

| État | Comportement |
|------|-------------|
| Default | Apparence standard |
| Hover | Fond assombri via token hover |
| Focus | Anneau de focus visible (border.focus) |
| Active | Légère compression visuelle |
| Loading | Spinner + `aria-busy` + texte "En cours…" |
| Disabled | Opacité réduite + non cliquable |

### Règles spéciales — variante `critical`
- **Confirmation explicite obligatoire** avant exécution
- **Prévention du double-clic** activée automatiquement
- **Audit log** : chaque clic est enregistré
- **Libellé explicite** : décrire la conséquence, pas seulement l'action
  - ✅ "Supprimer définitivement le dossier"
  - ❌ "Supprimer"

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| Deux boutons `primary` dans le même contexte | Hiérarchie ambiguë |
| Bouton `primary` pour action destructrice | Risque de confusion |
| Libellé générique ("OK", "Confirmer") | Non accessible |
| Bouton sans texte visible sans `aria-label` | Inaccessible |
| Couleur hardcodée dans le style | Contourne le design system |

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'une nouvelle variante | Principal Designer + Tech Lead |
| Modification d'un token de composant | TCR + Principal Designer |
| Changement de comportement critical | Principal Designer + Sécurité |
| Correction de bug accessibilité | Review design system team |

---

## IMPLÉMENTATION

### Web Component (Lit)
```html
<!-- Primary -->
<ds-button variant="primary">Soumettre la demande</ds-button>

<!-- Secondary -->
<ds-button variant="secondary">Annuler</ds-button>

<!-- Critical — confirmation obligatoire -->
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

### Angular
```html
<ds-button variant="critical" (ds-confirm)="onDeleteConfirmed()">
  Supprimer définitivement le dossier
</ds-button>
```

### React
```jsx
<DsButton variant="primary" onClick={handleSubmit}>
  Soumettre la demande
</DsButton>
```
