(function () {
  const cfg = window.__PORTFOLIO_CONFIG || { PASSWORD: 'carl2025', STORAGE_KEY: 'portfolioUnlocked' };
  const STORAGE_KEY = cfg.STORAGE_KEY;

  function isUnlocked() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

  function lock() {
    sessionStorage.removeItem(STORAGE_KEY);
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

  function tryPassword(pw) {
    if (typeof pw === 'string') pw = pw.trim();
    if (pw === cfg.PASSWORD) {
      unlock();
      showMain();
      document.dispatchEvent(new CustomEvent('portfoliounlocked', { bubbles: true }));
      return true;
    }
    return false;
  }

  window.__portfolioAuth = {
    isUnlocked,
    unlock,
    lock,
    tryPassword,
    showGate,
    showMain,
    initPage() {
      if (isUnlocked()) showMain();
      else showGate();
    }
  };
})();
