import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// English-only content policy (ADR-070/071/075). scripts/audit-language.js catches
// French text left untranslated in source files, but it cannot catch a different bug
// class: a page that IS correctly bilingual by design, where one data cell (a table
// row, a nav link) is hardcoded as a single string instead of a lang-fr/lang-en pair
// — so it never toggles and stays visibly French even with data-lang="en". That bug
// is only visible by actually rendering the page (see the `ia.html` nav link and the
// get-started.html Framework Integration table, both fixed 2026-07-18 this way — a
// text-content scan alone would never have flagged them, since French prose is
// expected to exist somewhere on those pages).
//
// This spec renders every generated page with data-lang="en" and reads the VISIBLE
// text only (innerText, not textContent — innerText excludes anything hidden by the
// site's `html[data-lang="en"] .lang-fr{display:none}` CSS rule, textContent would not).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../../site/dist');

// Same curated word list as scripts/audit-language.js — kept in sync by hand, see
// that file's comment for why these specific words (no plausible English collision).
const STOPWORD_RE = /\b(?:être|où|équipe|système|chemin|aucun|aucune|jamais|doivent|également|vérifier|toujours|avec|dans|sont|cette|ces)\b/;
const ACCENT_RE = /[àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇœŒ]/;

function listPages(dir, base = '') {
  const pages = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      pages.push(...listPages(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.html')) {
      pages.push(rel);
    }
  }
  return pages;
}

const pages = fs.existsSync(DIST) ? listPages(DIST) : [];

// Content that IS French by design and correctly renders regardless of data-lang:
// a verbatim historical quote, a literal field-label/filename being documented, a
// bilingual inline code comment, a font glyph specimen. Narrow on purpose (page +
// distinguishing substring) so a real regression on the same page still gets caught.
// An HTML-comment marker (the source-file `lang-audit-ignore` convention used by
// scripts/audit-language.js) doesn't work here — comments never reach innerText.
const KNOWN_EXCEPTIONS = {
  'agents/index.html': ['Interdit —'], // naming-rule code example: bilingual comment in one line, by design
  'changelog.html': ['Domaine'], // quoting the literal GitHub Projects custom field name
  'decisions/adr-030.html': ['Densité'], // historical bug quote (the bug this ADR fixed)
  'decisions/adr-055.html': ['Copié', 'critères'], // quoting the site's bilingual UI strings
  'decisions/adr-071.html': ['Décideurs', 'Mon intention', 'francophones', 'seulement en anglais'], // literal field-label quote + verbatim human quote
  'decisions/adr-075.html': ['notre-demarche', 'synthèse', 'Synthèse'], // documenting the pre-rename French filenames (ADR-075)
  'foundations/typography.html': ['Æ Ç É'], // Atkinson Hyperlegible glyph specimen — intentional
};

test.describe('Language — English rendering has no French leftovers', () => {
  test.skip(pages.length === 0, 'site/dist not built — run node site/build.js first');

  for (const pagePath of pages) {
    test(`${pagePath} — clean in English mode`, async ({ page }) => {
      await page.goto(`/${pagePath}?lang=en`);
      await page.waitForLoadState('networkidle');

      const visibleText = await page.evaluate(() => document.body.innerText);
      const exceptions = KNOWN_EXCEPTIONS[pagePath] || [];
      const hits = [];
      visibleText.split('\n').forEach((line, idx) => {
        if (exceptions.some(ex => line.includes(ex))) return;
        const match = line.match(ACCENT_RE) || line.match(STOPWORD_RE);
        if (match) hits.push(`  line ${idx + 1}: "${match[0]}" in "${line.trim().slice(0, 100)}"`);
      });

      expect(hits, `French content visible in ${pagePath} with data-lang=en:\n${hits.join('\n')}`).toEqual([]);
    });
  }
});
