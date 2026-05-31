# assets/ — modular CSS & JS

The pages are plain static HTML. Each page is just markup that links the
modules below; there is no build step. Design tokens (colors, fonts,
timing) live in `/design-system/colors_and_type.css`, which every page
loads first.

## CSS — `assets/css/` (one module per section)

Each module owns both its desktop and its responsive (`@media`) rules.

| module        | section |
|---------------|---------|
| `base.css`    | pitch background, `.stage` layout, top strip |
| `hero.css`    | hero (two-column intro) |
| `diagrams.css`| reference strip + SVG oracy/literacy/algorithmacy diagrams |
| `meta.css`    | tabular meta row under the hero |
| `cta.css`     | "Submit a paper" CTA strip |
| `review.css`  | open-review policy section |
| `tracks.css`  | Tracks & Questions accordion (**shared** by home + submit) |
| `tester.css`  | the algorithmacy tester — cards, output, reveal state |
| `tester-controls.css` | tester mode/difficulty toolbar, MC choices, hints, save strip |
| `fab.css`     | floating submit button |
| `promo.css`   | above-the-fold CONFERENCE 2026 banner, schedule, keynotes |
| `submit.css`  | the `/submit` page — base, topstrip, hero, section, prompt box |
| `submit-steps.css` | `/submit` how-it-works, manual steps, policy list, footer, responsive |

The **home page** links: base, hero, meta, cta, footer, review, tracks,
tester, fab, promo (in that order).
The **submit page** links: submit, tracks.

## JS — `assets/js/` (ES modules)

| module           | purpose |
|------------------|---------|
| `reference.js`   | oracy → literacy → algorithmacy diagram toggle (home) |
| `tester.js`      | the tester engine (state, modes, difficulty, render, init) |
| `tester-score.js`| pure scoring/text helpers + hints + distractor picker (no DOM) |
| `tester-progress.js` | opt-in localStorage progress factory (save strip + persistence) |
| `tracks.js`      | Tracks & Questions accordion (**shared** by home + submit) |
| `copy-prompt.js` | "copy prompt" button on the submit page |
| `main.js`        | home entry — imports reference, tester, tracks |
| `submit.js`      | submit entry — imports copy-prompt, tracks |

Pages load a single module entry: home uses
`<script type="module" src="/assets/js/main.js">`, submit uses
`/assets/js/submit.js`.

## Editing

- Change one section → edit one file.
- Tracks markup/behavior is shared; edit `tracks.css` / `tracks.js` once.
- To add a section: create `assets/css/<name>.css`, link it from the page,
  and (if interactive) add `assets/js/<name>.js` imported by that page's entry.
