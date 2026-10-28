const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'public' || entry.name === '.git') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.name.endsWith('.html')) out.push(abs);
  }
  return out;
}

test('every HTML page includes the X follow dialog and footer link', () => {
  const pages = walk(root, []);
  assert.ok(pages.length >= 14, 'expected the conference HTML pages');
  const js = fs.readFileSync(path.join(root, 'assets/js/x-follow.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'assets/css/x-follow.css'), 'utf8');

  assert.match(js, /setAttribute\('role', 'dialog'\)/);
  assert.match(js, /setAttribute\('aria-modal', 'true'\)/);
  assert.match(js, /setAttribute\('aria-labelledby', 'x-follow-title'\)/);
  assert.match(js, /https:\/\/x\.com\/algorithmacy/);
  assert.match(js, /target="_blank"/);
  assert.match(js, /noopener noreferrer/);
  assert.match(js, /Escape/);
  assert.match(js, /@algorithmacy/);
  assert.match(css, /\.x-follow/);
  assert.match(css, /max-width: 680px/);

  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    const rel = path.relative(root, page);
    assert.match(html, /\/assets\/css\/x-follow\.css/, rel);
    assert.match(html, /\/assets\/js\/x-follow\.js/, rel);
    assert.match(html, /href="https:\/\/x\.com\/algorithmacy" target="_blank" rel="noopener noreferrer"/, rel);
    assert.match(html, /<footer[\s>]/, rel);
  }
});

test('the root layout loads the X follow dialog for app routes', () => {
  const layout = fs.readFileSync(path.join(root, 'app/layout.js'), 'utf8');
  assert.match(layout, /\/assets\/css\/x-follow\.css/);
  assert.match(layout, /\/assets\/js\/x-follow\.js/);
});
