import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-top-nav',
  component: 'agtc-top-nav',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Horizontal main navigation — full-height visual-tabs pattern, cross-page links.',
          '',
          '**Critical distinction from `agtc-tabs`:**',
          '`agtc-top-nav` = `<nav>` + `<a>` + `aria-current="page"` (cross-page navigation)',
          '`agtc-tabs` = `role=tablist` + in-page content panels',
          '',
          'UX reference patterns applied (ADR-060, all approved):',
          '',
          '- **Navigation landmark** `<nav aria-label="...">` — [W3C WAI](https://www.w3.org/WAI/ARIA/apg/)',
          '- **`aria-current="page"`** on the active link — [WCAG 2.4.4 / 4.1.2](https://www.w3.org/WAI/WCAG22/)',
          '- **Border-bottom indicator** spanning the full header height (no filled background) — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Tab/Enter keyboard navigation** (no arrow keys — these are not ARIA tabs) — [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)',
          '- **Pill CTA button** visually distinct from the tabs — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '- **`:visited` neutralized** — ADR-047',
          '',
          'Details: `guidelines/components/top-nav.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    navLabel: { control: 'text', name: 'nav-label' },
    current:  { control: 'text' },
  },
  args: {
    navLabel: 'Main navigation',
    current:  '/tokens/',
  },
};

const ITEMS = [
  { labelFr: 'Tokens',      labelEn: 'Tokens',       href: '/tokens/' },
  { labelFr: 'Composants',  labelEn: 'Components',   href: '/components/' },
  { labelFr: 'Fondations',  labelEn: 'Foundations',  href: '/foundations/' },
  { labelFr: 'Agents',      labelEn: 'Agents',       href: '/agents/' },
  { labelFr: 'Décisions',   labelEn: 'Decisions',    href: '/decisions/' },
  { labelFr: 'Démarrer',    labelEn: 'Get started',  href: '/get-started.html', cta: true },
];

/** Main story — Tokens link active */
export const Default = {
  name: 'Tokens active',
  render: (args) => {
    const nav = document.createElement('agtc-top-nav');
    nav.items    = ITEMS;
    nav.current  = args.current;
    nav.navLabel = args.navLabel;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:stretch;height:64px;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);border-top:3px solid var(--agtc-semantic-color-action-primary);padding:0 24px;';
    wrapper.appendChild(nav);
    return wrapper;
  },
};

/** Components page active */
export const ComponentsActive = {
  name: 'Components active',
  args: { current: '/components/' },
  render: Default.render,
};

/** No active page (outside known sections) */
export const NoneActive = {
  name: 'No active link',
  args: { current: '/unknown/' },
  render: Default.render,
};

/** No CTA — internal navigation only */
export const NoCTA = {
  name: 'No CTA button',
  render: (args) => {
    const nav = document.createElement('agtc-top-nav');
    nav.items    = ITEMS.filter(i => !i.cta);
    nav.current  = args.current;
    nav.navLabel = args.navLabel;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:stretch;height:64px;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);border-top:3px solid var(--agtc-semantic-color-action-primary);padding:0 24px;';
    wrapper.appendChild(nav);
    return wrapper;
  },
};
