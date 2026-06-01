import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Variantes : primary | secondary | ghost | critical
//
// Icônes — approche hybride (propriété + slot, slot a la priorité) :
//   icon="name"         → <agtc-icon> en prefix via fallback slot
//   icon-suffix="name"  → <agtc-icon> en suffix via fallback slot
//   slot[name="prefix"] → composition libre (SVG custom, etc.)
//   slot[name="suffix"] → idem
//   icon-only           → padding carré, label="" requis (WCAG 1.1.1)
//
// La propriété active Figma Code Connect et les frameworks (React…).
// Le slot reste disponible pour la composition avancée.
//
// Patterns UX de référence appliqués (ADR-036, tous approuvés) :
//   Une seule action primaire par contexte — IxDF : https://ixdf.org/literature/topics/ui-design-patterns
//   Confirmation explicite pour critical — NN/g error prevention
//   Largeur préservée pendant loading (pas de saut de layout) — Smashing
//   Ne jamais désactiver sans indiquer la raison (disabled motivé > masquer)
//     — Smashing hidden vs disabled : https://www.smashingmagazine.com/category/design-patterns/
//   Libellé décrivant la conséquence — NN/g : https://www.nngroup.com/articles/design-pattern-guidelines/
//   Détail : guidelines/components/button.md § PATTERNS UX DE RÉFÉRENCE
// Prérequis : agtc-icon doit être enregistré par le consommateur.
//
// Règle critical : deux clics requis (confirmation explicite).
//   - 1er clic → état confirming, event agtc-confirm-request
//   - 2e clic  → action confirmée, events agtc-confirm + agtc-click
//   - blur ou Escape → reset automatique
// Largeur préservée pendant le loading (.content visibility:hidden, icônes incluses).
// ────────────────────────────────────────────────────────────────────────────

