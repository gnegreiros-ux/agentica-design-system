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

`.claude/instructions/figma-components.md` contient les 16 sections :
§0 Règle fondamentale · §1 Propriétés de composant · §2 Auto-layout · §3 Architecture
§4 Nommage · §5 Variables & Styles (tableau de mapping tokens → hex) · §6 Performances
§7 Checklist publication · §8 Mise en page pages composant · §9 Template DO/DON'T
§10 Liens obligatoires · §11 Palette accessibilité · §12 Décorations gradient hero
§13 Fond de canevas #535353 · §14 Police Atkinson Hyperlegible · §15 Showcase instances
§16 Frame "Composant principal"

**Lire `.claude/instructions/figma-components.md` avant tout travail sur un script plugin Figma.**
