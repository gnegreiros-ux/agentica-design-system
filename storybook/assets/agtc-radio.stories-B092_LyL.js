import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n,i as r,r as i}from"./iframe-BnplYTFI.js";var a,o,s,c,l,u;e((()=>{t(),r(),i(),a={title:`Components/agtc-radio`,component:`agtc-radio-group`,tags:[`autodocs`],parameters:{docs:{description:{component:["Mutually exclusive selection: a single choice within a set. **Round** shape. Always inside an `<agtc-radio-group>`, which handles exclusivity, roving focus and keyboard navigation (`<input radio>` elements in separate shadow DOMs do not group natively).",``,`UX reference patterns applied (ADR-036/038, all approved):`,``,`- **Round shape** (square = checkbox), **exclusive selection**, **clickable label** — [NN/g — checkboxes vs radio](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/)`,`- **Pre-select a sensible default** (except ethical/legal exceptions) — [NN/g — radio default selection](https://www.nngroup.com/articles/radio-buttons-default-selection/)`,`- **Touch target ≥ 24px** — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)`,``,"Details: `guidelines/components/radio.md` § UX Patterns Reference."].join(`
`)}}}},o={name:`Group — selected default`,render:()=>n`
    <agtc-radio-group name="plan" value="pro" label="Plan">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="free">Free</agtc-radio>
        <agtc-radio value="pro">Pro</agtc-radio>
        <agtc-radio value="team">Team</agtc-radio>
      </div>
    </agtc-radio-group>
  `},s={name:`Group — no pre-selection`,render:()=>n`
    <agtc-radio-group name="ship" label="Shipping">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="standard">Standard (3–5 days)</agtc-radio>
        <agtc-radio value="express">Express (24h)</agtc-radio>
      </div>
    </agtc-radio-group>
  `},c={name:`Group — disabled option`,render:()=>n`
    <agtc-radio-group name="seat" value="window" label="Seat">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="window">Window</agtc-radio>
        <agtc-radio value="aisle">Aisle</agtc-radio>
        <agtc-radio value="middle" disabled>Middle (full)</agtc-radio>
      </div>
    </agtc-radio-group>
  `},l={name:`States (presentation)`,render:()=>n`
    <agtc-radio-group name="states" value="selected">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="default">Unselected</agtc-radio>
        <agtc-radio value="selected">Selected</agtc-radio>
        <agtc-radio value="disabled" disabled>Disabled</agtc-radio>
      </div>
    </agtc-radio-group>
  `},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Group — selected default',
  render: () => html\`
    <agtc-radio-group name="plan" value="pro" label="Plan">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="free">Free</agtc-radio>
        <agtc-radio value="pro">Pro</agtc-radio>
        <agtc-radio value="team">Team</agtc-radio>
      </div>
    </agtc-radio-group>
  \`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Group — no pre-selection',
  render: () => html\`
    <agtc-radio-group name="ship" label="Shipping">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="standard">Standard (3–5 days)</agtc-radio>
        <agtc-radio value="express">Express (24h)</agtc-radio>
      </div>
    </agtc-radio-group>
  \`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Group — disabled option',
  render: () => html\`
    <agtc-radio-group name="seat" value="window" label="Seat">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="window">Window</agtc-radio>
        <agtc-radio value="aisle">Aisle</agtc-radio>
        <agtc-radio value="middle" disabled>Middle (full)</agtc-radio>
      </div>
    </agtc-radio-group>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'States (presentation)',
  render: () => html\`
    <agtc-radio-group name="states" value="selected">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="default">Unselected</agtc-radio>
        <agtc-radio value="selected">Selected</agtc-radio>
        <agtc-radio value="disabled" disabled>Disabled</agtc-radio>
      </div>
    </agtc-radio-group>
  \`
}`,...l.parameters?.docs?.source}}},u=[`Default`,`NoDefault`,`WithDisabled`,`States`]}))();export{o as Default,s as NoDefault,l as States,c as WithDisabled,u as __namedExportsOrder,a as default};