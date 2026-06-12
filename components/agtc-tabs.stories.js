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
          'Patterns UX de référence appliqués (ADR-056, tous approuvés) :',
          '',
          '- **Tablist au-dessus du panel** — [NN/g — Tabs Used Right](https://www.nngroup.com/articles/tabs-used-right/)',
          '- **Activation automatique au focus** (flèches → panel visible sans Enter) — [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)',
          '- **ARIA complet** : `tablist/tab/tabpanel` · `aria-selected` · `aria-controls` · roving tabindex',
          '- **Navigation clavier** : `ArrowLeft/Right` (circulaire) · `Home/End` · `Tab` sort du groupe',
          '- **`:visited` neutralisé** sur les tabs (navigation, ADR-047)',
          '- **`href` optionnel** par tab pour les liens de navigation externe',
          '',
          'Distinct de `agtc-segmented` (réglage à effet immédiat, sans panneau).',
          '',
          'Détail : `guidelines/components/tabs.md` § PATTERNS UX DE RÉFÉRENCE.',
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
      { value: 'overview', label: 'Aperçu' },
      { value: 'tokens',   label: 'Tokens' },
      { value: 'a11y',     label: 'Accessibilité' },
    ];
    el.selected = args.selected;
    el.label = args.label;
    el.activation = args.activation;

    const p1 = document.createElement('div');
    p1.slot = 'overview';
    p1.textContent = 'Contenu du panneau Aperçu.';

    const p2 = document.createElement('div');
    p2.slot = 'tokens';
    p2.textContent = 'Contenu du panneau Tokens.';

    const p3 = document.createElement('div');
    p3.slot = 'a11y';
    p3.textContent = 'Contenu du panneau Accessibilité.';

    el.append(p1, p2, p3);
    el.addEventListener('change', (e) => console.log('change', e.detail));
    return el;
  },
};

// ── Trois onglets in-page ────────────────────────────────────────────────────
export const InPage = {
  name: 'In-page (3 onglets)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Documentation composant';
    el.tabs = [
      { value: 'overview', label: 'Aperçu' },
      { value: 'tokens',   label: 'Tokens' },
      { value: 'a11y',     label: 'Accessibilité' },
    ];

    ['overview', 'tokens', 'a11y'].forEach((v, i) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = `Contenu du panneau « ${ ['Aperçu', 'Tokens', 'Accessibilité'][i] } ».`;
      el.appendChild(div);
    });
    return el;
  },
};

// ── Avec lien externe (href) ─────────────────────────────────────────────────
export const WithHref = {
  name: 'Avec lien externe (href optionnel)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Ressources Button';
    el.tabs = [
      { value: 'overview', label: 'Aperçu' },
      { value: 'tokens',   label: 'Tokens' },
      { value: 'storybook', label: 'Storybook ↗', href: 'https://storybook.js.org' },
    ];

    ['overview', 'tokens'].forEach((v) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = `Contenu du panneau ${v}.`;
      el.appendChild(div);
    });
    return el;
  },
};

// ── Activation manuelle ───────────────────────────────────────────────────────
export const ManualActivation = {
  name: 'Activation manuelle (Enter requis)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Sections (activation manuelle)';
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
      div.textContent = `Contenu de la section ${v.toUpperCase()}. Naviguer avec ←/→ puis appuyer sur Entrée pour activer.`;
      el.appendChild(div);
    });
    return el;
  },
};

// ── Deux onglets (minimum) ───────────────────────────────────────────────────
export const TwoTabs = {
  name: 'Deux onglets (minimum)',
  render: () => {
    const el = document.createElement('agtc-tabs');
    el.label = 'Vue';
    el.tabs = [
      { value: 'list', label: 'Liste' },
      { value: 'grid', label: 'Grille' },
    ];

    ['list', 'grid'].forEach((v) => {
      const div = document.createElement('div');
      div.slot = v;
      div.style.padding = '8px 0';
      div.textContent = `Vue ${v}.`;
      el.appendChild(div);
    });
    return el;
  },
};
