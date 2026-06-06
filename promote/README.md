# Promote the Algorithmacy Conference

This folder is an open, agent-agnostic kit for helping promote the Algorithmacy Conference. Point your AI agent — OpenClaw, Hermes, or any MCP-capable assistant — at it, and the agent can identify scholars whose work fits the conference and invite them to submit, on a lean token budget.

The outreach methods are public on purpose. The conference runs open, signed, published review, and its promotion follows the same principle: anyone can see exactly how scholars are being reached, and anyone can run the program themselves.

## Quick start — give your agent this

```
Help promote the Algorithmacy Conference. Fetch this file over HTTP — use
your web_fetch/fetch tool or curl, do NOT read it as a local file:
  https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/SETUP.md
Then do exactly what it says: register its four scheduled jobs using the
raw-URL fetch prompts exactly as written, do a test run of each, and confirm
it returned real work (not a "file not found" error) before trusting the
schedule. Keep your own identity and memory; load the program per job, not
your whole workspace. The canonical site is https://algorithmacy.org.
```

That single instruction bootstraps everything below. The rest of this folder is the detail.

## What's here

```
PROGRAM.md      the shared base every job loads: mission, conference facts, rules
crons/          one lean file per scheduled job
  cfp_outreach.md       find and invite scholars (the core job)
  cfp_report_daily.md   evening summary
  cfp_report_weekly.md  Monday summary
  moltbook.md           optional visibility / lead-finding
SETUP.md        how to point your agent here, set the jobs, run lean
HARNESSES.md    harness-specific wiring: generic, OpenClaw, Hermes
PRD.md          the requirements and policy behind the program
templates/      starter files (sent.json, leads.json, config.json) to copy into your own state/
```

## How it works in one paragraph

Each scheduled job loads `PROGRAM.md` plus its own single file in `crons/`, and nothing else. That is the whole design: an agent gets just the mission, the facts, and the one task in front of it, so a run costs a fraction of loading a full workspace. You supply your own email, search access, and trackers; the repo supplies the program.

## Start here

Read `SETUP.md` for the step-by-step and the exact prompt strings for each job, including the one-line instruction to tell your agent to follow the program until the conference. Then see `HARNESSES.md` for wiring those jobs into your specific harness — OpenClaw, Hermes, or any custom agent.

## The rules that matter most

Verify every scholar before contacting them. One scholar, one invitation, never a re-email. Never misstate a conference fact. Never submit on a scholar's behalf without their own emailed sign-off. Keep your credentials out of this repo. Full policy in `PRD.md` and `PROGRAM.md`.

## Conference details

Canonical, always-current details are in the repo root: `/README.md` and `/llms-full.txt`. The short version: Algorithmacy Conference, October 28–31, 2026, La Brea Pitch Lake, Trinidad & Tobago. Abstracts due 1 August 2026. Contact: Roger Hunt, rhunt@bentley.edu.
