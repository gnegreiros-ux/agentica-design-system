import { LitElement, html, css } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Variantes : primary | secondary | ghost | critical
// Règle critical : deux clics requis (confirmation explicite).
//   - 1er clic → état confirming, event agtc-confirm-request
//   - 2e clic  → action confirmée, event agtc-confirm + agtc-click
//   - blur ou Escape → reset
// Largeur préservée pendant le loading (label masqué visuellement, slot intact).
// ────────────────────────────────────────────────────────────────────────────

class AgtcButton extends LitElement {
  static properties = {
    variant:      { type: String,  reflect: true },
    disabled:     { type: Boolean, reflect: true },
    loading:      { type: Boolean, reflect: true },
    type:         { type: String },
    loadingLabel: { type: String,  attribute: 'loading-label' },
    _confirming:  { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.variant      = 'primary';
    this.disabled     = false;
    this.loading      = false;
    this.type         = 'button';
    this.loadingLabel = 'En cours…';
    this._confirming  = false;
    this._confirmTimer = null;
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

    .label {
      display: contents;
    }
    button.loading .label {
      /* hides text visually but preserves layout — keeps button width stable */
      visibility: hidden;
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

    /* Visually hidden — for screen readers only */
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
    ].filter(Boolean).join(' ');

    return html`
      <button
        type="${this.type || 'button'}"
        class="${cls}"
        ?disabled="${off}"
        aria-disabled="${off}"
        aria-busy="${busy}"
        @click="${this._handleClick}"
        @blur="${this._resetConfirm}"
        @keydown="${e => e.key === 'Escape' && this._resetConfirm()}"
      >
        <span class="spinner" aria-hidden="true"></span>

        <span class="label" aria-hidden="${busy ? 'true' : 'false'}">
          ${this._confirming ? 'Confirmer ?' : html`<slot></slot>`}
        </span>

        ${busy ? html`<span class="sr-only">${this.loadingLabel}</span>` : ''}
      </button>
    `;
  }
}

customElements.define('agtc-button', AgtcButton);
export { AgtcButton };
