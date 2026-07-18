#!/usr/bin/env bash
# How-to-without-agents.md §1.4 — ADR + log reminder, warns without blocking.
# Usage: scripts/continuity/1-4-adr-log-reminder.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

STAGED=$(git diff --staged --name-only)

if ! echo "$STAGED" | grep -q "^decisions/ADR-.*\.md$"; then
  echo "ℹ️  No new ADR in this commit — normal if the change doesn't trigger the matrix"
  echo "   in .claude/skills/pipelines/adr-triggers.md. Otherwise, write one before committing."
fi

echo "Reminder: tracking for this initiative (status, backlog) lives in GitHub Projects (ADR-069) —"
echo "not in a repository file. ADRs remain mandatory for architectural decisions."
exit 0
