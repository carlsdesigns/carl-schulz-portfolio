(function () {
  const DATA_URL = 'data/case-studies.json';
  const PLACEHOLDER_BLOB = 'YOUR_VERCEL_BLOB_URL';

  function getSlug() {
    const q = new URLSearchParams(window.location.search).get('slug');
    if (q) return q.trim();
    return '';
  }

  function useHeroVideo(hv) {
    if (!hv || typeof hv !== 'object') return false;
    var src = (hv.src || '').trim();
    if (!src) return false;
    if (src.indexOf(PLACEHOLDER_BLOB) !== -1) return false;
    return true;
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function p(text) {
    if (!text) return '';
    return '<p>' + escapeHtml(text) + '</p>';
  }

  function section(id, label, bodyHtml) {
    if (!bodyHtml) return '';
    return (
      '<section class="cs-section" id="' +
      id +
      '"><h2>' +
      escapeHtml(label) +
      '</h2>' +
      bodyHtml +
      '</section>'
    );
  }

  function impactFallbackBlock(fb) {
    if (!fb || typeof fb !== 'object') return '';
    var parts = [];
    if (fb.expectedMetrics)
      parts.push(
        '<div class="cs-impact-sub"><h3>Metrics we aimed to move</h3>' +
          p(fb.expectedMetrics) +
          '</div>'
      );
    if (fb.strategicImpact)
      parts.push(
        '<div class="cs-impact-sub"><h3>Strategic impact</h3>' +
          p(fb.strategicImpact) +
          '</div>'
      );
    if (fb.testResults)
      parts.push(
        '<div class="cs-impact-sub"><h3>Research &amp; test readouts</h3>' +
          p(fb.testResults) +
          '</div>'
      );
    return parts.join('');
  }

  function renderContentBlocks(blocks) {
    if (!blocks || !blocks.length) return '';
    var html = '';
    blocks.forEach(function (b) {
      if (!b || !b.type) return;
      if (b.type === 'paragraphs' && b.items && b.items.length) {
        html += '<section class="cs-section cs-rich-block"><h2>' +
          escapeHtml(b.heading || 'More detail') +
          '</h2>';
        b.items.forEach(function (item) {
          html += p(item);
        });
        html += '</section>';
      }
      if (b.type === 'quote' && b.text) {
        html +=
          '<blockquote class="cs-block-quote">&ldquo;' +
          escapeHtml(b.text) +
          '&rdquo;' +
          (b.attribution
            ? '<cite>' + escapeHtml(b.attribution) + '</cite>'
            : '') +
          '</blockquote>';
      }
      if (b.type === 'figure' && b.src) {
        html +=
          '<figure class="cs-figure"><img src="' +
          escapeHtml(b.src) +
          '" alt="' +
          escapeHtml(b.alt || '') +
          '">';
        if (b.caption) html += '<figcaption>' + escapeHtml(b.caption) + '</figcaption>';
        html += '</figure>';
      }
    });
    return html;
  }

  function tocItem(href, label) {
    return '<a href="' + href + '">' + escapeHtml(label) + '</a>';
  }

  function buildToc(cs, includeVideo) {
    var items = [];
    items.push(tocItem('#overview', 'Overview'));
    if (includeVideo) items.push(tocItem('#hero-video', 'Hero video'));
    items.push(
      tocItem('#summary', 'Summary'),
      tocItem('#problem', 'Problem'),
      tocItem('#role', 'Role & team'),
      tocItem('#approach', 'Approach'),
      tocItem('#challenges', 'Challenges'),
      tocItem('#solution', 'Solution'),
      tocItem('#results', 'Results & impact'),
      tocItem('#next', 'Next steps')
    );
    if (cs.contentBlocks && cs.contentBlocks.length)
      items.push(tocItem('#deep-dive', 'Deep dive'));
    return items.join('');
  }

  function render(cs) {
    var includeVideo = useHeroVideo(cs.heroVideo);
    var keyVis = cs.keyVisual
      ? '<div class="cs-key-visual"><img src="' +
        escapeHtml(cs.keyVisual) +
        '" alt=""></div>'
      : '';

    var videoBlock = '';
    if (includeVideo) {
      videoBlock =
        '<div class="cs-video-wrap" id="hero-video">' +
        '<video controls playsinline preload="metadata" poster="' +
        escapeHtml(cs.heroVideo.poster || '') +
        '">' +
        '<source src="' +
        escapeHtml(cs.heroVideo.src) +
        '" type="video/mp4">' +
        '</video>';
      if (cs.heroVideo.caption)
        videoBlock +=
          '<div class="cs-video-caption">' + escapeHtml(cs.heroVideo.caption) + '</div>';
      videoBlock += '</div>';
    }

    var article =
      '<article class="cs-article">' +
      '<header class="cs-lede" id="overview">' +
      '<div class="cs-eyebrow">' +
      escapeHtml([cs.projectType, cs.company, cs.year].filter(Boolean).join(' · ')) +
      '</div>' +
      '<h1 class="cs-headline">' +
      escapeHtml(cs.headline || cs.title || '') +
      '</h1>' +
      (cs.hook ? '<p class="cs-hook">' + escapeHtml(cs.hook) + '</p>' : '') +
      keyVis +
      '</header>' +
      videoBlock +
      section('summary', 'Summary', p(cs.summary)) +
      section('problem', 'Problem framing', p(cs.problemFraming)) +
      section('role', 'Role & team', p(cs.roleAndTeam)) +
      section('approach', 'Approach', p(cs.approach)) +
      section('challenges', 'Challenges', p(cs.challenges)) +
      section('solution', 'Solution', p(cs.solution)) +
      section(
        'results',
        'Results & impact',
        p(cs.resultsAndImpact) + impactFallbackBlock(cs.impactFallback)
      ) +
      section('next', 'Next steps', p(cs.nextSteps)) +
      '<div id="deep-dive">' +
      renderContentBlocks(cs.contentBlocks) +
      '</div>' +
      '</article>';

    var layout =
      '<div class="cs-layout">' +
      '<nav class="cs-toc" aria-label="Case study sections">' +
      buildToc(cs, includeVideo) +
      '</nav>' +
      article +
      '</div>';

    document.title =
      (cs.title ? cs.title + ' — ' : '') + 'Carl Schulz — Case study';
    var root = document.getElementById('caseStudyRoot');
    if (root) root.innerHTML = layout;
  }

  function renderNotFound() {
    var root = document.getElementById('caseStudyRoot');
    if (root)
      root.innerHTML =
        '<div class="cs-notfound"><h1>Case study not found</h1><p>This URL may be outdated, or the case may be unpublished. <a href="work.html">Back to work</a></p></div>';
    document.title = 'Not found — Carl Schulz';
  }

  function renderLoading() {
    var root = document.getElementById('caseStudyRoot');
    if (root)
      root.innerHTML =
        '<div class="cs-loading"><h1>Loading case study…</h1></div>';
  }

  var started = false;
  async function init() {
    if (started) return;
    started = true;
    var slug = getSlug();
    if (!slug) {
      renderNotFound();
      return;
    }
    renderLoading();
    try {
      var res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('fetch failed');
      var data = await res.json();
      var cs = (data.caseStudies || []).find(function (c) {
        return c.slug === slug;
      });
      if (!cs || cs.published !== true) {
        renderNotFound();
        return;
      }
      render(cs);
    } catch (e) {
      renderNotFound();
    }
  }

  function boot() {
    var auth = window.__portfolioAuth;
    if (!auth) return;
    if (auth.isUnlocked()) init();
    else {
      document.addEventListener('portfoliounlocked', function once() {
        document.removeEventListener('portfoliounlocked', once);
        init();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
