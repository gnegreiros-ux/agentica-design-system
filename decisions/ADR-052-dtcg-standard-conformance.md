# ADR-052 — Conformance to the W3C DTCG standard (Design Tokens Community Group)

> **Date:** 2026-06-06
> **Status:** ✅ Active
> **Decision-makers:** Human (approval) · Design System Lead (token format)
> **Type:** contract
> **Logical path:** decisions/ADR-052-dtcg-standard-conformance.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json,
> .claude/rules/tokens-system.md, .claude/skills/pipelines/style-dictionary.md

---

## Context

The system encodes its decisions as design tokens (primitive → semantic → component). The format
of these files was already de facto aligned with the W3C Community Group's **Design Tokens
format** (DTCG) — `$value`, `$type`, `$description`, `{group.token}` aliases — and
`tokens/semantic.json` + `tokens/component.json` already carried the DTCG `$schema`. However, this
conformance was **not explicitly declared** as a governance decision, nor documented as a binding
reference, nor publicly visible.

Official source for the standard: **https://www.designtokens.org/**.

---

## Decision

1. **Explicit adoption of the DTCG format as the reference standard** for `tokens/*.json` files.
   In case of divergence between a local habit and the standard, **the standard prevails**.

2. **Alignment of the 3 token files**: adding the `$schema`
   (`https://design-tokens.github.io/community-group/format/`) to `tokens/primitives.json` — which
   did not yet carry it — to reach 3/3 conformant files. Metadata only, **no token value or
   contract changed**.

3. **Documenting conformance on governance surfaces**:
   - `.claude/rules/tokens-system.md` — "Reference standard — Design Tokens (W3C DTCG)" section
     + table of applied conventions.
   - `DESIGN.md` §2 — "Standard conformance (W3C DTCG)" subsection.

4. **Public declaration on the site**: home page "Open standards" section displaying the
   **official DTCG logo** and the statement "Agentica follows the DTCG standard," with a link to
   `designtokens.org` (FR/EN, copy source of truth `site/contenu.md`). Official logo archived,
   versioned: `Brand/standards/dtcg-logo.svg`.

---

## Scope

| Included | Excluded |
|--------|--------|
| Conformance declaration + adding `$schema` to `primitives.json` | Migration of any proprietary format (none in place) |
| Governance documentation (rule + DESIGN.md) + site declaration | Automated DTCG schema validation in CI (future project) |
| DTCG logo on the home page + `Brand/standards/` archiving | Modifying token values or contracts |

---

## Rejected alternatives

- **Staying in tacit (undeclared) conformance**: deprives the system of a binding reference and a
  visible interoperability argument — contrary to the auditability value — rejected.
- **Defining a proprietary format**: would break interoperability with Style Dictionary and Tokens
  Studio, and the "stack-agnostic / open standards" argument — rejected.

---

## Consequences

- Interoperability guaranteed with DTCG-compatible tooling (Style Dictionary, Tokens Studio).
- Any future change to the `tokens/*.json` format must remain conformant with the DTCG standard.
- Governance: adding `$schema` (metadata) — Design System Lead level, no contract impacted.
- **To follow up:** add DTCG schema validation to the `style-dictionary` pipeline (currently
  planned) once it's activated.

<!-- FR -->

# ADR-052 — Conformité au standard W3C DTCG (Design Tokens Community Group)

> **Date :** 2026-06-06
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation) · Design System Lead (format des tokens)
> **Type:** contract
> **Chemin logique:** decisions/ADR-052-dtcg-standard-conformance.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json,
> .claude/rules/tokens-system.md, .claude/skills/pipelines/style-dictionary.md

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
