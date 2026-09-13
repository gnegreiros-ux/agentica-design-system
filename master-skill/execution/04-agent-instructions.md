# Phase 04 — Agent instructions

> Depends on Phase 03 (audit setup confirmed and integrated).

## What to do

1. Write agent instruction files for the target project with **precise, unambiguous trigger conditions**. An agent that cannot tell exactly when an instruction file applies will improvise instead of loading it — missing edge cases, mishandling variants, or producing inconsistent output. Vague triggers ("when relevant", "for design-related tasks") are not acceptable; a trigger condition should be checkable, not a judgment call.
2. Document explicitly, for every agent involved in the target project:
   - **What the agent may do on its own**: analyze, propose, generate a diff, open a `feature/` or `docs/` branch and commit to it, open a pull request.
   - **What always requires a human**: merging a pull request, modifying component tokens, updating anything in `core/`, changing a rule in `GOVERNANCE.md`.
3. This split is not a suggestion — it is Rule 2 of the non-negotiable foundation applied concretely to this project's agent workflow.

## 🛑 Stop point

Have the human validate the trigger conditions before treating them as active. An unvalidated trigger condition must not cause an agent to act in the target project. Do not proceed to Phase 05 until the trigger conditions are confirmed.
