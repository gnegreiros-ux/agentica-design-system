# ADR-078 — Restrict Tokens Studio write access to the `agentica/proposals` branch

> **Date:** 2026-07-20
> **Status:** ⚠️ Partial — see Consequences for what remains a human-only action
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** ADR-011 (Tokens Studio adoption), ADR-076/ADR-077 (branch protection on `main`/`develop`), `.claude/rules/figma-library-governance.md`, GitHub Projects — Figma-domain branch-security ticket (Priority P1, this session)

## Context

ADR-011 established a one-way sync direction — `tokens/*.json` (repo) → Tokens Studio →
Figma Variables — with Figma treated as read-only for designers and Tokens Studio
explicitly "not in the agent loop." That remains the governing rule for ordinary token
changes.

This ADR addresses a narrower, defense-in-depth gap flagged in the Figma governance
backlog: Tokens Studio's API credentials are account-scoped, not branch- or
project-scoped — a given API key has full read/write access to every org and project
the account belongs to, with no native way to restrict it to "this repo, this branch
only." If Tokens Studio's push-to-GitHub capability is ever enabled (e.g. a
designer-proposed token tweak flowing back from Figma), an unrestricted credential
could write directly to `main`, bypassing the JSON-leads-Figma-follows principle
ADR-011 exists to protect.

## Decision

Any future write path from Tokens Studio into this repository is restricted to a
dedicated branch, `agentica/proposals` (created this session from `main`, pushed to
`origin`), never `main` directly. Three concrete controls, of which two are already
in place:

1. **`main` refuses direct pushes — done.** Branch protection (ADR-076, hardened by
   ADR-077: `enforce_admins: true`) already requires every change to `main` to go
   through a PR with `lang-audit` green. This was configured for an unrelated reason
   (the `develop` bypass incident) but happens to also satisfy this ticket's
   requirement in full — no additional action needed here.
2. **A dedicated service account + scoped PAT for Tokens Studio — not done, human-only.**
   Requires creating a distinct GitHub identity (not `gnegreiros-ux`) and generating
   its fine-grained personal access token, scoped to this repository only. Creating a
   GitHub account is outside what an agent should do unsupervised — this step is left
   to the Design System Lead.
3. **Tokens Studio's own sync settings pointed at `main` for reads — not done,
   human-only.** This is a setting inside the Tokens Studio plugin panel in Figma
   itself, not exposed through the Figma API/MCP surface available to agents.

## Rationale

Once (2) exists, `main`'s existing protection (1) does the real enforcement work for
free: a service-account PR into `main` can receive genuine human review (unlike the
repo's own commits, which hit the self-approval wall documented in ADR-076) — so no
new GitHub-side configuration is needed beyond what already exists. `agentica/proposals`
gives that credential somewhere to land writes without needing push access to any
protected branch.

## Rejected alternatives

- **Wait until Tokens Studio's push feature is actually turned on before doing
  anything.** Rejected: the ticket explicitly frames this as a prerequisite "before
  any [Figma library] write action," and the branch/protection setup costs nothing to
  do now, ahead of need, versus configuring it under time pressure later.
- **Rely on `main` protection alone, skip the dedicated branch.** Rejected: without a
  designated landing branch, a permissive Tokens Studio credential would still be free
  to push to `develop` or any other unprotected branch, or create arbitrary branches —
  `agentica/proposals` gives the write path a single, auditable destination.

## Consequences

- `agentica/proposals` exists (branch off `main`, currently identical to it) — ready to
  receive writes once a Tokens Studio service account is configured to target it.
- **Two steps remain, both human-only, before this control is actually load-bearing:**
  creating the dedicated service account + scoped PAT, and pointing Tokens Studio's
  Figma-side sync settings at `main` for reads. Until both are done, this ADR describes
  a prepared but not yet activated control — the underlying risk (an overprivileged
  credential able to write to `main`) is already fully mitigated by `main`'s existing
  branch protection regardless, so there is no active gap in the meantime.
- This ADR's `Status` should move to ✅ Active once a human confirms both remaining
  steps are complete — tracked on the GitHub Projects ticket this ADR references.
