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
          'Navigation principale horizontale — pattern tabs visuels full-height, liens inter-pages.',
          '',
          '**Distinction critique avec `agtc-tabs` :**',
          '`agtc-top-nav` = `<nav>` + `<a>` + `aria-current="page"` (navigation inter-pages)',
          '`agtc-tabs` = `role=tablist` + panneaux de contenu in-page',
          '',
          'Patterns UX de référence appliqués (ADR-060, tous approuvés) :',
          '',
          '- **Landmark navigation** `<nav aria-label="...">` — [W3C WAI](https://www.w3.org/WAI/ARIA/apg/)',
          '- **`aria-current="page"`** sur le lien actif — [WCAG 2.4.4 / 4.1.2](https://www.w3.org/WAI/WCAG22/)',
          '- **Indicateur border-bottom** pleine hauteur du header (pas de fond rempli) — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Navigation clavier Tab/Enter** (pas de flèches — ce ne sont pas des tabs ARIA) — [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)',
          '- **CTA bouton pill** visuellement distinct des tabs — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '- **`:visited` neutralisé** — ADR-047',
          '',
          'Détail : `guidelines/components/top-nav.md` § PATTERNS UX DE RÉFÉRENCE.',
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
    navLabel: 'Navigation principale',
    current:  '/tokens/',
  },
};

const ITEMS = [
  { label: 'Tokens',      href: '/tokens/' },
  { label: 'Composants',  href: '/components/' },
  { label: 'Fondations',  href: '/foundations/' },
  { label: 'Agents',      href: '/agents/' },
  { label: 'Décisions',   href: '/decisions/' },
  { label: 'Démarrer',    href: '/get-started.html', cta: true },
];

/** Histoire principale — lien Tokens actif */
export const Default = {
  name: 'Tokens actif',
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

/** Page Composants active */
export const ComponentsActive = {
  name: 'Composants actif',
  args: { current: '/components/' },
  render: Default.render,
};

/** Sans page active (hors sections connues) */
export const NoneActive = {
  name: 'Aucun lien actif',
  args: { current: '/unknown/' },
  render: Default.render,
};

/** Sans CTA — navigation interne seulement */
export const NoCTA = {
  name: 'Sans bouton CTA',
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
