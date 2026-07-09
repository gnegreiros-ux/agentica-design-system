#!/usr/bin/env bash
# How-to-sans-agents.md §1.4 — rappel ADR + log, avertit sans bloquer.
# Usage : scripts/continuity/1-4-adr-log-rappel.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

STAGED=$(git diff --staged --name-only)

if ! echo "$STAGED" | grep -q "^decisions/ADR-.*\.md$"; then
  echo "ℹ️  Aucun nouvel ADR dans ce commit — normal si le changement ne déclenche pas la matrice"
  echo "   de .claude/skills/pipelines/adr-triggers.md. Sinon, en rédiger un avant de committer."
fi

echo "Rappel : le suivi de ce chantier (statut, backlog) vit dans GitHub Projects (ADR-069) —"
echo "pas dans un fichier du dépôt. Les ADR restent obligatoires pour les décisions architecturales."
exit 0
