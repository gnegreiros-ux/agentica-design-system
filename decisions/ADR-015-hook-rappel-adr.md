# ADR-015 — Hook automatique de rappel ADR sur modifications critiques

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-015-hook-rappel-adr.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** .claude/settings.json, decisions/ADR-004-gouvernance-humaine.md, decisions/ADR-014-conventional-commits.md

---

## Contexte

Les fichiers `tokens/`, `guidelines/`, et `components/` contiennent les décisions
structurantes du système de design : valeurs de tokens, contrats de composants,
documentation normative. Toute modification dans ces zones devrait, en principe,
être accompagnée d'un ADR ou d'un TCR qui en explique le pourquoi.

En pratique, la documentation était oubliée. Un agent ou un humain modifiait
`tokens/semantic.json` pour ajouter un token, commitait, et aucun ADR n'était créé.
L'historique git conservait le _quoi_ mais perdait le _pourquoi_.

La question posée était :

> **Comment s'assurer qu'une modification dans une zone critique du système
> déclenche systématiquement une réflexion sur la nécessité d'un ADR,
> sans bloquer le flux de travail ni imposer un ADR pour chaque changement mineur ?**

---

## Décision

Ajout d'un hook `PostToolUse` dans `.claude/settings.json` qui s'active après
chaque opération `Write` ou `Edit` sur un fichier dont le chemin contient
`/tokens/`, `/guidelines/`, ou `/components/`.

Le hook injecte un rappel dans le contexte du modèle via `additionalContext` :

```
RAPPEL ADR : Le fichier modifié est dans une zone critique du système de design.
Demande immédiatement à l'utilisateur : Souhaitez-vous créer un ADR
pour documenter ce changement ? (Oui/Non)
```

Ce rappel oblige Claude à poser la question à chaque modification critique.
L'utilisateur répond Oui ou Non — aucun ADR n'est créé sans décision humaine explicite.

### Configuration (`/.claude/settings.json`)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path // \"\"'); if echo \"$f\" | grep -qE '/(tokens|guidelines|components)/'; then printf '{...additionalContext...}' \"$f\"; fi",
            "statusMessage": "Vérification ADR…"
          }
        ]
      }
    ]
  }
}
```

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Règle documentée dans CLAUDE.md uniquement** | Une règle textuelle dans un fichier de contexte dépend de la bonne lecture de ce fichier par l'agent. Un hook s'exécute systématiquement, indépendamment du contexte chargé. |
| **Hook bloquant (exit non-zéro)** | Bloquer le `Edit` jusqu'à création d'un ADR serait trop contraignant : tous les changements ne justifient pas un ADR (correction de typo, reformatage). Le rappel non-bloquant laisse la décision à l'humain. |
| **Hook sur `git commit` (pre-commit)** | Un hook git vérifie au moment du commit, trop tard dans le flux : la question pertinente est posée _pendant_ la modification, quand le contexte est encore actif. |
| **Notification système (OS notification)** | Les notifications OS sont ignorées lors d'un travail dans le terminal. Le `additionalContext` est injecté directement dans la réponse de Claude — impossible à manquer. |
| **ADR obligatoire pour chaque changement** | Surcharge documentaire. Un changement de valeur de token primitif de `#3B82F6` à `#3B81F5` ne justifie pas un ADR complet. Le rappel filtre par contexte humain. |

---

## Conséquences

**Pour les agents IA :**
- Après chaque `Edit` ou `Write` dans une zone critique, Claude pose la question ADR
  sans que l'utilisateur ait à y penser
- Le hook s'exécute via le harness Claude Code — il ne dépend pas du prompt,
  du contexte chargé, ni de la mémoire de la session

**Pour les humains :**
- La friction documentaire est minimale : une question Oui/Non après chaque changement
- Les ADR oubliés deviennent structurellement impossibles sur les zones couvertes
- Le comportement est transparent et auditable dans `.claude/settings.json`

**Zones couvertes :**
- `tokens/` — primitifs, sémantiques, composants
- `guidelines/` — documentation normative des composants et fondations
- `components/` — implémentations Web Components

**Zones non couvertes (volontairement) :**
- `.claude/` — configuration interne, pas de décision de design
- `src/` — code applicatif, couvert par d'autres processus de revue
- `decisions/` — les ADR eux-mêmes ne déclenchent pas un rappel récursif

**Coût accepté :**
- Le rappel s'affiche même pour des changements mineurs (correction de typo dans un token)
- L'utilisateur doit répondre Non explicitement — légère friction pour les changements évidents

---

## Incidents ou déclencheurs

Constat répété : lors de sessions de travail sur les tokens et les guidelines,
des modifications structurantes étaient commitées sans ADR associé. L'historique
git conservait le diff mais pas la justification. Ce hook est la réponse
procédurale à ce manque de discipline documentaire.
