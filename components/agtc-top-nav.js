import { LitElement, html, css, nothing } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Navigation principale horizontale — pattern tabs visuels full-height header.
// Sémantique : role=navigation (pas role=tablist) + aria-current="page".
//
//   items = [{ label, href, cta? }]
//     label  — texte du lien (gérer la langue côté consommateur)
//     href   — URL de destination
//     cta    — true → bouton d'adoption (Démarrer), sort du pattern tab
//
//   current   — pathname actif pour la détection automatique (défaut: window.location.pathname)
//   nav-label — aria-label de l'élément <nav> (requis pour les AT)
//
// DISTINCTION CRITIQUE avec agtc-tabs :
//   agtc-tabs    → role=tablist, navigation in-page, panneau de contenu associé
//   agtc-top-nav → role=navigation, navigation inter-pages, aria-current="page"
//
// Règle no-visited-nav (ADR-047) : :visited neutralisé sur tous les liens.
//   Exception Safari (ADR-059) : la valeur résolue est fournie via CSS custom
//   property car var() est ignoré dans :visited sur WebKit.
//
// Patterns UX de référence appliqués (ADR-060) :
//   Nav principale = landmark navigation — W3C WAI https://www.w3.org/WAI/ARIA/apg/
//   aria-current="page" sur le lien actif — WCAG 2.4.4 + 4.1.2
//   Indicateur visuel border-bottom full-height — NN/g nav horizontale
//   Bouton CTA visuellement distinct des tabs — IxDF clear primary action
//   Détail : guidelines/components/top-nav.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

const SECTIONS = ['tokens', 'components', 'foundations', 'decisions', 'agents', 'guidelines'];

class AgtcTopNav extends LitElement {
  static properties = {
    items:    { type: Array },
    current:  { type: String },
    navLabel: { type: String, attribute: 'nav-label' },
  };

  constructor() {
    super();
    this.items    = [];
    this.current  = '';
    this.navLabel = 'Navigation principale';
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.current && typeof window !== 'undefined') {
      this.current = window.location.pathname;
    }
  }

  _isActive(href) {
    const p = this.current;
    const parts = href.replace(/^(\.\.\/)+/, '/').split('/').filter(Boolean);
    const hFile = parts[parts.length - 1] || '';
    const hDir  = parts.length > 1 ? parts[parts.length - 2] : '';
    if (hDir && SECTIONS.includes(hDir)) return p.includes('/' + hDir + '/');
    if (hFile === 'index.html' && !hDir) {
      return p === '/' || (p.endsWith('/index.html') && SECTIONS.every(s => !p.includes('/' + s + '/')));
    }
    if (hFile) return p.endsWith('/' + hFile);
    return false;
  }

  static styles = css`
    :host {
      display: contents;
    }

    nav {
      display: flex;
      align-items: stretch;
      align-self: stretch;
      gap: 0;
      margin-left: auto;
    }

    /* ── Tab links (liens inter-pages) ── */
    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--agtc-component-top-nav-tab-color);
      font-size: var(--agtc-component-top-nav-tab-font-size);
      font-weight: var(--agtc-component-top-nav-tab-font-weight);
      padding: 0 var(--agtc-component-top-nav-tab-padding-x);
      border-radius: 0;
      border-bottom: var(--agtc-component-top-nav-tab-indicator-width) solid transparent;
      white-space: nowrap;
      transition: background .12s, color .12s, border-color .12s;
      -webkit-font-smoothing: antialiased;
    }

    /* :visited neutralisé — ADR-047. Valeur littérale pour Safari (ADR-059). */
    a:visited { color: var(--agtc-component-top-nav-tab-color); }

    a:hover {
      background: var(--agtc-component-top-nav-tab-background-hover);
      color: var(--agtc-component-top-nav-tab-color-hover);
    }

    a:active {
      background: var(--agtc-component-top-nav-tab-background-hover);
      color: var(--agtc-component-top-nav-tab-color-hover);
    }

    a:focus-visible {
      outline: 2px solid var(--agtc-component-top-nav-tab-focus-ring);
      outline-offset: 2px;
    }

    /* Page active — indicateur border-bottom, pas de fond rempli */
    a[aria-current="page"] {
      background: transparent;
      color: var(--agtc-component-top-nav-tab-color-active);
      font-weight: var(--agtc-component-top-nav-tab-font-weight-active);
      border-bottom-color: var(--agtc-component-top-nav-tab-indicator-color);
    }

    /* ── CTA button — sort du pattern tab ── */
    a.cta {
      height: auto;
      align-self: center;
      padding: var(--agtc-component-top-nav-cta-padding-y) var(--agtc-component-top-nav-cta-padding-x);
      border-radius: var(--agtc-component-top-nav-cta-radius);
      border-bottom: none;
      background: var(--agtc-component-top-nav-cta-background);
      color: var(--agtc-component-top-nav-cta-color);
      font-weight: var(--agtc-component-top-nav-tab-font-weight);
      margin-left: var(--agtc-component-top-nav-cta-gap);
    }

    a.cta:visited { color: var(--agtc-component-top-nav-cta-color); }

    a.cta:hover,
    a.cta:active {
      background: var(--agtc-component-top-nav-cta-background-hover);
      color: var(--agtc-component-top-nav-cta-color);
    }

    /* Le CTA ne porte pas d'indicateur tab même s'il est "actif" */
    a.cta[aria-current="page"] {
      background: var(--agtc-component-top-nav-cta-background);
      border-bottom: none;
    }
  `;

  render() {
    return html`
      <nav aria-label="${this.navLabel}">
        ${this.items.map(item => {
          const active = this._isActive(item.href);
          return html`<a
            href="${item.href}"
            class="${item.cta ? 'cta' : ''}"
            aria-current="${active ? 'page' : nothing}"
          >${item.label}</a>`;
        })}
      </nav>
    `;
  }
}

customElements.define('agtc-top-nav', AgtcTopNav);
export { AgtcTopNav };
