import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-card',
  component: 'agtc-card',
  tags: ['autodocs'],
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
        <p style="margin:0;color:#444;">Contenu de la carte.</p>
      </agtc-card>
    </div>
  `,
};

// ── Variantes ────────────────────────────────────────────────────────────────

export const Default = {
  name: 'Default — bord subtil',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card variant="default">
        <p style="margin:0;color:#444;font-size:0.875rem;">Carte standard avec bord gris.</p>
      </agtc-card>
    </div>
  `,
};

export const Elevated = {
  name: 'Elevated — ombre portée',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card variant="elevated">
        <p style="margin:0;color:#444;font-size:0.875rem;">Carte avec ombre — mise en avant, hiérarchie visuelle.</p>
      </agtc-card>
    </div>
  `,
};

export const Flat = {
  name: 'Flat — fond subtil',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card variant="flat">
        <p style="margin:0;color:#444;font-size:0.875rem;">Carte intégrée — fond groupé, pas de bord.</p>
      </agtc-card>
    </div>
  `,
};

// ── Slots header / footer ────────────────────────────────────────────────────

export const WithHeader = {
  name: 'Avec header',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.875rem;">Titre de la carte</strong>
          <agtc-badge variant="success">Actif</agtc-badge>
        </div>
        <p style="margin:0;color:#444;font-size:0.875rem;">Corps de la carte avec contenu principal.</p>
      </agtc-card>
    </div>
  `,
};

export const WithHeaderAndFooter = {
  name: 'Avec header + footer',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card>
        <div slot="header" style="display:flex;align-items:center;gap:8px;">
          <agtc-icon name="user" size="control" style="color:#646464;"></agtc-icon>
          <strong style="font-size:0.875rem;">Profil utilisateur</strong>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;">
          <p style="margin:0;font-size:0.875rem;color:#444;">Guilherme Negreiros</p>
          <p style="margin:0;font-size:0.75rem;color:#646464;">Design System Lead</p>
        </div>

        <div slot="footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <agtc-button variant="ghost">Annuler</agtc-button>
          <agtc-button variant="primary">Enregistrer</agtc-button>
        </div>
      </agtc-card>
    </div>
  `,
};

export const WithFooterOnly = {
  name: 'Avec footer seulement',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-card>
        <p style="margin:0;font-size:0.875rem;color:#444;">
          Confirmer la suppression de cet élément ? Cette action est irréversible.
        </p>
        <div slot="footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <agtc-button variant="secondary">Annuler</agtc-button>
          <agtc-button variant="critical">Supprimer définitivement</agtc-button>
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
        <div style="background:#e0f8f3;padding:12px;font-size:0.75rem;color:#008573;">padding="none" — image pleine largeur</div>
      </agtc-card>
      <agtc-card padding="sm">
        <p style="margin:0;font-size:0.875rem;color:#444;">padding="sm" — compact</p>
      </agtc-card>
      <agtc-card padding="md">
        <p style="margin:0;font-size:0.875rem;color:#444;">padding="md" — défaut</p>
      </agtc-card>
      <agtc-card padding="lg">
        <p style="margin:0;font-size:0.875rem;color:#444;">padding="lg" — spacieux</p>
      </agtc-card>
    </div>
  `,
};

// ── Composition avec autres composants ───────────────────────────────────────

export const ComposedCard = {
  name: 'Composition — badge + input + bouton',
  render: () => html`
    <div style="max-width:400px;">
      <agtc-card variant="elevated">
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:0.9375rem;">Nouvelle connexion</strong>
          <agtc-badge variant="info" icon="shield">Sécurisé</agtc-badge>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;">
          <agtc-input
            type="email"
            label="Adresse e-mail"
            placeholder="nom@exemple.com"
            required
          ></agtc-input>
          <agtc-input
            type="password"
            label="Mot de passe"
            placeholder="8 caractères minimum"
          ></agtc-input>
        </div>

        <div slot="footer" style="display:flex;flex-direction:column;gap:8px;">
          <agtc-button variant="primary" style="width:100%;">Se connecter</agtc-button>
          <agtc-button variant="ghost" style="width:100%;">Mot de passe oublié ?</agtc-button>
        </div>
      </agtc-card>
    </div>
  `,
};

// ── Vue d'ensemble ───────────────────────────────────────────────────────────

export const AllVariants = {
  name: "Vue d'ensemble — toutes les variantes",
  render: () => html`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;max-width:800px;">
      <agtc-card variant="default">
        <div slot="header"><strong style="font-size:0.875rem;">Default</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:#666;">Bord gris standard.</p>
        <div slot="footer"><agtc-badge variant="neutral">Brouillon</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="elevated">
        <div slot="header"><strong style="font-size:0.875rem;">Elevated</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:#666;">Ombre portée douce.</p>
        <div slot="footer"><agtc-badge variant="brand">Agentica</agtc-badge></div>
      </agtc-card>

      <agtc-card variant="flat">
        <div slot="header"><strong style="font-size:0.875rem;">Flat</strong></div>
        <p style="margin:0;font-size:0.8125rem;color:#666;">Fond gris subtil.</p>
        <div slot="footer"><agtc-badge variant="success">Actif</agtc-badge></div>
      </agtc-card>
    </div>
  `,
};
