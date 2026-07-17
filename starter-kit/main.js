import '@agentica-ds/tokens/css';
import '@agentica-ds/tokens/css/dark';
import '@agentica-ds/components';

const toggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  toggle.textContent = theme === 'dark' ? 'Passer en clair' : 'Passer en sombre';
  localStorage.setItem('agentica-theme', theme);
}

toggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('agentica-theme') || 'light');
