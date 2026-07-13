import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-card',
  component: 'agtc-card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036; C1/C3/C4 approved, C2 revised):',
          '',
          '- **Clustering** of related content — [Dashboard — grouped layout](https://dashboarddesignpatterns.github.io/patterns.html)',
          '- **Clickable card (C2 revised)**: 1 destination → wrapping link; ≥ 2 distinct actions → primary link as `::after` overlay + buttons above, or non-interactive container. **Never nested interactive elements** — [Smashing — clickable cards](https://www.smashingmagazine.com/category/design-patterns/)',
          '- **Hierarchy via elevation/shadow**, not via color alone — [Dashboard — composition](https://dashboarddesignpatterns.github.io/patterns.html)',
          '- **Detail-on-demand**: the card summarizes, details open elsewhere — [Dashboard — screenspace](https://dashboarddesignpatterns.github.io/patterns.html)',
          '',
          'Details: `guidelines/components/card.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'flat'],
      table: { defaultValue: { summary: 'default' } },
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
  },
  args: { variant: 'default', padding: 'md' },
  render: (args) => html`
    <div style="max-width:360px;">
      <agtc-card variant="${args.variant}" padding="${args.padding}">
        <p style="margin:0;color:#444;">Card content.</p>
      </agtc-card>
    </div>
  `,
};

// ── Variants ─────────────────────────────────────────────────────────────────

export const Default = {
  name: 'Default — subtle border',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card variant="default">
        <p style="margin:0;color:#444;font-size:0.875rem;">Standard card with a gray border.</p>
      </agtc-card>
    </div>
  `,
};

export const Elevated = {
  name: 'Elevated — drop shadow',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card variant="elevated">
        <p style="margin:0;color:#444;font-size:0.875rem;">Card with a shadow — emphasis, visual hierarchy.</p>
      </agtc-card>
    </div>
  `,
};

export const Flat = {
  name: 'Flat — subtle background',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card variant="flat">
        <p style="margin:0;color:#444;font-size:0.875rem;">Embedded card — grouped background, no border.</p>
      </agtc-card>
    </div>
  `,
};

// ── Header / footer slots ────────────────────────────────────────────────────

export const WithHeader = {
  name: 'With header',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.875rem;">Card title</strong>
          <agtc-badge variant="success">Active</agtc-badge>
        </div>
        <p style="margin:0;color:#444;font-size:0.875rem;">Card body with the main content.</p>
      </agtc-card>
    </div>
  `,
};

export const WithHeaderAndFooter = {
  name: 'With header + footer',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;gap:8px;">
          <agtc-icon name="user" size="control" style="color:#646464;"></agtc-icon>
          <strong style="font-size:0.875rem;">User profile</strong>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;">
          <p style="margin:0;font-size:0.875rem;color:#444;">Guilherme Negreiros</p>
          <p style="margin:0;font-size:0.75rem;color:#646464;">Design System Lead</p>
        </div>

        <div slot="footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <agtc-button variant="ghost">Cancel</agtc-button>
          <agtc-button variant="primary">Save</agtc-button>
        </div>
      </agtc-card>
    </div>
  `,
};

export const WithFooterOnly = {
  name: 'With footer only',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card>
        <p style="margin:0;font-size:0.875rem;color:#444;">
          Confirm deleting this item? This action is irreversible.
        </p>
        <div slot="footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <agtc-button variant="secondary">Cancel</agtc-button>
          <agtc-button variant="critical">Permanently delete</agtc-button>
        </div>
      </agtc-card>
    </div>
  `,
};

// ── Padding ──────────────────────────────────────────────────────────────────

export const PaddingVariants = {
  name: 'Padding — none / sm / md / lg',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:16px;max-width:360px;">
      <agtc-card padding="none">
        <div style="background:#e0f8f3;padding:12px;font-size:0.75rem;color:#008573;">padding="none" — full-width image</div>
      </agtc-card>
      <agtc-card padding="sm">
        <p style="margin:0;font-size:0.875rem;color:#444;">padding="sm" — compact</p>
      </agtc-card>
      <agtc-card padding="md">
        <p style="margin:0;font-size:0.875rem;color:#444;">padding="md" — default</p>
      </agtc-card>
      <agtc-card padding="lg">
        <p style="margin:0;font-size:0.875rem;color:#444;">padding="lg" — spacious</p>
      </agtc-card>
    </div>
  `,
};

// ── Composition with other components ────────────────────────────────────────

export const ComposedCard = {
  name: 'Composition — badge + input + button',
  render: () => html`
    <div style="max-width:400px;">
      <agtc-card variant="elevated">
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.9375rem;">New sign-in</strong>
          <agtc-badge variant="info" icon="shield">Secure</agtc-badge>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;">
          <agtc-input
            type="email"
            label="Email address"
            placeholder="name@example.com"
            required
          ></agtc-input>
          <agtc-input
            type="password"
            label="Password"
            placeholder="8 characters minimum"
          ></agtc-input>
        </div>

        <div slot="footer" style="display:flex;flex-direction:column;gap:8px;">
          <agtc-button variant="primary" style="width:100%;">Sign in</agtc-button>
          <agtc-button variant="ghost" style="width:100%;">Forgot password?</agtc-button>
        </div>
      </agtc-card>
    </div>
  `,
};

// ── Overview ─────────────────────────────────────────────────────────────────

export const AllVariants = {
  name: 'Overview — all variants',
  render: () => html`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;max-width:800px;">
      <agtc-card variant="default">
        <div slot="header"><strong style="font-size:0.875rem;">Default</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:#666;">Standard gray border.</p>
        <div slot="footer"><agtc-badge variant="neutral">Draft</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="elevated">
        <div slot="header"><strong style="font-size:0.875rem;">Elevated</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:#666;">Soft drop shadow.</p>
        <div slot="footer"><agtc-badge variant="brand">Agentica</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="flat">
        <div slot="header"><strong style="font-size:0.875rem;">Flat</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:#666;">Subtle gray background.</p>
        <div slot="footer"><agtc-badge variant="success">Active</agtc-badge></div>
      </agtc-card>
    </div>
  `,
};
