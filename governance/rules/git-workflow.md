# Rule: git-workflow

> Git conventions for this project. Read before opening a PR or making a commit.
> **Type:** rule
> **Logical path:** governance/rules/git-workflow.md
> **Read before:** AGENTS.md, DESIGN.md, governance/rules/project-overview.md
> **Relations:** governance/rules/development.md, governance/rules/tokens-system.md

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
- [ ] Visual snapshots: expected changes listed, regenerated via CI and diffed (ADR-066, ADR-104)
- [ ] Unit tests pass

## Backlog (`pipelines/backlog.md`)
- [ ] GitHub Projects tickets related to this PR verified against the actual diff
      and moved to their real status (never left in `Backlog`/`En cours` for
      something this PR shipped) <!-- lang-audit-ignore: verbatim GitHub Projects Status option values -->
- [ ] Any `Dépendance` text this PR made stale (e.g. blocking a ticket this PR <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
      just closed) corrected
- [ ] New work this PR revealed but doesn't itself close → ticket created, not
      left implicit in a commit message
```

Run this backlog check **once, at the end of the PR** — after its last commit,
before requesting merge — not after every individual commit (`pipelines/backlog.md`
explains why the cadence differs from the rest of the quality gate).

---

## Protection rules

**Current state (configured 2026-07-20, ADR-076 + ADR-077):** `main` and `develop`
both require a PR — **no direct push, not even by the admin** (`enforce_admins: true`,
ADR-077) — the `lang-audit` status check green (runs on `pull_request` and on `push`
to either `main` or `develop`), and block force-push/branch deletion. **0 approving
reviews required** on both, since `gnegreiros-ux` is currently the repository's sole
collaborator and GitHub cannot self-approve a PR.

**Required status checks, as read from branch protection on 2026-09-28** (branches must
also be up to date with the base):
- `main`: `lang-audit`, `tool-parity`, `tokens-audit`, `site-freshness`, `commit-lint`,
  `Governance & accessibility fixtures (PR gate)` (added 2026-09-28, ADR-101, #149)
- `develop`: `lang-audit`, `tool-parity`, `tokens-audit`, `site-freshness`, `commit-lint`

Branch protection lives in GitHub settings, not in a committed file — re-read it
(`gh api repos/gnegreiros-ux/agentica-design-system/branches/main/protection`) rather than
trusting this list when it matters.

**Target state once a second collaborator exists** (the rule this section originally
described, restore verbatim per ADR-076's trigger clause):
- `main`: merge only via PR + 2 approvals + green CI
- `develop`: merge only via PR + 1 approval + green CI

**`Governance & accessibility fixtures (PR gate)`** (`playwright.yml`, ADR-101, #149)
runs on every PR and is a required check on `main`: its `pull_request` trigger has no
`paths` filter (a required check skipped by one stays "pending" and blocks every PR), and
its scope lives inside the job, in a `dorny/paths-filter` step whose output guards every
later step. Never put a trigger-level `paths` filter back on it, and never split the
detection into a separate `needs:` job (a skipped required check counts as passing).
`tests/governance/playwright-workflow-gate-coverage.spec.js` enforces both, and asserts
the check stays required (a live read with the maintainer's `gh` session; skipped, with a
reason, where `gh` can't read branch protection — e.g. the CI default token).

Other CI checks (the 3-browser `Playwright` matrix, `build-and-deploy`) are not yet required
checks. `Playwright`/`build-and-deploy` only trigger on `push` to `main` today, not on
`pull_request` (see ADR-076); making them blocking pre-merge gates requires first adding
a `pull_request` trigger to `playwright.yml`, a separate decision not yet made.
`tool-parity` (`.github/workflows/tool-parity.yml`, `scripts/check-tool-parity.js`) runs on
`pull_request` and is now a required check on both `main` and `develop`: any non-Claude AI
tool config (`.github/copilot-instructions.md`, `.cursor/`, `.windsurf/`, …) must land with a
complete `governance/tool-parity/*.md` attestation in the same PR, or the PR cannot merge.

**`tokens-audit`, `site-freshness`, `commit-lint`** (added 2026-09-11) turn three of the
`quality-gate` Skill's pipelines from "Claude Code is instructed to run this before
proposing a commit" into real, tool-agnostic CI gates — `tokens-audit.yml` and
`site-freshness.yml` run on every `push`/`pull_request`, `commit-lint.yml` on
`pull_request` only (it checks the commits a PR introduces, not repeat-scans history).
All three currently pass clean on this branch. **Not yet added to
`required_status_checks`** — same reasoning as everywhere else in this section: that's a
deliberate step for a human to take once satisfied they're stable, not something this
migration should flip on its own. Recommended next action: watch them pass on a few real
PRs, then add all three (`tool-parity` included, once it has a real case) in one
branch-protection update alongside the eventual second-collaborator changes above.

There is no bypass for an emergency: if branch protection ever blocks a genuinely
urgent fix (e.g. CI itself is broken), the fix is to temporarily disable the rule in
repository settings, explicitly and visibly — not a per-push shortcut (ADR-077, after
an accidental silent bypass during this same session).

- Any PR modifying `tokens/component.json` requires Principal Designer approval

---

## Rule for agents

An agent can:
- ✅ Create a `fix/` or `docs/` branch
- ✅ Make commits on a feature branch
- ✅ Open a PR with a complete description
- ✅ Must run the backlog check (`pipelines/backlog.md`) before asking for merge
- ❌ Merge a PR without human approval
- ❌ Push directly to `main` or `develop`
- ❌ Modify `tokens/component.json` without explicit approval
