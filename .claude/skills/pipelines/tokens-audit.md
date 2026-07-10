# Pipeline: tokens-audit

> Verifies token system consistency after any modification.
> **Status:** ✅ Active
> **Trigger:** any change in `tokens/`, `site/build.js`, `components/`, `guidelines/`

---

## Triggers

| Modified file | Pipeline triggered |
|----------------|-------------------|
| `tokens/primitives.json` | Yes — full verification |
| `tokens/semantic.json` | Yes — full verification |
| `tokens/component.json` | Yes — Principal Designer approval required |
| `site/build.js` | Yes — hardcoded value check |
| `components/*.js` | Yes — component token check |

---

## Checks

### 1. Forbidden hardcoded values

Search the modified files:

```bash
# Hex colors
grep -rn '#[0-9a-fA-F]\{3,6\}' components/ site/build.js --include="*.js" --include="*.css"

# CSS px sizes (excluding border and outline)
grep -rn 'font-size:\s*[0-9]' site/build.js

# Hardcoded font-family
grep -rn "font-family:\s*['\"]" site/build.js | grep -v "var(--sda"

# Hardcoded padding/margin in components
grep -rn 'padding:\s*[0-9]' components/
```

**Zero tolerance**: every violation = commit blocked.

### 2. Phantom references

Verify that every token referenced in `semantic.json` exists in `primitives.json`:
- Every `{primitive.X.Y}` → matching entry in `primitives.json`

Verify that every token referenced in `component.json` exists in `semantic.json`:
- Every `var(--agtc-semantic-X)` → token in `semantic.json`

### 3. Orphan tokens

Verify that every token in `primitives.json` is referenced at least once by `semantic.json`.
Flag orphans — they don't block the commit but must be documented.

### 4. 4px grid (ADR-020)

Every spacing token must be a multiple of 4px:
```
4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80...
```
A `space-6: 6px` token is a violation.

### 5. Minor Third scale (ADR-023)

`fontSize` tokens may only take these rem values:
```
xs: 0.75rem | sm: 0.875rem | base: 1rem | lg: 1.25rem | xl: 1.5rem
2xl: 1.75rem | 3xl: 2rem | 4xl: 2.5rem | 5xl: 3rem
```
Any other value is a violation.

### 6. Component token governance

If `tokens/component.json` is modified:
- ⛔ Blocked — explicit Principal Designer approval required before any commit
- Open a documented TCR (Token Change Request)

---

## Automated audit command

```bash
node scripts/audit-tokens.js --ci
# exit 1 on critical violations
# exit 0 if clean (warnings tolerated)
```

---

## Partial report (example)

```
### 1. Token consistency
- [x] No hardcoded hex value in site/build.js (✓ clean grep)
- [x] No hardcoded font-size px
- [x] All {primitive.X} resolved
- [ ] ⚠️ Orphan token detected: primitive.color.rose.12 — not referenced by semantic.json
- [x] 4px grid respected
- [x] Minor Third scale respected
```
