
document.addEventListener('DOMContentLoaded', () => {

  // Active nav links
  const p = window.location.pathname;
  document.querySelectorAll('.top-nav a').forEach(a => {
    const h = a.getAttribute('href') || '';
    if (h !== 'index.html' && p.includes(h.split('/').pop().replace('.html',''))) a.classList.add('active');
    if (p.endsWith('index.html') && h === 'index.html') a.classList.add('active');
  });
  document.querySelectorAll('.sidebar a').forEach(a => {
    if (p.endsWith(a.getAttribute('href')?.split('/').pop() || '')) a.classList.add('active');
  });

  // Token explorer tabs
  document.querySelectorAll('.exp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.exp-panel').forEach(pn => pn.classList.remove('active'));
      tab.classList.add('active');
      const el = document.getElementById(tab.dataset.target);
      if (el) el.classList.add('active');
    });
  });

  // Token search
  const search = document.getElementById('token-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('.token-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // Copy buttons on code blocks
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
