import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i,a,o,s,c;e((()=>{t(),r=`<agtc-badge variant="success" icon="check">Validated</agtc-badge>
<agtc-badge variant="danger" icon="x">Expired</agtc-badge>`,i={title:`Components/agtc-code-block`,component:`agtc-code-block`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036/041, CD1–CD9 all approved):`,``,"- **Semantic `<pre><code>` + language** — [DEV — copy code button](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8)",`- **Copy button + text feedback** — [roboleary](https://www.roboleary.net/2022/01/13/copy-code-to-clipboard-blog)`,'- **Success announced to AT** (`role="status"` / `aria-live`) — [Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)',`- **Horizontal scroll** for long lines — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)`,``,`Read-only. Syntax highlighting and line numbers are **out of scope for v1** (door left open).`,``,"Details: `guidelines/components/code-block.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{language:{control:`text`},filename:{control:`text`},copyLabel:{control:`text`,name:`copy-label`},copiedLabel:{control:`text`,name:`copied-label`}},args:{language:`html`,filename:``},render:e=>n`
    <agtc-code-block
      language="${e.language??``}"
      filename="${e.filename??``}"
      copy-label="${e.copyLabel??`Copy`}"
      copied-label="${e.copiedLabel??`Copied!`}"
    ><code>${r}</code></agtc-code-block>
  `},a={name:`Default — language + copy`,render:()=>n`
    <agtc-code-block language="html"><code>${r}</code></agtc-code-block>
  `},o={name:`With filename`,render:()=>n`
    <agtc-code-block language="javascript" filename="agtc-badge.js"><code>import { LitElement, html } from 'lit';

class AgtcBadge extends LitElement {
  static properties = { variant: { type: String } };
}</code></agtc-code-block>
  `},s={name:`Long line (horizontal scroll)`,render:()=>n`
    <agtc-code-block language="css"><code>.selector { background: linear-gradient(to right, var(--agtc-component-table-default-header-background), rgba(255,255,255,0)) left / 24px 100% no-repeat; }</code></agtc-code-block>
  `},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Default — language + copy',
  render: () => html\`
    <agtc-code-block language="html"><code>\${SAMPLE}</code></agtc-code-block>
  \`
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'With filename',
  render: () => html\`
    <agtc-code-block language="javascript" filename="agtc-badge.js"><code>import { LitElement, html } from 'lit';

class AgtcBadge extends LitElement {
  static properties = { variant: { type: String } };
}</code></agtc-code-block>
  \`
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Long line (horizontal scroll)',
  render: () => html\`
    <agtc-code-block language="css"><code>.selector { background: linear-gradient(to right, var(--agtc-component-table-default-header-background), rgba(255,255,255,0)) left / 24px 100% no-repeat; }</code></agtc-code-block>
  \`
}`,...s.parameters?.docs?.source}}},c=[`Default`,`WithFilename`,`LongLine`]}))();export{a as Default,s as LongLine,o as WithFilename,c as __namedExportsOrder,i as default};