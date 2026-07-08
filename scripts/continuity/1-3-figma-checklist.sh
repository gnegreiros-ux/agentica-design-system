#!/usr/bin/env bash
# How-to-sans-agents.md §1.3 — checklist Figma manuelle, purement informationnel.
# Usage : scripts/continuity/1-3-figma-checklist.sh
set -euo pipefail

cat <<'EOF'
=== Checklist Figma sans script Plugin API ===
(dérivée de .claude/rules/figma-library-governance.md + .claude/instructions/figma-components.md)

[ ] 1. Lire le composant code + stories AVANT de toucher Figma
[ ] 2. Lier chaque fill/stroke/spacing à une Variable Figma existante
       (panneau Inspect → Applied variables) — jamais de valeur en dur
[ ] 3. Vérifier variantes ComponentSet = props du composant code, une par une
       (audit par échantillonnage, prioriser les composants récemment modifiés)
[ ] 4. Règle no-delete : déplacer vers une frame "_corbeille", jamais .remove()
[ ] 5. Page de staging "🟡 Proposition — en attente d'approbation" avant publication
[ ] 6. Rapport 10 points avant toute revue humaine (voir figma-library-governance.md §C)
[ ] 7. Geler les chantiers Figma de grande ampleur ; se limiter aux corrections ciblées

Aucune automatisation possible ici (actions UI Figma) — cette checklist est à cocher
manuellement avant de considérer une modification Figma comme terminée.
EOF
