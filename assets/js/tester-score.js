// Pure scoring / text helpers for the tester — no DOM, no shared state.

const STOPWORDS = new Set(['the','a','an','of','to','in','and','is','it','that','this','for','on','with','at','by','from','as','be','are','was','were','or','but','if','i','you','your','my','me','we','he','she','they','them','their','his','her','its']);

export function normalise(str){
  return (str || '').toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
export function stem(w){
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
  return w;
}
export function tokenize(str){
  return normalise(str).split(' ').filter(w => w && !STOPWORDS.has(w)).map(stem);
}
export function esc(s){
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
// Score a free-text guess against a target string, with a tag-overlap bonus.
export function scoreText(guess, target, tags){
  const g = new Set(tokenize(guess));
  const t = new Set(tokenize(target));
  let inter = 0; const matched = [];
  g.forEach(w => { if (t.has(w)) { inter++; matched.push(w); } });
  const union = new Set([...g, ...t]).size || 1;
  const jaccard = inter / union;
  const tagSet = (tags || []).map(x => stem(normalise(x).split(' ')[0]));
  let tagHits = 0; const tagMatched = [];
  tagSet.forEach(x => { if (g.has(x)) { tagHits++; tagMatched.push(x); } });
  const tagFrac = tagSet.length ? tagHits / tagSet.length : 0;
  const composite = Math.round(100 * (0.55 * jaccard + 0.45 * tagFrac));
  return { score: composite, matched, tagMatches: tagMatched };
}
export function tierFor(score){
  if (score < 25)      return { tier: 'cold',         tierClass: 'tier-cold' };
  if (score < 50)      return { tier: 'warm',         tierClass: 'tier-warm' };
  if (score < 75)      return { tier: 'hot',          tierClass: 'tier-hot' };
  if (score < 90)      return { tier: 'burning',      tierClass: 'tier-burning' };
  return                      { tier: 'perfect read', tierClass: 'tier-perfect' };
}
export function chipsHTML(matched, tagMatches){
  const pool = Array.from(new Set([...(matched||[]), ...(tagMatches||[])]));
  if (!pool.length) return '<b>Matches:</b> none — try identifying the form and the subject';
  return '<b>Matches:</b> ' + pool.map(t => '<span class="token-hit">' + esc(t) + '</span>').join('');
}
export function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function pad3(n){ return String(n).padStart(3, '0'); }

// Progressive hints for the free-text modes (form, then up to 3 subject clues).
export function buildHints(item){
  const h = [];
  if (item.form) h.push('Form: <b>' + esc(item.form) + '</b>');
  (item.tags || []).filter(t => normalise(t) !== normalise(item.form || '')).slice(0, 3)
    .forEach(t => h.push('Clue: <b>' + esc(t) + '</b>'));
  return h;
}
// Pick n distractors for multiple-choice, preferring the same form, then any.
export function sampleDistractors(item, n, pool){
  let p = pool.filter(i => i.id !== item.id && i.form && i.form === item.form);
  if (p.length < n) p = pool.filter(i => i.id !== item.id);
  return shuffle(p).slice(0, n);
}
