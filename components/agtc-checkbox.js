import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Sélection binaire indépendante : cocher / décocher une option, marquer une
// tâche faite. Pour un réglage à effet immédiat (on/off), préférer un toggle
// (cf. NN/g — checkbox vs toggle).
//
// Forme : CARRÉ uniquement — convention NN/g (le rond signale conventionnellement
// un bouton radio). Décision approuvée, voir ADR-037.
//
// États : default · hover · focus-visible · checked · indeterminate · disabled
//
// Label cliquable : cliquer la case OU le texte bascule l'état (loi de Fitts).
// Cible interactive ≥ 24px de haut (WCAG 2.5.8).
//
// L'élément accessible est un <input type="checkbox"> natif (rôle, état coché,
// gestion clavier, nom via le <label> implicite). La case stylée est décorative.
//
// Événements :
//   agtc-change → { checked, name, value } à chaque bascule
//
// Patterns UX de référence appliqués (ADR-036/037, tous approuvés) :
//   Checkbox (pas toggle) pour un item indépendant — NN/g :
//     https://www.nngroup.com/articles/toggle-switch-guidelines/
//   Forme carrée, label cliquable (Fitts), libellé positif — NN/g :
//     https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/
//   Cible tactile ≥ 24px, états visibles, pas de pré-cochage trompeur — IxDF :
//     https://ixdf.org/literature/topics/ui-design-patterns
//   Détail : guidelines/components/checkbox.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

let _uid = 0;

class AgtcCheckbox extends LitElement {
  static properties = {
    checked:       { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    disabled:      { type: Boolean, reflect: true },
    required:      { type: Boolean, reflect: true },
    name:          { type: String },
    value:         { type: String },
    label:         { type: String },
  };

  constructor() {
    super();
    this.checked       = false;
    this.indeterminate = false;
    this.disabled      = false;
    this.required      = false;
    this.value         = 'on';
    this._id           = `agtc-checkbox-${++_uid}`;
  }

  updated() {
    // indeterminate ne s'exprime que via la propriété DOM, jamais via attribut HTML
    const input = this.shadowRoot?.querySelector('input');
    if (input) input.indeterminate = this.indeterminate;

    if (!this.label && !this.textContent.trim()) {
      console.warn('[agtc-checkbox] label manquant — fournir label="…" ou du texte en slot (WCAG 4.1.2).');
    }
  }

  _handleChange(e) {
    this.checked = e.target.checked;
    this.indeterminate = false; // cocher/décocher lève l'état indéterminé
    this.dispatchEvent(new CustomEvent('agtc-change', {
      bubbles: true,
      composed: true,
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

    /* Input natif : accessible (clavier, AT) mais visuellement masqué */
    .native {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: 0;
      padding: 0;
      opacity: 0;
      pointer-events: none;
    }

    /* Case stylée — décorative (aria-hidden) */
    .box {
      position: relative;
      flex-shrink: 0;
      inline-size: var(--agtc-semantic-icon-size-control);
      block-size: var(--agtc-semantic-icon-size-control);
      border: 1.5px solid var(--agtc-component-checkbox-default-border);
      border-radius: var(--agtc-component-checkbox-default-radius);
      background: var(--agtc-component-checkbox-default-background);
      transition: background-color 0.12s, border-color 0.12s;
    }

    .root:hover .box {
      border-color: var(--agtc-component-checkbox-default-border-hover);
    }

    /* Focus clavier → anneau visible sur la case */
    .native:focus-visible + .box {
      outline: 2.5px solid var(--agtc-component-checkbox-default-border-focus);
      outline-offset: 2px;
    }

    /* Coché ou indéterminé → remplissage primaire */
    :host([checked]) .box,
    :host([indeterminate]) .box {
      background: var(--agtc-component-checkbox-default-fill);
      border-color: var(--agtc-component-checkbox-default-fill);
    }
    :host([checked]) .root:hover .box,
    :host([indeterminate]) .root:hover .box {
      background: var(--agtc-component-checkbox-default-fill-hover);
      border-color: var(--agtc-component-checkbox-default-fill-hover);
    }

    /* Glyphes — coche et tiret (indéterminé) */
    .check,
    .dash {
      position: absolute;
      inset: 0;
      margin: auto;
      width: 78%;
      height: 78%;
      stroke: var(--agtc-component-checkbox-default-check);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      opacity: 0;
      pointer-events: none;
    }
    :host([checked]:not([indeterminate])) .check { opacity: 1; }
    :host([indeterminate]) .dash { opacity: 1; }

    .label-text {
      font-size: var(--agtc-semantic-typography-body-size);
      line-height: var(--agtc-semantic-typography-body-line-height);
      color: var(--agtc-component-checkbox-default-label);
    }
    .label-text:empty { display: none; }

    /* Désactivé */
    :host([disabled]) .box {
      background: var(--agtc-semantic-color-background-subtle);
      border-color: var(--agtc-semantic-color-border-default);
    }
    :host([disabled][checked]) .box,
    :host([disabled][indeterminate]) .box {
      background: var(--agtc-semantic-color-action-primary-disabled);
      border-color: var(--agtc-semantic-color-action-primary-disabled);
    }
    :host([disabled]) .label-text {
      color: var(--agtc-semantic-color-text-disabled);
    }

    @media (prefers-reduced-motion: reduce) {
      .box { transition: none; }
    }
  `;

  render() {
    return html`
      <label class="root">
        <input
          class="native"
          id="${this._id}"
          type="checkbox"
          name="${ifDefined(this.name)}"
          value="${ifDefined(this.value)}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required ? 'true' : 'false'}"
          @change="${this._handleChange}"
        />
        <span class="box" aria-hidden="true">
          <svg class="check" viewBox="0 0 24 24"><path d="M5 12.5l4 4L19 7" /></svg>
          <svg class="dash" viewBox="0 0 24 24"><path d="M6 12h12" /></svg>
        </span>
        <span class="label-text"><slot>${this.label ?? ''}</slot></span>
      </label>
    `;
  }
}

customElements.define('agtc-checkbox', AgtcCheckbox);
export { AgtcCheckbox };
