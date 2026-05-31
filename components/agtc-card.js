import { LitElement, html, css } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Variantes : default (bord) | elevated (ombre) | flat (fond subtil)
// Padding   : none | sm | md (défaut) | lg
//
// Slots :
//   slot[name="header"] → séparateur bas automatique si contenu présent
//   slot (défaut)       → corps de la carte
//   slot[name="footer"] → séparateur haut automatique si contenu présent
//
// Non interactif par défaut.
// Pour une carte cliquable, placer un <a> ou <agtc-button> à l'intérieur.
// ────────────────────────────────────────────────────────────────────────────

class AgtcCard extends LitElement {
  static properties = {
    variant:     { type: String },
    padding:     { type: String },
    _hasHeader:  { type: Boolean, state: true },
    _hasFooter:  { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.variant    = 'default';
    this.padding    = 'md';
    this._hasHeader = false;
    this._hasFooter = false;
  }

  _onHeaderSlotChange(e) {
    this._hasHeader = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onFooterSlotChange(e) {
    this._hasFooter = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  static styles = css`
    :host {
      display: block;
    }

    /* ── Base ──────────────────────────────────────────────────────────────── */
    .card {
      border-radius: var(--agtc-card-default-radius);
      overflow: hidden;
    }

    /* ── Variante default ──────────────────────────────────────────────────── */
    .card.default {
      background: var(--agtc-card-default-background);
      border: 1px solid var(--agtc-card-default-border);
    }

    /* ── Variante elevated ─────────────────────────────────────────────────── */
    .card.elevated {
      background: var(--agtc-card-elevated-background);
      border: 1px solid var(--agtc-card-elevated-border);
      box-shadow: var(--agtc-card-elevated-shadow);
    }

    /* ── Variante flat ─────────────────────────────────────────────────────── */
    .card.flat {
      background: var(--agtc-card-flat-background);
      border: 1px solid var(--agtc-card-flat-border);
    }

    /* ── Padding ───────────────────────────────────────────────────────────── */
    .card.padding-none .header,
    .card.padding-none .body,
    .card.padding-none .footer {
      padding: var(--agtc-card-padding-none);
    }
    .card.padding-sm .header,
    .card.padding-sm .body,
    .card.padding-sm .footer {
      padding: var(--agtc-card-padding-sm);
    }
    .card.padding-md .header,
    .card.padding-md .body,
    .card.padding-md .footer {
      padding: var(--agtc-card-default-padding);
    }
    .card.padding-lg .header,
    .card.padding-lg .body,
    .card.padding-lg .footer {
      padding: var(--agtc-card-padding-lg);
    }

    /* ── Sections ──────────────────────────────────────────────────────────── */
    .header {
      border-bottom: 1px solid var(--agtc-card-default-border);
    }
    .footer {
      border-top: 1px solid var(--agtc-card-default-border);
    }

    /* Pas de séparateur sur flat et elevated */
    .card.elevated .header,
    .card.flat     .header {
      border-bottom-color: var(--agtc-semantic-color-border-default);
    }
    .card.elevated .footer,
    .card.flat     .footer {
      border-top-color: var(--agtc-semantic-color-border-default);
    }

    .header[hidden],
    .footer[hidden] {
      display: none;
    }

    /* Supprime padding-bottom du body si footer présent, et padding-top si header présent.
       Évite le double espacement au niveau des séparateurs. */
    .has-header .body { padding-top: 0; }
    .has-footer .body { padding-bottom: 0; }
  `;

  render() {
    const paddingCls = `padding-${this.padding || 'md'}`;
    const cls = [
      'card',
      this.variant || 'default',
      paddingCls,
      this._hasHeader ? 'has-header' : '',
      this._hasFooter ? 'has-footer' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${cls}">
        <div
          class="header"
          ?hidden="${!this._hasHeader}"
        >
          <slot
            name="header"
            @slotchange="${this._onHeaderSlotChange}"
          ></slot>
        </div>

        <div class="body">
          <slot></slot>
        </div>

        <div
          class="footer"
          ?hidden="${!this._hasFooter}"
        >
          <slot
            name="footer"
            @slotchange="${this._onFooterSlotChange}"
          ></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('agtc-card', AgtcCard);
export { AgtcCard };
