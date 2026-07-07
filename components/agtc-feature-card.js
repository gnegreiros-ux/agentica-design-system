import { LitElement, html, css } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Carte éditoriale V2 avec icône, titre et corps de texte.
// Utilisée dans les sections "Valeur par rôle" et blocs éditoriaux marketing.
//
// POURQUOI — Patterns UX appliqués (approuvés ADR-070, revue 2026-06-25) :
//   P1 Icône + titre en duo — NN/g Icons & Indicators — signal fonctionnel, pas décoratif
//   P2 Affordance d'interactivité contrôlée — IxDF Hover Controls — animation au hover seulement
//   P3 Non-interactivité par défaut — Smashing Card patterns — l'action se place à l'intérieur
//   P4 Cibles tactiles ≥ 24×24px — IxDF Touch Targets — icône 36px, non-interactive
//   P5 Heading niveau flexible — NN/g Visual Hierarchy — attribut heading-level (défaut 3)
//   P6 Variante contextuelle — Dashboard Design Patterns — SaaS (couleur) vs marketing (gradient)
//   P7 prefers-reduced-motion — IxDF Accessibilité — border visible, transition désactivée
//   P8 Markup accessible — IF Transparence — heading + slot suffisent sans aria-label supplémentaire
//
// Attributs :
//   heading       — titre de la carte (court, max 2-3 mots)
//   heading-level — niveau du heading HTML, 1-6 (défaut : 3)
//   variant       — "default" | "marketing"
//
// Slots :
//   slot[name="icon"] → icône SVG (20×20px recommandé)
//   slot (défaut)     → description courte
//
// Contrat token :
//   border-bottom    → --agtc-semantic-color-action-primary
//   gradient (mktg)  → --agtc-semantic-color-action-primary + --agtc-semantic-color-brand-accent
//   fond carte       → --agtc-semantic-color-background-overlay-dark
//   bordure carte    → --agtc-semantic-color-border-overlay-dark
// ────────────────────────────────────────────────────────────────────────────

class AgtcFeatureCard extends LitElement {
  static properties = {
    heading:      { type: String },
    headingLevel: { type: Number, attribute: 'heading-level' },
    variant:      { type: String },
  };

  constructor() {
    super();
    this.heading      = '';
    this.headingLevel = 3;
    this.variant      = 'default';
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
      padding: 1.5rem;
      background: var(--agtc-semantic-color-background-overlay-dark, rgba(12, 15, 25, .78));
      backdrop-filter: blur(18px);
      border: 1px solid var(--agtc-semantic-color-border-overlay-dark, rgba(255,255,255,.06));
      overflow: hidden;
      min-height: 200px;
    }

    :host::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 3px;
      background: var(--agtc-semantic-color-action-primary, #12a594);
      transform: scaleX(0.16);
      transform-origin: left;
      transition: transform .28s ease;
    }

    :host([variant="marketing"])::after {
      background: linear-gradient(
        90deg,
        var(--agtc-semantic-color-action-primary, #12a594),
        var(--agtc-semantic-color-brand-accent, #e35d6a)
      );
    }

    :host(:hover)::after,
    :host(:focus-within)::after {
      transform: scaleX(1);
    }

    /* P7 — prefers-reduced-motion : border toujours visible, transition désactivée */
    @media (prefers-reduced-motion: reduce) {
      :host::after {
        transform: scaleX(1);
        transition: none;
      }
    }

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      color: var(--agtc-semantic-color-action-primary, #12a594);
      margin-bottom: .875rem;
      flex-shrink: 0;
    }

    ::slotted([slot="icon"]) {
      width: 1.25rem;
      height: 1.25rem;
    }

    .heading {
      font-size: .95rem;
      font-weight: 700;
      color: var(--agtc-semantic-color-text-on-dark, rgba(255,255,255,1.00));
      margin: 0 0 .5rem;
      line-height: 1.3;
    }

    .body {
      font-size: .875rem;
      color: var(--agtc-semantic-color-text-on-dark-secondary, rgba(255,255,255,0.75));
      line-height: 1.6;
      flex: 1;
    }
  `;

  _renderHeading() {
    const level = Math.min(Math.max(this.headingLevel, 1), 6);
    return html`<div class="heading" role="heading" aria-level="${level}">${this.heading}</div>`;
  }

  render() {
    const hasIcon = this.querySelector('[slot="icon"]') !== null;
    return html`
      ${hasIcon ? html`<div class="icon-wrap"><slot name="icon"></slot></div>` : ''}
      ${this._renderHeading()}
      <div class="body"><slot></slot></div>
    `;
  }
}

customElements.define('agtc-feature-card', AgtcFeatureCard);
