# ADR-005 — Replacing the `danger` variant with `critical`

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Principal Designer
> **Type:** contract
> **Logical path:** decisions/ADR-005-variante-critical-vs-danger.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/components/button.md
> **Relations:** guidelines/components/button.md, tokens/component.json, .claude/rules/components/button.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-004-gouvernance-humaine.md

---

## Context

While designing the `button` component, the team needed to name the variant meant
for irreversible or destructive actions (deleting a folder, revoking access,
permanently cancelling an order).

The most common industry name is `danger`, used notably by Bootstrap, Material UI,
and many established systems.

Two questions structured the debate:

**1. What should an agent understand from the variant's name?**

An agent reading `variant="danger"` understands: *this action is visually
dangerous* — probably red, alarming. It doesn't understand what it must do.

An agent reading `variant="critical"` understands: *this action is critical* — it
has irreversible consequences and requires a specific protocol.

**2. Does the name encode an appearance or a behavior?**

`danger` is a visual and emotional judgment. It describes how the button *looks*
to the user.

`critical` is a functional and behavioral judgment. It describes what the system
*must do* when this button is used.

This project encodes decisions in machine-readable tokens. A token that names an
appearance is a value. A token that names a behavior is an intent. ADR-001
establishes that the system works with intents.

---

## Decision

Adopt `critical` as the only variant name for irreversible actions. `danger` does
not exist as a variant in this system — any agent that tries to use it must
escalate, never improvise.

The `component.button.critical` token explicitly carries:
- `requiresConfirmation: true` — the confirmation pattern is mandatory
- `auditLog: true` — every click is logged
- `preventDoubleClick: true` — protection against accidental triggers

This metadata is machine-readable. An agent generating a `critical` button knows
it must also verify the confirmation pattern exists in the interface. An agent
generating a `danger` button has none of these associated constraints — the name
alone doesn't convey the protocol.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **`danger`** | Describes an appearance, not a behavior. An agent interprets "danger" as a visual instruction (red, alarming) without inferring the need for confirmation. Common in the industry but semantically poor for an agentic system. |
| **`destructive`** | Better than `danger` — describes the type of action, not the color. Used by Radix UI and shadcn/ui. Rejected because it describes *what the action does* (destroy) rather than *what the system must do* (confirm, audit, protect). A `destructive` button indicates a consequence; a `critical` button indicates a protocol. |
| **`warning`** | Too weak. Implies caution, not irreversibility. A user can dismiss a warning. A `critical` action can't be dismissed — it demands explicit confirmation before execution. |
| **`error`** | Wrong semantics. `error` denotes a system state, not a user action. Mixing the two categories confuses agents that must distinguish component states from action variants. |
| **`delete`** | Too specific. Assumes the only critical action is deletion. But `critical` covers access revocation, permanent cancellation, account deactivation — irreversible actions that aren't deletions. |
| **No dedicated variant** (use `primary` with a red color) | Would destroy the action hierarchy. A red `primary` button is a contradiction in the system: `primary` means "recommended main action," red means "danger." An agent facing this inconsistency can't reason correctly about intent. |

---

## Consequences

**For AI agents:**
- `critical` is the only valid name — any variant not defined in `component.json` triggers mandatory escalation
- When an agent generates a `critical` button, it knows it must check three things:
  1. `requiresConfirmation: true` is in the token
  2. The confirmation pattern exists in the adjacent interface
  3. The label describes the consequence, not just the action ("Permanently delete the folder," not "Delete")
- If an agent receives a request with `variant="danger"`, it must flag that the
  variant doesn't exist and propose `critical` as an alternative — never apply
  `danger` silently

**For developers:**
- The rule is memorable: if the action is irreversible → `critical`, always
- The anti-drift lint can detect `danger` usage and suggest `critical`
- Migration from a prior system using `danger` is documented: rename the variant,
  add the confirmation pattern, verify 4.5:1 contrast

**For designers:**
- `critical` in Figma maps to the `component.button.critical` token
- The background color (`semantic.color.feedback.danger`) stays red — that's the value
- The component's *name* encodes the behavior, not the color. This distinction
  matters to avoid locally creating a `danger` component that would look identical
  but lack the associated constraints

**For accessibility:**
- The minimum contrast for `critical` is 4.5:1 on a white background — non-negotiable
- A red button with white text below that ratio is an anti-pattern automatically
  detected by axe-core

---

## Incidents or triggers

This decision emerged from an observation during tests with AI agents: an agent
generating interfaces from natural-language descriptions systematically used
`danger` for destructive actions, then applied a red style, without ever
triggering a confirmation pattern.

The same agent, faced with `critical`, inferred the need for a validation step
before execution — simply from the name, with no explicit rule injected.

This test empirically validated that behavior-oriented naming improves the
reliability of agent output, regardless of the model used.

<!-- FR -->

# ADR-005 — Remplacement de la variante `danger` par `critical`

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-005-variante-critical-vs-danger.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/components/button.md
> **Relations:** guidelines/components/button.md, tokens/component.json, .claude/rules/components/button.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-004-gouvernance-humaine.md

---

## Contexte

Lors de la conception du composant `button`, l'équipe devait nommer la variante
destinée aux actions irréversibles ou destructrices (supprimer un dossier,
révoquer un accès, annuler définitivement une commande).

Le nom le plus courant dans l'industrie est `danger`, utilisé notamment par
Bootstrap, Material UI, et de nombreux systèmes établis.

Deux questions ont structuré le débat :

**1. Que doit comprendre un agent en lisant le nom de la variante ?**

