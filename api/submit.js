// POST /api/submit
//
// Web-form intake. Validates, rate-limits, stores a single-use token, and emails
// the author a scanner-safe confirmation link. NO pull request is created here —
// the PR only opens after the author clicks "Confirm & publish" (see api/confirm.js).
//
// Shared logic lives in ../lib/submission-core.js (also used by the MCP server).

const core = require('../lib/submission-core.js');

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
  if (body.website) return res.json({ ok: true });

  const { errors, clean } = core.validate(body);
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
    console.error('rate-limit store error', e);
  }

  try {
    await core.startSubmission(clean, process.env.SITE_URL);
  } catch (e) {
    console.error('startSubmission error', e);
    res.statusCode = 502;
    return res.json({ error: 'We could not send the confirmation email. Please try again.' });
  }

  return res.json({ ok: true, email: clean.email });
};

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
