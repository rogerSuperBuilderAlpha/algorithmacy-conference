const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { callHandler } = require('../lib/next/call-handler');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tabsJs = fs.readFileSync(path.join(root, 'assets/js/year-tabs.js'), 'utf8');
const formJs = fs.readFileSync(path.join(root, 'assets/js/submit-form.js'), 'utf8');

function sliceBetween(source, startMark, endMark) {
  const start = source.indexOf(startMark);
  assert.notEqual(start, -1, startMark);
  const end = endMark ? source.indexOf(endMark, start + startMark.length) : source.length;
  assert.notEqual(end, -1, endMark);
  return source.slice(start, end);
}

function words(n, token) {
  return Array.from({ length: n }, () => token).join(' ');
}

function payload(extra) {
  return Object.assign({
    title: 'Coordination through an algorithmic third party',
    authors: 'Ada Lovelace (Analytical Engine)',
    email: 'ada@example.edu',
    type: 'Note',
    track: 'TR.01',
    keywords: 'algorithmacy, coordination, mediation',
    abstract: words(320, 'coordination'),
    outline: '1. Question. 2. Method. 3. Finding.',
    bios: 'Ada Lovelace studies coordination.',
    contribution: 'A note on triadic coordination.',
    coi: 'none',
    conference: '2027',
  }, extra);
}

test('index.html has no em dashes', () => {
  assert.equal(html.includes('\u2014'), false);
  assert.equal(html.includes('—'), false);
});

test('thank-you section names only people and facts already on the 2026 page', () => {
  const thanks = sliceBetween(html, 'id="thanks"', 'id="media"');
  assert.match(thanks, /Thank you/);
  assert.match(thanks, /speakers, authors, reviewers, attendees, organizers, and partners/);
  const names = [
    'Roger Hunt',
    'Antonio Scala',
    'Antonio Mele',
    'Ryan R. Roper',
    'Chevonnese Chevers Whyte',
    'Sarah Witmer',
    'Mellissa Lezama',
    'Lorraine Villaroel',
    'Caribbean Emergence Institute',
    'Animae Caribe',
    'The Rose Foundation',
    'Hult International Business School',
  ];
  for (const name of names) {
    assert.ok(thanks.includes(name), name);
    assert.ok(html.includes(name), `name must already appear on the page: ${name}`);
  }
  const panel2026 = sliceBetween(html, 'id="2026"', 'id="2027"');
  for (const name of names) assert.ok(panel2026.includes(name), `2026 archive missing ${name}`);
});

test('media placeholder sits under the thank-you', () => {
  const thanksAt = html.indexOf('id="thanks"');
  const mediaAt = html.indexOf('Photos, videos and more coming soon');
  const tabsAt = html.indexOf('id="year-tabs"');
  assert.ok(thanksAt < mediaAt && mediaAt < tabsAt);
  assert.match(html, /aria-label="Conference media"/);
});

test('year tabs are accessible and deep-linkable, with 2027 as the default panel', () => {
  assert.match(html, /role="tablist" aria-label="Conference year"/);
  assert.match(html, /id="year-tab-2026"[^>]*role="tab"[^>]*aria-controls="2026"[^>]*aria-selected="false"/);
  assert.match(html, /id="year-tab-2027"[^>]*role="tab"[^>]*aria-controls="2027"[^>]*aria-selected="true"/);
  assert.match(html, /role="tabpanel" id="2026" aria-labelledby="year-tab-2026" hidden/);
  assert.match(html, /role="tabpanel" id="2027" aria-labelledby="year-tab-2027">/);
  assert.match(tabsJs, /ArrowRight/);
  assert.match(tabsJs, /ArrowLeft/);
  assert.match(tabsJs, /ArrowUp/);
  assert.match(tabsJs, /ArrowDown/);
  assert.match(tabsJs, /Home/);
  assert.match(tabsJs, /End/);
  assert.match(tabsJs, /hashchange/);
  assert.match(tabsJs, /location\.hash/);
  assert.match(tabsJs, /return '2027'/);

  const archive = sliceBetween(html, 'id="2026"', 'id="2027"');
  assert.match(archive, /class="topstrip"/);
  assert.match(archive, /id="schedule"/);
  assert.match(archive, /id="keynotes"/);
  assert.match(archive, /id="tracks"/);
  assert.match(archive, /<footer class="footer">/);
});

