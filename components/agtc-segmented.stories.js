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
          'Patterns UX de référence appliqués (ADR-036/044, SG1–SG8 tous approuvés) :',
          '',
          '- **Groupe de `<button>` + `aria-current` + effet immédiat** (≠ radiogroup, ≠ tablist) — [Primer — Segmented Control](https://primer.style/product/components/segmented-control/accessibility/)',
          '- **Mono-sélection, toujours exactement un actif** ; 2–5 options courtes — NN/g',
          '- **État sélectionné pas par la couleur seule** (fond plein + poids) — WCAG 1.4.1',
          '',
          'Navigation **Tab** native (pas de flèches), émet `change`. Écart assumé vs `agtc-radio-group` (effet immédiat).',
          '',
          'Détail : `guidelines/components/segmented.md` § PATTERNS UX DE RÉFÉRENCE.',
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
    label: 'Langue',
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

// ── Bascule de langue (cas réel du site) ──────────────────────────────────────
export const Language = {
  name: 'Bascule de langue (FR/EN)',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [{ value: 'fr', label: 'FR' }, { value: 'en', label: 'EN' }];
    el.value = 'fr';
    el.label = 'Langue';
    return el;
  },
};

// ── Trois options ─────────────────────────────────────────────────────────────
export const ThreeOptions = {
  name: 'Trois options (densité)',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [
      { value: 'compact', label: 'Compact' },
      { value: 'normal', label: 'Normal' },
      { value: 'comfortable', label: 'Confort' },
    ];
    el.value = 'normal';
    el.label = 'Densité';
    return el;
  },
};

// ── Avec icônes + largeur égale ───────────────────────────────────────────────
export const WithIcons = {
  name: 'Avec icônes, largeur égale',
  render: () => {
    const el = document.createElement('agtc-segmented');
    el.options = [
      { value: 'list', label: 'Liste', icon: 'list' },
      { value: 'grid', label: 'Grille', icon: 'grid-3x3' },
    ];
    el.value = 'list';
    el.label = 'Affichage';
    el.equalWidth = true;
    el.style.width = '260px';
    return el;
  },
};
