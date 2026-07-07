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

## Intention

**Pourquoi ce composant existe :**
Permettre à l'utilisateur de déclencher une action dans l'interface.

**Ce composant n'est pas :**
- Un lien de navigation (utiliser `<a>` ou `<ds-link>`)
- Un toggle (utiliser `<ds-toggle>`)
- Un menu déroulant (utiliser `<ds-dropdown>`)

---

## Variantes autorisées

| Variante | Usage | Quand utiliser |
|----------|-------|----------------|
| `primary` | Action principale de la page | Une seule par contexte |
| `secondary` | Action secondaire | Alternative moins prioritaire |
| `ghost` | Action tertiaire ou navigation | Contextes à faible hiérarchie visuelle |
| `critical` | Action irréversible ou destructrice | Suppression, annulation définitive |

**Règle absolue :** Ne jamais utiliser `primary` pour une action irréversible. Toujours `critical`.

---

## Tokens utilisés

> Le composant consomme des **tokens de composant** (`component.button.*`), jamais les
> tokens sémantiques directement — cf. `tokens-system.md` (niveau 3 = contrat institutionnel).

| Propriété | Token composant | Référence sémantique |
|-----------|-----------------|----------------------|
| Fond primary | `component.button.primary.background` | `semantic.color.action.primary` |
| Fond primary hover | `component.button.primary.background-hover` | `semantic.color.action.primary-hover` |
| Fond primary disabled | `component.button.primary.background-disabled` | `semantic.color.action.primary-disabled` |
| Fond critical | `component.button.critical.background` | `semantic.color.feedback.danger` |
| Texte primary | `component.button.primary.text` | `semantic.color.text.on-action` |
| Fond secondary | `component.button.secondary.background` | `transparent` |
| Bordure secondary | `component.button.secondary.border` | `semantic.color.action.primary` |
| Fond ghost | `component.button.ghost.background` | `transparent` |
| Padding X | `component.button.primary.padding-x` | `semantic.space.control.padding-x` |
| Padding Y | `component.button.primary.padding-y` | `semantic.space.control.padding-y` |
| Rayon | `component.button.primary.radius` | `semantic.radius.control` |
| Taille du libellé | `component.button.font-size` | `semantic.typography.label-bold.size` (14px) |
| Poids du libellé | `component.button.font-weight` | `semantic.typography.label-bold.weight` (Bold — emphase CTA, distinct de `label.weight` medium) |

Les états sans token de composant dédié (ex. `disabled` pour secondary/critical/ghost)
retombent sur les tokens sémantiques génériques — c'est attendu, pas une erreur.

---

## Accessibilité — non négociable

| Règle | Valeur |
|-------|--------|
| Contraste minimum | 4.5:1 (WCAG AA) |
| Navigation clavier | Focus visible obligatoire |
| Bouton icône seule | `aria-label` obligatoire |
| État désactivé | `disabled` + `aria-disabled="true"` |
| État chargement | `aria-busy="true"` + texte alternatif |

---

## Comportements et états

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

## Anti-patterns

| À éviter | Raison |
|----------|--------|
| Deux boutons `primary` dans le même contexte | Hiérarchie ambiguë |
| Bouton `primary` pour action destructrice | Risque de confusion |
| Libellé générique ("OK", "Confirmer") | Non accessible |
| Bouton sans texte visible sans `aria-label` | Inaccessible |
| Couleur hardcodée dans le style | Contourne le design system |
| Désactiver un bouton sans indiquer la raison | L'utilisateur ne comprend pas pourquoi l'action est bloquée (cf. pattern B4) |

---

## Patterns UX de référence

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Une seule action primaire claire par contexte | [IxDF — clear primary action](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Hiérarchie d'action lisible |
| Confirmation explicite pour action destructrice (`critical`) | [NN/g — error prevention](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `requires-confirmation` |
| Largeur préservée pendant le `loading` | [Smashing](https://www.smashingmagazine.com/category/design-patterns/) | ✅ | Pas de saut de layout |
| **Ne jamais désactiver sans indiquer la raison** (préférer `disabled` motivé plutôt que masquer l'action) | [Smashing — hidden vs disabled](https://www.smashingmagazine.com/category/design-patterns/) | ✅ | Un `disabled` muet est un anti-pattern d'accessibilité — fournir texte d'aide/tooltip expliquant le blocage |
| Libellé décrivant la conséquence, pas « OK » | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Libellé explicite |

---

## Gouvernance

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'une nouvelle variante | Principal Designer + Tech Lead |
| Modification d'un token de composant | TCR + Principal Designer |
| Changement de comportement critical | Principal Designer + Sécurité |
| Correction de bug accessibilité | Review design system team |

---

## Implémentation

### Web Component (Lit)
```html
<!-- Primary -->
<agtc-button variant="primary">Soumettre la demande</agtc-button>

<!-- Secondary -->
<agtc-button variant="secondary">Annuler</agtc-button>

<!-- Critical — confirmation obligatoire -->
<agtc-button variant="critical" requires-confirmation>
  Supprimer définitivement le dossier
</agtc-button>

<!-- Ghost -->
<agtc-button variant="ghost">En savoir plus</agtc-button>

<!-- Loading -->
<agtc-button variant="primary" loading>En cours…</agtc-button>

<!-- Disabled -->
<agtc-button variant="primary" disabled aria-disabled="true">
  Non disponible
</agtc-button>

<!-- Icône seule — aria-label obligatoire -->
<agtc-button variant="ghost" aria-label="Fermer le panneau">
  <agtc-icon name="close"></agtc-icon>
</agtc-button>
```

### Angular
```html
<agtc-button variant="critical" (ds-confirm)="onDeleteConfirmed()">
  Supprimer définitivement le dossier
</agtc-button>
```

### React
```jsx
<DsButton variant="primary" onClick={handleSubmit}>
  Soumettre la demande
</DsButton>
```
