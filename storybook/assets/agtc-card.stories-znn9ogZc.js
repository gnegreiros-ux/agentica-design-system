import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s,c,l,u,d,f,p;e((()=>{t(),r={title:`Components/agtc-card`,component:`agtc-card`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036; C1/C3/C4 approved, C2 revised):`,``,`- **Clustering** of related content — [Dashboard — grouped layout](https://dashboarddesignpatterns.github.io/patterns.html)`,"- **Clickable card (C2 revised)**: 1 destination → wrapping link; ≥ 2 distinct actions → primary link as `::after` overlay + buttons above, or non-interactive container. **Never nested interactive elements** — [Smashing — clickable cards](https://www.smashingmagazine.com/category/design-patterns/)",`- **Hierarchy via elevation/shadow**, not via color alone — [Dashboard — composition](https://dashboarddesignpatterns.github.io/patterns.html)`,`- **Detail-on-demand**: the card summarizes, details open elsewhere — [Dashboard — screenspace](https://dashboarddesignpatterns.github.io/patterns.html)`,``,"Details: `guidelines/components/card.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{variant:{control:`select`,options:[`default`,`elevated`,`flat`],table:{defaultValue:{summary:`default`}}},padding:{control:`select`,options:[`none`,`sm`,`md`,`lg`],table:{defaultValue:{summary:`md`}}}},args:{variant:`default`,padding:`md`},render:e=>n`
    <div style="max-width:360px;">
      <agtc-card variant="${e.variant}" padding="${e.padding}">
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);">Card content.</p>
      </agtc-card>
    </div>
  `},i={name:`Default — subtle border`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-card variant="default">
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Standard card with a gray border.</p>
      </agtc-card>
    </div>
  `},a={name:`Elevated — drop shadow`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-card variant="elevated">
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Card with a shadow — emphasis, visual hierarchy.</p>
      </agtc-card>
    </div>
  `},o={name:`Flat — subtle background`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-card variant="flat">
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Embedded card — grouped background, no border.</p>
      </agtc-card>
    </div>
  `},s={name:`With header`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.875rem;">Card title</strong>
          <agtc-badge variant="success">Active</agtc-badge>
        </div>
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Card body with the main content.</p>
      </agtc-card>
    </div>
  `},c={name:`With header + footer`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-icon name="user" size="control" style="color:var(--agtc-semantic-color-text-secondary);"></agtc-icon>
          <strong style="font-size:0.875rem;">User profile</strong>
        </div>

        <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
          <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);">Guilherme Negreiros</p>
          <small style="color:var(--agtc-semantic-color-text-secondary);">Design System Lead</small>
        </div>

        <div slot="footer" style="display:flex;justify-content:flex-end;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-button variant="ghost">Cancel</agtc-button>
          <agtc-button variant="primary">Save</agtc-button>
        </div>
      </agtc-card>
    </div>
  `},l={name:`With footer only`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-card>
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">
          Confirm deleting this item? This action is irreversible.
        </p>
        <div slot="footer" style="display:flex;justify-content:flex-end;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-button variant="secondary">Cancel</agtc-button>
          <agtc-button variant="critical">Permanently delete</agtc-button>
        </div>
      </agtc-card>
    </div>
  `},u={name:`Padding — none / sm / md / lg`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:360px;">
      <agtc-card padding="none">
        <div style="background:var(--agtc-semantic-color-brand-primary-subtle);padding:var(--agtc-semantic-space-component-padding-md);font-size:0.75rem;color:var(--agtc-semantic-color-brand-primary-text);">padding="none" — full-width image</div>
      </agtc-card>
      <agtc-card padding="sm">
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">padding="sm" — compact</p>
      </agtc-card>
      <agtc-card padding="md">
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">padding="md" — default</p>
      </agtc-card>
      <agtc-card padding="lg">
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">padding="lg" — spacious</p>
      </agtc-card>
    </div>
  `},d={name:`Composition — badge + input + button`,render:()=>n`
    <div style="max-width:400px;">
      <agtc-card variant="elevated">
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.9375rem;">New sign-in</strong>
          <agtc-badge variant="info" icon="shield">Secure</agtc-badge>
        </div>

        <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);">
          <agtc-input
            type="email"
            label="Email address"
            placeholder="name@example.com"
            required
          ></agtc-input>
          <agtc-input
            type="password"
            label="Password"
            placeholder="8 characters minimum"
          ></agtc-input>
        </div>

        <div slot="footer" style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-button variant="primary" style="width:100%;">Sign in</agtc-button>
          <agtc-button variant="ghost" style="width:100%;">Forgot password?</agtc-button>
        </div>
      </agtc-card>
    </div>
  `},f={name:`Overview — all variants`,render:()=>n`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--agtc-semantic-space-component-padding-lg);max-width:800px;">
      <agtc-card variant="default">
        <div slot="header"><strong style="font-size:0.875rem;">Default</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:var(--agtc-semantic-color-text-secondary);">Standard gray border.</p>
        <div slot="footer"><agtc-badge variant="neutral">Draft</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="elevated">
        <div slot="header"><strong style="font-size:0.875rem;">Elevated</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:var(--agtc-semantic-color-text-secondary);">Soft drop shadow.</p>
        <div slot="footer"><agtc-badge variant="brand">Agentica</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="flat">
        <div slot="header"><strong style="font-size:0.875rem;">Flat</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:var(--agtc-semantic-color-text-secondary);">Subtle gray background.</p>
        <div slot="footer"><agtc-badge variant="success">Active</agtc-badge></div>
      </agtc-card>
    </div>
  `},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Default — subtle border',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-card variant="default">
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Standard card with a gray border.</p>
      </agtc-card>
    </div>
  \`
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Elevated — drop shadow',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-card variant="elevated">
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Card with a shadow — emphasis, visual hierarchy.</p>
      </agtc-card>
    </div>
  \`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Flat — subtle background',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-card variant="flat">
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Embedded card — grouped background, no border.</p>
      </agtc-card>
    </div>
  \`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'With header',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.875rem;">Card title</strong>
          <agtc-badge variant="success">Active</agtc-badge>
        </div>
        <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;">Card body with the main content.</p>
      </agtc-card>
    </div>
  \`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'With header + footer',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-icon name="user" size="control" style="color:var(--agtc-semantic-color-text-secondary);"></agtc-icon>
          <strong style="font-size:0.875rem;">User profile</strong>
        </div>

        <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
          <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);">Guilherme Negreiros</p>
          <small style="color:var(--agtc-semantic-color-text-secondary);">Design System Lead</small>
        </div>

        <div slot="footer" style="display:flex;justify-content:flex-end;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-button variant="ghost">Cancel</agtc-button>
          <agtc-button variant="primary">Save</agtc-button>
        </div>
      </agtc-card>
    </div>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'With footer only',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-card>
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">
          Confirm deleting this item? This action is irreversible.
        </p>
        <div slot="footer" style="display:flex;justify-content:flex-end;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-button variant="secondary">Cancel</agtc-button>
          <agtc-button variant="critical">Permanently delete</agtc-button>
        </div>
      </agtc-card>
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Padding — none / sm / md / lg',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:360px;">
      <agtc-card padding="none">
        <div style="background:var(--agtc-semantic-color-brand-primary-subtle);padding:var(--agtc-semantic-space-component-padding-md);font-size:0.75rem;color:var(--agtc-semantic-color-brand-primary-text);">padding="none" — full-width image</div>
      </agtc-card>
      <agtc-card padding="sm">
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">padding="sm" — compact</p>
      </agtc-card>
      <agtc-card padding="md">
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">padding="md" — default</p>
      </agtc-card>
      <agtc-card padding="lg">
        <p style="margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);">padding="lg" — spacious</p>
      </agtc-card>
    </div>
  \`
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Composition — badge + input + button',
  render: () => html\`
    <div style="max-width:400px;">
      <agtc-card variant="elevated">
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.9375rem;">New sign-in</strong>
          <agtc-badge variant="info" icon="shield">Secure</agtc-badge>
        </div>

        <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);">
          <agtc-input
            type="email"
            label="Email address"
            placeholder="name@example.com"
            required
          ></agtc-input>
          <agtc-input
            type="password"
            label="Password"
            placeholder="8 characters minimum"
          ></agtc-input>
        </div>

        <div slot="footer" style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
          <agtc-button variant="primary" style="width:100%;">Sign in</agtc-button>
          <agtc-button variant="ghost" style="width:100%;">Forgot password?</agtc-button>
        </div>
      </agtc-card>
    </div>
  \`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Overview — all variants',
  render: () => html\`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--agtc-semantic-space-component-padding-lg);max-width:800px;">
      <agtc-card variant="default">
        <div slot="header"><strong style="font-size:0.875rem;">Default</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:var(--agtc-semantic-color-text-secondary);">Standard gray border.</p>
        <div slot="footer"><agtc-badge variant="neutral">Draft</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="elevated">
        <div slot="header"><strong style="font-size:0.875rem;">Elevated</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:var(--agtc-semantic-color-text-secondary);">Soft drop shadow.</p>
        <div slot="footer"><agtc-badge variant="brand">Agentica</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="flat">
        <div slot="header"><strong style="font-size:0.875rem;">Flat</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:var(--agtc-semantic-color-text-secondary);">Subtle gray background.</p>
        <div slot="footer"><agtc-badge variant="success">Active</agtc-badge></div>
      </agtc-card>
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p=[`Default`,`Elevated`,`Flat`,`WithHeader`,`WithHeaderAndFooter`,`WithFooterOnly`,`PaddingVariants`,`ComposedCard`,`AllVariants`]}))();export{f as AllVariants,d as ComposedCard,i as Default,a as Elevated,o as Flat,u as PaddingVariants,l as WithFooterOnly,s as WithHeader,c as WithHeaderAndFooter,p as __namedExportsOrder,r as default};