// Rule 4 (GOVERNANCE.md): components only consume semantic tokens, never
// primitive tokens directly.
//
// Stub at this skeleton stage: core/ has no components yet to scan. Real
// detection logic (verifying only semantic-layer tokens appear in core
// component files) lands once core/ actually contains components.

export async function checkPrimitiveTokenUsage() {
  return {
    name: 'primitive-token-usage',
    passed: true,
    message: 'stub — no core components to scan yet',
  };
}
