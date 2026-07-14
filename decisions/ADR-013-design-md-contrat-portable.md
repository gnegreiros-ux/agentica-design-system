# ADR-013 — DESIGN.md as a portable contract versioned with the code

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Principal Designer, Product Leadership
> **Type:** contract
> **Logical path:** decisions/ADR-013-design-md-contrat-portable.md
> **Read before:** AGENTS.md, DESIGN.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** DESIGN.md, AGENTS.md, .claude/instructions/session-spec.md, decisions/ADR-004-gouvernance-humaine.md

---

## Context

A design system encodes organizational decisions: which values, which principles,
which governance. These decisions traditionally live in wikis, presentations,
Notion documents, or in the heads of key team members.

This storage has two major flaws for an agentic system:

**1. Desynchronization from the code**
A principle documented in Notion isn't linked to the code that implements it.
An agent reading the code doesn't see the principle. An agent reading Notion
doesn't see whether the principle is implemented or not.

**2. Inaccessibility to agents**
An AI agent has no access to Notion, Confluence, or PowerPoint presentations.
It can read the git repo. If governance decisions aren't in the repo, agents
operate without those constraints — even if they formally exist elsewhere.

The question was:

> **How do we make the design system's principles and governance accessible to
> agents, synchronized with the code, and versioned in the same way as tokens?**

---

## Decision

Create `DESIGN.md` as a **portable contract** — a Markdown file at the repo root
that encodes the principles, token architecture, accessibility rules, and
governance, in a format readable by both humans and AI agents.

`DESIGN.md` is versioned with the code. Any modification to `DESIGN.md` follows
the same process as a token modification: PR, review, approval.

The concept is inspired by Google Labs' work (April 2026) on portable
specifications for agentic design systems — `DESIGN.md` is the local answer to
the question "how does an agent know the rules of the game?"

**What DESIGN.md contains:**
- Identity and intent of the system (name, organization, version, owner)
- Token architecture (the three levels, governance rules)
- General component rules
- Non-negotiable accessibility rules
- The TCR (Token Change Request) process
- What agents can and cannot do

**What DESIGN.md does not contain:**
- Token values (in `tokens/*.json`)
- Component contracts (in `guidelines/components/`)
- Technical decisions (in `decisions/`)

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Internal wiki (Notion, Confluence)** | Not accessible to agents. Desynchronized from the code by nature — nobody updates the wiki when the code changes. Not versioned with git — no traceability of who changed what and when. |
| **README.md only** | The README is an introduction to the project, not a governance contract. Mixing the two overloads the README and makes both roles less legible. `DESIGN.md` is a file dedicated to governance. |
| **Comments in code files** | Not centralized. An agent has to read every file to reconstruct the rules. Not appropriate for principles that apply to the entire system. |
| **Environment variables or JSON config** | Governance principles are not technical configuration. A JSON config file isn't naturally readable by humans and can't express governance nuance. |
| **No governance document** | Explicitly rejected. Without `DESIGN.md`, every agent starts with an empty context and reconstructs the rules from the code — with guaranteed errors. The first instruction in `AGENTS.md` is "read DESIGN.md first". |

---

## Consequences

**For AI agents:**
- `DESIGN.md` is the first file to read (`AGENTS.md` explicitly points to it)
- An agent that has read `DESIGN.md` knows: the guiding principles, the token
  structure, the accessibility rules, the TCR process, and its own limits
- `DESIGN.md` stays stable across sessions — agents find the same contract every
  time they start, without depending on the memory of the previous session

**For teams:**
- `DESIGN.md` is the answer to "where is the system's governance?" — a git file
  URL, not a link to a possibly deprecated wiki
- Any new person (human or agent) who clones the repo immediately finds the
  organization's contract in the file

**For governance:**
- Modifying `DESIGN.md` is an act of governance — traceable in git, subject to review
- If a rule changes in `DESIGN.md`, the git diff shows exactly what changed, who
  approved it, and in what context
- The desynchronization between declared principles and implemented code becomes
  visible: if `DESIGN.md` says one thing and the code does another, that's a
  detectable governance bug

**Accepted cost:**
- `DESIGN.md` must be kept up to date — going stale without updates is worse than
  having no document
- The temptation is to put everything in `DESIGN.md` — resist it. Only principles
  and global governance belong there. Details go in `decisions/`, contracts in
  `guidelines/`, values in `tokens/`

---

## Incidents or triggers

Foundational decision, inspired by work presented at the AI Design Systems
Conference 2026. The question that triggered it: "if an agent clones this repo
tomorrow, what does it know about our rules?" Without `DESIGN.md`, the answer
was "nothing — it reads the code and guesses." With `DESIGN.md`, the answer is
"everything it needs to know to work without improvising."

<!-- FR -->

# ADR-013 — DESIGN.md comme contrat portable versionné avec le code

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer, Direction produit
> **Type:** contract
> **Chemin logique:** decisions/ADR-013-design-md-contrat-portable.md
> **Lecture avant:** AGENTS.md, DESIGN.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** DESIGN.md, AGENTS.md, .claude/instructions/session-spec.md, decisions/ADR-004-gouvernance-humaine.md

---

## Contexte

Un système de design encode des décisions d'organisation : quelles valeurs,
quels principes, quelle gouvernance. Ces décisions vivent traditionnellement
dans des wikis, des présentations, des documents Notion, ou dans la tête
des personnes clés de l'équipe.

