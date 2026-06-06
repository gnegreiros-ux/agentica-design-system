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

### Burn-down — résorbé (76 → 0)

Au moment de l'activation : **76 violations** (`critical`/`serious`) sur 73 pages. Toutes résorbées :

- **`color-contrast`** (cause dominante) : le teal d'action `action.primary` (teal.11) en **texte**
  sur le fond de page `#fcfcfc` (gray.1) mesurait **4.44:1** avec l'ancienne valeur `#008573` —
  échec 4.5:1 d'un cheveu, **uniformément** (boutons secondary/ghost, liens actifs de nav, code
  inline `td code`, liens de prose). Pas de palier teal Radix entre teal.11 et teal.12 (quasi-noir).
  **Résolu (ADR-050)** : teal.11 retuné `#008573` → `#007a68` = **5.14:1** sur `#fcfcfc` (texte
  blanc dessus = 5.27:1).
- **`aria-prohibited-attr`** : `aria-label` sur des `<div>` décoratifs (barres d'espacement,
  échantillons de palette) sans rôle permettant l'attribut. **Résolu** : ajout de `role="img"`.
- **`label`** (×2) : `<input>` de démo sans libellé associé. **Résolu** : association `for`/`id`.
- **`color-contrast` résiduel** (libellés de démo en état désactivé, exempts WCAG 1.4.3) : **Résolu**
  par `aria-disabled="true"` sur la ligne de démo désactivée (axe exempte les contrôles désactivés).

État : **0 violation** sur 74 pages. Le gate peut désormais basculer en **bloquant** — retirer
`AXE_BLOCKING: 'false'` du workflow `.github/workflows/axe.yml`, conformément à l'esprit d'ADR-007.
