# ADR-015 — Automatic ADR reminder hook on critical modifications

> **Date:** 2026-05-28
> **Last revision:** 2026-05-31
> **Status:** ✅ Active (amended)
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-015-hook-rappel-adr.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** .claude/settings.json, decisions/ADR-004-gouvernance-humaine.md, decisions/ADR-014-conventional-commits.md

---

## Context

The `tokens/`, `guidelines/`, and `components/` files contain the design
system's structuring decisions: token values, component contracts, normative
documentation. Any modification in these areas should, in principle, be
accompanied by an ADR or a TCR explaining why.

In practice, documentation was being forgotten. An agent or a human would
modify `tokens/semantic.json` to add a token, commit, and no ADR would be
created. The git history kept the _what_ but lost the _why_.

The question was:

> **How do we ensure that a modification in a critical area of the system
> systematically triggers a reflection on whether an ADR is needed, without
> blocking the workflow or forcing an ADR for every minor change?**

---

## Decision

Add a `PostToolUse` hook in `.claude/settings.json` that fires after every
`Write` or `Edit` operation on a file whose path contains `/tokens/`,
`/guidelines/`, or `/components/`.

The hook injects a reminder into the model's context via `additionalContext`:

```
ADR REMINDER: The modified file is in a critical area of the design system.
Immediately ask the user: Would you like to create an ADR
to document this change? (Yes/No)
```

This reminder forces Claude to ask the question on every critical modification.
The user answers Yes or No — no ADR is created without an explicit human decision.

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
            "statusMessage": "Checking ADR…"
          }
        ]
      }
    ]
  }
}
```

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Rule documented only in CLAUDE.md** | A textual rule in a context file depends on the agent correctly reading that file. A hook runs systematically, regardless of the loaded context. |
| **Blocking hook (non-zero exit)** | Blocking the `Edit` until an ADR is created would be too restrictive: not every change justifies an ADR (typo fix, reformatting). The non-blocking reminder leaves the decision to the human. |
| **Hook on `git commit` (pre-commit)** | A git hook checks at commit time, too late in the flow: the relevant question should be asked _during_ the modification, while the context is still active. |
| **System notification (OS notification)** | OS notifications are ignored when working in the terminal. The `additionalContext` is injected directly into Claude's response — impossible to miss. |
| **Mandatory ADR for every change** | Documentation overload. A primitive token value change from `#3B82F6` to `#3B81F5` doesn't justify a full ADR. The reminder filters through human judgment. |

---

## Consequences

**For AI agents:**
- After every `Edit` or `Write` in a critical area, Claude asks the ADR question
  without the user having to think about it
- The hook runs via the Claude Code harness — it doesn't depend on the prompt,
  the loaded context, or the session's memory

**For humans:**
- Documentation friction is minimal: a Yes/No question after each change
- Forgotten ADRs become structurally impossible in the covered areas
- The behavior is transparent and auditable in `.claude/settings.json`

**Covered areas:**
- `tokens/` — primitives, semantics, components
- `guidelines/` — normative documentation for components and foundations
- `components/` — Web Component implementations

**Areas deliberately not covered:**
- `.claude/` — internal configuration, not a design decision
- `src/` — application code, covered by other review processes
- `decisions/` — ADRs themselves don't trigger a recursive reminder

**Accepted cost:**
- The reminder shows up even for minor changes (typo fix in a token)
- The user must explicitly answer No — slight friction for obvious changes

---

## Amendment — 2026-05-31: ADR reminder on `Write` only

### Observed problem

During the development sessions for the `agtc-badge`, `agtc-card` components and
the WCAG fixes that followed, the hook fired on **every `Edit`** in the critical
areas — including for bug fixes with no architectural decision involved (fixing
an insufficient contrast ratio, correcting a typo in a story, adjusting a color
that failed an axe test).

Concrete result: to fix the badge's 27 WCAG violations (3 text colors to
replace), the hook interrupted the work **6 times** to ask a question whose
answer was systematically no. The documentation friction became noise rather
than a useful safeguard.