Ce stockage a deux défauts majeurs pour un système agentique :

**1. La désynchronisation avec le code**
Un principe documenté dans Notion n'est pas lié au code qui l'implémente.
Un agent qui lit le code ne voit pas le principe. Un agent qui lit Notion
ne voit pas si le principe est implémenté ou non.

**2. L'inaccessibilité par les agents**
Un agent IA n'a pas accès à Notion, Confluence, ou aux présentations PowerPoint.
Il peut lire le repo git. Si les décisions de gouvernance ne sont pas dans le repo,
les agents opèrent sans ces contraintes — même si elles existent formellement ailleurs.

La question posée était :

> **Comment rendre les principes et la gouvernance du système de design
> accessibles aux agents, synchronisés avec le code, et versionnés
> au même titre que les tokens ?**

---

## Décision

Création de `DESIGN.md` comme **contrat portable** — un fichier Markdown à la racine
du repo qui encode les principes, l'architecture des tokens, les règles d'accessibilité,
et la gouvernance, dans un format lisible par les humains et par les agents IA.

`DESIGN.md` est versionné avec le code. Toute modification de `DESIGN.md` suit
le même processus qu'une modification de token : PR, review, approbation.

Le concept s'inspire des travaux de Google Labs (avril 2026) sur les spécifications
portables pour systèmes de design agentiques — `DESIGN.md` est la réponse locale
à la question "comment un agent connaît-il les règles du jeu ?"

**Ce que DESIGN.md contient :**
- Identité et intention du système (nom, organisation, version, responsable)
- Architecture des tokens (les trois niveaux, règles de gouvernance)
- Règles générales des composants
- Règles d'accessibilité non négociables
- Le processus TCR (Token Change Request)
- Ce que les agents peuvent et ne peuvent pas faire

**Ce que DESIGN.md ne contient pas :**
- Les valeurs des tokens (dans `tokens/*.json`)
- Les contrats de composants (dans `guidelines/components/`)
- Les décisions techniques (dans `decisions/`)

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Wiki interne (Notion, Confluence)** | Non accessible aux agents. Désynchronisé du code par nature — personne ne met à jour le wiki quand le code change. Pas versionné avec git — aucune traçabilité de qui a changé quoi et quand. |
| **README.md uniquement** | Le README est une introduction au projet, pas un contrat de gouvernance. Mélanger les deux surcharge le README et rend les deux rôles moins lisibles. `DESIGN.md` est un fichier dédié à la gouvernance. |
| **Commentaires dans les fichiers de code** | Non centralisés. Un agent doit lire tous les fichiers pour reconstituer les règles. Pas approprié pour des principes qui s'appliquent à l'ensemble du système. |
| **Variables d'environnement ou config JSON** | Les principes de gouvernance ne sont pas de la configuration technique. Un fichier JSON de config ne se lit pas naturellement par les humains et ne peut pas exprimer des nuances de gouvernance. |
| **Pas de document de gouvernance** | Rejeté explicitement. Sans `DESIGN.md`, chaque agent commence avec un contexte vide et reconstruit les règles depuis le code — avec des erreurs garanties. La première instruction de `AGENTS.md` est "lire DESIGN.md en premier". |

---

## Conséquences

**Pour les agents IA :**
- `DESIGN.md` est le premier fichier à lire (AGENTS.md l'indique explicitement)
- Un agent qui a lu `DESIGN.md` connaît : les principes directeurs, la structure
  des tokens, les règles d'accessibilité, le processus TCR, et ses propres limites
- `DESIGN.md` reste stable entre les sessions — les agents retrouvent le même contrat
  à chaque démarrage, sans dépendre de la mémoire de la session précédente

**Pour les équipes :**
- `DESIGN.md` est la réponse à "où est la gouvernance du système ?" — une URL de fichier
  git, pas un lien vers un wiki possiblement déprécié
- Toute nouvelle personne (humain ou agent) qui clone le repo trouve immédiatement
  le contrat de l'organisation dans le fichier

**Pour la gouvernance :**
- Modifier `DESIGN.md` est un acte de gouvernance — traçable dans git, sujet à review
- Si une règle change dans `DESIGN.md`, le diff git montre exactement ce qui a changé,
  qui l'a approuvé, et dans quel contexte
- La désynchronisation entre les principes déclarés et le code implémenté devient
  visible : si `DESIGN.md` dit une chose et le code en fait une autre, c'est un bug
  de gouvernance détectable

**Coût accepté :**
- `DESIGN.md` doit être maintenu à jour — vieillir sans mise à jour est pire
  qu'une absence de document
- La tentation est de tout mettre dans `DESIGN.md` — résister. Seuls les principes
  et la gouvernance globale y ont leur place. Les détails vont dans `decisions/`,
  les contrats dans `guidelines/`, les valeurs dans `tokens/`

---

## Incidents ou déclencheurs

Décision fondatrice, inspirée des travaux présentés à l'AI Design Systems Conference 2026.
La question qui l'a déclenchée : "si un agent clone ce repo demain,
que connaît-il de nos règles ?" Sans `DESIGN.md`, la réponse était "rien —
il lit le code et devine". Avec `DESIGN.md`, la réponse est "tout ce qu'il
a besoin de savoir pour travailler sans improviser".
