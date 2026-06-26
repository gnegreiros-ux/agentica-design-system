# Pipeline : style-dictionary

> Compilation et validation des tokens via Style Dictionary.
> **Statut :** 🔜 Planifié — non bloquant jusqu'à activation
> **Déclencheur :** tout changement dans `tokens/`

---

## Objectif

Quand activé, ce pipeline :
1. Compile `tokens/primitives.json` + `tokens/semantic.json` + `tokens/component.json` → CSS, JS, Swift, Android XML
2. Valide que toutes les références se résolvent
3. Vérifie que les sorties (`dist/css/`, `dist/js/`, etc.) sont cohérentes avec les tokens sources

---

## Commande (future)

```bash
npx style-dictionary build --config style-dictionary/config.json
```

## Sorties attendues

```
dist/
├── css/variables.css       ← CSS Custom Properties
├── js/tokens.js            ← ES6 module
├── ios/tokens.swift        ← Swift
└── android/tokens.xml      ← Android XML
```

## Checks à implémenter

- [ ] Exit 0 sur la compilation (aucune erreur de résolution)
- [ ] `dist/css/variables.css` contient tous les tokens sémantiques
- [ ] Valeur résolue en CSS correspond à la valeur dans `primitives.json`
- [ ] Aucun token `{unresolved.ref}` dans les sorties

## Activation

Quand Style Dictionary est intégré au projet :
1. Installer : `npm install style-dictionary`
2. Configurer `style-dictionary/config.json`
3. Changer le statut ci-dessus à `✅ Actif`
4. Ajouter dans `quality-gate.md` → tableau des pipelines : `✅ Actif`
5. Créer ADR documentant la décision (si pas déjà fait — ADR-003 existe)
