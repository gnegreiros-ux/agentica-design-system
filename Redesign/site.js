/* ============================================================================
   Système de design agentique — site.js (REDESIGN)
   Conserve toutes les fonctions officielles (langue+URL, menu, nav active,
   compteurs, TOC, recherche tokens, copier) et ajoute thème, particules, reveal.
   Aucune dépendance externe. Respecte prefers-reduced-motion.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Langue (URL ?lang= prioritaire, puis localStorage, défaut fr) ──────
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const savedLang = urlLang || localStorage.getItem('sda-lang') || 'fr';
  root.setAttribute('data-lang', savedLang);
  root.setAttribute('lang', savedLang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const on = btn.dataset.lang === savedLang;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      root.setAttribute('data-lang', lang);
      root.setAttribute('lang', lang);
      localStorage.setItem('sda-lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url.toString());
      document.querySelectorAll('.lang-btn').forEach(b => {
        const a = b.dataset.lang === lang;
        b.classList.toggle('active', a);
        b.setAttribute('aria-pressed', a ? 'true' : 'false');
      });
    });
  });

  // ── Thème (clair/sombre) ───────────────────────────────────────────────
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('sda-theme') || (prefersDark ? 'dark' : 'light');
  const applyTheme = t => {
    root.setAttribute('data-theme', t);
    const b = document.querySelector('.theme-btn');
    if (b) {
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'dark' ? 'Activer le thème clair / Switch to light theme' : 'Activer le thème sombre / Switch to dark theme');
    }
  };
  applyTheme(savedTheme);
  const themeBtn = document.querySelector('.theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sda-theme', next);
    applyTheme(next);
  });

  // ── Menu mobile ────────────────────────────────────────────────────────
  const menuToggle = document.querySelector('.menu-toggle');
  const topNav = document.querySelector('.top-nav');
  if (menuToggle && topNav) {
    menuToggle.addEventListener('click', () => {
      const open = topNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', e => {
      if (!menuToggle.contains(e.target) && !topNav.contains(e.target)) {
        topNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Liens de navigation actifs ─────────────────────────────────────────
  const p = window.location.pathname;
  document.querySelectorAll('.top-nav a').forEach(a => {
    const h = a.getAttribute('href') || '';
    if (h !== 'index.html' && p.includes(h.split('/').pop().replace('.html', ''))) a.classList.add('active');
    if ((p.endsWith('index.html') || p.endsWith('/')) && h === 'index.html') a.classList.add('active');
  });
  document.querySelectorAll('.sidebar a').forEach(a => {
    if (p.endsWith((a.getAttribute('href') || '').split('/').pop())) a.classList.add('active');
  });

  // ── Particules « agents » (hero) ───────────────────────────────────────
  const field = document.querySelector('.hero-particles');
  if (field && !reduceMotion) {
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = (60 + Math.random() * 40) + '%';
      s.style.animationDuration = (9 + Math.random() * 10) + 's';
      s.style.animationDelay = (Math.random() * 8) + 's';
      s.style.transform = 'scale(' + (0.5 + Math.random()).toFixed(2) + ')';
      field.appendChild(s);
    }
  }

  // ── Compteurs animés ───────────────────────────────────────────────────
  function animateCounter(el, target, duration) {
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    (function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (t < 1) requestAnimationFrame(update);
    })(performance.now());
  }
  const statBand = document.querySelector('.stat-band');
  if (statBand && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statBand.querySelectorAll('.stat-num[data-count]').forEach(el =>
          animateCounter(el, parseInt(el.dataset.count), 1400));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(statBand);
  }

  // ── Reveal au défilement ───────────────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const ro = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(el => ro.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  // ── TOC auto (pages intérieures) ───────────────────────────────────────
  const tocEl = document.getElementById('page-toc');
  if (tocEl) {
    const headings = Array.from(document.querySelectorAll('.content h2'));
    if (headings.length > 1) {
      const slugify = t => t.toLowerCase()
        .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[ïî]/g, 'i')
        .replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const title = document.createElement('span');
      title.className = 'toc-title';
      title.innerHTML = '<span class="lang-fr">Sur cette page</span><span class="lang-en">On this page</span>';
      tocEl.appendChild(title);
      headings.forEach(h => {
        if (!h.id) h.id = slugify(h.textContent);
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        tocEl.appendChild(a);
      });
      const tocLinks = tocEl.querySelectorAll('a');
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              tocLinks.forEach(l => l.classList.remove('active'));
              const active = tocEl.querySelector('a[href="#' + e.target.id + '"]');
              if (active) active.classList.add('active');
            }
          });
        }, { rootMargin: '-64px 0px -80% 0px' });
        headings.forEach(h => obs.observe(h));
      }
    }
  }

  // ── Recherche de tokens ────────────────────────────────────────────────
  const search = document.getElementById('token-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('.token-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // ── Boutons « Copier » sur les blocs de code ───────────────────────────
  document.querySelectorAll('pre.code-block').forEach(pre => {
    const btn = document.createElement('button');
    Object.assign(btn.style, { position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,.1)', color: '#c9d1d9', border: 'none', padding: '5px 11px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' });
    btn.textContent = 'Copier';
    btn.setAttribute('aria-label', 'Copier le code');
    pre.style.position = 'relative';
    pre.appendChild(btn);
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.querySelector('code')?.textContent || '');
      btn.textContent = 'Copié !';
      setTimeout(() => btn.textContent = 'Copier', 1600);
    });
  });
});
