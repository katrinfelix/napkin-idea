/* ================================================
   📐 UX ARCHITECT — Theme Manager
   ================================================ */
class ThemeManager {
  constructor() {
    this.current = localStorage.getItem('napkin-theme') || 'dark';
    this.apply(this.current);
    this.btn = document.getElementById('themeBtn');
    if (this.btn) this.btn.addEventListener('click', () => this.toggle());
  }

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('napkin-theme', theme);
    this.current = theme;
    if (this.btn) this.btn.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  toggle() {
    this.apply(this.current === 'dark' ? 'light' : 'dark');
  }
}

document.addEventListener('DOMContentLoaded', () => new ThemeManager());