test('X account is linked from the header, the year bar, the footer, and Organization sameAs', () => {
  const link = 'href="https://x.com/algorithmacy" target="_blank" rel="noopener noreferrer"';
  assert.ok(html.includes(`class="x-link" ${link}`));
  assert.ok(html.includes(`class="year-x" ${link}`));
  const archive = sliceBetween(html, 'id="2026"', 'id="2027"');
  const call = html.slice(html.indexOf('id="2027"'));
  assert.ok(archive.includes(link));
  assert.ok(call.includes(link));
  assert.match(archive, /aria-label="Social"/);
  assert.match(call, /aria-label="Social"/);
  assert.match(html, /"name": "Algorithmacy", "url": "https:\/\/algorithmacy.org\/", "sameAs": \["https:\/\/x\.com\/algorithmacy", "https:\/\/github.com\/rogerSuperBuilderAlpha\/algorithmacy-conference"\]/);
  assert.match(html, /"sameAs": \["https:\/\/github.com\/rogerSuperBuilderAlpha\/algorithmacy-conference", "https:\/\/x\.com\/algorithmacy"\]/);
  assert.match(html, /aria-label="Algorithmacy on X \(@algorithmacy\)"/);
});

test('2027 call uses the 2026 submission mechanism and states no date or venue', () => {
  const call = html.slice(html.indexOf('id="cfp-2027"'));
  assert.match(call, /Dates and venue to be announced/);
  assert.match(call, /name="conference" value="2027"/);
  assert.match(call, /id="subform"/);
  assert.match(call, /TR\.01/);
  assert.match(call, /TR\.05/);
  assert.match(call, /Full paper/);
  assert.match(call, /Practitioner report/);
  assert.match(call, /\/api\/submit/);
  assert.match(call, /https:\/\/algorithmacy.org\/api\/mcp/);
  assert.match(call, /\/submit#ai-prompt/);
  assert.match(call, /submissions\/TEMPLATE\.md/);
  assert.match(call, /rhunt@bentley.edu/);
  assert.match(html, /src="\/assets\/js\/submit-form\.js"/);
  assert.match(formJs, /\/api\/submit/);
  assert.doesNotMatch(call, /Port of Spain, 2027|venue: [^<]*2027|October 2027|keynote/i);
  assert.equal(call.includes('\u2014'), false);
});

test('public descriptions say 2026 has concluded and the 2027 call is open', () => {
  assert.match(html, /2026 Algorithmacy Conference in Port of Spain has concluded/);
  assert.match(html, /2027 call for papers is open/);
  const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
  const full = fs.readFileSync(path.join(root, 'llms-full.txt'), 'utf8');
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const text of [llms, full]) {
    assert.match(text, /has concluded/);
    assert.match(text, /2027/);
    assert.match(text, /Dates and venue to be announced|dates and venue to be announced|Dates and venue are to be announced/);
  }
  assert.match(sitemap, /<loc>https:\/\/algorithmacy.org\/<\/loc>\s*<lastmod>2026-11-03<\/lastmod>/);
});

test('validate tags 2027 and leaves an omitted year on 2026', () => {
  const { validate } = require('../lib/submission-core');
  const next = validate(payload());
  assert.deepEqual(next.errors, []);
  assert.equal(next.clean.conference, '2027');

  const current = validate(payload({ conference: undefined }));
  assert.deepEqual(current.errors, []);
  assert.equal(current.clean.conference, '2026');

  const bad = validate(payload({ conference: '2028' }));
  assert.ok(bad.errors.some((error) => /2026 or 2027/.test(error)));
});

test('local submit handler accepts a 2027 dry-run without calling the network', async () => {
  const core = require('../lib/submission-core');
  const calls = [];
  const originalFetch = global.fetch;
  const originalStart = core.startSubmission;
  const originalRate = core.enforceRate;
  const seen = [];
  global.fetch = async (url) => {
    calls.push(String(url));
    throw new Error('dry-run blocked a network call');
  };
  core.enforceRate = async () => {};
  core.startSubmission = async (clean) => {
    seen.push(clean);
    return { ok: true, email: clean.email };
  };

  try {
    const submit = require('../handlers/submit');
    const response = await callHandler(submit, new Request('http://127.0.0.1/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload()),
    }));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.ok, true);
    assert.equal(data.email, 'ada@example.edu');
    assert.equal(seen.length, 1);
    assert.equal(seen[0].conference, '2027');
    assert.equal(seen[0].track, 'TR.01');
    assert.equal(calls.length, 0);
  } finally {
    global.fetch = originalFetch;
    core.startSubmission = originalStart;
    core.enforceRate = originalRate;
  }
});

test('confirm stores 2027 apart from 2026', () => {
  const confirm = fs.readFileSync(path.join(root, 'handlers/confirm.js'), 'utf8');
  assert.match(confirm, /acf:email:2027:/);
  assert.match(confirm, /acf:email:\$\{hash\}/);
  assert.match(confirm, /\*\*Conference:\*\*/);
  assert.match(confirm, /\[2027\] /);
  const template = fs.readFileSync(path.join(root, 'submissions/TEMPLATE.md'), 'utf8');
  assert.match(template, /\*\*Conference:\*\* \[2026 \| 2027\]/);
});
