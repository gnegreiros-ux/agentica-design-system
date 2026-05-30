# Pipeline : tokens-audit

> Vérifie la cohérence du système de tokens après toute modification.
> **Statut :** ✅ Actif
> **Déclencheur :** tout changement dans `tokens/`, `site/build.js`, `components/`, `guidelines/`

---

## Déclencheurs

| Fichier modifié | Pipeline déclenché |
|----------------|-------------------|
| `tokens/primitives.json` | Oui — vérification complète |
| `tokens/semantic.json` | Oui — vérification complète |
| `tokens/component.json` | Oui — approbation Principal Designer requise |
| `site/build.js` | Oui — vérification valeurs hardcodées |
| `components/*.js` | Oui — vérification tokens de composant |

---

## Checks

### 1. Valeurs hardcodées interdites

Chercher dans les fichiers modifiés :

```bash
# Couleurs hex
grep -rn '#[0-9a-fA-F]\{3,6\}' components/ site/build.js --include="*.js" --include="*.css"

# Tailles px en CSS (hors border et outline)
grep -rn 'font-size:\s*[0-9]' site/build.js

# font-family hardcodé
grep -rn "font-family:\s*['\"]" site/build.js | grep -v "var(--sda"

# padding/margin en dur dans les composants
grep -rn 'padding:\s*[0-9]' components/
```

**Tolérance zéro** : chaque violation = blocage du commit.

### 2. Références fantômes

Vérifier que tout token référencé dans `semantic.json` existe dans `primitives.json` :
- Chaque `{primitive.X.Y}` → entrée correspondante dans `primitives.json`

Vérifier que tout token référencé dans `component.json` existe dans `semantic.json` :
- Chaque `var(--sda-semantic-X)` → token dans `semantic.json`

### 3. Tokens orphelins

Vérifier que tout token dans `primitives.json` est référencé au moins une fois par `semantic.json`.
Signaler les orphelins — ils ne bloquent pas le commit mais doivent être documentés.

### 4. Grille 4px (ADR-020)

Tout token d'espacement doit être un multiple de 4px :
```
4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80...
```
Un token `space-6: 6px` est une violation.

### 5. Échelle Minor Third (ADR-023)

Les tokens `fontSize` ne peuvent prendre que ces valeurs rem :
```
xs: 0.75rem | sm: 0.875rem | base: 1rem | lg: 1.25rem | xl: 1.5rem
2xl: 1.75rem | 3xl: 2rem | 4xl: 2.5rem | 5xl: 3rem
```
Toute autre valeur est une violation.

### 6. Gouvernance des tokens de composant

Si `tokens/component.json` est modifié :
- ⛔ Blocage — approbation explicite du Principal Designer requise avant tout commit
- Ouvrir un TCR (Token Change Request) documenté

---

## Commande d'audit automatique

```bash
node scripts/audit-tokens.js --ci
# exit 1 si violations critiques
# exit 0 si propre (warnings tolérés)
```

---

## Rapport partiel (exemple)

```
### 1. Cohérence tokens
- [x] Aucune valeur hex hardcodée dans site/build.js (✓ grep propre)
- [x] Aucune font-size px hardcodée
- [x] Tous les {primitive.X} résolus
- [ ] ⚠️ Token orphelin détecté : primitive.color.rose.12 — non référencé par semantic.json
- [x] Grille 4px respectée
- [x] Échelle Minor Third respectée
```
