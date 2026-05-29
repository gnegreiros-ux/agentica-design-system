
document.addEventListener('DOMContentLoaded', () => {

  // ── Language toggle ─────────────────────────────────────
  const savedLang = localStorage.getItem('sda-lang') || 'fr';
  document.documentElement.setAttribute('data-lang', savedLang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === savedLang) btn.classList.add('active');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem('sda-lang', lang);
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
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
    if (h !== 'index.html' && p.includes(h.split('/').pop().replace('.html',''))) a.classList.add('active');
    if (p.endsWith('index.html') && h === 'index.html') a.classList.add('active');
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
        if (!h.id) h.id = slugify(h.textContent);
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
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

  // ── Copy buttons on code blocks ──────────────────────────
  document.querySelectorAll('pre.code-block').forEach(pre => {
    const btn = document.createElement('button');
    Object.assign(btn.style, {position:'absolute',top:'12px',right:'12px',background:'rgba(255,255,255,.1)',color:'#8b949e',border:'none',padding:'4px 10px',borderRadius:'4px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit'});
    btn.textContent = 'Copier';
    pre.style.position = 'relative';
    pre.appendChild(btn);
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.querySelector('code')?.textContent || '');
      btn.textContent = 'Copié !';
      setTimeout(() => btn.textContent = 'Copier', 1600);
    });
  });
});
