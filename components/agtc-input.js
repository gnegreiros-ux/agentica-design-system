import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Types : text | email | password | number | search | tel | url
//
// Label obligatoire — jamais utiliser placeholder comme seule étiquette (WCAG 1.3.1).
//
// États :
//   invalid + error-message → bordure rouge + message role=alert
//   disabled                → fond subtle, interactions bloquées
//   readonly                → fond transparent, pas d'édition
//
// Icônes — même approche hybride que agtc-button :
//   icon="name"         → <agtc-icon> prefix via fallback slot
//   icon-suffix="name"  → <agtc-icon> suffix via fallback slot
//   slot[name="prefix"] / slot[name="suffix"] → composition libre
//
// Type password : bouton show/hide intégré (WCAG 1.4.1).
//
// Événements :
//   agtc-input  → { value, name } à chaque frappe
//   agtc-change → { value, name } à la perte de focus
//
// Patterns UX de référence appliqués (ADR-036, tous approuvés) :
//   Validation à onBlur, puis re-validation à la frappe une fois en erreur
//     — NN/g How to Report Errors in Forms : https://www.nngroup.com/articles/design-pattern-guidelines/
//   Erreur inline + role=alert, help text persistant via aria-describedby
//     — NN/g Error-Message Guidelines : https://www.nngroup.com/articles/design-pattern-guidelines/
//   Forgiving format (tel/number) — IxDF : https://ixdf.org/literature/topics/ui-design-patterns
//   Anti hostile patterns (pas d'effacement du champ en erreur)
//   Détail complet : guidelines/components/input.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

let _uid = 0;

class AgtcInput extends LitElement {
  static properties = {
    type:         { type: String },
    name:         { type: String },
    value:        { type: String },
    label:        { type: String },
    placeholder:  { type: String },
    helperText:   { type: String,  attribute: 'helper-text' },
    errorMessage: { type: String,  attribute: 'error-message' },
    invalid:      { type: Boolean, reflect: true },
    disabled:     { type: Boolean, reflect: true },
    readonly:     { type: Boolean, reflect: true },
    required:     { type: Boolean, reflect: true },
    icon:         { type: String },
    iconSuffix:   { type: String,  attribute: 'icon-suffix' },
    maxlength:    { type: Number },
    autocomplete: { type: String },
    _showPassword:{ type: Boolean, state: true },
  };

  constructor() {
    super();
    this.type         = 'text';
    this.value        = '';
    this.invalid      = false;
    this.disabled     = false;
    this.readonly     = false;
    this.required     = false;
    this._showPassword = false;
    this._id          = `agtc-input-${++_uid}`;
    this._helperId    = `${this._id}-helper`;
    this._errorId     = `${this._id}-error`;
  }

  updated() {
    if (!this.label) {
      console.warn('[agtc-input] label manquant — inaccessible (WCAG 1.3.1). Toujours fournir label="Description du champ".');
    }
  }

