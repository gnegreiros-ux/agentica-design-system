#!/usr/bin/env bash
# Appende une entrée dans log/kit-construction.md après chaque modification
# d'un fichier de construction du kit (.claude/, decisions/, AGENTS.md, DESIGN.md).

LOG="/Users/gnegreiros/Documents/Git/agentic-design-system/log/kit-construction.md"

input=$(cat)
f=$(echo "$input" | jq -r '.tool_input.file_path // ""')
tool=$(echo "$input" | jq -r '.tool_name // ""')

if echo "$f" | grep -qE '(/\.claude/|/decisions/)' || echo "$f" | grep -qE '/(AGENTS|DESIGN)\.md$'; then
  timestamp=$(date '+%Y-%m-%d %H:%M')
  rel=$(echo "$f" | sed 's|.*/agentic-design-system/||')
  action="Modifié"
  [ "$tool" = "Write" ] && action="Créé"
  printf "| %s | %s | \`%s\` |\n" "$timestamp" "$action" "$rel" >> "$LOG"
fi
