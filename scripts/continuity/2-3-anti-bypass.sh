#!/usr/bin/env bash
# How-to-without-agents.md §2.3 — anti-bypass safeguard reminder, informational.
# Usage: scripts/continuity/2-3-anti-bypass.sh
set -euo pipefail

cat <<'EOF'
=== Anti-bypass safeguard ===

Documented risk (lesson learned from Spotify/Encore): without an agent to ease
design-system usage, a team under time pressure may be tempted to bypass Agentica
entirely (hardcoding a value, ignoring an existing component).

Reminder: the absence of an agent does NOT change the tokens-system.md rule.
  - A hardcoded value is still forbidden — it's just checked by hand instead of by script.
  - If a deadline is untenable, the correct path is ESCALATION (see 2-4-escalation-contact.sh)
    to arbitrate a documented exception — never a silent bypass.
EOF
