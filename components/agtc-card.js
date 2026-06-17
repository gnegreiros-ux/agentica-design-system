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
//
// Patterns UX de référence appliqués (ADR-036 ; C1/C3/C4 approuvés, C2 révisé) :
//   Clustering du contenu lié — Dashboard : https://dashboarddesignpatterns.github.io/patterns.html
//   Carte cliquable (C2 révisé) : 1 destination → lien englobant ; actions distinctes →
//     lien primaire en overlay ::after + boutons au-dessus, OU conteneur non interactif.
//     Jamais d'interactif imbriqué — Smashing : https://www.smashingmagazine.com/category/design-patterns/
//   Hiérarchie via élévation, pas couleur seule (Dashboard).
//   Détail-on-demand : la carte résume, le détail s'ouvre ailleurs (Dashboard).
//   Détail : guidelines/components/card.md § PATTERNS UX DE RÉFÉRENCE
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
      /* Typographie exposée via CSS custom properties — override via tokens composant.
         Les valeurs par défaut correspondent au contexte Produit SaaS (14px/14px/12px).
         En contexte Marketing (data-context="marketing" sur <body>), le site surcharge
         ces tokens via --agtc-component-card-typography-marketing-* dans siteCSS(). */
      --card-title-size:  var(--agtc-component-card-typography-title-size,   var(--agtc-semantic-typography-label-size));
      --card-title-weight:var(--agtc-component-card-typography-title-weight,  var(--agtc-primitive-fontWeight-bold));
      --card-body-size:   var(--agtc-component-card-typography-body-size,    var(--agtc-semantic-typography-label-size));
      --card-meta-size:   var(--agtc-component-card-typography-meta-size,    var(--agtc-semantic-typography-detail-size));
    }

    /* ── Typographie des éléments slottés directs ──────────────────────────── */
    ::slotted(h1),::slotted(h2),::slotted(h3),::slotted(h4),::slotted(h5),::slotted(h6){
      font-size: var(--card-title-size);
      font-weight: var(--card-title-weight);
    }
    ::slotted(p){
      font-size: var(--card-body-size);
    }

    /* ── Base ──────────────────────────────────────────────────────────────── */
    .card {
      border-radius: var(--agtc-component-card-default-radius);
      overflow: hidden;
    }

    /* ── Variante default ──────────────────────────────────────────────────── */
    .card.default {
      background: var(--agtc-component-card-default-background);
      border: 1px solid var(--agtc-component-card-default-border);
    }

    /* ── Variante elevated ─────────────────────────────────────────────────── */
    .card.elevated {
      background: var(--agtc-component-card-elevated-background);
      border: 1px solid var(--agtc-component-card-elevated-border);
      box-shadow: var(--agtc-component-card-elevated-shadow);
    }

    /* ── Variante flat ─────────────────────────────────────────────────────── */
    .card.flat {
      background: var(--agtc-component-card-flat-background);
      border: 1px solid var(--agtc-component-card-flat-border);
    }

    /* ── Padding ───────────────────────────────────────────────────────────── */
    .card.padding-none .header,
    .card.padding-none .body,
    .card.padding-none .footer {
      padding: var(--agtc-component-card-padding-none);
    }
    .card.padding-sm .header,
    .card.padding-sm .body,
    .card.padding-sm .footer {
      padding: var(--agtc-component-card-padding-sm);
    }
    .card.padding-md .header,
    .card.padding-md .body,
    .card.padding-md .footer {
      padding: var(--agtc-component-card-default-padding);
    }
    .card.padding-lg .header,
    .card.padding-lg .body,
    .card.padding-lg .footer {
      padding: var(--agtc-component-card-padding-lg);
    }

    /* ── Sections ──────────────────────────────────────────────────────────── */
    .header {
      border-bottom: 1px solid var(--agtc-component-card-default-border);
    }
    .footer {
      border-top: 1px solid var(--agtc-component-card-default-border);
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
