// Partner deck modal. Any element with [data-open-partner] opens it and shows
// the Anime Caribe AC26 concept pitch deck (PDF) in an embedded viewer.

(function () {
  const modal = document.getElementById('partner-modal');
  if (!modal) return;

  let lastFocus = null;

  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    const close = modal.querySelector('.smodal__close');
    if (close) close.focus();
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

  document.querySelectorAll('[data-open-partner]').forEach((el) => {
    el.addEventListener('click', open);
  });

  modal.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', close);
  });
})();
