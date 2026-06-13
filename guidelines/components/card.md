# Composant : Card — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-05-31
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/card.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Regrouper des informations visuellement liées dans un conteneur délimité, avec support d'en-tête et de pied de page optionnels.

**Ce composant n'est pas :**
- Un lien de navigation (placer un `<a>` à l'intérieur)
- Un modal (utiliser `<agtc-modal>`)
- Un composant interactif — non cliquable par défaut

---

## VARIANTES

| Variante | Effet visuel | Usage |
|----------|-------------|-------|
| `default` | Bordure fine, fond surface | Usage général |
| `elevated` | Ombre portée, fond surface | Mise en avant, hiérarchie |
| `flat` | Fond subtle, pas de bordure visible | Sections secondaires, groupements denses |

---

## PADDING

| Valeur | Taille | Usage |
|--------|--------|-------|
| `none` | 0px | Médias plein-bord, listes sans padding |
| `sm` | `primitive.space.3` | Espaces contraints |
| `md` | `semantic.space.layout.component` | Défaut — usage général |
| `lg` | `primitive.space.6` | Contenu spacieux, formulaires |

---

## SLOTS

| Slot | Comportement |
|------|-------------|
| `header` | Séparateur bas automatique si contenu présent |
| (défaut) | Corps de la carte |
| `footer` | Séparateur haut automatique si contenu présent |

Les séparateurs sont masqués si le slot est vide (détection via `slotchange`).

---

## PROPRIÉTÉS

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `variant` | String | `default` | Variante visuelle |
| `padding` | String | `md` | Taille de padding interne |

---

## TOKENS UTILISÉS

| Variante | Token background | Token border | Token shadow |
|----------|-----------------|-------------|--------------|
| default | `component.card.default.background` | `component.card.default.border` | — |
| elevated | `component.card.elevated.background` | transparent | `component.card.elevated.shadow` |
| flat | `component.card.flat.background` | transparent | — |

| Propriété | Token |
|-----------|-------|
| Rayon | `component.card.default.radius` |
| Padding md | `component.card.default.padding` |
| Padding none | `component.card.padding-none` |
| Padding sm | `component.card.padding-sm` |
| Padding lg | `component.card.padding-lg` |

### Typographie — dual contexte (ADR-057)

La typographie de la card suit le contexte d'utilisation déclaré par `data-context` sur `<body>`.

| Rôle | Token SaaS/Produit | Token Marketing (`data-context="marketing"`) |
|------|--------------------|---------------------------------------------|
| Titre standard | `component.card.typography.title.size` (14px) | `component.card.typography.marketing.title.size` (16px) |
| Titre prominent (persona, feature) | — | `component.card.typography.marketing.hero-title.size` (20px) |
| Corps | `component.card.typography.body.size` (14px) | `component.card.typography.marketing.body.size` (16px) |
| Méta / label secondaire | `component.card.typography.meta.size` (12px) | `component.card.typography.marketing.meta.size` (14px) |

**Règle :** utiliser `component.card.typography.marketing.*` uniquement sur les pages `data-context="marketing"` (`index.html`, `get-started.html`, `agents/index.html`). Ne jamais appliquer ces tokens sur une page de documentation de composant.

Les surcharges marketing sont appliquées via `[data-context="marketing"] .card-title { font-size: var(--agtc-component-card-typography-marketing-title-size) }` dans `siteCSS()` — les tokens cascadent automatiquement sans modification du Web Component.

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Non interactif | Pas de `role` ajouté — sémantique neutre (`<div>`) |
| Carte cliquable | Encapsuler dans un `<a>` avec texte accessible |
| Contenu lisible | Contraste du texte à l'intérieur ≥ 4.5:1 |
| Focus | Géré par les éléments interactifs à l'intérieur, pas la carte elle-même |

---

## COMPORTEMENTS

- `overflow: hidden` — le contenu ne déborde jamais du rayon
- Le padding du body est ajusté automatiquement si header/footer présents (pas de double espacement)
- Les séparateurs header/footer s'adaptent à la variante (couleur de bordure cohérente)

---

## COMPOSITION

```html
<!-- Carte cliquable — <a> à l'intérieur -->
<agtc-card variant="elevated">
  <a href="/detail" style="display:block;text-decoration:none">
    <h3>Titre de la carte</h3>
    <p>Description du contenu.</p>
  </a>
</agtc-card>

<!-- Avec actions en footer -->
<agtc-card>
  <span slot="header">Titre</span>
  Contenu principal de la carte.
  <div slot="footer">
    <agtc-button variant="primary">Confirmer</agtc-button>
    <agtc-button variant="ghost">Annuler</agtc-button>
  </div>
</agtc-card>
```

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| `<agtc-card>` cliquable sans `<a>` | Non accessible — pas de focus natif |
| Couleur de fond codée en dur | Contourne les tokens de variante |
| Padding inline style | Utiliser les valeurs de `padding` |
| Carte sans contenu | Affichage vide — toujours fournir un body |
| Variante inventée | Escalader au design system team |
| **Élément interactif imbriqué** (`<button>` dans un `<a>` englobant) | Invalide en HTML, ambigu au clic et au clavier (cf. pattern C2) |
| Carte « tout cliquable » contenant ≥ 2 actions distinctes | Conflit de cibles — utiliser l'overlay `::after` ou des actions propres (cf. C2) |

---

## PATTERNS UX DE RÉFÉRENCE

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036). Décision : **C1, C3, C4 approuvés + C2 révisé**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Groupement visuel clair (clustering) du contenu lié | [Dashboard — grouped layout](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Intention du composant |
| **Carte cliquable — règle révisée** | [Smashing — clickable cards](https://www.smashingmagazine.com/category/design-patterns/) · [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ (révisé) | Voir contrat ci-dessous |
| Hiérarchie via élévation/ombre, pas via couleur seule | [Dashboard — composition](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Variante `elevated` |
| Détail-on-demand : la carte résume, le détail s'ouvre ailleurs | [Dashboard — screenspace](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Guideline d'usage : éviter la carte « réceptacle de tout le détail » |

### Contrat de cliquabilité (C2 révisé)

- **Carte avec une seule destination** → le lien couvre **toute la surface** (cible de clic
  englobante, focus visible sur la carte).
- **Carte avec des actions distinctes** (≥ 2 boutons/liens) → la carte **n'est pas** un lien global :
  - soit un **lien primaire** (le titre) étendu sur la carte via un overlay `::after`, avec les
    boutons secondaires posés au-dessus (`position: relative; z-index`) pour rester cliquables ;
  - soit un **conteneur non interactif** où chaque action porte son propre `<button>`/`<a>`.
- **Jamais d'élément interactif imbriqué** dans un autre.

---

## IMPLÉMENTATION

### Web Component (Lit)
```html
<!-- Default -->
<agtc-card>
  <p>Contenu de la carte.</p>
</agtc-card>

<!-- Elevated -->
<agtc-card variant="elevated">
  <p>Carte mise en avant.</p>
</agtc-card>

<!-- Flat -->
<agtc-card variant="flat">
  <p>Section secondaire.</p>
</agtc-card>

<!-- Avec header et footer -->
<agtc-card padding="lg">
  <span slot="header">Paramètres du compte</span>
  <p>Gérez vos informations personnelles.</p>
  <div slot="footer">
    <agtc-button variant="primary">Enregistrer</agtc-button>
  </div>
</agtc-card>

<!-- Padding none — image plein-bord -->
<agtc-card variant="elevated" padding="none">
  <img src="cover.jpg" alt="Couverture" style="width:100%;display:block">
  <div style="padding:var(--agtc-semantic-space-layout-component)">
    <h3>Titre</h3>
  </div>
</agtc-card>
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'une variante | Principal Designer + Tech Lead |
| Modification d'un token | Principal Designer |
| Ajout d'un nouveau slot | Design system team |
| Correction bug accessibilité | Review design system team |
