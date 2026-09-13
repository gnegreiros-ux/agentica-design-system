# Human gates checklist

> Read this file before starting Phase 00. It consolidates every stop point across all five execution phases into one quick-reference list. If you are reviewing what this skill does — as the human, or as another agent auditing its behavior — this file is the fastest way to verify the gates are real and are being respected.

An agent following this skill stops and waits for explicit human confirmation:

- [ ] **Before locking in the component architecture** (Phase 00) — Web Components by default, or a documented ADR deviation. This conditions everything that follows.
- [ ] **Before writing `GOVERNANCE.md`** in the target project (Phase 01) — present the full proposed content first.
- [ ] **Before creating the token structure** (Phase 02) — present the three-layer structure and naming schema first.
- [ ] **Before integrating audit configuration into the CI pipeline** (Phase 03) — present the engine, adapter interface, and lint rules first.
- [ ] **Before activating any agent trigger condition** (Phase 04) — an unconfirmed trigger must not cause an agent to act.
- [ ] **Before any commit, in any phase** — no exception.
- [ ] **Before opening any pull request, in any phase** — no exception.
- [ ] **Before merging any pull request** — this is never done by an agent, in any phase, under any circumstance (Rule 2).

If a step in any phase file above is not listed here, treat this checklist as incomplete rather than treating the missing step as safe to skip — cross-check against the phase file itself.
