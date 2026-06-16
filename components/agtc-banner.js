import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Message inline contextuel (callout / alerte) dans le flux de la page.
// N'est PAS un toast (flottant temporaire) ni une modale.
//
//   variant="neutral|brand|info|success|warning|danger"  (défaut info)
//   heading="…"      — titre optionnel
//   icon="name"      — icône Lucide (override du défaut par variante)
//   no-icon          — masque l'icône
//   dismissible      — bouton fermer (émet l'événement « dismiss »)
//   live="off|polite|assertive"  — région live pour usage DYNAMIQUE
//                       (défaut off : un banner statique ne s'annonce pas au chargement)
//
// Contenu (corps) via <slot>. Actions via <slot name="actions">.
//
// Patterns UX de référence appliqués (ADR-036/042, tous approuvés N1–N9) :
//   Variantes sémantiques + sens jamais par la couleur seule (icône + préfixe
//     de sévérité masqué pour AT) — NN/g :
//     https://www.nngroup.com/articles/indicators-validations-notifications/
//   Statique par défaut, opt-in role=status/alert pour le dynamique — MDN :
//     https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role
//   Bouton fermer accessible sans piège de focus — A11Y Collective :
//     https://www.a11y-collective.com/blog/aria-alert/
//   Détail : guidelines/components/banner.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_ICON = {
  neutral: 'info',
  brand:   'sparkles',
  info:    'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger:  'octagon-alert',
};

// Préfixe de sévérité annoncé aux lecteurs d'écran (l'icône est décorative).
const SEVERITY_PREFIX = {
  neutral: 'Information : ',
  brand:   'Information : ',
  info:    'Information : ',
  success: 'Succès : ',
  warning: 'Attention : ',
  danger:  'Erreur : ',
};

class AgtcBanner extends LitElement {
  static properties = {
    variant:     { type: String },
    heading:     { type: String },
    icon:        { type: String },
    noIcon:      { type: Boolean, attribute: 'no-icon' },
    dismissible: { type: Boolean },
    live:        { type: String },
  };

  constructor() {
    super();
    this.variant     = 'info';
    this.noIcon      = false;
    this.dismissible = false;
    this.live        = 'off';
  }

  static styles = css`
    :host {
      display: block;
      margin: 18px 0;
    }
    :host([hidden]) { display: none; }

    .banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: var(--agtc-component-banner-padding-y) var(--agtc-component-banner-padding-x);
      border: 1px solid var(--agtc-semantic-color-border-default);
      border-left-width: 3px;
      border-radius: 0 var(--agtc-component-banner-radius) var(--agtc-component-banner-radius) 0;
    }

    /* Variantes : fond + accent (bordure gauche + icône) ───────────────────── */
    .banner.neutral { background: var(--agtc-component-banner-neutral-background); border-left-color: var(--agtc-component-banner-neutral-accent); }
    .banner.brand   { background: var(--agtc-component-banner-brand-background);   border-left-color: var(--agtc-component-banner-brand-accent); }
    .banner.info    { background: var(--agtc-component-banner-info-background);    border-left-color: var(--agtc-component-banner-info-accent); }
    .banner.success { background: var(--agtc-component-banner-success-background); border-left-color: var(--agtc-component-banner-success-accent); }
    .banner.warning { background: var(--agtc-component-banner-warning-background); border-left-color: var(--agtc-component-banner-warning-accent); }
    .banner.danger  { background: var(--agtc-component-banner-danger-background);  border-left-color: var(--agtc-component-banner-danger-accent); }

    .icon { flex-shrink: 0; line-height: 0; padding-top: 1px; }
    .banner.neutral .icon { color: var(--agtc-component-banner-neutral-accent); }
    .banner.brand   .icon { color: var(--agtc-component-banner-brand-accent); }
    .banner.info    .icon { color: var(--agtc-component-banner-info-accent); }
    .banner.success .icon { color: var(--agtc-component-banner-success-accent); }
    .banner.warning .icon { color: var(--agtc-component-banner-warning-accent); }
    .banner.danger  .icon { color: var(--agtc-component-banner-danger-accent); }

    .content { flex: 1; min-width: 0; }
    .heading {
      display: block;
      color: var(--agtc-component-banner-heading-text);
      font-weight: var(--agtc-semantic-typography-label-weight);
      font-size: var(--agtc-semantic-typography-label-size);
      margin-bottom: 3px;
    }
    .body {
      color: var(--agtc-component-banner-body-text);
      font-size: var(--agtc-semantic-typography-label-size);
      line-height: 1.55;
    }
    .actions { margin-top: 10px; }
    .actions:empty { display: none; }

    .close {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px; height: 28px;
      margin: -4px -4px 0 0;
      background: none;
      border: none;
      border-radius: var(--agtc-semantic-radius-control);
      color: var(--agtc-component-banner-close-color);
      cursor: pointer;
      line-height: 0;
    }
    .close:hover { color: var(--agtc-component-banner-close-hover); }
    .close:focus-visible {
      outline: 2px solid var(--agtc-component-banner-border-focus);
      outline-offset: 2px;
    }

    .visually-hidden {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0);
      white-space: nowrap; border: 0;
    }
  `;

  _dismiss() {
    const ev = new CustomEvent('dismiss', { bubbles: true, composed: true, cancelable: true });
    const proceed = this.dispatchEvent(ev);
    if (proceed) this.hidden = true;  // :host([hidden]) → display:none
  }

  render() {
    const variant = this.variant || 'info';
    const iconName = this.icon || DEFAULT_ICON[variant] || 'info';
    // Région live : opt-in pour usage dynamique uniquement.
    const role = this.live === 'assertive' ? 'alert' : this.live === 'polite' ? 'status' : undefined;

    return html`
      <div
        class="banner ${variant}"
        role="${ifDefined(role)}"
      >
        <span class="visually-hidden">${SEVERITY_PREFIX[variant] || ''}</span>
        ${!this.noIcon ? html`
          <span class="icon"><agtc-icon name="${iconName}" size="inline" decorative></agtc-icon></span>
        ` : ''}
        <div class="content">
          ${this.heading ? html`<strong class="heading">${this.heading}</strong>` : ''}
          <div class="body"><slot></slot></div>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
        ${this.dismissible ? html`
          <button class="close" type="button" aria-label="Fermer" @click="${this._dismiss}">
            <agtc-icon name="x" size="inline" decorative></agtc-icon>
          </button>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('agtc-banner', AgtcBanner);
export { AgtcBanner };
