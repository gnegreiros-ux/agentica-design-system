# Composant — Icône (`agtc-icon`)

> Contrat du composant icône — règles d'usage, accessibilité et anti-patterns.
> **Type:** guideline
> **Chemin logique:** guidelines/components/icon.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** components/agtc-icon.js, tokens/semantic.json, decisions/ADR-022-lucide-icons.md, guidelines/components/button.md

---

## Bibliothèque — Lucide Icons

Lucide (MIT) est la bibliothèque d'icônes officielle du système. 1 500+ icônes, cohérence géométrique stricte (`strokeWidth: 1.5px`). Référence canonique : **lucide.dev**

---

## API du composant

```html
<!-- Icône sémantique (avec label obligatoire) -->
<agtc-icon name="trash-2" size="control" label="Supprimer le fichier"></agtc-icon>

<!-- Icône décorative (aria masquée) -->
<agtc-icon name="check" size="inline" decorative></agtc-icon>

<!-- Icône de navigation -->
<agtc-icon name="settings" size="nav" label="Paramètres"></agtc-icon>
```

| Prop | Type | Valeurs | Défaut | Requis |
|------|------|---------|--------|--------|
| `name` | String | Nom Lucide (ex: `trash-2`) | — | ✅ |
| `size` | String | `inline` / `control` / `nav` | `control` | — |
| `label` | String | Texte accessible | — | Si non décoratif |
| `decorative` | Boolean | Icône purement ornementale | `false` | — |

---

## Tailles et tokens

| `size` | Token sémantique | Valeur | Contexte |
|--------|-----------------|--------|---------|
| `inline` | `semantic.icon.size.inline` | 16px | Dans un texte courant, un label |
| `control` | `semantic.icon.size.control` | 20px | Dans un bouton, un input, un badge |
| `nav` | `semantic.icon.size.nav` | 24px | Navigation, en-tête, emphase |

---

## Règles absolues

```
✅ Toujours un label si l'icône est la seule information (ex: bouton icône seul)
✅ decorative si l'icône accompagne un texte qui la décrit déjà
✅ size correspond au contexte (control dans un bouton, inline dans un texte)
✅ Nom d'icône exact selon lucide.dev (kebab-case)

❌ Jamais d'icône sémantique sans label : <agtc-icon name="trash-2">
❌ Jamais de taille en dur : style="width: 20px"
❌ Jamais de variante inventée hors inline/control/nav
❌ Jamais d'icône hors bibliothèque Lucide sans approbation
```

---

## Usage avec agtc-button

```html
<!-- Bouton avec icône décorative + texte -->
<agtc-button variant="critical">
  <agtc-icon name="trash-2" size="control" decorative></agtc-icon>
  Supprimer définitivement
</agtc-button>

<!-- Bouton icône seul — label obligatoire sur agtc-icon -->
<agtc-button variant="ghost" aria-label="Fermer">
  <agtc-icon name="x" size="control" label="Fermer"></agtc-icon>
</agtc-button>
```

---

## Accessibilité — WCAG 1.1.1

| Scénario | Implémentation |
|----------|---------------|
| Icône seule (bouton, lien) | `label="Action décrite"` → `aria-label` injecté |
| Icône + texte adjacent | `decorative` → `aria-hidden="true"` |
| Icône dans un champ | `label` sur le champ parent (`aria-describedby`) |

---

## Anti-patterns à détecter

```html
❌ <agtc-icon name="trash-2"></agtc-icon>
   → Icône sémantique sans label — escalader

❌ <agtc-icon name="danger" size="control">
   → Nom "danger" inexistant dans Lucide — utiliser "alert-triangle" ou "x-circle"

❌ <svg>...</svg>  (SVG inline hors agtc-icon)
   → Dérive — pas de contrat d'accessibilité ni de token

❌ <agtc-icon name="check" style="width: 18px;">
   → Taille en dur — utiliser size="inline" ou size="control"
```

---

## PATTERNS UX DE RÉFÉRENCE

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.
> Pas de story Storybook pour ce composant → propagation sur 5 surfaces.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Icône + texte quand le sens n'est pas universel (ne pas se fier à l'icône seule) | [NN/g — icon usability](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `decorative` accompagne un texte ; sinon `label` requis |
| Label accessible obligatoire si l'icône porte l'information | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Règle absolue — `label` → `aria-label` |
| Icônes décoratives masquées aux AT (`aria-hidden`) | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `decorative` → `aria-hidden="true"` |
| Signification cohérente et non trompeuse (même icône = même sens partout) | [IF — transparence](https://catalogue.projectsbyif.com/) | ✅ | Cohérence sémantique imposée par la bibliothèque Lucide unique (ADR-022) |

---

## Installation

```bash
# npm (recommandé pour les projets avec bundler)
npm install lucide

# CDN (projets statiques)
<script src="https://unpkg.com/lucide@latest"></script>
```
