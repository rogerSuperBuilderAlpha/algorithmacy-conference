// POST /api/studio
//
// Studio inquiry form. Sends one email to topanga@algorithmacy.org through the
// Hostinger Mail REST API. The token stays in HOSTINGER_MAIL_API_TOKEN and is
// never returned to the browser.
//
// Request shape checked against
// https://api.mail.hostinger.com/openapi/openapi.json
// POST /api/v1/mailboxes/{mailboxResourceId}/send
// schema V1.Send.Request (to, subject, text, displayName). Documented success
// is 204. We also treat 200 and 202 as success, per the integration spec.

const MAILBOX_ID = 'ACb8a59b487c338fadf34425697bad';
const SEND_URL = `https://api.mail.hostinger.com/api/v1/mailboxes/${MAILBOX_ID}/send`;
const STUDIO_TO = 'topanga@algorithmacy.org';
const USER_AGENT = 'algorithmacy-studio-form/1.0 (+topanga@algorithmacy.org)';
const DISPLAY_NAME = 'Algorithmacy Studio form';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OFFICES = [
  'law firm',
  'dental practice or med spa',
  'real estate office',
  'CPA firm',
  'owner-run office',
];

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 60 * 1000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const MAX_BODY_BYTES = 50_000;

const FRIENDLY_SEND_ERROR =
  'We could not send that from the form just now. Please email topanga@algorithmacy.org and we will reply.';

const hits = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    res.statusCode = e.statusCode || 400;
    return res.json({ error: e.publicMessage || 'Invalid request body' });
  }

  if (honeypotFilled(body)) return res.json({ ok: true });

  const { errors, clean } = validateInquiry(body);
  if (errors.length) {
    res.statusCode = 400;
    return res.json({ error: errors[0], errors });
  }

  const ip = clientIp(req);
  if (rateLimited(`ip:${ip}`) || rateLimited(`email:${clean.email}`)) {
    res.statusCode = 429;
    return res.json({
      error: 'Too many attempts. Please email topanga@algorithmacy.org, or try again in an hour.',
    });
  }

  const token = String(process.env.HOSTINGER_MAIL_API_TOKEN || '').trim();
  if (!token) {
    console.error('studio inquiry: HOSTINGER_MAIL_API_TOKEN is not set');
    res.statusCode = 503;
    return res.json({ error: FRIENDLY_SEND_ERROR });
  }

  const payload = mailPayload(clean);
  try {
    await sendViaHostinger(token, payload);
  } catch (e) {
    console.error('studio inquiry email error', e && e.message ? e.message : e);
    res.statusCode = 502;
    return res.json({ error: FRIENDLY_SEND_ERROR });
  }

  return res.json({ ok: true });
};

function validateInquiry(b) {
  const errors = [];
  const name = oneLine(b.name);
  if (name.length < 2 || name.length > 120) errors.push('Your name is required.');

  const business = oneLine(b.business);
  if (business.length < 2 || business.length > 160) errors.push('The business is required.');

  const email = oneLine(b.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) errors.push('A valid email is required.');

  const phoneRaw = oneLine(b.phone);
  let phone = '';
  if (phoneRaw) {
    const digits = phoneRaw.replace(/\D/g, '');
    if (phoneRaw.length > 40 || digits.length < 7 || digits.length > 15) {
      errors.push('That phone number does not look valid. You can leave it blank.');
    } else {
      phone = phoneRaw;
    }
  }

  const message = messageText(b.message != null ? b.message : b.chore);
  if (message.length < 2 || message.length > 4000) errors.push('Tell us the chore or message.');

  const intent = oneLine(b.intent) === 'other' ? 'other' : (oneLine(b.intent) === 'office' ? 'office' : '');
  if (!intent) errors.push('Choose the office engagement or other work.');

  let office = '';
  if (intent === 'office') {
    office = oneLine(b.office);
    if (!OFFICES.includes(office)) errors.push('Choose the kind of office.');
  }

  if (!termsAccepted(b.terms)) {
    errors.push('Please agree to the Terms of Service and Privacy Policy.');
  }

  const started = Number(b.started);
  if (!Number.isFinite(started)) {
    errors.push('Please reload the page and try again.');
  } else {
    const elapsed = Date.now() - started;
    if (elapsed < MIN_FILL_MS) errors.push('Please wait a moment and send it again.');
    else if (elapsed > MAX_AGE_MS || elapsed < -CLOCK_SKEW_MS) {
      errors.push('Please reload the page and try again.');
    }
  }

  const officeType = intent === 'other' ? 'other work' : office;

  return {
    errors,
    clean: { intent, name, business, email, phone, message, office, officeType },
  };
}

function mailPayload(clean) {
  const subjectBusiness = clean.business.slice(0, 120);
  const subject = `Studio inquiry: ${subjectBusiness} (${clean.officeType})`;
  const when = new Date().toISOString();
  const lines = [
    `Reply to: ${clean.email}`,
    '',
    `Submitted: ${when}`,
    'Terms accepted: yes. The visitor agreed to the Terms of Service and Privacy Policy.',
    '',
    `Name: ${clean.name}`,
    `Business: ${clean.business}`,
    `Email: ${clean.email}`,
    `Phone: ${clean.phone || '(not provided)'}`,
    `Path: ${clean.intent === 'other' ? 'Other work' : 'The office engagement'}`,
    `Office type: ${clean.officeType}`,
    'Chore or message:',
    clean.message,
  ];
  return {
    to: [STUDIO_TO],
    subject,
    text: lines.join('\n'),
    displayName: DISPLAY_NAME,
  };
}

async function sendViaHostinger(token, payload) {
  if (!payload.subject.startsWith('Studio inquiry:')) {
    throw new Error('subject prefix missing');
  }
  const resp = await fetch(SEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify(payload),
  });
  if (resp.status === 200 || resp.status === 202 || resp.status === 204) return;
  const detail = await resp.text().catch(() => '');
  throw new Error(`hostinger ${resp.status}: ${detail.slice(0, 300)}`);
}

function termsAccepted(value) {
  return value === true || value === 'true' || value === 'yes' || value === 'on' || value === '1';
}

function honeypotFilled(body) {
  const value = body && (body.hp_field != null ? body.hp_field : body.website);
  return typeof value === 'string' ? value.trim() !== '' : !!value;
}

function oneLine(v) {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function messageText(v) {
  if (typeof v !== 'string') return '';
  return v.replace(/\u0000/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

function rateLimited(key) {
  const now = Date.now();
  const prev = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (prev.length >= RATE_MAX) {
    hits.set(key, prev);
    return true;
  }
  prev.push(now);
  hits.set(key, prev);
  if (hits.size > 5000) {
    const oldest = hits.keys().next().value;
    hits.delete(oldest);
  }
  return false;
}

function clientIp(req) {
  const xff = req.headers && req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim().slice(0, 80) || 'unknown';
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = typeof req.body === 'string' ? req.body : await readRaw(req);
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    const err = new Error('body too large');
    err.statusCode = 413;
    err.publicMessage = 'That message is too long.';
    throw err;
  }
  if (!raw) return {};
  const type = String((req.headers && req.headers['content-type']) || '');
  if (type.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    const out = {};
    for (const [key, value] of params.entries()) out[key] = value;
    return out;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('invalid json');
    err.statusCode = 400;
    err.publicMessage = 'Invalid request body';
    throw err;
  }
}

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return '';
  return Buffer.concat(chunks).toString('utf8');
}
