/*
 * Compara lo que el estudiante dijo o escribió con su línea real, palabra por palabra.
 * Ignora mayúsculas, tildes y puntuación, y perdona pequeñas diferencias.
 */
window.Compare = (function () {
  'use strict';

  function norm(w) {
    return w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  }
  function words(text) {
    return window.Parser.spoken(text).split(/\s+/).filter(w => norm(w));
  }

  function lev(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 3;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const row = [i];
      for (let j = 1; j <= n; j++) {
        row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = row;
    }
    return prev[n];
  }
  function same(a, b) {
    if (a === b) return true;
    const len = Math.max(a.length, b.length);
    if (len >= 8) return lev(a, b) <= 2;
    if (len >= 4) return lev(a, b) <= 1;
    return false;
  }

  function compare(target, said) {
    const T = words(target), S = words(said);
    const tn = T.map(norm), sn = S.map(norm);
    const n = tn.length, m = sn.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = same(tn[i], sn[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const ok = new Array(n).fill(false);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (same(tn[i], sn[j]) && dp[i][j] === dp[i + 1][j + 1] + 1) { ok[i] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    const hits = ok.filter(Boolean).length;
    return { words: T.map((w, k) => ({ w, ok: ok[k] })), score: n ? hits / n : 0, hits, total: n };
  }

  return { compare, words, norm };
})();
