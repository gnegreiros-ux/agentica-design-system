// Reads and validates design-system.manifest.json — the single contract this
// generator has with a personalized instance, whether it came from the
// Clone or the Master Skill. A missing or incomplete manifest is a hard
// error with a clear message; this never guesses a fallback structure.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED_TOKEN_LAYERS = ['primitive', 'semantic', 'component'];

// Every field below is a path or a label: it must be a non-empty string. A
// truthiness check alone let an object or a number through, which was then
// stringified into the generated site ("[object Object]") or crashed deep in
// node:path with a message that never named the field (issues 128, 129).
function describeType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function readManifest(manifestPath) {
  const absolutePath = resolve(manifestPath);

  let raw;
  try {
    raw = readFileSync(absolutePath, 'utf8');
  } catch {
    throw new Error(
      `No manifest found at ${absolutePath}. This generator only reads a personalized instance through design-system.manifest.json — it never assumes a fallback structure.`
    );
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${absolutePath} is not valid JSON: ${error.message}`);
  }

  const missing = [];
  const wrongType = [];
  const requireString = (name, value) => {
    if (value === undefined || value === null || value === '') missing.push(name);
    else if (typeof value !== 'string') wrongType.push(`${name} (expected a non-empty string, got ${describeType(value)})`);
  };

  requireString('governance', manifest.governance);

  if (!manifest.tokens) {
    missing.push('tokens');
  } else {
    for (const layer of REQUIRED_TOKEN_LAYERS) requireString(`tokens.${layer}`, manifest.tokens[layer]);
  }

  requireString('components', manifest.components);

  if (!manifest.audit) {
    missing.push('audit');
  } else {
    requireString('audit.engine', manifest.audit.engine);
    if (manifest.audit.badgeEnabled === undefined) missing.push('audit.badgeEnabled');
    else if (typeof manifest.audit.badgeEnabled !== 'boolean') {
      wrongType.push(`audit.badgeEnabled (expected a boolean, got ${describeType(manifest.audit.badgeEnabled)})`);
    }
  }

  requireString('site', manifest.site);

  const problems = [];
  if (missing.length > 0) problems.push(`missing required field(s): ${missing.join(', ')}`);
  if (wrongType.length > 0) problems.push(`field(s) with the wrong type: ${wrongType.join(', ')}`);
  if (problems.length > 0) {
    throw new Error(
      `${absolutePath} has ${problems.join('; ')}. Fix the manifest — this generator does not guess a fallback.`
    );
  }

  return manifest;
}
