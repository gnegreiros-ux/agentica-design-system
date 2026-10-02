import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s;e((()=>{t(),r={title:`Components/agtc-link`,component:`agtc-link`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036/043, LK1–LK8 all approved):`,``,`- **Underline in running text** (distinguishable beyond color, WCAG 1.4.1) — [NN/g — Visualizing Links](https://www.nngroup.com/articles/guidelines-for-visualizing-links/)`,'- **External link**: `rel="noopener noreferrer"` + icon + hidden text "opens in a new tab" — [WCAG H83](https://www.w3.org/WAI/WCAG21/Techniques/html/H83)',`- **Descriptive text** (never "click here") — [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/)`,``,"A link **navigates** — for an action, use `agtc-button`.",``,"Details: `guidelines/components/link.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{href:{control:`text`},external:{control:`boolean`},underline:{control:`select`,options:[`always`,`hover`,`none`],table:{defaultValue:{summary:`always`}}}},args:{href:`#`,external:!1,underline:`always`},render:e=>n`
    <p style="font-family:var(--agtc-semantic-typography-mono-family,system-ui);color:var(--agtc-semantic-color-text-primary)">
      A paragraph containing
      <agtc-link href="${e.href}" ?external="${e.external}" underline="${e.underline}">${e.slotContent??`a descriptive link`}</agtc-link>
      within the text flow.
    </p>
  `},i={name:`Inline — underlined (default)`,render:()=>n`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      See the <agtc-link href="#guideline">component guideline</agtc-link> for details.
    </p>
  `},a={name:`External — new tab (icon + AT)`,render:()=>n`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      Reference: <agtc-link href="https://www.nngroup.com/articles/guidelines-for-visualizing-links/" external>NN/g — Visualizing Links</agtc-link>.
    </p>
  `},o={name:`Underline on hover (nav)`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-layout-component);">
      <agtc-link href="#a" underline="hover">Home</agtc-link>
      <agtc-link href="#b" underline="hover">Components</agtc-link>
      <agtc-link href="#c" underline="hover">Tokens</agtc-link>
    </div>
  `},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Inline — underlined (default)',
  render: () => html\`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      See the <agtc-link href="#guideline">component guideline</agtc-link> for details.
    </p>
  \`
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'External — new tab (icon + AT)',
  render: () => html\`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      Reference: <agtc-link href="https://www.nngroup.com/articles/guidelines-for-visualizing-links/" external>NN/g — Visualizing Links</agtc-link>.
    </p>
  \`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Underline on hover (nav)',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-layout-component);">
      <agtc-link href="#a" underline="hover">Home</agtc-link>
      <agtc-link href="#b" underline="hover">Components</agtc-link>
      <agtc-link href="#c" underline="hover">Tokens</agtc-link>
    </div>
  \`
}`,...o.parameters?.docs?.source}}},s=[`Inline`,`External`,`UnderlineHover`]}))();export{a as External,i as Inline,o as UnderlineHover,s as __namedExportsOrder,r as default};