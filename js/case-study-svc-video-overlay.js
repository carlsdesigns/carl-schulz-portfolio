/**
 * Service case study pages (.cs-svc-main): prominent centered play control on
 * .svc-video-wrap > video[controls] until playback starts; hidden while playing
 * and after native controls start play; returns when video ends (replay cue).
 */
(function () {
  var PLAY_SVG =
    '<span class="svc-video-play-pulse" aria-hidden="true"></span>' +
    '<span class="svc-video-play-circle" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24" focusable="false"><polygon points="5,3 19,12 5,21"/></svg>' +
    '</span>';

  function bindWrap(wrap, video) {
    if (wrap.querySelector('.svc-video-play-overlay')) return;

    video.removeAttribute('poster');
    video.setAttribute('preload', 'auto');

    function primeFirstFrame() {
      if (video.dataset.svcFramePrimed === '1') return;
      function trySeek() {
        if (video.dataset.svcFramePrimed === '1') return;
        try {
          if (video.readyState < 2) return;
          var d = video.duration;
          var t = 0.04;
          if (isFinite(d) && d > 0) {
            t = Math.min(0.06, Math.max(0.001, d * 0.002));
          }
          video.currentTime = t;
          video.pause();
          video.dataset.svcFramePrimed = '1';
        } catch (e) {}
      }
      function onReady() {
        trySeek();
        if (video.dataset.svcFramePrimed === '1') {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('canplay', onReady);
        }
      }
      video.addEventListener('loadeddata', onReady);
      video.addEventListener('canplay', onReady);
      if (video.readyState >= 2) trySeek();
    }
    primeFirstFrame();

    var overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'svc-video-play-overlay';
    overlay.setAttribute('aria-label', 'Play video');
    overlay.innerHTML = PLAY_SVG;
    wrap.appendChild(overlay);

    function setPlaying(on) {
      if (on) wrap.classList.add('svc-video-wrap--playing');
      else wrap.classList.remove('svc-video-wrap--playing');
    }

    overlay.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      video.play().catch(function () {});
    });

    video.addEventListener('play', function () {
      setPlaying(true);
    });

    video.addEventListener('ended', function () {
      setPlaying(false);
    });
  }

  function init(root) {
    var scope = root || document;
    scope.querySelectorAll('.cs-svc-main .svc-video-wrap').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      if (!video || !video.hasAttribute('controls')) return;
      bindWrap(wrap, video);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }

  document.addEventListener('portfoliounlocked', function () {
    init(document);
  });
})();
