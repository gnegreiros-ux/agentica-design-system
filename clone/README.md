# Design System Clone — start here

This package is a starting point for your own design system: a non-negotiable core
(`core-source/`) plus a personalization layer (`personnalisation/`) where your team
records its own brand and governance decisions.

**Unpacked, this folder *is* your Clone.** There is nothing to clone, and nothing to
install besides Node.js.

## What you need

- **Node.js 20 or later** — check with `node -v` in a terminal. That's all: the package
  has no dependencies, so `npm install` is not needed.
- **Your brand decisions, already made** — at least your main colors, a typeface, and
  whether you support a dark mode. The Clone records decisions; it doesn't make them
  for you.
- **A text editor** — every file you'll touch is Markdown or JSON.

## Getting started, step by step

1. **Open a terminal in this folder** (the one containing this `README.md`) and check the
   core audits run before you change anything:

   ```bash
   npm run build
   ```

   Expected last line: `All core audits passed.`

2. **Read `personnalisation/GUIDE.md`.** It explains the five subfolders of
   `personnalisation/` — what each one is for, and what stays non-negotiable.

3. **Record your decisions, one subfolder at a time.** In each subfolder of
   `personnalisation/`, `example.md` shows the expected shape with fictional values. Keep
   it as a reference and create your own file next to it. Suggested file names:

   | Subfolder | What goes in it | Suggested file |
   |---|---|---|
   | `branding/` | Your primitive tokens: colors, typefaces, scales | `tokens.json` |
   | `theme/` | Semantic tokens mapped to your primitives | `tokens.json` |
   | `governance/` | Your governance choices | `decisions.md` |
   | `agent-config/` | Extra agent triggers, if any | `triggers.md` |
   | `docs-site/` | Documentation-site settings | `config.json` |

   Start with `branding/`, then `theme/` (it references `branding/`). The other three can
   be done in any order.

4. **Tick `personnalisation/CHECKLIST.md`** as you go — it lists every decision so none
   gets forgotten.

5. **Run `npm run build` again.** It must still end with `All core audits passed.`

6. **Have a human review everything** before the first documentation generation.

You're done when every item of `CHECKLIST.md` that applies to you is ticked, and the
build is green.

## Rules that apply everywhere, including in `personnalisation/`

`core-source/references/non-negotiable-foundation.md` holds the four non-negotiable rules
(accessibility, human final word, no hard-coded style, no direct primitive consumption).
It is a read-only copy of `GOVERNANCE.md`, the canonical source kept in the repository
this package is published from — whenever a file here mentions `GOVERNANCE.md`, that copy
is the one to read.

**Never edit anything under `core-source/`.** If a change seems to require it, that's a
request for the canonical repository, not a local patch.

## Two forms of "core"

"Core" refers to two different things depending on who's looking at it (see ADR-105):

| | Source | Installed |
|---|---|---|
| Where it lives | The canonical repository this package is published from | `node_modules/` in your project |
| How it gets there | Written and versioned in that repository | Installed from npm, pinned to an exact version |
| Editable | Yes — this is where the code is written | Never — replaced wholesale on update, never patched in place |
| Contains | The 4 non-negotiable rules, the audit engine, agent rules, doc-generator hooks | Identical — one as source, one as a published artifact |
| Components | Never holds component source — not deposited by an instance, not of its own | Same — where an audit's component source comes from is undecided today (see ADR-105, issue #225) |

**Naming convention, from here on:** `core-source/` always means this directory — the
Clone's source. (In the canonical repository's own file tree it sits at
`clone/core-source/`; your own unpacked copy has no `clone/` wrapper — `core-source/`
is at the root, next to this README.) Unqualified "core," with no path, always means
`GOVERNANCE.md`'s abstract foundation concept (Rules 3–4: no hardcoded style, no direct
primitive-token consumption). A sentence needing both says so explicitly — never relies
on either word alone.

## Current limitations (version 0.1.0)

This is an early, skeleton release. Be aware that:

- **`core-source/` does not ship a list of semantic tokens yet.** There is no reference
  list of the semantic tokens your theme should cover. Until there is, map the families
  shown in `personnalisation/theme/example.md` (text, feedback) and any others your
  components need.
- **Nothing reads `personnalisation/` yet.** Your files are recorded decisions; no build
  step turns them into CSS or components at this stage.
- **The audits in `core-source/` are placeholders.** `npm run build` checks the package
  runs, not that your tokens are valid or accessible. Review contrast and naming yourself.
