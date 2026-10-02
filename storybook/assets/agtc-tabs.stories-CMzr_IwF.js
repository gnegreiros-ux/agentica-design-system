import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t}from"./iframe-BnplYTFI.js";var n,r,i,a,o,s;e((()=>{t(),n={title:`Components/agtc-tabs`,component:`agtc-tabs`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-056, all approved):`,``,`- **Tablist above the panel** — [NN/g — Tabs Used Right](https://www.nngroup.com/articles/tabs-used-right/)`,`- **Automatic activation on focus** (arrows → visible panel without Enter) — [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)`,"- **Full ARIA**: `tablist/tab/tabpanel` · `aria-selected` · `aria-controls` · roving tabindex","- **Keyboard navigation**: `ArrowLeft/Right` (circular) · `Home/End` · `Tab` leaves the group","- **`:visited` neutralized** on tabs (navigation, ADR-047)","- **Optional `href`** per tab for external navigation links",``,"Distinct from `agtc-segmented` (immediate-effect setting, no panel).",``,"Details: `guidelines/components/tabs.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{label:{control:`text`},selected:{control:`text`},activation:{control:`select`,options:[`auto`,`manual`]}},args:{label:`Sections`,selected:`overview`,activation:`auto`},render:e=>{let t=document.createElement(`agtc-tabs`);t.tabs=[{value:`overview`,label:`Overview`},{value:`tokens`,label:`Tokens`},{value:`a11y`,label:`Accessibility`}],t.selected=e.selected,t.label=e.label,t.activation=e.activation;let n=document.createElement(`div`);n.slot=`overview`,n.textContent=`Overview panel content.`;let r=document.createElement(`div`);r.slot=`tokens`,r.textContent=`Tokens panel content.`;let i=document.createElement(`div`);return i.slot=`a11y`,i.textContent=`Accessibility panel content.`,t.append(n,r,i),t.addEventListener(`change`,e=>console.log(`change`,e.detail)),t}},r={name:`In-page (3 tabs)`,render:()=>{let e=document.createElement(`agtc-tabs`);return e.label=`Component documentation`,e.tabs=[{value:`overview`,label:`Overview`},{value:`tokens`,label:`Tokens`},{value:`a11y`,label:`Accessibility`}],[`overview`,`tokens`,`a11y`].forEach((t,n)=>{let r=document.createElement(`div`);r.slot=t,r.style.padding=`8px 0`,r.textContent=`Content of the "${[`Overview`,`Tokens`,`Accessibility`][n]}" panel.`,e.appendChild(r)}),e}},i={name:`With external link (optional href)`,render:()=>{let e=document.createElement(`agtc-tabs`);return e.label=`Button resources`,e.tabs=[{value:`overview`,label:`Overview`},{value:`tokens`,label:`Tokens`},{value:`storybook`,label:`Storybook ↗`,href:`https://storybook.js.org`}],[`overview`,`tokens`].forEach(t=>{let n=document.createElement(`div`);n.slot=t,n.style.padding=`8px 0`,n.textContent=`Content of the ${t} panel.`,e.appendChild(n)}),e}},a={name:`Manual activation (Enter required)`,render:()=>{let e=document.createElement(`agtc-tabs`);return e.label=`Sections (manual activation)`,e.activation=`manual`,e.tabs=[{value:`a`,label:`Section A`},{value:`b`,label:`Section B`},{value:`c`,label:`Section C`}],[`a`,`b`,`c`].forEach(t=>{let n=document.createElement(`div`);n.slot=t,n.style.padding=`8px 0`,n.textContent=`Content of section ${t.toUpperCase()}. Navigate with ←/→ then press Enter to activate.`,e.appendChild(n)}),e}},o={name:`Two tabs (minimum)`,render:()=>{let e=document.createElement(`agtc-tabs`);return e.label=`View`,e.tabs=[{value:`list`,label:`List`},{value:`grid`,label:`Grid`}],[`list`,`grid`].forEach(t=>{let n=document.createElement(`div`);n.slot=t,n.style.padding=`8px 0`,n.textContent=`${t} view.`,e.appendChild(n)}),e}},r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'In-page (3 tabs)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Component documentation';
    el.tabs = [{
      value: 'overview',
      label: 'Overview'
    }, {
      value: 'tokens',
      label: 'Tokens'
    }, {
      value: 'a11y',
      label: 'Accessibility'
    }];
    ['overview', 'tokens', 'a11y'].forEach((v, i) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = \`Content of the "\${['Overview', 'Tokens', 'Accessibility'][i]}" panel.\`;
      el.appendChild(div);
    });
    return el;
  }
}`,...r.parameters?.docs?.source}}},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'With external link (optional href)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Button resources';
    el.tabs = [{
      value: 'overview',
      label: 'Overview'
    }, {
      value: 'tokens',
      label: 'Tokens'
    }, {
      value: 'storybook',
      label: 'Storybook ↗',
      href: 'https://storybook.js.org'
    }];
    ['overview', 'tokens'].forEach(v => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = \`Content of the \${v} panel.\`;
      el.appendChild(div);
    });
    return el;
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Manual activation (Enter required)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Sections (manual activation)';
    el.activation = 'manual';
    el.tabs = [{
      value: 'a',
      label: 'Section A'
    }, {
      value: 'b',
      label: 'Section B'
    }, {
      value: 'c',
      label: 'Section C'
    }];
    ['a', 'b', 'c'].forEach(v => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = \`Content of section \${v.toUpperCase()}. Navigate with ←/→ then press Enter to activate.\`;
      el.appendChild(div);
    });
    return el;
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Two tabs (minimum)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'View';
    el.tabs = [{
      value: 'list',
      label: 'List'
    }, {
      value: 'grid',
      label: 'Grid'
    }];
    ['list', 'grid'].forEach(v => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = \`\${v} view.\`;
      el.appendChild(div);
    });
    return el;
  }
}`,...o.parameters?.docs?.source}}},s=[`InPage`,`WithHref`,`ManualActivation`,`TwoTabs`]}))();export{r as InPage,a as ManualActivation,o as TwoTabs,i as WithHref,s as __namedExportsOrder,n as default};