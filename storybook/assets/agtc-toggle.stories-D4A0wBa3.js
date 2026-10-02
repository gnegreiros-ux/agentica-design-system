import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n,n as r}from"./iframe-BnplYTFI.js";var i,a,o,s,c,l,u;e((()=>{t(),r(),i={title:`Components/agtc-toggle`,component:`agtc-toggle`,tags:[`autodocs`],parameters:{docs:{description:{component:[`On/off switch with **immediate effect** (no "Save" button). State is signaled by the **knob position** (non-color indicator, WCAG 1.4.1), reinforced by the track color.`,``,`UX reference patterns applied (ADR-036/039, all approved):`,``,'- **`role="switch"`, immediate effect, state by position** (not color alone), **concise label describing the "on" state** — [NN/g — toggle switch guidelines](https://www.nngroup.com/articles/toggle-switch-guidelines/)',`- **Touch target ≥ 24px** — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)`,``,"Prefer over a checkbox when the change applies instantly. Details: `guidelines/components/toggle.md`."].join(`
`)}}},argTypes:{label:{control:`text`},checked:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Email notifications`,checked:!1,disabled:!1},render:e=>n`
    <agtc-toggle
      label="${e.label}"
      ?checked="${e.checked}"
      ?disabled="${e.disabled}"
    ></agtc-toggle>
  `},a={name:`Off`,render:()=>n`<agtc-toggle label="Dark mode"></agtc-toggle>`},o={name:`On`,render:()=>n`<agtc-toggle label="Dark mode" checked></agtc-toggle>`},s={name:`Disabled — off and on`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-toggle label="Sync (unavailable)" disabled></agtc-toggle>
      <agtc-toggle label="Auto-save (locked)" checked disabled></agtc-toggle>
    </div>
  `},c={name:`All states`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-toggle label="Off"></agtc-toggle>
      <agtc-toggle label="On" checked></agtc-toggle>
      <agtc-toggle label="Disabled (off)" disabled></agtc-toggle>
      <agtc-toggle label="Disabled (on)" checked disabled></agtc-toggle>
    </div>
  `},l={name:`Composition — settings list`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:320px;">
      <agtc-toggle label="Email notifications" checked></agtc-toggle>
      <agtc-toggle label="Push notifications"></agtc-toggle>
      <agtc-toggle label="Weekly digest" checked></agtc-toggle>
    </div>
  `},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Off',
  render: () => html\`<agtc-toggle label="Dark mode"></agtc-toggle>\`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'On',
  render: () => html\`<agtc-toggle label="Dark mode" checked></agtc-toggle>\`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Disabled — off and on',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-toggle label="Sync (unavailable)" disabled></agtc-toggle>
      <agtc-toggle label="Auto-save (locked)" checked disabled></agtc-toggle>
    </div>
  \`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'All states',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-toggle label="Off"></agtc-toggle>
      <agtc-toggle label="On" checked></agtc-toggle>
      <agtc-toggle label="Disabled (off)" disabled></agtc-toggle>
      <agtc-toggle label="Disabled (on)" checked disabled></agtc-toggle>
    </div>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Composition — settings list',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:320px;">
      <agtc-toggle label="Email notifications" checked></agtc-toggle>
      <agtc-toggle label="Push notifications"></agtc-toggle>
      <agtc-toggle label="Weekly digest" checked></agtc-toggle>
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u=[`Off`,`On`,`Disabled`,`States`,`SettingsList`]}))();export{s as Disabled,a as Off,o as On,l as SettingsList,c as States,u as __namedExportsOrder,i as default};