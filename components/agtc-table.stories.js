import { html } from 'lit';

const TOKEN_COLUMNS = [
  { label: 'Token CSS', align: 'start', width: '46%' },
  { label: 'Référence', align: 'start', width: '34%' },
  { label: 'Valeur',    align: 'end',   width: '20%' },
];

const TOKEN_ROWS = [
  ['--agtc-table-default-header-background', 'semantic.color.background.subtle', '#f0f0f0'],
  ['--agtc-table-default-border',           'semantic.color.border.default',    '#e8e8e8'],
  ['--agtc-table-default-row-hover',        'semantic.color.background.hover',   '#f5f5f5'],
  ['--agtc-table-padding-x',                'primitive.space.3',                 '12px'],
];

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-table',
  component: 'agtc-table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Patterns UX de référence appliqués (ADR-036/040, T1–T10 tous approuvés) :',
          '',
          '- **HTML sémantique + `scope="col"` + `<caption>`** — [Smashing — Table Patterns](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/)',
          '- **Alignement** texte/gauche, numérique/droite ; **séparateurs** (zébrage en option) ; **hover de ligne** ; **en-tête figé** ; 1ʳᵉ colonne = identifiant lisible — [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/)',
          '- **Scroll horizontal + indicateur d’overflow** — [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/)',
          '',
          'Lecture seule. Tri / filtrage / pagination sont **hors périmètre v1** (porte ouverte : l’API `columns`/`rows` les accueillera sans rupture).',
          '',
          'Détail : `guidelines/components/table.md` § PATTERNS UX DE RÉFÉRENCE.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    caption:       { control: 'text' },
    captionHidden: { control: 'boolean', name: 'caption-hidden' },
    striped:       { control: 'boolean' },
    stickyHeader:  { control: 'boolean', name: 'sticky-header' },
    density:       { control: 'select', options: ['compact', 'comfortable'], table: { defaultValue: { summary: 'compact' } } },
  },
  args: {
    caption: 'Tokens du composant table',
    captionHidden: true,
    striped: false,
    stickyHeader: false,
    density: 'compact',
  },
  render: (args) => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = args.caption ?? '';
    el.captionHidden = args.captionHidden;
    el.striped = args.striped;
    el.stickyHeader = args.stickyHeader;
    el.density = args.density;
    return el;
  },
};

// ── Défaut : séparateurs de lignes ───────────────────────────────────────────
export const Default = {
  name: 'Défaut — séparateurs de lignes',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = 'Tokens du composant table';
    el.captionHidden = true;
    return el;
  },
};

// ── Zébrage (T4 option) ───────────────────────────────────────────────────────
export const Striped = {
  name: 'Zébrage (striped)',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = [...TOKEN_ROWS, ...TOKEN_ROWS];
    el.caption = 'Table zébrée';
    el.captionHidden = true;
    el.striped = true;
    return el;
  },
};

// ── Légende visible (T2) ──────────────────────────────────────────────────────
export const WithCaption = {
  name: 'Légende visible',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = [
      { label: 'Échelon', align: 'start' },
      { label: 'Valeur', align: 'end' },
      { label: 'Rôle', align: 'start' },
    ];
    el.rows = [
      ['space-1', '4px', 'Espacement minimal'],
      ['space-2', '8px', 'Contrôles denses'],
      ['space-3', '12px', 'Padding standard'],
    ];
    el.caption = 'Échelle d’espacement primitive';
    return el;
  },
};

// ── Densité confortable (T9) ──────────────────────────────────────────────────
export const Comfortable = {
  name: 'Densité confortable',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = 'Densité confortable';
    el.captionHidden = true;
    el.density = 'comfortable';
    return el;
  },
};
