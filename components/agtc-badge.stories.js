import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-badge',
  component: 'agtc-badge',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036, all approved):',
          '',
          '- **Status not encoded by color alone** — recommended: distinctive icon/label for `danger`/`warning` — [NN/g — indicators](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **`role="status"`** to announce changes to AT — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Consistent semantic mapping** (traffic-light) — [Dashboard](https://dashboarddesignpatterns.github.io/patterns.html)',
          '- **Non-interactive** — wrap in a `<button>` if clickable — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '',
          'Details: `guidelines/components/badge.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
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
    label:    { control: 'text', description: 'aria-label for icon-only' },
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

// ── Variants ─────────────────────────────────────────────────────────────────

export const Neutral = {
  name: 'Neutral — default state',
  render: () => html`<agtc-badge variant="neutral">Draft</agtc-badge>`,
};

export const Brand = {
  name: 'Brand — Agentica identity',
  render: () => html`<agtc-badge variant="brand">Agentica</agtc-badge>`,
};

export const Success = {
  name: 'Success — validated, active',
  render: () => html`<agtc-badge variant="success">Active</agtc-badge>`,
};

export const Warning = {
  name: 'Warning — attention required',
  render: () => html`<agtc-badge variant="warning">Pending</agtc-badge>`,
};

export const Danger = {
  name: 'Danger — error, critical',
  render: () => html`<agtc-badge variant="danger">Error</agtc-badge>`,
};

export const Info = {
  name: 'Info — contextual information',
  render: () => html`<agtc-badge variant="info">New</agtc-badge>`,
};

// ── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes = {
  name: 'Sizes — sm and md',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="brand" size="sm">sm</agtc-badge>
      <agtc-badge variant="brand" size="md">md</agtc-badge>
      <agtc-badge variant="success" size="sm">Active</agtc-badge>
      <agtc-badge variant="success" size="md">Active</agtc-badge>
      <agtc-badge variant="danger" size="sm">Error</agtc-badge>
      <agtc-badge variant="danger" size="md">Error</agtc-badge>
    </div>
  `,
};

// ── Icons ────────────────────────────────────────────────────────────────────

export const WithIcon = {
  name: 'With prefix icon',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);align-items:center;flex-wrap:wrap;">
      <agtc-badge variant="success" icon="check-circle">Validated</agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle">Pending</agtc-badge>
      <agtc-badge variant="danger"  icon="x-circle">Error</agtc-badge>
      <agtc-badge variant="info"    icon="info">New</agtc-badge>
      <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
    </div>
  `,
};

export const IconOnly = {
  name: 'Icon-only (WCAG: label required)',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);align-items:center;">
      <agtc-badge variant="success" icon="check"    icon-only label="Validated"></agtc-badge>
      <agtc-badge variant="warning" icon="alert-triangle" icon-only label="Warning"></agtc-badge>
      <agtc-badge variant="danger"  icon="x"        icon-only label="Error"></agtc-badge>
      <agtc-badge variant="info"    icon="info"     icon-only label="Information"></agtc-badge>
    </div>
  `,
};

// ── Overview ─────────────────────────────────────────────────────────────────

export const AllVariants = {
  name: 'Overview — all variants',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">md — no icon</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral">Draft</agtc-badge>
          <agtc-badge variant="brand">Agentica</agtc-badge>
          <agtc-badge variant="success">Active</agtc-badge>
          <agtc-badge variant="warning">Pending</agtc-badge>
          <agtc-badge variant="danger">Error</agtc-badge>
          <agtc-badge variant="info">New</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">md — with icon</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" icon="file">Draft</agtc-badge>
          <agtc-badge variant="brand"   icon="zap">Agentica</agtc-badge>
          <agtc-badge variant="success" icon="check-circle">Active</agtc-badge>
          <agtc-badge variant="warning" icon="alert-triangle">Pending</agtc-badge>
          <agtc-badge variant="danger"  icon="x-circle">Error</agtc-badge>
          <agtc-badge variant="info"    icon="info">New</agtc-badge>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">sm</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-control-gap);flex-wrap:wrap;align-items:center;">
          <agtc-badge variant="neutral" size="sm">Draft</agtc-badge>
          <agtc-badge variant="brand"   size="sm">Agentica</agtc-badge>
          <agtc-badge variant="success" size="sm">Active</agtc-badge>
          <agtc-badge variant="warning" size="sm">Pending</agtc-badge>
          <agtc-badge variant="danger"  size="sm">Error</agtc-badge>
          <agtc-badge variant="info"    size="sm">New</agtc-badge>
        </div>
      </div>
    </div>
  `,
};
