import{i as e}from"./preload-helper-xPQekRTU.js";import{K as t,Y as n}from"./iframe-BnplYTFI.js";var r,i=e((()=>{r=``+new URL(`landscape-CCR6bTiI.jpg`,import.meta.url).href})),a,o=e((()=>{a=``+new URL(`landscape-C67lDela.webp`,import.meta.url).href})),s,c=e((()=>{s=``+new URL(`wide-Y0aHJkdF.jpg`,import.meta.url).href})),l,u,d,f,p,m,h,g,_;e((()=>{t(),i(),o(),c(),l={title:`Components/agtc-image`,component:`agtc-image`,tags:[`autodocs`],parameters:{docs:{description:{component:[`UX reference patterns applied (ADR-036, all approved):`,``,'- **Decorative vs meaningful image distinction** (`alt=""` + `aria-hidden`), mirrors the pattern already approved on `agtc-icon` — WCAG 1.1.1 / [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',`- **Skeleton screen while loading** (opt-in) — [NN/g — Skeleton Screens 101](https://www.nngroup.com/articles/skeleton-screens/)`,`- **Graceful fallback on load failure** — icon + visible alt text instead of a broken-image hole`,"- **`object-fit` configurable** (`cover`/`contain`/`fill`) for consistent cropping behavior",``,"Details: `guidelines/components/image.md` § UX Patterns Reference."].join(`
`)}}},argTypes:{src:{control:`text`},srcWebp:{control:`text`,name:`src-webp`},alt:{control:`text`},decorative:{control:`boolean`},width:{control:`number`},height:{control:`number`},fit:{control:`select`,options:[`cover`,`contain`,`fill`],table:{defaultValue:{summary:`cover`}}},priority:{control:`boolean`},skeleton:{control:`boolean`}},args:{src:r,alt:`Placeholder photo`,width:800,height:450,fit:`cover`},render:e=>n`
    <div style="max-width:480px">
      <agtc-image
        src="${e.src}"
        src-webp="${e.srcWebp??``}"
        alt="${e.decorative?``:e.alt??``}"
        ?decorative="${e.decorative}"
        width="${e.width}"
        height="${e.height}"
        fit="${e.fit}"
        ?priority="${e.priority}"
        ?skeleton="${e.skeleton}"
      ></agtc-image>
    </div>
  `},u={name:`Default — lazy, no skeleton`,render:()=>n`
    <div style="max-width:480px">
      <agtc-image
        src="${r}"
        alt="A placeholder photo"
        width="800"
        height="450"
      ></agtc-image>
    </div>
  `},d={name:`Skeleton — opt-in loading placeholder`,render:()=>n`
    <div style="max-width:480px">
      <agtc-image
        src="${r}"
        alt="A placeholder photo, with a skeleton shown until it loads"
        width="800"
        height="450"
        skeleton
      ></agtc-image>
    </div>
  `},f={name:`Priority — LCP / above-the-fold image`,render:()=>n`
    <div style="max-width:480px">
      <agtc-image
        src="${r}"
        alt="Hero image, loaded eagerly with high fetch priority"
        width="1200"
        height="630"
        priority
      ></agtc-image>
    </div>
  `},p={name:`object-fit — cover / contain / fill`,render:()=>n`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-lg);flex-wrap:wrap">
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">cover</p>
        <agtc-image src="${s}" alt="Wide photo, cropped to fill a square" width="220" height="220" fit="cover"></agtc-image>
      </div>
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">contain</p>
        <agtc-image src="${s}" alt="Wide photo, letterboxed in a square" width="220" height="220" fit="contain"></agtc-image>
      </div>
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">fill</p>
        <agtc-image src="${s}" alt="Wide photo, stretched to fill a square" width="220" height="220" fit="fill"></agtc-image>
      </div>
    </div>
  `},m={name:`Decorative — alt="" + aria-hidden`,render:()=>n`
    <div style="max-width:320px">
      <agtc-image
        src="${s}"
        decorative
        width="600"
        height="300"
      ></agtc-image>
    </div>
  `},h={name:`Error state — fallback on failed load`,render:()=>n`
    <div style="max-width:320px">
      <agtc-image
        src="https://this-domain-does-not-exist.invalid/broken.jpg"
        alt="A photo that fails to load"
        width="600"
        height="300"
      ></agtc-image>
    </div>
  `},g={name:`WebP source + fallback format`,render:()=>n`
    <div style="max-width:480px">
      <agtc-image
        src="${r}"
        src-webp="${a}"
        alt="Photo served as WebP where supported, JPEG fallback otherwise"
        width="800"
        height="450"
      ></agtc-image>
    </div>
  `},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Default — lazy, no skeleton',
  render: () => html\`
    <div style="max-width:480px">
      <agtc-image
        src="\${landscapeJpg}"
        alt="A placeholder photo"
        width="800"
        height="450"
      ></agtc-image>
    </div>
  \`
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Skeleton — opt-in loading placeholder',
  render: () => html\`
    <div style="max-width:480px">
      <agtc-image
        src="\${landscapeJpg}"
        alt="A placeholder photo, with a skeleton shown until it loads"
        width="800"
        height="450"
        skeleton
      ></agtc-image>
    </div>
  \`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Priority — LCP / above-the-fold image',
  render: () => html\`
    <div style="max-width:480px">
      <agtc-image
        src="\${landscapeJpg}"
        alt="Hero image, loaded eagerly with high fetch priority"
        width="1200"
        height="630"
        priority
      ></agtc-image>
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'object-fit — cover / contain / fill',
  render: () => html\`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-lg);flex-wrap:wrap">
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">cover</p>
        <agtc-image src="\${wideJpg}" alt="Wide photo, cropped to fill a square" width="220" height="220" fit="cover"></agtc-image>
      </div>
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">contain</p>
        <agtc-image src="\${wideJpg}" alt="Wide photo, letterboxed in a square" width="220" height="220" fit="contain"></agtc-image>
      </div>
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">fill</p>
        <agtc-image src="\${wideJpg}" alt="Wide photo, stretched to fill a square" width="220" height="220" fit="fill"></agtc-image>
      </div>
    </div>
  \`
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Decorative — alt="" + aria-hidden',
  render: () => html\`
    <div style="max-width:320px">
      <agtc-image
        src="\${wideJpg}"
        decorative
        width="600"
        height="300"
      ></agtc-image>
    </div>
  \`
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Error state — fallback on failed load',
  render: () => html\`
    <div style="max-width:320px">
      <agtc-image
        src="https://this-domain-does-not-exist.invalid/broken.jpg"
        alt="A photo that fails to load"
        width="600"
        height="300"
      ></agtc-image>
    </div>
  \`
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'WebP source + fallback format',
  render: () => html\`
    <div style="max-width:480px">
      <agtc-image
        src="\${landscapeJpg}"
        src-webp="\${landscapeWebp}"
        alt="Photo served as WebP where supported, JPEG fallback otherwise"
        width="800"
        height="450"
      ></agtc-image>
    </div>
  \`
}`,...g.parameters?.docs?.source}}},_=[`Default`,`WithSkeleton`,`Priority`,`ObjectFit`,`Decorative`,`BrokenImage`,`WebpWithFallback`]}))();export{h as BrokenImage,m as Decorative,u as Default,p as ObjectFit,f as Priority,g as WebpWithFallback,d as WithSkeleton,_ as __namedExportsOrder,l as default};