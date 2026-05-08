(function () {
  const DATA_URL = 'data/case-studies.json';

  function caseStudyHref(cs) {
    if (cs.detailUrl) return cs.detailUrl;
    return 'case-study.html?slug=' + encodeURIComponent(cs.slug);
  }

  function card(cs) {
    const visual = cs.teaserImage || cs.keyVisual || '';
    const img = visual
      ? '<div class="work-card-visual"><img src="' +
        visual +
        '" alt="" loading="lazy"></div>'
      : '<div class="work-card-visual"></div>';
    return (
      '<a class="work-card" href="' +
      caseStudyHref(cs) +
      '">' +
      img +
      '<div class="work-card-body">' +
      '<div class="work-card-type">' +
      escapeHtml(cs.projectType || 'Case study') +
      '</div>' +
      '<div class="work-card-title">' +
      escapeHtml(cs.title || 'Untitled') +
      '</div>' +
      '<div class="work-card-impact">' +
      escapeHtml(cs.impactLine || cs.headline || '') +
      '</div>' +
      '<div class="work-card-meta">' +
      escapeHtml([cs.company, cs.year].filter(Boolean).join(' · ')) +
      '</div>' +
      '</div></a>'
    );
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function init() {
    const grid = document.getElementById('workGrid');
    if (!grid || grid.dataset.loaded === '1') return;
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      const list = (data.caseStudies || []).filter(function (c) {
        return c.published === true;
      });
      if (list.length === 0) {
        grid.innerHTML =
          '<p class="work-empty">No published case studies. Set <code>published: true</code> in <code>data/case-studies.json</code>.</p>';
        return;
      }
      grid.innerHTML = list.map(card).join('');
      grid.dataset.loaded = '1';
    } catch (e) {
      grid.innerHTML =
        '<p class="work-empty">Could not load case studies. Check that <code>data/case-studies.json</code> is available.</p>';
      grid.dataset.loaded = '1';
    }
  }

  function boot() {
    const auth = window.__portfolioAuth;
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
