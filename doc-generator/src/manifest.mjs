// Reads and validates design-system.manifest.json — the single contract this
// generator has with a personalized instance, whether it came from the
// Clone or the Master Skill. A missing or incomplete manifest is a hard
// error with a clear message; this never guesses a fallback structure.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED_TOKEN_LAYERS = ['primitive', 'semantic', 'component'];

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
  if (!manifest.governance) missing.push('governance');

  if (!manifest.tokens) {
    missing.push('tokens');
  } else {
    for (const layer of REQUIRED_TOKEN_LAYERS) {
      if (!manifest.tokens[layer]) missing.push(`tokens.${layer}`);
    }
  }

  if (!manifest.components) missing.push('components');

  if (!manifest.audit) {
    missing.push('audit');
  } else {
    if (!manifest.audit.engine) missing.push('audit.engine');
    if (typeof manifest.audit.badgeEnabled !== 'boolean') missing.push('audit.badgeEnabled');
  }

  if (!manifest.site) missing.push('site');

  if (missing.length > 0) {
    throw new Error(
      `${absolutePath} is missing required field(s): ${missing.join(', ')}. Fix the manifest — this generator does not guess a fallback.`
    );
  }

  return manifest;
}
