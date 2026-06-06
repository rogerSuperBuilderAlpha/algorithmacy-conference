// POST /api/confirm   { token }
//
// Triggered by the human clicking "Confirm & publish" on /submit/confirm/.
// We deliberately do NOT mutate on GET: email security scanners (Microsoft Safe
// Links, Gmail) pre-fetch links with GET, which would consume a one-time token
// before the human ever clicks. The magic-link email points at the static page
// /submit/confirm/?token=…, and only this POST (a real button click) opens the PR.
//
// Idempotent: a successful confirm caches its result under acf:done:<token> for a
// short window, so double-clicks / retries return the same PR instead of "expired".
//
// Env: GITHUB_TOKEN, GITHUB_REPO (default rogerSuperBuilderAlpha/algorithmacy-conference),
//      UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

const crypto = require('node:crypto');

const REPO = process.env.GITHUB_REPO || 'rogerSuperBuilderAlpha/algorithmacy-conference';
const [OWNER, NAME] = REPO.split('/');
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || 'main';
const DONE_TTL_SECONDS = 10 * 60;

const TRACKS = {
  'TR.01': 'TR.01 — Coordination & Mediation',
  'TR.02': 'TR.02 — Algorithmic Management',
  'TR.03': 'TR.03 — Platform Labor & Worker Voice',
  'TR.04': 'TR.04 — Trust, Opacity & Governance',
  'TR.05': 'TR.05 — Methods, Lineage & Practice',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ error: 'Method not allowed' });
  }

  let token;
  try {
    const body = await readJson(req);
    token = (body.token || '').trim();
  } catch {
    res.statusCode = 400;
    return res.json({ error: 'Invalid request body' });
  }
  if (!token) {
    res.statusCode = 400;
    return res.json({ error: 'Missing token' });
  }

  try {
    // Idempotency: if this token already completed, return the same result.
    const done = await redis(['GET', `acf:done:${token}`]);
    if (done) return res.json(JSON.parse(done));

    const raw = await redis(['GET', `acf:pending:${token}`]);
    if (!raw) {
      res.statusCode = 410;
      return res.json({ error: 'expired' });
    }
    // Burn the pending token so the payload can't be replayed.
    await redis(['DEL', `acf:pending:${token}`]);

    const sub = JSON.parse(raw);
    const emailHash = sha256(sub.email.toLowerCase());

    let existing = null;
    try {
      const idx = await redis(['GET', `acf:email:${emailHash}`]);
      if (idx) existing = JSON.parse(idx);
    } catch (_) {}

    let result;
    if (existing && existing.branch && existing.slug) {
      result = await updateSubmission(sub, existing);
    } else {
      const created = await createSubmission(sub);
      await redis(['SET', `acf:email:${emailHash}`,
        JSON.stringify({ pr: created.number, branch: created.branch, slug: created.slug })]);
      result = created;
    }

    const payload = { ok: true, status: result.status, pr: result.url };
    await redis(['SET', `acf:done:${token}`, JSON.stringify(payload), 'EX', String(DONE_TTL_SECONDS)]);
    return res.json(payload);
  } catch (e) {
    console.error('confirm error', e);
    res.statusCode = 502;
    return res.json({ error: 'github' });
  }
};

// ---------------------------------------------------------------------------
// create / update
// ---------------------------------------------------------------------------

async function createSubmission(sub) {
  const ref = await gh(`/git/ref/heads/${BASE_BRANCH}`);
  const baseSha = ref.object.sha;

  const wanted = baseSlug(sub);
  let slug = wanted;
  for (let i = 2; await fileExists(`submissions/${slug}.md`, BASE_BRANCH); i++) {
    slug = `${wanted}-${i}`;
    if (i > 50) { slug = `${wanted}-${crypto.randomBytes(3).toString('hex')}`; break; }
  }

  let finalBranch = `submission/${slug}`;
  if (await branchExists(finalBranch)) finalBranch = `${finalBranch}-${crypto.randomBytes(3).toString('hex')}`;

  await gh('/git/refs', {
    method: 'POST',
    body: { ref: `refs/heads/${finalBranch}`, sha: baseSha },
  });

  await putFile(`submissions/${slug}.md`, renderMarkdown(sub), finalBranch,
    `Submission: ${sub.title}`, null);

  const pr = await gh('/pulls', {
    method: 'POST',
    body: {
      title: `[${sub.type}] [${sub.track}] ${sub.title}`.slice(0, 250),
      head: finalBranch,
      base: BASE_BRANCH,
      body: prBody(sub, slug),
    },
  });

  return { status: 'created', number: pr.number, url: pr.html_url, branch: finalBranch, slug };
}

