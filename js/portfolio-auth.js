(function () {
  const cfg = window.__PORTFOLIO_CONFIG || {};
  const STORAGE_KEY = cfg.STORAGE_KEY || 'portfolioUnlocked';

  /* Unlocking must survive closing the tab and must carry across tabs, so a
     visitor who opens a shared case-study link and enters the password can then
     browse every other case study. localStorage is the primary store;
     sessionStorage is a fallback for Safari private mode, where localStorage
     writes throw. */
  function readFlag(store) {
    try {
      return store && store.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function writeFlag(store) {
    try {
      store.setItem(STORAGE_KEY, '1');
      return true;
    } catch (e) {
      return false;
    }
  }

  function isUnlocked() {
    return readFlag(window.localStorage) || readFlag(window.sessionStorage);
  }

  function unlock() {
    if (!writeFlag(window.localStorage)) writeFlag(window.sessionStorage);
  }

  function lock() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    try { window.sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function showGate() {
    const gate = document.getElementById('portfolioGate');
    const main = document.getElementById('portfolioMain');
    if (gate) {
      gate.classList.remove('gate-dismissed');
      gate.hidden = false;
      gate.removeAttribute('hidden');
    }
    if (main) {
      main.classList.remove('main-revealed');
      main.hidden = true;
      main.setAttribute('hidden', '');
    }
  }

  function showMain() {
    const gate = document.getElementById('portfolioGate');
    const main = document.getElementById('portfolioMain');
    if (gate) {
      gate.classList.add('gate-dismissed');
      gate.hidden = true;
      gate.setAttribute('hidden', '');
    }
    if (main) {
      main.classList.add('main-revealed');
      main.hidden = false;
      main.removeAttribute('hidden');
    }
  }

  /* Forgiving normalization: shared links get pasted into mobile keyboards that
     autocapitalize, and pasted passcodes often carry whitespace. The same
     normalization was applied when VERIFIER was generated. */
  function normalize(pw) {
    return String(pw).trim().toLowerCase();
  }

  /* Compare without an early exit, so timing does not reveal how much of a
     digest matched. */
  function digestsEqual(got, want) {
    if (typeof want !== 'string' || got.length !== want.length) return false;
    let diff = 0;
    for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
    return diff === 0;
  }

  /* Any configured verifier grants the same access, so several passcodes can be
     handed to different audiences without maintaining separate builds. */
  function verifiers() {
    if (Array.isArray(cfg.VERIFIERS)) return cfg.VERIFIERS;
    if (cfg.VERIFIER) return [{ salt: cfg.SALT, hash: cfg.VERIFIER }]; // single-verifier config
    return [];
  }

  function matches(pw) {
    if (typeof pw !== 'string' || !pw) return false;

    const list = verifiers();
    if (!list.length || !window.__sha256) {
      console.error('[portfolio-auth] No verifiers or missing sha256 helper; check that portfolio-config.js and portfolio-sha256.js loaded.');
      return false;
    }

    const value = normalize(pw);
    const iterations = cfg.ITERATIONS || 1;
    let ok = false;
    for (let i = 0; i < list.length; i++) {
      const got = window.__sha256.stretch(list[i].salt || '', value, iterations);
      if (digestsEqual(got, list[i].hash)) ok = true; // no early break
    }
    return ok;
  }

  function tryPassword(pw) {
    if (!matches(pw)) return false;
    unlock();
    showMain();
    document.dispatchEvent(new CustomEvent('portfoliounlocked', { bubbles: true }));
    return true;
  }

  /* Wires the gate form on any page that has one. Runs automatically, so pages
     only need to include portfolio-config.js and portfolio-auth.js. */
  function initGate() {
    const form = document.getElementById('gateForm');
    const btn = document.getElementById('gateUnlockBtn');
    const input = document.getElementById('gatePassword');
    const err = document.getElementById('gateError');
    const gate = document.getElementById('portfolioGate');

    if (gate && !gate.dataset.gateWired) {
      gate.dataset.gateWired = '1';

      const attempt = function () {
        if (!input) return;
        if (tryPassword(input.value)) {
          if (err) err.classList.remove('show');
          input.value = '';
        } else {
          if (err) {
            err.textContent = 'Incorrect password.';
            err.classList.add('show');
          }
          input.value = '';
          input.focus();
        }
      };

      if (form) form.addEventListener('submit', function (e) { e.preventDefault(); attempt(); });
      if (btn) btn.addEventListener('click', attempt);
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); attempt(); }
        });
      }
    }

    initPage();
  }

  function initPage() {
    if (isUnlocked()) showMain();
    else showGate();
  }

  /* If the visitor unlocks in another tab, reveal here too. */
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && e.newValue === '1') showMain();
  });

  window.__portfolioAuth = {
    isUnlocked,
    unlock,
    lock,
    tryPassword,
    check: tryPassword, // alias kept for pages that call check()
    showGate,
    showMain,
    initGate,
    initPage
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGate);
  } else {
    initGate();
  }
})();
