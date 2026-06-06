# crons/cfp_report_weekly.md — Weekly report

*Loads `PROGRAM.md` + this file only. Suggested cadence: Monday morning. Delivery: to whatever channel you watch.*

---

## Job

Give your operator a weekly read on outreach: what moved, what is stuck, what needs a decision.

## Steps

1. Read `state/cfp_outreach/sent.json`. Tally invitations sent in the last 7 days, broken down by track. Note the running total.
2. Read `state/cfp_outreach/replies.md`. Summarize the week's replies: interested, declined, questions. Pull out anything awaiting a decision.
3. Read `state/cfp_outreach/leads.json`. How many leads are queued, and from where.
4. If you can reach the repo, scan `/submissions/` or the open pull requests for new abstracts that may trace to outreach.
5. Compose a short, structured summary.

## Message format

```
CFP weekly — week of [date]

Sent this week: N (total M)
  TR.01 a · TR.02 b · TR.03 c · TR.04 d · TR.05 e
Replies: interested X, declined Y, questions Z
Needs a decision: [list, or "nothing"]
Leads queued: L
Submissions seen: S
Days to deadline (1 Aug): D

[one-line read on momentum]
```

## Rules

- Scannable. A few lines longer than the daily is fine.
- Surface decisions clearly under "Needs a decision." The operator acts; the job does not.

*Last updated: 2026-06-06*
