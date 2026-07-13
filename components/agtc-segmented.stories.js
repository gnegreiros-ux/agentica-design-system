import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-segmented',
  component: 'agtc-segmented',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036/044, SG1–SG8 all approved):',
          '',
          '- **Group of `<button>` + `aria-current` + immediate effect** (≠ radiogroup, ≠ tablist) — [Primer — Segmented Control](https://primer.style/product/components/segmented-control/accessibility/)',
          '- **Single-select, always exactly one active**; 2–5 short options — NN/g',
          '- **Selected state not by color alone** (solid background + weight) — WCAG 1.4.1',
          '',
          'Native **Tab** navigation (no arrow keys), emits `change`. Deliberate divergence vs `agtc-radio-group` (immediate effect).',
          '',
          'Details: `guidelines/components/segmented.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    value:      { control: 'text' },
    label:      { control: 'text' },
    equalWidth: { control: 'boolean', name: 'equal-width' },
  },
  args: {
    value: 'fr',
    label: 'Language',
    equalWidth: false,
  },
  render: (args) => {
    const el = document.createElement('agtc-segmented');
    el.options = [{ value: 'fr', label: 'FR' }, { value: 'en', label: 'EN' }];
    el.value = args.value;
    el.label = args.label;
    el.equalWidth = args.equalWidth;
    el.addEventListener('change', (e) => console.log('change', e.detail));
    return el;
  },
};

// ── Language toggle (real site use case) ──────────────────────────────────────
export const Language = {
  name: 'Language toggle (FR/EN)',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [{ value: 'fr', label: 'FR' }, { value: 'en', label: 'EN' }];
    el.value = 'fr';
    el.label = 'Language';
    return el;
  },
};

// ── Three options ─────────────────────────────────────────────────────────────
export const ThreeOptions = {
  name: 'Three options (density)',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [
      { value: 'compact', label: 'Compact' },
      { value: 'normal', label: 'Normal' },
      { value: 'comfortable', label: 'Comfortable' },
    ];
    el.value = 'normal';
    el.label = 'Density';
    return el;
  },
};

// ── With icons + equal width ──────────────────────────────────────────────────
export const WithIcons = {
  name: 'With icons, equal width',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [
      { value: 'list', label: 'List', icon: 'list' },
      { value: 'grid', label: 'Grid', icon: 'grid-3x3' },
    ];
    el.value = 'list';
    el.label = 'View';
    el.equalWidth = true;
    el.style.width = '260px';
    return el;
  },
};
