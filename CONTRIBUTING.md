# Contributing — Submission workflow

This document covers how to submit a paper, how reviews work, and what reviewers commit to.

## Submitting a paper

### 1. Fork this repository

Use the GitHub "Fork" button. You'll work on your own copy and open a pull request back to `main` when ready.

### 2. Copy the template

```bash
cp submissions/TEMPLATE.md submissions/<your-handle>.md
```

Use a short, distinctive handle — your GitHub username, your surname, or a short slug. If a file with that name already exists, append a discriminator (`-2`, year, etc.).

### 3. Fill in the abstract

Open `submissions/<your-handle>.md` and complete every field. The template prompts for:

- Title
- Authors and affiliations
- Submission type (one of five — see README)
- Track (one of TR.01–TR.05 — see [TRACKS.md](./TRACKS.md))
- Word count (the body of the abstract should be 300–500 words)
- Keywords (3–7)
- Abstract (300–500 words)
- Outline (for the full paper, note, panel, or poster)
- Author bios (≤100 words per author)

For **full papers**, you may attach a PDF to the pull request description. The Markdown file remains the primary submission record.

### 4. Open a pull request

- **Title format:** `[type] [TR.0X] Your paper title`
  - e.g. `[Full paper] [TR.02] Algorithmic management in last-mile delivery: a comparative study`
- **PR body:** the PR template will populate. Fill in any additional context, declare conflicts of interest, and confirm you've read the review policy.
- **Branch:** any branch name is fine.

### 5. What happens next

- A maintainer will triage your PR within ~5 business days, confirm the submission meets format requirements, and assign 2 reviewers from the program committee.
- Reviewers will post their assessments as PR comments. Their names will be visible. They will sign their reviews.
- You will respond to reviewer comments in-thread. You may push revisions to your PR.
- The program chairs will issue a decision (accept / accept with revisions / reject) on the PR thread.

Submissions remain public throughout. Rejection does not delete your PR; it remains as part of the published review history.

## Reviewing

Reviewers commit to:

- **Signing** their reviews. No anonymous reviews.
- **Disclosing** conflicts of interest before accepting an assignment.
- Responding within **3 weeks** of assignment.
- Writing reviews that **author and audience** can both learn from.
- **Constructive language.** Public reviews require more care than blinded ones. Critique the work, not the author.

To volunteer as a reviewer, open an issue tagged `volunteer-reviewer` with your area of expertise and a link to your scholarly profile.

## Deadlines

| Milestone | Date |
|---|---|
| Submissions open | now |
| Submissions close | **2026-08-01** |
| Reviews complete | 2026-09-15 |
| Decisions announced | 2026-09-30 |
| Camera-ready due | 2026-10-15 |
| Conference | Late Oct / Early Nov 2026 |

Final conference dates will be confirmed by 2026-06-15.

## Code of conduct

The conference and its review process operate under a no-tolerance policy for harassment, discrimination, or personal attacks. Disagreement with ideas is welcome and expected; attacks on individuals are grounds for removal from the program.

Concerns: rhunt@bentley.edu.

## Licensing

By submitting, you grant the conference the right to publish the abstract, full paper, and review history under **CC BY 4.0**. Authors retain copyright.

## Questions

- Open an issue tagged `question`
- Or email Roger Hunt: rhunt@bentley.edu