async function updateSubmission(sub, existing) {
  const path = `submissions/${existing.slug}.md`;
  let sha = null;
  let branchOk = true;
  try {
    const cur = await gh(`/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(existing.branch)}`);
    sha = cur.sha;
  } catch (_) {
    branchOk = false;
  }

  if (branchOk) {
    await putFile(path, renderMarkdown(sub), existing.branch,
      `Update submission: ${sub.title}`, sha);
    try {
      await gh(`/issues/${existing.pr}/comments`, {
        method: 'POST',
        body: { body: '↻ Submission updated by the author via the web form (re-confirmed by email).' },
      });
    } catch (_) {}
    const pr = await gh(`/pulls/${existing.pr}`).catch(() => null);
    return {
      status: 'updated',
      number: existing.pr,
      url: pr ? pr.html_url : `https://github.com/${REPO}/pull/${existing.pr}`,
      branch: existing.branch,
      slug: existing.slug,
    };
  }

  // Previous PR is gone — open a fresh one.
  return createSubmission(sub);
}

// ---------------------------------------------------------------------------
// markdown + PR body
// ---------------------------------------------------------------------------

function renderMarkdown(sub) {
  const authors = sub.authors.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).join(', ') || sub.authors;
  return `# ${sub.title}

**Authors:** ${authors}
**Contact:** ${sub.email}
**Type:** ${sub.type}
**Track:** ${TRACKS[sub.track]}
**Word count:** ${sub.wordCount}
**Keywords:** ${sub.keywords.join(', ')}
**Conflicts of interest:** ${sub.coi || 'none'}

---

## Abstract

${sub.abstract.trim()}

## Outline

${sub.outline.trim()}

## Author bios

${sub.bios.trim()}

## Statement on review policy

By submitting, I/we acknowledge that this submission and all reviews of it will be public on this repository under the conference's open-review policy (see [README.md](../README.md#review-policy)).

---

*Submitted via the web form at algorithmacy.org on behalf of the listed authors; the pull request was opened by the conference account. The PR timestamp is the priority record.*
`;
}

function prBody(sub, slug) {
  return `## Submission

- **File:** \`submissions/${slug}.md\`
- **Type:** ${sub.type}
- **Track:** ${TRACKS[sub.track]}

## One-sentence contribution

${sub.contribution || '(see abstract)'}

## Conflicts of interest

${sub.coi || 'none'}

---

Submitted via the **web form** at algorithmacy.org (no-GitHub path). The author confirmed ownership of the contact email (\`${sub.email}\`) via a one-time link before this PR was opened.

By submitting, the author(s) acknowledge the conference [open-review policy](../README.md#review-policy): this PR and all reviews are public, and the PR timestamp is the priority record.`;
}

// ---------------------------------------------------------------------------
// GitHub REST helpers
// ---------------------------------------------------------------------------

async function gh(path, opts = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not configured');
  const resp = await fetch(`https://api.github.com/repos/${OWNER}/${NAME}${path}`, {
    method: opts.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'algorithmacy-submission-bot',
      'Content-Type': 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    const err = new Error(`github ${resp.status} ${path}: ${detail.slice(0, 300)}`);
    err.status = resp.status;
    throw err;
  }
  return resp.json();
}

async function putFile(path, content, branch, message, sha) {
  return gh(`/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: {
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    },
  });
}

async function fileExists(path, ref) {
  try {
    await gh(`/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`);
    return true;
  } catch (e) {
    if (e.status === 404) return false;
    throw e;
  }
}

async function branchExists(branch) {
  try {
    await gh(`/git/ref/heads/${branch}`);
    return true;
  } catch (e) {
    if (e.status === 404) return false;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------

function baseSlug(sub) {
  const first = sub.authors.split(/[\n,]/)[0] || '';
  const name = first.replace(/\(.*?\)/g, '').trim();
  const surname = name.split(/\s+/).filter(Boolean).pop() || '';
  const seed = surname || sub.title;
  const slug = seed.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
  return slug || 'submission';
}

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis env not configured');
  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!resp.ok) throw new Error(`redis ${resp.status}`);
  const data = await resp.json();
  return data.result;
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
