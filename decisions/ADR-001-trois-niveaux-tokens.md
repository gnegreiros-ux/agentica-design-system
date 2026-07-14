# ADR-001 — Three-Level Token Architecture

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Principal Designer
> **Type:** contract
> **Logical path:** decisions/ADR-001-trois-niveaux-tokens.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json, .claude/rules/tokens-system.md

---

## Context

At the start of the project, two questions structured the team's debates:

1. **Where should values live?** — Directly in components? In a global file? In Figma?
2. **How should tokens be named so an agent understands the intent, not just the value?**

The team observed that existing systems used flat tokens (`blue-700`, `spacing-4`) that
forced agents and developers to guess the intent behind each value. An agent that sees
`color: #3B82F6` doesn't know whether it's an action color, a feedback color, or
decoration. An agent that sees `color.action.primary` immediately understands the role.

Additional context: the system is designed to be used by AI agents. Agents understand
**function**, not raw value.

---

## Decision

Adopt a strict, ordered three-level architecture:

```
Primitive tokens    →   Semantic tokens    →   Component tokens
(raw values)             (UX intent)             (institutional contracts)
primitives.json          semantic.json           component.json
```

**Non-negotiable rule:** primitive tokens are never used directly in components.
Everything must go through the semantic layer.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Flat tokens** (`blue-700`, `spacing-4`) | Agents and developers must guess the intent. No machine-readable semantics. Every rename breaks everything. |
| **Two levels** (primitive + component, no semantic) | Components become coupled to raw values. Changing `blue-700` to `blue-600` requires auditing every component. The semantic layer isolates that change. |
| **Tokens directly in Figma** | Not versionable with the code. Agents have no access to Figma. Split source of truth. |
| **Global CSS Variables with no structure** | No governance. Anyone can create a local variable. Uncontrolled drift. |

---

## Consequences

**For AI agents:**
- An agent can infer intent from a token's name (`color.feedback.danger` = destructive alert)
- An agent cannot infer intent from a raw value (`#EF4444`)
- Agents must refuse to generate code with hardcoded values — this architecture makes that refusal justifiable and verifiable

**For developers:**
- Changing the value of `blue-700` only requires a change in `primitives.json`
- The semantic layer absorbs the change — components don't move
- The anti-drift lint (`.eslintrc-ds.json`) can detect primitive tokens used directly

**For designers:**
- Figma is synced via Tokens Studio in the same order: primitives → semantic → component
- Dark mode only requires remapping semantic tokens — primitives don't move

**Accepted cost:**
- Verbosity: three files to maintain instead of one
- Rigor: every new value must pass through all three levels
- This cost is judged acceptable against the benefit of agent readability and stability at scale

---

## Incidents or triggers

No real incident triggered this decision — it precedes production. It builds on the work
of Jan Six (Tokens Studio, IDS 2026) and the experience of teams that used flat tokens
with AI agents: agents invented plausible but nonexistent token names when semantics
were absent.

<!-- FR -->

# ADR-001 — Architecture 3 niveaux de tokens

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-001-trois-niveaux-tokens.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json, .claude/rules/tokens-system.md

---

## Contexte

Au démarrage du projet, deux questions structuraient les débats d'équipe :

1. **Où mettre les valeurs ?** — Dans les composants directement ? Dans un fichier global ? Dans Figma ?
2. **Comment nommer les tokens pour qu'un agent comprenne l'intention, pas seulement la valeur ?**

L'équipe constatait que les systèmes existants utilisaient des tokens plats (`blue-700`, `spacing-4`)
qui forçaient les agents et les développeurs à deviner l'intention derrière chaque valeur.
Un agent qui voit `color: #3B82F6` ne sait pas si c'est une couleur d'action, de feedback,
ou de décoration. Un agent qui voit `color.action.primary` comprend immédiatement le rôle.

Contexte supplémentaire : le système est conçu pour être utilisé par des agents IA.
Les agents comprennent la **fonction**, pas la valeur brute.

---

## Décision

Adoption d'une architecture en trois niveaux stricts et ordonnés :

```
Tokens primitifs   →   Tokens sémantiques   →   Tokens de composant
(valeurs brutes)        (intention UX)            (contrats institutionnels)
primitives.json         semantic.json             component.json
```

**Règle non négociable :** les tokens primitifs ne sont jamais utilisés directement
dans les composants. Tout passe obligatoirement par la couche sémantique.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Tokens plats** (`blue-700`, `spacing-4`) | Les agents et les développeurs doivent deviner l'intention. Aucune sémantique lisible par machine. Chaque renommage casse tout. |
| **Deux niveaux** (primitif + composant, sans sémantique) | Les composants deviennent couplés aux valeurs brutes. Si on change `blue-700` en `blue-600`, il faut auditer chaque composant. La couche sémantique isole ce changement. |
| **Tokens directement dans Figma** | Non versionnable avec le code. Les agents n'ont pas accès à Figma. Source de vérité divisée. |
| **CSS Variables globales sans structure** | Pas de gouvernance. N'importe qui peut créer une variable locale. Dérive incontrôlable. |

---

## Conséquences

**Pour les agents IA :**
- Un agent peut inférer l'intention à partir du nom du token (`color.feedback.danger` = alerte destructrice)
- Un agent ne peut pas inférer l'intention à partir d'une valeur brute (`#EF4444`)
- Les agents doivent refuser de générer du code avec des valeurs en dur — cette architecture rend ce refus justifiable et vérifiable

**Pour les développeurs :**
- Changer la valeur de `blue-700` ne nécessite qu'une modification dans `primitives.json`
- La couche sémantique absorbe le changement — les composants ne bougent pas
- Le lint anti-dérive (`.eslintrc-ds.json`) peut détecter les tokens primitifs utilisés directement

**Pour les designers :**
- Figma est synchronisé via Tokens Studio dans le même ordre : primitives → semantic → component
- Le dark mode ne nécessite que de remapper les tokens sémantiques — les primitifs ne bougent pas

**Coût accepté :**
- Verbosité : trois fichiers à maintenir au lieu d'un
- Rigueur : toute nouvelle valeur nécessite de passer par les trois niveaux
- Ce coût est jugé acceptable face au bénéfice de lisibilité pour les agents et la stabilité à l'échelle

---

## Incidents ou déclencheurs

Aucun incident réel à l'origine de cette décision — elle précède la production.
Elle s'appuie sur les travaux de Jan Six (Tokens Studio, IDS 2026) et les retours
d'expérience d'équipes ayant utilisé des tokens plats avec des agents IA :
les agents inventaient des noms de tokens plausibles mais inexistants lorsque
la sémantique était absente.
