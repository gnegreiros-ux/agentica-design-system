// Rule 4 (GOVERNANCE.md): components only consume semantic tokens, never
// primitive tokens directly.
//
// Stub at this skeleton stage: core-source/ has no components yet to scan.
// Real detection logic (verifying only semantic-layer tokens appear in
// component files) lands once a real component source to scan exists —
// see ADR-105, issue #225.

export async function checkPrimitiveTokenUsage() {
  return {
    name: 'primitive-token-usage',
    passed: true,
    message: 'stub — no core components to scan yet',
  };
}
