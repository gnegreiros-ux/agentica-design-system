import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Variants : primary | secondary | ghost | critical
//
// Icons — hybrid approach (property + slot, slot takes priority):
//   icon="name"         → <agtc-icon> as prefix via fallback slot
//   icon-suffix="name"  → <agtc-icon> as suffix via fallback slot
//   slot[name="prefix"] → free composition (custom SVG, etc.)
//   slot[name="suffix"] → same
//   icon-only           → square padding, label="" required (WCAG 1.1.1)
//
// The property enables Figma Code Connect and frameworks (React…).
// The slot remains available for advanced composition.
//
// UX reference patterns applied (ADR-036, all approved):
//   A single primary action per context — IxDF: https://ixdf.org/literature/topics/ui-design-patterns
//   Explicit confirmation for critical — NN/g error prevention
//   Width preserved during loading (no layout shift) — Smashing
//   Never disable without stating the reason (motivated disabled > hiding)
//     — Smashing hidden vs disabled: https://www.smashingmagazine.com/category/design-patterns/
//   Label describing the consequence — NN/g: https://www.nngroup.com/articles/design-pattern-guidelines/
//   Details: guidelines/components/button.md § UX Patterns Reference
// Prerequisite: agtc-icon must be registered by the consumer.
//
// Critical rule: two clicks required (explicit confirmation).
//   - 1st click → confirming state, agtc-confirm-request event
//   - 2nd click → action confirmed, agtc-confirm + agtc-click events
//   - blur or Escape → automatic reset
// Width preserved during loading (.content visibility:hidden, icons included).
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
    this.loadingLabel = 'Loading…';
    this._confirming  = false;
    this._confirmTimer = null;
  }

  updated() {
    if (this.iconOnly && !this.label) {
      console.warn('[agtc-button] icon-only without label="" — inaccessible (WCAG 1.1.1). Add label="Action description".');
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

      padding: var(--agtc-component-button-primary-padding-y) var(--agtc-component-button-primary-padding-x);
      border-radius: var(--agtc-component-button-primary-radius);

      font-family: inherit;
      font-size: var(--agtc-component-button-font-size);
      font-weight: var(--agtc-component-button-font-weight);
      line-height: var(--agtc-semantic-typography-label-bold-line-height);
      white-space: nowrap;
      letter-spacing: 0.01em;

      border: 1.5px solid transparent;
      cursor: pointer;
      transition: background 0.12s, color 0.12s, border-color 0.12s;
      user-select: none;
    }

    /* ── Icon slots — transparent to the flex layout ───────────────────────── */
    /* display:contents lets slotted elements be direct flex items.
       An empty slot generates no extra space or gap. */
    slot[name="prefix"],
    slot[name="suffix"] {
      display: contents;
    }

    /* ── Icon-only — square padding ────────────────────────────────────────── */
    button.icon-only {
      padding: var(--agtc-component-button-primary-padding-y);
    }

    /* ── Focus — non-negotiable ────────────────────────────────────────────── */
    button:focus-visible {
      outline: 2.5px solid var(--agtc-semantic-color-border-focus);
      outline-offset: 2px;
    }
    button:focus:not(:focus-visible) {
      outline: none;
    }

    /* ── Primary ───────────────────────────────────────────────────────────── */
    button.primary {
      background: var(--agtc-component-button-primary-background);
      color: var(--agtc-component-button-primary-text);
    }
    button.primary:not(:disabled):hover {
      background: var(--agtc-component-button-primary-background-hover);
    }

    /* ── Secondary ─────────────────────────────────────────────────────────── */
    button.secondary {
      background: var(--agtc-component-button-secondary-background);
      color: var(--agtc-component-button-secondary-text);
      border-color: var(--agtc-component-button-secondary-border);
    }
    button.secondary:not(:disabled):hover {
      background: var(--agtc-component-button-secondary-background-hover);
    }

    /* ── Ghost ─────────────────────────────────────────────────────────────── */
    button.ghost {
      background: var(--agtc-component-button-ghost-background);
      color: var(--agtc-component-button-ghost-text);
    }
    button.ghost:not(:disabled):hover {
      background: var(--agtc-component-button-ghost-background-hover);
    }

    /* ── Critical ──────────────────────────────────────────────────────────── */
    button.critical {
      background: var(--agtc-component-button-critical-background);
      color: var(--agtc-component-button-critical-text);
      border-color: var(--agtc-component-button-critical-border);
    }
    button.critical:not(:disabled):hover {
      background: var(--agtc-component-button-critical-background-hover);
      color: var(--agtc-component-button-critical-background);
    }
    button.critical.confirming,
    button.critical.confirming:not(:disabled):hover {
      background: var(--agtc-component-button-critical-background);
      color: var(--agtc-component-button-critical-text);
      border-color: var(--agtc-component-button-critical-border);
      animation: pulse 0.25s ease-out;
    }

    /* ── Disabled ──────────────────────────────────────────────────────────── */
    button.primary:disabled,
    button.critical:disabled {
      background: var(--agtc-component-button-primary-background-disabled);
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

    /* .content is display:contents — transparent to the layout.
       visibility:hidden propagates to children via CSS inheritance,
       hiding them visually AND from the accessibility tree while
       preserving their flex boxes (stable button width). */
    .content {
      display: contents;
    }
    button.loading .content {
      visibility: hidden;
    }

    /* .label is display:contents — the text becomes a direct flex item */
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

    /* Visible to screen readers only */
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

    // For icon-only: aria-label switches to loadingLabel while loading.
    // For the others: aria-label is not set (the button content is authoritative).
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
            ${this._confirming ? 'Confirm?' : html`<slot></slot>`}
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
