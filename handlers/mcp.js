// Remote MCP server for the Algorithmacy Conference — Streamable HTTP, stateless,
// hand-rolled JSON-RPC (no SDK dependency, so the site stays buildless).
//
// Endpoint: POST https://algorithmacy.org/api/mcp
//
// Lets an AI agent prepare a submission on a researcher's behalf. The agent does
// all the work, but it CANNOT publish on its own: submit_abstract emails the
// sign-off link to the contact address and returns no token, so only the human
// who receives the email can open the pull request.
//
// Tools:
//   • list_tracks      — tracks, types, and field requirements
//   • submit_abstract  — validate + email the author a one-click sign-off link
//
// Reuses ../lib/submission-core.js (same logic as the web form).

const core = require('../lib/submission-core.js');

const SERVER_INFO = { name: 'algorithmacy-conference', version: '1.0.0' };
const DEFAULT_PROTOCOL = '2025-06-18';
const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const TOOLS = [
  {
    name: 'list_tracks',
    description: 'List the 2027 conference tracks (six ids, TR.01 through TR.06) and the 2026 archive tracks (five ids, TR.01 through TR.05), plus submission types and field requirements.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'submit_abstract',
    description:
      'Prepare an Algorithmacy Conference submission and email the author a one-click sign-off link. Does NOT open the pull request directly — the author must click the link in their email to publish. Returns confirmation that the email was sent; it never returns the sign-off token, so the agent cannot self-approve.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Paper title (3–300 characters)' },
        authors: { type: 'string', description: 'Authors with affiliations, e.g. "Jane Doe (MIT), John Roe (Bentley)"' },
        email: { type: 'string', description: "Author's contact email — the sign-off link is sent here" },
        type: { type: 'string', enum: core.TYPES },
        track: {
          type: 'string',
          enum: Object.keys(core.TRACKS_2027),
          description: 'TR.01–TR.06 when conference is "2027". TR.01–TR.05 when conference is omitted or "2026". TR.06 is rejected for 2026.',
        },
        keywords: {
          anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: '3–7 keywords, comma-separated or as an array',
        },
        abstract: { type: 'string', description: 'Abstract, 300–500 words' },
        outline: { type: 'string', description: '5–10 bullet outline, or panel participants, or poster description' },
        bios: { type: 'string', description: 'Author bio(s), ≤100 words each' },
        contribution: { type: 'string', description: 'One-sentence summary of what is new (optional)' },
        coi: { type: 'string', description: 'Conflicts of interest, or "none" (optional)' },
        specialSession: { type: 'string', description: 'Special session to submit to, e.g. "Digital Sovereignty", "Algorithmic Literacy", or "Critical Cultural Research" (optional). Still pick a track.' },
        conference: { type: 'string', enum: ['2026', '2027'], description: 'Conference year. Use "2027" for the Second Algorithmacy Conference. Omit to submit to 2026.' },
      },
      required: ['title', 'authors', 'email', 'type', 'track', 'keywords', 'abstract', 'outline', 'bios'],
      additionalProperties: false,
    },
  },
];

// ---------------------------------------------------------------------------
// tool implementations
// ---------------------------------------------------------------------------

