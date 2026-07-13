# ADR-013 — DESIGN.md comme contrat portable versionné avec le code

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer, Direction produit
> **Type:** contract
> **Chemin logique:** decisions/ADR-013-design-md-contrat-portable.md
> **Lecture avant:** AGENTS.md, DESIGN.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** DESIGN.md, AGENTS.md, .claude/instructions/session-spec.md, decisions/ADR-004-gouvernance-humaine.md

> **English summary:** Creates `DESIGN.md` as a portable, git-versioned governance contract (principles, token architecture, accessibility rules, the TCR process) instead of relying on a wiki or Notion — surfaces agents can't read. `DESIGN.md` is the first file agents must read, ensuring every session starts from the same stable contract.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
