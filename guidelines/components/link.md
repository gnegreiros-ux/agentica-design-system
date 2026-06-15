# Composant : Link — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-04
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/link.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-043-agtc-link-implementation.md, guidelines/components/button.md, DESIGN.md

---

## Intention

**Pourquoi ce composant existe :**
Un lien de **navigation** textuel, interne ou externe, inline ou standalone. Formalise les ~2700
`<a>` du site et le traitement uniforme des liens externes.

**Ce composant n'est pas :**
- Un bouton (`agtc-button`) — un lien **navigue**, un bouton **agit**
- Un onglet / une nav primaire (composants distincts)

---

## Propriétés

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `href` | String | `#` | Destination (requis) |
| `external` | Boolean | `false` | Force le traitement externe (auto-détecté pour http(s) d'une autre origine) |
| `underline` | String | `always` | `always` / `hover` / `none` |

Texte via le **slot**.

---

## Tokens utilisés

| Rôle | Token |
|------|-------|
| Couleur du lien | `component.link.default.text` |
| Couleur au survol | `component.link.default.text-hover` |
| Anneau de focus | `component.link.default.border-focus` |

---

## Accessibilité — non négociable

| Règle | Valeur |
|-------|--------|
| Distinguable au-delà de la couleur | Soulignement (`always`) en texte courant — WCAG 1.4.1 |
| Focus clavier | `:focus-visible` visible (anneau tokenisé) — WCAG 2.4.7 |
| Lien externe / nouvel onglet | `rel="noopener noreferrer"` + icône **+ texte masqué « (ouvre dans un nouvel onglet) »** — WCAG H83 (l'icône seule ne suffit pas) |
| Texte de lien | Descriptif, lisible hors contexte — jamais « cliquez ici » (WCAG 2.4.4) ; avertissement console si générique |
| Sémantique | `<a href>` réel — pour une action, utiliser `agtc-button` |

---

## Comportements

- `underline="always"` (défaut) : souligné en permanence — recommandé en **texte courant**.
- `underline="hover"` : souligné au survol uniquement — pour la **nav** (où le contexte distingue déjà le lien).
- `underline="none"` : jamais souligné — contextes où le lien est clairement identifié autrement.
- **Externe** : ouvre dans un nouvel onglet, sécurisé (`noopener`), annoncé aux AT.

---

## Anti-patterns

| À éviter | Raison |
|----------|--------|
| Un lien pour déclencher une action JS sans navigation | Utiliser `agtc-button` |
| `target="_blank"` sans `rel="noopener"` ni avertissement | Faille (tabnabbing) + perte de repère AT |
| Texte « cliquez ici » / « en savoir plus » seul | Illisible hors contexte (WCAG 2.4.4) |
| Lien distinguable par la couleur seule en texte courant | WCAG 1.4.1 |
| Couleur codée en dur | Contourne les tokens |

---

## Patterns UX de référence

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036/043). Décision : **LK1–LK8 tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Soulignement en texte courant (au-delà de la couleur) | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | `underline="always"` par défaut (WCAG 1.4.1) |
| `:focus-visible` visible | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | Anneau tokenisé |
| Lien externe : `rel="noopener noreferrer"` + icône + texte AT | [WCAG H83](https://www.w3.org/WAI/WCAG21/Techniques/html/H83) | ✅ | « (ouvre dans un nouvel onglet) » masqué |
| Auto-détection externe + override | [Coder's Block](https://codersblock.com/blog/external-links-new-tabs-and-accessibility/) | ✅ | http(s) autre origine, `external` force |
| Texte de lien descriptif | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | Avertissement console si générique |
| Lien = navigation, bouton = action | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | `<a href>` requis |
| État visité distinct | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ❌ | Hors v1 — peu pertinent en doc/app ; ajout ultérieur possible |
| Indice au survol même sans soulignement permanent | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | `hover`/`none` soulignent au survol |

---

## Implémentation

### Composant (Lit)
```html
<!-- Inline (souligné par défaut) -->
Consulter la <agtc-link href="/guidelines/link">guideline</agtc-link>.

<!-- Externe (nouvel onglet, sécurisé, annoncé) -->
<agtc-link href="https://lucide.dev" external>Lucide</agtc-link>

<!-- Nav (soulignement au survol) -->
<agtc-link href="/components" underline="hover">Composants</agtc-link>
```

### Classe (HTML statique du site)
```html
<a class="agtc-link" href="/components">Composants</a>
<a class="agtc-link" href="https://lucide.dev" target="_blank" rel="noopener noreferrer">
  Lucide <span aria-hidden="true">↗</span><span class="visually-hidden"> (ouvre dans un nouvel onglet)</span>
</a>
```

---

## Gouvernance

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'un état (visited) ou d'une variante | Principal Designer + Tech Lead |
| Modification d'un token | Principal Designer |
| Changement du soulignement par défaut | Principal Designer |
| Correction bug accessibilité | Review design system team |