### Fundamental distinction

| Type of change | Needs an ADR | Example |
|-----------------|---------------|---------|
| **New file** (`Write`) | Yes — it's a creation, therefore a decision | Adding `agtc-badge.js`, creating a token |
| **Modification** (`Edit`) | Rarely — often a bug fix or an adjustment | Fixing a contrast ratio, renaming a variable |

The question "does this need an ADR?" is relevant when **creating** something
(new component, new token, new guideline). It's almost always irrelevant when
**modifying** something that already exists — the original ADR already covers
the decision.

### Change applied

The `PostToolUse` hook is now split into two entries:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "...ADR reminder..." }]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "...construction log..." }]
      }
    ]
  }
}
```

- **ADR reminder**: `Write` only — fires on file creation
- **Construction log**: `Write|Edit` — unchanged, captures every modification

### Accepted cost of the amendment

An `Edit` that genuinely represents a new architectural decision will no longer
automatically trigger the reminder. Discipline is still required: if a token or
component modification encodes a non-trivial decision, the human or the agent
must create the ADR manually. The hook is no longer the sole safeguard for
modifications.

---

## Incidents or triggers (original version)

Repeated observation: during work sessions on tokens and guidelines, structuring
modifications were committed with no associated ADR. The git history kept the
diff but not the justification. This hook is the procedural response to that
lack of documentation discipline.

<!-- FR -->

# ADR-015 — Hook automatique de rappel ADR sur modifications critiques

> **Date :** 2026-05-28
> **Dernière révision :** 2026-05-31
> **Statut :** ✅ Actif (amendé)
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

## Amendement — 2026-05-31 : rappel ADR sur `Write` uniquement

### Problème observé

Lors des sessions de développement des composants `agtc-badge`, `agtc-card` et
des corrections WCAG qui ont suivi, le hook se déclenchait sur **chaque `Edit`**
dans les zones critiques — y compris pour des corrections de bugs sans décision
architecturale (changement d'un ratio de contraste insuffisant, correction d'une
typo dans une story, ajustement d'une couleur qui échoue un test axe).

Résultat concret : pour corriger les 27 violations WCAG du badge (3 couleurs de
texte à remplacer), le hook a interrompu le travail **6 fois** pour poser une
question dont la réponse était systématiquement non. La friction documentaire
devenait du bruit plutôt qu'une garde-fou utile.

### Distinction fondamentale

| Type de changement | Besoin d'ADR | Exemple |
|--------------------|--------------|---------|
| **Nouveau fichier** (`Write`) | Oui — c'est une création, donc une décision | Ajouter `agtc-badge.js`, créer un token |
| **Modification** (`Edit`) | Rarement — souvent un bug fix ou un ajustement | Corriger un contraste, renommer une variable |

La question "faut-il un ADR ?" est pertinente quand on **crée** quelque chose
(nouveau composant, nouveau token, nouvelle guideline). Elle est presque toujours
non pertinente quand on **modifie** quelque chose qui existe déjà — l'ADR original
couvre déjà la décision.

### Changement appliqué

Le hook `PostToolUse` est maintenant séparé en deux entrées :

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "...rappel ADR..." }]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "...log construction..." }]
      }
    ]
  }
}
```

- **Rappel ADR** : `Write` uniquement — se déclenche à la création d'un fichier
- **Log de construction** : `Write|Edit` — inchangé, capture toutes les modifications

### Coût accepté de l'amendement

Un `Edit` qui représente réellement une nouvelle décision architecturale ne
déclenchera plus automatiquement le rappel. La discipline reste nécessaire :
si une modification de token ou de composant encode une décision non triviale,
l'humain ou l'agent doit créer l'ADR manuellement. Le hook n'est plus le seul
garde-fou pour les modifications.

---

## Incidents ou déclencheurs (version originale)

Constat répété : lors de sessions de travail sur les tokens et les guidelines,
des modifications structurantes étaient commitées sans ADR associé. L'historique
git conservait le diff mais pas la justification. Ce hook est la réponse
procédurale à ce manque de discipline documentaire.
