import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Interrupteur on/off à EFFET IMMÉDIAT. À préférer à la checkbox quand le
// changement s'applique instantanément (pas de bouton « Enregistrer »).
//
// État signalé par la POSITION du curseur (indicateur non-couleur, WCAG 1.4.1),
// renforcée par la couleur de la piste. Jamais la couleur seule.
//
// États : off · on · hover · focus-visible · disabled
//
// Accessibilité : <input type="checkbox" role="switch"> natif masqué (rôle,
// clavier via Espace, nom via le <label> implicite). Piste/curseur décoratifs.
//
// Événements :
//   agtc-change → { checked, name, value } immédiatement à la bascule
//
// Patterns UX de référence appliqués (ADR-036/039, tous approuvés) :
//   role=switch, effet immédiat, état par position (pas couleur seule),
//   label concis décrivant l'état « on » — NN/g :
//     https://www.nngroup.com/articles/toggle-switch-guidelines/
//   Cible tactile ≥ 24px — IxDF : https://ixdf.org/literature/topics/ui-design-patterns
//   Détail : guidelines/components/toggle.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

let _uid = 0;

class AgtcToggle extends LitElement {
  static properties = {
    checked:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name:     { type: String },
    value:    { type: String },
    label:    { type: String },
  };

  constructor() {
    super();
    this.checked  = false;
    this.disabled = false;
    this.value    = 'on';
    this._id      = `agtc-toggle-${++_uid}`;
  }

  updated() {
    if (!this.label && !this.textContent.trim()) {
      console.warn('[agtc-toggle] label manquant — fournir label="…" ou du texte en slot (WCAG 4.1.2).');
    }
  }

  _handleChange(e) {
    this.checked = e.target.checked;
    // Effet immédiat — l'événement part à la bascule, sans submit
    this.dispatchEvent(new CustomEvent('agtc-change', {
      bubbles: true, composed: true,
      detail: { checked: this.checked, name: this.name, value: this.value },
    }));
  }

  static styles = css`
    :host { display: inline-block; }
    :host([disabled]) { pointer-events: none; }

    .root {
      display: inline-flex;
      align-items: center;
      gap: var(--agtc-semantic-space-control-gap);
      min-height: 24px;            /* cible tactile ≥ 24px (WCAG 2.5.8) */
      cursor: pointer;
      font-family: inherit;
    }
    :host([disabled]) .root { cursor: not-allowed; }

    .native {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: 0;
      padding: 0;
      opacity: 0;
      pointer-events: none;
    }

    .track {
      position: relative;
      flex-shrink: 0;
      inline-size: 40px;
      block-size: 24px;
      border-radius: 9999px;
      background: var(--agtc-component-toggle-default-track-off);
      transition: background-color 0.15s;
    }
    .root:hover .track { background: var(--agtc-component-toggle-default-track-off-hover); }

    .knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: var(--agtc-component-toggle-default-knob);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);  /* délimite le curseur (WCAG 1.4.11) */
      transition: transform 0.15s;
    }

    :host([checked]) .track { background: var(--agtc-component-toggle-default-track-on); }
    :host([checked]) .root:hover .track { background: var(--agtc-component-toggle-default-track-on-hover); }
    :host([checked]) .knob { transform: translateX(16px); }

    .native:focus-visible + .track {
      outline: 2.5px solid var(--agtc-component-toggle-default-border-focus);
      outline-offset: 2px;
    }

    .label-text {
      font-size: var(--agtc-semantic-typography-body-size);
      line-height: var(--agtc-semantic-typography-body-line-height);
      color: var(--agtc-component-toggle-default-label);
    }
    .label-text:empty { display: none; }

    :host([disabled]) .track { opacity: 0.5; }
    :host([disabled]) .label-text { color: var(--agtc-semantic-color-text-disabled); }

    @media (prefers-reduced-motion: reduce) {
      .track, .knob { transition: none; }
    }
  `;

  render() {
    return html`
      <label class="root">
        <input
          class="native"
          id="${this._id}"
          type="checkbox"
          role="switch"
          name="${ifDefined(this.name)}"
          value="${ifDefined(this.value)}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          @change="${this._handleChange}"
        />
        <span class="track" aria-hidden="true"><span class="knob"></span></span>
        <span class="label-text"><slot>${this.label ?? ''}</slot></span>
      </label>
    `;
  }
}

customElements.define('agtc-toggle', AgtcToggle);
export { AgtcToggle };
