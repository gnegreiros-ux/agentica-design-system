import { LitElement, html, css } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Bouton radio — un choix dans un ensemble mutuellement exclusif. Toujours
// utilisé dans un <agtc-radio-group> qui gère l'exclusivité, le focus roving et
// la navigation au clavier (les <input radio> en shadow DOM séparés ne forment
// pas un groupe natif — voir ADR-038).
//
// Forme : RONDE — convention NN/g (le carré signale une checkbox).
//
// États : default · hover · focus-visible · selected · disabled
//
// Accessibilité : host `role="radio"` + `aria-checked` ; le groupe porte
// `role="radiogroup"`. Tabindex roving piloté par le groupe.
//
// Patterns UX de référence appliqués (ADR-036/038, tous approuvés) :
//   Forme ronde, sélection exclusive, label cliquable (Fitts) — NN/g :
//     https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/
//   Pré-sélection d'un défaut sensé (guidance d'usage) — NN/g :
//     https://www.nngroup.com/articles/radio-buttons-default-selection/
//   Cible tactile ≥ 24px — IxDF : https://ixdf.org/literature/topics/ui-design-patterns
//   Détail : guidelines/components/radio.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

class AgtcRadio extends LitElement {
  static properties = {
    checked:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    value:    { type: String },
    label:    { type: String },
  };

  constructor() {
    super();
    this.checked  = false;
    this.disabled = false;
    this.value    = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'radio');
    this._onClick = () => {
      if (this.disabled) return;
      // Le groupe parent décide de l'exclusivité — on signale juste l'intention
      this.dispatchEvent(new CustomEvent('agtc-radio-select', {
        bubbles: true, composed: true, detail: { value: this.value },
      }));
    };
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    super.disconnectedCallback();
  }

  updated() {
    this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    // Filet de sécurité si le radio est utilisé hors groupe : reste focusable
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', this.checked ? '0' : '-1');
    }
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--agtc-semantic-space-control-gap);
      min-height: 24px;            /* cible tactile ≥ 24px (WCAG 2.5.8) */
      cursor: pointer;
      font-family: inherit;
      outline: none;
    }
    :host([disabled]) { cursor: not-allowed; }

    .control {
      position: relative;
      flex-shrink: 0;
      box-sizing: border-box;
      inline-size: var(--agtc-semantic-icon-size-control);
      block-size: var(--agtc-semantic-icon-size-control);
      border: 1.5px solid var(--agtc-component-radio-default-border);
      border-radius: 9999px;       /* rond — convention radio */
      background: var(--agtc-component-radio-default-background);
      transition: border-color 0.12s;
    }
    :host(:hover:not([disabled])) .control {
      border-color: var(--agtc-component-radio-default-border-hover);
    }
    :host(:focus-visible) .control {
      outline: 2.5px solid var(--agtc-component-radio-default-border-focus);
      outline-offset: 2px;
    }
    :host([checked]) .control {
      border-color: var(--agtc-component-radio-default-fill);
    }

    .dot {
      position: absolute;
      inset: 0;
      margin: auto;
      width: 50%;
      height: 50%;
      border-radius: 9999px;
      background: var(--agtc-component-radio-default-fill);
      transform: scale(0);
      transition: transform 0.12s;
    }
    :host([checked]) .dot { transform: scale(1); }

    .label-text {
      font-size: var(--agtc-semantic-typography-body-size);
      line-height: var(--agtc-semantic-typography-body-line-height);
      color: var(--agtc-component-radio-default-label);
    }
    .label-text:empty { display: none; }

    /* Désactivé */
    :host([disabled]) .control {
      background: var(--agtc-semantic-color-background-subtle);
      border-color: var(--agtc-semantic-color-border-default);
    }
    :host([disabled][checked]) .control,
    :host([disabled][checked]) .dot {
      border-color: var(--agtc-semantic-color-action-primary-disabled);
      background: var(--agtc-semantic-color-action-primary-disabled);
    }
    :host([disabled]) .label-text {
      color: var(--agtc-semantic-color-text-disabled);
    }

    @media (prefers-reduced-motion: reduce) {
      .control, .dot { transition: none; }
    }
  `;

  render() {
    return html`
      <span class="control" aria-hidden="true"><span class="dot"></span></span>
      <span class="label-text"><slot>${this.label ?? ''}</slot></span>
    `;
  }
}

customElements.define('agtc-radio', AgtcRadio);
export { AgtcRadio };
