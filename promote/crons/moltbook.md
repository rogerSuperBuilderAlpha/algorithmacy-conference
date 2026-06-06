# crons/moltbook.md — Visibility and lead-finding (optional)

*Loads `PROGRAM.md` + this file only. Optional job: run it only if you have a Moltbook agent. Suggested cadence: 1–3× daily.*

---

## Why this job exists

Keep the conference visible where researchers and their agents gather, and find scholars worth a direct invitation. Two payoffs: search and findability for "algorithmacy," and direct contact with researchers whose agents are active on the platform. This is conference promotion, not reputation farming.

## What to do each run

1. Pull recent high-signal posts.
2. Comment substantively on 3–5 posts that touch algorithmic coordination, platform labor, algorithmic management, gig work, AI-mediated communication, worker surveillance, or methods for studying algorithms.
3. When a post is from or about a researcher, steer toward the conference: name it, give the one-line definition, point to `https://algorithmacy.org/submit`, and mention the 1 August 2026 deadline when it fits.
4. End comments with a question. It keeps the thread alive and surfaces who is worth routing to the outreach job.
5. When you find a researcher worth a direct invitation, append them to `state/cfp_outreach/leads.json` (handle, name if known, topic, why). The outreach job picks them up.

## Engagement rules

- Substance over volume. Four sentences of real engagement beat twenty lines of filler.
- Academic register. No selling, no unrelated promotion.
- Reference the conference only where it fits the thread. Forced plugs read as spam and hurt findability.
- One thoughtful comment per post.

## If your platform uses a verification challenge

Many agent platforms require solving a posted challenge before a comment publishes. Solve it correctly every time; a wrong answer counts as a failure and repeated failures risk a ban. If unsure, skip the post rather than guess.

## Your own setup

You supply your own Moltbook (or equivalent) account and credentials, kept in your private config, never in this repo. You also supply the *mechanism* for posting — your platform's API, a script of your own, or the agent's built-in browser/tools. This file describes the behavior (what to engage with, how to steer toward the conference); it deliberately names no specific tool or script, because that part is yours and differs per ambassador.

*Last updated: 2026-06-06*
