import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-icon',
  component: 'agtc-icon',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Composant d\'icône basé sur Lucide Icons (ADR-022). Tailles tokenisées `inline`/`control`/`nav`.',
          '',
          'Patterns UX de référence appliqués (ADR-036, tous approuvés) :',
          '',
          '- **Icône + texte** quand le sens n\'est pas universel — [NN/g — icon usability](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Label accessible obligatoire** si l\'icône porte l\'information ; `decorative` → `aria-hidden` — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Signification cohérente et non trompeuse** (même icône = même sens) — [IF — transparence](https://catalogue.projectsbyif.com/)',
          '',
          'Détail : `guidelines/components/icon.md` § PATTERNS UX DE RÉFÉRENCE.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Nom de l\'icône Lucide (kebab-case, ex: `trash-2`)',
    },
    size: {
      control: 'select',
      options: ['inline', 'control', 'nav'],
      table: { defaultValue: { summary: 'control' } },
    },
    label: {
      control: 'text',
      description: 'Texte accessible — requis si l\'icône n\'est pas `decorative`',
    },
    decorative: {
      control: 'boolean',
      description: 'Icône purement ornementale → `aria-hidden="true"`',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    name: 'settings',
    size: 'control',
    label: 'Paramètres',
    decorative: false,
  },
  render: (args) => html`
    <agtc-icon
      name="${args.name}"
      size="${args.size}"
      label="${args.label ?? ''}"
      ?decorative="${args.decorative}"
    ></agtc-icon>
  `,
};

// ── Tailles ────────────────────────────────────────────────────────────────

export const Inline = {
  name: 'Inline — 16px (dans un texte)',
  render: () => html`
    <p style="display:flex;align-items:center;gap:6px;font-size:16px;">
      <agtc-icon name="info" size="inline" decorative></agtc-icon>
      Texte avec une icône inline.
    </p>
  `,
};

export const Control = {
  name: 'Control — 20px (boutons, champs)',
  render: () => html`<agtc-icon name="search" size="control" label="Rechercher"></agtc-icon>`,
};

export const Nav = {
  name: 'Nav — 24px (navigation, emphase)',
  render: () => html`<agtc-icon name="settings" size="nav" label="Paramètres"></agtc-icon>`,
};

export const Sizes = {
  name: 'Tailles — inline / control / nav',
  render: () => html`
    <div style="display:flex;gap:24px;align-items:center;">
      <agtc-icon name="home" size="inline" decorative></agtc-icon>
      <agtc-icon name="home" size="control" decorative></agtc-icon>
      <agtc-icon name="home" size="nav" decorative></agtc-icon>
    </div>
  `,
};

// ── Accessibilité ────────────────────────────────────────────────────────────

export const Semantic = {
  name: 'Sémantique — label requis (WCAG 1.1.1)',
  render: () => html`
    <div style="display:flex;gap:16px;align-items:center;">
      <agtc-icon name="trash-2" size="control" label="Supprimer le fichier"></agtc-icon>
      <agtc-icon name="download" size="control" label="Télécharger"></agtc-icon>
      <agtc-icon name="bell" size="control" label="Notifications"></agtc-icon>
    </div>
  `,
};

export const Decorative = {
  name: 'Décorative — aria-hidden (texte adjacent)',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:8px;">
      <span style="display:flex;align-items:center;gap:6px;">
        <agtc-icon name="check" size="control" decorative></agtc-icon> Enregistré
      </span>
      <span style="display:flex;align-items:center;gap:6px;">
        <agtc-icon name="alert-triangle" size="control" decorative></agtc-icon> Attention requise
      </span>
    </div>
  `,
};

// ── Vue d'ensemble ───────────────────────────────────────────────────────────

export const AllVariants = {
  name: "Vue d'ensemble — tailles et icônes courantes",
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:20px;">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#646464;margin:0 0 8px;">Tailles (inline · control · nav)</p>
        <div style="display:flex;gap:24px;align-items:center;">
          <agtc-icon name="star" size="inline" decorative></agtc-icon>
          <agtc-icon name="star" size="control" decorative></agtc-icon>
          <agtc-icon name="star" size="nav" decorative></agtc-icon>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#646464;margin:0 0 8px;">Icônes courantes (control)</p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;color:#1a1a1a;">
          <agtc-icon name="home" size="control" decorative></agtc-icon>
          <agtc-icon name="search" size="control" decorative></agtc-icon>
          <agtc-icon name="settings" size="control" decorative></agtc-icon>
          <agtc-icon name="user" size="control" decorative></agtc-icon>
          <agtc-icon name="bell" size="control" decorative></agtc-icon>
          <agtc-icon name="download" size="control" decorative></agtc-icon>
          <agtc-icon name="trash-2" size="control" decorative></agtc-icon>
          <agtc-icon name="check" size="control" decorative></agtc-icon>
          <agtc-icon name="x" size="control" decorative></agtc-icon>
          <agtc-icon name="chevron-right" size="control" decorative></agtc-icon>
          <agtc-icon name="info" size="control" decorative></agtc-icon>
          <agtc-icon name="alert-triangle" size="control" decorative></agtc-icon>
        </div>
      </div>
    </div>
  `,
};