class AgtcButton extends LitElement {
  static properties = {
    variant:      { type: String,  reflect: true },
    disabled:     { type: Boolean, reflect: true },
    loading:      { type: Boolean, reflect: true },
    iconOnly:     { type: Boolean, reflect: true, attribute: 'icon-only' },
    icon:         { type: String },
    iconSuffix:   { type: String,  attribute: 'icon-suffix' },
    type:         { type: String },
    label:        { type: String },
    loadingLabel: { type: String,  attribute: 'loading-label' },
    _confirming:  { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.variant      = 'primary';
    this.disabled     = false;
    this.loading      = false;
    this.iconOnly     = false;
    this.icon         = undefined;
    this.iconSuffix   = undefined;
    this.type         = 'button';
    this.label        = undefined;
    this.loadingLabel = 'En cours…';
    this._confirming  = false;
    this._confirmTimer = null;
  }

  updated() {
    if (this.iconOnly && !this.label) {
      console.warn('[agtc-button] icon-only sans label="" — inaccessible (WCAG 1.1.1). Ajouter label="Description de l\'action".');
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimer();
  }

  _clearTimer() {
    clearTimeout(this._confirmTimer);
    this._confirmTimer = null;
  }

  _handleClick() {
    if (this.disabled || this.loading) return;

    if (this.variant === 'critical') {
      if (!this._confirming) {
        this._confirming = true;
        this._confirmTimer = setTimeout(() => { this._confirming = false; }, 3000);
        this.dispatchEvent(new CustomEvent('agtc-confirm-request', { bubbles: true, composed: true }));
        return;
      }
      this._clearTimer();
      this._confirming = false;
    }

    this.dispatchEvent(new CustomEvent('agtc-click', {
      bubbles: true,
      composed: true,
      detail: { variant: this.variant },
    }));

    if (this.variant === 'critical') {
      this.dispatchEvent(new CustomEvent('agtc-confirm', { bubbles: true, composed: true }));
    }
  }

  _resetConfirm() {
    if (this._confirming) {
      this._clearTimer();
      this._confirming = false;
    }
  }

  static styles = css`
    :host {
      display: inline-flex;
    }
    :host([disabled]) {
      pointer-events: none;
    }

    /* ── Base ──────────────────────────────────────────────────────────────── */
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--agtc-semantic-space-control-gap);
      position: relative;

      padding: var(--agtc-button-primary-padding-y) var(--agtc-button-primary-padding-x);
      border-radius: var(--agtc-button-primary-radius);

      font-family: inherit;
      font-size: var(--agtc-semantic-typography-label-size);
      font-weight: var(--agtc-semantic-typography-label-weight);
      line-height: var(--agtc-semantic-typography-label-line-height);
      white-space: nowrap;
      letter-spacing: 0.01em;

      border: 1.5px solid transparent;
      cursor: pointer;
      transition: background 0.12s, color 0.12s, border-color 0.12s;
      user-select: none;
    }

    /* ── Icon slots — transparents au flex layout ──────────────────────────── */
    /* display:contents permet aux éléments slottés d'être des flex items directs.
       Un slot vide ne génère pas d'espace ni de gap superflu. */
    slot[name="prefix"],
    slot[name="suffix"] {
      display: contents;
    }

    /* ── Icon-only — padding carré ─────────────────────────────────────────── */
    button.icon-only {
      padding: var(--agtc-button-primary-padding-y);
    }

    /* ── Focus — non négociable ────────────────────────────────────────────── */
    button:focus-visible {
      outline: 2.5px solid var(--agtc-semantic-color-border-focus);
      outline-offset: 2px;
    }
    button:focus:not(:focus-visible) {
      outline: none;
    }

    /* ── Primary ───────────────────────────────────────────────────────────── */
    button.primary {
      background: var(--agtc-button-primary-background);
      color: var(--agtc-button-primary-text);
    }
    button.primary:not(:disabled):hover {
      background: var(--agtc-button-primary-background-hover);
    }

    /* ── Secondary ─────────────────────────────────────────────────────────── */
    button.secondary {
      background: var(--agtc-button-secondary-background);
      color: var(--agtc-button-secondary-text);
      border-color: var(--agtc-button-secondary-border);
    }
    button.secondary:not(:disabled):hover {
      background: var(--agtc-button-secondary-background-hover);
    }

    /* ── Ghost ─────────────────────────────────────────────────────────────── */
    button.ghost {
      background: var(--agtc-button-ghost-background);
      color: var(--agtc-button-ghost-text);
    }
    button.ghost:not(:disabled):hover {
      background: var(--agtc-button-ghost-background-hover);
    }

    /* ── Critical ──────────────────────────────────────────────────────────── */
    button.critical {
      background: var(--agtc-button-critical-background);
      color: var(--agtc-button-critical-text);
      border-color: var(--agtc-button-critical-border);
    }
    button.critical:not(:disabled):hover {
      background: var(--agtc-button-critical-background-hover);
      color: var(--agtc-button-critical-background);
    }
    button.critical.confirming,
    button.critical.confirming:not(:disabled):hover {
      background: var(--agtc-button-critical-background);
      color: var(--agtc-button-critical-text);
      border-color: var(--agtc-button-critical-border);
      animation: pulse 0.25s ease-out;
    }

    /* ── Disabled ──────────────────────────────────────────────────────────── */
    button.primary:disabled,
    button.critical:disabled {
      background: var(--agtc-button-primary-background-disabled);
      color: var(--agtc-semantic-color-text-disabled);
      border-color: transparent;
      cursor: not-allowed;
    }
    button.secondary:disabled,
    button.ghost:disabled {
      background: transparent;
      color: var(--agtc-semantic-color-text-disabled);
      border-color: var(--agtc-semantic-color-border-default);
      cursor: not-allowed;
    }

    /* ── Loading ───────────────────────────────────────────────────────────── */
    button.loading {
      cursor: wait;
    }

    /* .content est display:contents — transparent au layout.
       visibility:hidden se propage aux enfants via héritage CSS,
       les cache visuellement ET de l'arbre d'accessibilité tout en
       préservant leurs boîtes flex (largeur du bouton stable). */
    .content {
      display: contents;
    }
    button.loading .content {
      visibility: hidden;
    }

    /* .label est display:contents — le texte devient flex item direct */
    .label {
      display: contents;
    }

    .spinner {
      position: absolute;
      inset: 0;
      margin: auto;
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      display: none;
    }
    button.loading .spinner {
      display: block;
      animation: spin 0.65s linear infinite;
    }

    /* Visible uniquement pour les lecteurs d'écran */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* ── Animations ────────────────────────────────────────────────────────── */
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.04); }
      100% { transform: scale(1); }
    }
  `;

  render() {
    const busy = this.loading;
    const off  = this.disabled || busy;
    const cls  = [
      this.variant || 'primary',
      busy             ? 'loading'    : '',
      this._confirming ? 'confirming' : '',
      this.iconOnly    ? 'icon-only'  : '',
    ].filter(Boolean).join(' ');

    // Pour icon-only : aria-label bascule vers loadingLabel pendant le chargement.
    // Pour les autres : aria-label n'est pas défini (le contenu du bouton fait foi).
    const ariaLabel = this.label
      ? (busy ? this.loadingLabel : this.label)
      : undefined;

    return html`
      <button
        type="${this.type || 'button'}"
        class="${cls}"
        ?disabled="${off}"
        aria-disabled="${off}"
        aria-busy="${busy}"
        aria-label="${ifDefined(ariaLabel)}"
        @click="${this._handleClick}"
        @blur="${this._resetConfirm}"
        @keydown="${e => e.key === 'Escape' && this._resetConfirm()}"
      >
        <span class="spinner" aria-hidden="true"></span>

        <span class="content">
          <slot name="prefix">
            ${this.icon ? html`<agtc-icon name="${this.icon}" size="control"></agtc-icon>` : ''}
          </slot>
          <span class="label">
            ${this._confirming ? 'Confirmer ?' : html`<slot></slot>`}
          </span>
          <slot name="suffix">
            ${this.iconSuffix ? html`<agtc-icon name="${this.iconSuffix}" size="control"></agtc-icon>` : ''}
          </slot>
        </span>

        ${busy && !this.label ? html`<span class="sr-only">${this.loadingLabel}</span>` : ''}
      </button>
    `;
  }
}

customElements.define('agtc-button', AgtcButton);
export { AgtcButton };
