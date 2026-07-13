# ADR-005 — Remplacement de la variante `danger` par `critical`

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-005-variante-critical-vs-danger.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/components/button.md
> **Relations:** guidelines/components/button.md, tokens/component.json, .claude/rules/components/button.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-004-gouvernance-humaine.md

> **English summary:** Replaces the industry-standard `danger` button variant with `critical`, because a behavior-oriented name (what the system must do: confirm, audit, prevent double-clicks) is more useful to agents than an appearance-oriented one (what the button looks like). `danger` is not a valid variant in this system; any agent encountering it must escalate rather than apply it silently.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
