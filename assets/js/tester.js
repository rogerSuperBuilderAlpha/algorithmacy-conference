// Tester: multi-mode algorithmacy trainer — decode / multiple-choice / predict / relay
import { esc, scoreText, tierFor, chipsHTML, shuffle, pad3, buildHints, sampleDistractors } from './tester-score.js';
import { createProgress } from './tester-progress.js';

(function(){
  const $ = id => document.getElementById(id);
  const loadingEl = $('tester-loading'), inputCard = $('tester-input-card'), revealCard = $('tester-reveal-card'),
        subEl = $('tester-sub'), modesEl = $('tester-modes'), diffEl = $('tester-diff'),
        stimLabelEl = $('tester-stim-label'), outputEl = $('tester-output'), freetextEl = $('tester-freetext'),
        inputLabelEl = $('tester-input-label'), textareaEl = $('tester-textarea'), choicesEl = $('tester-choices'),
        counterEl = $('tester-counter'), scoreEl = $('tester-score'), tierEl = $('tester-tier'),
        revealLabel = $('tester-reveal-label'), promptEl = $('tester-prompt'), matchesEl = $('tester-matches'),
        scoreBtn = $('tester-score-btn'), hintBtn = $('tester-hint-btn'), hintEl = $('tester-hint'),
        skipBtn = $('tester-skip-btn'), nextBtn = $('tester-next-btn');
  if (!loadingEl) return;

  const MODE_SUB = {
    classic: 'You and the prompt author are coordinating through Claude. Only the output is visible. What was the input?',
    mc:      'Only the output is visible. Which instruction produced it?',
    forward: 'You can see the instruction. Predict what the algorithm sends back.',
    relay:   'Your partner spoke to you through the algorithm. From its output alone, what did they mean?'
  };

  let allItems = [], deck = [], idx = 0, mode = 'classic', diff = 'all', hintLevel = 0, answered = false, totals = null;

  const progress = createProgress({
    getMode: () => mode, setMode: m => { mode = m; },
    getDiff: () => diff, setDiff: d => { diff = d; },
    modesEl, diffEl
  });

  function filterTotal(){
    if (!totals) return deck.length;
    return (diff === 'all') ? totals.count : (totals.byDifficulty[diff] || deck.length);
  }
  // Grow the loaded pool with a freshly arrived chunk, without disturbing the current item.
  function appendItems(items){
    const sh = shuffle(items);
    allItems = allItems.concat(sh);
    deck = deck.concat((diff === 'all') ? sh : sh.filter(i => (i.difficulty || 'medium') === diff));
  }
  function applyDiff(){
    deck = (diff === 'all') ? allItems.slice() : allItems.filter(i => (i.difficulty || 'medium') === diff);
    if (!deck.length) deck = allItems.slice();
    idx = 0;
  }

  function renderChoices(item){
    const key = (mode === 'forward') ? 'response' : 'prompt';
    const opts = shuffle([item, ...sampleDistractors(item, 3, allItems)]);
    const letters = ['A','B','C','D'];
    choicesEl.innerHTML = '';
    opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tester-choice'; b.setAttribute('data-key', letters[i]);
      b.textContent = o[key];
      b.addEventListener('click', () => chooseMC(b, o, item, opts));
      choicesEl.appendChild(b);
    });
  }
  function chooseMC(btn, chosen, item, opts){
    if (answered) return;
    answered = true;
    const correct = chosen.id === item.id;
    progress.record(item, correct ? 100 : 0);
    Array.from(choicesEl.children).forEach((c, i) => {
      c.disabled = true;
      if (opts[i].id === item.id) c.classList.add('correct');
      else if (c === btn) c.classList.add('wrong');
    });
    window.setTimeout(() => {
      const t = tierFor(correct ? 100 : 0);
      if (mode === 'forward')
        showReveal(correct ? 100 : 0, t, 'Actual output', item.response,
          correct ? '<b>Correct.</b> You read the algorithm.' : '<b>Not quite.</b> The algorithm produced this output.');
      else
        showReveal(correct ? 100 : 0, t, 'Actual prompt', item.prompt,
          correct ? '<b>Correct.</b>' : '<b>Not quite.</b> This is the prompt that produced the output.');
    }, 750);
  }
  function showReveal(score, t, label, text, matchesHTML){
    scoreEl.textContent = score;
    tierEl.textContent = t.tier; tierEl.className = 'tester-tier ' + t.tierClass;
    revealLabel.textContent = label; promptEl.textContent = text;
    matchesEl.innerHTML = matchesHTML || '';
    inputCard.hidden = true; revealCard.hidden = false;
  }
  function submitFreeText(){
    const item = deck[idx], guess = textareaEl.value;
    if (mode === 'relay'){
      const r = scoreText(guess, item.intent || item.prompt, item.tags);
      showReveal(r.score, tierFor(r.score), 'What they meant', item.intent || item.prompt,
        chipsHTML(r.matched, r.tagMatches) + '<br>Their actual prompt: “' + esc(item.prompt) + '”');
      progress.record(item, r.score);
    } else {
      const r = scoreText(guess, item.prompt, item.tags);
      showReveal(r.score, tierFor(r.score), 'Actual prompt', item.prompt, chipsHTML(r.matched, r.tagMatches));
      progress.record(item, r.score);
    }
  }

  function showStimulus(){
    if (!deck.length) return;
    answered = false; hintLevel = 0;
    const item = deck[idx];
    counterEl.textContent = pad3(idx + 1) + ' / ' + pad3(filterTotal());
    subEl.textContent = MODE_SUB[mode];
    loadingEl.hidden = true; revealCard.hidden = true; inputCard.hidden = false;
    hintEl.hidden = true; hintEl.innerHTML = ''; hintBtn.disabled = false;

    const useChoices = (mode === 'mc' || mode === 'forward');
    freetextEl.hidden = useChoices;
    choicesEl.hidden = !useChoices;
    scoreBtn.style.display = useChoices ? 'none' : '';
    hintBtn.style.display = useChoices ? 'none' : '';

    if (mode === 'forward'){ stimLabelEl.textContent = 'Prompt'; outputEl.textContent = item.prompt; }
    else { stimLabelEl.textContent = 'Output'; outputEl.textContent = item.response; }

    if (useChoices){ renderChoices(item); return; }
    textareaEl.value = '';
    if (mode === 'relay'){
      inputLabelEl.textContent = 'What was your partner trying to get across?';
      textareaEl.placeholder = 'e.g. they were fed up with being constantly rated';
    } else {
      inputLabelEl.textContent = 'Your guess at the prompt';
      textareaEl.placeholder = 'e.g. write a haiku about a cat staring at a door';
    }
    window.setTimeout(() => textareaEl.focus(), 0);
  }
  function next(){ idx = (idx + 1) % deck.length; showStimulus(); }

  modesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tester-mode-btn');
    if (!btn) return;
    mode = btn.getAttribute('data-mode');
    modesEl.querySelectorAll('.tester-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
    progress.persist(); showStimulus();
  });
  diffEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tester-diff-btn');
    if (!btn) return;
    diff = btn.getAttribute('data-diff');
    diffEl.querySelectorAll('.tester-diff-btn').forEach(b => b.classList.toggle('active', b === btn));
    progress.persist(); applyDiff(); showStimulus();
  });
  hintBtn.addEventListener('click', () => {
    const hints = buildHints(deck[idx]);
    if (hintLevel >= hints.length) { hintBtn.disabled = true; return; }
    hintEl.hidden = false;
    hintEl.innerHTML = hints.slice(0, hintLevel + 1).map(h => '• ' + h).join('<br>');
    hintLevel++;
    if (hintLevel >= hints.length) hintBtn.disabled = true;
  });
  scoreBtn.addEventListener('click', submitFreeText);
  textareaEl.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitFreeText(); });
  skipBtn.addEventListener('click', next);
  nextBtn.addEventListener('click', next);

  // Stream remaining chunks in the background, appending as they arrive.
  function loadRest(base, names){
    let i = 0;
    (function nxt(){
      if (i >= names.length) return;
      fetch(base + names[i]).then(r => r.json()).then(items => { appendItems(items); })
        .catch(() => {}).finally(() => { i++; nxt(); });
    })();
  }

  // restore saved progress + preferences, then show the save affordance
  progress.loadProgress(); progress.syncButtons(); progress.render();

  // Sharded load: tiny manifest + first chunk for an instant start, rest streamed after.
  fetch('/data/index.json')
    .then(r => { if (!r.ok) throw new Error('no index'); return r.json(); })
    .then(manifest => {
      totals = { count: manifest.count, byDifficulty: manifest.byDifficulty };
      const base = '/data/';
      return fetch(base + manifest.chunks[0]).then(r => r.json()).then(first => {
        allItems = shuffle(first); applyDiff(); showStimulus();
        loadRest(base, manifest.chunks.slice(1));
      });
    })
    .catch(() => {
      // Fallback to the monolithic file if the sharded data isn't available.
      fetch('/prompts.json').then(r => r.json()).then(data => {
        const items = data.items || [];
        totals = { count: items.length, byDifficulty: items.reduce((a, it) => {
          const k = it.difficulty || 'medium'; a[k] = (a[k] || 0) + 1; return a;
        }, {}) };
        allItems = shuffle(items); applyDiff(); showStimulus();
      }).catch(err => {
        loadingEl.innerHTML = '<div class="tester-loading">Could not load prompts.</div>';
        console.error('Tester load failed:', err);
      });
    });
})();
