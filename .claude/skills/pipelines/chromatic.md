# Pipeline : chromatic

> Tests de régression visuelle via Chromatic (captures de composants).
> **Statut :** ✅ Actif — workflow CI `.github/workflows/chromatic.yml`
> **Déclencheur :** tout changement dans `components/`, `tokens/`, `.storybook/`

---

## Objectif

Quand activé, ce pipeline :
1. Publie les stories sur Chromatic
2. Compare les captures avec le baseline approuvé
3. Bloque le commit si des régressions visuelles non approuvées sont détectées

---

## Commande

Le token est lu depuis l'environnement (`CHROMATIC_PROJECT_TOKEN`) — jamais passé en argument.

```bash
# Local : exporter le token de session, puis publier
export CHROMATIC_PROJECT_TOKEN=chpt_xxx
npm run chromatic

# CI : le workflow injecte le secret GitHub automatiquement
```

## Checks à implémenter

- [ ] Chromatic exit 0 ou changements explicitement approuvés
- [ ] Aucune régression non intentionnelle sur les composants existants
- [ ] Captures de tous les états : default, hover, focus, disabled, loading

## Activation — ✅ faite le 2026-06-01

1. ✅ Projet créé sur chromatic.com
2. ✅ Secret `CHROMATIC_PROJECT_TOKEN` ajouté dans les secrets GitHub (token régénéré — l'ancien, exposé dans l'historique git, est révoqué)
3. ✅ Workflow CI : `.github/workflows/chromatic.yml`
4. ✅ Statut → Actif
5. ✅ ADR-006 référencé

> Le token n'est **jamais** en clair dans le dépôt : ni dans `package.json`, ni dans le workflow.
> Toute rotation se fait sur chromatic.com + mise à jour du secret GitHub.
