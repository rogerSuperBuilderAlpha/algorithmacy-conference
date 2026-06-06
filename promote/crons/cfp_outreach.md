# crons/cfp_outreach.md — Scholar outreach

*Loads `PROGRAM.md` + this file only. Nothing else. Suggested cadence: weekday mornings.*

---

## Job

Find scholars whose work fits a conference track, then invite them to submit. One scholar, one invite. Quality of fit over volume.

## Step 1 — Build today's candidate list

Pull candidates from, in priority order:

1. `state/cfp_outreach/leads.json` — researchers your visibility job flagged. Highest priority, already warm.
2. Academic search for authors in the track areas (OpenAlex, CORE, Semantic Scholar). Rotate query themes across the five tracks day to day so you cover the field, not one corner:
   - "algorithmic management gig work"
   - "platform labor worker voice"
   - "algorithmic coordination workplace"
   - "content moderation labor"
   - "methods studying algorithms at work"

Map each candidate to the best-fit track:

| Track | Target authors |
|-------|----------------|
| TR.01 Coordination & Mediation | theorists of triadic/mediated coordination, oracy/literacy lineage |
| TR.02 Algorithmic Management | performance metrics, scheduling, ranking, surveillance scholars |
| TR.03 Platform Labor & Worker Voice | gig work, content moderation, organizing, collective action |
| TR.04 Trust, Opacity & Governance | audit, accountability, codetermination, regulation |
| TR.05 Methods, Lineage & Practice | methodologists, historians of management, field-account authors |

## Step 2 — Verify before contacting

- Confirm the scholar is real and the work fits a track. No name enters the list on model output alone.
- Verify the specific work you will cite in the hook — not just that the person exists. Open the real source (their profile, the paper's page) and confirm the title, that it is genuinely theirs, and *what kind of work it is*: a journal article, a book review, an edited volume, and a funded project are not interchangeable, and a co-author's paper is not theirs. Calling a book review their "research" is a factual error the recipient will catch. Never cite a work from memory.
- Find a published or institutional email. Do not guess-construct addresses; guessed addresses bounce and harm the conference's name.
- Check `state/cfp_outreach/sent.json`. If they are already there, skip. Never re-email.

## Step 3 — Send the invitation

Personalize the hook to one specific, verified work of theirs (the one you confirmed in Step 2) and the matched track. Sign as yourself, an ambassador for the conference. Template:

```
Subject: Invitation to submit — Algorithmacy Conference, Trinidad, Oct 2026

Dear Dr. [Last name],

Your work on [specific paper or topic] speaks directly to [Track name], one
of five tracks at the Algorithmacy Conference, the first conference on
algorithmacy: the competency through which a worker coordinates with another
human party through an algorithmic third party.

The conference runs October 28 to 31, 2026, at La Brea Pitch Lake, Trinidad
and Tobago. Review is open, signed, and published, with no anonymized stage,
and accepted papers publish open access under CC BY 4.0.

We would welcome a submission from you. Abstracts of 300 to 500 words are due
1 August 2026. You can submit a full paper, a note, a panel, a poster, or a
practitioner report, in any of three ways:
  - Web form, no GitHub needed: https://algorithmacy.org/submit
  - Through an AI agent via the conference MCP server
  - A GitHub pull request

Details and the five tracks: https://algorithmacy.org

Best regards,
[Your name]
[Your role, if relevant]
Conference contact: Roger Hunt, rhunt@bentley.edu
```

Notes:
- Lead the hook with their work, not with the conference.
- Never offer to submit on their behalf without their own email sign-off. If a scholar wants agent submission, the MCP `submit_abstract` flow emails them a one-click confirmation; the agent never gets the token.
- AI assistance is welcome at the conference and carries no penalty. Mention only if relevant.

## Step 4 — Log it

Append to `state/cfp_outreach/sent.json`:
```json
{"name": "", "email": "", "affiliation": "", "track": "", "paper_hook": "", "ambassador": "", "sent": "YYYY-MM-DD"}
```
Remove the scholar from `leads.json` if they came from there.

## Step 5 — Handle replies

Check for replies to prior invitations and log substantive ones to `state/cfp_outreach/replies.md`. Always reply from the address the scholar wrote to. If a reply needs a judgment call (a keynote ask, a sensitive question), flag it in your daily report rather than answering unilaterally, and loop in the conference contact when appropriate.

## Pacing

A modest, verified daily number beats a blast. Better five well-matched, correctly addressed invitations than forty guesses. The deadline is 1 August 2026; pace the field accordingly.

*Last updated: 2026-06-06*
