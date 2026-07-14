# ADR-011 — Choosing Tokens Studio for Figma ↔ JSON synchronization

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Principal Designer
> **Type:** contract
> **Logical path:** decisions/ADR-011-tokens-studio.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-003-style-dictionary.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-003-style-dictionary.md, decisions/ADR-008-radix-colors.md

---

## Context

The design system operates on two surfaces simultaneously:
- **Code** — JSON tokens + Web Components compiled by Style Dictionary
- **Figma** — mockups and components used by the design team

Without synchronization between these two surfaces, teams work from two diverging
sources of truth. The designer changes a token in Figma, the developer changes the
JSON — the two systems silently drift apart.

The digital sovereignty constraint (ADR-004, DESIGN.md) complicates the problem:
the source of truth must stay in the git repo, not in Figma. Figma is a tool for
consultation and design, not for token governance.

The question was:

> **How do we keep Figma and the JSON repo synchronized without reversing the
> direction of truth — JSON leads, Figma follows?**

---

## Decision

Adopt **Tokens Studio for Figma** (a Figma plugin) as the synchronization bridge
between the repo's JSON files and Figma's variables/styles.

The synchronization direction is non-negotiable:

```
tokens/*.json  →  Tokens Studio  →  Figma Variables
     ↑ source of truth                ↓ consumer
```

The plugin reads the JSON files from the GitHub repo (via Settings → GitHub sync)
and imports the tokens into Figma in the same order as ADR-001:
`primitives.json` → `semantic.json` → `component.json`.

**What designers must NOT do via Tokens Studio:**
modify tokens directly in Figma and push them to the repo.
Every token change follows the TCR process (DESIGN.md) — Figma is read-only.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Native Figma Variables only (no plugin)** | Figma Variables don't natively sync with a git repo. Every token update would require a manual update in Figma — a guaranteed source of drift. Acceptable for small teams, but not scalable. |
| **Theo / Style Dictionary → Figma export** | Style Dictionary can export to Figma-specific formats (specific JSON). But importing into Figma remains manual — no bidirectional sync and no management UI in Figma. Tokens Studio offers the management UI these exports lack. |
| **Custom sync script** | Maintainable short-term for a small token catalog. Not maintainable at scale (30 palettes × 12 steps × 3 layers = hundreds of tokens). Figma API updates would break the script without notice. |
| **Zeroheight / Supernova** | Design system documentation platforms with Figma sync. Focused on documentation, not on JSON-level token synchronization. Add a paid external dependency for a function Tokens Studio covers for free. |
| **No synchronization (two sources of truth)** | Explicitly rejected. The experience of teams without synchronization is documented: after a few sprints, designers work on tokens that no longer exist in the code, and developers are unaware of changes decided in Figma. |

---

## Consequences

**For designers:**
- Import workflow: Settings → Sync → GitHub → point to `tokens/`
- Import order: `primitives.json` → `semantic.json` → `component.json`
- The tokens available in Figma are always the tokens defined in the repo —
  no local token is possible without going through the TCR process
- Any local variable created directly in Figma = debt — to be flagged to the team

**For AI agents:**
- Tokens Studio is not in the agent loop — agents work directly with the JSON
  files, never with Figma
- The plugin guarantees that what designers see in Figma matches what agents
  read in the JSON — consistency of the shared source of truth

**For governance:**
- The JSON → Figma direction preserves digital sovereignty: tokens can't be
  modified "on the sly" via Figma and pushed to the repo
- Every token modification stays traced in git, via TCR, with approval

**For Style Dictionary (ADR-003):**
- Style Dictionary and Tokens Studio share the same source: `tokens/*.json`
- Both compile from the same JSON — no intermediate format to maintain
- Style Dictionary generates code outputs (CSS, JS, Swift, Android)
- Tokens Studio manages the design output (Figma Variables)

**Accepted cost:**
- Tokens Studio is a third-party plugin (Figma Marketplace) — a dependency on
  its maintenance
- The free version covers basic needs; some advanced features
  (automatic sync, webhooks) require a subscription
- The plugin must be reinstalled/reconfigured if the repo is moved

---

## Incidents or triggers

Foundational decision. Motivated by a systematic observation in teams without
synchronization: Figma mockups use tokens named differently from the code,
creating two parallel languages within the same team.
A designer who talks about `Bleu Principal` and a developer who talks about
`color.action.primary` are describing the same value without knowing it.
Tokens Studio aligns both languages on the same JSON.

<!-- FR -->

# ADR-011 — Choix de Tokens Studio pour la synchronisation Figma ↔ JSON

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-011-tokens-studio.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-003-style-dictionary.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-003-style-dictionary.md, decisions/ADR-008-radix-colors.md

---

## Contexte

Le système de design opère sur deux surfaces simultanément :
- **Le code** — JSON tokens + Web Components compilés par Style Dictionary
- **Figma** — maquettes et composants utilisés par l'équipe design

