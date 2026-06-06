// Shared submission intake logic, used by both the web form (api/submit.js) and
// the MCP server (api/mcp.mjs). One source of truth for validation, rate limiting,
// the pending-token store, and the magic-link email.
//
// IMPORTANT: startSubmission emails the sign-off link to the contact address and
// returns NO token to the caller. That is deliberate — an agent submitting via MCP
// must not be able to self-approve; only the human who receives the email can.

const crypto = require('node:crypto');

const TYPES = ['Full paper', 'Note', 'Panel', 'Poster', 'Practitioner report'];
const TRACKS = {
  'TR.01': 'TR.01 — Coordination & Mediation',
  'TR.02': 'TR.02 — Algorithmic Management',
  'TR.03': 'TR.03 — Platform Labor & Worker Voice',
  'TR.04': 'TR.04 — Trust, Opacity & Governance',
  'TR.05': 'TR.05 — Methods, Lineage & Practice',
};

const TOKEN_TTL_SECONDS = 60 * 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const keywordsRaw = Array.isArray(b.keywords) ? b.keywords.join(', ') : str(b.keywords);
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

  return {
    errors,
    clean: { title, authors, email, type, track, keywords, wordCount: words, abstract, outline, bios, contribution, coi },
  };
}

// ---------------------------------------------------------------------------
// rate limiting
// ---------------------------------------------------------------------------

// Returns true if any applicable bucket is over its limit.
async function rateLimited({ email, ip, bucket } = {}) {
  const checks = [];
  if (email) checks.push([`acf:rate:email:${sha256(email)}`, 4]);
  if (ip) checks.push([`acf:rate:ip:${ip}`, 8]);
  if (bucket) checks.push([`acf:rate:${bucket}`, 60]);
  for (const [key, max] of checks) {
    const count = await redis(['INCR', key]);
    if (count === 1) await redis(['EXPIRE', key, '3600']);
    if (count > max) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// pending store + magic-link email  (returns nothing — token stays server-side)
// ---------------------------------------------------------------------------

async function startSubmission(clean, siteUrl) {
  const token = crypto.randomBytes(24).toString('base64url');
  await redis(['SET', `acf:pending:${token}`, JSON.stringify(clean), 'EX', String(TOKEN_TTL_SECONDS)]);
  const base = (siteUrl || 'https://algorithmacy.org').replace(/\/$/, '');
  // Static confirmation page with a Confirm button — scanner-safe (see api/confirm.js).
  const confirmUrl = `${base}/submit/confirm/?token=${token}`;
  await sendMagicLink(clean, confirmUrl);
  return { ok: true, email: clean.email };
}

async function sendMagicLink(sub, confirmUrl) {
  const domain = process.env.EMAIL_DOMAIN;
  const apiKey = process.env.EMAIL_API_KEY;
  const fromAddr = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || 'Algorithmacy Conference';
  const apiBase = (process.env.EMAIL_API_BASE || 'https://api.mailgun.net').replace(/\/$/, '');
  if (!domain || !apiKey || !fromAddr) throw new Error('email env not configured');

  const subject = 'Confirm your Algorithmacy Conference submission';
  const text =
`Hi,

A submission to the Algorithmacy Conference was prepared with your email as the
contact:

  "${sub.title}"
  Type:  ${sub.type}
  Track: ${TRACKS[sub.track]}

To publish it as a pull request on our open-review repository, open this link
and click "Confirm & publish" (valid for 1 hour):

  ${confirmUrl}

The pull request opens when you click the button, and its timestamp becomes your
authorship-priority record. If you didn't expect this, you can ignore this email
— nothing will be published without your click.

— Algorithmacy Conference`;

  const html =
`<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px">
  <p>Hi,</p>
  <p>A submission to the <strong>Algorithmacy Conference</strong> was prepared with your email as the contact:</p>
  <blockquote style="margin:0 0 16px;padding:12px 16px;border-left:3px solid #888;background:#f6f6f6">
    <strong>${escapeHtml(sub.title)}</strong><br>
    Type: ${escapeHtml(sub.type)}<br>
    Track: ${escapeHtml(TRACKS[sub.track])}
  </blockquote>
  <p>To publish it as a pull request on our open-review repository, open the confirmation page and click the button:</p>
  <p><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;padding:12px 22px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Open confirmation page →</a></p>
  <p style="color:#666;font-size:13px">This link is valid for 1 hour. The pull request opens when you click "Confirm &amp; publish" on that page, and its timestamp becomes your authorship-priority record. If you didn't expect this, ignore this email — nothing will be published without your click.</p>
  <p style="color:#666;font-size:13px">— Algorithmacy Conference</p>
</div>`;

  const form = new URLSearchParams();
  form.append('from', `${fromName} <${fromAddr}>`);
  form.append('to', sub.email);
  form.append('subject', subject);
  form.append('text', text);
  form.append('html', html);
  form.append('o:tag', 'algorithmacy-submission');

  const resp = await fetch(`${apiBase}/v3/${domain}/messages`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64') },
    body: form,
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`mailgun ${resp.status}: ${detail.slice(0, 300)}`);
  }
}

// ---------------------------------------------------------------------------
// helpers
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

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

module.exports = { TYPES, TRACKS, validate, rateLimited, startSubmission };
