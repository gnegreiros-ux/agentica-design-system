import { LitElement, html, css } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Onglets horizontaux (tablist/tab/tabpanel) — navigation in-page avec panneau.
//
//   .tabs = [{ value, label, href? }]
//   selected="…"       — valeur de l'onglet actif (défaut : premier sans href)
//   label="…"          — aria-label du tablist (requis pour les AT)
//   activation="auto"  — "auto" : flèches activent immédiatement (défaut)
//                        "manual" : flèches déplacent le focus, Entrée active
//
// Émet `change` (detail: { value }) sur changement d'onglet in-page.
//
// PATTERN ARIA (W3C APG — Tabs Pattern) :
//   role=tablist · role=tab · role=tabpanel
//   aria-selected sur le tab actif · aria-controls · aria-labelledby
//   Navigation : ←/→ (roving tabindex) · Home/End · Tab sort du groupe
//   Activation automatique par défaut (APG — contenu préchargé)
//
// Règle no-visited-nav (ADR-047) : :visited neutralisé sur les tabs.
//
// Patterns UX de référence appliqués (ADR-056) :
//   Tablist au-dessus du panel — NN/g https://www.nngroup.com/articles/tabs-used-right/
//   Activation automatique au focus — W3C APG https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
//   Labels en casse naturelle (jamais ALL-CAPS) — NN/g
//   href optionnel pour navigation tabs — NN/g
//   Détail : guidelines/components/tabs.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

class AgtcTabs extends LitElement {
  static properties = {
    tabs:       { type: Array },
    selected:   { type: String },
    label:      { type: String },
    activation: { type: String },
  };

  constructor() {
    super();
    this.tabs = [];
    this.selected = '';
    this.label = '';
    this.activation = 'auto';
  }

  willUpdate(changed) {
    if ((changed.has('tabs') || changed.has('selected')) && !this.selected && this.tabs.length) {
      const first = this.tabs.find(t => !t.href);
      if (first) this.selected = first.value;
    }
  }

  updated() {
    if (!this.label) {
      console.warn('[agtc-tabs] label requis — le tablist doit être nommé pour les AT. Ajouter label="…".');
    }
  }

  _select(value) {
    if (value === this.selected) return;
    this.selected = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true, composed: true }));
  }

  _focusTab(idx) {
    this.shadowRoot?.querySelector(`[data-idx="${idx}"]`)?.focus();
  }

  _onKeyDown(e, idx) {
    const len = this.tabs.length;
    let newIdx;
    switch (e.key) {
      case 'ArrowRight': newIdx = (idx + 1) % len; break;
      case 'ArrowLeft':  newIdx = (idx - 1 + len) % len; break;
      case 'Home':       newIdx = 0; break;
      case 'End':        newIdx = len - 1; break;
      default: return;
    }
    e.preventDefault();
    this._focusTab(newIdx);
    if (this.activation === 'auto' && !this.tabs[newIdx].href) {
      this._select(this.tabs[newIdx].value);
    }
  }

  static styles = css`
    :host { display: block; }

    .tablist-wrapper {
      border-bottom: 1px solid var(--agtc-component-tabs-default-border);
    }

    [role="tablist"] {
      display: flex;
      gap: 0;
      margin: 0;
      padding: 0;
    }

    .tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding:
        var(--agtc-component-tabs-default-padding-y)
        var(--agtc-component-tabs-default-padding-x);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      color: var(--agtc-component-tabs-default-tab-text);
      font-family: inherit;
      font-size: var(--agtc-semantic-typography-label-size);
      font-weight: var(--agtc-semantic-typography-label-weight);
      line-height: 1.4;
      white-space: nowrap;
      cursor: pointer;
      text-decoration: none;
      transition: color .12s, border-color .12s;
    }

    .tab:hover { color: var(--agtc-component-tabs-default-tab-text-hover); }

    /* :visited neutralisé — ADR-047 (no-visited-nav) */
    .tab:visited { color: var(--agtc-component-tabs-default-tab-text); }

    .tab[aria-selected="true"] {
      color: var(--agtc-component-tabs-default-tab-text-active);
      font-weight: 700;
      border-bottom-color: var(--agtc-component-tabs-default-indicator);
    }

    .tab:focus-visible {
      outline: 2px solid var(--agtc-component-tabs-default-border-focus);
      outline-offset: 2px;
      border-radius: 2px;
    }

    [role="tabpanel"] { padding-top: 16px; }
    [role="tabpanel"][hidden] { display: none; }
  `;

  render() {
    const tabs = this.tabs || [];
    return html`
      <div class="tablist-wrapper">
        <div role="tablist" aria-label="${this.label || ''}">
          ${tabs.map((tab, idx) => {
            const isSelected = this.selected === tab.value;
            const tabIndex = isSelected ? 0 : -1;

            if (tab.href) {
              return html`
                <a
                  role="tab"
                  class="tab"
                  id="tab-${tab.value}"
                  href="${tab.href}"
                  aria-selected="${isSelected ? 'true' : 'false'}"
                  tabindex="${tabIndex}"
                  data-idx="${idx}"
                  @keydown="${(e) => this._onKeyDown(e, idx)}"
                >${tab.label}</a>
              `;
            }

            return html`
              <button
                role="tab"
                class="tab"
                type="button"
                id="tab-${tab.value}"
                aria-selected="${isSelected ? 'true' : 'false'}"
                aria-controls="panel-${tab.value}"
                tabindex="${tabIndex}"
                data-idx="${idx}"
                @click="${() => this._select(tab.value)}"
                @keydown="${(e) => this._onKeyDown(e, idx)}"
              >${tab.label}</button>
            `;
          })}
        </div>
      </div>

      ${tabs.filter(t => !t.href).map(tab => html`
        <div
          role="tabpanel"
          id="panel-${tab.value}"
          aria-labelledby="tab-${tab.value}"
          ?hidden="${this.selected !== tab.value}"
        >
          <slot name="${tab.value}"></slot>
        </div>
      `)}
    `;
  }
}

customElements.define('agtc-tabs', AgtcTabs);
export { AgtcTabs };
