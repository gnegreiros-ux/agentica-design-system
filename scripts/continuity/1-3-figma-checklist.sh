#!/usr/bin/env bash
# How-to-without-agents.md §1.3 — manual Figma checklist, purely informational.
# Usage: scripts/continuity/1-3-figma-checklist.sh
set -euo pipefail

cat <<'EOF'
=== Figma checklist without the Plugin API script ===
(derived from .claude/rules/figma-library-governance.md + .claude/instructions/figma-components.md)

[ ] 1. Read the component code + stories BEFORE touching Figma
[ ] 2. Bind every fill/stroke/spacing to an existing Figma Variable
       (Inspect panel → Applied variables) — never a hardcoded value
[ ] 3. Verify ComponentSet variants match the code component's props, one by one
       (sample audit, prioritize recently modified components)
[ ] 4. No-delete rule: move to a "_trash" frame, never .remove()
[ ] 5. Staging page "🟡 Proposal — pending approval" before publishing
[ ] 6. 10-point report before any human review (see figma-library-governance.md §C)
[ ] 7. Freeze large-scale Figma initiatives; limit to targeted fixes

No automation possible here (Figma UI actions) — this checklist must be checked off
manually before a Figma change is considered complete.
EOF
