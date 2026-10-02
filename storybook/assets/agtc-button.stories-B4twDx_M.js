import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s,c,l,u,d,f,p,m,h;e((()=>{t(),r={title:`Components/agtc-button`,component:`agtc-button`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036, all approved):`,``,`- **A single primary action** per context — [IxDF — clear primary action](https://ixdf.org/literature/topics/ui-design-patterns)`,"- **Explicit confirmation** for `critical` — [NN/g — error prevention](https://www.nngroup.com/articles/design-pattern-guidelines/)","- **Width preserved** during `loading` — [Smashing](https://www.smashingmagazine.com/category/design-patterns/)","- **Never disable without stating the reason** (motivated `disabled` rather than hiding) — [Smashing — hidden vs disabled](https://www.smashingmagazine.com/category/design-patterns/)",`- **Label describing the consequence** (not "OK") — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)`,``,"Details: `guidelines/components/button.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`ghost`,`critical`],description:`Visual variant — defines the hierarchy and the intent of the action.`,table:{defaultValue:{summary:`primary`}}},disabled:{control:`boolean`,description:`Disables all interaction. Visual width is preserved.`},loading:{control:`boolean`,description:`Async state — visible spinner, width preserved, aria-busy=true.`},iconOnly:{control:`boolean`,description:`Square padding. Requires label="" for WCAG 1.1.1.`,name:`icon-only`},icon:{control:`text`,description:`Prefix icon name (via <agtc-icon>).`},iconSuffix:{control:`text`,description:`Suffix icon name (via <agtc-icon>).`,name:`icon-suffix`},label:{control:`text`,description:`aria-label for icon-only buttons. Required when icon-only=true.`}},args:{variant:`primary`,disabled:!1,loading:!1},render:e=>n`
    <agtc-button
      variant="${e.variant}"
      ?disabled="${e.disabled}"
      ?loading="${e.loading}"
      ?icon-only="${e.iconOnly}"
      icon="${e.icon||``}"
      icon-suffix="${e.iconSuffix||``}"
      label="${e.label||``}"
    >
      ${e.slotContent??`Submit`}
    </agtc-button>
  `},i={name:`Primary — main action`,args:{variant:`primary`},render:()=>n`<agtc-button variant="primary">Submit</agtc-button>`},a={name:`Secondary — alternative action`,args:{variant:`secondary`},render:()=>n`<agtc-button variant="secondary">Cancel</agtc-button>`},o={name:`Ghost — tertiary action`,args:{variant:`ghost`},render:()=>n`<agtc-button variant="ghost">Learn more</agtc-button>`},s={name:`Critical — irreversible action`,args:{variant:`critical`},render:()=>n`<agtc-button variant="critical">Permanently delete</agtc-button>`},c={name:`States — Disabled (all variants)`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" disabled>Submit</agtc-button>
      <agtc-button variant="secondary" disabled>Cancel</agtc-button>
      <agtc-button variant="ghost" disabled>Learn more</agtc-button>
      <agtc-button variant="critical" disabled>Permanently delete</agtc-button>
    </div>
  `},l={name:`States — Loading (all variants)`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" loading>Submit</agtc-button>
      <agtc-button variant="secondary" loading>Cancel</agtc-button>
      <agtc-button variant="ghost" loading>Learn more</agtc-button>
      <agtc-button variant="critical" loading>Permanently delete</agtc-button>
    </div>
  `},u={name:`Critical — confirmation flow (2 clicks)`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:400px;">
      <p style="font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);margin:0;">
        1st click → "Confirm?" · 2nd click → action · Escape or blur → reset
      </p>
      <agtc-button variant="critical">Permanently delete the folder</agtc-button>
    </div>
  `},d={name:`Icons — Prefix (slot property)`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon="plus">Add</agtc-button>
      <agtc-button variant="secondary" icon="arrow-left">Back</agtc-button>
      <agtc-button variant="ghost" icon="info">Details</agtc-button>
    </div>
  `},f={name:`Icons — Suffix (slot property)`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon-suffix="arrow-right">Next</agtc-button>
      <agtc-button variant="secondary" icon-suffix="external-link">View</agtc-button>
    </div>
  `},p={name:`Icons — Free slot composition (custom SVG)`,render:()=>n`
    <agtc-button variant="primary">
      <svg slot="prefix" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3Zm0 2a1 1 0 0 0-1 1v2H5a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0V10h2a1 1 0 0 0 0-2H9V8a1 1 0 0 0-1-1Z"/>
      </svg>
      Create
    </agtc-button>
  `},m={name:`Overview — all variants`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-2xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Default</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary">Primary</agtc-button>
          <agtc-button variant="secondary">Secondary</agtc-button>
          <agtc-button variant="ghost">Ghost</agtc-button>
          <agtc-button variant="critical">Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Disabled</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" disabled>Primary</agtc-button>
          <agtc-button variant="secondary" disabled>Secondary</agtc-button>
          <agtc-button variant="ghost" disabled>Ghost</agtc-button>
          <agtc-button variant="critical" disabled>Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Loading</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" loading>Primary</agtc-button>
          <agtc-button variant="secondary" loading>Secondary</agtc-button>
          <agtc-button variant="ghost" loading>Ghost</agtc-button>
          <agtc-button variant="critical" loading>Critical</agtc-button>
        </div>
      </div>
    </div>
  `},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Primary — main action',
  args: {
    variant: 'primary'
  },
  render: () => html\`<agtc-button variant="primary">Submit</agtc-button>\`
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Secondary — alternative action',
  args: {
    variant: 'secondary'
  },
  render: () => html\`<agtc-button variant="secondary">Cancel</agtc-button>\`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Ghost — tertiary action',
  args: {
    variant: 'ghost'
  },
  render: () => html\`<agtc-button variant="ghost">Learn more</agtc-button>\`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Critical — irreversible action',
  args: {
    variant: 'critical'
  },
  render: () => html\`<agtc-button variant="critical">Permanently delete</agtc-button>\`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'States — Disabled (all variants)',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" disabled>Submit</agtc-button>
      <agtc-button variant="secondary" disabled>Cancel</agtc-button>
      <agtc-button variant="ghost" disabled>Learn more</agtc-button>
      <agtc-button variant="critical" disabled>Permanently delete</agtc-button>
    </div>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'States — Loading (all variants)',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" loading>Submit</agtc-button>
      <agtc-button variant="secondary" loading>Cancel</agtc-button>
      <agtc-button variant="ghost" loading>Learn more</agtc-button>
      <agtc-button variant="critical" loading>Permanently delete</agtc-button>
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Critical — confirmation flow (2 clicks)',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:400px;">
      <p style="font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);margin:0;">
        1st click → "Confirm?" · 2nd click → action · Escape or blur → reset
      </p>
      <agtc-button variant="critical">Permanently delete the folder</agtc-button>
    </div>
  \`
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Icons — Prefix (slot property)',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon="plus">Add</agtc-button>
      <agtc-button variant="secondary" icon="arrow-left">Back</agtc-button>
      <agtc-button variant="ghost" icon="info">Details</agtc-button>
    </div>
  \`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Icons — Suffix (slot property)',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon-suffix="arrow-right">Next</agtc-button>
      <agtc-button variant="secondary" icon-suffix="external-link">View</agtc-button>
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Icons — Free slot composition (custom SVG)',
  render: () => html\`
    <agtc-button variant="primary">
      <svg slot="prefix" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3Zm0 2a1 1 0 0 0-1 1v2H5a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0V10h2a1 1 0 0 0 0-2H9V8a1 1 0 0 0-1-1Z"/>
      </svg>
      Create
    </agtc-button>
  \`
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Overview — all variants',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-2xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Default</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary">Primary</agtc-button>
          <agtc-button variant="secondary">Secondary</agtc-button>
          <agtc-button variant="ghost">Ghost</agtc-button>
          <agtc-button variant="critical">Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Disabled</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" disabled>Primary</agtc-button>
          <agtc-button variant="secondary" disabled>Secondary</agtc-button>
          <agtc-button variant="ghost" disabled>Ghost</agtc-button>
          <agtc-button variant="critical" disabled>Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Loading</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" loading>Primary</agtc-button>
          <agtc-button variant="secondary" loading>Secondary</agtc-button>
          <agtc-button variant="ghost" loading>Ghost</agtc-button>
          <agtc-button variant="critical" loading>Critical</agtc-button>
        </div>
      </div>
    </div>
  \`
}`,...m.parameters?.docs?.source}}},h=[`Primary`,`Secondary`,`Ghost`,`Critical`,`Disabled`,`Loading`,`CriticalConfirmFlow`,`WithIconPrefix`,`WithIconSuffix`,`WithCustomSlot`,`AllVariants`]}))();export{m as AllVariants,s as Critical,u as CriticalConfirmFlow,c as Disabled,o as Ghost,l as Loading,i as Primary,a as Secondary,p as WithCustomSlot,d as WithIconPrefix,f as WithIconSuffix,h as __namedExportsOrder,r as default};