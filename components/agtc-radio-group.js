import { LitElement, html } from 'lit';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Container for a group of <agtc-radio>. Carries `role="radiogroup"` and handles:
//   - exclusivity (a single selected radio)
//   - roving focus (a single tabbable radio at a time)
//   - keyboard navigation (arrows = selection, like a native radio)
//   - emitting `agtc-change { value, name }`
//
// Required because <input type="radio"> elements in separate shadow DOMs do not
// form a native group (see ADR-038).
//
// Details: guidelines/components/radio.md
// ────────────────────────────────────────────────────────────────────────────

class AgtcRadioGroup extends LitElement {
  static properties = {
    name:     { type: String },
    value:    { type: String, reflect: true },
    label:    { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.value = '';
    this._onSelect  = this._onSelect.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'radiogroup');
    this.addEventListener('agtc-radio-select', this._onSelect);
    this.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('agtc-radio-select', this._onSelect);
    this.removeEventListener('keydown', this._onKeydown);
    super.disconnectedCallback();
  }

  firstUpdated() { this._sync(); }
  updated() { this._sync(); }

  get _radios() {
    return [...this.querySelectorAll('agtc-radio')];
  }

  _sync() {
    const radios = this._radios;
    if (this.label) this.setAttribute('aria-label', this.label);

    let anyChecked = false;
    radios.forEach((r) => {
      const sel = r.value === this.value && this.value !== '';
      r.checked = sel;
      r.setAttribute('tabindex', sel ? '0' : '-1');
      if (sel) anyChecked = true;
    });
    // None selected → the first enabled radio stays reachable via keyboard
    if (!anyChecked) {
      const first = radios.find((r) => !r.disabled);
      if (first) first.setAttribute('tabindex', '0');
    }
  }

  _select(value, focus) {
    if (value === this.value) {
      if (focus) this._radios.find((r) => r.value === value)?.focus();
      return;
    }
    this.value = value;
    this._sync();
    if (focus) this._radios.find((r) => r.value === value)?.focus();
    this.dispatchEvent(new CustomEvent('agtc-change', {
      bubbles: true, composed: true, detail: { value: this.value, name: this.name },
    }));
  }

  _onSelect(e) {
    e.stopPropagation();
    this._select(e.detail.value, false);
  }

  _onKeydown(e) {
    const radios = this._radios.filter((r) => !r.disabled);
    if (!radios.length) return;
    const curIdx = radios.findIndex((r) => r.value === this.value);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = curIdx < 0 ? 0 : (curIdx + 1) % radios.length;
      this._select(radios[idx].value, true);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const idx = curIdx < 0 ? radios.length - 1 : (curIdx - 1 + radios.length) % radios.length;
      this._select(radios[idx].value, true);
    } else if (e.key === ' ') {
      // Space alone selects (strict WAI-ARIA radio pattern; Enter is
      // reserved for form submission — see ADR-038)
      const focused = radios.find((r) => r === document.activeElement);
      if (focused) { e.preventDefault(); this._select(focused.value, true); }
    }
  }

  render() {
    return html`<slot @slotchange="${this._sync}"></slot>`;
  }
}

customElements.define('agtc-radio-group', AgtcRadioGroup);
export { AgtcRadioGroup };
