import { html } from 'lit';

const SAMPLE = `<agtc-badge variant="success" icon="check">Validated</agtc-badge>
<agtc-badge variant="danger" icon="x">Expired</agtc-badge>`;

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-code-block',
  component: 'agtc-code-block',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036/041, CD1–CD9 all approved):',
          '',
          '- **Semantic `<pre><code>` + language** — [DEV — copy code button](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8)',
          '- **Copy button + text feedback** — [roboleary](https://www.roboleary.net/2022/01/13/copy-code-to-clipboard-blog)',
          '- **Success announced to AT** (`role="status"` / `aria-live`) — [Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)',
          '- **Horizontal scroll** for long lines — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '',
          'Read-only. Syntax highlighting and line numbers are **out of scope for v1** (door left open).',
          '',
          'Details: `guidelines/components/code-block.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    language:    { control: 'text' },
    filename:    { control: 'text' },
    copyLabel:   { control: 'text', name: 'copy-label' },
    copiedLabel: { control: 'text', name: 'copied-label' },
  },
  args: {
    language: 'html',
    filename: '',
  },
  render: (args) => html`
    <agtc-code-block
      language="${args.language ?? ''}"
      filename="${args.filename ?? ''}"
      copy-label="${args.copyLabel ?? 'Copy'}"
      copied-label="${args.copiedLabel ?? 'Copied!'}"
    ><code>${SAMPLE}</code></agtc-code-block>
  `,
};

// ── Default ───────────────────────────────────────────────────────────────────
export const Default = {
  name: 'Default — language + copy',
  render: () => html`
    <agtc-code-block language="html"><code>${SAMPLE}</code></agtc-code-block>
  `,
};

// ── With filename (CD8) ───────────────────────────────────────────────────────
export const WithFilename = {
  name: 'With filename',
  render: () => html`
    <agtc-code-block language="javascript" filename="agtc-badge.js"><code>import { LitElement, html } from 'lit';

class AgtcBadge extends LitElement {
  static properties = { variant: { type: String } };
}</code></agtc-code-block>
  `,
};

// ── Long line → horizontal scroll (CD6) ───────────────────────────────────────
export const LongLine = {
  name: 'Long line (horizontal scroll)',
  render: () => html`
    <agtc-code-block language="css"><code>.selector { background: linear-gradient(to right, var(--agtc-component-table-default-header-background), rgba(255,255,255,0)) left / 24px 100% no-repeat; }</code></agtc-code-block>
  `,
};
