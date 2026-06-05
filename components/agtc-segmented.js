import { LitElement, html, css } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Contrôle segmenté MONO-SÉLECTION à EFFET IMMÉDIAT (2–5 options courtes).
//
//   .options = [{ value, label, icon? } | "Label"]
//   value="…"        — valeur sélectionnée (toujours exactement une, SG1)
//   label="…"        — aria-label du groupe (requis pour l'accessibilité)
//   equal-width      — segments à largeur égale
//
// Émet `change` (detail: { value }) à chaque sélection.
//
// PATTERN ARIA (SG2, écart assumé vs agtc-radio-group) : groupe de <button> avec
// aria-current sur le segment actif, navigation Tab native (PAS de flèches),
// effet immédiat — recommandé par Primer pour un réglage instantané (≠ radiogroup
// qui implique soumission, ≠ tablist qui change de panneau).
//
// Patterns UX de référence appliqués (ADR-036/044, tous approuvés SG1–SG8) :
//   Groupe de boutons + aria-current + effet immédiat — Primer :
//     https://primer.style/product/components/segmented-control/accessibility/
//   État sélectionné pas par la couleur seule (fond plein + poids) — WCAG 1.4.1
//   Détail : guidelines/components/segmented.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

class AgtcSegmented extends LitElement {
  static properties = {
    options:    { type: Array },
    value:      { type: String },
    label:      { type: String },
    equalWidth: { type: Boolean, attribute: 'equal-width' },
  };

  constructor() {
    super();
    this.options = [];
    this.value = '';
    this.equalWidth = false;
  }

  updated() {
    if (!this.label) {
      console.warn('[agtc-segmented] aucun label — le groupe doit être nommé pour les AT. Ajouter label="…".');
    }
  }

  _opt(o) {
    if (typeof o === 'string') return { value: o, label: o };
    return { value: o.value, label: o.label ?? o.value, icon: o.icon };
  }

  _select(value) {
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true, composed: true }));
  }

  static styles = css`
    :host { display: inline-block; }

    .track {
      display: inline-flex;
      gap: 2px;
      padding: 2px;
      background: var(--agtc-segmented-default-track-background);
      border-radius: var(--agtc-segmented-default-radius);
    }
    :host([equal-width]) .track { display: flex; }

    button {
      flex: 1 1 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 5px 12px;
      border: none;
      border-radius: calc(var(--agtc-segmented-default-radius) - 2px);
      background: none;
      color: var(--agtc-segmented-default-text);
      font-family: inherit;
      font-size: var(--agtc-semantic-typography-label-size);
      font-weight: var(--agtc-semantic-typography-label-weight);
      line-height: 1.2;
      white-space: nowrap;
      cursor: pointer;
      transition: background .12s, color .12s;
    }
    button:hover { color: var(--agtc-segmented-default-text-hover); }

    /* État sélectionné : fond plein + texte contrasté (pas la couleur seule, SG4) */
    button[aria-current="true"] {
      background: var(--agtc-segmented-default-selected-background);
      color: var(--agtc-segmented-default-selected-text);
      font-weight: 700;
    }

    button:focus-visible {
      outline: 2px solid var(--agtc-segmented-default-border-focus);
      outline-offset: 2px;
    }
  `;

  render() {
    const opts = (this.options || []).map((o) => this._opt(o));
    return html`
      <div class="track" role="group" aria-label="${this.label || ''}">
        ${opts.map((o) => html`
          <button
            type="button"
            aria-current="${this.value === o.value ? 'true' : 'false'}"
            @click="${() => this._select(o.value)}"
          >
            ${o.icon ? html`<agtc-icon name="${o.icon}" size="inline" decorative></agtc-icon>` : ''}
            ${o.label}
          </button>
        `)}
      </div>
    `;
  }
}

customElements.define('agtc-segmented', AgtcSegmented);
export { AgtcSegmented };
