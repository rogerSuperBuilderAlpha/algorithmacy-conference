# How to submit — for authors who emailed an abstract

The Algorithmacy Conference runs on **open review**, so submissions aren't
accepted by email. Each submission is a **pull request** to this public
repository, and the PR's timestamp becomes your authorship-priority record.
It takes about five minutes. You have two ways to do it.

You can copy the message below verbatim to reply to someone who emailed an
abstract.

---

**Subject: Algorithmacy Conference — how to submit your abstract**

Hi [Name],

Thanks for sending this along — it looks like a great fit. One important
thing: the Algorithmacy Conference runs on **open review**, so submissions
aren't accepted by email. Each one is a **pull request** to our public
repository, and the PR's timestamp becomes your authorship-priority record.
Getting it into the system takes about five minutes. You have four ways to do it,
and none of them needs a GitHub account:

**Option A — fill in the web form (easiest, no GitHub account needed)**
Go to **https://algorithmacy.com/submit**, fill in the form at the top
("Submit directly — no GitHub needed"), and confirm your email. We open the
pull request for you and send you the link. To revise later, resubmit with the
same email and confirm again — it updates your existing PR.

**Option B — have an AI agent submit it (if you use Claude or similar)**
Add our connector once — in Claude, Settings → Connectors → Add custom connector,
URL **https://algorithmacy.com/api/mcp** (no login or key) — then say "submit my
abstract to the Algorithmacy Conference" and paste your draft. The agent prepares
everything and submits; you just click the one-time sign-off link we email you.

**Option C — paste a prompt into any LLM**
On the submission page, copy the prompt in the "paste a prompt into any LLM" box
and paste it into a fresh chat with Claude, ChatGPT, or Gemini. It will ask for
your title, abstract, type, track, and bio, then either open the pull request for
you or hand you the exact steps. Paste in the abstract you already wrote and it'll
take it from there.

**Option D — do it by hand on GitHub**
1. Fork the repo: https://github.com/rogerSuperBuilderAlpha/algorithmacy-conference
2. Copy `submissions/TEMPLATE.md` to `submissions/<your-handle>.md`
3. Fill in: title, authors, **type** (full paper / note / panel / poster /
   practitioner report), **track** (TR.01–TR.05), a **300–500-word abstract**,
   an outline, and a short bio (APA 7)
4. Open a pull request against `main`, titled `[Type] [TR.0X] Your title`

**A few things to know:**
- **Deadline:** 1 August 2026
- **Open review:** your submission and all reviews are public on the repo from
  the start, and reviewers sign their assessments — no anonymized stage
- Accepted **full papers** are published by Hult International Business School
  (Boston) after peer review
- Full tracks, types, and details: **https://algorithmacy.com**

If you hit any snags with GitHub, reply here and I'll help you get it posted.

Best,
Roger Hunt
rhunt@bentley.edu
