/**
 * AEI example block (.aei-eval-ui): tablist for Easy / Fast / Fair / Human.
 */
(function () {
  function init(root) {
    var wrap = (root || document).querySelector('.aei-eval-ui');
    if (!wrap || wrap.dataset.aeiTabsInit === '1') return;
    wrap.dataset.aeiTabsInit = '1';

    var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(wrap.querySelectorAll('[role="tabpanel"]'));
    if (tabs.length === 0 || panels.length === 0) return;

    function panelForTab(tab) {
      var id = tab.getAttribute('aria-controls');
      return id ? document.getElementById(id) : null;
    }

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.classList.toggle('aei-tab--selected', on);
        t.tabIndex = on ? 0 : -1;
        var p = panelForTab(t);
        if (p) p.hidden = !on;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        select(tab);
      });
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        if (i < 0) return;
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          next = tabs[(i + 1) % tabs.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          next = tabs[(i - 1 + tabs.length) % tabs.length];
        } else if (e.key === 'Home') {
          e.preventDefault();
          next = tabs[0];
        } else if (e.key === 'End') {
          e.preventDefault();
          next = tabs[tabs.length - 1];
        }
        if (next) {
          next.focus();
          select(next);
        }
      });
    });

    var first = tabs.find(function (t) {
      return t.getAttribute('aria-selected') === 'true';
    });
    select(first || tabs[0]);
  }

  function boot() {
    init(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('portfoliounlocked', boot);
})();
