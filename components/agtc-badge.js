import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Variantes : neutral | brand | success | warning | danger | info
// Tailles   : sm | md (défaut)
//
// Badge texte : contenu via <slot>
// Badge icône : icon="name" ajoute une icône prefix
// Badge icon-only : icon="name" + icon-only + label="…" (WCAG 1.1.1)
//
// Non interactif — si une action est requise, utiliser agtc-button.
//
// Patterns UX de référence appliqués (ADR-036, tous approuvés) :
//   Statut pas encodé uniquement par la couleur (recommandé : icône/libellé
//     distinctif pour danger/warning) — NN/g indicators :
//     https://www.nngroup.com/articles/design-pattern-guidelines/
//   role=status pour annoncer les changements aux AT — NN/g
//   Mapping sémantique traffic-light — Dashboard : https://dashboarddesignpatterns.github.io/patterns.html
//   Détail : guidelines/components/badge.md § PATTERNS UX DE RÉFÉRENCE
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
      console.warn('[agtc-badge] icon-only sans label — inaccessible (WCAG 1.1.1). Ajouter label="Description du badge".');
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

    /* ── Taille md (défaut) ────────────────────────────────────────────────── */
    .badge.md {
      padding: var(--agtc-badge-md-padding-y) var(--agtc-badge-md-padding-x);
      border-radius: var(--agtc-badge-md-radius);
      font-size: var(--agtc-badge-md-font-size);
    }
    .badge.md.icon-only {
      padding: var(--agtc-badge-md-padding-y);
      aspect-ratio: 1;
      justify-content: center;
    }

    /* ── Taille sm ─────────────────────────────────────────────────────────── */
    .badge.sm {
      padding: var(--agtc-badge-sm-padding-y) var(--agtc-badge-sm-padding-x);
      border-radius: var(--agtc-badge-sm-radius);
      font-size: var(--agtc-badge-sm-font-size);
    }
    .badge.sm.icon-only {
      padding: var(--agtc-badge-sm-padding-y);
      aspect-ratio: 1;
      justify-content: center;
    }

    /* ── Variante neutral ──────────────────────────────────────────────────── */
    .badge.neutral {
      background: var(--agtc-badge-neutral-background);
      color:      var(--agtc-badge-neutral-text);
      border-color: var(--agtc-badge-neutral-border);
    }

    /* ── Variante brand ────────────────────────────────────────────────────── */
    .badge.brand {
      background: var(--agtc-badge-brand-background);
      color:      var(--agtc-badge-brand-text);
      border-color: var(--agtc-badge-brand-border);
    }

    /* ── Variante success ──────────────────────────────────────────────────── */
    .badge.success {
      background: var(--agtc-badge-success-background);
      color:      var(--agtc-badge-success-text);
      border-color: var(--agtc-badge-success-border);
    }

    /* ── Variante warning ──────────────────────────────────────────────────── */
    .badge.warning {
      background: var(--agtc-badge-warning-background);
      color:      var(--agtc-badge-warning-text);
      border-color: var(--agtc-badge-warning-border);
    }

    /* ── Variante danger ───────────────────────────────────────────────────── */
    .badge.danger {
      background: var(--agtc-badge-danger-background);
      color:      var(--agtc-badge-danger-text);
      border-color: var(--agtc-badge-danger-border);
    }

    /* ── Variante info ─────────────────────────────────────────────────────── */
    .badge.info {
      background: var(--agtc-badge-info-background);
      color:      var(--agtc-badge-info-text);
      border-color: var(--agtc-badge-info-border);
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
