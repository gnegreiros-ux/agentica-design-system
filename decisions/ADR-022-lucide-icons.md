# ADR-022 — Lucide Icons comme bibliothèque d'icônes

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-022-lucide-icons.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, components/agtc-icon.js, guidelines/components/icon.md

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.
> `agtc-icon` n'a pas d'ADR d'implémentation dédié — sa décision de patterns est consignée ici.
> Détail et liens : `guidelines/components/icon.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Icône + texte quand le sens n'est pas universel | NN/g — icon usability |
| Label obligatoire si l'icône porte l'information | NN/g |
| Icônes décoratives masquées aux AT (`aria-hidden`) | NN/g |
| Signification cohérente et non trompeuse | IF — transparence |

---

## Contexte

Le design system référençait `<agtc-icon>` dans les exemples de composants (notamment `guidelines/components/button.md`) sans qu'aucun système d'icônes ne soit défini. Aucun token de taille d'icône n'existait. Les équipes créaient des solutions ad hoc (emoji, SVG inline, classes Tailwind) — chacune une dérive potentielle.

---

## Décision

### Bibliothèque : Lucide Icons

**Lucide** (fork de Feather Icons, MIT) est adopté comme bibliothèque d'icônes officielle du système.

**Caractéristiques techniques :**
- 1 500+ icônes, couverture UI complète
- Cohérence géométrique stricte : `strokeWidth: 1.5px` constant sur toutes les icônes
- Format SVG pur — pas de font, pas de sprite obligatoire
- Tree-shakeable — seules les icônes utilisées sont bundlées
- Licence MIT — aucune contrainte commerciale

**Adoption sectorielle :** Linear, Vercel, shadcn/ui, Raycast — signal de qualité et de pérennité.

### Web Component : `agtc-icon`

Un composant Lit encapsule Lucide et expose l'API du design system :

```javascript
// Usage
<agtc-icon name="trash-2" size="control" label="Supprimer"></agtc-icon>
<agtc-icon name="check" size="inline" decorative></agtc-icon>
```

**Props :**
| Prop | Type | Valeurs | Défaut |
|------|------|---------|--------|
| `name` | String | Nom Lucide (ex: `"trash-2"`) | — (requis) |
| `size` | String | `"inline"` / `"control"` / `"nav"` | `"control"` |
| `label` | String | Texte accessible | — |
| `decorative` | Boolean | Icône purement décorative | `false` |

**Règle WCAG 1.1.1 :** Si `decorative` est absent, `label` est obligatoire → `aria-label` injecté. Si `decorative` est présent → `aria-hidden="true"`.

### Tokens de taille d'icône

```json
// primitives.json
"iconSize": {
  "sm": "16px",  // inline — dans un texte
  "md": "20px",  // control — dans un bouton, input
  "lg": "24px"   // nav — navigation, emphase
}

// semantic.json
"icon.size.inline":  "{primitive.iconSize.sm}"
"icon.size.control": "{primitive.iconSize.md}"
"icon.size.nav":     "{primitive.iconSize.lg}"
```

### Intégration dans le site de documentation

Lucide est ajouté comme dépendance npm dans `site/package.json`. Le build génère une page de référence des icônes à `site/dist/components/icon.html`.

---

## Argumentaire WCAG

- **1.1.1 (Contenu non textuel) :** Toute icône sémantique a un `aria-label`. Les icônes décoratives ont `aria-hidden="true"`.
- **1.4.3 (Contraste) :** Les icônes héritent de `color: currentColor` — le contraste est celui du texte parent, toujours conforme.
- **2.5.3 (Label dans le nom) :** Les boutons icône-seule exposent leur label via `aria-label` sur `agtc-icon`.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Material Icons** | Font icon — problèmes FOUT, accessibilité plus complexe, couplage Google. |
| **Heroicons** | Qualité équivalente mais moindre adoption, moins de variantes. |
| **Font Awesome** | Modèle freemium, dépendance propriétaire pour icônes avancées. |
| **SVG sprite custom** | Maintenance manuelle insoutenable pour 100+ icônes. |
| **Phosphor Icons** | Qualité équivalente mais écosystème React-centrique, moins de support Web Components. |

---

## Conséquences

**Pour les tokens :**
- `primitive.iconSize` (sm/md/lg) et `semantic.icon.size` (inline/control/nav) ajoutés

**Pour les composants :**
- `components/agtc-icon.js` fournit le contrat d'implémentation Lit
- `guidelines/components/icon.md` documente les règles d'usage et les anti-patterns

**Pour les agents IA :**
- `size="control"` est une intention lisible — l'agent comprend que c'est une icône dans un contrôle interactif
- Les anti-patterns (icône sans label, taille en dur) sont auditables

**Pour les équipes :**
- Fin des solutions ad hoc : une seule API, un seul token, une seule bibliothèque
- Noms d'icônes documentés sur lucide.dev — référence canonique
