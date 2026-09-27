'use strict';
let noticeTimer;
function toast(message) {
  const el = document.getElementById('notice');
  el.textContent = message; el.hidden = false;
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => el.hidden = true, 4500);
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  Core.save('theme', next); updateThemeButton();
}
function updateThemeButton() {
  const button = document.querySelector('.theme-toggle');
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  button.textContent = next === 'light' ? 'Light mode' : 'Dark mode';
  button.setAttribute('aria-label', `Switch to ${next} theme`);
}
function privacyChoices() {
  let panel = document.getElementById('privacy-panel');
  if (!panel) {
    panel = document.createElement('section'); panel.id = 'privacy-panel'; panel.className = 'cookie'; panel.setAttribute('aria-label', 'Privacy preferences');
    panel.innerHTML = '<h3>Your browser, your choice</h3><p>This demo has no analytics or tracking. Theme and demo content are stored locally.</p><div class="button-row"><button type="button" class="primary" data-privacy="accepted">Keep preferences</button><button type="button" class="secondary" data-privacy="dismissed">Dismiss</button></div>';
    document.body.appendChild(panel);
    panel.addEventListener('click', e => { const button = e.target.closest('[data-privacy]'); if (button) { Core.save('privacy', button.dataset.privacy); panel.hidden = true; } });
  }
  panel.hidden = false;
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme); updateThemeButton();
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); nav.classList.toggle('is-open', open); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); menu.focus(); } });
  const dialog = document.getElementById('newsletter-dialog');
  document.getElementById('newsletter-open').addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  document.getElementById('newsletter-form').addEventListener('submit', e => {
    e.preventDefault(); const saved = Core.save('newsletter', document.getElementById('newsletter-email').value.trim());
    document.getElementById('newsletter-result').textContent = saved ? 'Interest saved on this device. No email was sent.' : 'Storage is unavailable. Your interest could not be saved.';
  });
  document.getElementById('privacy-open').addEventListener('click', privacyChoices);
  if (!Core.read('privacy', false)) privacyChoices();
});
