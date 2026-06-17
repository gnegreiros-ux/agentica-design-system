import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRAT ────────────────────────────────────────────────────────────────
// Table de données en LECTURE SEULE, lisible et accessible.
//
// API pilotée par données (moitié « composant » du mix — ADR-040) :
//   .columns = [{ label, align?, width? } | "Label", …]
//   .rows    = [["a","b"], …]   (positionnel)  ou  [{ key: "valeur" }, …]
//   caption="…"  — légende accessible (T2). Masquable visuellement : caption-hidden
//   striped       — zébrage (T4, option ; séparateurs de lignes par défaut)
//   sticky-header — en-tête figé (T6)
//   density="compact|comfortable"  (T9, compact par défaut)
//
// La moitié « light DOM » du mix = classe .agtc-table appliquée à un <table>
// statique réel (mêmes tokens via --agtc-component-table-*) — voir guideline.
//
// HORS PÉRIMÈTRE v1 (porte ouverte — ADR-040) : tri, filtrage, pagination.
//   L'API columns/rows a été choisie pour les accueillir sans rupture
//   (futur column.sortable + événement @sort) — non implémentés ici.
//
// Patterns UX de référence appliqués (ADR-036/040, tous approuvés T1–T10) :
//   HTML sémantique + scope="col" + <caption> — Smashing :
//     https://www.smashingmagazine.com/2019/01/table-design-patterns-web/
//   Alignement texte/gauche, numérique/droite ; séparateurs ou zébrage ;
//     hover de ligne ; en-tête figé ; 1ʳᵉ colonne = identifiant lisible — NN/g :
//     https://www.nngroup.com/articles/data-tables/
//   Scroll horizontal + indicateur d'overflow — Smashing (idem)
//   Détail : guidelines/components/table.md § PATTERNS UX DE RÉFÉRENCE
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
      console.warn('[agtc-table] aucun caption — la table devrait décrire son contenu (WCAG 1.3.1, T2). Ajouter caption="…" (masquable via caption-hidden).');
    }
  }

  static styles = css`
    :host {
      display: block;
    }

    /* Conteneur scroll horizontal + indicateur d'overflow (T7) ─────────────── */
    .scroll {
      overflow-x: auto;
      border: 1px solid var(--agtc-component-table-default-border);
      border-radius: var(--agtc-component-table-default-radius);
      /* Ombres de bord : apparaissent quand il reste du contenu à scroller. */
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

    /* Hover de ligne (T5) ──────────────────────────────────────────────────── */
    tbody tr:hover { background: var(--agtc-component-table-default-row-hover); }

    /* Zébrage optionnel (T4) ───────────────────────────────────────────────── */
    :host([striped]) tbody tr:nth-child(even) { background: var(--agtc-component-table-default-stripe); }
    :host([striped]) tbody tr:nth-child(even):hover { background: var(--agtc-component-table-default-row-hover); }

    /* En-tête figé optionnel (T6) ──────────────────────────────────────────── */
    :host([sticky-header]) thead th {
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `;

  // Normalise une colonne : "Label" → { label, align: 'start' }
  _col(c) {
    if (typeof c === 'string') return { label: c, align: 'start' };
    return { label: c.label ?? '', align: c.align ?? 'start', width: c.width, key: c.key };
  }

  // Normalise une ligne en tableau de cellules, dans l'ordre des colonnes.
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
