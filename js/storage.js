/*
 * Guarda las obras, el progreso y los ajustes en el propio navegador (localStorage).
 * Nada se envía a ningún servidor.
 */
window.Store = (function () {
  'use strict';

  const P = 'aprendo.';
  function read(k, fallback) {
    try {
      const v = localStorage.getItem(P + k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function write(k, v) {
    try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }

  const navLang = (navigator.language || '').toLowerCase().startsWith('es') ? navigator.language : 'es-ES';

  return {
    list: () => read('scripts', []),
    get: id => read('scripts', []).find(s => s.id === id),
    save(script) {
      const all = read('scripts', []);
      script.updated = Date.now();
      const i = all.findIndex(s => s.id === script.id);
      if (i >= 0) all[i] = script; else all.unshift(script);
      return write('scripts', all);
    },
    remove(id) {
      write('scripts', read('scripts', []).filter(s => s.id !== id));
      try { localStorage.removeItem(P + 'progress.' + id); } catch (e) { /* nada */ }
    },
    progress: id => read('progress.' + id, {}),
    saveProgress: (id, p) => write('progress.' + id, p),
    settings: () => Object.assign(
      { rate: 1, lang: navLang, readDirections: false, mic: false, showMine: false },
      read('settings', {})
    ),
    saveSettings: s => write('settings', s),
    newId: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  };
})();
