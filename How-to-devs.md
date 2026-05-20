# How-to — Développeurs (équipe design system)

> Ce guide s'adresse à l'équipe qui **maintient** le système, pas aux équipes produit.
> Dernier mot toujours humain. Les agents proposent, vous approuvez.

---

## 1. Setup initial

### Cloner et installer
```bash
git clone [REPO_URL]
cd agentic-design-system
npm install
```

### Activer le lint DS
```bash
# Ajouter .eslintrc-ds.json au pipeline ESLint existant
cp .eslintrc-ds.json .eslintrc.json
# ou étendre depuis votre config existante :
# "extends": ["./.eslintrc-ds.json"]
```

### Compiler les tokens
```bash
npx style-dictionary build --config style-dictionary/config.json
# Génère : dist/css/, dist/js/, dist/ios/, dist/android/
```

---

## 2. Workflow quotidien

### Modifier un token existant

**Règle :** tout changement de token sémantique ou composant = TCR.

```
1. Créer une branche : tcr/[token-name]-[description]
2. Modifier le fichier JSON concerné (semantic.json ou component.json)
3. Mettre à jour session-spec.md si le token est dans le tableau de référence rapide
4. Soumettre PR → review Principal Designer obligatoire
5. Après merge : compiler + communiquer aux équipes
```

### Ajouter un composant

```
1. Créer le contrat : guidelines/components/[nom].md
2. Ajouter les tokens : tokens/component.json
3. Implémenter le Web Component (Lit)
4. Ajouter les métadonnées : .claude/skills/ai-component-metadata.md
5. Mettre à jour guidelines/components/overview.md
6. Mettre à jour session-spec.md (tableau composants)
```

### Vérifier les dérives avant une PR
```bash
# Lint anti-dérive IA
npx eslint . --ext .js,.jsx,.ts,.tsx

# Tests accessibilité
npx playwright test --grep a11y

# Tokens orphelins (à scripter selon votre setup)
npx style-dictionary build && node scripts/audit-tokens.js
```

---

## 3. Fichiers à connaître

| Fichier | Rôle | Quand le modifier |
|---------|------|-------------------|
| `tokens/semantic.json` | Source de vérité des intentions UX | Via TCR uniquement |
| `tokens/component.json` | Contrats UI | Via TCR + approbation |
| `.eslintrc-ds.json` | Lint anti-dérive IA | Si nouveau pattern à détecter |
| `.claude/instructions/session-spec.md` | Contexte rechargé chaque session IA | À chaque changement de token clé |
| `AGENTS.md` | Routeur d'agents | Si nouveau type d'agent ajouté |

---

## 4. Règles non négociables

- ❌ Jamais de valeur hex ou px en dur dans le code
- ❌ Jamais de token primitif dans un composant
- ❌ Jamais de token inventé (non défini dans semantic.json)
- ✅ Tout changement de token sémantique = TCR
- ✅ session-spec.md toujours à jour = agents fiables
