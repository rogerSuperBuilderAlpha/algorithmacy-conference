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
The open call is the Second Algorithmacy Conference (2027). Go to
**https://algorithmacy.org/#2027**, fill in the web form, and confirm your email.
That form has six tracks, TR.01 through TR.06. We open the pull request for you
and send you the link. To revise later, resubmit with the same email and confirm
again — it updates your existing PR.

The page at https://algorithmacy.org/submit is the 2026 form. It lists five
tracks, TR.01 through TR.05, and does not accept TR.06.

**Option B — have an AI agent submit it (if you use Claude or similar)**
Add our connector once — in Claude, Settings → Connectors → Add custom connector,
URL **https://algorithmacy.org/api/mcp** (no login or key) — then say "submit my
abstract to the Algorithmacy Conference (2027)" and paste your draft. Tell the
agent the conference year is 2027, so it sets `conference` to `2027` and offers
the six 2027 tracks, TR.01 through TR.06. Omitting the year submits to 2026,
which accepts only TR.01 through TR.05. The agent prepares everything and
submits; you just click the one-time sign-off link we email you.

**Option C — paste a prompt into any LLM**
On the submission page, copy the prompt in the "paste a prompt into any LLM" box
and paste it into a fresh chat with Claude, ChatGPT, or Gemini. The prompt lists
six tracks for 2027 (TR.01 through TR.06) and five tracks for 2026 (TR.01 through
TR.05). Tell it the paper is for 2027. It will ask for your title, abstract, type,
track, and bio, then either open the pull request for you or hand you the exact
steps. Paste in the abstract you already wrote and it'll take it from there.

**Option D — do it by hand on GitHub**
1. Fork the repo: https://github.com/rogerSuperBuilderAlpha/algorithmacy-conference
2. Copy `submissions/TEMPLATE.md` to `submissions/<your-handle>.md`
3. Fill in: title, authors, **type** (full paper / note / panel / poster /
   practitioner report), **track** (TR.01–TR.06 for 2027; TR.01–TR.05 for a 2026
   submission), a **300–500-word abstract**, an outline, and a short bio (APA 7).
   A 2027 file includes the line `Conference: 2027`.
4. Open a pull request against `main`. For 2027, title it `[2027] [Type] [TR.0X] Your title`.
   For 2026, title it `[Type] [TR.0X] Your title`.

**A few things to know:**
- **Deadline:** the call is open, with no fixed abstract date
- **Open review:** your submission and all reviews are public on the repo from
  the start, and reviewers sign their assessments — no anonymized stage
- The 2026 meeting published accepted **full papers** with Hult International
  Business School (Boston) after peer review. No publication partner has been
  announced for 2027.
- Full tracks, types, and details: **https://algorithmacy.org**

If you hit any snags with GitHub, reply here and I'll help you get it posted.

Best,
Roger Hunt
rhunt@bentley.edu
