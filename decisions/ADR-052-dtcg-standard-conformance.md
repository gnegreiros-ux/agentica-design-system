# ADR-052 — Conformité au standard W3C DTCG (Design Tokens Community Group)

> **Date :** 2026-06-06
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation) · Design System Lead (format des tokens)
> **Type:** contract
> **Chemin logique:** decisions/ADR-052-dtcg-standard-conformance.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json,
> .claude/rules/tokens-system.md, .claude/skills/pipelines/style-dictionary.md

> **English summary:** Formally declares the W3C DTCG (Design Tokens Community Group) format as
> the repository's token standard — already followed de facto — and closes the gap by adding the
> `$schema` field to `tokens/primitives.json` (metadata only, no token values changed). Documents
> this on governance surfaces and publicly on the site with the official DTCG logo.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

Le système encode ses décisions sous forme de design tokens (primitif → sémantique → composant).
Le format de ces fichiers était déjà aligné de facto sur le **format Design Tokens** du W3C
Community Group (DTCG) — `$value`, `$type`, `$description`, alias `{group.token}` — et
`tokens/semantic.json` + `tokens/component.json` portaient déjà le `$schema` DTCG. Cette conformité
n'était toutefois **pas déclarée explicitement** comme une décision de gouvernance, ni documentée
comme référence opposable, ni visible publiquement.

Source officielle du standard : **https://www.designtokens.org/**.

---

## Décision

1. **Adoption explicite du format DTCG comme standard de référence** des fichiers `tokens/*.json`.
   En cas de divergence entre une habitude locale et le standard, **c'est le standard qui fait foi**.

2. **Alignement des 3 fichiers tokens** : ajout du `$schema`
   (`https://design-tokens.github.io/community-group/format/`) à `tokens/primitives.json` — qui ne
   le portait pas encore — pour atteindre 3/3 fichiers conformes. Métadonnée uniquement, **aucune
   valeur ni contrat de token modifié**.

3. **Documentation de la conformité sur les surfaces de gouvernance** :
   - `.claude/rules/tokens-system.md` — section « Standard de référence — Design Tokens (W3C DTCG) »
     + tableau des conventions appliquées.
   - `DESIGN.md` §2 — sous-section « Conformité au standard (W3C DTCG) ».

4. **Déclaration publique sur le site** : section d'accueil « Standards ouverts » affichant le
   **logo officiel DTCG** et la mention « Agentica suit le standard DTCG », avec lien vers
   `designtokens.org` (FR/EN, source de vérité copy `site/contenu.md`). Logo officiel archivé,
   versionné : `Brand/standards/dtcg-logo.svg`.

---

## Périmètre

| Inclus | Exclu |
|--------|-------|
| Déclaration de conformité + ajout `$schema` à `primitives.json` | Migration d'un éventuel format propriétaire (aucun en place) |
| Documentation gouvernance (rule + DESIGN.md) + déclaration site | Validation automatisée du schéma DTCG en CI (chantier futur) |
| Logo DTCG sur l'accueil + archivage `Brand/standards/` | Modification de valeurs ou de contrats de tokens |

---

## Alternatives rejetées

- **Rester en conformité tacite (non déclarée)** : prive le système d'une référence opposable et
  d'un argument d'interopérabilité visible — contraire à la valeur d'auditabilité — rejeté.
- **Définir un format propriétaire** : casserait l'interopérabilité avec Style Dictionary et Tokens
  Studio, et l'argument « stack agnostique / standards ouverts » — rejeté.

---

## Conséquences

- Interopérabilité garantie avec l'outillage compatible DTCG (Style Dictionary, Tokens Studio).
- Tout futur changement de format des `tokens/*.json` doit rester conforme au standard DTCG.
- Gouvernance : ajout de `$schema` (métadonnée) — niveau Design System Lead, aucun contrat impacté.
- **À suivre :** ajouter une validation de schéma DTCG dans le pipeline `style-dictionary`
  (actuellement planifié) lors de son activation.
