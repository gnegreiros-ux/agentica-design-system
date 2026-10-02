# Design System Clone — start here

This package is a starting point for your own design system: a non-negotiable core
(`core/`) plus a personalization layer (`personnalisation/`) where your team records its
own brand and governance decisions.

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

`core/references/non-negotiable-foundation.md` holds the four non-negotiable rules
(accessibility, human final word, no hard-coded style, no direct primitive consumption).
It is a read-only copy of `GOVERNANCE.md`, the canonical source kept in the repository
this package is published from — whenever a file here mentions `GOVERNANCE.md`, that copy
is the one to read.

**Never edit anything under `core/`.** If a change seems to require it, that's a request
for the canonical repository, not a local patch.

## Current limitations (version 0.1.0)

This is an early, skeleton release. Be aware that:

- **The core does not ship a list of semantic tokens yet.** There is no reference list of
  the semantic tokens your theme should cover. Until there is, map the families shown in
  `personnalisation/theme/example.md` (text, feedback) and any others your components need.
- **Nothing reads `personnalisation/` yet.** Your files are recorded decisions; no build
  step turns them into CSS or components at this stage.
- **The core audits are placeholders.** `npm run build` checks the package runs, not that
  your tokens are valid or accessible. Review contrast and naming yourself.