Sans synchronisation entre ces deux surfaces, les équipes travaillent sur
deux sources de vérité divergentes. Le designer modifie un token dans Figma,
le développeur modifie le JSON — les deux systèmes dérivent silencieusement.

La contrainte de souveraineté numérique (ADR-004, DESIGN.md) complique le problème :
la source de vérité doit rester dans le repo git, pas dans Figma. Figma est
un outil de consultation et de design, pas de gouvernance des tokens.

La question posée était :

> **Comment maintenir Figma et le repo JSON synchronisés sans inverser
> la direction de la vérité — le JSON commande, Figma suit ?**

---

## Décision

Adoption de **Tokens Studio for Figma** (plugin Figma) comme pont de synchronisation
bidirectionnel entre les fichiers JSON du repo et les variables/styles Figma.

La direction de synchronisation est non négociable :

```
tokens/*.json  →  Tokens Studio  →  Variables Figma
     ↑ source de vérité               ↓ consommateur
```

Le plugin lit les fichiers JSON depuis le repo GitHub (via sync Settings → GitHub)
et importe les tokens dans Figma dans le même ordre que l'ADR-001 :
`primitives.json` → `semantic.json` → `component.json`.

**Ce que les designers NE doivent pas faire via Tokens Studio :**
modifier les tokens directement dans Figma et pousser vers le repo.
Tout changement de token suit le processus TCR (DESIGN.md) — Figma est en lecture.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Variables Figma natives uniquement (sans plugin)** | Figma Variables ne se synchronisent pas avec un repo git nativement. Chaque mise à jour de token nécessiterait une mise à jour manuelle dans Figma — source de dérive garantie. Acceptable pour de petites équipes, mais non scalable. |
| **Theo / Style Dictionary → export Figma** | Style Dictionary peut exporter vers des formats Figma (JSON spécifique). Mais l'import dans Figma reste manuel — pas de sync bidirectionnelle ni d'interface de gestion dans Figma. Tokens Studio offre l'UI de gestion que ces exports n'ont pas. |
| **Script de sync custom** | Maintenable à court terme pour un petit catalogue de tokens. Non maintenable à l'échelle (30 palettes × 12 steps × 3 couches = centaines de tokens). Les mises à jour de l'API Figma casseraient le script sans préavis. |
| **Zeroheight / Supernova** | Plateformes de documentation de design system avec sync Figma. Centrées sur la documentation, pas sur la synchronisation de tokens au niveau JSON. Ajoutent une dépendance externe payante pour une fonction que Tokens Studio couvre gratuitement. |
| **Pas de synchronisation (deux vérités)** | Rejeté explicitement. L'expérience des équipes sans synchronisation est documentée : après quelques sprints, les designers travaillent sur des tokens qui n'existent plus dans le code, et les développeurs ignorent des changements décidés dans Figma. |

---

## Conséquences

**Pour les designers :**
- Workflow d'import : Settings → Sync → GitHub → pointer vers `tokens/`
- Import dans l'ordre : `primitives.json` → `semantic.json` → `component.json`
- Les tokens disponibles dans Figma sont toujours les tokens définis dans le repo —
  pas de token local possible sans passer par le processus TCR
- Toute variable locale créée directement dans Figma = dette — à signaler à l'équipe

**Pour les agents IA :**
- Tokens Studio n'est pas dans la boucle des agents — les agents travaillent
  directement avec les fichiers JSON, jamais avec Figma
- Le plugin garantit que ce que les designers voient dans Figma correspond à ce
  que les agents lisent dans le JSON — cohérence de la source de vérité partagée

**Pour la gouvernance :**
- La direction JSON → Figma préserve la souveraineté numérique : les tokens
  ne peuvent pas être modifiés "en douce" via Figma et poussés vers le repo
- Toute modification de token reste tracée dans git, via TCR, avec approbation

**Pour Style Dictionary (ADR-003) :**
- Style Dictionary et Tokens Studio partagent la même source : `tokens/*.json`
- Les deux compilent depuis le même JSON — pas de format intermédiaire à maintenir
- Style Dictionary génère les sorties code (CSS, JS, Swift, Android)
- Tokens Studio gère la sortie design (Variables Figma)

**Coût accepté :**
- Tokens Studio est un plugin tiers (Figma Marketplace) — dépendance à sa maintenance
- La version gratuite couvre les besoins de base ; certaines fonctionnalités avancées
  (sync automatique, webhooks) nécessitent un abonnement
- Le plugin doit être réinstallé/reconfiguré si le repo est déplacé

---

## Incidents ou déclencheurs

Décision fondatrice. Motivée par l'observation systématique dans les équipes
sans synchronisation : les maquettes Figma utilisent des tokens nommés
différemment du code, créant deux langages parallèles au sein de la même équipe.
Un designer qui parle de `Bleu Principal` et un développeur qui parle de
`color.action.primary` décrivent la même valeur sans le savoir.
Tokens Studio aligne les deux langages sur le même JSON.
