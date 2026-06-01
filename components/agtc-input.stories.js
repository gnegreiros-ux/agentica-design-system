import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-input',
  component: 'agtc-input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Patterns UX de référence appliqués (ADR-036, tous approuvés) :',
          '',
          '- **Validation à `onBlur`**, puis re-validation à la frappe une fois le champ en erreur — [NN/g — How to Report Errors in Forms](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Erreur inline** sous le champ + `role="alert"` ; **help text** persistant via `aria-describedby` — [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Required marker** `*` + `aria-required` — [NN/g — Forms](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Forgiving format** (`tel`/`number`) — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '- **Anti hostile patterns** (pas d\'effacement du champ en erreur) — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '',
          'Détail : `guidelines/components/input.md` § PATTERNS UX DE RÉFÉRENCE.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      table: { defaultValue: { summary: 'text' } },
    },
    label:        { control: 'text' },
    value:        { control: 'text' },
    placeholder:  { control: 'text' },
    helperText:   { control: 'text',    name: 'helper-text' },
    errorMessage: { control: 'text',    name: 'error-message' },
    invalid:      { control: 'boolean' },
    disabled:     { control: 'boolean' },
    readonly:     { control: 'boolean' },
    required:     { control: 'boolean' },
    icon:         { control: 'text' },
    iconSuffix:   { control: 'text',    name: 'icon-suffix' },
  },
  args: {
    type: 'text',
    label: 'Adresse e-mail',
    placeholder: 'nom@exemple.com',
    invalid: false,
    disabled: false,
    readonly: false,
    required: false,
  },
  render: (args) => html`
    <div style="max-width:360px;">
      <agtc-input
        type="${args.type}"
        label="${args.label}"
        placeholder="${args.placeholder ?? ''}"
        helper-text="${args.helperText ?? ''}"
        error-message="${args.errorMessage ?? ''}"
        ?invalid="${args.invalid}"
        ?disabled="${args.disabled}"
        ?readonly="${args.readonly}"
        ?required="${args.required}"
        icon="${args.icon ?? ''}"
        icon-suffix="${args.iconSuffix ?? ''}"
      ></agtc-input>
    </div>
  `,
};

// ── États de base ────────────────────────────────────────────────────────────

export const Default = {
  name: 'Default',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input label="Adresse e-mail" placeholder="nom@exemple.com"></agtc-input>
    </div>
  `,
};

export const WithHelperText = {
  name: 'Avec texte d\'aide',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Adresse e-mail"
        placeholder="nom@exemple.com"
        helper-text="Nous ne partageons jamais votre adresse."
      ></agtc-input>
    </div>
  `,
};

export const Required = {
  name: 'Requis',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Adresse e-mail"
        placeholder="nom@exemple.com"
        required
        helper-text="Champ obligatoire."
      ></agtc-input>
    </div>
  `,
};

export const Invalid = {
  name: 'État — Invalid',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Adresse e-mail"
        value="pas-une-adresse"
        invalid
        error-message="Adresse e-mail invalide. Vérifiez le format (ex : nom@domaine.com)."
      ></agtc-input>
    </div>
  `,
};

export const Disabled = {
  name: 'État — Disabled',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Adresse e-mail"
        value="utilisateur@exemple.com"
        disabled
        helper-text="Ce champ ne peut pas être modifié."
      ></agtc-input>
    </div>
  `,
};

export const Readonly = {
  name: 'État — Readonly',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Identifiant"
        value="USR-00142"
        readonly
        helper-text="Identifiant généré automatiquement."
      ></agtc-input>
    </div>
  `,
};

// ── Types ────────────────────────────────────────────────────────────────────

export const Password = {
  name: 'Type — Password (toggle show/hide)',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        type="password"
        label="Mot de passe"
        placeholder="8 caractères minimum"
        helper-text="Utilisez une combinaison de lettres, chiffres et symboles."
      ></agtc-input>
    </div>
  `,
};

export const Search = {
  name: 'Type — Search',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        type="search"
        label="Rechercher"
        placeholder="Composants, tokens, guidelines…"
        icon="search"
      ></agtc-input>
    </div>
  `,
};

export const Number = {
  name: 'Type — Number (sans spinners natifs)',
  render: () => html`
    <div style="max-width:200px;">
      <agtc-input
        type="number"
        label="Quantité"
        placeholder="0"
        helper-text="Valeur entre 1 et 99."
      ></agtc-input>
    </div>
  `,
};

// ── Icônes ───────────────────────────────────────────────────────────────────

export const WithIcons = {
  name: 'Icônes — Prefix et suffix',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:16px;max-width:360px;">
      <agtc-input
        label="Rechercher un utilisateur"
        placeholder="Nom ou e-mail"
        icon="search"
      ></agtc-input>
      <agtc-input
        label="Montant"
        placeholder="0.00"
        icon="euro"
        icon-suffix="trending-up"
        type="number"
      ></agtc-input>
    </div>
  `,
};

export const WithCustomSlot = {
  name: 'Icônes — Slot composition libre',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input label="URL du profil" placeholder="https://">
        <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true"
          style="margin-inline-start:12px;color:#888;flex-shrink:0;">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </agtc-input>
    </div>
  `,
};

// ── Vue d'ensemble ───────────────────────────────────────────────────────────

export const AllStates = {
  name: 'Vue d\'ensemble — tous les états',
  render: () => html`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:760px;">
      <agtc-input label="Default" placeholder="Saisir une valeur"></agtc-input>
      <agtc-input label="Required" placeholder="Saisir une valeur" required helper-text="Champ obligatoire."></agtc-input>
      <agtc-input label="Invalid" value="valeur incorrecte" invalid error-message="Ce champ contient une erreur."></agtc-input>
      <agtc-input label="Disabled" value="Valeur désactivée" disabled></agtc-input>
      <agtc-input label="Readonly" value="Valeur en lecture" readonly helper-text="Non modifiable."></agtc-input>
      <agtc-input label="Password" type="password" placeholder="Mot de passe"></agtc-input>
      <agtc-input label="Avec icône" placeholder="Rechercher…" icon="search"></agtc-input>
      <agtc-input label="Invalid + icône" value="erreur" icon="mail" invalid error-message="Format invalide."></agtc-input>
    </div>
  `,
};
