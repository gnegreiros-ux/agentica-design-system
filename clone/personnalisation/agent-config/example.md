# Agent config — example

Add project-specific agent trigger conditions here, without ever narrowing the scope of the conditions already defined in `core/`.

Reminder (Rule 2): every condition added here still respects the principle that the final word belongs to a human — a trigger condition can make an agent propose or analyze, never merge a pull request or apply a structural change unattended.

## Example (fictional — replace with your own)

```md
Trigger: a pull request touches the component-token file
Agent may: flag the change, summarize the diff, request Principal Designer review
Agent may not: approve or merge the pull request
```
