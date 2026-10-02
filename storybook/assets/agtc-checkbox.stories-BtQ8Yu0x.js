import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n,a as r}from"./iframe-BnplYTFI.js";var i,a,o,s,c,l,u,d,f;e((()=>{t(),r(),i={title:`Components/agtc-checkbox`,component:`agtc-checkbox`,tags:[`autodocs`],parameters:{docs:{description:{component:[`Checkbox for an independent binary selection (check/uncheck, mark a task done). **Square** shape by convention.`,``,`UX reference patterns applied (ADR-036/037, all approved):`,``,`- **Checkbox rather than toggle** for an independent item — [NN/g — checkbox vs toggle](https://www.nngroup.com/articles/toggle-switch-guidelines/)`,`- **Square shape** (a circle signals a radio) + **clickable label** (Fitts) + **positive wording** — [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/)`,`- **Touch target ≥ 24px**, visible states, **no deceptive pre-checking** — [IxDF — UI patterns](https://ixdf.org/literature/topics/ui-design-patterns)`,``,"Details: `guidelines/components/checkbox.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{label:{control:`text`,description:`Clickable label (positive wording)`},checked:{control:`boolean`},indeterminate:{control:`boolean`,description:'Partial state — `aria-checked="mixed"`'},disabled:{control:`boolean`},required:{control:`boolean`}},args:{label:`Accept the terms`,checked:!1,indeterminate:!1,disabled:!1,required:!1},render:e=>n`
    <agtc-checkbox
      label="${e.label}"
      ?checked="${e.checked}"
      ?indeterminate="${e.indeterminate}"
      ?disabled="${e.disabled}"
      ?required="${e.required}"
    ></agtc-checkbox>
  `},a={name:`Default — unchecked`,render:()=>n`<agtc-checkbox label="Receive the newsletter"></agtc-checkbox>`},o={name:`Checked`,render:()=>n`<agtc-checkbox label="Receive the newsletter" checked></agtc-checkbox>`},s={name:`Indeterminate — partial selection`,render:()=>n`<agtc-checkbox label="Select all" indeterminate></agtc-checkbox>`},c={name:`Disabled — unchecked and checked`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-checkbox label="Unavailable option" disabled></agtc-checkbox>
      <agtc-checkbox label="Locked option (checked)" checked disabled></agtc-checkbox>
    </div>
  `},l={name:`All states`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-checkbox label="Default (unchecked)"></agtc-checkbox>
      <agtc-checkbox label="Checked" checked></agtc-checkbox>
      <agtc-checkbox label="Indeterminate (partial)" indeterminate></agtc-checkbox>
      <agtc-checkbox label="Disabled" disabled></agtc-checkbox>
      <agtc-checkbox label="Disabled + checked" checked disabled></agtc-checkbox>
    </div>
  `},u={name:`Composition — task list`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);max-width:340px;">
      <agtc-checkbox label="Learn Web Components" checked></agtc-checkbox>
      <agtc-checkbox label="Build the design system tokens" checked></agtc-checkbox>
      <agtc-checkbox label="Ship the checkbox component"></agtc-checkbox>
    </div>
  `},d={name:`Group — indeterminate parent`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);max-width:340px;">
      <agtc-checkbox label="Select all" indeterminate></agtc-checkbox>
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);padding-inline-start:28px;">
        <agtc-checkbox label="Email notifications" checked></agtc-checkbox>
        <agtc-checkbox label="Push notifications"></agtc-checkbox>
      </div>
    </div>
  `},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Default — unchecked',
  render: () => html\`<agtc-checkbox label="Receive the newsletter"></agtc-checkbox>\`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Checked',
  render: () => html\`<agtc-checkbox label="Receive the newsletter" checked></agtc-checkbox>\`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Indeterminate — partial selection',
  render: () => html\`<agtc-checkbox label="Select all" indeterminate></agtc-checkbox>\`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Disabled — unchecked and checked',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-checkbox label="Unavailable option" disabled></agtc-checkbox>
      <agtc-checkbox label="Locked option (checked)" checked disabled></agtc-checkbox>
    </div>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'All states',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-checkbox label="Default (unchecked)"></agtc-checkbox>
      <agtc-checkbox label="Checked" checked></agtc-checkbox>
      <agtc-checkbox label="Indeterminate (partial)" indeterminate></agtc-checkbox>
      <agtc-checkbox label="Disabled" disabled></agtc-checkbox>
      <agtc-checkbox label="Disabled + checked" checked disabled></agtc-checkbox>
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Composition — task list',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);max-width:340px;">
      <agtc-checkbox label="Learn Web Components" checked></agtc-checkbox>
      <agtc-checkbox label="Build the design system tokens" checked></agtc-checkbox>
      <agtc-checkbox label="Ship the checkbox component"></agtc-checkbox>
    </div>
  \`
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Group — indeterminate parent',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);max-width:340px;">
      <agtc-checkbox label="Select all" indeterminate></agtc-checkbox>
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);padding-inline-start:28px;">
        <agtc-checkbox label="Email notifications" checked></agtc-checkbox>
        <agtc-checkbox label="Push notifications"></agtc-checkbox>
      </div>
    </div>
  \`
}`,...d.parameters?.docs?.source}}},f=[`Default`,`Checked`,`Indeterminate`,`Disabled`,`States`,`TaskList`,`SelectAllGroup`]}))();export{o as Checked,a as Default,c as Disabled,s as Indeterminate,d as SelectAllGroup,l as States,u as TaskList,f as __namedExportsOrder,i as default};