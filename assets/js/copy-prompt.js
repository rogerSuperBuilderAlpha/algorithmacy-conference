
  (function(){
    const btn = document.getElementById('copy-prompt-btn');
    const ta = document.getElementById('prompt-textarea');
    if (!btn || !ta) return;
    btn.addEventListener('click', async () => {
      const text = ta.value;
      try {
        await navigator.clipboard.writeText(text);
      } catch(e) {
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.setSelectionRange(0, 0);
      }
      const orig = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2200);
    });
  })();

  
