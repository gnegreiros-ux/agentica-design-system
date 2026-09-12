// Generates a static documentation site from a manifest already validated
// by readManifest(). This function has no branching on where the manifest
// came from — a Clone-produced instance and a Master-Skill-produced
// instance are read and rendered identically.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { readManifest } from './manifest.mjs';
import { renderPage, escapeHtml } from './templates.mjs';

function readIfExists(path) {
  if (!path || !existsSync(path)) return null;
  return readFileSync(path, 'utf8');
}

export function generateSite({ manifestPath, outDir }) {
  const manifest = readManifest(manifestPath);
  const manifestDir = dirname(resolve(manifestPath));
  const resolveFromManifest = (relativePath) => resolve(manifestDir, relativePath);

  const governanceContent = readIfExists(resolveFromManifest(manifest.governance));
  const siteConfigRaw = readIfExists(resolveFromManifest(manifest.site));
  const siteConfig = siteConfigRaw ? JSON.parse(siteConfigRaw) : {};
  const siteTitle = siteConfig.siteTitle ?? 'Design System';

  mkdirSync(outDir, { recursive: true });

  writeFileSync(
    resolve(outDir, 'index.html'),
    renderPage({
      title: siteTitle,
      body: `
<h1>${escapeHtml(siteTitle)}</h1>
<nav>${(siteConfig.navigation ?? []).map((item) => `<a href="#">${escapeHtml(item)}</a>`).join(' &middot; ')}</nav>
<section>
  <h2>Governance</h2>
  <p>Source: <code>${escapeHtml(manifest.governance)}</code>${governanceContent ? ' — <a href="governance.html">view</a>' : ' (not found at build time)'}</p>
</section>
<section>
  <h2>Tokens</h2>
  <ul>
    <li>Primitive: <code>${escapeHtml(manifest.tokens.primitive)}</code></li>
    <li>Semantic: <code>${escapeHtml(manifest.tokens.semantic)}</code></li>
    <li>Component: <code>${escapeHtml(manifest.tokens.component)}</code></li>
  </ul>
</section>
<section>
  <h2>Components</h2>
  <p>Source: <code>${escapeHtml(manifest.components)}</code></p>
</section>
<section>
  <h2>Audit</h2>
  <p>Engine: <code>${escapeHtml(manifest.audit.engine)}</code> — Compliance badge: ${manifest.audit.badgeEnabled ? 'enabled' : 'disabled'}</p>
</section>
`.trim(),
    })
  );

  if (governanceContent) {
    writeFileSync(
      resolve(outDir, 'governance.html'),
      renderPage({ title: `${siteTitle} — Governance`, body: `<pre>${escapeHtml(governanceContent)}</pre>` })
    );
  }

  return { outDir: resolve(outDir) };
}
