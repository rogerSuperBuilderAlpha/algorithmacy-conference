// Year tabs for the conference home page.
// Default is 2027 (the open call). #2026, and any hash that points inside the
// 2026 panel, opens the archive. Arrow keys move between tabs.
(function () {
  var tablist = document.getElementById('year-tabs');
  if (!tablist) return;

  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var panels = {
    '2026': document.getElementById('2026'),
    '2027': document.getElementById('2027'),
  };

  function hashId() {
    var hash = location.hash;
    if (!hash || hash === '#') return '';
    try { return decodeURIComponent(hash.slice(1)); }
    catch (e) { return hash.slice(1); }
  }

  function yearForHash() {
    var id = hashId();
    if (id === '2026') return '2026';
    if (id === '2027' || !id) return '2027';
    var el = document.getElementById(id);
    if (el && panels['2026'] && panels['2026'].contains(el)) return '2026';
    if (el && panels['2027'] && panels['2027'].contains(el)) return '2027';
    return '2027';
  }

  function select(year, opts) {
    opts = opts || {};
    if (!panels[year]) return;
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-year') === year;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    Object.keys(panels).forEach(function (key) {
      var panel = panels[key];
      if (!panel) return;
      var on = key === year;
      panel.hidden = !on;
      if ('inert' in panel) panel.inert = !on;
    });
    if (opts.focus) {
      var active = tabs.filter(function (tab) { return tab.getAttribute('data-year') === year; })[0];
      if (active) active.focus();
    }
    if (opts.hash && location.hash !== '#' + year) location.hash = year;
    if (opts.scroll) {
      var id = hashId();
      if (id && id !== year) {
        var el = document.getElementById(id);
        if (el && panels[year].contains(el)) {
          requestAnimationFrame(function () { el.scrollIntoView(); });
        }
      }
    }
  }

  function fromHash() {
    select(yearForHash(), { scroll: true });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      select(tab.getAttribute('data-year'), { hash: true });
    });
    tab.addEventListener('keydown', function (event) {
      var next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next].getAttribute('data-year'), { hash: true, focus: true });
    });
  });

  window.addEventListener('hashchange', fromHash);
  fromHash();
})();

// Two wordings of the 2027 call. Both panels are in the HTML so the page
// still shows them, Human Slop first, if this script does not run.
(function () {
  var tablist = document.getElementById('cfp-version-tabs');
  if (!tablist) return;
  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var panels = {
    human: document.getElementById('cfp-human-slop'),
    ai: document.getElementById('cfp-ai-polish'),
  };

  function hashId() {
    var hash = location.hash;
    if (!hash || hash === '#') return '';
    try { return decodeURIComponent(hash.slice(1)); }
    catch (e) { return hash.slice(1); }
  }

  function whichForHash() {
    var id = hashId();
    if (id === 'cfp-ai-polish' || id === 'cfp-tab-ai') return 'ai';
    if (id === 'cfp-human-slop' || id === 'cfp-tab-human') return 'human';
    return '';
  }

  function select(which, opts) {
    opts = opts || {};
    if (!panels[which]) return;
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-cfp') === which;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    Object.keys(panels).forEach(function (key) {
      var panel = panels[key];
      if (!panel) return;
      panel.hidden = key !== which;
    });
    if (opts.focus) {
      var active = tabs.filter(function (tab) { return tab.getAttribute('data-cfp') === which; })[0];
      if (active) active.focus();
    }
    if (opts.hash) {
      var next = which === 'ai' ? '#cfp-ai-polish' : '#cfp-human-slop';
      if (location.hash !== next) location.hash = next;
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      select(tab.getAttribute('data-cfp'), { hash: true });
    });
    tab.addEventListener('keydown', function (event) {
      var next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next].getAttribute('data-cfp'), { hash: true, focus: true });
    });
  });

  function fromHash() {
    var which = whichForHash();
    if (which) select(which);
    else if (panels.human && panels.ai && !panels.human.hidden && !panels.ai.hidden) select('human');
  }

  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
