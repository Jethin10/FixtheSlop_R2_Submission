(function (root) {
  'use strict';
  const Core = {
    money(cents, currency = 'USD') { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100); },
    number(value) { return new Intl.NumberFormat('en-US').format(value); },
    date(value) { const d = new Date(Number(value)); return Number.isNaN(d.getTime()) ? 'Unknown date' : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d); },
    escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
    email(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); },
    csv(rows) { return rows.map(row => row.map(v => { let s = String(v ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }).join(',')).join('\r\n'); },
    read(key, fallback) { try { const v = JSON.parse(localStorage.getItem('nexora.' + key)); return v ?? fallback; } catch { return fallback; } },
    save(key, value) { try { localStorage.setItem('nexora.' + key, JSON.stringify(value)); return true; } catch { return false; } },
    download(name, contents, type = 'text/plain') { const url = URL.createObjectURL(new Blob([contents], {type})); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  };
  root.Core = Core;
  if (typeof module !== 'undefined') module.exports = Core;
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = Core.read('theme', 'dark');
    document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
  }
})(typeof window !== 'undefined' ? window : globalThis);
