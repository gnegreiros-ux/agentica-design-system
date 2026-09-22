// C5-01/02/03 — doc-generator/ consumes design-system.manifest.json and must not
// care where the personalized instance came from. C5-01 and C5-02 each generate a
// site from one origin's directory layout without error; C5-03 is the actual
// decoupling claim — given two manifests with equivalent content (same governance
// text, same site config) but different origin-shaped directory trees (a
// Clone-flavored layout vs a Master-Skill-flavored layout, different relative paths
// for every manifest field), the two generated sites must be structurally
// equivalent: same output files, same headings, same nav entries. "Equivalent"
// means structural, not byte-identical (decided in the C5 plan) — this generator
// has no timestamp or build-id of its own, so nothing needs excluding here, unlike
// the sitemap.xml / style-dictionary non-determinism findings (#123, #134).
//
// design-system.manifest.json does not exist anywhere in this repository as of
// this test (never dogfooded by the Clone or the Master Skill, confirmed by
// inventory) — both fixtures are synthesized from doc-generator/src/manifest.mjs's
// actual required-field contract, not copied from a real instance.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI_PATH = join(ROOT, 'doc-generator', 'bin', 'cli.mjs');

const GOVERNANCE_TEXT = [
  '# GOVERNANCE',
  '',
  '## Rule 1 — WCAG 2.2 AA compliance, minimum',
  '## Rule 2 — The final word always belongs to a human',
  '## Rule 3 — Never hard-coded style',
  '## Rule 4 — Never consume a primitive token directly',
  '',
].join('\n');

const SITE_CONFIG = {
  siteTitle: 'Origin Indifference Test System',
  navigation: ['Overview', 'Components', 'Tokens'],
};

function runGenerator(manifestPath, outDir) {
  return execFileSync('node', [CLI_PATH, manifestPath, outDir], { encoding: 'utf8' });
}

// Clone-flavored layout: governance under core/references/, site config under
// personnalisation/docs-site/ — mirrors clone/'s real core vs. personnalisation split.
function buildCloneFixture(root) {
  const instanceDir = join(root, 'clone-instance');
  mkdirSync(join(instanceDir, 'core', 'references'), { recursive: true });
  mkdirSync(join(instanceDir, 'personnalisation', 'docs-site'), { recursive: true });
  writeFileSync(join(instanceDir, 'core', 'references', 'non-negotiable-foundation.md'), GOVERNANCE_TEXT);
  writeFileSync(join(instanceDir, 'personnalisation', 'docs-site', 'site.config.json'), JSON.stringify(SITE_CONFIG));

  const manifest = {
    governance: 'core/references/non-negotiable-foundation.md',
    tokens: {
      primitive: 'core/tokens/primitive.json',
      semantic: 'personnalisation/theme/semantic.json',
      component: 'core/tokens/component.json',
    },
    components: 'core/components/',
    audit: { engine: 'axe-core', badgeEnabled: true },
    site: 'personnalisation/docs-site/site.config.json',
  };
  const manifestPath = join(instanceDir, 'design-system.manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

// Master-Skill-flavored layout: flat references/ and output/ dirs, no core/
// personnalisation split, different token directory name — a genuinely different
// shape, not just a renamed copy of the Clone layout.
function buildMasterSkillFixture(root) {
  const instanceDir = join(root, 'master-skill-instance');
  mkdirSync(join(instanceDir, 'references'), { recursive: true });
  mkdirSync(join(instanceDir, 'output'), { recursive: true });
  writeFileSync(join(instanceDir, 'references', 'non-negotiable-foundation.md'), GOVERNANCE_TEXT);
  writeFileSync(join(instanceDir, 'output', 'site.config.json'), JSON.stringify(SITE_CONFIG));

  const manifest = {
    governance: 'references/non-negotiable-foundation.md',
    tokens: {
      primitive: 'design-tokens/primitive.json',
      semantic: 'design-tokens/semantic.json',
      component: 'design-tokens/component.json',
    },
    components: 'generated-components/',
    audit: { engine: 'axe-core', badgeEnabled: true },
    site: 'output/site.config.json',
  };
  const manifestPath = join(instanceDir, 'design-system.manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

function extractStructure(outDir) {
  const files = readdirSync(outDir).sort();
  const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8');
  const headings = [...indexHtml.matchAll(/<h[12]>(.*?)<\/h[12]>/g)].map((match) => match[1]);
  const navLinks = [...indexHtml.matchAll(/<a href="#">(.*?)<\/a>/g)].map((match) => match[1]);
  return { files, headings, navLinks };
}

test.describe('doc-generator is indifferent to the manifest origin', () => {
  let tmpRoot;

  test.beforeEach(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'doc-generator-origin-'));
  });

  test.afterEach(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  test('C5-01 — generates a site from a Clone-origin instance without error', () => {
    const manifestPath = buildCloneFixture(tmpRoot);
    const outDir = join(tmpRoot, 'dist-clone');

    expect(() => runGenerator(manifestPath, outDir)).not.toThrow();
    expect(readdirSync(outDir)).toContain('index.html');
  });

  test('C5-02 — generates a site from a Master-Skill-origin instance without error', () => {
    const manifestPath = buildMasterSkillFixture(tmpRoot);
    const outDir = join(tmpRoot, 'dist-master-skill');

    expect(() => runGenerator(manifestPath, outDir)).not.toThrow();
    expect(readdirSync(outDir)).toContain('index.html');
  });

  test('C5-03 — equivalent manifests from different origins produce structurally equivalent output', () => {
    const cloneManifest = buildCloneFixture(tmpRoot);
    const masterSkillManifest = buildMasterSkillFixture(tmpRoot);
    const cloneOutDir = join(tmpRoot, 'dist-clone');
    const masterSkillOutDir = join(tmpRoot, 'dist-master-skill');

    runGenerator(cloneManifest, cloneOutDir);
    runGenerator(masterSkillManifest, masterSkillOutDir);

    const cloneStructure = extractStructure(cloneOutDir);
    const masterSkillStructure = extractStructure(masterSkillOutDir);

    expect(
      cloneStructure.files,
      'Clone-origin and Master-Skill-origin outputs must produce the same set of generated files'
    ).toEqual(masterSkillStructure.files);
    expect(
      cloneStructure.headings,
      'Clone-origin and Master-Skill-origin outputs must have the same headings — same manifest content, different directory shape'
    ).toEqual(masterSkillStructure.headings);
    expect(
      cloneStructure.navLinks,
      'Clone-origin and Master-Skill-origin outputs must have the same nav entries in the same order'
    ).toEqual(masterSkillStructure.navLinks);
  });
});
