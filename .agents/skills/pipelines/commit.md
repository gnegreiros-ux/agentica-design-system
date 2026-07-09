# Pipeline : commit

> Règles de commit à appliquer systématiquement avant tout `git commit`.
> **Statut :** ✅ Actif
> **Déclencheur :** systématique — dernier pipeline avant le commit

---

## Checklist pré-commit

### 1. Format du message (ADR-014)

```
type(scope): description courte en minuscules

[corps optionnel]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types valides : `feat` `fix` `token` `docs` `a11y` `style` `refactor` `test` `chore` `ci`

❌ Messages interdits : `"update"`, `"fix"`, `"wip"`, `"changes"`, `"misc"`

### 2. Périmètre du commit

- ✅ Un seul commit cohérent par session de modifications
- ✅ Tous les fichiers liés au changement dans le même commit
- ❌ Jamais de commit partiel qui laisse le repo dans un état incohérent (ex: ADR créé mais site non rebuild)

### 3. Fichiers à ne jamais commiter

- ❌ Fichiers `.env` ou secrets
- ❌ Binaires non intentionnels (sauf Brand/ et assets explicitement approuvés)
- ⚠️ `.DS_Store` — à inclure si présent (convention projet, voir memory)

### 4. `--no-verify` interdit

❌ Ne jamais utiliser `git commit --no-verify`.
Si un hook échoue → diagnostiquer et corriger, ne pas contourner.

### 5. Push immédiat après commit

✅ Toujours pousser juste après le commit.
✅ Vérifier que le push réussit (pas de rejet remote).

---

## Commandes de référence

```bash
# Staging sélectif (pas de git add -A sans vérification)
git add [fichiers spécifiques]

# Vérification avant commit
git diff --staged

# Commit avec heredoc (évite les problèmes d'échappement)
git commit -m "$(cat <<'EOF'
type(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# Push
git push
```

---

## Rapport partiel (exemple)

```
### 6. Commit
- [x] Format : docs(adr): ADR-029 quality gate pré-commit modulaire
- [x] Fichiers staged : decisions/ADR-029.md, decisions/README.md, .claude/skills/, site/dist/
- [x] Push réussi → origin/main à jour
```
