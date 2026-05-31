// Opt-in localStorage progress for the tester. The factory takes accessors for
// the engine's mode/diff so it can persist and restore those preferences too.
// Nothing leaves the browser.

const SAVE_KEY = 'algo_progress_v1';
const CONSENT_KEY = 'algo_save_consent';

export function createProgress({ getMode, setMode, getDiff, setDiff, modesEl, diffEl }){
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
      if (p.mode) setMode(p.mode);
      if (p.diff) setDiff(p.diff);
    } catch (e) {}
  }
  function persist(){
    if (!saveOn) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ answered: prog.answered, best: prog.best, sum: prog.sum, seen: prog.seen, mode: getMode(), diff: getDiff() })); }
    catch (e) {}
  }
  function record(item, score){
    if (!saveOn) return;
    prog.answered++; prog.sum += score;
    if (score > prog.best) prog.best = score;
    if (item && item.id) prog.seen[item.id] = 1;
    persist(); render();
  }
  function syncButtons(){
    if (modesEl) modesEl.querySelectorAll('.tester-mode-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === getMode()));
    if (diffEl) diffEl.querySelectorAll('.tester-diff-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-diff') === getDiff()));
  }
  function render(){
    if (!saveEl) return;
    const consent = canStore ? localStorage.getItem(CONSENT_KEY) : null;
    if (!canStore){
      saveEl.hidden = false; saveEl.className = 'tester-save blocked';
      saveEl.innerHTML = '<span class="ts-msg">⚠ Your browser is blocking local storage, so progress can’t be saved. Allow site data (or leave private mode) to keep your progress here.</span>';
      return;
    }
    if (saveOn){
      const explored = Object.keys(prog.seen).length;
      const avg = prog.answered ? Math.round(prog.sum / prog.answered) : 0;
      saveEl.hidden = false; saveEl.className = 'tester-save on';
      saveEl.innerHTML = '<span class="ts-msg"><span class="ts-dot"></span>Progress saved on this device · <b>' + explored + '</b> explored · best <b>' + prog.best + '</b> · avg <b>' + avg + '</b></span><button type="button" class="ts-no" id="ts-reset">Reset</button>';
      return;
    }
    if (consent === 'off'){ saveEl.hidden = true; return; }
    saveEl.hidden = false; saveEl.className = 'tester-save ask';
    saveEl.innerHTML = '<span class="ts-msg">Save your progress on this device? It stays in your browser — nothing leaves it.</span><span class="ts-actions"><button type="button" class="ts-btn" id="ts-enable">Enable saving</button><button type="button" class="ts-no" id="ts-dismiss">Not now</button></span>';
  }
  if (saveEl){
    saveEl.addEventListener('click', (e) => {
      const id = e.target && e.target.id;
      if (id === 'ts-enable'){ try { localStorage.setItem(CONSENT_KEY, 'on'); } catch (_){} saveOn = canStore; persist(); render(); }
      else if (id === 'ts-dismiss'){ try { localStorage.setItem(CONSENT_KEY, 'off'); } catch (_){} render(); }
      else if (id === 'ts-reset'){ prog = { answered: 0, best: 0, sum: 0, seen: {} }; persist(); render(); }
    });
  }
  return { loadProgress, persist, record, syncButtons, render };
}
