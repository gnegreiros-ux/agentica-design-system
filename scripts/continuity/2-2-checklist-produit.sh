#!/usr/bin/env bash
# How-to-sans-agents.md §2.2 — checklist de remplacement pour un projet consommateur.
# Usage : scripts/continuity/2-2-checklist-produit.sh <chemin-du-projet-consommateur>
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Usage : $0 <chemin-du-projet-consommateur>"
  exit 1
fi

echo "[2.2] Audit tokens sur $TARGET (node scripts/audit-tokens.js --src-dir <chemin>)"
node scripts/audit-tokens.js --src-dir "$TARGET"

cat <<'EOF'

Rappels à confirmer manuellement (ne peuvent pas être scriptés depuis ce dépôt) :
  - Contraste : https://webaim.org/resources/contrastchecker/
  - Accessibilité : extension navigateur "axe DevTools"
  - Pattern UX : consulter les 5 sources de .claude/rules/ux-patterns-sources.md
    et documenter le choix retenu directement dans le projet consommateur
EOF

read -r -p "Contraste + accessibilité + pattern UX vérifiés manuellement ? [y/n] " reply
if [[ "$reply" != "y" && "$reply" != "Y" ]]; then
  echo "❌ Checklist produit non confirmée."
  exit 1
fi

echo "✅ Checklist produit complétée."
