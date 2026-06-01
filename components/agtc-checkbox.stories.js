import { html } from 'lit';
import './agtc-checkbox.js';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-checkbox',
  component: 'agtc-checkbox',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Case à cocher pour une sélection binaire indépendante (cocher/décocher, marquer une tâche faite). Forme **carrée** par convention.',
          '',
          'Patterns UX de référence appliqués (ADR-036/037, tous approuvés) :',
          '',
          '- **Checkbox plutôt que toggle** pour un item indépendant — [NN/g — checkbox vs toggle](https://www.nngroup.com/articles/toggle-switch-guidelines/)',
          '- **Forme carrée** (le rond signale un radio) + **label cliquable** (Fitts) + **libellé positif** — [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/)',
          '- **Cible tactile ≥ 24px**, états visibles, **pas de pré-cochage trompeur** — [IxDF — UI patterns](https://ixdf.org/literature/topics/ui-design-patterns)',
          '',
          'Détail : `guidelines/components/checkbox.md` § PATTERNS UX DE RÉFÉRENCE.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Libellé cliquable (formulation positive)' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean', description: 'État partiel — `aria-checked="mixed"`' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Accepter les conditions',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
  },
  render: (args) => html`
    <agtc-checkbox
      label="${args.label}"
      ?checked="${args.checked}"
      ?indeterminate="${args.indeterminate}"
      ?disabled="${args.disabled}"
      ?required="${args.required}"
    ></agtc-checkbox>
  `,
};

// ── États ────────────────────────────────────────────────────────────────────

export const Default = {
  name: 'Default — décochée',
  render: () => html`<agtc-checkbox label="Recevoir la newsletter"></agtc-checkbox>`,
};

export const Checked = {
  name: 'Checked — cochée',
  render: () => html`<agtc-checkbox label="Recevoir la newsletter" checked></agtc-checkbox>`,
};

export const Indeterminate = {
  name: 'Indeterminate — sélection partielle',
  render: () => html`<agtc-checkbox label="Tout sélectionner" indeterminate></agtc-checkbox>`,
};

export const Disabled = {
  name: 'Disabled — décochée et cochée',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:12px;">
      <agtc-checkbox label="Option indisponible" disabled></agtc-checkbox>
      <agtc-checkbox label="Option verrouillée (cochée)" checked disabled></agtc-checkbox>
    </div>
  `,
};

export const States = {
  name: 'Tous les états',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:12px;">
      <agtc-checkbox label="Default (décochée)"></agtc-checkbox>
      <agtc-checkbox label="Checked (cochée)" checked></agtc-checkbox>
      <agtc-checkbox label="Indeterminate (partielle)" indeterminate></agtc-checkbox>
      <agtc-checkbox label="Disabled" disabled></agtc-checkbox>
      <agtc-checkbox label="Disabled + checked" checked disabled></agtc-checkbox>
    </div>
  `,
};

// ── Composition : liste de tâches (réf. ToDo) ────────────────────────────────

export const TaskList = {
  name: 'Composition — liste de tâches',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:10px;max-width:340px;">
      <agtc-checkbox label="Learn Web Components" checked></agtc-checkbox>
      <agtc-checkbox label="Build the design system tokens" checked></agtc-checkbox>
      <agtc-checkbox label="Ship the checkbox component"></agtc-checkbox>
    </div>
  `,
};

// ── Groupe avec parent indéterminé ───────────────────────────────────────────

export const SelectAllGroup = {
  name: 'Groupe — parent indéterminé',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:10px;max-width:340px;">
      <agtc-checkbox label="Tout sélectionner" indeterminate></agtc-checkbox>
      <div style="display:flex;flex-direction:column;gap:8px;padding-inline-start:28px;">
        <agtc-checkbox label="Notifications par e-mail" checked></agtc-checkbox>
        <agtc-checkbox label="Notifications push"></agtc-checkbox>
      </div>
    </div>
  `,
};
