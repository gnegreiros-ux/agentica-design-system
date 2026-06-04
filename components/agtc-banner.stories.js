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
          'Patterns UX de référence appliqués (ADR-036/042, N1–N9 tous approuvés) :',
          '',
          '- **Variantes sémantiques + sens jamais par la couleur seule** (icône + préfixe de sévérité masqué pour AT) — [NN/g — Indicators, Validations & Notifications](https://www.nngroup.com/articles/indicators-validations-notifications/)',
          '- **Statique par défaut** ; opt-in `live="polite|assertive"` (role=status/alert) pour le dynamique — [MDN — alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role)',
          '- **Bouton fermer accessible** sans piège de focus — [A11Y Collective](https://www.a11y-collective.com/blog/aria-alert/)',
          '',
          'Message **inline** contextuel — pas un toast ni une modale.',
          '',
          'Détail : `guidelines/components/banner.md` § PATTERNS UX DE RÉFÉRENCE.',
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
    >${args.slotContent ?? 'Message contextuel affiché dans le flux de la page.'}</agtc-banner>
  `,
};

// ── Variantes ─────────────────────────────────────────────────────────────────
export const Info = {
  name: 'Info (défaut)',
  render: () => html`<agtc-banner variant="info" heading="Information">Ce composant est en lecture seule.</agtc-banner>`,
};
export const Success = {
  name: 'Success',
  render: () => html`<agtc-banner variant="success" heading="Enregistré">Vos modifications ont été sauvegardées.</agtc-banner>`,
};
export const Warning = {
  name: 'Warning',
  render: () => html`<agtc-banner variant="warning" heading="Attention">Cette action affectera 3 fichiers liés.</agtc-banner>`,
};
export const Danger = {
  name: 'Danger',
  render: () => html`<agtc-banner variant="danger" heading="Erreur">Impossible de contacter le serveur.</agtc-banner>`,
};

// ── Avec actions + dismissible (N6/N7) ────────────────────────────────────────
export const WithActions = {
  name: 'Avec actions + dismissible',
  render: () => html`
    <agtc-banner variant="brand" heading="Contribuer à ce projet" dismissible
      @dismiss="${(e) => console.log('dismissed', e)}">
      Ce système est ouvert aux contributions.
      <span slot="actions"><a href="#" style="color:var(--agtc-semantic-color-action-primary)">Voir sur GitHub →</a></span>
    </agtc-banner>
  `,
};

// ── Vue d'ensemble ────────────────────────────────────────────────────────────
export const AllVariants = {
  name: "Vue d'ensemble — toutes les variantes",
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:4px;">
      <agtc-banner variant="neutral" heading="Neutre">Message neutre.</agtc-banner>
      <agtc-banner variant="brand" heading="Agentica">Highlight de marque.</agtc-banner>
      <agtc-banner variant="info" heading="Information">Aide contextuelle.</agtc-banner>
      <agtc-banner variant="success" heading="Succès">Opération réussie.</agtc-banner>
      <agtc-banner variant="warning" heading="Attention">Vérification requise.</agtc-banner>
      <agtc-banner variant="danger" heading="Erreur">Quelque chose a échoué.</agtc-banner>
    </div>
  `,
};
