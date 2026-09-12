// Rule 1 (GOVERNANCE.md): every generated component meets WCAG 2.2 AA,
// minimum. Default engine is axe-core, replaceable via this adapter
// interface without ever modifying the rest of core/ (GOVERNANCE.md's
// Audit governance section).
//
// Stub at this skeleton stage: core/ has no components yet to scan. Swapping
// in real axe-core wiring happens once core/ actually contains components.

const axeCoreAdapter = {
  name: 'axe-core',
  async run() {
    return { passed: true, message: 'stub — no core components to scan yet' };
  },
};

export async function runAccessibilityAudit(adapter = axeCoreAdapter) {
  const result = await adapter.run();
  return { name: `accessibility (${adapter.name})`, ...result };
}
