# ADR-043 — Implémentation de `agtc-link`

> **Date :** 2026-06-04
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-043-agtc-link-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-042-agtc-banner-implementation.md, guidelines/components/link.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-04 via le workflow `ux-pattern-review` (ADR-036). Décision : **LK1–LK8 tous approuvés**.
> Détail et liens : `guidelines/components/link.md` § PATTERNS UX DE RÉFÉRENCE.

| # | Pattern | Source |
|---|---------|--------|
| LK1 | Soulignement en texte courant (au-delà de la couleur) | NN/g |
| LK2 | `:focus-visible` visible | NN/g / WCAG 2.4.7 |
| LK3 | Lien externe : `rel="noopener noreferrer"` + icône + texte AT | WCAG H83 |
| LK4 | Auto-détection externe + override | Coder's Block |
| LK5 | Texte de lien descriptif | NN/g |
| LK6 | Lien = navigation, bouton = action | NN/g |
| LK7 | État visité — **hors v1** | NN/g |
| LK8 | Indice au survol même sans soulignement permanent | NN/g |

---

## Contexte

Le site contient ~2700 `<a>` et de nombreux liens externes traités à la main
(`target="_blank" rel="noopener noreferrer"` + icône). `agtc-link` formalise un lien de
**navigation** cohérent et accessible. C'est le 4ᵉ composant de la gap-analysis du 2026-06-03
(catégorie B), après table, code-block et banner.

---

## Décisions

### Décision 1 — Lien = navigation ; pour une action, `agtc-button`

`agtc-link` rend un `<a href>` réel. La distinction sémantique lien/bouton (NN/g) est un contrat :
un lien navigue (a une destination), un bouton déclenche une action. `href` est requis.

### Décision 2 — `underline="always"` par défaut (WCAG 1.4.1)

Le projet pose l'accessibilité comme **non contournable**. En texte courant, un lien ne doit pas
être distinguable par la **couleur seule** : le défaut est donc **souligné en permanence**.
`underline="hover"` (nav) et `underline="none"` (contextes où le lien est identifié autrement)
restent disponibles, et soulignent **au survol** pour récupérer l'affordance (LK8).

### Décision 3 — Lien externe accessible et sécurisé (LK3/LK4)

Un lien externe (auto-détecté : http(s) vers une autre origine, ou forcé via `external`) ouvre dans
un nouvel onglet avec `rel="noopener noreferrer"` (anti-tabnabbing) **et** un avertissement : icône
`arrow-up-right` **+ texte masqué « (ouvre dans un nouvel onglet) »**. L'icône seule ne suffit pas
(WCAG H83 — pas de symbole « nouvelle fenêtre » universellement compris).

### Décision 4 — Avertissement sur texte générique (LK5)

Si le contenu textuel est générique (« cliquez ici », « en savoir plus », « link »…), le composant
émet un `console.warn`. C'est une aide au développement, non bloquante (WCAG 2.4.4).

### Décision 5 — Architecture « mix » (cohérente avec ADR-040/041/042)

Composant `<agtc-link>` (shadow DOM) **+** classe `.agtc-link` pour le HTML statique du site. Les
deux consomment `component.link.*`. La migration des `<a>` du site vers `.agtc-link` se fera au
*dogfooding* (catégorie A).

---

## Périmètre v1

| Inclus | Exclu (évolution future) |
|--------|--------------------------|
| `<a href>` tokenisé, hover, focus-visible | État visité distinct |
| `underline` always/hover/none | Variante « bouton-lien » (→ `agtc-button`) |
| Externe : nouvel onglet + rel + icône + texte AT | Lien standalone avec flèche directionnelle dédiée |
| Auto-détection externe + override | Préfetch / prefetch hints |
| Avertissement texte générique | Téléchargement (`download`) typé |

---

## Alternatives rejetées

- **`underline="hover"` par défaut** (convention actuelle du site) : moins sûr pour WCAG 1.4.1 en texte courant — `always` retenu.
- **Icône externe sans texte AT** : insuffisant (WCAG H83) — texte masqué ajouté.
- **`target="_blank"` sans `rel`** : faille de tabnabbing — `noopener noreferrer` systématique.
- **Composant lien-bouton unique** : brouille la sémantique navigation/action — séparé de `agtc-button`.

---

## Conséquences

- Les liens du site pourront migrer vers `.agtc-link` au *dogfooding*, avec un traitement externe uniforme.
- Un éventuel état visité ou lien standalone fléché créera un nouvel ADR.

---

## Tokens ajoutés — `component.link.default.*`

| Token | Référence |
|-------|-----------|
| `text` | `semantic.color.action.primary` |
| `text-hover` | `semantic.color.action.primary-hover` |
| `border-focus` | `semantic.color.border.focus` |
