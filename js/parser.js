/*
 * Analizador de libretos.
 * Convierte el texto plano de una obra en bloques: parlamentos (personaje + texto),
 * acotaciones y encabezados de escena. Reconoce los formatos más habituales:
 *   JUAN: Hola.          JUAN.— Hola.        JUAN. Hola.        JUAN — Hola.
 *   JUAN                 (nombre solo en una línea y el texto debajo)
 *   Hola.
 */
window.Parser = (function () {
  'use strict';

  const U = 'A-ZÁÉÍÓÚÜÑÀÈÌÒÙÇ';
  const L = U + 'a-záéíóúüñàèìòùç';

  const ORD = '([0-9]+|[IVXLC]+|primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa]|sext[oa]|s[eé]ptim[oa]|octav[oa]|noven[oa]|d[eé]cim[oa]|[uú]nic[oa]|final)';
  const SCENE_RE = new RegExp(`^(acto|escena|cuadro|jornada|parte)\\s+${ORD}\\b`, 'i');
  const SCENE_RE2 = new RegExp(`^${ORD}\\s+(acto|escena|cuadro|jornada|parte)\\b`, 'i');
  const SCENE_WORD = /^(pr[oó]logo|ep[ií]logo|intermedio|entreacto)\b/i;
  const ACT_RE = /\bacto\b|\bjornada\b/i;
  const END_RE = /^(tel[oó]n|fin|oscuro|apag[oó]n)\b/i;

  const STOP = new Set(['ACTO', 'ESCENA', 'CUADRO', 'PROLOGO', 'EPILOGO', 'JORNADA', 'INTERMEDIO', 'ENTREACTO',
    'TELON', 'FIN', 'OSCURO', 'APAGON', 'MUTIS', 'NOTA', 'NOTAS', 'PERSONAJES', 'REPARTO', 'DECORADO',
    'ESCENOGRAFIA', 'VESTUARIO', 'PAGINA', 'PAG', 'INDICE', 'ACOTACION', 'ACOTACIONES', 'CAPITULO', 'HTTP', 'HTTPS', 'WWW']);
  const CONNECT = new Set(['y', 'e', 'de', 'del', 'la', 'el', 'los', 'las', 'san']);

  const N = `([${U}][${L}0-9'’ .&,/]{0,40}?)`;
  const P = `\\s*(\\([^)]*\\)|\\[[^\\]]*\\])?\\s*`;
  const RX = {
    colon: new RegExp(`^${N}${P}:\\s*(.*)$`),
    dotdash: new RegExp(`^${N}${P}\\.\\s*[-–—]+\\s*(.*)$`),
    dash: new RegExp(`^${N}${P}[-–—]+\\s*(.*)$`),
    alone: new RegExp(`^${N}${P}$`),
  };

  function key(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
      .replace(/[^A-Z0-9]+/g, ' ').trim();
  }
  function letters(s) { return s.replace(/[^A-Za-zÀ-ÿ]/g, ''); }
  function isCaps(s) {
    const l = letters(s);
    return l.length >= 2 && l === l.toUpperCase() && l !== l.toLowerCase();
  }
  function cleanName(n) { return n.replace(/[\s.,;:]+$/, '').replace(/\s+/g, ' ').trim(); }

  function validName(raw, needCaps) {
    const n = cleanName(raw);
    if (n.length < 2 || n.length > 36 || letters(n).length < 2) return null;
    const words = n.split(' ');
    if (words.length > 5) return null;
    const k = key(n);
    if (!k || STOP.has(k.split(' ')[0])) return null;
    if (/^[IVXLCDM]+$/.test(k) || /^\d/.test(k)) return null;
    if (isHeading(n) || (END_RE.test(n) && words.length === 1)) return null;
    if (needCaps) return isCaps(n) ? n : null;
    if (!/^[A-ZÁÉÍÓÚÜÑ]/.test(n)) return null;
    for (const w of words) {
      const ok = /^[A-ZÁÉÍÓÚÜÑ0-9]/.test(w) || (CONNECT.has(w) && w === w.toLowerCase());
      if (!ok) return null;
    }
    return n;
  }

  function isHeading(line) {
    if (line.length > 70) return false;
    if (SCENE_RE.test(line) || SCENE_RE2.test(line)) return true;
    return line.length <= 40 && SCENE_WORD.test(line);
  }

  const DOT_PREFIX = new RegExp(`^${N}${P}$`);
  function scanDot(line) {
    let best = null;
    const re = /\.\s+/g;
    let m;
    while ((m = re.exec(line))) {
      const pre = line.slice(0, m.index);
      if (pre.length > 40) break;
      const pm = DOT_PREFIX.exec(pre);
      if (!pm) continue;
      const n = validName(pm[1], true);
      if (n) best = { name: n, dir: pm[2] || '', text: line.slice(m.index + m[0].length), type: 'dot', strong: true };
    }
    return best;
  }

  function candidate(line) {
    let m;
    if ((m = RX.colon.exec(line))) {
      const n = validName(m[1], false);
      if (n) return { name: n, dir: m[2] || '', text: m[3], type: 'colon', strong: isCaps(n) };
    }
    if ((m = RX.dotdash.exec(line))) {
      const n = validName(m[1], false);
      if (n) return { name: n, dir: m[2] || '', text: m[3], type: 'dotdash', strong: true };
    }
    if ((m = RX.dash.exec(line))) {
      const n = validName(m[1], true);
      if (n) return { name: n, dir: m[2] || '', text: m[3], type: 'dash', strong: true };
    }
    const d = scanDot(line);
    if (d) return d;
    if (line.length <= 50 && (m = RX.alone.exec(line))) {
      const n = validName(m[1], true);
      if (n) return { name: n, dir: m[2] || '', text: '', type: 'alone', strong: false };
    }
    return null;
  }

  function joinText(a, b) {
    if (/[^-]-$/.test(a) && /^[a-záéíóúüñ]/.test(b)) return a.slice(0, -1) + b;
    return a + '\n' + b;
  }

  /** Texto que realmente se dice: sin acotaciones entre paréntesis o corchetes. */
  function spoken(text) {
    return String(text || '').replace(/\([^)]*\)|\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /** "JUAN Y MARÍA" → ["JUAN", "MARIA"] (claves normalizadas). */
  function splitSpeakers(name) {
    return key(name).split(/\s+(?:Y|E)\s+|\s*[,/&]\s*/).map(s => s.trim()).filter(Boolean);
  }

  function parse(raw) {
    const lines = String(raw || '')
      .replace(/\r\n?/g, '\n').replace(/[\t ]/g, ' ').replace(/[​﻿]/g, '')
      .split('\n').map(l => l.trim());

    // 1ª pasada: candidatos a nombre de personaje
    const cands = lines.map(l => (l && !isHeading(l) && !/^[(\[]/.test(l)) ? candidate(l) : null);
    const typeCount = {};
    cands.forEach(c => { if (c) typeCount[c.type] = (typeCount[c.type] || 0) + 1; });
    const max = Math.max(0, ...Object.values(typeCount));
    const okTypes = new Set(Object.keys(typeCount).filter(t => typeCount[t] >= Math.max(2, max * 0.2)));
    if (!okTypes.size) Object.keys(typeCount).forEach(t => okTypes.add(t));

    // Si el libreto usa sobre todo "nombre solo en una línea", basta con que aparezca una vez
    const aloneDominant = typeCount.alone === max && max >= 3;
    const count = {}, strong = {}, forms = {};
    cands.forEach(c => {
      if (!c || !okTypes.has(c.type)) return;
      const k = key(c.name);
      count[k] = (count[k] || 0) + 1;
      if (c.strong || (aloneDominant && c.type === 'alone' && c.name.split(' ').length <= 3)) strong[k] = true;
      (forms[k] = forms[k] || {})[c.name] = (forms[k][c.name] || 0) + 1;
    });
    const accepted = k => count[k] >= 2 || strong[k];
    const display = {};
    Object.keys(forms).forEach(k => {
      const best = Object.entries(forms[k]).sort((a, b) => b[1] - a[1])[0][0];
      display[k] = best.toUpperCase();
    });

    // 2ª pasada: bloques
    const blocks = [];
    let cur = null, resume = null, openDir = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (openDir) {
        if (line) openDir.text += '\n' + line;
        if (/[)\]]/.test(line)) openDir = null;
        continue;
      }
      if (!line) continue;
      if (/^\d{1,4}$/.test(line)) continue; // números de página sueltos

      if (isHeading(line)) {
        blocks.push({ type: 'heading', text: line });
        cur = resume = null;
        continue;
      }
      if (END_RE.test(line) && line.length <= 25) {
        blocks.push({ type: 'direction', text: line });
        cur = resume = null;
        continue;
      }
      if (/^[(\[]/.test(line)) {
        const closed = /[)\]]\s*\S*$/.test(line) || /[)\]]/.test(line);
        if (cur && !spoken(cur.text) && !cur.dir && closed && line.length < 80) {
          cur.dir = line; // "JUAN\n(triste)\nHola"
          continue;
        }
        const d = { type: 'direction', text: line };
        blocks.push(d);
        if (!closed) openDir = d;
        if (cur) { resume = cur.speaker; cur = null; }
        continue;
      }
      const c = cands[i];
      if (c && okTypes.has(c.type) && accepted(key(c.name))) {
        cur = { type: 'speech', speaker: display[key(c.name)], dir: c.dir, text: c.text.trim() };
        blocks.push(cur);
        resume = null;
        continue;
      }
      if (cur) {
        cur.text = cur.text ? joinText(cur.text, line) : line;
      } else if (resume) {
        cur = { type: 'speech', speaker: resume, dir: '', text: line };
        blocks.push(cur);
        resume = null;
      } else {
        const last = blocks[blocks.length - 1];
        if (last && last.type === 'direction' && last.narrative) last.text += '\n' + line;
        else blocks.push({ type: 'direction', text: line, narrative: true });
      }
    }

    const clean = blocks.filter(b => b.type !== 'speech' || spoken(b.text));

    // Personajes
    const chars = {};
    clean.forEach(b => {
      if (b.type !== 'speech') return;
      const k = key(b.speaker);
      const c = chars[k] = chars[k] || { key: k, name: b.speaker, count: 0, words: 0 };
      c.count++;
      c.words += spoken(b.text).split(' ').filter(Boolean).length;
    });
    // Los personajes que solo aparecen dentro de grupos ("JUAN Y MARÍA") también se listan
    Object.values(chars).forEach(c => {
      const parts = splitSpeakers(c.name);
      if (parts.length > 1) parts.forEach(p => {
        if (!chars[p] && p.length > 1) chars[p] = { key: p, name: p, count: 0, words: 0, groupOnly: true };
      });
    });
    const characters = Object.values(chars).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    // Escenas
    const scenes = [];
    let act = '';
    clean.forEach((b, i) => {
      if (b.type !== 'heading') return;
      const prev = scenes[scenes.length - 1];
      const empty = prev && !clean.slice(prev.start, i).some(x => x.type === 'speech');
      if (ACT_RE.test(b.text) && !/escena|cuadro/i.test(b.text)) act = b.text;
      if (empty) { prev.title += ' · ' + b.text; return; }
      const title = act && !ACT_RE.test(b.text) ? `${act} · ${b.text}` : b.text;
      scenes.push({ title, start: i });
    });
    if (scenes.length && clean.slice(0, scenes[0].start).some(b => b.type === 'speech')) {
      scenes.unshift({ title: 'Inicio', start: 0 });
    }
    scenes.forEach((s, j) => { s.end = j + 1 < scenes.length ? scenes[j + 1].start : clean.length; });

    return {
      blocks: clean,
      characters,
      scenes,
      speeches: clean.filter(b => b.type === 'speech').length,
    };
  }

  return { parse, spoken, key, splitSpeakers };
})();
