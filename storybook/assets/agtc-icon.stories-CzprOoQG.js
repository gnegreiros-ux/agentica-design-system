import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s,c,l,u,d;e((()=>{t(),r={title:`Components/agtc-icon`,component:`agtc-icon`,tags:[`autodocs`],parameters:{docs:{description:{component:["Icon component based on Lucide Icons (ADR-022). Tokenized sizes `inline`/`control`/`nav`.",``,`UX reference patterns applied (ADR-036, all approved):`,``,`- **Icon + text** when the meaning is not universal — [NN/g — icon usability](https://www.nngroup.com/articles/design-pattern-guidelines/)`,"- **Accessible label required** when the icon carries the information; `decorative` → `aria-hidden` — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)",`- **Consistent, non-deceptive meaning** (same icon = same meaning) — [IF — transparency](https://catalogue.projectsbyif.com/)`,``,"Details: `guidelines/components/icon.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{name:{control:`text`,description:"Lucide icon name (kebab-case, e.g. `trash-2`)"},size:{control:`select`,options:[`inline`,`control`,`nav`],table:{defaultValue:{summary:`control`}}},label:{control:`text`,description:"Accessible text — required when the icon is not `decorative`"},decorative:{control:`boolean`,description:'Purely ornamental icon → `aria-hidden="true"`',table:{defaultValue:{summary:`false`}}}},args:{name:`settings`,size:`control`,label:`Settings`,decorative:!1},render:e=>n`
    <agtc-icon
      name="${e.name}"
      size="${e.size}"
      label="${e.label??``}"
      ?decorative="${e.decorative}"
    ></agtc-icon>
  `},i={name:`Inline — 16px (within text)`,render:()=>n`
    <p style="display:flex;align-items:center;gap:var(--agtc-semantic-space-component-padding-xs);font-size:var(--agtc-semantic-space-component-padding-lg);">
      <agtc-icon name="info" size="inline" decorative></agtc-icon>
      Text with an inline icon.
    </p>
  `},a={name:`Control — 20px (buttons, fields)`,render:()=>n`<agtc-icon name="search" size="control" label="Search"></agtc-icon>`},o={name:`Nav — 24px (navigation, emphasis)`,render:()=>n`<agtc-icon name="settings" size="nav" label="Settings"></agtc-icon>`},s={name:`Sizes — inline / control / nav`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-2xl);align-items:center;">
      <agtc-icon name="home" size="inline" decorative></agtc-icon>
      <agtc-icon name="home" size="control" decorative></agtc-icon>
      <agtc-icon name="home" size="nav" decorative></agtc-icon>
    </div>
  `},c={name:`Semantic — label required (WCAG 1.1.1)`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-lg);align-items:center;">
      <agtc-icon name="trash-2" size="control" label="Delete the file"></agtc-icon>
      <agtc-icon name="download" size="control" label="Download"></agtc-icon>
      <agtc-icon name="bell" size="control" label="Notifications"></agtc-icon>
    </div>
  `},l={name:`Decorative — aria-hidden (adjacent text)`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
      <span style="display:flex;align-items:center;gap:var(--agtc-semantic-space-component-padding-xs);">
        <agtc-icon name="check" size="control" decorative></agtc-icon> Saved
      </span>
      <span style="display:flex;align-items:center;gap:var(--agtc-semantic-space-component-padding-xs);">
        <agtc-icon name="alert-triangle" size="control" decorative></agtc-icon> Attention required
      </span>
    </div>
  `},u={name:`Overview — sizes and common icons`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">Sizes (inline · control · nav)</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-2xl);align-items:center;">
          <agtc-icon name="star" size="inline" decorative></agtc-icon>
          <agtc-icon name="star" size="control" decorative></agtc-icon>
          <agtc-icon name="star" size="nav" decorative></agtc-icon>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">Common icons (control)</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-lg);flex-wrap:wrap;align-items:center;color:var(--agtc-semantic-color-text-primary);">
          <agtc-icon name="home" size="control" decorative></agtc-icon>
          <agtc-icon name="search" size="control" decorative></agtc-icon>
          <agtc-icon name="settings" size="control" decorative></agtc-icon>
          <agtc-icon name="user" size="control" decorative></agtc-icon>
          <agtc-icon name="bell" size="control" decorative></agtc-icon>
          <agtc-icon name="download" size="control" decorative></agtc-icon>
          <agtc-icon name="trash-2" size="control" decorative></agtc-icon>
          <agtc-icon name="check" size="control" decorative></agtc-icon>
          <agtc-icon name="x" size="control" decorative></agtc-icon>
          <agtc-icon name="chevron-right" size="control" decorative></agtc-icon>
          <agtc-icon name="info" size="control" decorative></agtc-icon>
          <agtc-icon name="alert-triangle" size="control" decorative></agtc-icon>
        </div>
      </div>
    </div>
  `},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Inline — 16px (within text)',
  render: () => html\`
    <p style="display:flex;align-items:center;gap:var(--agtc-semantic-space-component-padding-xs);font-size:var(--agtc-semantic-space-component-padding-lg);">
      <agtc-icon name="info" size="inline" decorative></agtc-icon>
      Text with an inline icon.
    </p>
  \`
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Control — 20px (buttons, fields)',
  render: () => html\`<agtc-icon name="search" size="control" label="Search"></agtc-icon>\`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Nav — 24px (navigation, emphasis)',
  render: () => html\`<agtc-icon name="settings" size="nav" label="Settings"></agtc-icon>\`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Sizes — inline / control / nav',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-2xl);align-items:center;">
      <agtc-icon name="home" size="inline" decorative></agtc-icon>
      <agtc-icon name="home" size="control" decorative></agtc-icon>
      <agtc-icon name="home" size="nav" decorative></agtc-icon>
    </div>
  \`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Semantic — label required (WCAG 1.1.1)',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-lg);align-items:center;">
      <agtc-icon name="trash-2" size="control" label="Delete the file"></agtc-icon>
      <agtc-icon name="download" size="control" label="Download"></agtc-icon>
      <agtc-icon name="bell" size="control" label="Notifications"></agtc-icon>
    </div>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Decorative — aria-hidden (adjacent text)',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
      <span style="display:flex;align-items:center;gap:var(--agtc-semantic-space-component-padding-xs);">
        <agtc-icon name="check" size="control" decorative></agtc-icon> Saved
      </span>
      <span style="display:flex;align-items:center;gap:var(--agtc-semantic-space-component-padding-xs);">
        <agtc-icon name="alert-triangle" size="control" decorative></agtc-icon> Attention required
      </span>
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Overview — sizes and common icons',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">Sizes (inline · control · nav)</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-2xl);align-items:center;">
          <agtc-icon name="star" size="inline" decorative></agtc-icon>
          <agtc-icon name="star" size="control" decorative></agtc-icon>
          <agtc-icon name="star" size="nav" decorative></agtc-icon>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">Common icons (control)</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-lg);flex-wrap:wrap;align-items:center;color:var(--agtc-semantic-color-text-primary);">
          <agtc-icon name="home" size="control" decorative></agtc-icon>
          <agtc-icon name="search" size="control" decorative></agtc-icon>
          <agtc-icon name="settings" size="control" decorative></agtc-icon>
          <agtc-icon name="user" size="control" decorative></agtc-icon>
          <agtc-icon name="bell" size="control" decorative></agtc-icon>
          <agtc-icon name="download" size="control" decorative></agtc-icon>
          <agtc-icon name="trash-2" size="control" decorative></agtc-icon>
          <agtc-icon name="check" size="control" decorative></agtc-icon>
          <agtc-icon name="x" size="control" decorative></agtc-icon>
          <agtc-icon name="chevron-right" size="control" decorative></agtc-icon>
          <agtc-icon name="info" size="control" decorative></agtc-icon>
          <agtc-icon name="alert-triangle" size="control" decorative></agtc-icon>
        </div>
      </div>
    </div>
  \`
}`,...u.parameters?.docs?.source}}},d=[`Inline`,`Control`,`Nav`,`Sizes`,`Semantic`,`Decorative`,`AllVariants`]}))();export{u as AllVariants,a as Control,l as Decorative,i as Inline,o as Nav,c as Semantic,s as Sizes,d as __namedExportsOrder,r as default};