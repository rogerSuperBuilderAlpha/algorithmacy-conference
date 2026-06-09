#!/usr/bin/env python3
"""Build the accepted-papers index from merged submission files.

Status model: a submission is a public pull request that adds
`submissions/<handle>.md`. While the PR is open it is *under review*; once it is
**merged into main** the paper is **accepted** and listed on the site.

This script scans the merged `submissions/*.md` files (everything except the
template and the how-to), parses their front-matter block, and writes
`data/accepted-papers.json`, which the homepage fetches and renders.

Re-run after merging an acceptance (the GitHub Action does this automatically):
    python build_accepted.py
"""
import json, os, re, glob

REPO = "rogerSuperBuilderAlpha/algorithmacy-conference"
SKIP = {"TEMPLATE.md", "HOW-TO.md"}

TRACKS = {
    "TR.01": "TR.01 — Coordination & Mediation",
    "TR.02": "TR.02 — Algorithmic Management",
    "TR.03": "TR.03 — Platform Labor & Worker Voice",
    "TR.04": "TR.04 — Trust, Opacity & Governance",
    "TR.05": "TR.05 — Methods, Lineage & Practice",
}


def field(text, name):
    """Pull a **Field:** value from the front-matter block."""
    m = re.search(rf"^\*\*{re.escape(name)}:\*\*\s*(.+)$", text, re.MULTILINE)
    return m.group(1).strip() if m else ""


def first_heading(text):
    m = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    return m.group(1).strip() if m else ""


def abstract_teaser(text, limit=180):
    """First sentence(s) of the Abstract section, trimmed to ~limit chars."""
    m = re.search(r"^##\s+Abstract\s*\n+(.+?)(?:\n\s*\n|\n##\s)", text, re.DOTALL | re.MULTILINE)
    if not m:
        return ""
    body = " ".join(m.group(1).split())
    if len(body) <= limit:
        return body
    cut = body[:limit]
    # prefer to end on a sentence or word boundary
    dot = cut.rfind(". ")
    if dot > 80:
        return cut[: dot + 1]
    sp = cut.rfind(" ")
    return cut[:sp].rstrip(",;:") + "…"


def parse(path):
    text = open(path, encoding="utf-8").read()
    slug = os.path.splitext(os.path.basename(path))[0]
    track_raw = field(text, "Track")
    tm = re.search(r"TR\.\d{2}", track_raw)
    track_id = tm.group(0) if tm else ""
    keywords = [k.strip() for k in field(text, "Keywords").split(",") if k.strip()]
    return {
        "slug": slug,
        "title": first_heading(text) or slug,
        "authors": field(text, "Authors"),
        "type": field(text, "Type"),
        "trackId": track_id,
        "track": TRACKS.get(track_id, track_raw),
        "keywords": keywords,
        "teaser": abstract_teaser(text),
        "url": f"https://github.com/{REPO}/blob/main/submissions/{slug}.md",
    }


def main():
    files = sorted(
        f for f in glob.glob("submissions/*.md")
        if os.path.basename(f) not in SKIP
    )
    papers = [parse(f) for f in files]
    # newest-looking first is hard without git; keep alphabetical by slug for stability
    out = {"count": len(papers), "papers": papers}
    os.makedirs("data", exist_ok=True)
    with open("data/accepted-papers.json", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"Wrote data/accepted-papers.json — {len(papers)} accepted paper(s).")


if __name__ == "__main__":
    main()
