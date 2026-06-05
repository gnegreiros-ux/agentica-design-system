import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-link',
  component: 'agtc-link',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Patterns UX de référence appliqués (ADR-036/043, LK1–LK8 tous approuvés) :',
          '',
          '- **Soulignement en texte courant** (distinguable au-delà de la couleur, WCAG 1.4.1) — [NN/g — Visualizing Links](https://www.nngroup.com/articles/guidelines-for-visualizing-links/)',
          '- **Lien externe** : `rel="noopener noreferrer"` + icône + texte masqué « ouvre dans un nouvel onglet » — [WCAG H83](https://www.w3.org/WAI/WCAG21/Techniques/html/H83)',
          '- **Texte descriptif** (jamais « cliquez ici ») — [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/)',
          '',
          'Un lien **navigue** — pour une action, utiliser `agtc-button`.',
          '',
          'Détail : `guidelines/components/link.md` § PATTERNS UX DE RÉFÉRENCE.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    href:      { control: 'text' },
    external:  { control: 'boolean' },
    underline: { control: 'select', options: ['always', 'hover', 'none'], table: { defaultValue: { summary: 'always' } } },
  },
  args: {
    href: '#',
    external: false,
    underline: 'always',
  },
  render: (args) => html`
    <p style="font-family:var(--agtc-semantic-typography-mono-family,system-ui);color:var(--agtc-semantic-color-text-primary)">
      Un paragraphe contenant
      <agtc-link href="${args.href}" ?external="${args.external}" underline="${args.underline}">${args.slotContent ?? 'un lien descriptif'}</agtc-link>
      dans le flux du texte.
    </p>
  `,
};

// ── Inline (défaut, souligné) ─────────────────────────────────────────────────
export const Inline = {
  name: 'Inline — souligné (défaut)',
  render: () => html`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      Consulter la <agtc-link href="#guideline">guideline du composant</agtc-link> pour les détails.
    </p>
  `,
};

// ── Externe (nouvel onglet) ───────────────────────────────────────────────────
export const External = {
  name: 'Externe — nouvel onglet (icône + AT)',
  render: () => html`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      Référence : <agtc-link href="https://www.nngroup.com/articles/guidelines-for-visualizing-links/" external>NN/g — Visualizing Links</agtc-link>.
    </p>
  `,
};

// ── Soulignement au survol (nav/standalone) ───────────────────────────────────
export const UnderlineHover = {
  name: 'Soulignement au survol (nav)',
  render: () => html`
    <div style="display:flex;gap:18px;">
      <agtc-link href="#a" underline="hover">Accueil</agtc-link>
      <agtc-link href="#b" underline="hover">Composants</agtc-link>
      <agtc-link href="#c" underline="hover">Tokens</agtc-link>
    </div>
  `,
};
