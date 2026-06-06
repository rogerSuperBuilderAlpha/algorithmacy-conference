# SETUP.md — Point your agent here and run lean

This program lets any AI agent (an openclaw, or any MCP-capable assistant) help promote the Algorithmacy Conference. Your agent reads its instructions straight from this repo and loads only what each scheduled job needs, so token usage stays low.

## What you provide

Kept in your own private config, never committed to this repo:

- An email account for sending invitations and reading replies.
- Academic search access. OpenAlex needs no key; CORE and Semantic Scholar are free with a key.
- Optionally, a Moltbook (or similar) agent if you want to run the visibility job.
- A place for your trackers. Copy `templates/sent.json` and `templates/leads.json` into your own `state/cfp_outreach/`.

## How the agent reads this repo

Two options, both lean:

1. **Clone once, read locally.** `git clone` the repo and point each job at `promote/PROGRAM.md` plus its one `promote/crons/*.md` file. Pull occasionally to stay current.
2. **Fetch raw files at run time.** Each job fetches just its two files from raw GitHub:
   ```
   https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/PROGRAM.md
   https://raw.githubusercontent.com/rogerSuperBuilderAlpha/algorithmacy-conference/main/promote/crons/cfp_outreach.md
   ```

Either way, the rule is the same: a job loads `PROGRAM.md` plus exactly one task file, and nothing else. That is the whole token-saving design.

## The jobs and their prompts

Set each scheduled job's prompt to read only its two files and not wander. Suggested cadence in parentheses; adjust to your capacity.

**Scholar outreach (weekday mornings):**
```
Read promote/PROGRAM.md and promote/crons/cfp_outreach.md from the
Algorithmacy Conference repo. Do not read any other files. Follow
cfp_outreach.md: find scholars matched to a track, verify them, send
personal invitations, and log to your state/cfp_outreach/ trackers.
```

**Daily report (evening):**
```
Read promote/PROGRAM.md and promote/crons/cfp_report_daily.md. Do not read
any other files. Follow it and send the one-line summary to my channel.
```

**Weekly report (Monday morning):**
```
Read promote/PROGRAM.md and promote/crons/cfp_report_weekly.md. Do not read
any other files. Follow it and send the weekly summary to my channel.
```

**Visibility on Moltbook (optional, 1–3× daily):**
```
Read promote/PROGRAM.md and promote/crons/moltbook.md. Do not read any other
files. Follow it: engage substantively, keep the conference visible, and add
researcher leads to state/cfp_outreach/leads.json.
```

The line "do not read any other files" is what holds the savings. Without it an agent tends to pull its whole workspace out of habit.

## Telling your openclaw to follow the program exclusively

Once the jobs are set, instruct your agent in one line:

```
From now until the Algorithmacy Conference (Oct 28–31, 2026), follow the
promotion program in the algorithmacy-conference repo under promote/.
Reset your crons to the four jobs in promote/SETUP.md and run them
exclusively. Keep your own identity and memory; load the program per job,
not your whole workspace. Pause unrelated scheduled work until the conference.
```

Your agent keeps being itself. The program is a mission it adopts, loaded lean, one task file per job.

## Keeping your secrets out of the repo

Your email password, API keys, and platform credentials live in your own private config. Never place them in this repo or in any file you submit as a pull request. The program is deliberately agent-agnostic so that nothing here depends on your secrets.

*Last updated: 2026-06-06*
