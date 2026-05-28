# Rule : git-workflow

> Conventions Git pour ce projet. À lire avant d'ouvrir une PR ou de faire un commit.
> **Type:** rule
> **Chemin logique:** .claude/rules/git-workflow.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/development.md, .claude/rules/tokens-system.md

---

## Structure des branches

```
main          ← production stable, protégée
develop       ← intégration, tests
feature/[xx]  ← nouvelle fonctionnalité
fix/[xx]      ← correction de bug
token/[xx]    ← modification de tokens (approbation requise)
docs/[xx]     ← documentation uniquement
chore/[xx]    ← maintenance, configuration
```

---

## Convention de commits (Conventional Commits)

Format : `[type]([scope]): [description courte]`

| Type | Usage |
|------|-------|
| `feat` | Nouveau composant ou fonctionnalité |
| `fix` | Correction de bug |
| `token` | Modification de tokens (déclenche revue obligatoire) |
| `docs` | Documentation uniquement |
| `a11y` | Amélioration d'accessibilité |
| `style` | Changement de style sans impact fonctionnel |
| `refactor` | Refactoring sans changement de comportement |
| `test` | Ajout ou modification de tests |
| `chore` | Maintenance, dépendances |
| `ci` | Configuration CI/CD |

### Exemples valides
```
feat(button): ajouter variante ghost avec états hover/focus
fix(input): corriger le ratio de contraste en état d'erreur (4.2 → 4.5)
token(semantic): ajouter color.feedback.warning pour les alertes
docs(button): mettre à jour le contrat avec les règles d'escalade
a11y(modal): ajouter gestion du focus trap et aria-modal
```

---

## Règles de PR

### Titre de la PR
Même format que les commits : `[type]([scope]): [description]`

### Description de la PR
```markdown
## Changement
[Décrire ce qui change et pourquoi]

## Impact tokens
- [ ] Aucun token modifié
- [ ] Tokens primitifs modifiés → lister lesquels
- [ ] Tokens sémantiques modifiés → lister lesquels
- [ ] Tokens de composant modifiés → APPROBATION PRINCIPALE REQUISE

## Accessibilité
- [ ] axe-core : 0 violations critiques
- [ ] Focus visible testé
- [ ] Contraste vérifié

## Tests
- [ ] Storybook story créée/mise à jour
- [ ] Chromatic : captures approuvées
- [ ] Tests unitaires passent
```

---

## Règles de protection

- `main` : merge uniquement via PR + 2 approbations + CI verte
- `develop` : merge uniquement via PR + 1 approbation + CI verte
- Toute PR modifiant `tokens/component.json` requiert l'approbation du Principal Designer

---

## Règle pour les agents

Un agent peut :
- ✅ Créer une branche `fix/` ou `docs/`
- ✅ Faire des commits sur une branche feature
- ✅ Ouvrir une PR avec description complète
- ❌ Merger une PR sans approbation humaine
- ❌ Pusher directement sur `main` ou `develop`
- ❌ Modifier `tokens/component.json` sans approbation explicite
