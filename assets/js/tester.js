  // Tester: multi-mode algorithmacy trainer — decode / multiple-choice / predict / relay
  (function(){
    const STOPWORDS = new Set(['the','a','an','of','to','in','and','is','it','that','this','for','on','with','at','by','from','as','be','are','was','were','or','but','if','i','you','your','my','me','we','he','she','they','them','their','his','her','its']);

    function normalise(str){
      return (str || '').toLowerCase()
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    function stem(w){
      if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
      if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
      if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
      if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
      return w;
    }
    function tokenize(str){
      return normalise(str).split(' ').filter(w => w && !STOPWORDS.has(w)).map(stem);
    }
    function esc(s){
      return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    // Score a free-text guess against a target string, with a tag-overlap bonus.
    function scoreText(guess, target, tags){
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
    function tierFor(score){
      if (score < 25)      return { tier: 'cold',         tierClass: 'tier-cold' };
      if (score < 50)      return { tier: 'warm',         tierClass: 'tier-warm' };
      if (score < 75)      return { tier: 'hot',          tierClass: 'tier-hot' };
      if (score < 90)      return { tier: 'burning',      tierClass: 'tier-burning' };
      return                      { tier: 'perfect read', tierClass: 'tier-perfect' };
    }
    function chipsHTML(matched, tagMatches){
      const pool = Array.from(new Set([...(matched||[]), ...(tagMatches||[])]));
      if (!pool.length) return '<b>Matches:</b> none — try identifying the form and the subject';
      return '<b>Matches:</b> ' + pool.map(t => '<span class="token-hit">' + esc(t) + '</span>').join('');
    }
    function shuffle(arr){
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    function pad3(n){ return String(n).padStart(3, '0'); }

    const loadingEl   = document.getElementById('tester-loading');
    const inputCard   = document.getElementById('tester-input-card');
    const revealCard  = document.getElementById('tester-reveal-card');
    const subEl       = document.getElementById('tester-sub');
    const modesEl     = document.getElementById('tester-modes');
    const diffEl      = document.getElementById('tester-diff');
    const stimLabelEl = document.getElementById('tester-stim-label');
    const outputEl    = document.getElementById('tester-output');
    const freetextEl  = document.getElementById('tester-freetext');
    const inputLabelEl= document.getElementById('tester-input-label');
    const textareaEl  = document.getElementById('tester-textarea');
    const choicesEl   = document.getElementById('tester-choices');
    const counterEl   = document.getElementById('tester-counter');
    const scoreEl     = document.getElementById('tester-score');
    const tierEl      = document.getElementById('tester-tier');
    const revealLabel = document.getElementById('tester-reveal-label');
    const promptEl    = document.getElementById('tester-prompt');
    const matchesEl   = document.getElementById('tester-matches');
    const scoreBtn    = document.getElementById('tester-score-btn');
    const hintBtn     = document.getElementById('tester-hint-btn');
    const hintEl      = document.getElementById('tester-hint');
    const skipBtn     = document.getElementById('tester-skip-btn');
    const nextBtn     = document.getElementById('tester-next-btn');

    if (!loadingEl) return;

    const MODE_SUB = {
      classic: 'You and the prompt author are coordinating through Claude. Only the output is visible. What was the input?',
      mc:      'Only the output is visible. Which instruction produced it?',
      forward: 'You can see the instruction. Predict what the algorithm sends back.',
      relay:   'Your partner spoke to you through the algorithm. From its output alone, what did they mean?'
    };

    let allItems = [];
    let deck = [];
    let idx = 0;
    let mode = 'classic';
    let diff = 'all';
    let hintLevel = 0;
    let answered = false;
    let totals = null; // {count, byDifficulty} from the manifest, for the counter

    function filterTotal(){
      if (!totals) return deck.length;
      return (diff === 'all') ? totals.count : (totals.byDifficulty[diff] || deck.length);
    }
    // Grow the loaded pool with a freshly arrived chunk, without disturbing the
    // current item: append filtered items to the end of the live deck.
    function appendItems(items){
      const shuffled = shuffle(items);
      allItems = allItems.concat(shuffled);
      const add = (diff === 'all') ? shuffled : shuffled.filter(i => (i.difficulty || 'medium') === diff);
      deck = deck.concat(add);
    }

    /* ---- progress persistence (localStorage, opt-in) ---- */
    const SAVE_KEY = 'algo_progress_v1';
    const CONSENT_KEY = 'algo_save_consent';
    const saveEl = document.getElementById('tester-save');
    function storageOK(){
      try { const k = '__algo_test'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; }
      catch (e) { return false; }
    }
    const canStore = storageOK();
    let saveOn = canStore && localStorage.getItem(CONSENT_KEY) === 'on';
    let prog = { answered: 0, best: 0, sum: 0, seen: {} };
    function loadProgress(){
      if (!saveOn) return;
      try {
        const p = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
        prog = { answered: p.answered || 0, best: p.best || 0, sum: p.sum || 0, seen: p.seen || {} };
        if (p.mode) mode = p.mode;
        if (p.diff) diff = p.diff;
      } catch (e) {}
    }
    function persist(){
      if (!saveOn) return;
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ answered: prog.answered, best: prog.best, sum: prog.sum, seen: prog.seen, mode: mode, diff: diff })); }
      catch (e) {}
    }
    function recordProgress(item, score){
      if (!saveOn) return;
      prog.answered++;
      prog.sum += score;
      if (score > prog.best) prog.best = score;
      if (item && item.id) prog.seen[item.id] = 1;
      persist();
      renderSave();
    }
    function syncButtons(){
      modesEl.querySelectorAll('.tester-mode-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === mode));
      diffEl.querySelectorAll('.tester-diff-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-diff') === diff));
    }
    function renderSave(){
      if (!saveEl) return;
      const consent = canStore ? localStorage.getItem(CONSENT_KEY) : null;
      if (!canStore){
        saveEl.hidden = false;
        saveEl.className = 'tester-save blocked';
        saveEl.innerHTML = '<span class="ts-msg">⚠ Your browser is blocking local storage, so progress can’t be saved. Allow site data (or leave private mode) to keep your progress here.</span>';
        return;
      }
      if (saveOn){
        const explored = Object.keys(prog.seen).length;
        const avg = prog.answered ? Math.round(prog.sum / prog.answered) : 0;
        saveEl.hidden = false;
        saveEl.className = 'tester-save on';
        saveEl.innerHTML = '<span class="ts-msg"><span class="ts-dot"></span>Progress saved on this device · <b>' + explored + '</b> explored · best <b>' + prog.best + '</b> · avg <b>' + avg + '</b></span><button type="button" class="ts-no" id="ts-reset">Reset</button>';
        return;
      }
      if (consent === 'off'){ saveEl.hidden = true; return; }
      saveEl.hidden = false;
      saveEl.className = 'tester-save ask';
      saveEl.innerHTML = '<span class="ts-msg">Save your progress on this device? It stays in your browser — nothing leaves it.</span><span class="ts-actions"><button type="button" class="ts-btn" id="ts-enable">Enable saving</button><button type="button" class="ts-no" id="ts-dismiss">Not now</button></span>';
    }
    if (saveEl){
      saveEl.addEventListener('click', (e) => {
        const id = e.target && e.target.id;
        if (id === 'ts-enable'){ try { localStorage.setItem(CONSENT_KEY, 'on'); } catch (_){} saveOn = canStore; persist(); renderSave(); }
        else if (id === 'ts-dismiss'){ try { localStorage.setItem(CONSENT_KEY, 'off'); } catch (_){} renderSave(); }
        else if (id === 'ts-reset'){ prog = { answered: 0, best: 0, sum: 0, seen: {} }; persist(); renderSave(); }
      });
    }

    function applyDiff(){
      deck = (diff === 'all') ? allItems.slice() : allItems.filter(i => (i.difficulty || 'medium') === diff);
      if (!deck.length) deck = allItems.slice();
      idx = 0;
    }
    function sampleDistractors(item, n){
      let pool = allItems.filter(i => i.id !== item.id && i.form && i.form === item.form);
      if (pool.length < n) pool = allItems.filter(i => i.id !== item.id);
      return shuffle(pool).slice(0, n);
    }
    function buildHints(item){
      const h = [];
      if (item.form) h.push('Form: <b>' + esc(item.form) + '</b>');
      (item.tags || []).filter(t => normalise(t) !== normalise(item.form || '')).slice(0, 3)
        .forEach(t => h.push('Clue: <b>' + esc(t) + '</b>'));
      return h;
    }

    function renderChoices(item){
      const key = (mode === 'forward') ? 'response' : 'prompt';
      const opts = shuffle([item, ...sampleDistractors(item, 3)]);
      const letters = ['A','B','C','D'];
      choicesEl.innerHTML = '';
      opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tester-choice';
        b.setAttribute('data-key', letters[i]);
        b.textContent = o[key];
        b.addEventListener('click', () => chooseMC(b, o, item, opts));
        choicesEl.appendChild(b);
      });
    }
    function chooseMC(btn, chosen, item, opts){
      if (answered) return;
      answered = true;
      const correct = chosen.id === item.id;
      recordProgress(item, correct ? 100 : 0);
      Array.from(choicesEl.children).forEach((c, i) => {
        c.disabled = true;
        if (opts[i].id === item.id) c.classList.add('correct');
        else if (c === btn) c.classList.add('wrong');
      });
      window.setTimeout(() => {
        const t = tierFor(correct ? 100 : 0);
        if (mode === 'forward'){
          showReveal(correct ? 100 : 0, t, 'Actual output', item.response,
            correct ? '<b>Correct.</b> You read the algorithm.' : '<b>Not quite.</b> The algorithm produced this output.');
        } else {
          showReveal(correct ? 100 : 0, t, 'Actual prompt', item.prompt,
            correct ? '<b>Correct.</b>' : '<b>Not quite.</b> This is the prompt that produced the output.');
        }
      }, 750);
    }

    function showReveal(score, t, label, text, matchesHTML){
      scoreEl.textContent = score;
      tierEl.textContent = t.tier;
      tierEl.className = 'tester-tier ' + t.tierClass;
      revealLabel.textContent = label;
      promptEl.textContent = text;
      matchesEl.innerHTML = matchesHTML || '';
      inputCard.hidden = true;
      revealCard.hidden = false;
    }
    function submitFreeText(){
      const item = deck[idx];
      const guess = textareaEl.value;
      if (mode === 'relay'){
        const r = scoreText(guess, item.intent || item.prompt, item.tags);
        const t = tierFor(r.score);
        const extra = '<br>Their actual prompt: “' + esc(item.prompt) + '”';
        showReveal(r.score, t, 'What they meant', item.intent || item.prompt, chipsHTML(r.matched, r.tagMatches) + extra);
        recordProgress(item, r.score);
      } else {
        const r = scoreText(guess, item.prompt, item.tags);
        const t = tierFor(r.score);
        showReveal(r.score, t, 'Actual prompt', item.prompt, chipsHTML(r.matched, r.tagMatches));
        recordProgress(item, r.score);
      }
    }

    function showStimulus(){
      if (!deck.length) return;
      answered = false;
      hintLevel = 0;
      const item = deck[idx];
      counterEl.textContent = pad3(idx + 1) + ' / ' + pad3(filterTotal());
      subEl.textContent = MODE_SUB[mode];
      loadingEl.hidden = true;
      revealCard.hidden = true;
      inputCard.hidden = false;
      hintEl.hidden = true;
      hintEl.innerHTML = '';
      hintBtn.disabled = false;

      const useChoices = (mode === 'mc' || mode === 'forward');
      freetextEl.hidden = useChoices;
      choicesEl.hidden = !useChoices;
      scoreBtn.style.display = useChoices ? 'none' : '';
      hintBtn.style.display = useChoices ? 'none' : '';

      if (mode === 'forward'){
        stimLabelEl.textContent = 'Prompt';
        outputEl.textContent = item.prompt;
      } else {
        stimLabelEl.textContent = 'Output';
        outputEl.textContent = item.response;
      }

      if (useChoices){
        renderChoices(item);
      } else {
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
    }
    function next(){
      idx = (idx + 1) % deck.length;
      showStimulus();
    }

    modesEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.tester-mode-btn');
      if (!btn) return;
      mode = btn.getAttribute('data-mode');
      modesEl.querySelectorAll('.tester-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
      persist();
      showStimulus();
    });
    diffEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.tester-diff-btn');
      if (!btn) return;
      diff = btn.getAttribute('data-diff');
      diffEl.querySelectorAll('.tester-diff-btn').forEach(b => b.classList.toggle('active', b === btn));
      persist();
      applyDiff();
      showStimulus();
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
    textareaEl.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitFreeText();
    });
    skipBtn.addEventListener('click', next);
    nextBtn.addEventListener('click', next);

    // Stream remaining chunks in the background, sequentially, appending as they arrive.
    function loadRest(base, names){
      let i = 0;
      (function nxt(){
        if (i >= names.length) return;
        fetch(base + names[i])
          .then(r => r.json())
          .then(items => { appendItems(items); })
          .catch(() => {})
          .finally(() => { i++; nxt(); });
      })();
    }
    // Sharded load: tiny manifest + first chunk for an instant start, rest streamed after.
    // restore saved progress + preferences, then show the save affordance
    loadProgress();
    syncButtons();
    renderSave();

    fetch('/data/index.json')
      .then(r => { if (!r.ok) throw new Error('no index'); return r.json(); })
      .then(idx => {
        totals = { count: idx.count, byDifficulty: idx.byDifficulty };
        const base = '/data/';
        return fetch(base + idx.chunks[0])
          .then(r => r.json())
          .then(first => {
            allItems = shuffle(first);
            applyDiff();
            showStimulus();
            loadRest(base, idx.chunks.slice(1));
          });
      })
      .catch(() => {
        // Fallback to the monolithic file if the sharded data isn't available.
        fetch('/prompts.json')
          .then(r => r.json())
          .then(data => {
            const items = data.items || [];
            totals = { count: items.length, byDifficulty: items.reduce((a, it) => {
              const k = it.difficulty || 'medium'; a[k] = (a[k] || 0) + 1; return a;
            }, {}) };
            allItems = shuffle(items);
            applyDiff();
            showStimulus();
          })
          .catch(err => {
            loadingEl.innerHTML = '<div class="tester-loading">Could not load prompts.</div>';
            console.error('Tester load failed:', err);
          });
      });
  })();
