# Rule : contexts-utilisation

> Deux contextes d'utilisation dans le site Agentica — décision de "direction" éditoriale.
> **Type:** rule
> **Chemin logique:** .claude/rules/contexts-utilisation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json (semantic.marketing.*), decisions/ADR-057, guidelines/foundations/contextes.md

---

## Arbre de décision

```
La page a-t-elle pour but de CONVAINCRE ou d'ONBOARDER un visiteur ?
  → OUI : data-context="marketing"  (Mode Marketing Narratif)
  → NON  : aucun attribut           (Mode Produit SaaS — défaut)
```

En cas de doute : si la page contient de la documentation de composant ou de token → Mode Produit.

---

## Mapping des pages

| Page | Mode | Attribut |
|------|------|----------|
| `index.html` | Marketing | `data-context="marketing"` |
| `get-started.html` | Marketing | `data-context="marketing"` |
| `agents/index.html` | Marketing | `data-context="marketing"` |
| `pourquoi.html` | Marketing | `data-context="marketing"` |
| `architecture.html` | Marketing | `data-context="marketing"` |
| `qualite.html` | Marketing | `data-context="marketing"` |
| `ia.html` | Marketing | `data-context="marketing"` |
| `documentation.html` | Marketing | `data-context="marketing"` |
| Toutes les autres | Produit | *(absent)* |

---

## Mode Produit (SaaS) — défaut

- Espacement : density=`normal` (ADR-025)
- Typographie max : `semantic.typography.heading.1` (40px)
- Mise en page : grille régulière, répétabilité prioritaire
- Variation visuelle : faible — cohérence avant tout

**Tokens autorisés :** `semantic.color.*`, `semantic.space.*`, `semantic.typography.*` (hors marketing.*)

---

## Mode Marketing (Narratif) — `data-context="marketing"`

- Espacement sections : `semantic.marketing.space.section-breathing` (96px)
- Gap hero : `semantic.marketing.space.hero-gap` (120px)
- Typographie hero : `semantic.marketing.typography.display` (60px, bold, line-height display)
- Étiquette eyebrow : `semantic.marketing.typography.eyebrow` (12px, bold)
- Mise en page : asymétrie contrôlée — hiérarchie éditoriale
- Variation : contrôlée — max 3 tailles par section

**Tokens autorisés :** tous les tokens `semantic.*` + `semantic.marketing.*`

**Tokens interdits en marketing :**
```
❌ Valeurs de spacing en dur (96px, 120px) — utiliser les tokens semantic.marketing.space.*
❌ Gradient sur plus d'un élément par page (AI anti-patterns)
❌ Titre > 60px (au-delà de semantic.marketing.typography.display)
❌ Plus de 2 graisses sur la page entière
```

---

## Règles pour les agents

```
✅ Lire le mapping ci-dessus avant de générer ou modifier une page
✅ Utiliser semantic.marketing.* uniquement sur les pages data-context="marketing"
✅ Respecter les anti-patterns de Redesign/AI anti-patters.md pour les pages marketing
❌ Ajouter data-context="marketing" à une page de documentation de composant
❌ Utiliser semantic.marketing.typography.display dans un composant partagé
❌ Modifier le mapping sans approbation humaine (c'est une décision de gouvernance)
```
