import { html } from 'lit';
import './agtc-radio.js';
import './agtc-radio-group.js';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-radio',
  component: 'agtc-radio-group',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Sélection mutuellement exclusive : un seul choix parmi un ensemble. Forme **ronde**. Toujours dans un `<agtc-radio-group>` qui gère exclusivité, focus roving et navigation au clavier (les `<input radio>` en shadow DOM séparés ne groupent pas nativement).',
          '',
          'Patterns UX de référence appliqués (ADR-036/038, tous approuvés) :',
          '',
          '- **Forme ronde** (le carré = checkbox), **sélection exclusive**, **label cliquable** — [NN/g — checkboxes vs radio](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/)',
          '- **Pré-sélectionner un défaut sensé** (sauf exceptions éthiques/légales) — [NN/g — radio default selection](https://www.nngroup.com/articles/radio-buttons-default-selection/)',
          '- **Cible tactile ≥ 24px** — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '',
          'Détail : `guidelines/components/radio.md` § PATTERNS UX DE RÉFÉRENCE.',
        ].join('\n'),
      },
    },
  },
};

// ── Groupe avec défaut sélectionné ───────────────────────────────────────────

export const Default = {
  name: 'Groupe — défaut sélectionné',
  render: () => html`
    <agtc-radio-group name="plan" value="pro" label="Formule">
      <div style="display:flex;flex-direction:column;gap:10px;">
        <agtc-radio value="free">Gratuit</agtc-radio>
        <agtc-radio value="pro">Pro</agtc-radio>
        <agtc-radio value="team">Équipe</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};

export const NoDefault = {
  name: 'Groupe — sans pré-sélection',
  render: () => html`
    <agtc-radio-group name="ship" label="Livraison">
      <div style="display:flex;flex-direction:column;gap:10px;">
        <agtc-radio value="standard">Standard (3–5 jours)</agtc-radio>
        <agtc-radio value="express">Express (24h)</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};

export const WithDisabled = {
  name: 'Groupe — option désactivée',
  render: () => html`
    <agtc-radio-group name="seat" value="window" label="Siège">
      <div style="display:flex;flex-direction:column;gap:10px;">
        <agtc-radio value="window">Hublot</agtc-radio>
        <agtc-radio value="aisle">Couloir</agtc-radio>
        <agtc-radio value="middle" disabled>Milieu (complet)</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};

// ── États d'un radio isolé (présentation) ────────────────────────────────────

export const States = {
  name: 'États (présentation)',
  render: () => html`
    <agtc-radio-group name="states" value="selected">
      <div style="display:flex;flex-direction:column;gap:10px;">
        <agtc-radio value="default">Non sélectionné</agtc-radio>
        <agtc-radio value="selected">Sélectionné</agtc-radio>
        <agtc-radio value="disabled" disabled>Désactivé</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};
