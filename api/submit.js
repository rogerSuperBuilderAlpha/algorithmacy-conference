// POST /api/submit
//
// Receives a submission from the web form, validates it, rate-limits, and emails
// the author a single-use magic link. NO pull request is created here — the PR is
// only opened after the author clicks the link (see api/confirm.js). This proves
// the contact email is real and ties the submission to a person.
//
// Secrets are read from environment variables only (never committed):
//   EMAIL_API_KEY, EMAIL_DOMAIN, EMAIL_FROM, EMAIL_FROM_NAME, EMAIL_API_BASE (optional)
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//   SITE_URL (optional, default https://algorithmacy.com)

const crypto = require('node:crypto');

const TYPES = ['Full paper', 'Note', 'Panel', 'Poster', 'Practitioner report'];
const TRACKS = {
  'TR.01': 'TR.01 — Coordination & Mediation',
  'TR.02': 'TR.02 — Algorithmic Management',
  'TR.03': 'TR.03 — Platform Labor & Worker Voice',
  'TR.04': 'TR.04 — Trust, Opacity & Governance',
  'TR.05': 'TR.05 — Methods, Lineage & Practice',
};

const TOKEN_TTL_SECONDS = 60 * 60; // magic link valid for 1 hour
const RATE_IP_MAX = 8;             // submissions per IP per hour
const RATE_EMAIL_MAX = 4;          // magic links to one email per hour

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.statusCode = 400;
    return res.json({ error: 'Invalid request body' });
  }

  // Honeypot: real users never fill this hidden field. Pretend success so bots
  // don't learn they were caught.
  if (body.website) {
    return res.json({ ok: true });
  }

  const { errors, clean } = validate(body);
  if (errors.length) {
    res.statusCode = 400;
    return res.json({ error: errors[0], errors });
  }

  // Rate limit per IP and per email to prevent flooding / magic-link email-bombing.
  const ip = clientIp(req);
  const emailKey = sha256(clean.email);
  try {
    if (await overLimit(`acf:rate:ip:${ip}`, RATE_IP_MAX) ||
        await overLimit(`acf:rate:email:${emailKey}`, RATE_EMAIL_MAX)) {
      res.statusCode = 429;
      return res.json({ error: 'Too many attempts. Please try again in an hour.' });
    }
  } catch (e) {
    // If the store is unreachable we fail closed on rate limiting but continue —
    // better to accept a submission than to lose one. Surface in logs.
    console.error('rate-limit store error', e);
  }

  // Stash the validated submission under a single-use token.
  const token = crypto.randomBytes(24).toString('base64url');
  try {
    await redis(['SET', `acf:pending:${token}`, JSON.stringify(clean), 'EX', String(TOKEN_TTL_SECONDS)]);
  } catch (e) {
    console.error('pending store error', e);
    res.statusCode = 502;
    return res.json({ error: 'Could not start your submission. Please try again shortly.' });
  }

  const siteUrl = (process.env.SITE_URL || 'https://algorithmacy.com').replace(/\/$/, '');
  // Link to a static page with a Confirm button — NOT a state-mutating GET — so
  // email security scanners (Microsoft Safe Links, Gmail) can't consume the
  // one-time token by pre-fetching the link. The page POSTs to /api/confirm.
  const confirmUrl = `${siteUrl}/submit/confirm/?token=${token}`;

  try {
    await sendMagicLink(clean, confirmUrl);
  } catch (e) {
    console.error('email send error', e);
    res.statusCode = 502;
    return res.json({ error: 'We could not send the confirmation email. Please try again.' });
  }

  return res.json({ ok: true, email: clean.email });
};

// ---------------------------------------------------------------------------
// validation
// ---------------------------------------------------------------------------

