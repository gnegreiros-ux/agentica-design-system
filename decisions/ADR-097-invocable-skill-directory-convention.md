# ADR-097 — Invocable skills live at `.claude/skills/<name>/SKILL.md`

> **Date:** 2026-09-17
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-097-invocable-skill-directory-convention.md
> **Read before:** AGENTS.md, governance/ai-skills-reference.md, .claude/skills/
> **Relations:** governance/ai-skills-reference.md, decisions/CHANGELOG-structure.md,
> decisions/ADR-027-pipeline-impact-pre-commit.md, decisions/ADR-029-quality-gate-pre-commit.md,
> decisions/ADR-036-ux-pattern-review-pre-composant.md

---

## Context

Claude Code only discovers a custom skill as invocable when it sits at
`.claude/skills/<name>/SKILL.md` — the directory is what the loader scans for. A flat
file at `.claude/skills/<name>.md` is invisible to it regardless of what the file
contains: it can be read as plain documentation, but it never appears in the list of
skills the model can invoke by name, and no error or warning says so.

The directory is confirmed to be the actual lock, not the YAML frontmatter: moving
the 6 flat files below into their own `<name>/SKILL.md` directory made all 6 appear
in the session's invocable-skill list immediately, before any frontmatter existed on
any of them — the loader showed each one with a degraded fallback description (the
file's own `# Skill: <name>` heading). Only after a `name`/`description` frontmatter
was added to each file did the loader's listing switch to the real, purpose-written
description. Frontmatter improves what the loader shows when deciding relevance; it
is not what makes the file discoverable in the first place.

Of this repository's 7 custom skills, 6 (`quality-gate`, `ux-pattern-review`,
`ai-component-metadata`, `ai-ds-composer`, `codebase-index`, `post-change-pipeline`)
were flat files. Only `document` happened to already use the directory format, which
is the only reason it ever worked. The other 6 were never invocable — not "sometimes
skipped," genuinely absent from every session's skill list.

This was not a theoretical gap. `quality-gate` is documented in `AGENTS.md` and
`governance/rules/post-change-pipeline.md` as the mandatory pre-commit gate — "no
commit without it having run and been approved by the human" — yet it never actually
ran as an invocation during the entire v0.4.0 Master Skill + Clone decoupling effort
(the work landing in `5b28fc2c`, `975c4fc3`, `802fb0f3`, `10904c04`), including the C1,
C2, and C3 test-suite batches applied by hand. The gate was silently absent for that
entire body of work, and nothing in the session, the repo, or the tooling surfaced
that absence — it looked, from the outside, exactly like a session that had simply
chosen not to invoke it. Found while scoping GitHub issue #122, volet 1.

## Decision

Every invocable skill in this repository lives at `.claude/skills/<name>/SKILL.md` —
the directory is the non-negotiable part; a flat `.claude/skills/<name>.md` file is
never used for anything meant to be invocable — and starts with:

1. A YAML frontmatter block with `name` (matching the directory) and `description`
   (what it does and when to use it — this is what the skill loader surfaces to
   decide relevance, so it must stand alone without the rest of the file). This does
   not gate discovery — a directory alone is enough for that — but a skill without it
   is only ever shown to the loader as its raw heading, which is not a usable
   description for relevance-matching.
2. Immediately below the frontmatter, the existing citation metadata block this
   repository already uses on every governed file (`**Type:**`, `**Logical path:**`,
   `**Read before:**`, `**Relations:**`) — kept, not merged into the frontmatter and
   not dropped. The frontmatter serves the skill loader; the citation block serves
   human readers and other tools (Codex/Copilot via `.agents/skills/`, Gemini CLI)
   navigating the file as documentation. They answer different questions and both
   stay.

This applies to the 6 skills migrated under this decision and to every skill created
in this repository from now on — a new skill is never added as a flat file, even as
a draft.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Keep flat files, rely on manual invocation discipline | This is the exact status quo that produced the incident above — a human or agent believing a gate ran because a file describing it exists, with no signal otherwise. |
| Merge the citation block's fields into the frontmatter as custom YAML keys | Breaks the convention already established by `document/SKILL.md` and the `.agents/skills/*/SKILL.md` ports, which read the citation block as prose alongside other governed files, not as skill-loader metadata. |
| Auto-generate `SKILL.md` from the flat file via a build/lint step | Adds an indirection and a new mandatory script for what is fundamentally a location-and-header problem; the fix belongs in the file at rest, not in a generation step someone can forget to run. |

## Consequences

- The 6 skills above are invocable for the first time since they were written;
  `governance/ai-skills-reference.md` and every other live reference to their old
  flat-file path are updated to `.claude/skills/<name>/SKILL.md` (see
  `decisions/CHANGELOG-structure.md` for the full list of files touched).
- `ADR-027`, `ADR-029`, and `ADR-036` — which document the impact-pipeline mechanism
  and what `quality-gate` and `ux-pattern-review` *do* — are unaffected and stay
  fully `✅ Active`: this ADR is about where a skill's file lives, not about what any
  skill decides or does, so it supersedes nothing. The relocation of the files those
  three ADRs reference is a mechanical move, logged in
  `decisions/CHANGELOG-structure.md`, not a decision change.
- Historical ADRs that mention a now-moved flat-file path in their body text
  (ADR-027, ADR-029, ADR-036, and any component-implementation ADR referencing
  `ai-component-metadata.md`) are not edited for this — see the immutability note
  in `decisions/README.md`. They reflect repo state at decision time, not current
  state.
- Any future skill PR that reintroduces a flat `.claude/skills/<name>.md` file is a
  regression to this ADR, not a valid simplification — the absence of an error when
  a skill is flat is exactly what let this go unnoticed for as long as it did.

## Incidents or triggers

`quality-gate` never ran as a real invocation across the full v0.4.0 decoupling
effort (Master Skill + Clone boundary work, C1/C2/C3 test suites), with no error or
signal exposing the gap. Surfaced while scoping GitHub issue #122, volet 1
(2026-09-17).
