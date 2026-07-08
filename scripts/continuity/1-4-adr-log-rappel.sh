#!/usr/bin/env bash
# How-to-sans-agents.md §1.4 — rappel ADR + log, avertit sans bloquer.
# Usage : scripts/continuity/1-4-adr-log-rappel.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

STAGED=$(git diff --staged --name-only)

if ! echo "$STAGED" | grep -q "^log/kit-construction.md$"; then
  echo "⚠️  log/kit-construction.md n'est pas dans le commit en cours."
  echo "   Rappel : chaque session/commit significatif doit y être journalisé (chemins /Users/... nettoyés)."
fi

if ! echo "$STAGED" | grep -q "^decisions/ADR-.*\.md$"; then
  echo "ℹ️  Aucun nouvel ADR dans ce commit — normal si le changement ne déclenche pas la matrice"
  echo "   de .claude/skills/pipelines/adr-triggers.md. Sinon, en rédiger un avant de committer."
fi

echo "Rappel : log/kit-construction.md et les ADR restent obligatoires — rien n'est automatisé ici,"
echo "ce script se contente de vérifier leur présence dans le commit en cours."
exit 0
