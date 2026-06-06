
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
    });
  });

  // ── Mobile menu ──────────────────────────────────────────
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

  // ── Active nav links ─────────────────────────────────────
  const p = window.location.pathname;
  document.querySelectorAll('.top-nav a').forEach(a => {
    const h = a.getAttribute('href') || '';
    // Strip leading ../ to get the logical path segments
    const parts = h.split('/').filter(s => s !== '..' && s !== '.');
    const hFile = parts[parts.length - 1] || '';          // e.g. 'color.html'
    const hDir  = parts.length > 1 ? parts[parts.length - 2] : ''; // e.g. 'foundations'
    let active = false;
    if (hDir) {
      // Section link (foundations/color.html, components/index.html, …)
      // Active on any page within that section directory
      active = p.includes('/' + hDir + '/');
    } else if (hFile === 'index.html') {
      // Accueil — only on the root homepage
      active = p === '/' || p.endsWith('/index.html') && !p.includes('/foundations/') && !p.includes('/components/') && !p.includes('/tokens/') && !p.includes('/decisions/') && !p.includes('/agents/');
    } else {
      // Top-level page like get-started.html
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
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('.token-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
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
    btn.textContent = 'Copier';
    btn.setAttribute('aria-label', 'Copier le code' + (lang ? ' (' + lang + ')' : ''));
    pre.appendChild(btn);
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText((code?.textContent || '').replace(/^\n+|\n+$/g, '')); }
      catch { return; }
      btn.textContent = 'Copié !';
      copyLive.textContent = 'Copié !';
      setTimeout(() => { btn.textContent = 'Copier'; copyLive.textContent = ''; }, 1600);
    });
  });
});
