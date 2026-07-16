#!/usr/bin/env node

// Populates @agentica-ds/components package content: every component file copied
// verbatim (unbundled ESM — bundling for the site's own <script> tag is a separate
// concern, handled by bundleComponents() in site/build.js) plus the barrel index.js.
// Cross-component relative imports (e.g. agtc-button.js -> ./agtc-icon.js) stay valid
// since every file lands flat in this same directory.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'components');
const OUT = __dirname;

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.js') && !f.endsWith('.stories.js'));

for (const f of files) {
  fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
}

console.log(`✓ @agentica-ds/components package content built (${files.length} files copied to packages/components/)`);
