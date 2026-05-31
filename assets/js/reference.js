  (function(){
    const strip = document.getElementById('ref-strip');
    if (!strip) return;
    const btns = document.querySelectorAll('.seq-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.show;
        const isOpenOnSame = strip.classList.contains('open') && strip.dataset.active === target;
        btns.forEach(b => b.classList.remove('active'));
        if (isOpenOnSame) {
          strip.classList.remove('open');
          strip.dataset.active = '';
        } else {
          strip.dataset.active = target;
          strip.classList.add('open');
          btn.classList.add('active');
        }
      });
    });
  })();
