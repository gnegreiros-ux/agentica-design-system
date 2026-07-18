#!/usr/bin/env bash
# How-to-without-agents.md §1.1 — tools already scripted, no agent required.
# Usage: scripts/continuity/1-1-existing-tools.sh [--skip-visual]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SKIP_VISUAL=false
[[ "${1:-}" == "--skip-visual" ]] && SKIP_VISUAL=true

echo "[1.1] Building tokens (npm run tokens)"
npm run tokens

echo "[1.1] Rebuilding the site (node site/build.js)"
node site/build.js

echo "[1.1] Auditing tokens (node scripts/audit-tokens.js --ci)"
node scripts/audit-tokens.js --ci

echo "[1.1] Accessibility audit (npm run axe)"
npm run axe

if [[ "$SKIP_VISUAL" == false ]]; then
  echo "[1.1] Playwright tests (npx playwright test --project=chromium)"
  npx playwright test --project=chromium

  echo "[1.1] Chromatic (npm run chromatic)"
  npm run chromatic
else
  echo "[1.1] --skip-visual: Playwright and Chromatic skipped (require external services)"
fi

echo "[1.1] OK — all existing tools ran without an AI agent."
