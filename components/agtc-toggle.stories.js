import { html } from 'lit';
import './agtc-toggle.js';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-toggle',
  component: 'agtc-toggle',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Interrupteur on/off à **effet immédiat** (pas de bouton « Enregistrer »). L\'état est signalé par la **position du curseur** (indicateur non-couleur, WCAG 1.4.1), renforcée par la couleur de la piste.',
          '',
          'Patterns UX de référence appliqués (ADR-036/039, tous approuvés) :',
          '',
          '- **`role="switch"`, effet immédiat, état par position** (pas la couleur seule), **label concis décrivant l\'état « on »** — [NN/g — toggle switch guidelines](https://www.nngroup.com/articles/toggle-switch-guidelines/)',
          '- **Cible tactile ≥ 24px** — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '',
          'À préférer à la checkbox quand le changement s\'applique instantanément. Détail : `guidelines/components/toggle.md`.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Notifications par e-mail',
    checked: false,
    disabled: false,
  },
  render: (args) => html`
    <agtc-toggle
      label="${args.label}"
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
    ></agtc-toggle>
  `,
};

// ── États ────────────────────────────────────────────────────────────────────

export const Off = {
  name: 'Off',
  render: () => html`<agtc-toggle label="Mode sombre"></agtc-toggle>`,
};

export const On = {
  name: 'On',
  render: () => html`<agtc-toggle label="Mode sombre" checked></agtc-toggle>`,
};

export const Disabled = {
  name: 'Disabled — off et on',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:12px;">
      <agtc-toggle label="Synchronisation (indisponible)" disabled></agtc-toggle>
      <agtc-toggle label="Sauvegarde auto (verrouillée)" checked disabled></agtc-toggle>
    </div>
  `,
};

export const States = {
  name: 'Tous les états',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:12px;">
      <agtc-toggle label="Off"></agtc-toggle>
      <agtc-toggle label="On" checked></agtc-toggle>
      <agtc-toggle label="Disabled (off)" disabled></agtc-toggle>
      <agtc-toggle label="Disabled (on)" checked disabled></agtc-toggle>
    </div>
  `,
};

// ── Composition : liste de réglages ──────────────────────────────────────────

export const SettingsList = {
  name: 'Composition — liste de réglages',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:14px;max-width:320px;">
      <agtc-toggle label="Notifications par e-mail" checked></agtc-toggle>
      <agtc-toggle label="Notifications push"></agtc-toggle>
      <agtc-toggle label="Résumé hebdomadaire" checked></agtc-toggle>
    </div>
  `,
};
