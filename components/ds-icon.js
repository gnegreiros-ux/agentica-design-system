import { LitElement, html, css } from 'lit';
import { createIcons, icons } from 'lucide';

class DsIcon extends LitElement {
  static properties = {
    name:      { type: String },
    size:      { type: String },  // 'inline' | 'control' | 'nav'
    label:     { type: String },
    decorative:{ type: Boolean }
  };

  static styles = css`
    :host { display: inline-flex; align-items: center; justify-content: center; }

    svg {
      width: var(--agtc-icon-size, var(--agtc-semantic-icon-size-control));
      height: var(--agtc-icon-size, var(--agtc-semantic-icon-size-control));
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    :host([size='inline'])  { --agtc-icon-size: var(--agtc-semantic-icon-size-inline); }
    :host([size='control']) { --agtc-icon-size: var(--agtc-semantic-icon-size-control); }
    :host([size='nav'])     { --agtc-icon-size: var(--agtc-semantic-icon-size-nav); }
  `;

  render() {
    if (!this.name) return html``;

    const ariaAttrs = this.decorative
      ? { 'aria-hidden': 'true', role: 'none' }
      : { 'aria-label': this.label || this.name, role: 'img' };

    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden=${ariaAttrs['aria-hidden'] || 'false'}
        aria-label=${ariaAttrs['aria-label'] || ''}
        role=${ariaAttrs.role}
        data-lucide=${this.name}
      ></svg>
    `;
  }

  updated() {
    // Injecte les paths SVG Lucide dans le shadow DOM après rendu
    const svg = this.shadowRoot?.querySelector('svg[data-lucide]');
    if (!svg || !this.name) return;
    const iconName = this.name
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    const iconDef = icons[iconName];
    if (!iconDef) {
      console.warn(`[ds-icon] Icône "${this.name}" introuvable dans Lucide.`);
      return;
    }
    const [, attrs, children] = iconDef;
    Object.entries(attrs || {}).forEach(([k, v]) => svg.setAttribute(k, v));
    svg.innerHTML = children
      .map(([tag, a]) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(a).forEach(([k, v]) => el.setAttribute(k, v));
        return el.outerHTML;
      })
      .join('');
  }
}

customElements.define('ds-icon', DsIcon);
