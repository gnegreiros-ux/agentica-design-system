# ADR-071 — English as the sole language for all future content

> **Date:** 2026-07-14
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-071-english-only-future-content.md
> **Read before:** AGENTS.md, DESIGN.md, decisions/ADR-070-anglais-langue-par-defaut.md
> **Relations:** decisions/ADR-070-anglais-langue-par-defaut.md (extends), decisions/README.md, site/build.js, .claude/rules/contexts-utilisation.md

---

## Context

ADR-070 (2026-07-10) made English the default language for the repository's existing
content, migrated across 6 chantiers (root docs, public site, guidelines, `.claude/`,
decisions, component code). All 6 chantiers completed 2026-07-14. Chantier 5
(`decisions/`) deliberately used a lightweight strategy for the 70 existing ADRs: a short
English summary at the top, with the full French body preserved unaltered as the
historical record — explicitly chosen over full retroactive translation, given the volume
and the framing of ADRs as a dated historical log.

With the migration complete, the Design System Lead expressed a broader, permanent intent
that goes beyond the one-time migration ADR-070 covered: Agentica should be adoptable by
design system teams anywhere, not only French-speaking ones. This requires a standing
language policy for content created **from now on**, not just a retroactive cleanup of
what already existed — a decision ADR-070 did not make, since it was scoped to migrating
existing content.

## Decision

1. **All new repository content is authored in English only**, effective immediately —
   ADRs, guidelines, rules, instructions, skills, code comments, commit messages,
   everything. No French draft or French version is produced for new content.

2. **Exception: the public website (`site/`) and its generated documentation stay
   bilingual FR/EN, English by default.** This is the only part of the project where
   French continues to be actively maintained going forward — it is the direct-facing
   surface for the project's current French-speaking users, and the existing
   `lang-fr`/`lang-en` toggle mechanism makes the incremental cost of keeping it
   near-zero.

3. **ADRs created before this decision (ADR-001 through ADR-070) are retroactively
   given a full English translation**, superseding chantier 5's lightweight-summary
   strategy. Both the English and French versions live in the same source file, structured
   so the site can toggle between them using the same mechanism as the rest of the site
   (see point 5). This translation is tracked and executed as a separate, batched
   follow-up effort — it does not block this ADR from taking effect for new content.

4. **ADRs created from this decision onward (ADR-071 and beyond) are English-only.**
   No French section is required or maintained for them.

5. **The website renders each ADR's language dynamically** via the existing `data-lang`
   attribute and `.lang-fr`/`.lang-en` CSS toggle — the same mechanism already used across
   1,249+ span pairs elsewhere on the site — rather than showing both languages
   sequentially on one scroll (chantier 5's current pattern) or generating separate
   per-language URLs per ADR. `site/build.js`'s ADR rendering (`loadADRs()`, `buildADR()`)
   is updated to parse each ADR's English and French blocks separately and wrap them
   accordingly. This is a separate, tracked implementation task following this ADR.

## Rationale

- A design system's credibility with international teams depends on being legible
  without translation friction — English is the de facto standard for open-source design
  system tooling and documentation.
- Keeping the *site* bilingual (rather than dropping French everywhere) preserves
  accessibility for the project's existing French-speaking users and stakeholders, at
  near-zero incremental cost since the toggle infrastructure already exists and is
  already exercised across the whole site.
- Splitting "future = English only" from "past = fully bilingual" avoids two costly
  extremes: perpetually translating every future ADR into French forever, or abandoning
  the French readership of 70 already-written historical decisions overnight.
- Reusing the site's existing lang-toggle mechanism for ADR pages — instead of inventing
  per-language URLs or a literal side-by-side markdown dump — keeps one i18n architecture
  for the whole site instead of two parallel ones to maintain.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|----------------------|
| Keep chantier 5's lightweight EN-summary-only strategy for existing ADRs | A reader relying only on the summary never gets the full rationale or rejected alternatives — often the most valuable part of an ADR — undermining the international-adoption goal this decision is meant to serve. |
| Full bilingual maintenance forever (every future ADR gets a French version too) | Reintroduces exactly the double-maintenance debt ADR-070 explicitly avoided for root docs, guidelines, and `.claude/`. |
| Drop French entirely, including from the site | The site is the direct-facing surface for the project's current stakeholders; removing French there provides no benefit toward international adoption and actively harms current users for a marginal simplification. |
| Separate per-language URLs for ADR pages (e.g. `/fr/adr-018.html`) | Inconsistent with the single-URL span-toggle pattern used everywhere else on the site; doubles the sitemap and internal cross-linking logic for a niche, already-on-site audience where the SEO benefit of separate URLs doesn't apply. |

## Consequences

**For AI agents:**
- From this ADR forward, generate all new decisions, rules, guidelines, and code comments
  in English only, with no French counterpart — unless the file lives under `site/`
  (site copy, `site/contenu.md`), where FR/EN span-pairing remains mandatory per
  `.claude/rules/contexts-utilisation.md` and the existing bilingual system.
- ADR-001 through ADR-070 are being retroactively fully translated as a separate, batched
  effort. Until an individual ADR's turn comes up in that batch, it still carries only
  chantier 5's lightweight EN summary — that is expected transitional state, not a defect.
- `site/build.js`'s `loadADRs()`/`buildADR()` need updating to parse a per-ADR EN/FR split
  and wrap each language in the existing `.lang-en`/`.lang-fr` toggle classes, and
  `loadADRs()`'s metadata regexes (currently matching the French field label
  the French "Décideurs" label) need to also match the English equivalent for ADRs that no longer
  carry a French section.
- `decisions/README.md`'s "Translation strategy for this folder" section is rewritten to
  reflect this decision, superseding the chantier-5 rationale it currently documents.

**For humans:**
- Any new ADR is written directly in English — no French draft, no translation pass.
- Historical ADRs remain available in French for readers who need it, but French is no
  longer the primary or canonical language of the project going forward.

## Incidents or triggers

Explicit direction from Guilherme Negreiros (Design System Lead), 2026-07-14, immediately
following the completion of ADR-070's 6 translation chantiers: *"Mon intention c'est
qu'Agentica puisse être adoptée par des équipes du monde entier, pas seulement les
francophones. À partir de maintenant tout doit être fait en anglais [...] Seulement les
ADR déjà créés auront les deux langues, les prochains seront seulement en anglais."*
