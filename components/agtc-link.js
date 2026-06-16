import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Lien de NAVIGATION textuel (un lien navigue ; pour une action, utiliser agtc-button).
// Texte via <slot>.
//
//   href="…"                        — destination (requis)
//   external                        — force le traitement « lien externe »
//                                     (auto-détecté pour http(s) d'une autre origine)
//   underline="always|hover|none"   — soulignement (défaut always, WCAG 1.4.1)
//
// Lien externe ⇒ target="_blank" + rel="noopener noreferrer" + icône +
//   texte masqué « (ouvre dans un nouvel onglet) » (l'icône seule ne suffit pas — WCAG H83).
//
// Patterns UX de référence appliqués (ADR-036/043, tous approuvés LK1–LK8) :
//   Soulignement en texte courant (distinguable au-delà de la couleur) — NN/g :
//     https://www.nngroup.com/articles/guidelines-for-visualizing-links/
//   Avertissement nouvel onglet (icône + texte AT) — WCAG H83 :
//     https://www.w3.org/WAI/WCAG21/Techniques/html/H83
//   Texte descriptif (jamais « cliquez ici ») — NN/g (idem)
//   Détail : guidelines/components/link.md § PATTERNS UX DE RÉFÉRENCE
// ────────────────────────────────────────────────────────────────────────────

const GENERIC_TEXT = ['cliquez ici', 'cliquer ici', 'ici', 'click here', 'here', 'lien', 'link', 'en savoir plus', 'read more'];

class AgtcLink extends LitElement {
  static properties = {
    href:      { type: String },
    external:  { type: Boolean, reflect: true },
    underline: { type: String, reflect: true },
  };

  constructor() {
    super();
    this.href = '#';
    this.external = false;
    this.underline = 'always';
  }

  // Externe si demandé explicitement, ou si http(s) vers une autre origine.
  get _isExternal() {
    if (this.external) return true;
    if (!/^https?:\/\//i.test(this.href || '')) return false;
    try { return new URL(this.href).origin !== globalThis.location?.origin; }
    catch { return false; }
  }

  updated() {
    const text = (this.textContent || '').trim().toLowerCase();
    if (text && GENERIC_TEXT.includes(text)) {
      console.warn(`[agtc-link] texte de lien générique ("${text}") — préférer un libellé descriptif lisible hors contexte (NN/g, WCAG 2.4.4).`);
    }
  }

  static styles = css`
    :host { display: inline; }

    a {
      color: var(--agtc-component-link-default-text);
      text-decoration: underline;
      text-underline-offset: 2px;
      border-radius: 2px;
      cursor: pointer;
    }
    :host([underline="hover"]) a,
    :host([underline="none"]) a { text-decoration: none; }
    :host([underline="hover"]) a:hover { text-decoration: underline; }

    a:hover { color: var(--agtc-component-link-default-text-hover); }

    a:focus-visible {
      outline: 2px solid var(--agtc-component-link-default-border-focus);
      outline-offset: 2px;
    }

    .external-icon {
      display: inline-block;
      vertical-align: baseline;
      margin-left: 2px;
      line-height: 0;
    }

    .visually-hidden {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0);
      white-space: nowrap; border: 0;
    }
  `;

  render() {
    const ext = this._isExternal;
    return html`
      <a
        href="${this.href}"
        target="${ifDefined(ext ? '_blank' : undefined)}"
        rel="${ifDefined(ext ? 'noopener noreferrer' : undefined)}"
      ><slot></slot>${ext ? html`<span class="external-icon"><agtc-icon name="arrow-up-right" size="inline" decorative></agtc-icon></span><span class="visually-hidden"> (ouvre dans un nouvel onglet)</span>` : ''}</a>
    `;
  }
}

customElements.define('agtc-link', AgtcLink);
export { AgtcLink };
