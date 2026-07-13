import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-tabs',
  component: 'agtc-tabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-056, all approved):',
          '',
          '- **Tablist above the panel** — [NN/g — Tabs Used Right](https://www.nngroup.com/articles/tabs-used-right/)',
          '- **Automatic activation on focus** (arrows → visible panel without Enter) — [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)',
          '- **Full ARIA**: `tablist/tab/tabpanel` · `aria-selected` · `aria-controls` · roving tabindex',
          '- **Keyboard navigation**: `ArrowLeft/Right` (circular) · `Home/End` · `Tab` leaves the group',
          '- **`:visited` neutralized** on tabs (navigation, ADR-047)',
          '- **Optional `href`** per tab for external navigation links',
          '',
          'Distinct from `agtc-segmented` (immediate-effect setting, no panel).',
          '',
          'Details: `guidelines/components/tabs.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    label:      { control: 'text' },
    selected:   { control: 'text' },
    activation: { control: 'select', options: ['auto', 'manual'] },
  },
  args: {
    label: 'Sections',
    selected: 'overview',
    activation: 'auto',
  },
  render: (args) => {
    const el = document.createElement('agtc-tabs');
    el.tabs = [
      { value: 'overview', label: 'Overview' },
      { value: 'tokens',   label: 'Tokens' },
      { value: 'a11y',     label: 'Accessibility' },
    ];
    el.selected = args.selected;
    el.label = args.label;
    el.activation = args.activation;

    const p1 = document.createElement('div');
    p1.slot = 'overview';
    p1.textContent = 'Overview panel content.';

    const p2 = document.createElement('div');
    p2.slot = 'tokens';
    p2.textContent = 'Tokens panel content.';

    const p3 = document.createElement('div');
    p3.slot = 'a11y';
    p3.textContent = 'Accessibility panel content.';

    el.append(p1, p2, p3);
    el.addEventListener('change', (e) => console.log('change', e.detail));
    return el;
  },
};

// ── Three in-page tabs ───────────────────────────────────────────────────────
export const InPage = {
  name: 'In-page (3 tabs)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Component documentation';
    el.tabs = [
      { value: 'overview', label: 'Overview' },
      { value: 'tokens',   label: 'Tokens' },
      { value: 'a11y',     label: 'Accessibility' },
    ];

    ['overview', 'tokens', 'a11y'].forEach((v, i) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = `Content of the "${ ['Overview', 'Tokens', 'Accessibility'][i] }" panel.`;
      el.appendChild(div);
    });
    return el;
  },
};

// ── With external link (href) ────────────────────────────────────────────────
export const WithHref = {
  name: 'With external link (optional href)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Button resources';
    el.tabs = [
      { value: 'overview', label: 'Overview' },
      { value: 'tokens',   label: 'Tokens' },
      { value: 'storybook', label: 'Storybook ↗', href: 'https://storybook.js.org' },
    ];

    ['overview', 'tokens'].forEach((v) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = `Content of the ${v} panel.`;
      el.appendChild(div);
    });
    return el;
  },
};

// ── Manual activation ─────────────────────────────────────────────────────────
export const ManualActivation = {
  name: 'Manual activation (Enter required)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Sections (manual activation)';
    el.activation = 'manual';
    el.tabs = [
      { value: 'a', label: 'Section A' },
      { value: 'b', label: 'Section B' },
      { value: 'c', label: 'Section C' },
    ];

    ['a', 'b', 'c'].forEach((v) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = `Content of section ${v.toUpperCase()}. Navigate with ←/→ then press Enter to activate.`;
      el.appendChild(div);
    });
    return el;
  },
};

// ── Two tabs (minimum) ───────────────────────────────────────────────────────
export const TwoTabs = {
  name: 'Two tabs (minimum)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'View';
    el.tabs = [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
    ];

    ['list', 'grid'].forEach((v) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = `${v} view.`;
      el.appendChild(div);
    });
    return el;
  },
};
