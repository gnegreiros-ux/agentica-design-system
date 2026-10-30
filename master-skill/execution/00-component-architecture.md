# Phase 00 — Component architecture

> Read `05-human-gates-checklist.md` before starting. This phase's stop point conditions the structure of every phase that follows.

This is the first decision to make, before anything else is structured. Changing it later means rebuilding `core/`, component tokens, and tests — decide it deliberately, once.

## Default

Web Components is the recommended core layer, by default, for any new agentic design system. Reasons:

- **Portability**: a Web Component works unmodified across frameworks (React, Vue, Angular, Svelte, or none), and outlives any single framework's lifecycle.
- **Independence from framework churn**: the core doesn't need a rewrite when a team's framework of choice changes or is deprecated.
- This is the layered model described by Brad Frost in *The Design System Ecosystem*: a framework-agnostic core layer, with optional framework-specific technology layers built on top of it only when needed.

Tokens (compiled once, e.g. via Style Dictionary, to CSS custom properties, JS, iOS, and Android outputs) are provided by default in **every** case, regardless of this decision. This is never a question to raise with the human — the cost of providing all four outputs is close to zero, and doing so forecloses no future option.

## Deviating from the default

A team may choose a framework-specific core (e.g. building components directly in React) instead of Web Components, if it is confident it will remain on that single framework for the long term. This deviation is only valid when:

- It is documented in an explicit ADR (Architecture Decision Record) in the target project.
- That ADR names the risk being accepted: loss of cross-framework portability, and the cost of a rewrite if the team's framework choice changes later.

A deviation made silently, or justified only verbally, does not satisfy this requirement — write the ADR.

## Framework-specific wrappers

Wrappers around the Web Components core (a React wrapper, a Vue wrapper, etc.) are **never generated preemptively** "just in case." They are only built once a team consuming the raw Web Components demonstrates a real, specific friction — not a hypothetical one.

## 🛑 Stop point

Before locking in anything else (token structure, `core/` layout, test setup), present the choice to the human:

- **Option A**: Web Components (default) — no ADR required, proceed.
- **Option B**: a documented deviation — draft the ADR, get it reviewed, then proceed.

Do not proceed to Phase 01 until the human has confirmed which option applies.
