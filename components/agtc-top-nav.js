import { LitElement, html, css, nothing } from 'lit';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Navigation principale horizontale — pattern tabs visuels full-height header.
// Sémantique : role=navigation (pas role=tablist) + aria-current="page".
//
//   items = [{ label?, labelFr?, labelEn?, href, cta? }]
//     label    — texte unique (langue neutre)
//     labelFr  — texte français (prioritaire si data-lang="fr")
//     labelEn  — texte anglais (prioritaire si data-lang="en")
//     href     — URL de destination
//     cta      — true → bouton d'adoption (Démarrer), sort du pattern tab
//
//   current   — pathname actif pour la détection automatique (défaut: window.location.pathname)
//   nav-label — aria-label de l'élément <nav> (requis pour les AT)
//
// Bilinguisme : le composant observe document.documentElement[data-lang]
//   et re-render automatiquement quand la langue change.
//
// Mobile : le composant gère son propre état responsive.
//   Ajouter la classe CSS .open (ou l'attribut open) sur l'hôte pour ouvrir.
//   Le site contrôle l'ouverture via : topNavEl.classList.toggle('open')
//
// DISTINCTION CRITIQUE avec agtc-tabs :
//   agtc-tabs    → role=tablist, navigation in-page, panneau de contenu associé
//   agtc-top-nav → role=navigation, navigation inter-pages, aria-current="page"
//
// Règle no-visited-nav (ADR-047) : :visited neutralisé sur tous les liens.
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
    _lang:    { type: String, state: true },
  };

  constructor() {
    super();
    this.items    = [];
    this.current  = '';
    this.navLabel = 'Navigation principale';
    this._lang    = 'fr';
    this._observer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.current && typeof window !== 'undefined') {
      this.current = window.location.pathname;
    }
    if (typeof document !== 'undefined') {
      this._lang = document.documentElement.dataset.lang || 'fr';
      this._observer = new MutationObserver(() => {
        this._lang = document.documentElement.dataset.lang || 'fr';
      });
      this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  _label(item) {
    if (this._lang === 'en') return item.labelEn || item.label || '';
    return item.labelFr || item.label || '';
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

    /* ── Mobile : drawer vertical ─────────────────────────── */
    @media (max-width: 768px) {
      nav {
        display: none;
        position: fixed;
        top: var(--agtc-header-height, 64px);
        left: 0;
        right: 0;
        flex-direction: column;
        background: var(--agtc-semantic-color-background-surface);
        border-bottom: 1px solid var(--agtc-semantic-color-border-default);
        padding: 8px 0;
        z-index: 99;
        box-shadow: var(--agtc-shadow-md);
        margin-left: 0;
        align-self: auto;
      }

      /* Ouverture via classe .open sur l'hôte */
      :host(.open) nav {
        display: flex;
      }

      a {
        padding: 12px 24px;
        border-bottom: none;
        border-radius: 0;
        font-size: var(--agtc-semantic-typography-label-size);
      }

      a[aria-current="page"] {
        border-bottom: none;
        border-left: 3px solid var(--agtc-component-top-nav-tab-indicator-color);
        padding-left: 21px;
        border-bottom-color: transparent;
      }

      a.cta {
        height: auto;
        align-self: unset;
        margin: 4px 16px;
        border-radius: var(--agtc-semantic-radius-control);
        border-bottom: none;
        padding: 10px 14px;
      }
    }
  `;

  render() {
    return html`
      <nav part="nav" aria-label="${this.navLabel}">
        ${this.items.map(item => {
          const active = this._isActive(item.href);
          return html`<a
            href="${item.href}"
            class="${item.cta ? 'cta' : ''}"
            aria-current="${active ? 'page' : nothing}"
          >${this._label(item)}</a>`;
        })}
      </nav>
    `;
  }
}

customElements.define('agtc-top-nav', AgtcTopNav);
export { AgtcTopNav };