Un agent qui lit `variant="danger"` comprend : *cette action est dangereuse visuellement*
— probablement rouge, alarming. Il ne comprend pas ce qu'il doit faire.

Un agent qui lit `variant="critical"` comprend : *cette action est critique* —
elle a des conséquences irréversibles et requiert un protocole particulier.

**2. Le nom encode-t-il une apparence ou un comportement ?**

`danger` est un jugement visuel et émotionnel. Il décrit comment le bouton
*semble* à l'utilisateur.

`critical` est un jugement fonctionnel et comportemental. Il décrit ce que
le système *doit faire* lorsque ce bouton est utilisé.

Ce projet encode les décisions dans des tokens lisibles par machine. Un token
qui nomme une apparence est une valeur. Un token qui nomme un comportement est
une intention. L'ADR-001 établit que le système travaille avec des intentions.

---

## Décision

Adoption de `critical` comme seul nom de variante pour les actions irréversibles.
`danger` est une variante inexistante dans ce système — tout agent qui tente
de l'utiliser doit escalader, jamais improviser.

Le token `component.button.critical` porte explicitement :
- `requiresConfirmation: true` — le pattern de confirmation est obligatoire
- `auditLog: true` — chaque clic est enregistré
- `preventDoubleClick: true` — protection contre les déclenchements accidentels

Ces métadonnées sont lisibles par machine. Un agent qui génère un bouton `critical`
sait qu'il doit également vérifier l'existence du pattern de confirmation dans l'interface.
Un agent qui génère un bouton `danger` n'a aucune de ces contraintes associées — le nom seul ne transmet pas le protocole.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **`danger`** | Décrit une apparence, pas un comportement. Un agent interprète "danger" comme une instruction visuelle (rouge, alarmant) sans inférer le besoin de confirmation. Courant dans l'industrie mais sémantiquement pauvre pour un système agentique. |
| **`destructive`** | Meilleur que `danger` — décrit le type d'action, pas la couleur. Utilisé par Radix UI et shadcn/ui. Rejeté car il décrit *ce que l'action fait* (détruire) plutôt que *ce que le système doit faire* (confirmer, auditer, protéger). Un bouton `destructive` indique une conséquence ; un bouton `critical` indique un protocole. |
| **`warning`** | Trop faible. Implique la prudence, pas l'irréversibilité. Un utilisateur peut ignorer un avertissement. Une action `critical` ne peut pas être ignorée — elle exige une confirmation explicite avant exécution. |
| **`error`** | Mauvaise sémantique. `error` désigne un état système, pas une action utilisateur. Mélanger les deux catégories crée de la confusion pour les agents qui doivent distinguer les états des composants des variantes d'action. |
| **`delete`** | Trop spécifique. Suppose que la seule action critique est la suppression. Or `critical` couvre la révocation d'accès, l'annulation définitive, la désactivation de compte — des actions irréversibles qui ne sont pas des suppressions. |
| **Pas de variante dédiée** (utiliser `primary` avec une couleur rouge) | Détruirait la hiérarchie d'action. Un bouton `primary` rouge est une contradiction dans le système : `primary` signifie "action principale recommandée", rouge signifie "danger". Un agent face à cette incohérence ne peut pas raisonner correctement sur l'intention. |

---

## Conséquences

**Pour les agents IA :**
- `critical` est le seul nom valide — toute variante non définie dans `component.json` déclenche une escalade obligatoire
- Quand un agent génère un bouton `critical`, il sait qu'il doit vérifier trois choses :
  1. `requiresConfirmation: true` est dans le token
  2. Le pattern de confirmation existe dans l'interface adjacente
  3. Le libellé décrit la conséquence, pas seulement l'action ("Supprimer définitivement le dossier", pas "Supprimer")
- Si un agent reçoit une demande avec `variant="danger"`, il doit signaler que la variante n'existe pas et proposer `critical` comme alternative — jamais appliquer `danger` silencieusement

**Pour les développeurs :**
- La règle est mémorisable : si l'action est irréversible → `critical`, toujours
- Le lint anti-dérive peut détecter l'usage de `danger` et suggérer `critical`
- La migration depuis un système antérieur utilisant `danger` est documentée :
  renommer la variante, ajouter le pattern de confirmation, vérifier le contraste 4.5:1

**Pour les designers :**
- `critical` dans Figma correspond au token `component.button.critical`
- La couleur de fond (`semantic.color.feedback.danger`) reste rouge — c'est la valeur
- Le *nom* du composant encode le comportement, pas la couleur. Cette distinction
  est importante pour éviter de créer localement un composant `danger` qui serait
  visuellement identique mais sans les contraintes associées

**Pour l'accessibilité :**
- Le contraste minimum de `critical` est 4.5:1 sur fond blanc — non négociable
- Un bouton rouge avec texte blanc en dessous de ce ratio est un anti-pattern
  détecté automatiquement par axe-core

---

## Incidents ou déclencheurs

Cette décision a émergé d'une observation lors de tests avec des agents IA :
un agent générant des interfaces à partir de descriptions en langage naturel
utilisait systématiquement `danger` pour les actions destructrices, puis appliquait
un style rouge, sans jamais déclencher de pattern de confirmation.

Le même agent, confronté à `critical`, inférait le besoin d'une étape de validation
avant exécution — simplement à partir du nom, sans règle explicite injectée.

Ce test a validé empiriquement que le nommage orienté comportement améliore
la fiabilité des sorties des agents, indépendamment du modèle utilisé.
