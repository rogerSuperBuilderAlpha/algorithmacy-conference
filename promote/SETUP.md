# SETUP.md — Point your agent here and run lean

This program lets any AI agent — OpenClaw, Hermes, or any MCP-capable assistant — help promote the Algorithmacy Conference. Your agent reads its instructions straight from this repo and loads only what each scheduled job needs, so token usage stays low.

This file covers what is the same for every agent: what you provide, how the repo is read, and the four jobs and their prompts. For wiring those jobs into a **specific harness** (OpenClaw, Hermes, or your own custom agent) — where crons, memory, and state live — see `HARNESSES.md`.

## What you provide

Kept in your own private config, never committed to this repo:

- An email account for sending invitations and reading replies.
- Academic search access. OpenAlex needs no key; CORE and Semantic Scholar are free with a key.
- Optionally, a Moltbook (or similar) agent if you want to run the visibility job.
- A place for your trackers. Copy `templates/sent.json`, `templates/leads.json`, **and `templates/config.json`** into your own `state/cfp_outreach/`. `config.json` controls outreach mode — it ships as `{"mode": "approval", "max_per_run": 5}`, so outreach drafts for your sign-off until you change it.
- A capable agent model — see **Model requirements** below.

## How the agent reads this repo

The program is just files in this repo. A job needs exactly two of them: `PROGRAM.md` and its one `crons/*.md` task file. Read the warning before you choose how to load them — this is the single most common setup failure.

> ⚠️ **A scheduled / cron job usually runs in a fresh, isolated session with no copy of this repo on disk.** If you tell such a job to "read `promote/PROGRAM.md`," it looks on its own local filesystem, finds nothing, and reports *"file not found"* — the job appears to complete but does no work, and a report job will happily "deliver" that error to your channel as if it were a result. **Phrase every job as an HTTP fetch of the raw URLs below — not a local file read** — unless you have genuinely cloned this repo into a path the running job can reach.

**Option A — Fetch raw files at run time (default; works for any agent, any harness).** Each job fetches its two files over HTTP — your `web_fetch` / `fetch` tool, or `curl` — from these exact URLs. The repo is public; no token needed.

```
Base: https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/

  PROGRAM.md                  →  <base>/PROGRAM.md
  crons/cfp_outreach.md       →  <base>/crons/cfp_outreach.md
  crons/cfp_report_daily.md   →  <base>/crons/cfp_report_daily.md
  crons/cfp_report_weekly.md  →  <base>/crons/cfp_report_weekly.md
  crons/moltbook.md           →  <base>/crons/moltbook.md
```

**Option B — Clone once, read locally.** `git clone` the repo into a persistent path your jobs share, point each job at `promote/PROGRAM.md` plus its one `promote/crons/*.md` file, and `git pull` occasionally to stay current. Use this **only** if your jobs actually run in that working directory — many cron / isolated sessions do not, which is why Option A is the default.

Either way the rule is the same: a job loads `PROGRAM.md` plus exactly one task file, and nothing else. That is the whole token-saving design.

## The jobs and their prompts

Set each scheduled job's prompt to fetch only its two files and not wander. Each prompt below is copy-paste ready (Option A — raw fetch). Suggested cadence in parentheses; adjust to your capacity. If you cloned instead (Option B), swap the two URLs for the matching local `promote/...` paths.

**Scholar outreach (weekday mornings):**
```
Fetch these two files over HTTP — use your web_fetch/fetch tool or curl, do
NOT try to open them as local files:
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/PROGRAM.md
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/crons/cfp_outreach.md
Fetch nothing else. Then follow cfp_outreach.md. Before contacting anyone,
read state/cfp_outreach/config.json to determine mode: if it is missing or
says "approval", you are in APPROVAL mode — DRAFT invitations and present
them to me for sign-off, and send NOTHING. Only send directly if config.json
exists and explicitly says "autonomous". Find scholars matched to a track,
verify them, and log only what is actually sent to your state/cfp_outreach/
trackers (sent.json, leads.json).
```

**Daily report (evening):**
```
Fetch these two files over HTTP (web_fetch/fetch tool or curl, not local
file reads):
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/PROGRAM.md
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/crons/cfp_report_daily.md
Fetch nothing else. Follow it and send the one-line summary to my channel.
```

**Weekly report (Monday morning):**
```
Fetch these two files over HTTP (web_fetch/fetch tool or curl, not local
file reads):
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/PROGRAM.md
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/crons/cfp_report_weekly.md
Fetch nothing else. Follow it and send the weekly summary to my channel.
```

**Visibility on Moltbook (optional, 1–3× daily):**
```
Fetch these two files over HTTP (web_fetch/fetch tool or curl, not local
file reads):
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/PROGRAM.md
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/crons/moltbook.md
Fetch nothing else. Follow it: engage substantively, keep the conference
visible, and add researcher leads to state/cfp_outreach/leads.json.
```

Two lines do the heavy lifting in every prompt. "Fetch nothing else" holds the token savings — without it an agent pulls its whole workspace out of habit. "Over HTTP … not local file reads" prevents the most common failure, where an isolated session reads an empty local path and silently does nothing.

### Confirm it actually worked

A job that fetched nothing still "completes" — the model just answers with a *file not found* note. So after you register the jobs, **do one test run of each and confirm the output is real work, not an error.** The tell for a healthy daily report is a real line like `CFP daily — quiet. 0 sent, 0 replies. 0 leads queued.` If you instead see "could not find `promote/PROGRAM.md`," the job is reading locally — switch its prompt to the HTTP-fetch form above.

## Model requirements

The jobs are only as reliable as the model running them. Two failure modes show up with weak or very small/fast models, and both are silent — the job "completes" but does no real work:

- **It ignores "fetch this URL" and reads locally.** A model that defaults to local file reads instead of an HTTP fetch will hit *file not found*, then deliver that as if it were a result. (See the warning under "How the agent reads this repo.")
- **It writes fluent invitations with buried errors.** Outreach demands real verification — a real scholar, a real address, a correctly characterized work. Small models produce plausible hooks that misattribute or fabricate, which is exactly what approval mode and the verification rules guard against.

So: **run these jobs on a model that reliably follows HTTP-fetch and verification instructions** — a current Claude (Opus or Sonnet) or an equivalent frontier model. Avoid "flash"/"mini"/"nano" tiers for these jobs, **especially outreach**. If your harness lets you set a model per job, pin a strong one on the jobs (`HARNESSES.md` shows where for OpenClaw and Hermes); the reports tolerate a lighter model better than outreach does.

## Telling your agent to follow the program exclusively

Once the jobs are set (see `HARNESSES.md` for how to register them on your harness), instruct your agent in one line:

```
From now until the Algorithmacy Conference (Oct 28–31, 2026), follow the
promotion program in the algorithmacy-conference repo. Start by fetching
https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/SETUP.md
over HTTP (not a local file read) and do what it says: reset your crons to
its four jobs, using the raw-URL fetch prompts exactly as written. Then do a
test run of each job and confirm it returned real work, not a "file not
found" error, before trusting the schedule. Keep your own identity and
memory; load the program per job, not your whole workspace. Pause unrelated
scheduled work until the conference.
```

Your agent keeps being itself. The program is a mission it adopts, loaded lean, one task file per job — and every load is an HTTP fetch of a raw URL, never an assumption that the files are already on disk.

## Keeping your secrets out of the repo

Your email password, API keys, and platform credentials live in your own private config. Never place them in this repo or in any file you submit as a pull request. The program is deliberately agent-agnostic so that nothing here depends on your secrets.

*Last updated: 2026-06-06*
