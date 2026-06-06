# Pipeline : axe-core

> Audit automatique d'accessibilité WCAG via axe-core.
> **Statut :** ✅ Actif — **mode rapport** (non bloquant pendant le burn-down ; bascule en bloquant prévue)
> **Déclencheur :** tout changement dans `components/`, `site/build.js`, `tokens/`

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

## Activation — ✅ fait (2026-06-06)

1. ✅ `@axe-core/playwright` ajouté aux devDependencies (`npm run axe`)
2. ✅ `scripts/axe-audit.js` créé — scanne `site/dist/**`, exclut le logotype
   (`.logo`/`.hero-name`, exempt WCAG 1.4.3), exit 1 sur `critical`/`serious`
   (sauf `AXE_BLOCKING=false`). Rapport → `axe-report.json`.
3. ✅ Workflow `.github/workflows/axe.yml` — build site + audit, artefact uploadé.
4. ✅ Applique **ADR-007**.

### Burn-down avant bascule en bloquant

Au moment de l'activation : **76 violations** (`critical`/`serious`) sur 73 pages.
Cause racine dominante (corrigeable d'un seul ajustement de jeton) :

- **`color-contrast`** : le teal d'action `action.primary` (teal.11 `#008573`) en **texte**
  sur le fond de page `#fcfcfc` (gray.1) = **4.44:1** — échoue 4.5:1 d'un cheveu, **uniformément**
  (boutons secondary/ghost, liens actifs de nav, code inline `td code`, liens de prose). Il n'existe
  pas de palier teal entre teal.11 (4.44) et teal.12 (~11, quasi-noir) → nécessite un **jeton d'action
  un poil plus sombre** (décision Principal Designer). Réglé → la majorité des violations tombe.
- **`aria-prohibited-attr`** : `aria-label` sur des `<div>` décoratifs (barres d'espacement,
  échantillons) sans rôle permettant l'attribut → ajouter `role="img"` ou texte `.visually-hidden`.
- **`label`** (×2) : contrôle de formulaire sans libellé associé.

Une fois ces points résolus (0 violation), retirer `AXE_BLOCKING: 'false'` du workflow pour
**bloquer** au merge, conformément à l'esprit d'ADR-007.
