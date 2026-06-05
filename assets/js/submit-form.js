// Direct-submission form: client-side validation + live word count, posts to
// /api/submit, then shows the "check your email" state. The PR is only created
// after the author clicks the magic link (handled by /api/confirm).

(function () {
  const form = document.getElementById('subform');
  if (!form) return;

  const abstract = form.querySelector('[name="abstract"]');
  const counter = form.querySelector('#abstract-count');
  const banner = form.querySelector('#form-msg');
  const btn = form.querySelector('.submit-btn');
  const sentAddr = form.querySelector('#sent-addr');

  const countWords = (s) => s.trim().split(/\s+/).filter(Boolean).length;

  function updateCount() {
    const n = countWords(abstract.value);
    counter.textContent = `${n} word${n === 1 ? '' : 's'} · target 300–500`;
    counter.classList.toggle('ok', n >= 300 && n <= 500);
    counter.classList.toggle('bad', abstract.value.trim() !== '' && (n < 300 || n > 500));
  }
  abstract.addEventListener('input', updateCount);
  updateCount();

  function showError(msg) {
    banner.textContent = msg;
    banner.className = 'form-msg error show';
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    banner.className = 'form-msg';

    const data = Object.fromEntries(new FormData(form).entries());
    data.agree = form.querySelector('[name="agree"]').checked;

    // mirror the server-side checks for a faster, friendlier response
    const words = countWords(data.abstract || '');
    const keywords = (data.keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
    if (!data.title || !data.authors || !data.email) return showError('Title, authors, and contact email are required.');
    if (!data.type) return showError('Choose a submission type.');
    if (!data.track) return showError('Choose a track.');
    if (keywords.length < 3 || keywords.length > 7) return showError('Provide 3–7 comma-separated keywords.');
    if (words < 300 || words > 500) return showError(`Abstract must be 300–500 words (currently ${words}).`);
    if (!data.outline || !data.bios) return showError('Outline and author bios are required.');
    if (!data.agree) return showError('Please agree to the open-review policy.');

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(out.error || 'Something went wrong. Please try again.');
        btn.disabled = false;
        btn.textContent = label;
        return;
      }
      sentAddr.textContent = out.email || data.email;
      form.classList.add('sent');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError('Network error. Please check your connection and try again.');
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();
