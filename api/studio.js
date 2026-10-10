// POST /api/studio
//
// Studio landing-page inquiry. Emails roger@algorithmacy.org through the same
// Mailgun path as paper intake. The visitor's address is Reply-To.

const core = require('../lib/submission-core.js');

const STUDIO_TO = 'roger@algorithmacy.org';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OFFICES = [
  'law firm',
  'dental practice or med spa',
  'real estate office',
  'CPA firm',
  'owner-run office',
];

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

  if (body.website) return res.json({ ok: true });

  const { errors, clean } = validateInquiry(body);
  if (errors.length) {
    res.statusCode = 400;
    return res.json({ error: errors[0], errors });
  }

  const ip = clientIp(req);
  try {
    if (await core.rateLimited({ email: clean.email, ip })) {
      res.statusCode = 429;
      return res.json({ error: 'Too many attempts. Please try again in an hour.' });
    }
  } catch (e) {
    console.error('studio rate-limit store error', e);
  }

  try {
    await core.sendMessage({
      to: STUDIO_TO,
      replyTo: clean.email,
      subject: 'Studio — ' + clean.business,
      text: inquiryText(clean),
      html: inquiryHtml(clean),
      tag: 'algorithmacy-studio',
    });
  } catch (e) {
    console.error('studio inquiry email error', e);
    res.statusCode = 502;
    return res.json({ error: 'We could not send that. Use the email link, or try again.' });
  }

  return res.json({ ok: true });
};

function validateInquiry(b) {
  const errors = [];
  const str = (v) => (typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ').trim() : '');

  const intent = str(b.intent) === 'other' ? 'other' : (str(b.intent) === 'office' ? 'office' : '');
  if (!intent) errors.push('Choose the office engagement or other work.');

  const name = str(b.name);
  if (name.length < 2 || name.length > 120) errors.push('Your name is required.');

  const business = str(b.business);
  if (business.length < 2 || business.length > 160) errors.push('The business is required.');

  const chore = str(b.chore);
  if (chore.length < 2 || chore.length > 400) {
    errors.push('Tell us the work.');
  }

  const email = str(b.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) errors.push('A valid email is required.');

  let office = '';
  if (intent === 'office') {
    office = str(b.office);
    if (!OFFICES.includes(office)) errors.push('Choose the kind of office.');
  }

  return { errors, clean: { intent, name, business, chore, email, office } };
}

function inquiryText(clean) {
  const path = clean.intent === 'other' ? 'Other work' : 'The office engagement';
  const lines = [
    path,
    '',
    'Name: ' + clean.name,
    'Email: ' + clean.email,
    'Business: ' + clean.business,
  ];
  if (clean.office) lines.push('Office: ' + clean.office);
  lines.push('Work: ' + clean.chore);
  lines.push('');
  lines.push('Reply to the address above.');
  return lines.join('\n');
}

function inquiryHtml(clean) {
  const path = clean.intent === 'other' ? 'Other work' : 'The office engagement';
  const rows = [
    ['Name', clean.name],
    ['Email', clean.email],
    ['Business', clean.business],
  ];
  if (clean.office) rows.push(['Office', clean.office]);
  rows.push(['Work', clean.chore]);
  const body = rows.map(([label, value]) =>
    `<p style="margin:0 0 8px"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
  ).join('');
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a;max-width:560px">
  <p style="margin:0 0 12px">${escapeHtml(path)}</p>
  ${body}
  <p style="color:#666;font-size:13px">Reply to ${escapeHtml(clean.email)}.</p>
</div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
