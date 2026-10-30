// Minimal HTML page shell — no framework, no bundler. Matches this
// project's own documentation site's philosophy of a small, dependency-free
// build step, without reusing any of its content or branding.

export function renderPage({ title, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
</head>
<body>
${body}
</body>
</html>
`;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
