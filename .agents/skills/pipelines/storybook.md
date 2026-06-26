# Pipeline : storybook

> Validation des stories de composants et cohérence avec le système de tokens.
> **Statut :** 🔜 Planifié — non bloquant jusqu'à activation
> **Déclencheur :** tout changement dans `components/`

---

## Objectif

Quand activé, ce pipeline :
1. Vérifie que chaque composant a une story Storybook correspondante
2. Lance le build Storybook pour détecter les erreurs de compilation
3. Valide que les args/controls reflètent les variantes définies dans `tokens/component.json`

---

## Commandes (futures)

```bash
# Build
npx storybook build

# Tests
npx storybook test
```

## Checks à implémenter

- [ ] Chaque `components/ds-[nom].js` a un `stories/ds-[nom].stories.js`
- [ ] Les variantes dans la story correspondent aux variantes dans `component.json`
- [ ] Build Storybook exit 0 (aucune erreur)
- [ ] Aucun import de valeur hardcodée dans les stories

## Activation

1. Installer : `npx storybook@latest init`
2. Configurer pour Web Components (Lit)
3. Changer le statut à `✅ Actif`
4. Créer ADR-009 est déjà prévu — vérifier et activer
