# Pipeline: chromatic

> Visual regression tests via Chromatic (component captures).
> **Status:** ✅ Active — CI workflow `.github/workflows/chromatic.yml`
> **Trigger:** any change in `components/`, `tokens/`, `.storybook/`

---

## Objective

Once activated, this pipeline:
1. Publishes stories to Chromatic
2. Compares captures against the approved baseline
3. Blocks the commit if unapproved visual regressions are detected

---

## Command

The token is read from the environment (`CHROMATIC_PROJECT_TOKEN`) — never passed as an argument.

```bash
# Local: export the session token, then publish
export CHROMATIC_PROJECT_TOKEN=chpt_xxx
npm run chromatic

# CI: the workflow injects the GitHub secret automatically
```

## Checks to implement

- [ ] Chromatic exit 0 or changes explicitly approved
- [ ] No unintentional regression on existing components
- [ ] Captures for every state: default, hover, focus, disabled, loading

## Activation — ✅ done on 2026-06-01

1. ✅ Project created on chromatic.com
2. ✅ `CHROMATIC_PROJECT_TOKEN` secret added to GitHub secrets (token regenerated — the old one, exposed in git history, is revoked)
3. ✅ CI workflow: `.github/workflows/chromatic.yml`
4. ✅ Status → Active
5. ✅ ADR-006 referenced

> The token is **never** in plain text in the repo: not in `package.json`, not in the workflow.
> Any rotation happens on chromatic.com + a GitHub secret update.
