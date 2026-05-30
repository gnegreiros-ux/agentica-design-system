# Pipeline : playwright

> Tests E2E des parcours critiques sur le site de documentation.
> **Statut :** 🔜 Planifié — non bloquant jusqu'à activation
> **Déclencheur :** tout changement dans `site/build.js`, `components/`

---

## Objectif

Quand activé, ce pipeline :
1. Lance les tests E2E sur le site déployé (ou en local)
2. Valide les parcours critiques (navigation, bascule FR/EN, explorateur de tokens)
3. Intègre l'audit axe-core par page

---

## Commande (future)

```bash
npx playwright test
```

## Parcours critiques à couvrir

- [ ] Navigation principale — tous les liens fonctionnels
- [ ] Bascule FR ↔ EN — contenu change correctement
- [ ] Filtre explorateur de tokens — résultats cohérents
- [ ] Bouton skip-link — focus positionné sur `#main-content`
- [ ] Chaque composant — états hover, focus, disabled accessibles au clavier

## Activation

1. `npm install @playwright/test`
2. `npx playwright install`
3. Créer `tests/` avec les specs
4. Changer le statut à `✅ Actif`
5. Référencer ADR-010
