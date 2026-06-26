#!/usr/bin/env bash
# Appende une entrée dans log/kit-construction.md après chaque modification
# d'un fichier de construction du kit (.claude/, decisions/, AGENTS.md, DESIGN.md).
# Ignore tout fichier hors du dépôt.

REPO="/Users/gnegreiros/Documents/Git/agentic-design-system"
LOG="$REPO/log/kit-construction.md"

input=$(cat)
f=$(echo "$input" | jq -r '.tool_input.file_path // ""')
tool=$(echo "$input" | jq -r '.tool_name // ""')

# Ignorer les fichiers hors du repo
[[ "$f" != "$REPO/"* ]] && exit 0

if echo "$f" | grep -qE '(/\.claude/|/decisions/)' || echo "$f" | grep -qE '/(AGENTS|DESIGN)\.md$'; then
  timestamp=$(date '+%Y-%m-%d %H:%M')
  rel="${f#$REPO/}"
  action="Modifié"
  [ "$tool" = "Write" ] && action="Créé"
  printf "| %s | %s | \`%s\` |\n" "$timestamp" "$action" "$rel" >> "$LOG"
fi
