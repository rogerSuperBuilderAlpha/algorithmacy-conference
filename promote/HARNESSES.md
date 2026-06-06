# HARNESSES.md — Setup for your agent harness

The program is harness-agnostic. It assumes your agent can do only three things, and this file maps those three onto the **generic case** (any custom agent) and onto two popular harnesses, **OpenClaw** and **Hermes**. Pick the section for your harness; the four job prompts live in `SETUP.md` and are identical across all of them.

## What every harness must provide

Every adapter below wires up the same three things. If your harness can do these, it can run the program:

1. **A scheduler** — to wake the agent on a cadence and run a job's prompt. The four jobs and their cadences are in `SETUP.md`.
2. **Persistent identity + memory** — your agent stays itself. The program is a mission it adopts per run, not a replacement for who it is. Never overwrite your identity files with the program.
3. **A writable state dir** — for the program's trackers. Copy `templates/sent.json` and `templates/leads.json` into a path the scheduled jobs can read and write; this doc calls it `<STATE>/cfp_outreach/`.

The golden rule from `SETUP.md` holds for every harness: **a job loads `PROGRAM.md` plus its one `crons/*.md` file and nothing else.** That line is what keeps token cost low enough for many people to run outreach at once.

---

## Generic — any custom agent

If you built your own harness, or use one not listed below, you only need to satisfy the three requirements above. Use this as a checklist:

| Requirement | What to wire up |
|---|---|
| Scheduler | Register the four jobs from `SETUP.md` at the suggested cadences. Each job's task is: read `PROGRAM.md` + one `crons/*.md`, follow it, write trackers. |
| Identity + memory | Keep your agent's own identity/memory store. Add the one-line standing instruction from `SETUP.md` so it follows the program until the conference. |
| State dir | Pick a writable dir, e.g. `~/.myagent/state/cfp_outreach/`, and seed it with the two templates. |
| Program source | Either clone the repo and read `promote/…` locally, or fetch the two raw GitHub files per run (URLs in `SETUP.md`). |

Fill these placeholders for your harness and you are done:

- Scheduler registration: *(how your harness registers a recurring job)*
- State path: `<STATE>/cfp_outreach/`
- Per-job prompt: the matching block in `SETUP.md`

---

## OpenClaw

OpenClaw runs a Gateway process with a built-in cron scheduler and a Markdown workspace. Paths below are OpenClaw defaults; confirm against your install.

**Where things live**

- **Workspace root:** `~/.openclaw/workspace/`. Your agent's identity and memory live here: `SOUL.md` (identity, tone, boundaries), `USER.md` (who you are), `AGENTS.md` (config / skill roster), `MEMORY.md` (durable facts), daily notes in `memory/YYYY-MM-DD.md`, recurring directives in `HEARTBEAT.md`.
- **Cron jobs:** `~/.openclaw/cron/jobs.json` (run history in `~/.openclaw/cron/runs/<jobId>.jsonl`). Override the store with `cron.store`.
- **Program state:** keep the trackers in the workspace, e.g. `~/.openclaw/workspace/state/cfp_outreach/{sent,leads}.json`.

**Keep your agent itself.** Do not overwrite `SOUL.md` / `USER.md`. Adopt the program as a mission by adding the standing instruction from `SETUP.md` to `HEARTBEAT.md` (or wherever your recurring directives live).

**Register the four jobs.** Each is an *isolated*-session cron job whose `message` is the matching per-job prompt from `SETUP.md`. Use a `cron` schedule for cadence; use `announce` delivery for the two reports so they reach your chat. Sketch of one entry in `jobs.json` (check the OpenClaw docs for exact field nesting):

```json
{
  "schedule": { "cron": "0 9 * * 1-5", "tz": "America/Port_of_Spain" },
  "session": "isolated",
  "agentTurn": {
    "message": "Read promote/PROGRAM.md and promote/crons/cfp_outreach.md from the Algorithmacy Conference repo. Do not read any other files. Follow cfp_outreach.md and log to state/cfp_outreach/."
  },
  "delivery": { "mode": "none" }
}
```

For the daily / weekly reports, set `delivery.mode` to `announce` and the channel/target to your chat. Schema reference: `schedule` is one of `at` | `every` | `cron`; `session` is `main` | `isolated`; `delivery.mode` is `announce` | `webhook` | `none`.

---

## Hermes

Hermes (Nous Research) is a self-hosted gateway with a built-in cron scheduler, Markdown memory, and a portable `SKILL.md` skill format (the agentskills.io standard). Config base is `~/.hermes/`.

**Where things live**

- **Config:** `~/.hermes/config.yaml`.
- **Memory / identity:** `MEMORY.md` (cross-session facts), `USER.md` (its model of you), `SOUL.md` (personality), `.hermes.md` (project context), under `~/.hermes/`.
- **Skills:** portable `SKILL.md` files (agentskills.io standard); Hermes ships 40+ bundled and you can add your own.
- **Program state:** a writable dir under your Hermes data, e.g. `~/.hermes/state/cfp_outreach/{sent,leads}.json`.

**Two ways to adopt:**

1. **As scheduled jobs (matches the other harnesses).** Use Hermes's built-in cron scheduler to register the four jobs from `SETUP.md`, each delivering to your platform (Telegram, Discord, Slack, WhatsApp, Signal, or CLI). Install the gateway as a service with `hermes gateway install`; configure messaging with `hermes gateway setup`. (Hermes's cron config keys are version-specific — set them per your `~/.hermes/config.yaml` and the current docs.)
2. **As a skill (Hermes-native).** The kit is already a load-only-what-you-need mission, so it maps cleanly onto Hermes's `SKILL.md` model: wrap the standing instruction plus per-job prompts as a skill the agent loads on demand. Keep `PROGRAM.md` + one `crons/*.md` as the skill's references so the lean-loading rule still holds.

**Keep your agent itself.** Do not overwrite `SOUL.md` / `USER.md` / `MEMORY.md`. Add the standing instruction from `SETUP.md` as durable guidance (or via the skill above).

---

## Adding another harness

Any harness with a scheduler, persistent memory, and a writable workspace fits the program. Copy the **Generic** section, fill the three placeholders with your harness's specifics, and — if it's a popular one — open a pull request adding a section here so the next ambassador does not have to rediscover it.

*Last updated: 2026-06-06*
