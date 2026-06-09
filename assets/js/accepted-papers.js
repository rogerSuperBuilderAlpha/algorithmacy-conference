// Accepted papers: fetch the generated index (data/accepted-papers.json) and
// render a card per accepted paper. The index is rebuilt from merged
// submissions/*.md by build_accepted.py (and the build-accepted GitHub Action),
// so "accepted = merged" stays the single source of truth.

(function () {
  const grid = document.getElementById('accepted-grid');
  if (!grid) return;
  const meta = document.getElementById('accepted-meta');
  const empty = document.getElementById('accepted-empty');

  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  fetch('/data/accepted-papers.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fetch failed'))))
    .then((data) => {
      const papers = (data && data.papers) || [];
      if (!papers.length) {
        if (empty) empty.hidden = false;
        if (meta) meta.textContent = 'none yet';
        return;
      }
      if (meta) meta.textContent = `${papers.length} accepted · open review`;
      grid.innerHTML = papers.map(card).join('');
    })
    .catch(() => {
      // On failure, fall back to the GitHub folder link rather than an empty box.
      if (empty) {
        empty.innerHTML =
          '<a href="https://github.com/rogerSuperBuilderAlpha/algorithmacy-conference/tree/main/submissions" target="_blank" rel="noopener">Browse accepted papers on GitHub →</a>';
        empty.hidden = false;
      }
    });

  function card(p) {
    const tag = p.trackId ? esc(p.trackId) : 'PAPER';
    const type = p.type ? `<span class="pcard-type">${esc(p.type)}</span>` : '';
    const teaser = p.teaser ? `<p class="pcard-teaser">${esc(p.teaser)}</p>` : '';
    const authors = p.authors ? `<p class="pcard-authors">${esc(p.authors)}</p>` : '';
    return `<a class="pcard" href="${esc(p.url)}" target="_blank" rel="noopener">
      <span class="pcard-top"><span class="pcard-track">${tag}</span>${type}</span>
      <h3 class="pcard-title">${esc(p.title)}</h3>
      ${authors}
      ${teaser}
      <span class="pcard-link">Read on the repo · open review →</span>
    </a>`;
  }
})();
