import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_;e((()=>{t(),r={title:`Components/agtc-input`,component:`agtc-input`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036, all approved):`,``,"- **Validation on `onBlur`**, then re-validation on typing once the field is in error — [NN/g — How to Report Errors in Forms](https://www.nngroup.com/articles/design-pattern-guidelines/)",'- **Inline error** below the field + `role="alert"`; persistent **help text** via `aria-describedby` — [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/design-pattern-guidelines/)',"- **Required marker** `*` + `aria-required` — [NN/g — Forms](https://www.nngroup.com/articles/design-pattern-guidelines/)","- **Forgiving format** (`tel`/`number`) — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)",`- **Anti hostile patterns** (no clearing of the field on error) — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)`,"- **Exception** — visually-hidden label for icon-clarified search fields (`hide-label`, requires `icon`) — [W3C WAI](https://www.w3.org/WAI/tutorials/forms/labels/) · [W3C ARIA14](https://www.w3.org/TR/WCAG20-TECHS/ARIA14.html) · [NN/g — The Magnifying-Glass Icon](https://www.nngroup.com/articles/magnifying-glass-icon/)",``,"Details: `guidelines/components/input.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{type:{control:`select`,options:[`text`,`email`,`password`,`number`,`search`,`tel`,`url`],table:{defaultValue:{summary:`text`}}},label:{control:`text`},hideLabel:{control:`boolean`,name:`hide-label`},value:{control:`text`},placeholder:{control:`text`},helperText:{control:`text`,name:`helper-text`},errorMessage:{control:`text`,name:`error-message`},invalid:{control:`boolean`},disabled:{control:`boolean`},readonly:{control:`boolean`},required:{control:`boolean`},icon:{control:`text`},iconSuffix:{control:`text`,name:`icon-suffix`}},args:{type:`text`,label:`Email address`,placeholder:`name@example.com`,hideLabel:!1,invalid:!1,disabled:!1,readonly:!1,required:!1},render:e=>n`
    <div style="max-width:360px;">
      <agtc-input
        type="${e.type}"
        label="${e.label}"
        ?hide-label="${e.hideLabel}"
        placeholder="${e.placeholder??``}"
        helper-text="${e.helperText??``}"
        error-message="${e.errorMessage??``}"
        ?invalid="${e.invalid}"
        ?disabled="${e.disabled}"
        ?readonly="${e.readonly}"
        ?required="${e.required}"
        icon="${e.icon??``}"
        icon-suffix="${e.iconSuffix??``}"
      ></agtc-input>
    </div>
  `},i={name:`Default`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input label="Email address" placeholder="name@example.com"></agtc-input>
    </div>
  `},a={name:`With helper text`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        placeholder="name@example.com"
        helper-text="We never share your address."
      ></agtc-input>
    </div>
  `},o={name:`Required`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        placeholder="name@example.com"
        required
        helper-text="Required field."
      ></agtc-input>
    </div>
  `},s={name:`State — Invalid`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        value="not-an-address"
        invalid
        error-message="Invalid email address. Check the format (e.g. name@domain.com)."
      ></agtc-input>
    </div>
  `},c={name:`State — Disabled`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        value="user@example.com"
        disabled
        helper-text="This field cannot be edited."
      ></agtc-input>
    </div>
  `},l={name:`State — Readonly`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        label="Identifier"
        value="USR-00142"
        readonly
        helper-text="Automatically generated identifier."
      ></agtc-input>
    </div>
  `},u={name:`Type — Password (show/hide toggle)`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        type="password"
        label="Password"
        placeholder="8 characters minimum"
        helper-text="Use a combination of letters, numbers and symbols."
      ></agtc-input>
    </div>
  `},d={name:`Type — Search`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        type="search"
        label="Search"
        placeholder="Components, tokens, guidelines…"
        icon="search"
      ></agtc-input>
    </div>
  `},f={name:`Type — Search (visually-hidden label, exception)`,parameters:{docs:{description:{story:["The `label` is still rendered in the DOM (`for`/`id` linked) and read by screen readers —","only visually hidden via `.visually-hidden`, never removed or `display:none`. Requires","`icon` so the field's purpose stays unambiguous without the visible text (W3C ARIA14)."].join(` `)}}},render:()=>n`
    <div style="max-width:360px;">
      <agtc-input
        type="search"
        label="Search"
        hide-label
        placeholder="Components, tokens, guidelines…"
        icon="search"
      ></agtc-input>
    </div>
  `},p={name:`Type — Number (no native spinners)`,render:()=>n`
    <div style="max-width:200px;">
      <agtc-input
        type="number"
        label="Quantity"
        placeholder="0"
        helper-text="Value between 1 and 99."
      ></agtc-input>
    </div>
  `},m={name:`Icons — Prefix and suffix`,render:()=>n`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:360px;">
      <agtc-input
        label="Search for a user"
        placeholder="Name or email"
        icon="search"
      ></agtc-input>
      <agtc-input
        label="Amount"
        placeholder="0.00"
        icon="euro"
        icon-suffix="trending-up"
        type="number"
      ></agtc-input>
    </div>
  `},h={name:`Icons — Free slot composition`,render:()=>n`
    <div style="max-width:360px;">
      <agtc-input label="Profile URL" placeholder="https://">
        <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true"
          style="margin-inline-start:12px;color:var(--agtc-semantic-color-text-secondary);flex-shrink:0;">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </agtc-input>
    </div>
  `},g={name:`Overview — all states`,render:()=>n`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--agtc-semantic-space-component-padding-2xl);max-width:760px;">
      <agtc-input label="Default" placeholder="Enter a value"></agtc-input>
      <agtc-input label="Required" placeholder="Enter a value" required helper-text="Required field."></agtc-input>
      <agtc-input label="Invalid" value="incorrect value" invalid error-message="This field contains an error."></agtc-input>
      <agtc-input label="Disabled" value="Disabled value" disabled></agtc-input>
      <agtc-input label="Readonly" value="Read-only value" readonly helper-text="Not editable."></agtc-input>
      <agtc-input label="Password" type="password" placeholder="Password"></agtc-input>
      <agtc-input label="With icon" placeholder="Search…" icon="search"></agtc-input>
      <agtc-input label="Invalid + icon" value="error" icon="mail" invalid error-message="Invalid format."></agtc-input>
    </div>
  `},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Default',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input label="Email address" placeholder="name@example.com"></agtc-input>
    </div>
  \`
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'With helper text',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        placeholder="name@example.com"
        helper-text="We never share your address."
      ></agtc-input>
    </div>
  \`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Required',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        placeholder="name@example.com"
        required
        helper-text="Required field."
      ></agtc-input>
    </div>
  \`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'State — Invalid',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        value="not-an-address"
        invalid
        error-message="Invalid email address. Check the format (e.g. name@domain.com)."
      ></agtc-input>
    </div>
  \`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'State — Disabled',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        value="user@example.com"
        disabled
        helper-text="This field cannot be edited."
      ></agtc-input>
    </div>
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'State — Readonly',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        label="Identifier"
        value="USR-00142"
        readonly
        helper-text="Automatically generated identifier."
      ></agtc-input>
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Type — Password (show/hide toggle)',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        type="password"
        label="Password"
        placeholder="8 characters minimum"
        helper-text="Use a combination of letters, numbers and symbols."
      ></agtc-input>
    </div>
  \`
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Type — Search',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        type="search"
        label="Search"
        placeholder="Components, tokens, guidelines…"
        icon="search"
      ></agtc-input>
    </div>
  \`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Type — Search (visually-hidden label, exception)',
  parameters: {
    docs: {
      description: {
        story: ['The \`label\` is still rendered in the DOM (\`for\`/\`id\` linked) and read by screen readers —', 'only visually hidden via \`.visually-hidden\`, never removed or \`display:none\`. Requires', '\`icon\` so the field\\'s purpose stays unambiguous without the visible text (W3C ARIA14).'].join(' ')
      }
    }
  },
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input
        type="search"
        label="Search"
        hide-label
        placeholder="Components, tokens, guidelines…"
        icon="search"
      ></agtc-input>
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Type — Number (no native spinners)',
  render: () => html\`
    <div style="max-width:200px;">
      <agtc-input
        type="number"
        label="Quantity"
        placeholder="0"
        helper-text="Value between 1 and 99."
      ></agtc-input>
    </div>
  \`
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Icons — Prefix and suffix',
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:360px;">
      <agtc-input
        label="Search for a user"
        placeholder="Name or email"
        icon="search"
      ></agtc-input>
      <agtc-input
        label="Amount"
        placeholder="0.00"
        icon="euro"
        icon-suffix="trending-up"
        type="number"
      ></agtc-input>
    </div>
  \`
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Icons — Free slot composition',
  render: () => html\`
    <div style="max-width:360px;">
      <agtc-input label="Profile URL" placeholder="https://">
        <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true"
          style="margin-inline-start:12px;color:var(--agtc-semantic-color-text-secondary);flex-shrink:0;">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </agtc-input>
    </div>
  \`
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Overview — all states',
  render: () => html\`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--agtc-semantic-space-component-padding-2xl);max-width:760px;">
      <agtc-input label="Default" placeholder="Enter a value"></agtc-input>
      <agtc-input label="Required" placeholder="Enter a value" required helper-text="Required field."></agtc-input>
      <agtc-input label="Invalid" value="incorrect value" invalid error-message="This field contains an error."></agtc-input>
      <agtc-input label="Disabled" value="Disabled value" disabled></agtc-input>
      <agtc-input label="Readonly" value="Read-only value" readonly helper-text="Not editable."></agtc-input>
      <agtc-input label="Password" type="password" placeholder="Password"></agtc-input>
      <agtc-input label="With icon" placeholder="Search…" icon="search"></agtc-input>
      <agtc-input label="Invalid + icon" value="error" icon="mail" invalid error-message="Invalid format."></agtc-input>
    </div>
  \`
}`,...g.parameters?.docs?.source}}},_=[`Default`,`WithHelperText`,`Required`,`Invalid`,`Disabled`,`Readonly`,`Password`,`Search`,`SearchHiddenLabel`,`Number`,`WithIcons`,`WithCustomSlot`,`AllStates`]}))();export{g as AllStates,i as Default,c as Disabled,s as Invalid,p as Number,u as Password,l as Readonly,o as Required,d as Search,f as SearchHiddenLabel,h as WithCustomSlot,a as WithHelperText,m as WithIcons,_ as __namedExportsOrder,r as default};