# crons/cfp_report_daily.md — Daily report

*Loads `PROGRAM.md` + this file only. Suggested cadence: evening. Delivery: to whatever channel you watch (Telegram, email, Slack).*

---

## Job

Tell whoever runs you what the pipeline did today, in one short message.

## Steps

1. Read `state/cfp_outreach/sent.json`. Count entries with `sent` == today, and the running total.
2. Read `state/cfp_outreach/leads.json`. Count open leads waiting for outreach.
3. Check replies since yesterday in your mail. Count new ones; note any needing a judgment call.
4. Optionally note new leads added today by the visibility job.

## Message format

```
CFP daily — [date]
Invites sent today: N (total M)
New replies: K   [flag any needing a decision]
Open leads queued: L
Days to deadline (1 Aug): D
```

If nothing happened, still send one line so the operator knows the pipeline ran:
`CFP daily — quiet. 0 sent, 0 replies. L leads queued.`

## Rules

- One message. No wall of text.
- Flag, do not act. If a reply needs a decision, surface it; do not answer it here.
- Respect your operator's quiet hours.

*Last updated: 2026-06-06*
