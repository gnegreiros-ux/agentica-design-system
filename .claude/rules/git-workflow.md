# Rule: git-workflow

> Git conventions for this project. Read before opening a PR or making a commit.
> **Type:** rule
> **Logical path:** .claude/rules/git-workflow.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/development.md, .claude/rules/tokens-system.md

---

## Branch structure

```
main          ← stable production, protected
develop       ← integration, testing
feature/[xx]  ← new feature
fix/[xx]      ← bug fix
token/[xx]    ← token change (approval required)
docs/[xx]     ← documentation only
chore/[xx]    ← maintenance, configuration
```

---

## Commit convention (Conventional Commits)

Format: `[type]([scope]): [short description]`

| Type | Usage |
|------|-------|
| `feat` | New component or feature |
| `fix` | Bug fix |
| `token` | Token change (triggers mandatory review) |
| `docs` | Documentation only |
| `a11y` | Accessibility improvement |
| `style` | Style change with no functional impact |
| `refactor` | Refactor with no behavior change |
| `test` | Adding or modifying tests |
| `chore` | Maintenance, dependencies |
| `ci` | CI/CD configuration |

### Valid examples
```
feat(button): add ghost variant with hover/focus states
fix(input): fix contrast ratio in error state (4.2 → 4.5)
token(semantic): add color.feedback.warning for alerts
docs(button): update the contract with escalation rules
a11y(modal): add focus trap and aria-modal handling
```

---

## PR rules

### PR title
Same format as commits: `[type]([scope]): [description]`

### PR description
```markdown
## Change
[Describe what changes and why]

## Token impact
- [ ] No token modified
- [ ] Primitive tokens modified → list which ones
- [ ] Semantic tokens modified → list which ones
- [ ] Component tokens modified → PRINCIPAL DESIGNER APPROVAL REQUIRED

## Accessibility
- [ ] axe-core: 0 critical violations
- [ ] Focus visibility tested
- [ ] Contrast verified

## Tests
- [ ] Storybook story created/updated
- [ ] Chromatic: captures approved
- [ ] Unit tests pass
```

---

## Protection rules

- `main`: merge only via PR + 2 approvals + green CI
- `develop`: merge only via PR + 1 approval + green CI
- Any PR modifying `tokens/component.json` requires Principal Designer approval

---

## Rule for agents

An agent can:
- ✅ Create a `fix/` or `docs/` branch
- ✅ Make commits on a feature branch
- ✅ Open a PR with a complete description
- ❌ Merge a PR without human approval
- ❌ Push directly to `main` or `develop`
- ❌ Modify `tokens/component.json` without explicit approval
