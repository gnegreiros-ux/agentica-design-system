#!/usr/bin/env bash
# How-to-sans-agents.md §1.1 — outils déjà scriptés, aucun agent nécessaire.
# Usage : scripts/continuity/1-1-outils-existants.sh [--skip-visual]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SKIP_VISUAL=false
[[ "${1:-}" == "--skip-visual" ]] && SKIP_VISUAL=true

echo "[1.1] Compilation des tokens (npm run tokens)"
npm run tokens

echo "[1.1] Rebuild du site (node site/build.js)"
node site/build.js

echo "[1.1] Audit tokens (node scripts/audit-tokens.js --ci)"
node scripts/audit-tokens.js --ci

echo "[1.1] Audit accessibilité (npm run axe)"
npm run axe

if [[ "$SKIP_VISUAL" == false ]]; then
  echo "[1.1] Tests Playwright (npx playwright test --project=chromium)"
  npx playwright test --project=chromium

  echo "[1.1] Chromatic (npm run chromatic)"
  npm run chromatic
else
  echo "[1.1] --skip-visual : Playwright et Chromatic ignorés (nécessitent des services externes)"
fi

echo "[1.1] OK — tous les outils existants ont tourné sans agent IA."
