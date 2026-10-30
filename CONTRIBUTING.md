# Contributing to Agentica

Thanks for your interest in Agentica. This document explains how to propose a
contribution and the conditions under which it will be accepted.

## Guiding principle

**The human always has the final word.** Every contribution — whether it
touches tokens, components, agent rules, or documentation — must respect this
principle: an AI agent may propose, detect, and generate; a structuring
decision is always validated by a person.

## Before contributing

- Open an issue to discuss the intended change before investing time in a
  pull request, except for minor fixes (typos, broken links, documentation
  clarifications).
- Changes touching primitive tokens (`tokens/primitives.json`) or agent
  governance (`AGENTS.md`, `governance/`) require prior discussion — these
  are the most structuring layers of the system.

## Certificate of Origin (DCO)

This project uses the **Developer Certificate of Origin (DCO)** instead of a
formal Contributor License Agreement (CLA). By submitting a contribution, you
certify that:

1. The contribution was created in whole or in part by you and you have the
   right to submit it under the project's license; or
2. The contribution is based upon previous work that, to your knowledge, is
   covered under an appropriate open source license, and you have the right
   under that license to submit that work with modifications, as indicated in
   the contribution; or
3. The contribution was provided to you directly by some other person who
   certified (1), (2), or (3), and you have not modified it; and
4. You understand and agree that this project and the contribution are
   public, and that a record of the contribution (including all personal
   information you submit with it, including your sign-off) is maintained
   indefinitely and may be redistributed consistent with this project or the
   open source license(s) involved.

Full DCO text: https://developercertificate.org/

### How to sign off

Every commit must include a `Signed-off-by` line with your legal name and a
valid email address:

```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

Git can add this line automatically with the `-s` flag:

```bash
git commit -s -m "Description of the change"
```

Pull requests with an unsigned commit will not be merged until the sign-off
is added (via `git commit --amend -s` or `git rebase --signoff` as needed).

## Pull request process

1. Fork the repo and create a descriptive branch
   (`fix/token-orphan-detection`, `docs/clarify-onboarding`, etc.).
2. Make sure `node scripts/audit-tokens.js --ci` passes if you touch tokens.
3. In the pull request description, explain: the problem solved, the impact
   on existing contracts (components, tokens), and whether any point needs
   explicit human validation.
4. A human review is required before any merge — no automatic merge by an AI
   agent.

## Code of conduct

Be respectful and constructive. Technical disagreements are normal and
welcome; exchanges must stay professional.
