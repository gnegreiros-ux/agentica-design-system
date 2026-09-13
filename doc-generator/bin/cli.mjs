#!/usr/bin/env node
import { generateSite } from '../src/build.mjs';

const [, , manifestArg, outDirArg] = process.argv;
const manifestPath = manifestArg ?? 'design-system.manifest.json';
const outDir = outDirArg ?? 'dist-docs';

try {
  const { outDir: resolvedOutDir } = generateSite({ manifestPath, outDir });
  console.log(`Documentation site generated at ${resolvedOutDir}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
