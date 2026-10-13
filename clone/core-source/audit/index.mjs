// Runs the three core audits (GOVERNANCE.md Rules 1, 3, 4). These always run
// on every build, regardless of any personalization configuration —
// GOVERNANCE.md's Audit governance section is explicit that this is never
// conditional on whether a team enables the public compliance badge.

import { checkHardcodedStyle } from './hardcoded-style.mjs';
import { checkPrimitiveTokenUsage } from './primitive-tokens.mjs';
import { runAccessibilityAudit } from './accessibility.mjs';

async function main() {
  const results = await Promise.all([
    checkHardcodedStyle(),
    checkPrimitiveTokenUsage(),
    runAccessibilityAudit(),
  ]);

  const failed = results.filter((result) => !result.passed);
  for (const result of failed) {
    console.error(`[audit:${result.name}] FAILED — ${result.message}`);
  }

  if (failed.length > 0) {
    process.exit(1);
  }

  console.log('All core audits passed.');
}

main();
