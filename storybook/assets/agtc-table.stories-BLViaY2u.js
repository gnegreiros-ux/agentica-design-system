import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t}from"./iframe-BnplYTFI.js";var n,r,i,a,o,s,c,l;e((()=>{t(),n=[{label:`CSS Token`,align:`start`,width:`46%`},{label:`Reference`,align:`start`,width:`34%`},{label:`Value`,align:`end`,width:`20%`}],r=[[`--agtc-table-default-header-background`,`semantic.color.background.subtle`,`#f0f0f0`],[`--agtc-table-default-border`,`semantic.color.border.default`,`#e8e8e8`],[`--agtc-table-default-row-hover`,`semantic.color.background.hover`,`#f5f5f5`],[`--agtc-table-padding-x`,`primitive.space.3`,`12px`]],i={title:`Components/agtc-table`,component:`agtc-table`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036/040, T1–T10 all approved):`,``,'- **Semantic HTML + `scope="col"` + `<caption>`** — [Smashing — Table Patterns](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/)',`- **Alignment** text/left, numeric/right; **separators** (zebra striping optional); **row hover**; **pinned header**; 1st column = readable identifier — [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/)`,`- **Horizontal scroll + overflow indicator** — [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/)`,``,"Read-only. Sorting / filtering / pagination are **out of scope for v1** (door left open: the `columns`/`rows` API will accommodate them without breakage).",``,"Details: `guidelines/components/table.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{caption:{control:`text`},captionHidden:{control:`boolean`,name:`caption-hidden`},striped:{control:`boolean`},stickyHeader:{control:`boolean`,name:`sticky-header`},density:{control:`select`,options:[`compact`,`comfortable`],table:{defaultValue:{summary:`compact`}}}},args:{caption:`Table component tokens`,captionHidden:!0,striped:!1,stickyHeader:!1,density:`compact`},render:e=>{let t=document.createElement(`agtc-table`);return t.columns=n,t.rows=r,t.caption=e.caption??``,t.captionHidden=e.captionHidden,t.striped=e.striped,t.stickyHeader=e.stickyHeader,t.density=e.density,t}},a={name:`Default — row separators`,render:()=>{let e=document.createElement(`agtc-table`);return e.columns=n,e.rows=r,e.caption=`Table component tokens`,e.captionHidden=!0,e}},o={name:`Zebra striping (striped)`,render:()=>{let e=document.createElement(`agtc-table`);return e.columns=n,e.rows=[...r,...r],e.caption=`Striped table`,e.captionHidden=!0,e.striped=!0,e}},s={name:`Visible caption`,render:()=>{let e=document.createElement(`agtc-table`);return e.columns=[{label:`Step`,align:`start`},{label:`Value`,align:`end`},{label:`Role`,align:`start`}],e.rows=[[`space-1`,`4px`,`Minimal spacing`],[`space-2`,`8px`,`Dense controls`],[`space-3`,`12px`,`Standard padding`]],e.caption=`Primitive spacing scale`,e}},c={name:`Comfortable density`,render:()=>{let e=document.createElement(`agtc-table`);return e.columns=n,e.rows=r,e.caption=`Comfortable density`,e.captionHidden=!0,e.density=`comfortable`,e}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Default — row separators',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = 'Table component tokens';
    el.captionHidden = true;
    return el;
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Zebra striping (striped)',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = [...TOKEN_ROWS, ...TOKEN_ROWS];
    el.caption = 'Striped table';
    el.captionHidden = true;
    el.striped = true;
    return el;
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Visible caption',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = [{
      label: 'Step',
      align: 'start'
    }, {
      label: 'Value',
      align: 'end'
    }, {
      label: 'Role',
      align: 'start'
    }];
    el.rows = [['space-1', '4px', 'Minimal spacing'], ['space-2', '8px', 'Dense controls'], ['space-3', '12px', 'Standard padding']];
    el.caption = 'Primitive spacing scale';
    return el;
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Comfortable density',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = 'Comfortable density';
    el.captionHidden = true;
    el.density = 'comfortable';
    return el;
  }
}`,...c.parameters?.docs?.source}}},l=[`Default`,`Striped`,`WithCaption`,`Comfortable`]}))();export{c as Comfortable,a as Default,o as Striped,s as WithCaption,l as __namedExportsOrder,i as default};