# ADR-067 — Nouvelle catégorie de token : `letterSpacing`

> **Date :** 2026-07-08
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead (sémantique) — Principal Designer (primitive)
> **Type:** token
> **Chemin logique:** decisions/ADR-067-letter-spacing-token-category.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** tokens/primitives.json (primitive.letterSpacing), tokens/semantic.json (semantic.typography.letter-spacing), components/agtc-code-block.js, guidelines/components/code-block.md

---

## Contexte

Audit de dette de tokens sur `components/agtc-code-block.js` (indicateur de langue, ~ligne 79-81) :
trois valeurs de typographie codées en dur, en violation de `.claude/rules/tokens-system.md` :

| Valeur en dur | Emplacement |
|---------------|-------------|
| `line-height: 1.6` | Corps du code (`code`, `::slotted(code)`) |
| `font-weight: 600` | `.language` (indicateur de langue, ex. `HTML`, `JSON`) |
| `letter-spacing: 0.06em` | `.language` |

Le premier point (`line-height: 1.6`) était une correction mécanique : `primitive.lineHeight.reading`
valait déjà `1.6` et un alias sémantique (`semantic.typography.detail.line-height`) existait déjà —
pas de nouveau token, câblage direct.

Le deuxième point (`font-weight: 600`) n'a pas de primitive à `600` — seulement `regular:400`,
`medium:500`, `bold:700`. Présenté à l'humain, qui a choisi de **réutiliser `medium` (500)**
plutôt que d'ajouter une primitive `semibold:600` — acceptant un changement visuel mineur du badge
de langue plutôt qu'élargir l'échelle de graisses. Câblé sur `semantic.typography.label.weight`
(déjà utilisé ailleurs, ex. `component.top-nav.tab.font-weight`).

Le troisième point (`letter-spacing: 0.06em`) n'avait **aucune catégorie existante** — ni primitive
ni sémantique. C'est l'objet de cet ADR.

---

## Décision

Créer la catégorie `letterSpacing` aux deux premiers niveaux de la hiérarchie de tokens :

### Primitif — `tokens/primitives.json` → `primitive.typography.letterSpacing`

| Token | Valeur | Description |
|-------|--------|--------------|
| `letterSpacing.normal` | `0em` | Défaut — corps de texte, labels, détails |
| `letterSpacing.wide` | `0.06em` | Élargi — étiquettes en petites majuscules (compense la lisibilité réduite du texte en capitales) |

### Sémantique — `tokens/semantic.json` → `semantic.typography.letter-spacing`

| Token | Alias | Intention |
|-------|-------|-----------|
| `letter-spacing.normal` | `{primitive.letterSpacing.normal}` | Défaut — corps de texte, labels, détails en casse normale |
| `letter-spacing.wide` | `{primitive.letterSpacing.wide}` | Étiquettes en petites majuscules (indicateur de langue de code, eyebrow marketing) où l'espacement compense la réduction de lisibilité du texte en capitales |

Variable CSS générée : `--agtc-semantic-typography-letter-spacing-wide` (Style Dictionary,
convention `--agtc-semantic-[groupe]-[rôle]`).

### Consommateur immédiat

`components/agtc-code-block.js` (`.language`) :

```css
.language {
  text-transform: uppercase;
  letter-spacing: var(--agtc-semantic-typography-letter-spacing-wide, 0.06em);
  font-weight: var(--agtc-semantic-typography-label-weight, 500);
  flex-shrink: 0;
}
```

---

## Argumentaire

- `0.06em` est une valeur d'espacement de lettres standard pour du texte en majuscules à petite
  taille (compense la perte de lisibilité liée à `text-transform:uppercase`) — pattern répété
  potentiellement ailleurs (ex. `semantic.typography.marketing.eyebrow`, qui mentionne déjà
  « letter-spacing large » dans son `$intent` sans token dédié — dette préexistante non traitée
  par cet ADR, à corriger dans un futur audit dédié).
- Créer la catégorie maintenant, plutôt qu'une valeur en dur locale, évite de répéter la même
  dette au prochain composant qui aura besoin du même espacement (eyebrow marketing, badges).
- Impact cross-équipe : catégorie de token nouvelle, visible par tous les agents et designers qui
  consomment `tokens/semantic.json` → déclenche le trigger ADR (`pipelines/adr-triggers.md`,
  règle « changement de token sémantique »).

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Garder `0.06em` en dur avec commentaire | Viole `tokens-system.md` — c'était précisément la dette à corriger |
| Ajouter `letter-spacing.wide` uniquement au niveau composant (`component.code-block.language.letter-spacing`) | Saute le niveau sémantique (ADR-001) ; l'intention « espacement large pour capitales » est réutilisable au-delà du code-block (eyebrow marketing) |
| Ajouter `primitive.fontWeight.semibold: 600` pour préserver le rendu visuel exact du badge | Rejeté par l'humain — `medium` (500) suffisant, évite d'élargir l'échelle de graisses pour un seul consommateur |

---

## Conséquences

**Pour les agents :** toute future étiquette en petites majuscules (badges, eyebrow) doit consommer
`semantic.typography.letter-spacing.wide` plutôt qu'une valeur en dur.

**Pour le système :** `agtc-code-block.js` n'a plus aucune valeur de typographie codée en dur.
Dette résiduelle identifiée mais **hors périmètre** de cet ADR : `semantic.typography.marketing.eyebrow`
mentionne un letter-spacing large dans son `$intent` sans token câblé — à auditer séparément.

**Build :** `npm run tokens` régénéré (0 fantôme) ; `node site/build.js` régénéré
(`site/dist/tokens.css` — 814 variables définies, 270 référencées, 0 fantôme).

**Gouvernance :** nouvelle catégorie sémantique → approbation Design System Lead ; primitive →
approbation Principal Designer. Les deux approuvées par l'humain le 2026-07-08 (voir décision
ci-dessus sur le choix `medium` vs nouvelle primitive `semibold`).
