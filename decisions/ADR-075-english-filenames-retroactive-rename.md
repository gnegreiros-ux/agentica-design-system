# ADR-075 — Retroactive English filenames for translated documents (amends ADR-070)

> **Date:** 2026-07-18
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** ADR-070 (English as default language — amended), ADR-071 (English-only future content)

## Context

ADR-070 fully translated `How-to-sans-agents.md`, `docs/agentica-notre-demarche.md`,
`Brand/Agentica-synthèse.md`, and the 8 `scripts/continuity/*.sh` fallback scripts from <!-- lang-audit-ignore: quoting the pre-rename French filenames -->
French to English, but explicitly kept every file **name** unchanged — a deliberate
choice, reasoned in ADR-070 as avoiding broken cross-references throughout the
repository.

During a follow-up English-only validation pass (2026-07-18), the Design System Lead
flagged this as an inconsistency: an external, non-French-speaking contributor
browsing the repository tree sees French words in filenames (`sans-agents`,
`notre-demarche`, `synthèse`, `outils-existants`, `installation-produit`, etc.) even <!-- lang-audit-ignore: quoting the pre-rename French filenames -->
though the file contents are already fully English — undermining the international
legibility goal ADR-070 and ADR-071 were written to serve, at the exact surface
(GitHub's file tree) ADR-070's own rationale for translating root docs first was built
on ("an external contributor reads the repo tree before reaching the site").

## Decision

The 11 files below are renamed to English, and every cross-reference to them across the
repository (root docs, ADRs, scripts, `site/build.js`) is updated to match. This amends
ADR-070's "file paths are not renamed" clause for these specific files — it does not
reopen translation of file names in general (see Rejected alternatives).

| Old name | New name |
|---|---|
| `How-to-sans-agents.md` | `How-to-without-agents.md` |
| `docs/agentica-notre-demarche.md` | `docs/agentica-our-approach.md` |
| `Brand/Agentica-synthèse.md` <!-- lang-audit-ignore: quoting the pre-rename French filename --> | `Brand/Agentica-synthesis.md` |
| `scripts/continuity/1-1-outils-existants.sh` | `scripts/continuity/1-1-existing-tools.sh` |
| `scripts/continuity/1-2-quality-gate-manuel.sh` | `scripts/continuity/1-2-manual-quality-gate.sh` |
| `scripts/continuity/1-3-figma-checklist.sh` | *(unchanged — already English)* |
| `scripts/continuity/1-4-adr-log-rappel.sh` | `scripts/continuity/1-4-adr-log-reminder.sh` |
| `scripts/continuity/2-1-installation-produit.sh` | `scripts/continuity/2-1-product-installation.sh` |
| `scripts/continuity/2-2-checklist-produit.sh` | `scripts/continuity/2-2-product-checklist.sh` |
| `scripts/continuity/2-3-anti-contournement.sh` | `scripts/continuity/2-3-anti-bypass.sh` |
| `scripts/continuity/2-4-contact-escalade.sh` | `scripts/continuity/2-4-escalation-contact.sh` |

Renamed via `git mv` (preserves history/blame). The `scripts/continuity/*.sh` file
*contents* (comments, `echo`/prompt strings) were also translated to English in the same
pass — they were the one area ADR-070's 6 chantiers never covered, since `scripts/` was
not one of the six listed scopes.

ADR-001 through ADR-074's own filenames (`ADR-0NN-slug-in-french.md`) are **not** in
scope here — see Rejected alternatives.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Also rename `decisions/ADR-*.md` filenames to English slugs | Far larger blast radius (70+ files, every ADR cross-references others by filename, external links/citations may point at existing paths); ADR-071 already made the historical-log content bilingual without touching filenames — renaming 74 historical filenames is a separate, much costlier decision the Lead did not ask for in this pass. |
| Leave all 11 filenames as-is, per ADR-070's original reasoning | Was the status quo; superseded because it left French words visible on the one surface (GitHub's repository tree) that ADR-070 itself identified as a new contributor's first impression. |
| Redirect/symlink old paths instead of updating every reference | Adds a permanent maintenance shim for a one-time, fully-traceable rename that `git mv` + grep-and-replace already handles cleanly; no external consumer is known to link these paths directly (unlike npm package names in ADR-072/073). |

## Consequences

**For AI agents:**
- Reference `How-to-without-agents.md`, `docs/agentica-our-approach.md`,
  `Brand/Agentica-synthesis.md`, and the renamed `scripts/continuity/*.sh` paths going
  forward — the old French paths no longer exist on disk.
- `site/build.js`'s continuity page (script links, `HOWTO` constant) and `AGENTS.md` /
  `How-to-designers.md` / `How-to-devs.md` / `DESIGN.md` relations lines were updated in
  the same pass — no dangling reference should remain (verified by repository-wide grep
  for the old names).
- This does not change ADR-070's "no filename renames" default for future translation
  work in general — it is a one-time correction for files whose content was already
  fully translated but whose names were missed.

**For humans:**
- `git log --follow` on any of the 11 files still surfaces the pre-rename history.
- The public site is unaffected in substance: `site/build.js` already links to these
  paths via generated `<a href>` tags, which were updated to the new filenames as part
  of this change; no URL structure on `agentica.design` itself changes.

## Incidents or triggers

Explicit user request from Guilherme Negreiros, 2026-07-18, during a follow-up English
validation pass following ADR-070/071: flagged French filenames (e.g.
`How-to-sans-agents.md`) as a residual inconsistency and asked for a "round of
validation that everything is in English" excluding the site's intentional French
version. Given three options (rename everything and fix references, leave filenames
as-is per ADR-070, or rename only the files with zero cross-references), the Lead chose
the full rename.
