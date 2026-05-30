# Pipeline : adr-conformity

> Vérifie que les changements respectent les ADRs actifs.
> **Statut :** ✅ Actif
> **Déclencheur :** tout changement (sans exception)

---

## Vérification par ADR actif

### ADR-001 — Trois niveaux de tokens
- ❌ Aucun token primitif utilisé directement dans un composant
- ❌ Aucune valeur brute dans `component.json` (toujours une référence sémantique)

### ADR-004 — Gouvernance humaine
- ❌ Aucun merge sur `main` ou `develop` sans approbation humaine
- ❌ Aucune modification de `tokens/component.json` sans approbation explicite

### ADR-014 — Conventional Commits
- ✅ Format : `type(scope): description`
- ✅ Types valides : `feat`, `fix`, `token`, `docs`, `a11y`, `style`, `refactor`, `test`, `chore`, `ci`
- ❌ Pas de commit avec message vague ("update", "fix", "wip")

### ADR-016 — Journal de construction
- ✅ `log/kit-construction.md` mis à jour à chaque session
- ❌ Pas de chemins locaux `/Users/...` dans le log

### ADR-020 — Grille 4px
- ✅ Tout espacement = multiple de 4px
- ❌ Valeurs comme `6px`, `10px`, `14px`, `18px` dans les tokens d'espacement

### ADR-021 — Atkinson Hyperlegible (sans-serif)
- ✅ Police principale via `var(--agtc-semantic-typography-fontFamily)`
- ❌ `font-family: 'Atkinson Hyperlegible'` en dur dans le code

### ADR-023 — Échelle Minor Third
- ✅ Font-size uniquement sur les 9 échelons définis (xs→5xl)
- ❌ `font-size: 15px`, `18px`, `22px` ou tout px hors échelle

### ADR-027 — Pipeline d'impact pré-commit
- ✅ Ce quality gate est exécuté avant chaque commit
- ❌ Commit sans rapport d'impact approuvé

### ADR-028 — Atkinson Hyperlegible Mono
- ✅ Police mono via `var(--agtc-font-mono)`
- ❌ `font-family: monospace` ou `font-family: 'JetBrains Mono'` en dur

---

## Rapport partiel (exemple)

```
### 3. Conformité règles / ADRs
- [x] ADR-001 : aucun token primitif dans les composants
- [x] ADR-020 : espacements sur grille 4px
- [x] ADR-023 : font-sizes sur échelle Minor Third
- [x] ADR-028 : font-family mono via var(--agtc-font-mono)
- [ ] ⚠️ ADR-004 : tokens/component.json modifié → approbation requise
```
