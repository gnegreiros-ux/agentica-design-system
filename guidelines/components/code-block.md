# Composant : Code Block — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-03
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/code-block.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-041-agtc-code-block-implementation.md, decisions/ADR-028-atkinson-hyperlegible-mono.md, DESIGN.md

---

## Intention

**Pourquoi ce composant existe :**
Afficher un extrait de code en **lecture seule**, copiable, avec indicateur de langue, sur une
surface sombre. Présent sur quasiment chaque page composant et ADR du site (71 usages `code-block`).

**Ce composant n'est pas :**
- Un éditeur de code (lecture seule — pas de saisie)
- Un terminal interactif
- Un bloc de citation (`<blockquote>`) ou un encart (`<agtc-banner>`)

---

## Architecture — le « mix » (ADR-041)

| Forme | Usage | Rendu |
|-------|-------|-------|
| **Composant** `<agtc-code-block>` | Apps, contextes JS, Storybook | Code via `<slot>`, langue + bouton copier intégrés (shadow DOM) |
| **Classe** `.code-block` sur `<pre>` | Site statique | `<pre class="code-block">` stylé par tokens, bouton copier ajouté par `site.js` |

> Les deux consomment les mêmes tokens `component.code-block.*` et la police `semantic.typography.mono`.

---

## Propriétés (composant `<agtc-code-block>`)

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `language` | String | — | Indicateur de langue affiché (`html`, `json`, `css`, `javascript`…) |
| `filename` | String | — | En-tête optionnel — nom de fichier / titre du snippet |
| `copy-label` | String | `Copier` | Libellé du bouton copier |
| `copied-label` | String | `Copié !` | Libellé après copie réussie |

Le code est fourni via le **slot** (HTML déjà échappé par l'auteur).

---

## Tokens utilisés

| Rôle | Token |
|------|-------|
| Fond du bloc (sombre) | `component.code-block.default.background` |
| Texte du code | `component.code-block.default.text` |
| Métadonnées (langue, fichier) | `component.code-block.default.meta-text` |
| Fond du bouton copier | `component.code-block.default.copy-background` |
| Fond du bouton au survol | `component.code-block.default.copy-background-hover` |
| Texte du bouton copier | `component.code-block.default.copy-text` |
| Anneau de focus | `component.code-block.default.border-focus` |
| Rayon | `component.code-block.default.radius` |
| Taille de police | `component.code-block.default.font-size` |
| Padding horizontal / vertical | `component.code-block.default.padding-x` / `padding-y` |
| Police monospace | `semantic.typography.mono.family` (ADR-028) |
| Interligne du corps de code | `semantic.typography.detail.line-height` |
| Graisse de l'indicateur de langue | `semantic.typography.label.weight` |
| Espacement des lettres de l'indicateur de langue | `semantic.typography.letter-spacing.wide` (ADR-067) |

---

## Accessibilité — non négociable

| Règle | Valeur |
|-------|--------|
| Sémantique | `<pre><code>` réel — jamais des `<div>` |
| Bouton copier | `<button>` réel, atteignable au clavier, `:focus-visible` visible |
| Label du bouton | `aria-label` explicite (langue incluse) |
| Feedback de copie | Annoncé aux AT via `role="status"` + `aria-live="polite"` |
| Lignes longues | Scroll horizontal (`overflow-x:auto`) — jamais de wrap qui casse le code |
| Contraste | Texte gris.4 sur gris.12 (≥ 13:1) ; bouton et langue ≥ 4.5:1 |

---

## Comportements

- **Lecture seule** — le code n'est pas éditable.
- **Copie** : clic → `navigator.clipboard.writeText()` → libellé « Copié ! » 1,6 s → annonce AT.
- **Scroll horizontal** pour les lignes longues, le bloc ne déborde jamais la page.

---

## Anti-patterns

| À éviter | Raison |
|----------|--------|
| `<div>` stylés en code | Inaccessible, pas de sémantique `<pre><code>` |
| Bouton copier sans `aria-label` ni focus | Inutilisable au clavier / lecteurs d'écran |
| Copie sans feedback annoncé | L'utilisateur AT ne sait pas que ça a marché |
| Wrap forcé des lignes longues | Casse la structure du code |
| Couleur/police codée en dur | Contourne les tokens |

---

## Patterns UX de référence

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036/041). Décision : **CD1–CD9 tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| `<pre><code>` sémantique + classe de langue | [DEV — copy code button](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8) | ✅ | Slot pour le code |
| Bouton copier + feedback texte | [roboleary](https://www.roboleary.net/2022/01/13/copy-code-to-clipboard-blog) | ✅ | `Copier` → `Copié !` |
| Bouton copier accessible (aria-label, focus-visible) | [Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) | ✅ | Corrige le bouton FR-only sans label du site |
| Succès annoncé aux AT (`role="status"` / `aria-live`) | [Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) | ✅ | Région live polie |
| Indicateur de langue | [DEV](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8) | ✅ | Attribut `language` |
| Scroll horizontal des lignes longues | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `overflow-x:auto` |
| Coloration syntaxique (contraste WCAG) | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ (différée) | **Hors v1** : texte clair haut-contraste sans dépendance ; API prête pour highlighting ultérieur |
| En-tête (nom de fichier / titre) | [DEV](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8) | ✅ | Attribut `filename` optionnel |
| Numéros de ligne | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ❌ | Hors v1 — bruit visuel ; ajout ultérieur si besoin |

---

## Implémentation

### Composant (Lit, slotté)
```html
<agtc-code-block language="html" filename="exemple.html">
  <code>&lt;agtc-badge variant="success"&gt;Validé&lt;/agtc-badge&gt;</code>
</agtc-code-block>
```

### Classe (HTML statique du site)
```html
<pre class="code-block"><code class="lang-html">&lt;agtc-badge variant="success"&gt;Validé&lt;/agtc-badge&gt;</code></pre>
```

---

## Gouvernance

| Action | Approbation requise |
|--------|-------------------|
| Ajout coloration syntaxique / numéros de ligne | Principal Designer + Tech Lead + nouvel ADR |
| Modification d'un token | Principal Designer |
| Changement de thème (sombre → clair) | Principal Designer |
| Correction bug accessibilité | Review design system team |
