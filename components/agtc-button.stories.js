import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-button',
  component: 'agtc-button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Patterns UX de référence appliqués (ADR-036, tous approuvés) :',
          '',
          '- **Une seule action primaire** par contexte — [IxDF — clear primary action](https://ixdf.org/literature/topics/ui-design-patterns)',
          '- **Confirmation explicite** pour `critical` — [NN/g — error prevention](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Largeur préservée** pendant le `loading` — [Smashing](https://www.smashingmagazine.com/category/design-patterns/)',
          '- **Ne jamais désactiver sans indiquer la raison** (`disabled` motivé plutôt que masquer) — [Smashing — hidden vs disabled](https://www.smashingmagazine.com/category/design-patterns/)',
          '- **Libellé décrivant la conséquence** (pas « OK ») — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '',
          'Détail : `guidelines/components/button.md` § PATTERNS UX DE RÉFÉRENCE.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'critical'],
      description: 'Variante visuelle — définit la hiérarchie et l\'intention de l\'action.',
      table: { defaultValue: { summary: 'primary' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive toute interaction. Préserver la largeur visuelle.',
    },
    loading: {
      control: 'boolean',
      description: 'État asynchrone — spinner visible, largeur préservée, aria-busy=true.',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Padding carré. Requiert label="" pour WCAG 1.1.1.',
      name: 'icon-only',
    },
    icon: {
      control: 'text',
      description: 'Nom de l\'icône en prefix (via <agtc-icon>).',
    },
    iconSuffix: {
      control: 'text',
      description: 'Nom de l\'icône en suffix (via <agtc-icon>).',
      name: 'icon-suffix',
    },
    label: {
      control: 'text',
      description: 'aria-label pour les boutons icon-only. Obligatoire si icon-only=true.',
    },
  },
  args: {
    variant: 'primary',
    disabled: false,
    loading: false,
  },
  render: (args) => html`
    <agtc-button
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?icon-only="${args.iconOnly}"
      icon="${args.icon || ''}"
      icon-suffix="${args.iconSuffix || ''}"
      label="${args.label || ''}"
    >
      ${args.slotContent ?? 'Soumettre'}
    </agtc-button>
  `,
};

// ── Variantes de base ────────────────────────────────────────────────────────

export const Primary = {
  name: 'Primary — action principale',
  args: { variant: 'primary' },
  render: () => html`<agtc-button variant="primary">Soumettre</agtc-button>`,
};

export const Secondary = {
  name: 'Secondary — action alternative',
  args: { variant: 'secondary' },
  render: () => html`<agtc-button variant="secondary">Annuler</agtc-button>`,
};

export const Ghost = {
  name: 'Ghost — action tertiaire',
  args: { variant: 'ghost' },
  render: () => html`<agtc-button variant="ghost">En savoir plus</agtc-button>`,
};

export const Critical = {
  name: 'Critical — action irréversible',
  args: { variant: 'critical' },
  render: () => html`<agtc-button variant="critical">Supprimer définitivement</agtc-button>`,
};

// ── États ────────────────────────────────────────────────────────────────────

export const Disabled = {
  name: 'États — Disabled (toutes variantes)',
  render: () => html`
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" disabled>Soumettre</agtc-button>
      <agtc-button variant="secondary" disabled>Annuler</agtc-button>
      <agtc-button variant="ghost" disabled>En savoir plus</agtc-button>
      <agtc-button variant="critical" disabled>Supprimer définitivement</agtc-button>
    </div>
  `,
};

export const Loading = {
  name: 'États — Loading (toutes variantes)',
  render: () => html`
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" loading>Soumettre</agtc-button>
      <agtc-button variant="secondary" loading>Annuler</agtc-button>
      <agtc-button variant="ghost" loading>En savoir plus</agtc-button>
      <agtc-button variant="critical" loading>Supprimer définitivement</agtc-button>
    </div>
  `,
};

// ── Comportement critical ────────────────────────────────────────────────────

export const CriticalConfirmFlow = {
  name: 'Critical — flux de confirmation (2 clics)',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
      <p style="font-size:0.875rem;color:#666;margin:0;">
        1er clic → "Confirmer ?" · 2e clic → action · Escape ou blur → reset
      </p>
      <agtc-button variant="critical">Supprimer définitivement le dossier</agtc-button>
    </div>
  `,
};

// ── Icônes ───────────────────────────────────────────────────────────────────

export const WithIconPrefix = {
  name: 'Icônes — Prefix (slot property)',
  render: () => html`
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon="plus">Ajouter</agtc-button>
      <agtc-button variant="secondary" icon="arrow-left">Retour</agtc-button>
      <agtc-button variant="ghost" icon="info">Détails</agtc-button>
    </div>
  `,
};

export const WithIconSuffix = {
  name: 'Icônes — Suffix (slot property)',
  render: () => html`
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon-suffix="arrow-right">Suivant</agtc-button>
      <agtc-button variant="secondary" icon-suffix="external-link">Voir</agtc-button>
    </div>
  `,
};

export const WithCustomSlot = {
  name: 'Icônes — Slot composition libre (SVG custom)',
  render: () => html`
    <agtc-button variant="primary">
      <svg slot="prefix" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3Zm0 2a1 1 0 0 0-1 1v2H5a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0V10h2a1 1 0 0 0 0-2H9V8a1 1 0 0 0-1-1Z"/>
      </svg>
      Créer
    </agtc-button>
  `,
};

// ── Toutes variantes côte à côte ─────────────────────────────────────────────

export const AllVariants = {
  name: 'Vue d\'ensemble — toutes les variantes',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:24px;">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 10px;">Default</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary">Primary</agtc-button>
          <agtc-button variant="secondary">Secondary</agtc-button>
          <agtc-button variant="ghost">Ghost</agtc-button>
          <agtc-button variant="critical">Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 10px;">Disabled</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" disabled>Primary</agtc-button>
          <agtc-button variant="secondary" disabled>Secondary</agtc-button>
          <agtc-button variant="ghost" disabled>Ghost</agtc-button>
          <agtc-button variant="critical" disabled>Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 10px;">Loading</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" loading>Primary</agtc-button>
          <agtc-button variant="secondary" loading>Secondary</agtc-button>
          <agtc-button variant="ghost" loading>Ghost</agtc-button>
          <agtc-button variant="critical" loading>Critical</agtc-button>
        </div>
      </div>
    </div>
  `,
};
