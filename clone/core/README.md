# core/

This directory is the immutable foundation of the Clone. It is **never modified** by a team adopting the Clone, by an update, or by an agent acting on its behalf.

It implements the four non-negotiable rules defined in `GOVERNANCE.md` — the canonical source, maintained in the repository this Clone package is published from. `core/references/non-negotiable-foundation.md` is a generated, read-only copy of that source; it is regenerated with `npm run sync:governance` and is never edited by hand.

Everything a team needs to customize — brand tokens, semantic theme mapping, governance configuration, agent triggers, documentation-site config — lives in `../personnalisation/` instead. If a change seems to require touching `core/`, that is a signal to open the change as a request against the canonical repository, not to patch the local copy.

## What lives here

- `references/non-negotiable-foundation.md` — generated copy of the non-negotiable foundation (see above).
- Component and token audits (accessibility, hard-coded style, primitive-token consumption) that run on every build, regardless of any personalization configuration — see `GOVERNANCE.md`'s *Audit governance* section for why these are never optional.
