/* Site-wide prompt to follow @algorithmacy on X. */
(function () {
  'use strict';

  if (window.__algorithmacyXFollow) return;
  window.__algorithmacyXFollow = true;

  var PROFILE_URL = 'https://x.com/algorithmacy';
  var STORAGE_KEY = 'algorithmacy-x-follow';
  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function dismissed() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function remember() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (err) {
      /* Private browsing can block storage. The dialog still closes. */
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function ensureFooterLink() {
    if (document.querySelector('a[href="' + PROFILE_URL + '"]')) return;
    var host = document.querySelector('footer nav, footer .legal-links, footer .footer-legal, footer .page-footer-row');
    if (!host) return;
    var link = document.createElement('a');
    link.href = PROFILE_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '@algorithmacy on X';
    host.appendChild(link);
  }

  function buildDialog() {
    var dialog = document.createElement('div');
    dialog.className = 'x-follow';
    dialog.id = 'x-follow';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'x-follow-title');
    dialog.setAttribute('aria-describedby', 'x-follow-desc');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.tabIndex = -1;
    dialog.inert = true;
    dialog.innerHTML =
      '<div class="x-follow__backdrop" data-x-follow-close></div>' +
      '<div class="x-follow__panel">' +
        '<button type="button" class="x-follow__close" data-x-follow-close aria-label="Close">' +
          '<span aria-hidden="true">×</span>' +
        '</button>' +
        '<div class="x-follow__gradient" aria-hidden="true"></div>' +
        '<div class="x-follow__mark" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' +
          '</svg>' +
        '</div>' +
        '<p class="x-follow__eyebrow">Algorithmacy on X</p>' +
        '<h2 class="x-follow__title" id="x-follow-title">@algorithmacy</h2>' +
        '<p class="x-follow__desc" id="x-follow-desc">Follow @algorithmacy for conference updates, announcements, and discussions.</p>' +
        '<div class="x-follow__actions">' +
          '<a class="x-follow__cta" href="' + PROFILE_URL + '" target="_blank" rel="noopener noreferrer">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' +
            '</svg>' +
            'Follow @algorithmacy' +
            '<span class="x-follow__sr"> (opens in a new tab)</span>' +
          '</a>' +
          '<button type="button" class="x-follow__dismiss" data-x-follow-close>Close</button>' +
        '</div>' +
      '</div>';
    return dialog;
  }

  onReady(function () {
    ensureFooterLink();
    if (document.getElementById('x-follow')) return;

    var dialog = buildDialog();
    var previousFocus = null;
    document.body.appendChild(dialog);

    function focusable() {
      return Array.prototype.filter.call(dialog.querySelectorAll(FOCUSABLE), function (el) {
        return el.getAttribute('tabindex') !== '-1' && !el.hasAttribute('disabled');
      });
    }

    function close() {
      if (!dialog.classList.contains('is-open')) return;
      remember();
      dialog.classList.remove('is-open');
      dialog.setAttribute('aria-hidden', 'true');
      dialog.inert = true;
      document.body.classList.remove('x-follow-open');
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
      previousFocus = null;
    }

    function open() {
      if (dismissed() || dialog.classList.contains('is-open')) return;
      previousFocus = document.activeElement;
      dialog.inert = false;
      dialog.classList.add('is-open');
      dialog.setAttribute('aria-hidden', 'false');
      document.body.classList.add('x-follow-open');
      dialog.focus();
    }

    dialog.addEventListener('click', function (event) {
      var closer = event.target.closest('[data-x-follow-close]');
      if (closer) close();
    });

    var follow = dialog.querySelector('.x-follow__cta');
    if (follow) {
      follow.addEventListener('click', function () {
        remember();
        window.setTimeout(close, 0);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (!dialog.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      var items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    });

    var reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
      reduce = false;
    }
    window.setTimeout(open, reduce ? 0 : 280);
  });
})();
