#!/usr/bin/env bash
# How-to-sans-agents.md §2.1 — vérifie qu'un clone d'Agentica est utilisable sans agent.
# Usage : scripts/continuity/2-1-installation-produit.sh <chemin-vers-clone-agentica>
set -euo pipefail

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Usage : $0 <chemin-vers-clone-agentica>"
  exit 1
fi

MISSING=false
for f in "dist/tokens/css/all.css" "dist/tokens/css/dark.css"; do
  if [[ ! -f "$TARGET/$f" ]]; then
    echo "❌ Fichier manquant : $TARGET/$f"
    MISSING=true
  fi
done

if [[ "$MISSING" == true ]]; then
  echo "→ Lancer 'npm run tokens' dans $TARGET pour générer dist/tokens/."
  exit 1
fi

cat <<'EOF'
✅ dist/tokens/css/all.css et dark.css trouvés.

Rappel des 3 étapes de site/dist/get-started.html :
  1. Cloner le dépôt Agentica, récupérer dist/tokens/
  2. Lier dist/tokens/css/all.css + dark.css, consommer les variables CSS par intention
  3. Monter les Web Components agtc-* (Lit en peer dependency)
EOF
