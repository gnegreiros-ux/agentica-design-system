# AI Anti-Patterns Gallery: 10 Reasons Your AI Website Looks Generic
## [aidesign.guide](https://www.aidesign.guide/guides/ai-anti-patterns-gallery)


When generating any page, section, or component, do not produce:

## When the brief says "premium" or "luxury"
- Premium does not mean dark mode with gold.
- Use restraint, rhythm, spacing, and confidence.
- Maximum 2 colors on the page. Accent colors are earned, not decorative.
- No gold (#d4af37, #c9a227, etc.). No matte-black gradients.
- No serif + gold + all-caps "EXCLUSIVE" combinations.
- Ask: what would feel premium if I removed 50% of the visual elements?

## Gradients
- Maximum one gradient per page. Never on more than one element type.
- No gradient buttons. No gradient card backgrounds. No gradient text unless it is the only visual accent on the page.
- If you use a gradient, use exactly 2 colors from the approved palette. No rainbow.
- No glow effects. No box-shadows with colored blur above 4px.

## Depth and shadows
- Cards: borders only (1px solid), no shadows by default.
- Shadows are only used to indicate temporary surfaces (dropdowns, modals, tooltips).
- Never stack multiple shadow layers on a single element.
- No glassmorphism. No backdrop-filter: blur. No frosted glass cards.
- If the design calls for depth, ask: "What hierarchy am I trying to signal?" Then pick one technique.

## Hero imagery
- No abstract floating 3D objects in the hero (spheres, cubes, blobs, orbs).
- No particle systems, no mesh gradients as hero background, no "cosmic" imagery.
- If the hero has imagery, it must explain the product: real UI, real output, real artifact.
- If no real artifact exists yet, prefer a text-only hero over a decorative 3D asset.
- Ask: "What is this object doing for the story?" If the answer is "nothing", remove it.

## Motion
- No scroll-triggered entrance animations. Content is visible on load.
- No parallax. No stagger reveals. No blur-to-focus entrances.
- Hover transitions: 150ms ease-out, opacity 0.7 or translateY(-1px) only.
- No scale-on-hover, no rotate-on-hover, no elastic easing.
- Motion exists for 3 reasons only: feedback (hover), orientation (navigation state), emphasis (one key moment per page).

## Spacing
- Define a spacing scale and use only these values: 4, 8, 12, 16, 24, 32, 48, 64, 96, 120.
- Section spacing (between major sections): 96px or 120px.
- Subsection spacing (within a section): 48px or 64px.
- Card padding: 24px or 32px. Nothing in between.
- Grid gaps: 16px or 24px depending on density.
- If Claude picks a value outside this scale, it must ask first.

## Typography scale
- Maximum 3 sizes per section: headline, body, caption.
- Full scale: 56 / 36 / 24 / 17 / 15 / 13 / 11 px.
- Maximum 2 font weights across the entire site.
- Hero headline: 56px desktop, 36px mobile. One size only.
- Section title: 24px. Subsection title: 17px bold.
- No italic body text. No all-caps except for 11px meta labels.
- Size contrast creates hierarchy. Weight contrast is a fallback, not a first choice.

## References
- Choose ONE dominant visual direction and ONE supporting influence. No more.
- Name the reference in the CLAUDE.md explicitly: "Primary reference: [name]. Supporting: [name]. Everything else is off-limits."
- Define what should NOT be borrowed, not just what should be.
- When in doubt, ask: "Which reference wins in this conflict?"

## Copy logic
- Every section must answer one specific question the user has at that moment.
- Headlines are statements, not teases. "Design tokens that work." not "Ready to transform your tokens?"
- No buzzwords: "leverage", "unlock", "empower", "supercharge", "revolutionize", "seamless", "game-changer".
- Feature cards name the concrete benefit with a noun, not an adjective. "Automatic token sync" not "Fast".
- Before shipping a section, ask: "What does the user now know that they did not know before?" If the answer is nothing, rewrite.

## Feature cards
- No abstract icons in pastel circles. No lucide-react sparkles, zaps, or shields as decoration.
- If a feature has an icon, it must depict the actual thing (a real screenshot, a real artifact, a number).
- Titles are noun phrases, not adjectives. "Automatic token sync" not "Fast". "End-to-end encryption" not "Secure".
- Description is one concrete sentence about what the user gets, with at least one specific noun.
- Maximum 4 cards. If you need more, the page is a list, not a feature grid.

## Micro anti-patterns

- No callout boxes with a left-border accent stripe.
- No SVG-drawn imagery. Use grey placeholders and ask for real assets.
- Default fonts to avoid: Inter, Roboto, Arial, system-ui, Fraunces.
  - Pick a typeface that has a point of view. If unsure, ask.
- No emoji unless the brand explicitly uses emoji.

For each, if the generated output contains one of these patterns, STOP and fix it before continuing.
Do not produce a final output that violates any of these rules without explicitly flagging which rule and why.

# Compare avec nos règles déjà existantes pour trouver des conflits, doublons etc, avant d'intégrer quoi que ce soit.