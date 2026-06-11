
document.addEventListener('DOMContentLoaded', () => {

  // ── Language toggle ─────────────────────────────────────
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const savedLang = urlLang || localStorage.getItem('agtc-lang') || 'fr';
  document.documentElement.setAttribute('data-lang', savedLang);
  // Bascule de langue — consomme le contrôle .agtc-segmented (ADR-044).
  // Sélecteur .lang-switch button : cible le switcher du header (pas <html data-lang>
  // ni les démos segmented de la page composant).
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.setAttribute('aria-current', btn.dataset.lang === savedLang ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem('agtc-lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url.toString());
      document.querySelectorAll('.lang-switch button').forEach(b => b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false'));
      // Update copy button labels when language switches
      document.querySelectorAll('.code-copy').forEach(b => { if (!b.textContent.includes('!')) b.textContent = lang === 'en' ? 'Copy' : 'Copier'; });
    });
  });

  // ── Mobile menu (top-nav) ────────────────────────────────
  const menuToggle = document.querySelector('.menu-toggle');
  const topNav = document.querySelector('.top-nav');
  if (menuToggle && topNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = topNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', e => {
      if (!menuToggle.contains(e.target) && !topNav.contains(e.target)) {
        topNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Sidebar drawer (mobile) ──────────────────────────────
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.getElementById('site-sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  if (sidebarToggle && sidebar) {
    sidebarToggle.removeAttribute('hidden');
    const openDrawer = () => {
      sidebar.classList.add('open');
      sidebarOverlay && sidebarOverlay.classList.add('active');
      sidebarToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
      sidebar.classList.remove('open');
      sidebarOverlay && sidebarOverlay.classList.remove('active');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    sidebarOverlay && sidebarOverlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeDrawer();
    });
    sidebar.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });
  }

  // ── Active nav links ─────────────────────────────────────
  const p = window.location.pathname;
  const sections = ['foundations','components','tokens','decisions','agents'];
  document.querySelectorAll('.top-nav a').forEach(a => {
    const h = a.getAttribute('href') || '';
    const parts = h.split('/').filter(s => s !== '..' && s !== '.');
    const hFile = parts[parts.length - 1] || '';
    const hDir  = parts.length > 1 ? parts[parts.length - 2] : '';
    let active = false;
    if (hDir && sections.includes(hDir)) {
      active = p.includes('/' + hDir + '/');
    } else if (hFile === 'index.html' && !hDir) {
      active = p === '/' || (p.endsWith('/index.html') && sections.every(s => !p.includes('/' + s + '/')));
    } else if (hFile) {
      active = p.endsWith('/' + hFile);
    }
    if (active) a.classList.add('active');
  });
  document.querySelectorAll('.sidebar a').forEach(a => {
    if (p.endsWith(a.getAttribute('href')?.split('/').pop() || '')) a.classList.add('active');
  });

  // ── Animated counters ────────────────────────────────────
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    (function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (t < 1) requestAnimationFrame(update);
    })(performance.now());
  }
  const statBand = document.querySelector('.stat-band');
  if (statBand) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statBand.querySelectorAll('.stat-num[data-count]').forEach(el => {
          animateCounter(el, parseInt(el.dataset.count), 1400);
        });
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(statBand);
  }

  // ── TOC auto-generation ──────────────────────────────────
  const tocEl = document.getElementById('page-toc');
  if (tocEl) {
    const headings = Array.from(document.querySelectorAll('.content h2'));
    if (headings.length > 1) {
      function slugify(t) {
        return t.toLowerCase()
          .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[ïî]/g,'i')
          .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u')
          .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      }
      const title = document.createElement('span');
      title.className = 'toc-title';
      title.innerHTML = '<span class="lang-fr">Sur cette page</span><span class="lang-en">On this page</span>';
      tocEl.appendChild(title);
      headings.forEach(h => {
        const frSpan = h.querySelector('.lang-fr');
        const enSpan = h.querySelector('.lang-en');
        const frText = frSpan ? frSpan.textContent : h.textContent;
        if (!h.id) h.id = slugify(frText);
        const a = document.createElement('a');
        a.href = '#' + h.id;
        if (frSpan && enSpan) {
          a.innerHTML = '<span class="lang-fr">' + frSpan.textContent + '</span><span class="lang-en">' + enSpan.textContent + '</span>';
        } else {
          a.textContent = frText;
        }
        tocEl.appendChild(a);
      });
      // Active tracking
      const tocLinks = tocEl.querySelectorAll('a');
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            tocLinks.forEach(l => l.classList.remove('active'));
            const active = tocEl.querySelector('a[href="#' + e.target.id + '"]');
            if (active) active.classList.add('active');
          }
        });
      }, { rootMargin: '-10px 0px -80% 0px' });
      headings.forEach(h => obs.observe(h));
    }
  }

  // ── Token search ─────────────────────────────────────────
  const search = document.getElementById('token-search');
  const searchStatus = document.getElementById('token-search-status');
  if (search) {
    let debounceTimer;
    const runFilter = () => {
      const q = search.value.trim().toLowerCase();
      let totalVisible = 0;
      document.querySelectorAll('.token-section').forEach(section => {
        let sectionVisible = 0;
        section.querySelectorAll('.token-row').forEach(row => {
          const match = !q || row.textContent.toLowerCase().includes(q);
          row.style.display = match ? '' : 'none';
          if (match) sectionVisible++;
        });
        totalVisible += sectionVisible;
        section.style.display = sectionVisible === 0 && q ? 'none' : '';
      });
      if (searchStatus) {
        if (!q) {
          searchStatus.textContent = '';
        } else {
          const lang = document.documentElement.getAttribute('data-lang') || 'fr';
          searchStatus.textContent = lang === 'fr'
            ? totalVisible + ' token' + (totalVisible !== 1 ? 's' : '') + ' trouvé' + (totalVisible !== 1 ? 's' : '')
            : totalVisible + ' token' + (totalVisible !== 1 ? 's' : '') + ' found';
        }
      }
    };
    search.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runFilter, 120);
    });
    search.addEventListener('search', runFilter);
  }

  // ── Code blocks : label de langue + bouton copier accessible (ADR-041) ──────
  // Région live unique partagée pour annoncer « Copié ! » aux lecteurs d'écran.
  let copyLive = document.getElementById('agtc-copy-live');
  if (!copyLive) {
    copyLive = document.createElement('span');
    copyLive.id = 'agtc-copy-live';
    copyLive.setAttribute('role', 'status');
    copyLive.setAttribute('aria-live', 'polite');
    Object.assign(copyLive.style, {position:'absolute',width:'1px',height:'1px',padding:'0',margin:'-1px',overflow:'hidden',clip:'rect(0 0 0 0)',whiteSpace:'nowrap',border:'0'});
    document.body.appendChild(copyLive);
  }

  document.querySelectorAll('pre.code-block').forEach(pre => {
    const code = pre.querySelector('code');

    // Label de langue depuis la classe lang-xxx (CD5)
    const langClass = [...(code?.classList || [])].find(c => c.startsWith('lang-'));
    const lang = langClass ? langClass.slice(5) : '';
    if (lang) {
      const tag = document.createElement('span');
      tag.className = 'code-lang';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = lang;
      pre.classList.add('has-lang');
      pre.appendChild(tag);
    }

    // Bouton copier accessible (CD2/CD3/CD4)
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    const copyLabel = () => document.documentElement.getAttribute('data-lang') === 'en' ? 'Copy' : 'Copier';
    btn.textContent = copyLabel();
    btn.setAttribute('aria-label', (document.documentElement.getAttribute('data-lang') === 'en' ? 'Copy code' : 'Copier le code') + (lang ? ' (' + lang + ')' : ''));
    pre.appendChild(btn);
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText((code?.textContent || '').replace(/^\n+|\n+$/g, '')); }
      catch { return; }
      const copiedLabel = document.documentElement.getAttribute('data-lang') === 'en' ? 'Copied!' : 'Copié !';
      btn.textContent = copiedLabel;
      copyLive.textContent = copiedLabel;
      setTimeout(() => { btn.textContent = copyLabel(); copyLive.textContent = ''; }, 1600);
    });
  });

  // ── Bouton retour en haut ────────────────────────────────
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const threshold = document.documentElement.scrollHeight * 0.25;
    const onScroll = () => {
      const visible = window.scrollY > threshold;
      backToTop.hidden = !visible;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
