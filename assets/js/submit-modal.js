// "Submit a paper" method-picker modal. Any element with [data-open-submit]
// opens it instead of navigating straight to /submit. Falls back to the href
// if JS is disabled (the triggers keep href="/submit").

(function () {
  const modal = document.getElementById('submit-modal');
  if (!modal) return;

  let lastFocus = null;

  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    const first = modal.querySelector('.sopt__btn, .smodal__close');
    if (first) first.focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    modal.hidden = true;
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  document.querySelectorAll('[data-open-submit]').forEach((el) => {
    el.addEventListener('click', open);
  });

  modal.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', close);
  });
})();