  _handleInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('agtc-input', {
      bubbles: true,
      composed: true,
      detail: { value: this.value, name: this.name },
    }));
  }

  _handleChange(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('agtc-change', {
      bubbles: true,
      composed: true,
      detail: { value: this.value, name: this.name },
    }));
  }

  _togglePassword() {
    this._showPassword = !this._showPassword;
  }

  _describedBy() {
    const ids = [];
    if (this.helperText) ids.push(this._helperId);
    if (this.invalid && this.errorMessage) ids.push(this._errorId);
    return ids.length ? ids.join(' ') : undefined;
  }

  static styles = css`
    :host {
      display: block;
    }
    :host([disabled]) {
      pointer-events: none;
    }

    /* ── Champ ─────────────────────────────────────────────────────────────── */
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--agtc-semantic-space-control-gap);
    }

    /* ── Label ─────────────────────────────────────────────────────────────── */
    .label {
      display: flex;
      align-items: baseline;
      gap: 3px;
      font-size: var(--agtc-semantic-typography-label-size);
      font-weight: var(--agtc-semantic-typography-label-weight);
      line-height: var(--agtc-semantic-typography-label-line-height);
      color: var(--agtc-semantic-color-text-primary);
    }
    .required-marker {
      color: var(--agtc-semantic-color-feedback-danger);
    }

    /* ── Contrôle (wrapper input) ──────────────────────────────────────────── */
    .control {
      display: flex;
      align-items: center;

      background: var(--agtc-component-input-default-background);
      border: 1.5px solid var(--agtc-component-input-default-border);
      border-radius: var(--agtc-component-input-default-radius);
      transition: border-color 0.12s;
    }

    /* Focus ring sur le wrapper — visible pour clavier et pointeur */
    .control:focus-within {
      border-color: var(--agtc-component-input-default-border-focus);
      outline: 2.5px solid var(--agtc-component-input-default-border-focus);
      outline-offset: 2px;
    }

    :host([invalid]) .control {
      border-color: var(--agtc-component-input-default-border-error);
    }
    :host([invalid]) .control:focus-within {
      border-color: var(--agtc-component-input-default-border-error);
      outline-color: var(--agtc-component-input-default-border-error);
    }

    :host([disabled]) .control {
      background: var(--agtc-semantic-color-background-subtle);
      border-color: var(--agtc-semantic-color-border-default);
    }
    :host([readonly]) .control {
      background: transparent;
    }

    /* ── Slots icônes — transparents au flex layout ────────────────────────── */
    slot[name="prefix"],
    slot[name="suffix"] {
      display: contents;
    }

    /* ── Wrappers icônes fixes ─────────────────────────────────────────────── */
    .icon-prefix,
    .icon-suffix {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-inline-start: var(--agtc-component-input-default-padding-x);
      padding-inline-end: 0;
      color: var(--agtc-semantic-color-text-secondary);
      flex-shrink: 0;
    }
    .icon-suffix {
      padding-inline-start: 0;
      padding-inline-end: var(--agtc-component-input-default-padding-x);
    }

    /* ── Input natif ───────────────────────────────────────────────────────── */
    input {
      flex: 1;
      min-width: 0;

      padding: var(--agtc-component-input-default-padding-y) var(--agtc-component-input-default-padding-x);

      font-family: inherit;
      font-size: var(--agtc-semantic-typography-body-size);
      font-weight: var(--agtc-semantic-typography-body-weight);
      line-height: var(--agtc-semantic-typography-body-line-height);

      color: var(--agtc-component-input-default-text);
      background: transparent;
      border: none;
      outline: none;

      -webkit-appearance: none;
      appearance: none;
    }
    input::placeholder {
      color: var(--agtc-component-input-default-placeholder);
    }
    input:disabled {
      color: var(--agtc-semantic-color-text-disabled);
    }

    /* Supprime les spinners natifs sur number */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
    input[type="number"] { -moz-appearance: textfield; }

    /* ── Bouton show/hide password ─────────────────────────────────────────── */
    .toggle-password {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 var(--agtc-component-input-default-padding-x);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--agtc-semantic-color-text-secondary);
      flex-shrink: 0;
    }
    .toggle-password:focus-visible {
      outline: 2px solid var(--agtc-semantic-color-border-focus);
      outline-offset: 1px;
      border-radius: 2px;
    }

    /* ── Textes d'aide et d'erreur ─────────────────────────────────────────── */
    .helper,
    .error-message {
      font-size: var(--agtc-semantic-typography-label-size);
      line-height: var(--agtc-semantic-typography-label-line-height);
    }
    .helper {
      color: var(--agtc-semantic-color-text-secondary);
    }
    .error-message {
      color: var(--agtc-semantic-color-feedback-danger);
    }
    .error-message:empty {
      display: none;
    }
  `;

  render() {
    const effectiveType = this.type === 'password'
      ? (this._showPassword ? 'text' : 'password')
      : this.type;

    const hasPrefix = this.icon;
    const hasSuffix = this.iconSuffix || this.type === 'password';

    return html`
      <div class="field">

        ${this.label ? html`
          <label class="label" for="${this._id}">
            ${this.label}
            ${this.required ? html`<span class="required-marker" aria-hidden="true">*</span>` : ''}
          </label>
        ` : ''}

        <div class="control">
          <slot name="prefix">
            ${hasPrefix ? html`
              <span class="icon-prefix" aria-hidden="true">
                <agtc-icon name="${this.icon}" size="control"></agtc-icon>
              </span>
            ` : ''}
          </slot>

          <input
            id="${this._id}"
            type="${effectiveType}"
            name="${ifDefined(this.name)}"
            .value="${live(this.value ?? '')}"
            placeholder="${ifDefined(this.placeholder)}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            ?required="${this.required}"
            maxlength="${ifDefined(this.maxlength)}"
            autocomplete="${ifDefined(this.autocomplete)}"
            aria-invalid="${this.invalid ? 'true' : 'false'}"
            aria-required="${this.required ? 'true' : 'false'}"
            aria-describedby="${ifDefined(this._describedBy())}"
            @input="${this._handleInput}"
            @change="${this._handleChange}"
          />

          <slot name="suffix">
            ${this.type === 'password' ? html`
              <button
                type="button"
                class="toggle-password"
                aria-label="${this._showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}"
                @click="${this._togglePassword}"
              >
                <agtc-icon
                  name="${this._showPassword ? 'eye-off' : 'eye'}"
                  size="control"
                  decorative
                ></agtc-icon>
              </button>
            ` : hasSuffix ? html`
              <span class="icon-suffix" aria-hidden="true">
                <agtc-icon name="${this.iconSuffix}" size="control"></agtc-icon>
              </span>
            ` : ''}
          </slot>
        </div>

        ${this.helperText ? html`
          <span id="${this._helperId}" class="helper">${this.helperText}</span>
        ` : ''}

        <span
          id="${this._errorId}"
          class="error-message"
          role="alert"
        >${this.invalid && this.errorMessage ? this.errorMessage : ''}</span>

      </div>
    `;
  }
}

customElements.define('agtc-input', AgtcInput);
export { AgtcInput };
