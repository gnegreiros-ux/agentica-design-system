# Pipeline : chromatic

> Tests de régression visuelle via Chromatic (captures de composants).
> **Statut :** 🔜 Planifié — non bloquant jusqu'à activation
> **Déclencheur :** tout changement dans `components/`, `tokens/`

---

## Objectif

Quand activé, ce pipeline :
1. Publie les stories sur Chromatic
2. Compare les captures avec le baseline approuvé
3. Bloque le commit si des régressions visuelles non approuvées sont détectées

---

## Commande (future)

```bash
npx chromatic --project-token=[TOKEN] --exit-zero-on-changes
```

## Checks à implémenter

- [ ] Chromatic exit 0 ou changements explicitement approuvés
- [ ] Aucune régression non intentionnelle sur les composants existants
- [ ] Captures de tous les états : default, hover, focus, disabled, loading

## Activation

1. Créer un projet sur chromatic.com
2. Ajouter `CHROMATIC_PROJECT_TOKEN` dans les secrets GitHub
3. Configurer le workflow CI (`.github/workflows/`)
4. Changer le statut à `✅ Actif`
5. Référencer ADR-006
