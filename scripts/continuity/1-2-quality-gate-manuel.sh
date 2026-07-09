#!/usr/bin/env bash
# How-to-sans-agents.md §1.2 — quality gate manuel, remplace .claude/skills/quality-gate.md.
# Usage : scripts/continuity/1-2-quality-gate-manuel.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

confirm() {
  local prompt="$1"
  local reply
  read -r -p "$prompt [y/n] " reply
  if [[ "$reply" != "y" && "$reply" != "Y" ]]; then
    echo "❌ Étape non confirmée — quality gate en échec."
    exit 1
  fi
}

echo "=== 1/8 — Cohérence tokens ==="
node scripts/audit-tokens.js --ci
echo "Grep complémentaires (voir .claude/skills/pipelines/tokens-audit.md) :"
grep -rn '#[0-9a-fA-F]\{3,6\}' components/ site/build.js --include="*.js" --include="*.css" || echo "  (aucune valeur hex en dur trouvée)"

echo "=== 2/8 — WCAG ==="
npm run axe
echo "Vérifier manuellement le contraste sur https://webaim.org/resources/contrastchecker/ pour tout nouveau token de couleur."
confirm "Contraste vérifié manuellement pour les nouveaux tokens/couleurs ?"

echo "=== 3/8 — Revue patterns UX (ADR-036) ==="
echo "Consulter .claude/rules/ux-patterns-sources.md — 5 sources — et documenter la décision sur les 6 surfaces."
confirm "Revue de patterns UX faite et documentée sur les 6 surfaces ?"

echo "=== 4/8 — Conformité ADR ==="
echo "Grep manuels — voir .claude/skills/pipelines/adr-conformity.md pour la liste complète par ADR."
confirm "Conformité ADR vérifiée manuellement (grep par ADR actif) ?"

echo "=== 5/8 — Déclencheurs ADR manquants ==="
echo "Répondre aux 4 questions de .claude/skills/pipelines/adr-triggers.md."
confirm "Un nouvel ADR est-il nécessaire ET a-t-il été rédigé si oui ?"

echo "=== 6/8 — Documentation ==="
echo "Checklist de fichiers à jour — voir .claude/skills/pipelines/docs.md."
confirm "Documentation (guideline, log, bilingue) mise à jour ?"

echo "=== 7/8 — Rebuild site ==="
node site/build.js

echo "=== 8/8 — Commit ==="
echo "Format Conventional Commits attendu : type(scope): description — jamais --no-verify."
echo "Rappel : le suivi de projet vit dans GitHub Projects (ADR-069), pas dans un fichier du dépôt."

echo "✅ Quality gate manuel complété."
