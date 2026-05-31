import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-badge',
  component: 'agtc-badge',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'],
      table: { defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: 'md' } },
    },
    icon:     { control: 'text' },
    iconOnly: { control: 'boolean', name: 'icon-only' },
    label:    { control: 'text', description: 'aria-label pour icon-only' },
  },
  args: {
    variant: 'neutral',
    size: 'md',
  },
  render: (args) => html`
    <agtc-badge
      variant="${args.variant}"
      size="${args.size}"
      icon="${args.icon ?? ''}"
      ?icon-only="${args.iconOnly}"
      label="${args.label ?? ''}"
    >
      ${args.slotContent ?? 'Badge'}
    </agtc-badge>
  `,
};

// ── Variantes ────────────────────────────────────────────────────────────────

export const Neutral = {
  name: 'Neutral — état par défaut',
  render: () => html`<agtc-badge variant="neutral">Brouillon</agtc-badge>`,
};

export const Brand = {
  name: 'Brand — identité Agentica',
  render: () => html`<agtc-badge variant="brand">Agentica</agtc-badge>`,
};

export const Success = {
  name: 'Success — validé, actif',
  render: () => html`<agtc-badge variant="success">Actif</agtc-badge>`,
};

export const Warning = {
  name: 'Warning — attention requise',
  render: () => html`<agtc-badge variant="warning">En attente</agtc-badge>`,
};

export const Danger = {
  name: 'Danger — erreur, critique',
  render: () => html`<agtc-badge variant="danger">Erreur</agtc-badge>`,
};

export const Info = {
  name: 'Info — information contextuelle',
  render: () => html`<agtc-badge variant="info">Nouveau</agtc-badge>`,
};

// ── Tailles ──────────────────────────────────────────────────────────────────

export const Sizes = {
  name: 'Tailles — sm et md',
  render: () => html`
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="brand" size="sm">sm</agtc-badge>
      <agtc-badge variant="brand" size="md">md</agtc-badge>
      <agtc-badge variant="success" size="sm">Actif</agtc-badge>
      <agtc-badge variant="success" size="md">Actif</agtc-badge>
      <agtc-badge variant="danger" size="sm">Erreur</agtc-badge>
      <agtc-badge variant="danger" size="md">Erreur</agtc-badge>
    </div>
  `,
};

// ── Icônes ───────────────────────────────────────────────────────────────────

export const WithIcon = {
  name: 'Avec icône prefix',
  render: () => html`
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="success" icon="check-circle">Validé</agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle">En attente</agtc-badge>
      <agtc-badge variant="danger"  icon="x-circle">Erreur</agtc-badge>
      <agtc-badge variant="info"    icon="info">Nouveau</agtc-badge>
      <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
    </div>
  `,
};

export const IconOnly = {
  name: 'Icon-only (WCAG : label requis)',
  render: () => html`
    <div style="display:flex;gap:8px;align-items:center;">
      <agtc-badge variant="success" icon="check"    icon-only label="Validé"></agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle" icon-only label="Attention"></agtc-badge>
      <agtc-badge variant="danger"  icon="x"        icon-only label="Erreur"></agtc-badge>
      <agtc-badge variant="info"    icon="info"     icon-only label="Information"></agtc-badge>
    </div>
  `,
};

// ── Vue d'ensemble ───────────────────────────────────────────────────────────

export const AllVariants = {
  name: "Vue d'ensemble — toutes les variantes",
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:20px;">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 8px;">md — sans icône</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral">Brouillon</agtc-badge>
          <agtc-badge variant="brand">Agentica</agtc-badge>
          <agtc-badge variant="success">Actif</agtc-badge>
          <agtc-badge variant="warning">En attente</agtc-badge>
          <agtc-badge variant="danger">Erreur</agtc-badge>
          <agtc-badge variant="info">Nouveau</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 8px;">md — avec icône</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" icon="file">Brouillon</agtc-badge>
          <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
          <agtc-badge variant="success" icon="check-circle">Actif</agtc-badge>
          <agtc-badge variant="warning" icon="alert-triangle">En attente</agtc-badge>
          <agtc-badge variant="danger"  icon="x-circle">Erreur</agtc-badge>
          <agtc-badge variant="info"    icon="info">Nouveau</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 8px;">sm</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" size="sm">Brouillon</agtc-badge>
          <agtc-badge variant="brand"   size="sm">Agentica</agtc-badge>
          <agtc-badge variant="success" size="sm">Actif</agtc-badge>
          <agtc-badge variant="warning" size="sm">En attente</agtc-badge>
          <agtc-badge variant="danger"  size="sm">Erreur</agtc-badge>
          <agtc-badge variant="info"    size="sm">Nouveau</agtc-badge>
        </div>
      </div>
    </div>
  `,
};
