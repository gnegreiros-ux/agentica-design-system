import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// READ-ONLY data table, readable and accessible.
//
// Data-driven API (the "component" half of the mix — ADR-040):
//   .columns = [{ label, align?, width? } | "Label", …]
//   .rows    = [["a","b"], …]   (positional)  or  [{ key: "value" }, …]
//   caption="…"  — accessible caption (T2). Visually hideable: caption-hidden
//   striped       — zebra striping (T4, optional; row separators by default)
//   sticky-header — pinned header (T6)
//   density="compact|comfortable"  (T9, compact by default)
//
// The "light DOM" half of the mix = .agtc-table class applied to a real
// static <table> (same tokens via --agtc-component-table-*) — see guideline.
//
// OUT OF SCOPE v1 (door left open — ADR-040): sorting, filtering, pagination.
//   The columns/rows API was chosen to accommodate them without breakage
//   (future column.sortable + @sort event) — not implemented here.
//
// UX reference patterns applied (ADR-036/040, all approved T1–T10):
//   Semantic HTML + scope="col" + <caption> — Smashing:
//     https://www.smashingmagazine.com/2019/01/table-design-patterns-web/
//   Alignment text/left, numeric/right; separators or zebra striping;
//     row hover; pinned header; 1st column = readable identifier — NN/g:
//     https://www.nngroup.com/articles/data-tables/
//   Horizontal scroll + overflow indicator — Smashing (same)
//   Details: guidelines/components/table.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

class AgtcTable extends LitElement {
  static properties = {
    columns:       { type: Array },
    rows:          { type: Array },
    caption:       { type: String },
    captionHidden: { type: Boolean, attribute: 'caption-hidden' },
    striped:       { type: Boolean },
    stickyHeader:  { type: Boolean, attribute: 'sticky-header' },
    density:       { type: String },
  };

  constructor() {
    super();
    this.columns       = [];
    this.rows          = [];
    this.captionHidden = false;
    this.striped       = false;
    this.stickyHeader  = false;
    this.density       = 'compact';
  }

  updated() {
    if (!this.caption) {
      console.warn('[agtc-table] no caption — the table should describe its content (WCAG 1.3.1, T2). Add caption="…" (hideable via caption-hidden).');
    }
  }

  static styles = css`
    :host {
      display: block;
    }

    /* Horizontal scroll container + overflow indicator (T7) ────────────────── */
    .scroll {
      overflow-x: auto;
      border: 1px solid var(--agtc-component-table-default-border);
      border-radius: var(--agtc-component-table-default-radius);
      /* Edge shadows: appear when there is content left to scroll. */
      background:
        linear-gradient(to right, var(--agtc-component-table-default-header-background), rgba(255,255,255,0)) left / 24px 100% no-repeat,
        linear-gradient(to left,  var(--agtc-component-table-default-header-background), rgba(255,255,255,0)) right / 24px 100% no-repeat;
      background-attachment: local, local;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--agtc-component-table-default-font-size);
      color: var(--agtc-component-table-default-cell-text);
      background: var(--agtc-semantic-color-background-surface);
    }

    caption {
      text-align: start;
      color: var(--agtc-component-table-default-caption-text);
      padding: var(--agtc-component-table-padding-y-compact) var(--agtc-component-table-padding-x);
      font-size: var(--agtc-component-table-default-font-size);
    }
    caption.visually-hidden {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0);
      white-space: nowrap; border: 0;
    }

    th {
      text-align: start;
      font-weight: var(--agtc-semantic-typography-label-weight);
      color: var(--agtc-component-table-default-header-text);
      background: var(--agtc-component-table-default-header-background);
      white-space: nowrap;
    }

    th, td {
      padding: var(--agtc-component-table-padding-y-compact) var(--agtc-component-table-padding-x);
      border-bottom: 1px solid var(--agtc-component-table-default-border);
      vertical-align: top;
    }
    :host([density="comfortable"]) th,
    :host([density="comfortable"]) td {
      padding: var(--agtc-component-table-padding-y-comfortable) var(--agtc-component-table-padding-x);
    }

    tbody tr:last-child td { border-bottom: none; }

    /* Row hover (T5) ───────────────────────────────────────────────────────── */
    tbody tr:hover { background: var(--agtc-component-table-default-row-hover); }

    /* Optional zebra striping (T4) ─────────────────────────────────────────── */
    :host([striped]) tbody tr:nth-child(even) { background: var(--agtc-component-table-default-stripe); }
    :host([striped]) tbody tr:nth-child(even):hover { background: var(--agtc-component-table-default-row-hover); }

    /* Optional pinned header (T6) ──────────────────────────────────────────── */
    :host([sticky-header]) thead th {
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `;

  // Normalizes a column: "Label" → { label, align: 'start' }
  _col(c) {
    if (typeof c === 'string') return { label: c, align: 'start' };
    return { label: c.label ?? '', align: c.align ?? 'start', width: c.width, key: c.key };
  }

  // Normalizes a row into an array of cells, in column order.
  _cells(row, cols) {
    if (Array.isArray(row)) return row;
    return cols.map((c) => (c.key != null ? row[c.key] : '') ?? '');
  }

  render() {
    const cols = (this.columns || []).map((c) => this._col(c));
    const rows = (this.rows || []).map((r) => this._cells(r, cols));

    return html`
      <div class="scroll">
        <table>
          ${this.caption ? html`
            <caption class="${this.captionHidden ? 'visually-hidden' : ''}">${this.caption}</caption>
          ` : ''}
          <thead>
            <tr>
              ${cols.map((c) => html`
                <th scope="col" style="text-align:${c.align};${c.width ? `width:${c.width}` : ''}">${c.label}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${rows.map((cells) => html`
              <tr>
                ${cols.map((c, i) => html`
                  <td style="text-align:${c.align}">${cells[i] ?? ''}</td>
                `)}
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define('agtc-table', AgtcTable);
export { AgtcTable };
