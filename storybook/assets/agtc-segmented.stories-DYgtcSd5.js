import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t}from"./iframe-BnplYTFI.js";var n,r,i,a,o;e((()=>{t(),n={title:`Components/agtc-segmented`,component:`agtc-segmented`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036/044, SG1–SG8 all approved):`,``,"- **Group of `<button>` + `aria-current` + immediate effect** (≠ radiogroup, ≠ tablist) — [Primer — Segmented Control](https://primer.style/product/components/segmented-control/accessibility/)",`- **Single-select, always exactly one active**; 2–5 short options — NN/g`,`- **Selected state not by color alone** (solid background + weight) — WCAG 1.4.1`,``,"Native **Tab** navigation (no arrow keys), emits `change`. Deliberate divergence vs `agtc-radio-group` (immediate effect).",``,"Details: `guidelines/components/segmented.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{value:{control:`text`},label:{control:`text`},equalWidth:{control:`boolean`,name:`equal-width`}},args:{value:`fr`,label:`Language`,equalWidth:!1},render:e=>{let t=document.createElement(`agtc-segmented`);return t.options=[{value:`fr`,label:`FR`},{value:`en`,label:`EN`}],t.value=e.value,t.label=e.label,t.equalWidth=e.equalWidth,t.addEventListener(`change`,e=>console.log(`change`,e.detail)),t}},r={name:`Language toggle (FR/EN)`,render:()=>{let e=document.createElement(`agtc-segmented`);return e.options=[{value:`fr`,label:`FR`},{value:`en`,label:`EN`}],e.value=`fr`,e.label=`Language`,e}},i={name:`Three options (density)`,render:()=>{let e=document.createElement(`agtc-segmented`);return e.options=[{value:`compact`,label:`Compact`},{value:`normal`,label:`Normal`},{value:`comfortable`,label:`Comfortable`}],e.value=`normal`,e.label=`Density`,e}},a={name:`With icons, equal width`,render:()=>{let e=document.createElement(`agtc-segmented`);return e.options=[{value:`list`,label:`List`,icon:`list`},{value:`grid`,label:`Grid`,icon:`grid-3x3`}],e.value=`list`,e.label=`View`,e.equalWidth=!0,e.style.width=`260px`,e}},r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'Language toggle (FR/EN)',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [{
      value: 'fr',
      label: 'FR'
    }, {
      value: 'en',
      label: 'EN'
    }];
    el.value = 'fr';
    el.label = 'Language';
    return el;
  }
}`,...r.parameters?.docs?.source}}},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Three options (density)',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [{
      value: 'compact',
      label: 'Compact'
    }, {
      value: 'normal',
      label: 'Normal'
    }, {
      value: 'comfortable',
      label: 'Comfortable'
    }];
    el.value = 'normal';
    el.label = 'Density';
    return el;
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'With icons, equal width',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [{
      value: 'list',
      label: 'List',
      icon: 'list'
    }, {
      value: 'grid',
      label: 'Grid',
      icon: 'grid-3x3'
    }];
    el.value = 'list';
    el.label = 'View';
    el.equalWidth = true;
    el.style.width = '260px';
    return el;
  }
}`,...a.parameters?.docs?.source}}},o=[`Language`,`ThreeOptions`,`WithIcons`]}))();export{r as Language,i as ThreeOptions,a as WithIcons,o as __namedExportsOrder,n as default};