#!/usr/bin/env bash
# How-to-without-agents.md §1.2 — manual quality gate, replaces .claude/skills/quality-gate.md.
# Usage: scripts/continuity/1-2-manual-quality-gate.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

confirm() {
  local prompt="$1"
  local reply
  read -r -p "$prompt [y/n] " reply
  if [[ "$reply" != "y" && "$reply" != "Y" ]]; then
    echo "❌ Step not confirmed — quality gate failed."
    exit 1
  fi
}

echo "=== 1/8 — Token consistency ==="
node scripts/audit-tokens.js --ci
echo "Additional grep checks (see .claude/skills/pipelines/tokens-audit.md):"
grep -rn '#[0-9a-fA-F]\{3,6\}' components/ site/build.js --include="*.js" --include="*.css" || echo "  (no hardcoded hex value found)"

echo "=== 2/8 — WCAG ==="
npm run axe
echo "Manually verify contrast at https://webaim.org/resources/contrastchecker/ for any new color token."
confirm "Contrast manually verified for new tokens/colors?"

echo "=== 3/8 — UX pattern review (ADR-036) ==="
echo "Consult .claude/rules/ux-patterns-sources.md — 5 sources — and document the decision across the 6 surfaces."
confirm "UX pattern review done and documented across the 6 surfaces?"

echo "=== 4/8 — ADR conformance ==="
echo "Manual greps — see .claude/skills/pipelines/adr-conformity.md for the full list per ADR."
confirm "ADR conformance manually verified (grep per active ADR)?"

echo "=== 5/8 — Missing ADR triggers ==="
echo "Answer the 4 questions from .claude/skills/pipelines/adr-triggers.md."
confirm "Is a new ADR needed AND was it written if so?"

echo "=== 6/8 — Documentation ==="
echo "Checklist of files to update — see .claude/skills/pipelines/docs.md."
confirm "Documentation (guideline, log, bilingual) updated?"

echo "=== 7/8 — Rebuild site ==="
node site/build.js

echo "=== 8/8 — Commit ==="
echo "Expected Conventional Commits format: type(scope): description — never --no-verify."
echo "Reminder: project tracking lives in GitHub Projects (ADR-069), not in a repository file."

echo "✅ Manual quality gate completed."
