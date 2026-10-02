import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n,Z as r,q as i}from"./iframe-BnplYTFI.js";var a,o=e((()=>{t(),a=class extends i{static properties={heading:{type:String},headingLevel:{type:Number,attribute:`heading-level`},variant:{type:String}};constructor(){super(),this.heading=``,this.headingLevel=3,this.variant=`default`}static styles=r`
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
      padding: 1.5rem;
      background: var(--agtc-semantic-color-background-overlay-dark, rgba(12, 15, 25, .78));
      backdrop-filter: blur(18px);
      border: 1px solid var(--agtc-semantic-color-border-overlay-dark, rgba(255,255,255,.06));
      overflow: hidden;
      min-height: 200px;
    }

    :host::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 3px;
      background: var(--agtc-semantic-color-action-primary, #12a594);
      transform: scaleX(0.16);
      transform-origin: left;
      transition: transform .28s ease;
    }

    :host([variant="marketing"])::after {
      background: linear-gradient(
        90deg,
        var(--agtc-semantic-color-action-primary, #12a594),
        var(--agtc-semantic-color-brand-accent, #e35d6a)
      );
    }

    :host(:hover)::after,
    :host(:focus-within)::after {
      transform: scaleX(1);
    }

    /* P7 — prefers-reduced-motion: border always visible, transition disabled */
    @media (prefers-reduced-motion: reduce) {
      :host::after {
        transform: scaleX(1);
        transition: none;
      }
    }

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      color: var(--agtc-semantic-color-action-primary, #12a594);
      margin-bottom: var(--agtc-semantic-space-component-padding-lg, 16px);
      flex-shrink: 0;
    }

    ::slotted([slot="icon"]) {
      width: 1.25rem;
      height: 1.25rem;
    }

    .heading {
      font-size: .95rem;
      font-weight: 700;
      color: var(--agtc-semantic-color-text-on-dark, rgba(255,255,255,1.00));
      margin: 0 0 .5rem;
      line-height: 1.3;
    }

    .body {
      font-size: .875rem;
      color: var(--agtc-semantic-color-text-on-dark-secondary, rgba(255,255,255,0.75));
      line-height: 1.6;
      flex: 1;
    }
  `;_renderHeading(){return n`<div class="heading" role="heading" aria-level="${Math.min(Math.max(this.headingLevel,1),6)}">${this.heading}</div>`}render(){return n`
      ${this.querySelector(`[slot="icon"]`)===null?``:n`<div class="icon-wrap"><slot name="icon"></slot></div>`}
      ${this._renderHeading()}
      <div class="body"><slot></slot></div>
    `}},customElements.define(`agtc-feature-card`,a)})),s,c,l,u,d,f,p;e((()=>{o(),s={title:`Components/Feature Card`,component:`agtc-feature-card`,parameters:{docs:{description:{component:`
**V2 editorial card** — functional icon + title + body text with an interactivity affordance (animated border-bottom).

Designed for narrative marketing sections ("Value by role", editorial blocks). Two variants:
- \`default\` — primary-color border-bottom (SaaS pages)
- \`marketing\` — primary→accent gradient border-bottom (\`data-context="marketing"\` pages)

**UX patterns applied** (approved ADR-063, 2026-06-25):
- [NN/g — Icon + title as a duo](https://www.nngroup.com/articles/design-pattern-guidelines/): functional icon, not decorative
- [IxDF — Controlled affordance](https://ixdf.org/literature/topics/ui-design-patterns): animation only on hover/focus
- [IxDF — prefers-reduced-motion](https://ixdf.org/literature/topics/ui-design-patterns): border permanently visible when motion is reduced
- [Dashboard — Contextual variant](https://dashboarddesignpatterns.github.io/patterns.html): default vs marketing

**Attributes:** \`heading\` · \`heading-level\` (1-6, default 3) · \`variant\` (default | marketing)

**Slots:** \`icon\` (SVG 20×20) · *(default)* body text
        `}}},argTypes:{heading:{control:`text`,description:`Card title`},headingLevel:{control:{type:`number`,min:1,max:6},description:`HTML heading level (1-6)`},variant:{control:{type:`select`,options:[`default`,`marketing`]}}}},c=`<svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
</svg>`,l={render:e=>`
    <agtc-feature-card heading="${e.heading}" heading-level="${e.headingLevel}" variant="${e.variant}">
      ${c}
      Semantic tokens, component contracts and documented decisions — readable by humans and AI agents.
    </agtc-feature-card>
  `,args:{heading:`Designers`,headingLevel:3,variant:`default`}},u={render:e=>`
    <div style="background:var(--agtc-semantic-color-background-inverse);padding:2rem;">
      <agtc-feature-card heading="${e.heading}" heading-level="${e.headingLevel}" variant="${e.variant}">
        ${c}
        Semantic tokens, component contracts and documented decisions — readable by humans and AI agents.
      </agtc-feature-card>
    </div>
  `,args:{heading:`Designers`,headingLevel:3,variant:`marketing`}},d={render:()=>`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--agtc-semantic-color-background-inverse-raised);max-width:900px;"> <!-- audit-ignore: 1px hairline grid-divider technique, not a spacing decision -->
      ${[`Organization`,`Managers`,`Designers`,`Developers`,`AI`].map(e=>`
        <agtc-feature-card heading="${e}" heading-level="3" variant="marketing">
          ${c}
          Specific value for this role in the agentic design system.
        </agtc-feature-card>
      `).join(``)}
    </div>
  `,parameters:{docs:{description:{story:`Grid of 5 cards — typical usage in the "Value by role" section.`}}}},f={render:()=>`
    <p style="font-size:.85rem;margin-bottom:1rem;color:var(--agtc-semantic-color-text-secondary);">
      Simulate with: OS → Accessibility → Reduce motion.
      The border-bottom is visible at full width from the start.
    </p>
    <agtc-feature-card heading="Accessibility" heading-level="3">
      ${c}
      The border-bottom stays visible even without animation — prefers-reduced-motion respected.
    </agtc-feature-card>
  `},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => \`
    <agtc-feature-card heading="\${args.heading}" heading-level="\${args.headingLevel}" variant="\${args.variant}">
      \${iconSvg}
      Semantic tokens, component contracts and documented decisions — readable by humans and AI agents.
    </agtc-feature-card>
  \`,
  args: {
    heading: 'Designers',
    headingLevel: 3,
    variant: 'default'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => \`
    <div style="background:var(--agtc-semantic-color-background-inverse);padding:2rem;">
      <agtc-feature-card heading="\${args.heading}" heading-level="\${args.headingLevel}" variant="\${args.variant}">
        \${iconSvg}
        Semantic tokens, component contracts and documented decisions — readable by humans and AI agents.
      </agtc-feature-card>
    </div>
  \`,
  args: {
    heading: 'Designers',
    headingLevel: 3,
    variant: 'marketing'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => \`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--agtc-semantic-color-background-inverse-raised);max-width:900px;"> <!-- audit-ignore: 1px hairline grid-divider technique, not a spacing decision -->
      \${['Organization', 'Managers', 'Designers', 'Developers', 'AI'].map(name => \`
        <agtc-feature-card heading="\${name}" heading-level="3" variant="marketing">
          \${iconSvg}
          Specific value for this role in the agentic design system.
        </agtc-feature-card>
      \`).join('')}
    </div>
  \`,
  parameters: {
    docs: {
      description: {
        story: 'Grid of 5 cards — typical usage in the "Value by role" section.'
      }
    }
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => \`
    <p style="font-size:.85rem;margin-bottom:1rem;color:var(--agtc-semantic-color-text-secondary);">
      Simulate with: OS → Accessibility → Reduce motion.
      The border-bottom is visible at full width from the start.
    </p>
    <agtc-feature-card heading="Accessibility" heading-level="3">
      \${iconSvg}
      The border-bottom stays visible even without animation — prefers-reduced-motion respected.
    </agtc-feature-card>
  \`
}`,...f.parameters?.docs?.source}}},p=[`Default`,`Marketing`,`Grid`,`ReducedMotion`]}))();export{l as Default,d as Grid,u as Marketing,f as ReducedMotion,p as __namedExportsOrder,s as default};