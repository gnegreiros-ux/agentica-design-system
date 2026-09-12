// CI gate for governance/rules' "human always has the final word" rule applied
// to GOVERNANCE.md itself: regenerates the expected derived content in memory
// and compares it to what's committed at each destination. Never writes or
// fixes anything — only notifies. If it fails, a human runs
// `npm run sync:governance` and commits the result.

import { readFileSync } from 'node:fs';
import { buildDerivedContent, DESTINATIONS } from './sync-governance.mjs';

function main() {
  const expected = buildDerivedContent();
  let hasDrift = false;

  for (const destination of DESTINATIONS) {
    let actual;
    try {
      actual = readFileSync(destination, 'utf8');
    } catch {
      console.error(`Missing generated file: ${destination}`);
      hasDrift = true;
      continue;
    }

    if (actual !== expected) {
      console.error(`Out of sync: ${destination}`);
      hasDrift = true;
    }
  }

  if (hasDrift) {
    console.error(
      '\nGOVERNANCE.md has changed, or a generated copy was hand-edited. ' +
      'Run `npm run sync:governance` and commit the result.'
    );
    process.exit(1);
  }

  console.log('Governance references are in sync.');
}

main();
