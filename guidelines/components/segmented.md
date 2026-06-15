# Composant : Segmented — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-04
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/segmented.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-044-agtc-segmented-implementation.md, guidelines/components/radio.md, guidelines/components/toggle.md, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Choisir **une** option parmi 2 à 5, avec **effet immédiat**, dans un contrôle compact (segments
connectés). Formalise la bascule de langue FR/EN du site (~114 usages).

**Ce composant n'est pas :**
- Un groupe radio de formulaire (`agtc-radio-group`) — soumis avec le formulaire, navigation flèches
- Un interrupteur on/off (`agtc-toggle`)
- Des onglets de contenu (`tablist`) — qui changent de panneau
- Un menu déroulant (au-delà de 5 options → `select`)

---

## DISTINCTION AVEC `agtc-radio-group`

| | `agtc-segmented` | `agtc-radio-group` |
|---|------------------|--------------------|
| Effet | **Immédiat** | Soumis avec le formulaire |
| ARIA | Groupe de `<button>` + `aria-current` | `role="radiogroup"` + `role="radio"` |
| Clavier | **Tab** entre segments (natif) | **Flèches** + roving tabindex |
| Usage | Réglage / vue (densité, langue, liste/grille) | Choix de formulaire (plan, civilité) |

> Écart de pattern **assumé** (Primer) : un segmented à effet immédiat ne doit pas être un radiogroup.

---

## PROPRIÉTÉS

| Attribut / Propriété | Type | Défaut | Description |
|----------------------|------|--------|-------------|
| `.options` | Array | `[]` | `[{ value, label, icon? } \| "Label"]` |
| `value` | String | — | Valeur sélectionnée (toujours exactement une) |
| `label` | String | — | **aria-label du groupe (requis)** |
| `equal-width` | Boolean | `false` | Segments à largeur égale |

Émet **`change`** (`detail: { value }`) à chaque sélection.

---

## TOKENS UTILISÉS

| Rôle | Token |
|------|-------|
| Fond du rail | `component.segmented.default.track-background` |
| Texte d'un segment | `component.segmented.default.text` |
| Texte au survol | `component.segmented.default.text-hover` |
| Fond du segment sélectionné | `component.segmented.default.selected-background` |
| Texte du segment sélectionné | `component.segmented.default.selected-text` |
| Anneau de focus | `component.segmented.default.border-focus` |
| Rayon | `component.segmented.default.radius` |

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Rôle | `role="group"` + `aria-label` sur le rail |
| Segment sélectionné | `aria-current="true"` (les autres `false`) |
| Clavier | `<button>` natifs — Tab entre segments, Entrée/Espace pour activer |
| État sélectionné | Pas par la couleur seule : fond plein + poids `700` (WCAG 1.4.1) |
| Focus | `:focus-visible` tokenisé par segment (WCAG 2.4.7) |

---

## COMPORTEMENTS

- **Effet immédiat** — la sélection s'applique au clic/activation (émet `change`).
- **Toujours un actif** — pas d'état vide.
- **2 à 5 options** courtes ; au-delà, préférer `select` ou des onglets.

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| `role="radiogroup"` + flèches sur un contrôle à effet immédiat | Pattern inadapté (implique soumission) — Primer |
| `role="tablist"` si ça ne change pas un panneau de contenu | Mauvaise sémantique |
| Plus de 5 options ou libellés longs | Illisible — utiliser `select` |
| État sélectionné par la couleur seule | WCAG 1.4.1 |
| Aucun `label` | Groupe non nommé pour les AT |

---

## Patterns UX de référence

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036/044). Décision : **SG1–SG8 tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Mono-sélection, toujours un actif | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Pas d'état vide |
| Groupe de `<button>` + `aria-current` + effet immédiat | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Écart assumé vs radiogroup |
| 2–5 options, libellés courts | NN/g | ✅ | Guidance documentée |
| Sélectionné pas par la couleur seule | [WCAG 1.4.1](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) | ✅ | Fond plein + poids 700 |
| Effet immédiat (pas de « appliquer ») | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Émet `change` |
| `:focus-visible` par segment, Tab natif | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Boutons natifs |
| Segments largeur égale, icône + libellé | NN/g | ✅ | `equal-width`, `icon` optionnels |
| API `value` + événement `change` | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Intégration |

---

## IMPLÉMENTATION

### Composant (Lit, piloté par données)
```html
<agtc-segmented label="Langue" value="fr"></agtc-segmented>
<script>
  const s = document.querySelector('agtc-segmented');
  s.options = [{ value: 'fr', label: 'FR' }, { value: 'en', label: 'EN' }];
  s.addEventListener('change', (e) => setLanguage(e.detail.value));
</script>
```

### Classe (HTML statique du site)
```html
<div class="agtc-segmented" role="group" aria-label="Langue">
  <button type="button" aria-current="true">FR</button>
  <button type="button" aria-current="false">EN</button>
</div>
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'un mode multi-sélection | Principal Designer + Tech Lead + nouvel ADR |
| Modification d'un token | Principal Designer |
| Changement du pattern ARIA | Principal Designer + revue accessibilité |
| Correction bug accessibilité | Review design system team |
