# Pipeline : axe-core

> Audit automatique d'accessibilité WCAG via axe-core.
> **Statut :** 🔜 Planifié — non bloquant jusqu'à activation
> **Déclencheur :** tout changement dans `components/`, `site/build.js`

---

## Objectif

Quand activé, ce pipeline :
1. Exécute axe-core sur toutes les pages générées
2. Rapporte les violations critiques (niveau A et AA)
3. Bloque le commit si des violations critiques sont présentes

---

## Commandes (futures)

```bash
# Via Playwright
npx playwright test --grep axe

# Via script dédié
node scripts/axe-audit.js
```

## Règle absolue

**0 violation critique (impact: critical | serious) autorisée.**
Les violations modérées sont signalées mais non bloquantes.

## Checks à implémenter

- [ ] Exit 0 sur toutes les pages du site
- [ ] Aucune violation sur les composants (ds-button, ds-icon, etc.)
- [ ] Rapport complet dans `axe-report.json`

## Pages à auditer

- `/index.html`
- `/foundations/*.html`
- `/components/*.html`
- `/tokens/index.html`
- `/decisions/*.html`
- `/agents/index.html`

## Activation

1. `npm install axe-core @axe-core/playwright`
2. Créer `scripts/axe-audit.js`
3. Changer le statut à `✅ Actif`
4. Référencer ADR-007
