// Rule 3 (GOVERNANCE.md): no component in the foundation ("core") accepts a
// hard-coded style value — every visual value must reference a token.
//
// Stub at this skeleton stage: core-source/ has no components yet to scan.
// Real detection logic (scanning component source for literal hex colors,
// pixel sizes, arbitrary spacing) lands once a real component source to
// scan exists — see ADR-105, issue #225.

export async function checkHardcodedStyle() {
  return {
    name: 'hardcoded-style',
    passed: true,
    message: 'stub — no core components to scan yet',
  };
}
