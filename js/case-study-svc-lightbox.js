/**
 * Service case studies (.cs-svc-main): click large https images to open full-size lightbox.
 * Skips nav avatar and non-https assets.
 */
(function () {
  var lb;
  var imgEl;
  var capEl;

  function ensureDom() {
    if (lb) return;
    lb = document.createElement('div');
    lb.id = 'svcLightbox';
    lb.className = 'svc-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image');
    lb.hidden = true;
    lb.innerHTML =
      '<button type="button" class="svc-lightbox-backdrop" aria-label="Close image viewer"></button>' +
      '<div class="svc-lightbox-panel">' +
      '<button type="button" class="svc-lightbox-close" aria-label="Close">&times;</button>' +
      '<img class="svc-lightbox-img" src="" alt="">' +
      '<p class="svc-lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(lb);
    imgEl = lb.querySelector('.svc-lightbox-img');
    capEl = lb.querySelector('.svc-lightbox-caption');

    function close() {
      lb.hidden = true;
      lb.classList.remove('svc-lightbox--open');
      document.body.classList.remove('svc-lightbox-open');
      imgEl.removeAttribute('src');
      imgEl.alt = '';
      capEl.textContent = '';
    }

    lb.querySelector('.svc-lightbox-backdrop').addEventListener('click', close);
    lb.querySelector('.svc-lightbox-close').addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) {
        e.preventDefault();
        close();
      }
    });
  }

  function open(src, alt) {
    ensureDom();
    imgEl.src = src;
    imgEl.alt = alt || '';
    capEl.textContent = alt || '';
    capEl.style.display = alt ? 'block' : 'none';
    lb.hidden = false;
    lb.classList.add('svc-lightbox--open');
    document.body.classList.add('svc-lightbox-open');
  }

  function shouldOpen(img) {
    if (!img || img.tagName !== 'IMG') return false;
    var src = img.getAttribute('src');
    if (!src || src.indexOf('https://') !== 0) return false;
    if (img.closest('.work-nav')) return false;
    if (img.closest('.svc-lightbox')) return false;
    return true;
  }

  function bind(main) {
    if (!main || main.dataset.svcLightboxBound === '1') return;
    main.dataset.svcLightboxBound = '1';
    main.addEventListener('click', function (e) {
      var img = e.target.closest('img');
      if (!shouldOpen(img)) return;
      e.preventDefault();
      open(img.currentSrc || img.src, img.getAttribute('alt') || '');
    });
  }

  function boot() {
    var main = document.getElementById('portfolioMain');
    if (main && main.classList.contains('cs-svc-main')) bind(main);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('portfoliounlocked', boot);
})();
