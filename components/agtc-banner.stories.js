import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-banner',
  component: 'agtc-banner',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036/042, N1–N9 all approved):',
          '',
          '- **Semantic variants + meaning never by color alone** (icon + severity prefix hidden for AT) — [NN/g — Indicators, Validations & Notifications](https://www.nngroup.com/articles/indicators-validations-notifications/)',
          '- **Static by default**; opt-in `live="polite|assertive"` (role=status/alert) for dynamic usage — [MDN — alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role)',
          '- **Accessible close button** without focus trap — [A11Y Collective](https://www.a11y-collective.com/blog/aria-alert/)',
          '',
          'Contextual **inline** message — not a toast nor a modal.',
          '',
          'Details: `guidelines/components/banner.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'brand', 'info', 'success', 'warning', 'danger'],
      table: { defaultValue: { summary: 'info' } },
    },
    heading:     { control: 'text' },
    icon:        { control: 'text' },
    noIcon:      { control: 'boolean', name: 'no-icon' },
    dismissible: { control: 'boolean' },
    live:        { control: 'select', options: ['off', 'polite', 'assertive'] },
  },
  args: {
    variant: 'info',
    heading: 'Information',
    dismissible: false,
    live: 'off',
  },
  render: (args) => html`
    <agtc-banner
      variant="${args.variant}"
      heading="${args.heading ?? ''}"
      icon="${args.icon ?? ''}"
      ?no-icon="${args.noIcon}"
      ?dismissible="${args.dismissible}"
      live="${args.live ?? 'off'}"
    >${args.slotContent ?? 'Contextual message displayed in the page flow.'}</agtc-banner>
  `,
};

// ── Variants ──────────────────────────────────────────────────────────────────
export const Info = {
  name: 'Info (default)',
  render: () => html`<agtc-banner variant="info" heading="Information">This component is read-only.</agtc-banner>`,
};
export const Success = {
  name: 'Success',
  render: () => html`<agtc-banner variant="success" heading="Saved">Your changes have been saved.</agtc-banner>`,
};
export const Warning = {
  name: 'Warning',
  render: () => html`<agtc-banner variant="warning" heading="Warning">This action will affect 3 linked files.</agtc-banner>`,
};
export const Danger = {
  name: 'Danger',
  render: () => html`<agtc-banner variant="danger" heading="Error">Unable to reach the server.</agtc-banner>`,
};

// ── With actions + dismissible (N6/N7) ────────────────────────────────────────
export const WithActions = {
  name: 'With actions + dismissible',
  render: () => html`
    <agtc-banner variant="brand" heading="Contribute to this project" dismissible
      @dismiss="${(e) => console.log('dismissed', e)}">
      This system is open to contributions.
      <span slot="actions"><a href="#" style="color:var(--agtc-semantic-color-action-primary)">View on GitHub →</a></span>
    </agtc-banner>
  `,
};

// ── Overview ──────────────────────────────────────────────────────────────────
export const AllVariants = {
  name: 'Overview — all variants',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:4px;">
      <agtc-banner variant="neutral" heading="Neutral">Neutral message.</agtc-banner>
      <agtc-banner variant="brand" heading="Agentica">Brand highlight.</agtc-banner>
      <agtc-banner variant="info" heading="Information">Contextual help.</agtc-banner>
      <agtc-banner variant="success" heading="Success">Operation completed.</agtc-banner>
      <agtc-banner variant="warning" heading="Warning">Verification required.</agtc-banner>
      <agtc-banner variant="danger" heading="Error">Something went wrong.</agtc-banner>
    </div>
  `,
};