function validate(b) {
  const errors = [];
  const str = (v) => (typeof v === 'string' ? v.trim() : '');

  const title = str(b.title);
  if (title.length < 3 || title.length > 300) errors.push('Title is required (3–300 characters).');

  const authors = str(b.authors);
  if (!authors) errors.push('At least one author (with affiliation) is required.');

  const email = str(b.email).toLowerCase();
  if (!EMAIL_RE.test(email)) errors.push('A valid contact email is required.');

  const type = str(b.type);
  if (!TYPES.includes(type)) errors.push('Choose exactly one submission type.');

  const track = str(b.track);
  if (!TRACKS[track]) errors.push('Choose exactly one track (TR.01–TR.05).');

  const keywordsRaw = str(b.keywords);
  const keywords = keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean);
  if (keywords.length < 3 || keywords.length > 7) errors.push('Provide 3–7 comma-separated keywords.');

  const abstract = str(b.abstract);
  const words = abstract.split(/\s+/).filter(Boolean).length;
  if (words < 300 || words > 500) errors.push(`Abstract must be 300–500 words (currently ${words}).`);

  const outline = str(b.outline);
  if (outline.length < 10) errors.push('An outline (or panel participants / poster description) is required.');

  const bios = str(b.bios);
  if (bios.length < 10) errors.push('Author bio(s) are required.');

  const contribution = str(b.contribution);
  const coi = str(b.coi) || 'none';

  if (b.agree !== true && b.agree !== 'true' && b.agree !== 'on') {
    errors.push('You must agree to the open-review policy.');
  }

  return {
    errors,
    clean: {
      title, authors, email, type, track,
      keywords, wordCount: words,
      abstract, outline, bios, contribution, coi,
    },
  };
}

// ---------------------------------------------------------------------------
// email (Mailgun)
// ---------------------------------------------------------------------------

async function sendMagicLink(sub, confirmUrl) {
  const domain = process.env.EMAIL_DOMAIN;
  const apiKey = process.env.EMAIL_API_KEY;
  const fromAddr = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || 'Algorithmacy Conference';
  const base = (process.env.EMAIL_API_BASE || 'https://api.mailgun.net').replace(/\/$/, '');
  if (!domain || !apiKey || !fromAddr) throw new Error('email env not configured');

  const subject = 'Confirm your Algorithmacy Conference submission';
  const text =
`Hi,

You started a submission to the Algorithmacy Conference:

  "${sub.title}"
  Type:  ${sub.type}
  Track: ${TRACKS[sub.track]}

To publish it as a pull request on our open-review repository, open this link
and click "Confirm & publish" (valid for 1 hour):

  ${confirmUrl}

The pull request opens when you click the button, and its timestamp becomes your
authorship-priority record. If you didn't start this submission, you can ignore
this email — nothing will be published.

— Algorithmacy Conference`;

  const html =
`<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px">
  <p>Hi,</p>
  <p>You started a submission to the <strong>Algorithmacy Conference</strong>:</p>
  <blockquote style="margin:0 0 16px;padding:12px 16px;border-left:3px solid #888;background:#f6f6f6">
    <strong>${escapeHtml(sub.title)}</strong><br>
    Type: ${escapeHtml(sub.type)}<br>
    Track: ${escapeHtml(TRACKS[sub.track])}
  </blockquote>
  <p>To publish it as a pull request on our open-review repository, open the confirmation page and click the button:</p>
  <p><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;padding:12px 22px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Open confirmation page →</a></p>
  <p style="color:#666;font-size:13px">This link is valid for 1 hour. The pull request opens when you click "Confirm &amp; publish" on that page, and its timestamp becomes your authorship-priority record. If you didn't start this submission, ignore this email — nothing will be published.</p>
  <p style="color:#666;font-size:13px">— Algorithmacy Conference</p>
</div>`;

  const form = new URLSearchParams();
  form.append('from', `${fromName} <${fromAddr}>`);
  form.append('to', sub.email);
  form.append('subject', subject);
  form.append('text', text);
  form.append('html', html);
  form.append('o:tag', 'algorithmacy-submission');

  const resp = await fetch(`${base}/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64'),
    },
    body: form,
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`mailgun ${resp.status}: ${detail.slice(0, 300)}`);
  }
}

// ---------------------------------------------------------------------------
// Upstash Redis (REST) + helpers
// ---------------------------------------------------------------------------

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

async function overLimit(key, max) {
  const count = await redis(['INCR', key]);
  if (count === 1) await redis(['EXPIRE', key, '3600']);
  return count > max;
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
