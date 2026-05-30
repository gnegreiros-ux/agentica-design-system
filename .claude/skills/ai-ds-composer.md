# Skill : ai-ds-composer

> Capacité réutilisable : assembler des patterns d'interface à partir du langage naturel.
> Ce skill traduit une demande en assemblage de composants valides du système.
> **Type:** skill
> **Chemin logique:** .claude/skills/ai-ds-composer.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/components/overview.md, .claude/rules/components/, tokens/component.json

---

## Objectif

Permettre la composition d'interfaces en langage naturel tout en garantissant
que le résultat respecte les règles, tokens et contrats du système de design.

---

## Processus de composition

### Étape 1 — Comprendre la demande
Extraire de la demande :
- L'objectif de l'utilisateur (ce qu'il veut accomplir)
- Le contexte (type de page, flux, plateforme)
- Les contraintes spécifiées (accessibilité, langue, densité)

### Étape 2 — Lire le catalogue
Consulter `guidelines/components/overview.md` pour identifier :
- Les composants disponibles
- Les patterns existants qui résolvent déjà ce besoin
- Les anti-patterns à éviter

### Étape 3 — Composer
Assembler les composants en respectant :
- Les règles de chaque composant (`.claude/rules/components/`)
- La hiérarchie visuelle (un seul primary par section)
- Les contraintes d'accessibilité (WCAG 2.1 AA)
- Les dépendances de tokens

### Étape 4 — Valider
Avant de retourner le résultat, vérifier :
```
✅ Tous les composants utilisés existent dans le système
✅ Aucune variante inventée
✅ Les tokens référencés existent dans component.json
✅ Pas de valeur en dur
✅ Accessibilité respectée
✅ Règles de chaque composant respectées
```

### Étape 5 — Signaler les cas non couverts
Si la demande requiert quelque chose qui n'existe pas dans le système :
- Ne pas inventer de composant
- Signaler le manque au designer responsable
- Proposer l'alternative la plus proche disponible

---

## Format de sortie

```markdown
## Composition : [titre de la demande]

### Composants utilisés
- `ds-button` (variant: primary) — action principale
- `ds-input` (type: text) — saisie du nom
- `ds-badge` (variant: success) — confirmation

### Structure
[Code HTML / pseudo-code avec les composants]

### Tokens appliqués
- background: `var(--agtc-component-button-primary-background)`
- spacing: `var(--agtc-semantic-space-layout-component)`

### Règles respectées
- [x] Un seul bouton primary
- [x] Focus visible sur tous les interactifs
- [x] Contraste suffisant

### Cas non couverts / escalade
- [ ] Le pattern de date picker n'existe pas encore → signaler au Design System Lead
```

---

## Ce que ce skill ne fait PAS

```
❌ Inventer des composants
❌ Inventer des tokens
❌ Contourner les règles d'accessibilité
❌ Décider du contenu éditorial (textes, libellés finaux)
❌ Prendre des décisions d'architecture produit
```
