import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t}from"./iframe-BnplYTFI.js";var n,r,i,a,o,s,c;e((()=>{t(),n={title:`Components/agtc-top-nav`,component:`agtc-top-nav`,tags:[`autodocs`],parameters:{docs:{description:{component:[`Horizontal main navigation — full-height visual-tabs pattern, cross-page links.`,``,"**Critical distinction from `agtc-tabs`:**",'`agtc-top-nav` = `<nav>` + `<a>` + `aria-current="page"` (cross-page navigation)',"`agtc-tabs` = `role=tablist` + in-page content panels",``,`UX reference patterns applied (ADR-060, all approved):`,``,'- **Navigation landmark** `<nav aria-label="...">` — [W3C WAI](https://www.w3.org/WAI/ARIA/apg/)','- **`aria-current="page"`** on the active link — [WCAG 2.4.4 / 4.1.2](https://www.w3.org/WAI/WCAG22/)',`- **Border-bottom indicator** spanning the full header height (no filled background) — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)`,`- **Tab/Enter keyboard navigation** (no arrow keys — these are not ARIA tabs) — [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)`,`- **Pill CTA button** visually distinct from the tabs — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)`,"- **`:visited` neutralized** — ADR-047",``,"Details: `guidelines/components/top-nav.md` § UX Patterns Reference."].join(`
`)}},layout:`fullscreen`},argTypes:{navLabel:{control:`text`,name:`nav-label`},current:{control:`text`}},args:{navLabel:`Main navigation`,current:`/tokens/`}},r=[{labelFr:`Tokens`,labelEn:`Tokens`,href:`/tokens/`},{labelFr:`Composants`,labelEn:`Components`,href:`/components/`},{labelFr:`Fondations`,labelEn:`Foundations`,href:`/foundations/`},{labelFr:`Agents`,labelEn:`Agents`,href:`/agents/`},{labelFr:`Décisions`,labelEn:`Decisions`,href:`/decisions/`},{labelFr:`Démarrer`,labelEn:`Get started`,href:`/get-started.html`,cta:!0}],i={name:`Tokens active`,render:e=>{let t=document.createElement(`agtc-top-nav`);t.items=r,t.current=e.current,t.navLabel=e.navLabel;let n=document.createElement(`div`);return n.style.cssText=`display:flex;align-items:stretch;height:64px;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);border-top:3px solid var(--agtc-semantic-color-action-primary);padding:0 24px;`,n.appendChild(t),n}},a={name:`Components active`,args:{current:`/components/`},render:i.render},o={name:`No active link`,args:{current:`/unknown/`},render:i.render},s={name:`No CTA button`,render:e=>{let t=document.createElement(`agtc-top-nav`);t.items=r.filter(e=>!e.cta),t.current=e.current,t.navLabel=e.navLabel;let n=document.createElement(`div`);return n.style.cssText=`display:flex;align-items:stretch;height:64px;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);border-top:3px solid var(--agtc-semantic-color-action-primary);padding:0 24px;`,n.appendChild(t),n}},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Tokens active',
  render: args => {
    const nav = document.createElement('agtc-top-nav');
    nav.items = ITEMS;
    nav.current = args.current;
    nav.navLabel = args.navLabel;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:stretch;height:64px;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);border-top:3px solid var(--agtc-semantic-color-action-primary);padding:0 24px;';
    wrapper.appendChild(nav);
    return wrapper;
  }
}`,...i.parameters?.docs?.source},description:{story:`Main story — Tokens link active`,...i.parameters?.docs?.description}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Components active',
  args: {
    current: '/components/'
  },
  render: Default.render
}`,...a.parameters?.docs?.source},description:{story:`Components page active`,...a.parameters?.docs?.description}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'No active link',
  args: {
    current: '/unknown/'
  },
  render: Default.render
}`,...o.parameters?.docs?.source},description:{story:`No active page (outside known sections)`,...o.parameters?.docs?.description}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'No CTA button',
  render: args => {
    const nav = document.createElement('agtc-top-nav');
    nav.items = ITEMS.filter(i => !i.cta);
    nav.current = args.current;
    nav.navLabel = args.navLabel;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:stretch;height:64px;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);border-top:3px solid var(--agtc-semantic-color-action-primary);padding:0 24px;';
    wrapper.appendChild(nav);
    return wrapper;
  }
}`,...s.parameters?.docs?.source},description:{story:`No CTA — internal navigation only`,...s.parameters?.docs?.description}}},c=[`Default`,`ComponentsActive`,`NoneActive`,`NoCTA`]}))();export{a as ComponentsActive,i as Default,s as NoCTA,o as NoneActive,c as __namedExportsOrder,n as default};