# Pipeline: adr-conformity

> Verifies that changes comply with active ADRs.
> **Status:** ✅ Active
> **Trigger:** every change (no exception)

---

## Verification by active ADR

### ADR-001 — Three token levels
- ❌ No primitive token used directly in a component
- ❌ No raw value in `component.json` (always a semantic reference)

### ADR-004 — Human governance
- ❌ No merge to `main` or `develop` without human approval
- ❌ No modification of `tokens/component.json` without explicit approval

### ADR-014 — Conventional Commits
- ✅ Format: `type(scope): description`
- ✅ Valid types: `feat`, `fix`, `token`, `docs`, `a11y`, `style`, `refactor`, `test`, `chore`, `ci`
- ❌ No commit with a vague message ("update", "fix", "wip")

### ADR-069 — Project tracking migration to GitHub Projects (replaces ADR-016)
- ✅ Effort reflected in GitHub Projects (status, domain)
- ❌ Do not recreate a local log/journal file for project tracking

### ADR-020 — 4px grid
- ✅ Every spacing value = multiple of 4px
- ❌ Values like `6px`, `10px`, `14px`, `18px` in spacing tokens

### ADR-021 — Atkinson Hyperlegible (sans-serif)
- ✅ Main font via `var(--agtc-semantic-typography-fontFamily)`
- ❌ `font-family: 'Atkinson Hyperlegible'` hardcoded in code

### ADR-023 — Minor Third scale
- ✅ Font-size only on the 9 defined steps (xs→5xl)
- ❌ `font-size: 15px`, `18px`, `22px` or any px value outside the scale

### ADR-027 — Pre-commit impact pipeline
- ✅ This quality gate runs before every commit
- ❌ Commit without an approved impact report

### ADR-028 — Atkinson Hyperlegible Mono
- ✅ Mono font via `var(--agtc-font-mono)`
- ❌ `font-family: monospace` or `font-family: 'JetBrains Mono'` hardcoded

---

## Partial report (example)

```
### 3. Rule / ADR conformity
- [x] ADR-001: no primitive token in components
- [x] ADR-020: spacing on the 4px grid
- [x] ADR-023: font-sizes on the Minor Third scale
- [x] ADR-028: mono font-family via var(--agtc-font-mono)
- [ ] ⚠️ ADR-004: tokens/component.json modified → approval required
```
