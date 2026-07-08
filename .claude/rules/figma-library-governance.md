# Rule : figma-library-governance

> Charte de gouvernance de la librairie Figma Agentica — le code fait foi, Figma en est
> la représentation. Ces règles s'appliquent à **tout agent** qui crée ou modifie un
> composant, une page ou une variable dans le fichier Figma.
> **Type:** rule
> **Chemin logique:** .claude/rules/figma-library-governance.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/figma-components.md
> **Relations:** .claude/instructions/figma-components.md (mécanique Plugin API + audit §22),
> .claude/rules/tokens-system.md, tokens/*.json, components/agtc-*.js, components/agtc-*.stories.js

---

## Les 5 règles absolues

```
1. Le CODE est la source unique de vérité — jamais l'inverse.
   components/agtc-*.js + *.stories.js définissent variantes, états, propriétés.
   Figma les REPRODUIT. En cas de divergence, le code gagne — on corrige Figma, jamais
   l'inverse sans décision humaine explicite (ADR si le changement doit remonter au code).

2. Aucune valeur en dur dans un composant Figma. Uniquement des Variables Figma qui
   miroitent les tokens du code (primitive → semantic → component, cf. tokens-system.md).
   Un fill, un stroke, un padding, un radius, un gap non lié à une Variable est un bug —
   pas une exception acceptable.

3. Même architecture, même logique, mêmes options qu'en code.
   Si agtc-button.js expose variant + icon + icon-suffix + icon-only + loading + disabled,
   le ComponentSet Figma expose EXACTEMENT ces axes — ni plus, ni moins. Une propriété
   Figma qui n'existe pas dans le composant code est une invention à corriger.

4. Construction Figma alignée sur les meilleures pratiques de l'industrie (§ ci-dessous) —
   pas de raccourci qui casse la parité avec le code au moment du hand-off.

5. Le rendu visuel Figma doit être le plus proche possible de Storybook et de l'écran final.
   Nuance actée par l'industrie (2026) : la parité structurelle automatique Figma↔code n'a
   pas de solution fiable — la vérification reste humaine + scriptée (§22 audit), jamais
   present automatique une fois pour toutes.
```

---

## Cycle de vie d'une modification Figma — staging, no-delete, rapport

> Adopté le 2026-07-08 (revue du pilote Button). Complète les 5 règles absolues côté
> **process**. Ces trois garde-fous existent parce qu'un sous-agent a supprimé par erreur
> le ComponentSet Button maître en « nettoyant » une section qui le contenait — incident
> qui n'aurait pas eu lieu sous ces règles.

### A. Jamais supprimer — règle dure

```
❌ INTERDIT : supprimer un nœud, un composant, un ComponentSet, une variable, une page,
   un Text Style — même s'il semble orphelin, en double, ou « juste un brouillon »
✅ En cas de doute sur un nœud à retirer : le DÉPLACER hors du flux (ex. frame « _corbeille »
   à x=6000) et le SIGNALER à l'humain — jamais .remove()
✅ Seule exception : supprimer un nœud que l'agent vient LUI-MÊME de créer dans la même
   session et qu'il reconstruit immédiatement (ex. rebuild d'un ComponentSet cassé)
```

> Avant tout `.remove()`, vérifier `node.findAll()`/`node.children` : un nœud « décoratif »
> peut contenir un composant maître comme enfant direct (cause exacte de l'incident Button).

### B. Page de staging « 🟡 Proposition — en attente d'approbation »

```
✅ Toute création ou refonte importante s'écrit D'ABORD sur la page de staging
✅ L'humain approuve visuellement, PUIS l'agent déplace le résultat vers la page finale
✅ Les petites corrections ciblées (fix d'un token, d'un lien) peuvent se faire en place
❌ Ne jamais publier la librairie ni déplacer vers la page finale sans approbation explicite
```

### C. Rapport obligatoire — checklist 10 points avant toute revue humaine

Avant de solliciter votre validation, l'agent fournit ce rapport court (complète l'audit
détaillé §21/§22, ne le remplace pas) :

```
[ ] 1. Toutes les props du contrat présentes, du bon type Figma
[ ] 2. Aucune prop combinée (« Style » fusionnant variant + state)
[ ] 3. Propriété text sur chaque calque textuel — zéro texte en dur
[ ] 4. Matrice variant × state complète, focus inclus
[ ] 5. 100 % variables liées — zéro hex/px en dur (scanUnboundPaints §22.3)
[ ] 6. Auto-layout partout, aucun positionnement absolu (hors décor _préfixé)
[ ] 7. Nommage conforme (ComponentSet, props Variant/State, calques)
[ ] 8. Ordre du panneau conforme à l'API documentée
[ ] 9. Description + lien vers guidelines/components/<comp>.md renseignés
[ ] 10. Capture comparée au rendu du site — écarts corrigés
```

Format : **liste des 10 points + capture + écarts résiduels**. Jamais de livrable sans ce rapport.

---

## Pourquoi cette hiérarchie (code → Figma, jamais l'inverse)

> « Structural component parity — keeping Figma variants, states, and properties in sync
> with coded component APIs — does not have a reliable automated solution. The most
> consistent advice from mature design systems teams is: **code is the source of truth,
> Figma is the representation**. » — [Atomize, Figma Design System Parity 2026](https://atomize.tools/blog/figma-design-system-parity-code-sync)

Ce dépôt suit ce principe à la lettre. Concrètement pour un agent :

```
✅ Avant de créer/modifier un composant Figma : lire components/agtc-<comp>.js ET
   components/agtc-<comp>.stories.js — c'est LÀ que sont les variantes/états/props réels
✅ Si Figma et le code divergent : Figma a tort par défaut, sauf décision humaine contraire
✅ Si le code lui-même semble avoir un défaut (token inexistant, valeur codée en dur) :
   le signaler à l'humain — ne jamais le "corriger" silencieusement seulement côté Figma
❌ Ne jamais inventer une variante, un état ou une propriété qui n'existe pas dans le code
❌ Ne jamais laisser Figma "avoir raison" sur le code sans qu'un humain tranche
```

---

## Architecture des tokens — Variables Figma = miroir exact du code

Trois collections, alignées sur `tokens/primitives.json` → `tokens/semantic.json` → `tokens/component.json` :

| Niveau code | Collection Figma | Règle de binding |
|---|---|---|
| `primitive.*` | `Primitives` | **Jamais** bindé directement sur un composant |
| `semantic.*` | `Semantic` | Bindé si aucun token composant n'existe pour ce rôle |
| `component.<comp>.*` | (via alias vers Semantic, même nommage `component/<comp>/<prop>`) | **Toujours priorité** — chercher le token composant avant de binder le sémantique (voir §18 de `figma-components.md`) |

**Sourcé** : « Never bind a component directly to a Primitive Color variable. Bind components
to semantic variables only. » — [Design Systems Collective, Figma Variables Playbook](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66)

Convention de nommage — **identique de part et d'autre** (Figma path = CSS custom property) :
```
Figma : component/button/primary/background
Code  : --agtc-component-button-primary-background
```
Aucune traduction manuelle ne doit être nécessaire pour relier les deux — le chemin Figma
avec `/` remplacé par `-` et préfixé `--agtc-` DOIT correspondre exactement.

---

## Composants vs Variantes — quand utiliser quoi (rappel sourcé)

> « Use component properties for simple variations (on/off icon, text content) and variants
> for visual changes (primary/secondary/ghost). Auto-layout and Variable bindings on every
> component are not optional refinements — they are baseline for production handoff. »
> — [Atomize, Figma Design System Best Practices 2026](https://atomize.tools/blog/figma-design-system-best-practices/)

```
✅ VARIANT (axe du ComponentSet) : changement visuel qualitatif — Primary/Secondary/Ghost,
   Text/Search/Password, Default/Selected
✅ COMPONENT PROPERTY (BOOLEAN/TEXT/INSTANCE_SWAP) : présence/absence ou contenu —
   icon-only, show-icon-prefix, le libellé du bouton, l'icône affichée
❌ Ne jamais créer une variante pour ce qui est en réalité une propriété booléenne du
   composant code (incident Button icônes du 2026-07-06 — voir §3 de figma-components.md)
```

---

## Veille — sources à revérifier périodiquement

Cette liste doit être re-vérifiée (WebSearch) au début de tout chantier Figma de grande
ampleur (nouveau composant, refonte d'architecture) — les pratiques Figma évoluent vite.

| Source | Ce qu'elle couvre |
|---|---|
| [Figma Help — Guide to variables](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma) | API variables officielle, source de vérité Figma |
| [Atomize — Figma Design System Best Practices](https://atomize.tools/blog/figma-design-system-best-practices/) | Architecture tokens, variantes vs propriétés |
| [Atomize — Figma↔Code Parity](https://atomize.tools/blog/figma-design-system-parity-code-sync) | Positionnement code = source de vérité |
| [Design Systems Collective — Figma Variables Playbook](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66) | Anti-patterns de binding, naming |
| [W3C WCAG — Technique C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40.html) | Anneau de focus deux couleurs (référence pour tout composant interactif) |
| [zeroheight — Scalable Figma Design Systems](https://zeroheight.com/blog/building-scalable-design-systems-with-figma-26-tips-for-2026/) | Scalabilité, documentation in-page |

> Ne pas se fier uniquement à cette table figée : relancer une recherche ciblée si un
> problème structurel récurrent apparaît (comme l'incident du 2026-07-07 sur les anneaux
> de focus, qui a mené à documenter la technique C40 après coup — elle aurait dû être
> vérifiée en amont).

---

## Audit obligatoire — voir §22 de `figma-components.md`

L'audit complet (accessibilité, affichage, variables, styles, états, variantes,
documentation in-page, liens) est scripté et documenté dans
`.claude/instructions/figma-components.md` §22. Il doit être exécuté :

```
✅ Sur toute page nouvellement créée, avant de la déclarer terminée
✅ Sur toute page dont un composant partagé (Icon, Text Style, Variable) a été modifié
✅ À la demande explicite de l'utilisateur ("audit", "vérifie tout", "screenshot global")
```

---

## Règles pour les agents

```
✅ Lire le code (composant + stories) AVANT de toucher à Figma — jamais l'inverse
✅ Chercher le token composant avant de binder le sémantique — jamais de valeur en dur
✅ Faire correspondre variantes/propriétés Figma 1:1 avec l'API du composant code
✅ Relancer une recherche de bonnes pratiques avant un chantier de grande ampleur
✅ Exécuter l'audit §22 avant de déclarer un composant ou une page terminée
❌ Ne jamais inventer une variante, un token ou une propriété absente du code
❌ Ne jamais corriger une divergence Figma↔code en donnant raison à Figma sans arbitrage humain
❌ Ne jamais considérer un audit visuel non scripté (juste un screenshot) comme suffisant
```
