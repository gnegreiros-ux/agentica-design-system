# ADR-074 — Automated npm publishing via `changesets/action` in CI

> **Date:** 2026-07-17
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Relations:** ADR-072 (npm package architecture — Changesets decision), ADR-073 (npm scope correction)

## Context

ADR-072 decided that `@agentica-ds/tokens` and `@agentica-ds/components` would be
versioned independently via Changesets, but explicitly deferred the actual CI publish
automation as "a separate implementation ticket, not part of this decision." Until now,
publishing both 0.1.0 and 0.1.1 required running `npm publish` manually from a
maintainer's own terminal for each package.

That manual process surfaced real, repeated friction: npm's web-based login/OTP flow
does not work when run non-interactively (it requires a live browser + Touch ID
confirmation), the resulting CLI session token expired within roughly 24 hours forcing
a full re-login mid-session, and one `npm publish` attempt for
`@agentica-ds/components` failed outright with `E404` on npm's OTP-polling endpoint
(`/-/v1/done`) and had to be retried by hand. None of this is viable for a frequent or
unattended release cadence, and it ties every release to one maintainer's Mac being
available.

## Decision

Publishing is automated via the official **`changesets/action@v1`** GitHub Action, in
a new `.github/workflows/release.yml` triggered on push to `main` (paths:
`packages/**`, `.changeset/**`).

The action performs Changesets' standard dual role:
- If there are pending changeset files in `.changeset/`, it opens or updates a
  **"Version Packages" pull request** (running `changeset version` — the same command
  used manually for the 0.1.1 bump).
- Once that PR is merged, the next run on `main` finds no pending changesets and
  instead runs `npx changeset publish`, which publishes any workspace package whose
  local `package.json` version is ahead of what's live on the npm registry.

Before the action runs, the workflow rebuilds each package's publishable content from
source (`npm run tokens`, `npm run build:components-package`) — required because
`packages/tokens/{css,js,tailwind,tokens}/` and `packages/components/agtc-*.js` are
generated, gitignored output, never committed.

Authentication uses **npm Trusted Publishing** (OIDC): each package
(`@agentica-ds/tokens` and `@agentica-ds/components`) is configured on npmjs.com to
trust this exact GitHub repository + workflow file as a publisher. GitHub issues a
short-lived, cryptographically signed OIDC token scoped to that specific workflow run;
npm exchanges it for a short-lived publish credential. There is no static secret to
store in the repository, nothing to leak, and nothing to rotate.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Keep publishing manually from a maintainer's terminal | This session directly demonstrated the failure modes: non-interactive OTP/WebAuthn doesn't work, session tokens expire in ~24h, and one publish attempt failed outright and needed a retry. Doesn't scale past one person. |
| npm Granular Access Token with "Bypass two-factor authentication" checked, stored as an `NPM_TOKEN` repository secret | Initially chosen, then reversed after npm's own token-creation UI displayed an explicit security warning for this option and pointed to Trusted Publishing as the intended alternative. A 2FA-bypass token is a static, long-lived secret: if a workflow, an action in the dependency chain, or a logging misconfiguration leaks it, an attacker can publish arbitrary malicious versions under `@agentica-ds/*` with no further check — the same class of failure behind real npm supply-chain incidents. npm is also actively restricting this option (2FA-bypass tokens lose account-change ability Aug 2026, direct-publish ability Jan 2027 per npm's own in-product notice), so it would have needed replacing soon regardless. |
| Hand-rolled workflow calling `npm publish` per package directly | `changesets/action` already implements the version-detection, version-PR, and monorepo-package-enumeration logic correctly across the wider Changesets ecosystem. Reimplementing it duplicates well-tested behavior for no benefit. |
| Trigger on every push to any branch or on pull requests | Publishing must only ever happen from `main`, matching every other workflow in this repo (`.claude/rules/git-workflow.md`: `main` is the protected, canonical branch). A PR only ever produces the "Version Packages" preview state, never a real publish. |

## Consequences

**For AI agents:**
- Never commit `packages/tokens/{css,js,tailwind,tokens}/` or
  `packages/components/agtc-*.js`/`index.js` content — CI regenerates it from source on
  every release run, exactly like the local build scripts.
- A version bump is now driven by merging a changeset to `main` (opens/updates the
  "Version Packages" PR), not by manually editing `package.json` versions.

**For developers:**
- Adding a changeset (`npm run changeset`) and merging it is now the entire release
  trigger — no manual `npm publish` or OTP interaction required going forward.
- The "Version Packages" PR's diff (version bumps + generated `CHANGELOG.md` entries)
  is the human checkpoint before anything actually reaches the npm registry.

**Accepted cost:**
- Requires npm Trusted Publishing to be configured for each package (each package's
  Settings page on npmjs.com → Trusted Publisher → GitHub Actions → this repo + this
  workflow filename) by a human with publish access. This ADR does not and cannot
  configure that — it's a one-time manual setup step, documented in the workflow file
  itself. Unlike a token, this has no expiry to track and nothing to rotate.

## Incidents or triggers

Triggered directly by this session's real friction publishing `0.1.0` and `0.1.1` of
both packages by hand: an email OTP that initially failed to arrive, a CLI
authentication token that expired within roughly 24 hours, and one `npm publish`
attempt for `@agentica-ds/components` that failed with `E404` on the OTP-polling
endpoint and required a manual retry.

A second, smaller incident during implementation: the first draft of this ADR and its
workflow specified an `NPM_TOKEN` Granular Access Token with 2FA bypass. While walking
through generating that token, npm's own UI displayed *"There are security risks with
this option. For automation or CI/CD uses, please use Trusted Publishing instead"* —
caught before merge, before any secret was ever created or stored, and corrected in
place to the Trusted Publishing approach described above.
