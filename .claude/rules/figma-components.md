# Rule : figma-components

> Stub — règles complètes dans `.claude/instructions/figma-components.md`.
> Charger ce fichier **uniquement** lors du travail sur les scripts Figma.
> **Type:** rule
> **Chemin logique:** .claude/rules/figma-components.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** .claude/instructions/figma-components.md, .claude/rules/tokens-system.md

---

## Règle absolue (rappel)

Tout fill ou stroke dans un script Figma passe par `vFill(tokenSémantique, fallbackHex)`.
Jamais de `hexRgb()` direct, jamais de token primitif dans un composant.

---

## Document complet

`.claude/instructions/figma-components.md` contient 23 sections :
§0 Règle fondamentale · §1 Propriétés de composant · §2 Auto-layout · §3 Architecture
§4 Nommage · §5 Variables & Styles (tableau de mapping tokens → hex) · §6 Performances
§7 Checklist publication · §8 Mise en page pages composant · §9 Template DO/DON'T
§10 Liens obligatoires · §11 Palette accessibilité · §12 Décorations gradient hero
§13 Fond de canevas #535353 · §14 Police Atkinson Hyperlegible · §15 Showcase instances
§16 Frame "Composant principal" · §17 Rows variables (WRAP+FILL) · §18 Token composant
avant sémantique · §19 textStyleId obligatoire · §20 Icônes instance-swap (constraints
SCALE) · §21 Validation dimensions/contrastes/affichage · §22 Audit complet (9 catégories,
dont parité code↔Figma après instruction visuelle directe) · §23 Test de combinaisons
variantes × états × contenu (méthode EightShapes — anneaux de focus en wrapper HUG)

**Lire `.claude/instructions/figma-components.md` avant tout travail sur un script plugin Figma.**
**Lire aussi `.claude/rules/figma-library-governance.md`** — charte code-source-de-vérité,
tokens-only, parité architecture/rendu, veille des bonnes pratiques.
