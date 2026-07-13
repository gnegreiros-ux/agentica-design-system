import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Variants : neutral | brand | success | warning | danger | info
// Sizes    : sm | md (default)
//
// Text badge : content via <slot>
// Icon badge : icon="name" adds a prefix icon
// Icon-only badge : icon="name" + icon-only + label="…" (WCAG 1.1.1)
//
// Non-interactive — if an action is required, use agtc-button.
//
// UX reference patterns applied (ADR-036, all approved):
//   Status not encoded by color alone (recommended: distinctive icon/label
//     for danger/warning) — NN/g indicators:
//     https://www.nngroup.com/articles/design-pattern-guidelines/
//   role=status to announce changes to AT — NN/g
//   Traffic-light semantic mapping — Dashboard: https://dashboarddesignpatterns.github.io/patterns.html
//   Details: guidelines/components/badge.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

class AgtcBadge extends LitElement {
  static properties = {
    variant:  { type: String },
    size:     { type: String },
    icon:     { type: String },
    iconOnly: { type: Boolean, attribute: 'icon-only' },
    label:    { type: String },
  };

  constructor() {
    super();
    this.variant  = 'neutral';
    this.size     = 'md';
    this.iconOnly = false;
  }

  updated() {
    if (this.iconOnly && !this.label) {
      console.warn('[agtc-badge] icon-only without label — inaccessible (WCAG 1.1.1). Add label="Badge description".');
    }
  }

  static styles = css`
    :host {
      display: inline-flex;
    }

    /* ── Base ──────────────────────────────────────────────────────────────── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;

      font-family: inherit;
      font-weight: var(--agtc-semantic-typography-label-weight);
      line-height: 1;
      white-space: nowrap;

      border: 1px solid transparent;
      cursor: default;
      user-select: none;
    }

    /* ── Size md (default) ─────────────────────────────────────────────────── */
    .badge.md {
      padding: var(--agtc-component-badge-md-padding-y) var(--agtc-component-badge-md-padding-x);
      border-radius: var(--agtc-component-badge-md-radius);
      font-size: var(--agtc-component-badge-md-font-size);
    }
    .badge.md.icon-only {
      padding: var(--agtc-component-badge-md-padding-y);
      aspect-ratio: 1;
      justify-content: center;
    }

    /* ── Size sm ───────────────────────────────────────────────────────────── */
    .badge.sm {
      padding: var(--agtc-component-badge-sm-padding-y) var(--agtc-component-badge-sm-padding-x);
      border-radius: var(--agtc-component-badge-sm-radius);
      font-size: var(--agtc-component-badge-sm-font-size);
    }
    .badge.sm.icon-only {
      padding: var(--agtc-component-badge-sm-padding-y);
      aspect-ratio: 1;
      justify-content: center;
    }

    /* ── Variant neutral ───────────────────────────────────────────────────── */
    .badge.neutral {
      background: var(--agtc-component-badge-neutral-background);
      color:      var(--agtc-component-badge-neutral-text);
      border-color: var(--agtc-component-badge-neutral-border);
    }

    /* ── Variant brand ─────────────────────────────────────────────────────── */
    .badge.brand {
      background: var(--agtc-component-badge-brand-background);
      color:      var(--agtc-component-badge-brand-text);
      border-color: var(--agtc-component-badge-brand-border);
    }

    /* ── Variant success ───────────────────────────────────────────────────── */
    .badge.success {
      background: var(--agtc-component-badge-success-background);
      color:      var(--agtc-component-badge-success-text);
      border-color: var(--agtc-component-badge-success-border);
    }

    /* ── Variant warning ───────────────────────────────────────────────────── */
    .badge.warning {
      background: var(--agtc-component-badge-warning-background);
      color:      var(--agtc-component-badge-warning-text);
      border-color: var(--agtc-component-badge-warning-border);
    }

    /* ── Variant danger ────────────────────────────────────────────────────── */
    .badge.danger {
      background: var(--agtc-component-badge-danger-background);
      color:      var(--agtc-component-badge-danger-text);
      border-color: var(--agtc-component-badge-danger-border);
    }

    /* ── Variant info ──────────────────────────────────────────────────────── */
    .badge.info {
      background: var(--agtc-component-badge-info-background);
      color:      var(--agtc-component-badge-info-text);
      border-color: var(--agtc-component-badge-info-border);
    }
  `;

  render() {
    const cls = [
      'badge',
      this.size || 'md',
      this.variant || 'neutral',
      this.iconOnly ? 'icon-only' : '',
    ].filter(Boolean).join(' ');

    const iconSize = this.size === 'sm' ? 'inline' : 'inline';

    return html`
      <span
        class="${cls}"
        role="status"
        aria-label="${ifDefined(this.iconOnly ? this.label : undefined)}"
        aria-hidden="${this.iconOnly && !this.label ? 'true' : 'false'}"
      >
        ${this.icon ? html`
          <agtc-icon
            name="${this.icon}"
            size="${iconSize}"
            decorative
          ></agtc-icon>
        ` : ''}
        ${!this.iconOnly ? html`<slot></slot>` : ''}
      </span>
    `;
  }
}

customElements.define('agtc-badge', AgtcBadge);
export { AgtcBadge };
