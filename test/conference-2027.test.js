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

test('em dashes stay inside the AI Polish wording', () => {
  const start = html.indexOf('id="cfp-ai-polish"');
  const end = html.indexOf('<!-- /cfp-ai-polish -->');
  assert.ok(start > 0 && end > start);
  const rest = html.slice(0, start) + html.slice(end);
  assert.equal(rest.includes('\u2014'), false);
  assert.ok(html.slice(start, end).includes('\u2014'));
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

test('the 2027 intro is the organizer text, seven paragraphs, verbatim', () => {
  const paragraphs = [
    'Digital experience used to be about a designer guiding a user to an end which both people agreed to... mostly. I want to buy a raincoat, and an online retailer designs me a beautiful, clear, simple flow for me to achieve that.',
    'Today, however, that end is less clear. As users engage agents like Claude or Grok Bot, they are often creating something themselves. Perhaps it\'s raining where I am and I need to come up with a strategy to get to work. If I land on a site that is driving me towards raincoats, but for whatever reason, as I was discussing with my agent, I figure I need an umbrella, well, then no one gets what they want.',
    'The key metrics here are less about conversion rate optimization or stickiness or, heaven forbid, dark patterns that somehow trick me into buying a raincoat, and more about me as the user getting myself to the decision and then surfacing solutions to find and purchase a raincoat.',
    'The experience is about how I make that decision. The design problem is how the designer surfaces key decisions that move me closer along whatever path I need to go.',
    'Now, given that, current chat and AI interfaces fall embarrassingly short, as of October 2026, so things will be changing a lot! There are some bits, however, that remain regardless of the current state of things. 1) The user, in this case, is the human: cognitive, biological, emotional. There is a whole other band of research on agent experience which can be bracketed from this discussion. 2) The user environment is a platform: opaque, cooptive, and triadic. 3) The design move we need to make is an aesthetic shift.',
    'When we engage LLMs we are engaging animations. Animators design experiences which are fundamentally opaque. There are quite literally missing frames. They design experiences which are cooptive. At some point during an animation-based experience you "lock in" and the gaps disappear. And they are triadic. When I watch an actor, "I" am watching an "Actor". That\'s a dyad. When I\'m watching animation, "I" am watching a "character" manipulated by an "animator".',
    'In order to deliver solutions for Decision Experience Design, this conference proposes learning about and applying the core methodologies of the animator.',
  ];
  assert.equal(paragraphs.length, 7);
  const intro = html.slice(html.indexOf('id="cfp-2027-intro"'), html.indexOf('id="cfp-ai-polish"'));
  for (const paragraph of paragraphs) {
    assert.ok(intro.includes(paragraph), paragraph.slice(0, 48));
  }
  const full = fs.readFileSync(path.join(root, 'llms-full.txt'), 'utf8');
  for (const paragraph of paragraphs) assert.ok(full.includes(paragraph));
  const summary = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
  assert.match(summary, /Theme: Decision Experience Design/);
  assert.match(summary, /https:\/\/algorithmacy\.org\/#2027/);
  assert.equal(summary.includes('heaven forbid'), false);
});

function normalizeText(value) {
  return value
    .replace(/<a\b[^>]*>/gi, '')
    .replace(/<\/a>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

test('the AI Polish tab matches the source file, whitespace aside', () => {
  const source = fs.readFileSync(path.join(root, 'test/fixtures/ai-polish-cfp-2027.txt'), 'utf8');
  const sourceNorm = source.split('\n').map((line) => (
    line.startsWith(' * ') ? line.slice(3) : line
  )).join('\n').replace(/\s+/g, ' ').trim();
  const open = html.indexOf('>', html.indexOf('id="ai-polish-body"')) + 1;
  const close = html.indexOf('</div>\n      </div><!-- /cfp-ai-polish -->');
  assert.ok(open > 0 && close > open);
  const got = normalizeText(html.slice(open, close));
  assert.equal(got, sourceNorm);
});

test('2027 call uses the 2026 submission mechanism and states no date or venue', () => {
  const call = html.slice(html.indexOf('id="cfp-2027"'));
  assert.match(call, /Decision Experience Design/);
  assert.match(call, /Dates and venue to be announced/);
  assert.match(call, /name="conference" value="2027"/);
  assert.match(html, /property="og:image" content="https:\/\/algorithmacy.org\/images\/social-share-2027.png"/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
  assert.match(html, /property="og:image:alt" content="Algorithmacy Conference 2027\. Call for Papers\. Decision Experience Design\./);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image" content="https:\/\/algorithmacy.org\/images\/social-share-2027.png"/);
  assert.match(html, /src="\/images\/hero-algorithmacy-2027.png"/);
  assert.match(html, /src="\/images\/hero-algorithmacy-2026.png"/);
  assert.match(html, /"image": "https:\/\/algorithmacy.org\/images\/social-share-2026.png"/);
  assert.match(call, /raincoat/);
  assert.match(call, /umbrella/);
  assert.match(call, /TR\.01 Decision Experience Design \(DXD\) and Choice Architecture/);
  assert.match(call, /TR\.06 Stratification, Labor, and the Hidden Animator/);
  assert.equal(call.includes('Guiding questions'), false);
  assert.equal(call.includes('Topics and questions to consider'), false);
  assert.equal(call.includes('What does a designer owe a person whose end changes mid-session'), false);
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
  const { validate, trackLabel } = require('../lib/submission-core');
  const next = validate(payload());
  assert.deepEqual(next.errors, []);
  assert.equal(next.clean.conference, '2027');
  assert.match(trackLabel('TR.01', '2027'), /Decision Experience Design \(DXD\) and Choice Architecture/);
  assert.match(trackLabel('TR.06', '2027'), /Hidden Animator/);
  assert.equal(trackLabel('TR.06', '2026'), undefined);
  assert.match(trackLabel('TR.01', '2026'), /Coordination & Mediation/);

  const current = validate(payload({ conference: undefined }));
  assert.deepEqual(current.errors, []);
  assert.equal(current.clean.conference, '2026');

  const bad = validate(payload({ conference: '2028' }));
  assert.ok(bad.errors.some((error) => /2026 or 2027/.test(error)));

  const sixth = validate(payload({ conference: '2027', track: 'TR.06' }));
  assert.deepEqual(sixth.errors, []);
  assert.equal(sixth.clean.track, 'TR.06');
  const sixthOn2026 = validate(payload({ conference: '2026', track: 'TR.06' }));
  assert.ok(sixthOn2026.errors.some((error) => /TR\.01–TR\.05/.test(error)));
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
