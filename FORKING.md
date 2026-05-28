# Forking this conference

This repository is a working example of an **open-review, public-PR, timestamped-priority conference**. The model is novel enough that we want others to be able to adopt it.

If you fork this to run your own conference: welcome. This guide tells you what to change and what to keep.

## License recap

- **Code** (HTML / CSS / JS / JSON) — MIT. Use freely.
- **Content** (README, CONTRIBUTING, TRACKS, FORKING, the templates, submissions) — CC BY 4.0. Use freely with attribution somewhere reachable.

See [`LICENSE`](./LICENSE) and [`LICENSE-CONTENT`](./LICENSE-CONTENT).

## Quick start

1. Click **"Use this template"** on GitHub (this repo is set up as a template repository).
2. Name your new repo.
3. Clone it locally.
4. Work through the swap list below.
5. Connect your fork to a static host (Vercel, GitHub Pages, Netlify, Cloudflare Pages — all free for static sites).

## What to swap

The changes you'll need fall into two buckets: **theme/brand** and **conference-specific content**.

### Theme & brand (website)

File: `index.html`

- **The wordmark** in the hero (`Algo·rith·macy`) — replace with your conference name. Adjust the syllable-break dots to match.
- **The color palette** in `:root` (`--signal`, `--cool`, `--ember`, `--ink`, `--pitch`) — adjust to your aesthetic. The defaults are a dark "pitch" canvas with a brick-red signal and a cool-blue algorithmic accent.
- **The hero diagram** (the SVG with the diamond α and human nodes) — this is specific to algorithmacy as a coordination concept. Replace with your own thesis diagram, or remove the diagram column entirely.
- **The oracy / literacy reference panels** — the toggleable strip above the main diagram. Specific to the algorithmacy lineage; remove or replace with your own historical references.
- **The page `<title>`** and meta description.
- **The CTA URL** (currently points at this repo) — point it at your own repo.

### Conference-specific content

- **`README.md`** — rewrite the top to describe your conference: name, dates, venue, contact. Keep the structural sections (how to submit, types, tracks, review policy, deadlines) as scaffolding.
- **`TRACKS.md`** — your tracks and your questions. Format scales to any number; the website currently expects 5 in the accordion.
- **`CONTRIBUTING.md`** — adjust deadlines, contact info, and any process specifics. The open-review policy section can stay as-is if you're adopting the same model.
- **`submissions/TEMPLATE.md`** — adjust the types/tracks references to match yours.
- **`.github/PULL_REQUEST_TEMPLATE.md`** — adjust accordingly.
- **Meta-row content in `index.html`** (Venue, Dates, Hosted by, Submissions) — your details.
- **Footer** in `index.html` — your contact, copyright, marks.

### The tester game (optional)

- **`prompts.json`** — 100 playable prompt/response pairs. Most are general; a few have algorithmacy-themed subjects. You can keep them, replace them, or delete the whole `<section class="tester">` block in `index.html` if the game doesn't fit your conference.
- If you keep the game, the scoring algorithm in the JS block is reusable across any prompt set.

## What to keep as-is

These are the parts that make this model *work*. Change them and you're running a different kind of conference.

- **The review policy** — open, signed, published, timestamped. The whole methodological premise. If you want a blinded review, this isn't the right template.
- **The PR-intake workflow** — fork → copy template → fill in → open PR. The operational backbone.
- **The PR template's COI declaration and open-review acknowledgment** — important author consent.
- **The authorship-priority guarantee** — the value-add over traditional submission portals. This works *because* PR timestamps are externally verifiable.

## Deploying

The website is a static site with **no build step**.

- **Vercel** (what we use): connect the repo, accept the defaults, deploy. Custom domain in one CLI command.
- **GitHub Pages**: enable in repo settings, point at `main` branch root.
- **Netlify / Cloudflare Pages / Render**: same idea — connect repo, no build step required.

## Why this model

The public-PR + open-review + timestamped-priority combination addresses three things at once:

1. **Reviewer accountability** — signed reviews tend to be more careful than blinded ones.
2. **Author priority** — externally verifiable timestamps protect you in disputes.
3. **Reading the field** — anyone can see what was submitted, what was reviewed, and how it changed. The corpus *is* the conference record.

It's not the right fit for every venue. Areas where double-blind matters for fairness (early-career-vs-senior asymmetries; subject populations where author identity meaningfully changes review) should think carefully before adopting this. We think the trade is worth it for venues where transparency, accountability, and timestamped priority are core values.

## Tell us

If you fork this for an actual conference, we'd love to hear about it. Not for royalties, not for required attribution beyond the licenses — just so we can collect examples.

→ **Roger Hunt** — rhunt@bentley.edu
→ Or open an issue on this repository with the `fork` label
