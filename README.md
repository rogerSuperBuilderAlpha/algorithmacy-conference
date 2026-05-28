# Algorithmacy Conference

The first global conference on **algorithmacy** — the competency through which a worker coordinates with another human *through an algorithmic third party*.

**La Brea, Trinidad & Tobago · Late Oct / Early Nov 2026**
**Hosted by GauntleTT · CFP / v01**

→ Website: [algorithmacy.com](https://algorithmacy.com)
→ Call for papers: this repository
→ Contact: Roger Hunt — rhunt@bentley.edu

---

## What this repo is

This repository is the **call for papers and submission intake** for the Algorithmacy Conference. Submissions are made by opening a pull request that adds your abstract to the [`/submissions/`](./submissions/) directory.

All submissions and reviews are public from the moment of intake. See [Review policy](#review-policy) below.

## How to submit

1. **Read** [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full submission workflow.
2. **Copy** [`submissions/TEMPLATE.md`](./submissions/TEMPLATE.md) to `submissions/<your-handle>.md`.
3. **Fill in** the template: title, type, track, 300–500-word abstract, outline, author bios.
4. **Open a pull request** against `main`. Reviewers will respond on the PR thread.

There is no separate submission portal. The pull request *is* the submission.

## Submission types (pick one)

- **Full paper** — original research, 6–8 pages
- **Note** — short contribution, 2–3 pages
- **Panel** — proposed session with 3–4 participants
- **Poster** — visual contribution, accompanied by a 1-page extended abstract
- **Practitioner report** — field account from someone doing the work, 2–4 pages

## Thematic tracks (pick one)

See [`TRACKS.md`](./TRACKS.md) for the full list of questions per track.

- **TR.01** — Coordination & Mediation
- **TR.02** — Algorithmic Management
- **TR.03** — Platform Labor & Worker Voice
- **TR.04** — Trust, Opacity & Governance
- **TR.05** — Methods, Lineage & Practice

## Review policy

Reviews are **open, signed, and published**.

- **Open** — submissions and review threads live on this repository from the moment of intake. There is no anonymized stage.
- **Signed** — reviewers attach their names to their assessments. Accountability is a feature of the review, not a compromise of it.
- **Published** — accepted papers ship alongside their full review history.

A double-blind workflow is incompatible with a public-PR intake; open review is the methodologically honest fit — and consonant with the conference's own questions about algorithmic opacity and accountability. We follow established open-review practice at [F1000Research](https://f1000research.com), [eLife](https://elifesciences.org), [OpenReview.net](https://openreview.net), and [The BMJ](https://www.bmj.com).

## Awards

- **Founders' Paper Award** — most significant theoretical contribution
- **Pitch Lake Prize** — early-career researcher award
- **GauntleTT Practitioner Award** — best practitioner report

## Travel support

Limited support available for LMIC scholars, doctoral students, and worker representatives. Indicate need with your abstract.

## AI use

AI assistance is welcome and confers no penalty. We care about the quality of the contribution, not the method. If you use AI, the result should be excellent — obvious slop will not be reviewed well regardless of how it was produced. See [CONTRIBUTING.md](./CONTRIBUTING.md#ai-use) for the full policy.

## Authorship & priority

Opening a pull request is a public, dated, timestamped record of your contribution. **In any future priority dispute, the conference will support your claim based on the PR timestamp.** See [CONTRIBUTING.md](./CONTRIBUTING.md#authorship--priority).

## Standards

- **Style:** APA 7
- **Format:** Markdown (`.md`) for abstracts; PDF (in the PR description as an attachment) for full papers
- **License:** Open access. Authors retain copyright; accepted papers published under CC BY 4.0.

## Open source

This entire conference setup — the website, the CFP infrastructure, the open-review workflow — is open source. We want other conferences to be able to adopt this model.

- **Code** (website HTML/CSS/JS) is [MIT-licensed](./LICENSE)
- **Content** (README, CONTRIBUTING, TRACKS, templates, submissions) is [CC BY 4.0](./LICENSE-CONTENT)
- This repository is set up as a **GitHub template**: click "Use this template" to clone it for your own venue
- See [`FORKING.md`](./FORKING.md) for a guide on what to swap and what to keep

## Repository layout

```
/                       — website source (deployed at algorithmacy.com via Vercel)
/submissions/           — submitted abstracts (one .md per submission)
/submissions/TEMPLATE.md — copy this to start a submission
TRACKS.md               — the five tracks and their guiding questions
CONTRIBUTING.md         — submission workflow in detail
README.md               — this file
```

## Contact

- **Roger Hunt** — rhunt@bentley.edu
- Or open an issue on this repository
