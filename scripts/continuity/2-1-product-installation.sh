#!/usr/bin/env bash
# How-to-without-agents.md §2.1 — checks that an Agentica clone is usable without an agent.
# Usage: scripts/continuity/2-1-product-installation.sh <path-to-agentica-clone>
set -euo pipefail

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <path-to-agentica-clone>"
  exit 1
fi

MISSING=false
for f in "dist/tokens/css/all.css" "dist/tokens/css/dark.css"; do
  if [[ ! -f "$TARGET/$f" ]]; then
    echo "❌ Missing file: $TARGET/$f"
    MISSING=true
  fi
done

if [[ "$MISSING" == true ]]; then
  echo "→ Run 'npm run tokens' in $TARGET to generate dist/tokens/."
  exit 1
fi

cat <<'EOF'
✅ dist/tokens/css/all.css and dark.css found.

Reminder of the 3 steps from site/dist/get-started.html:
  1. Clone the Agentica repository, grab dist/tokens/
  2. Link dist/tokens/css/all.css + dark.css, consume the CSS variables by intent
  3. Mount the agtc-* Web Components (Lit as a peer dependency)
EOF
