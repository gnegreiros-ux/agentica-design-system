# Instruction: verification-standards

> Principles governing how an agent reports and verifies its own work in this
> repository.
> **Type:** instruction
> **Logical path:** governance/instructions/verification-standards.md
> **Read before:** AGENTS.md, DESIGN.md
> **Relations:** AGENTS.md, governance/instructions/codebase-context.md, decisions/EXECUTION-LOG.md

---

These are permanent, cross-cutting rules — not tied to a single decision or
event (see `decisions/EXECUTION-LOG.md` for those).

1. **A commit message is never proof of its own content.** A line such as
   "Closes #N" in a commit message does not verify that the referenced
   issue's scope is actually covered. Closing a multi-part issue must be
   confirmed by a real diff showing each named part is touched — never by
   reading the message that announces it.

2. **A process decision made by analogy is an open question, not a detail.**
   Classifying a new case "like" a prior one (e.g., project-board
   attachment, scope boundaries) commits to a general rule, not a one-off
   application. Surface it as an open question before applying it, even
   when the analogy seems reasonable.

3. **Prose confirmation is never sufficient proof, regardless of stakes.**
   A sentence such as "Confirmed: X = Y" is not evidence. Every
   confirmation of a fact (a field value, a check's result, a query
   outcome) must be accompanied by the raw output of the tool or API that
   establishes it — not a restatement of it, and not a shortened form of
   a different query than the one shown.
