  // Tracks accordion: click to expand, collapses others, scrolls to track
  (function(){
    const tracks = document.querySelectorAll('.track[id]');
    if (!tracks.length) return;

    tracks.forEach(track => {
      const btn = track.querySelector('.track-toggle');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const wasOpen = track.classList.contains('open');
        // collapse all
        tracks.forEach(t => {
          t.classList.remove('open');
          const b = t.querySelector('.track-toggle');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          track.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          // smooth scroll the track into view after expand animation
          requestAnimationFrame(() => {
            track.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
          history.replaceState(null, '', '#' + track.id);
        } else {
          // closing the current one — drop the hash
          history.replaceState(null, '', window.location.pathname);
        }
      });
    });

    // open the track from URL hash if present
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash + '.track');
      if (target) {
        target.classList.add('open');
        const b = target.querySelector('.track-toggle');
        if (b) b.setAttribute('aria-expanded', 'true');
      }
    }
  })();
