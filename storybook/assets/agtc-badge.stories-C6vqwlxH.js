import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s,c,l,u,d,f,p,m;e((()=>{t(),r={title:`Components/agtc-badge`,component:`agtc-badge`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036, all approved):`,``,"- **Status not encoded by color alone** — recommended: distinctive icon/label for `danger`/`warning` — [NN/g — indicators](https://www.nngroup.com/articles/design-pattern-guidelines/)",'- **`role="status"`** to announce changes to AT — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',`- **Consistent semantic mapping** (traffic-light) — [Dashboard](https://dashboarddesignpatterns.github.io/patterns.html)`,"- **Non-interactive** — wrap in a `<button>` if clickable — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)",``,"Details: `guidelines/components/badge.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{variant:{control:`select`,options:[`neutral`,`brand`,`success`,`warning`,`danger`,`info`],table:{defaultValue:{summary:`neutral`}}},size:{control:`select`,options:[`sm`,`md`],table:{defaultValue:{summary:`md`}}},icon:{control:`text`},iconOnly:{control:`boolean`,name:`icon-only`},label:{control:`text`,description:`aria-label for icon-only`}},args:{variant:`neutral`,size:`md`},render:e=>n`
    <agtc-badge
      variant="${e.variant}"
      size="${e.size}"
      icon="${e.icon??``}"
      ?icon-only="${e.iconOnly}"
      label="${e.label??``}"
    >
      ${e.slotContent??`Badge`}
    </agtc-badge>
  `},i={name:`Neutral — default state`,render:()=>n`<agtc-badge variant="neutral">Draft</agtc-badge>`},a={name:`Brand — Agentica identity`,render:()=>n`<agtc-badge variant="brand">Agentica</agtc-badge>`},o={name:`Success — validated, active`,render:()=>n`<agtc-badge variant="success">Active</agtc-badge>`},s={name:`Warning — attention required`,render:()=>n`<agtc-badge variant="warning">Pending</agtc-badge>`},c={name:`Danger — error, critical`,render:()=>n`<agtc-badge variant="danger">Error</agtc-badge>`},l={name:`Info — contextual information`,render:()=>n`<agtc-badge variant="info">New</agtc-badge>`},u={name:`Sizes — sm and md`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="brand" size="sm">sm</agtc-badge>
      <agtc-badge variant="brand" size="md">md</agtc-badge>
      <agtc-badge variant="success" size="sm">Active</agtc-badge>
      <agtc-badge variant="success" size="md">Active</agtc-badge>
      <agtc-badge variant="danger" size="sm">Error</agtc-badge>
      <agtc-badge variant="danger" size="md">Error</agtc-badge>
    </div>
  `},d={name:`With prefix icon`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="success" icon="check-circle">Validated</agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle">Pending</agtc-badge>
      <agtc-badge variant="danger"  icon="x-circle">Error</agtc-badge>
      <agtc-badge variant="info"    icon="info">New</agtc-badge>
      <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
    </div>
  `},f={name:`Icon-only (WCAG: label required)`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);align-items:center;">
      <agtc-badge variant="success" icon="check"    icon-only label="Validated"></agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle" icon-only label="Warning"></agtc-badge>
      <agtc-badge variant="danger"  icon="x"        icon-only label="Error"></agtc-badge>
      <agtc-badge variant="info"    icon="info"     icon-only label="Information"></agtc-badge>
    </div>
  `},p={name:`Overview — all variants`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">md — no icon</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral">Draft</agtc-badge>
          <agtc-badge variant="brand">Agentica</agtc-badge>
          <agtc-badge variant="success">Active</agtc-badge>
          <agtc-badge variant="warning">Pending</agtc-badge>
          <agtc-badge variant="danger">Error</agtc-badge>
          <agtc-badge variant="info">New</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">md — with icon</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" icon="file">Draft</agtc-badge>
          <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
          <agtc-badge variant="success" icon="check-circle">Active</agtc-badge>
          <agtc-badge variant="warning" icon="alert-triangle">Pending</agtc-badge>
          <agtc-badge variant="danger"  icon="x-circle">Error</agtc-badge>
          <agtc-badge variant="info"    icon="info">New</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">sm</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" size="sm">Draft</agtc-badge>
          <agtc-badge variant="brand"   size="sm">Agentica</agtc-badge>
          <agtc-badge variant="success" size="sm">Active</agtc-badge>
          <agtc-badge variant="warning" size="sm">Pending</agtc-badge>
          <agtc-badge variant="danger"  size="sm">Error</agtc-badge>
          <agtc-badge variant="info"    size="sm">New</agtc-badge>
        </div>
      </div>
    </div>
  `},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Neutral — default state',
  render: () => html\`<agtc-badge variant="neutral">Draft</agtc-badge>\`
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Brand — Agentica identity',
  render: () => html\`<agtc-badge variant="brand">Agentica</agtc-badge>\`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Success — validated, active',
  render: () => html\`<agtc-badge variant="success">Active</agtc-badge>\`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Warning — attention required',
  render: () => html\`<agtc-badge variant="warning">Pending</agtc-badge>\`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Danger — error, critical',
  render: () => html\`<agtc-badge variant="danger">Error</agtc-badge>\`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Info — contextual information',
  render: () => html\`<agtc-badge variant="info">New</agtc-badge>\`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Sizes — sm and md',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="brand" size="sm">sm</agtc-badge>
      <agtc-badge variant="brand" size="md">md</agtc-badge>
      <agtc-badge variant="success" size="sm">Active</agtc-badge>
      <agtc-badge variant="success" size="md">Active</agtc-badge>
      <agtc-badge variant="danger" size="sm">Error</agtc-badge>
      <agtc-badge variant="danger" size="md">Error</agtc-badge>
    </div>
  \`
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'With prefix icon',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="success" icon="check-circle">Validated</agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle">Pending</agtc-badge>
      <agtc-badge variant="danger"  icon="x-circle">Error</agtc-badge>
      <agtc-badge variant="info"    icon="info">New</agtc-badge>
      <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
    </div>
  \`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Icon-only (WCAG: label required)',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);align-items:center;">
      <agtc-badge variant="success" icon="check"    icon-only label="Validated"></agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle" icon-only label="Warning"></agtc-badge>
      <agtc-badge variant="danger"  icon="x"        icon-only label="Error"></agtc-badge>
      <agtc-badge variant="info"    icon="info"     icon-only label="Information"></agtc-badge>
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Overview — all variants',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">md — no icon</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral">Draft</agtc-badge>
          <agtc-badge variant="brand">Agentica</agtc-badge>
          <agtc-badge variant="success">Active</agtc-badge>
          <agtc-badge variant="warning">Pending</agtc-badge>
          <agtc-badge variant="danger">Error</agtc-badge>
          <agtc-badge variant="info">New</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">md — with icon</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" icon="file">Draft</agtc-badge>
          <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
          <agtc-badge variant="success" icon="check-circle">Active</agtc-badge>
          <agtc-badge variant="warning" icon="alert-triangle">Pending</agtc-badge>
          <agtc-badge variant="danger"  icon="x-circle">Error</agtc-badge>
          <agtc-badge variant="info"    icon="info">New</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">sm</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" size="sm">Draft</agtc-badge>
          <agtc-badge variant="brand"   size="sm">Agentica</agtc-badge>
          <agtc-badge variant="success" size="sm">Active</agtc-badge>
          <agtc-badge variant="warning" size="sm">Pending</agtc-badge>
          <agtc-badge variant="danger"  size="sm">Error</agtc-badge>
          <agtc-badge variant="info"    size="sm">New</agtc-badge>
        </div>
      </div>
    </div>
  \`
}`,...p.parameters?.docs?.source}}},m=[`Neutral`,`Brand`,`Success`,`Warning`,`Danger`,`Info`,`Sizes`,`WithIcon`,`IconOnly`,`AllVariants`]}))();export{p as AllVariants,a as Brand,c as Danger,f as IconOnly,l as Info,i as Neutral,u as Sizes,o as Success,s as Warning,d as WithIcon,m as __namedExportsOrder,r as default};