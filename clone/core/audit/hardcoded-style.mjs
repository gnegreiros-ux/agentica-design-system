// Rule 3 (GOVERNANCE.md): no component in core/ accepts a hard-coded style
// value — every visual value must reference a token.
//
// Stub at this skeleton stage: core/ has no components yet to scan. Real
// detection logic (scanning core component source for literal hex colors,
// pixel sizes, arbitrary spacing) lands once core/ actually contains
// components.

export async function checkHardcodedStyle() {
  return {
    name: 'hardcoded-style',
    passed: true,
    message: 'stub — no core components to scan yet',
  };
}
