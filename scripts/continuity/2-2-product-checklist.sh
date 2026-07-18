#!/usr/bin/env bash
# How-to-without-agents.md §2.2 — replacement checklist for a consuming project.
# Usage: scripts/continuity/2-2-product-checklist.sh <path-to-consuming-project>
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <path-to-consuming-project>"
  exit 1
fi

echo "[2.2] Token audit on $TARGET (node scripts/audit-tokens.js --src-dir <path>)"
node scripts/audit-tokens.js --src-dir "$TARGET"

cat <<'EOF'

Reminders to confirm manually (cannot be scripted from this repository):
  - Contrast: https://webaim.org/resources/contrastchecker/
  - Accessibility: "axe DevTools" browser extension
  - UX pattern: consult the 5 sources in .claude/rules/ux-patterns-sources.md
    and document the chosen approach directly in the consuming project
EOF

read -r -p "Contrast + accessibility + UX pattern manually verified? [y/n] " reply
if [[ "$reply" != "y" && "$reply" != "Y" ]]; then
  echo "❌ Product checklist not confirmed."
  exit 1
fi

echo "✅ Product checklist completed."
