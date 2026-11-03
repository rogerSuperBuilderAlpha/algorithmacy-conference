const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');

const GENERATED = new Set(['public', 'node_modules', '.git', '.next', 'coverage']);

function topLevelPages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !GENERATED.has(entry.name))
    .filter((entry) => fs.existsSync(path.join(dir, entry.name, 'index.html')))
    .map((entry) => entry.name)
    .sort();
}

test('every top-level index.html is copied and rewritten to /name and /name/', async () => {
  const { copyDirectories, htmlRewrites } = await import('../scripts/static-site.mjs');
  const pages = topLevelPages(root);
  assert.ok(pages.includes('news'), 'news/index.html should be a top-level page');
  assert.ok(pages.includes('logistics'));

  const copied = copyDirectories(root);
  const rewrites = htmlRewrites(root);
  for (const name of pages) {
    assert.ok(copied.includes(name), `${name} is missing from the public/ copy`);
    for (const source of [`/${name}`, `/${name}/`]) {
      const hit = rewrites.find((rule) => rule.source === source);
      assert.ok(hit, `${source} has no rewrite, so Next would 404 it`);
      assert.equal(hit.destination, `/${name}/index.html`);
    }
  }

  for (const nested of ['/submit/confirm', '/submit/confirmed', '/book/manage', '/studio/engineer']) {
    assert.ok(rewrites.some((rule) => rule.source === nested));
    assert.ok(rewrites.some((rule) => rule.source === nested + '/'));
  }
});

test('the build output serves /news, logistics, and the Trinidad video', () => {
  const copied = spawnSync(process.execPath, ['scripts/copy-static.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(copied.status, 0, copied.stderr);

  const news = path.join(root, 'public/news/index.html');
  const logistics = path.join(root, 'public/logistics/index.html');
  const video = path.join(root, 'public/images/video/trinidad.mp4');
  const poster = path.join(root, 'public/images/video/trinidad-poster.jpg');
  assert.ok(fs.existsSync(news), 'public/news/index.html was not copied');
  assert.ok(fs.existsSync(logistics));
  assert.ok(fs.existsSync(video));
  assert.ok(fs.existsSync(poster));
  assert.ok(fs.statSync(video).size > 1000);

  const logisticsHtml = fs.readFileSync(logistics, 'utf8');
  assert.match(logisticsHtml, /src="\/images\/video\/trinidad\.mp4"/);
  assert.match(logisticsHtml, /poster="\/images\/video\/trinidad-poster\.jpg"/);

  const home = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  assert.match(home, /href="\/news"/);
});
