# Skill: codebase-index

> Reusable capability: index and map the design system.
> Enables knowing the system's complete state at any time.
> **Type:** skill
> **Logical path:** .claude/skills/codebase-index.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/components/, tokens/component.json, .claude/skills/ai-component-metadata.md

---

## Objective

Maintain an up-to-date map of the system: which components exist,
what their dependencies are, which tokens they consume,
and where drift is occurring.

---

## Component index

### Generation process

```
For each component in guidelines/components/:
  1. Read the .md file (contract)
  2. Read the token in tokens/component.json
  3. Identify dependencies (semantic tokens used)
  4. Identify components that use it (consumers)
  5. Compute the completeness score (see ai-component-metadata skill)
```

### Index format

```markdown
## Component index — [DATE]

| Component | Variants | Tokens | Score | Storybook |
|-----------|-----------|--------|-------|-----------|
| button    | 4         | 18     | 100%  | ✅ |
| input     | 3         | 12     | 70%   | ✅ |
| modal     | 2         | 8      | 40%   | 🟡 |
| badge     | 4         | 6      | 90%   | ✅ |
```

---

## Relationship graph

### Downstream dependencies (component → tokens)

```
button.primary
  └── semantic.color.action.primary
        └── primitive.color.blue.700
  └── semantic.radius.control
        └── primitive.radius.md
  └── semantic.space.control.padding-x
        └── primitive.space.4
```

### Upstream dependencies (token → components)

```
semantic.color.action.primary
  ├── component.button.primary
  ├── component.button.secondary (text)
  └── component.input.default (border-focus)
```

This graph makes it possible to know instantly, if `primitive.color.blue.700`
is modified, which components are impacted.

---

## Drift detection

### Orphaned tokens
Tokens defined in `component.json` but never used in code.

### Phantom tokens
Tokens used in code but not defined in the JSON files.

### Components without a contract
Components in the code with no matching `.md` file in `guidelines/`.

### Detached instances (Figma)
Figma components whose properties have been overridden locally.

---

## System status report

Output format for the Observatory dashboard:

```json
{
  "generatedAt": "2026-05-18T10:00:00Z",
  "components": {
    "total": 12,
    "agentReady": 8,
    "partial": 3,
    "notReady": 1
  },
  "tokens": {
    "primitives": 45,
    "semantic": 38,
    "component": 67,
    "orphaned": 2,
    "phantom": 0
  },
  "accessibility": {
    "violations": 0,
    "warnings": 3
  },
  "drift": {
    "hardcodedValues": 4,
    "deprecatedTokens": 1,
    "detachedInstances": 7
  }
}
```

---

## Recommended frequency

| Index type | Frequency | Trigger |
|-------------|-----------|-------------|
| Full index | Weekly | Cron or manual |
| Drift detection | On every PR | CI/CD |
| Observatory report | Daily | Cron |
| Relationship graph | On every token addition | CI/CD |
