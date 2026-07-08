#!/usr/bin/env bash
# How-to-sans-agents.md §2.3 — rappel garde-fou anti-contournement, informationnel.
# Usage : scripts/continuity/2-3-anti-contournement.sh
set -euo pipefail

cat <<'EOF'
=== Garde-fou anti-contournement ===

Risque documenté (retour d'expérience Spotify/Encore) : sans agent pour faciliter
l'usage du design system, une équipe pressée peut être tentée de contourner Agentica
entièrement (coder une valeur en dur, ignorer un composant existant).

Rappel : l'absence d'agent NE CHANGE PAS la règle tokens-system.md.
  - Une valeur en dur reste interdite, elle est juste vérifiée à la main plutôt que par script.
  - Si un délai est intenable, la voie correcte est l'ESCALADE (voir 2-4-contact-escalade.sh)
    pour arbitrer une dérogation documentée — jamais le contournement silencieux.
EOF
