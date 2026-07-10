# Pipeline: commit

> Commit rules to apply systematically before every `git commit`.
> **Status:** ✅ Active
> **Trigger:** systematic — last pipeline before the commit

---

## Pre-commit checklist

### 1. Message format (ADR-014)

```
type(scope): short description in lowercase

[optional body]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Valid types: `feat` `fix` `token` `docs` `a11y` `style` `refactor` `test` `chore` `ci`

❌ Forbidden messages: `"update"`, `"fix"`, `"wip"`, `"changes"`, `"misc"`

### 2. Commit scope

- ✅ One coherent commit per round of changes
- ✅ All files related to the change in the same commit
- ❌ Never a partial commit that leaves the repo in an inconsistent state (e.g. ADR created but site not rebuilt)

### 3. Files to never commit

- ❌ `.env` files or secrets
- ❌ Unintentional binaries (except Brand/ and explicitly approved assets)
- ⚠️ `.DS_Store` — include if present (project convention, see memory)

### 4. `--no-verify` forbidden

❌ Never use `git commit --no-verify`.
If a hook fails → diagnose and fix, don't bypass it.

### 5. Push immediately after commit

✅ Always push right after the commit.
✅ Verify that the push succeeds (no remote rejection).

---

## Reference commands

```bash
# Selective staging (no git add -A without verification)
git add [specific files]

# Verify before commit
git diff --staged

# Commit with heredoc (avoids escaping issues)
git commit -m "$(cat <<'EOF'
type(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# Push
git push
```

---

## Partial report (example)

```
### 6. Commit
- [x] Format: docs(adr): ADR-029 modular pre-commit quality gate
- [x] Staged files: decisions/ADR-029.md, decisions/README.md, .claude/skills/, site/dist/
- [x] Push succeeded → origin/main up to date
```
