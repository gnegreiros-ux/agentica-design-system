import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s,c,l,u;e((()=>{t(),r={title:`Components/agtc-banner`,component:`agtc-banner`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036/042, N1–N9 all approved):`,``,`- **Semantic variants + meaning never by color alone** (icon + severity prefix hidden for AT) — [NN/g — Indicators, Validations & Notifications](https://www.nngroup.com/articles/indicators-validations-notifications/)`,'- **Static by default**; opt-in `live="polite|assertive"` (role=status/alert) for dynamic usage — [MDN — alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role)',`- **Accessible close button** without focus trap — [A11Y Collective](https://www.a11y-collective.com/blog/aria-alert/)`,``,`Contextual **inline** message — not a toast nor a modal.`,``,"Details: `guidelines/components/banner.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{variant:{control:`select`,options:[`neutral`,`brand`,`info`,`success`,`warning`,`danger`],table:{defaultValue:{summary:`info`}}},heading:{control:`text`},icon:{control:`text`},noIcon:{control:`boolean`,name:`no-icon`},dismissible:{control:`boolean`},live:{control:`select`,options:[`off`,`polite`,`assertive`]}},args:{variant:`info`,heading:`Information`,dismissible:!1,live:`off`},render:e=>n`
    <agtc-banner
      variant="${e.variant}"
      heading="${e.heading??``}"
      icon="${e.icon??``}"
      ?no-icon="${e.noIcon}"
      ?dismissible="${e.dismissible}"
      live="${e.live??`off`}"
    >${e.slotContent??`Contextual message displayed in the page flow.`}</agtc-banner>
  `},i={name:`Info (default)`,render:()=>n`<agtc-banner variant="info" heading="Information">This component is read-only.</agtc-banner>`},a={name:`Success`,render:()=>n`<agtc-banner variant="success" heading="Saved">Your changes have been saved.</agtc-banner>`},o={name:`Warning`,render:()=>n`<agtc-banner variant="warning" heading="Warning">This action will affect 3 linked files.</agtc-banner>`},s={name:`Danger`,render:()=>n`<agtc-banner variant="danger" heading="Error">Unable to reach the server.</agtc-banner>`},c={name:`With actions + dismissible`,render:()=>n`
    <agtc-banner variant="brand" heading="Contribute to this project" dismissible
      @dismiss="${e=>console.log(`dismissed`,e)}">
      This system is open to contributions.
      <span slot="actions"><a href="#" style="color:var(--agtc-semantic-color-action-primary)">View on GitHub →</a></span>
    </agtc-banner>
  `},l={name:`Overview — all variants`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-xs);">
      <agtc-banner variant="neutral" heading="Neutral">Neutral message.</agtc-banner>
      <agtc-banner variant="brand" heading="Agentica">Brand highlight.</agtc-banner>
      <agtc-banner variant="info" heading="Information">Contextual help.</agtc-banner>
      <agtc-banner variant="success" heading="Success">Operation completed.</agtc-banner>
      <agtc-banner variant="warning" heading="Warning">Verification required.</agtc-banner>
      <agtc-banner variant="danger" heading="Error">Something went wrong.</agtc-banner>
    </div>
  `},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Info (default)',
  render: () => html\`<agtc-banner variant="info" heading="Information">This component is read-only.</agtc-banner>\`
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Success',
  render: () => html\`<agtc-banner variant="success" heading="Saved">Your changes have been saved.</agtc-banner>\`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Warning',
  render: () => html\`<agtc-banner variant="warning" heading="Warning">This action will affect 3 linked files.</agtc-banner>\`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Danger',
  render: () => html\`<agtc-banner variant="danger" heading="Error">Unable to reach the server.</agtc-banner>\`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'With actions + dismissible',
  render: () => html\`
    <agtc-banner variant="brand" heading="Contribute to this project" dismissible
      @dismiss="\${e => console.log('dismissed', e)}">
      This system is open to contributions.
      <span slot="actions"><a href="#" style="color:var(--agtc-semantic-color-action-primary)">View on GitHub →</a></span>
    </agtc-banner>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Overview — all variants',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-xs);">
      <agtc-banner variant="neutral" heading="Neutral">Neutral message.</agtc-banner>
      <agtc-banner variant="brand" heading="Agentica">Brand highlight.</agtc-banner>
      <agtc-banner variant="info" heading="Information">Contextual help.</agtc-banner>
      <agtc-banner variant="success" heading="Success">Operation completed.</agtc-banner>
      <agtc-banner variant="warning" heading="Warning">Verification required.</agtc-banner>
      <agtc-banner variant="danger" heading="Error">Something went wrong.</agtc-banner>
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u=[`Info`,`Success`,`Warning`,`Danger`,`WithActions`,`AllVariants`]}))();export{l as AllVariants,s as Danger,i as Info,a as Success,o as Warning,c as WithActions,u as __namedExportsOrder,r as default};