import { html } from 'lit';

const SAMPLE = `<agtc-badge variant="success" icon="check">Validé</agtc-badge>
<agtc-badge variant="danger" icon="x">Expiré</agtc-badge>`;

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-code-block',
  component: 'agtc-code-block',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Patterns UX de référence appliqués (ADR-036/041, CD1–CD9 tous approuvés) :',
          '',
          '- **`<pre><code>` sémantique + langue** — [DEV — copy code button](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8)',
          '- **Bouton copier + feedback texte** — [roboleary](https://www.roboleary.net/2022/01/13/copy-code-to-clipboard-blog)',
          '- **Succès annoncé aux AT** (`role="status"` / `aria-live`) — [Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)',
          '- **Scroll horizontal** pour lignes longues — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '',
          'Lecture seule. Coloration syntaxique et numéros de ligne sont **hors v1** (porte ouverte).',
          '',
          'Détail : `guidelines/components/code-block.md` § PATTERNS UX DE RÉFÉRENCE.',
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
      copy-label="${args.copyLabel ?? 'Copier'}"
      copied-label="${args.copiedLabel ?? 'Copié !'}"
    ><code>${SAMPLE}</code></agtc-code-block>
  `,
};

// ── Défaut ────────────────────────────────────────────────────────────────────
export const Default = {
  name: 'Défaut — langue + copier',
  render: () => html`
    <agtc-code-block language="html"><code>${SAMPLE}</code></agtc-code-block>
  `,
};

// ── Avec nom de fichier (CD8) ─────────────────────────────────────────────────
export const WithFilename = {
  name: 'Avec nom de fichier',
  render: () => html`
    <agtc-code-block language="javascript" filename="agtc-badge.js"><code>import { LitElement, html } from 'lit';

class AgtcBadge extends LitElement {
  static properties = { variant: { type: String } };
}</code></agtc-code-block>
  `,
};

// ── Ligne longue → scroll horizontal (CD6) ────────────────────────────────────
export const LongLine = {
  name: 'Ligne longue (scroll horizontal)',
  render: () => html`
    <agtc-code-block language="css"><code>.selector { background: linear-gradient(to right, var(--agtc-component-table-default-header-background), rgba(255,255,255,0)) left / 24px 100% no-repeat; }</code></agtc-code-block>
  `,
};