async function callTool(name, args) {
  if (name === 'list_tracks') {
    const tracks2027 = Object.values(core.TRACKS_2027).map((t) => `  ${t}`).join('\n');
    const tracks2026 = Object.values(core.TRACKS).map((t) => `  ${t}`).join('\n');
    const types = core.TYPES.map((t) => `  ${t}`).join('\n');
    return text(
`Algorithmacy Conference — submission reference

2027 uses six ids, TR.01 through TR.06. Set conference to "2027". Pick exactly one id:
${tracks2027}

2026 archive (omit conference, or set it to "2026") uses five ids, TR.01 through TR.05. TR.06 is rejected for 2026:
${tracks2026}

Types (pick exactly one):
${types}

Required fields for submit_abstract:
  title        — 3–300 chars
  authors      — name + affiliation for each, e.g. "Jane Doe (MIT), John Roe (Bentley)"
  email        — author's contact email (the sign-off link is sent here)
  type         — one of the types above
  track        — TR.01–TR.06 for conference "2027"; TR.01–TR.05 if conference is omitted or "2026"
  keywords     — 3–7, comma-separated (or an array)
  abstract     — 300–500 words
  outline      — 5–10 bullets (or panel participants / poster description)
  bios         — author bio(s), ≤100 words each
Optional:
  contribution   — one-sentence summary of what's new
  coi            — conflicts of interest, or "none"
  specialSession — a special session, e.g. "Digital Sovereignty" (chaired by
                   Samuel Fosso Wamba) or "Critical Cultural Research" (chaired
                   by Sarah Witmer); still pick a track
  conference     — "2027" for the Second Algorithmacy Conference. Omit for 2026.
                   The 2026 meeting has concluded. The 2027 call is open.
                   Tentatively the last week of October 2027 (subject to change).
                   Venue to be announced. Abstract deadline: September 30, 2027.
                   Review is rolling until then, so submissions are reviewed as they arrive.

The 2027 call for papers is open. Tentatively the last week of October 2027
(subject to change). Venue to be announced. The abstract deadline is
September 30, 2027. Review is rolling until then, so submissions are reviewed
as they arrive. The 2026 meeting has concluded. All submissions and reviews are
public; the pull request timestamp is the author's priority record. A 2027
submission is stored separately from a 2026 submission by the same email.`);
  }

  if (name === 'submit_abstract') {
    const { errors, clean } = core.validate(args || {});
    if (errors.length) {
      return text(`Submission not accepted — fix these and retry:\n- ${errors.join('\n- ')}`, true);
    }
    try {
      await core.enforceRate({
        email: clean.email,
        bucket: 'mcp',
        message: 'Rate limit reached for this email. Please try again in an hour.',
      });
    } catch (e) {
      if (e.status === 429) return text(e.message, true);
      if (e.status === 503) throw e;
      throw e;
    }
    try {
      await core.startSubmission(clean, process.env.SITE_URL);
    } catch (e) {
      return text(`Could not send the confirmation email: ${e.message}`, true);
    }
    return text(
`✓ Submission prepared: "${clean.title}" (Conference ${clean.conference}, ${clean.type}, ${core.trackLabel(clean.track, clean.conference)}).

A one-click sign-off link was emailed to ${clean.email}. The author must open that
email and click "Confirm & publish" to open the pull request — nothing is published
until they do. The sign-off link was not returned here, so it can only be actioned
by the person who receives the email.`);
  }

  return text(`Unknown tool: ${name}`, true);
}

function text(t, isError) {
  return { content: [{ type: 'text', text: t }], ...(isError ? { isError: true } : {}) };
}

// ---------------------------------------------------------------------------
// JSON-RPC routing
// ---------------------------------------------------------------------------

async function handleRpc(msg) {
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
    return { jsonrpc: '2.0', id: (msg && msg.id) ?? null, error: { code: -32600, message: 'Invalid Request' } };
  }
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  try {
    if (method === 'initialize') {
      const requested = params && params.protocolVersion;
      const protocolVersion = SUPPORTED_PROTOCOLS.includes(requested) ? requested : DEFAULT_PROTOCOL;
      return reply(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: 'Prepare and submit abstracts to the Algorithmacy Conference. The author must confirm by email before any pull request is opened.',
      });
    }
    if (method === 'ping') return reply(id, {});
    if (method === 'tools/list') return reply(id, { tools: TOOLS });
    if (method === 'tools/call') {
      if (!params || typeof params.name !== 'string') {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params: name required' } };
      }
      const result = await callTool(params.name, params.arguments || {});
      return reply(id, result);
    }
    // notifications/* and other fire-and-forget messages: no response
    if (isNotification) return null;
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
  } catch (e) {
    if (e.status === 503) throw e;
    console.error('rpc error', method, e);
    if (isNotification) return null;
    return { jsonrpc: '2.0', id, error: { code: -32603, message: 'Internal error' } };
  }
}

function reply(id, result) {
  return { jsonrpc: '2.0', id, result };
}

// ---------------------------------------------------------------------------
// HTTP entry
// ---------------------------------------------------------------------------

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, mcp-session-id, mcp-protocol-version');

  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'POST JSON-RPC to this endpoint.' } }));
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }));
  }

  if (Array.isArray(body)) {
    let out;
    try {
      out = (await Promise.all(body.map(handleRpc))).filter(Boolean);
    } catch (e) {
      if (e.status === 503) return paused(res);
      throw e;
    }
    if (!out.length) { res.statusCode = 202; return res.end(); }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(out));
  }

  let out;
  try {
    out = await handleRpc(body);
  } catch (e) {
    if (e.status === 503) return paused(res);
    throw e;
  }
  if (!out) { res.statusCode = 202; return res.end(); } // notification → no body
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(out));
};

function paused(res) {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    jsonrpc: '2.0',
    id: null,
    error: { code: -32000, message: 'Submissions are paused. Try again shortly.' },
  }));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
