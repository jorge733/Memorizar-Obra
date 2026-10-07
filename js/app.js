/*
 * Aprendo mi Papel — aplicación principal.
 * Vistas: inicio (subir libreto) → revisar (elegir personaje) → practicar (5 modos).
 */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');

  const PALETTE = ['#d9826f', '#7fa57b', '#6b9ac4', '#9c8fc4', '#e3a94f', '#c77fa7',
    '#5fa8a0', '#b88a5a', '#8a9a5b', '#d07a9a', '#6f7fc4', '#c49a3f'];
  const MASTER = 2; // nº de aciertos seguidos para considerar dominada una línea

  const state = {
    script: null, parsed: null, chosen: new Set(), colors: {}, scene: -1,
    mode: 'leer', progress: {}, settings: Store.settings(),
    leer: { hideMine: false, compact: false },
    ens: null, fade: { pos: 0, level: 1, revealed: new Set() },
    write: { pos: 0, result: null, hint: false, draft: '' },
    run: null,
  };

  // ---------- utilidades ----------
  function toast(msg, type) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'show ' + (type || '');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.className = ''; }, type === 'error' ? 6000 : 2800);
  }
  function busy(msg, frac) {
    const b = $('#busy');
    b.hidden = false;
    $('#busyMsg').textContent = msg || 'Un momento…';
    const bar = $('#busyBar');
    bar.style.width = frac == null ? '0' : Math.round(frac * 100) + '%';
    bar.parentElement.style.visibility = frac == null ? 'hidden' : 'visible';
  }
  function busyHide() { $('#busy').hidden = true; }
  function go(path) { location.hash = '#/' + path; }

  function hash(s) {
    let h = 5381;
    for (const ch of String(s)) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
    return (h >>> 0).toString(36);
  }

  const blocks = () => state.parsed.blocks;
  function colorFor(name) {
    const k = Parser.key(name || '');
    return state.colors[k] || state.colors[Parser.splitSpeakers(name || '')[0]] || '#999';
  }
  function isMine(speaker) {
    if (!speaker || !state.chosen.size) return false;
    if (state.chosen.has(Parser.key(speaker))) return true;
    return Parser.splitSpeakers(speaker).some(k => state.chosen.has(k));
  }
  const isMineBlock = i => blocks()[i].type === 'speech' && isMine(blocks()[i].speaker);
  function range() {
    const sc = state.parsed.scenes[state.scene];
    return sc ? { start: sc.start, end: sc.end } : { start: 0, end: blocks().length };
  }
  function myLines() {
    const { start, end } = range();
    const out = [];
    for (let i = start; i < end; i++) if (isMineBlock(i)) out.push(i);
    return out;
  }
  function lineKey(i) {
    const b = blocks()[i];
    return Parser.key(b.speaker) + '|' + hash(Parser.spoken(b.text));
  }
  const box = i => (state.progress[lineKey(i)] || {}).box || 0;
  function rate(i, grade) {
    const k = lineKey(i);
    const p = state.progress[k] || { box: 0, seen: 0 };
    if (grade === 2) p.box = Math.min(5, p.box + 1);
    else if (grade === 1) p.box = 1;
    else p.box = 0;
    p.seen++;
    p.last = Date.now();
    state.progress[k] = p;
    Store.saveProgress(state.script.id, state.progress);
    updateProgress();
  }
  function cueIndex(i) {
    const { start } = range();
    for (let j = i - 1; j >= start; j--) if (blocks()[j].type === 'speech') return j;
    return null;
  }
  function fmt(text) {
    return esc(text).replace(/(\([^)]*\)|\[[^\]]*\])/g, '<em class="inline-dir">$1</em>');
  }
  function tail(text, n) {
    const w = text.split(/\s+/);
    return w.length > n ? '… ' + w.slice(-n).join(' ') : text;
  }
  function initials(text) {
    return Parser.spoken(text).split(' ').map(w => {
      const m = /^([^\p{L}\p{N}]*)([\p{L}\p{N}])([\p{L}\p{N}]*)(.*)$/u.exec(w);
      return m ? m[1] + m[2] + m[4] : w;
    }).join(' ');
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function loadScript(s) {
    const changed = !state.script || state.script.id !== s.id || state.script.rawText !== s.rawText;
    state.script = s;
    if (changed) {
      state.parsed = Parser.parse(s.rawText);
      state.colors = {};
      state.parsed.characters.forEach((c, i) => { state.colors[c.key] = PALETTE[i % PALETTE.length]; });
      state.scene = -1;
      resetModes();
    }
    const valid = new Set(state.parsed.characters.map(c => c.key));
    state.chosen = new Set((s.chosen || []).filter(k => valid.has(k)));
    state.progress = Store.progress(s.id);
  }
  function resetModes() {
    state.ens = null;
    state.sceneResume = null;
    state.fade = { pos: 0, level: state.fade ? state.fade.level : 1, revealed: new Set() };
    state.write = { pos: 0, result: null, hint: false, draft: '' };
  }

  // ---------- router ----------
  function route() {
    stopScene();
    Voice.stop();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    if (parts[0] === 'l' && parts[1]) {
      importShared(parts[1]);
    } else if (parts[0] === 'obra' && parts[1]) {
      const s = Store.get(parts[1]);
      if (!s) { go(''); return; }
      loadScript(s);
      if (parts[2] === 'practicar' && state.chosen.size) renderPractice(parts[3]);
      else renderReview();
    } else {
      renderHome();
    }
    window.scrollTo(0, 0);
  }

  // ---------- INICIO ----------
  function renderHome() {
    state.script = null;
    const list = Store.list();
    app.innerHTML = `
      <section class="hero">
        <p class="eyebrow">Colegio Waldorf Michelangelo</p>
        <h1>Aprende tu papel <span>jugando con el libreto</span></h1>
        <p class="lead">Sube el texto de la obra, elige tu personaje y practica tus líneas con tarjetas,
        palabras que se desvanecen, escribiendo o ensayando la escena con voces.</p>
      </section>

      <section class="card upload">
        <label class="drop" id="drop" tabindex="0">
          <input type="file" id="file" accept=".pdf,.docx,.txt,.md,image/*" multiple hidden>
          <span class="drop-icon" aria-hidden="true">📜</span>
          <strong>Sube tu libreto</strong>
          <span>Arrastra aquí el archivo o toca para elegirlo</span>
          <small>PDF, Word (.docx), texto (.txt) o fotos de las páginas</small>
        </label>
        <div class="upload-alt">
          <button class="btn ghost" data-action="paste">📋 Pegar el texto</button>
          <button class="btn ghost" data-action="sample">✨ Probar con una obra de ejemplo</button>
        </div>
        <div id="pasteBox" class="paste-box" hidden>
          <input id="pasteTitle" class="input" placeholder="Título de la obra">
          <textarea id="pasteText" class="input" rows="10" placeholder="Pega aquí el texto completo de la obra…"></textarea>
          <div class="actions"><button class="btn primary" data-action="paste-save">Analizar el texto</button></div>
        </div>
      </section>

      ${list.length ? `
      <section>
        <h2 class="section-title">Mis obras</h2>
        <div class="library">${list.map(libraryCard).join('')}</div>
      </section>` : ''}

      <section class="how">
        <h2 class="section-title">¿Cómo funciona?</h2>
        <ol class="steps">
          <li><span>1</span><div><b>Sube el libreto.</b> La página lee el texto y encuentra a cada personaje y sus diálogos.</div></li>
          <li><span>2</span><div><b>Elige tu personaje.</b> Tus líneas quedan resaltadas en toda la obra.</div></li>
          <li><span>3</span><div><b>Practica a tu ritmo.</b> Cinco formas de ensayar y una barra que muestra cuánto dominas.</div></li>
        </ol>
        <p class="muted small">👩‍🏫 <b>Profes:</b> suban el libreto una vez, revisen que se vea bien y usen «Crear enlace para el curso». Los estudiantes solo abren el enlace.</p>
        <p class="muted small">🔒 El libreto se guarda solo en este dispositivo. No se envía a ningún servidor.</p>
      </section>`;

    const drop = $('#drop'), input = $('#file');
    input.addEventListener('change', () => handleFiles(input.files));
    drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
  }

  function libraryCard(s) {
    let pct = 0, role = '';
    try {
      const p = Parser.parse(s.rawText);
      const chosen = new Set(s.chosen || []);
      const prog = Store.progress(s.id);
      const mine = p.blocks.filter(b => b.type === 'speech' &&
        (chosen.has(Parser.key(b.speaker)) || Parser.splitSpeakers(b.speaker).some(k => chosen.has(k))));
      const done = mine.filter(b => ((prog[Parser.key(b.speaker) + '|' + hash(Parser.spoken(b.text))] || {}).box || 0) >= MASTER).length;
      pct = mine.length ? Math.round(done / mine.length * 100) : 0;
      role = p.characters.filter(c => chosen.has(c.key)).map(c => c.name).join(', ');
    } catch (e) { /* obra dañada: se muestra igual */ }
    return `
      <article class="lib-card">
        <a href="#/obra/${esc(s.id)}${role ? '/practicar/ensayar' : ''}" class="lib-main">
          <strong>${esc(s.title)}</strong>
          <span class="muted">${role ? 'Eres ' + esc(role) : 'Aún no elegiste personaje'}</span>
          ${role ? `<span class="bar"><span style="width:${pct}%"></span></span><small>${pct}% dominado</small>` : ''}
        </a>
        <button class="icon-btn" data-action="delete" data-id="${esc(s.id)}" title="Borrar obra" aria-label="Borrar obra">🗑️</button>
      </article>`;
  }

  async function handleFiles(files) {
    if (!files || !files.length) return;
    try {
      busy('Abriendo el libreto…');
      const { text, title } = await Extract.fromFiles(files, busy, async () => {
        busyHide();
        const ok = confirm('Este PDF parece ser una imagen escaneada, sin texto seleccionable.\n\n¿Quieres que la página intente reconocer el texto (OCR)? Puede tardar unos minutos y conviene revisar el resultado.');
        if (ok) busy('Preparando el reconocimiento de texto…');
        return ok;
      });
      if (!text || !text.trim()) throw new Error('No encontré texto en el archivo.');
      createScript(title, text);
    } catch (e) {
      console.error(e);
      toast(e.message || 'No se pudo leer el archivo.', 'error');
    } finally {
      busyHide();
    }
  }

  function createScript(title, text) {
    const s = { id: Store.newId(), title: title || 'Mi obra', rawText: text, chosen: [], created: Date.now() };
    if (!Store.save(s)) { toast('No hay espacio para guardar la obra en este navegador.', 'error'); return; }
    go('obra/' + s.id);
  }

  // ---------- ENLACES COMPARTIDOS ----------
  async function importShared(payload) {
    app.innerHTML = '';
    busy('Abriendo el libreto compartido…');
    try {
      const obj = await Share.decode(payload);
      const title = String(obj.t || 'Obra compartida').slice(0, 200);
      // Si ya se abrió este libreto antes, se actualiza (conservando personaje y progreso)
      let s = obj.id && Store.list().find(x => x.shareId === obj.id);
      if (s) {
        if (s.rawText !== obj.x) {
          s.rawText = obj.x;
          s.title = title;
          Store.save(s);
          toast('Libreto actualizado con la última versión ✨');
        }
      } else {
        s = { id: Store.newId(), shareId: obj.id || null, title, rawText: obj.x, chosen: [], shared: true, created: Date.now() };
        if (!Store.save(s)) throw new Error('No hay espacio para guardar la obra en este navegador.');
      }
      location.replace('#/obra/' + s.id + (s.chosen && s.chosen.length ? '/practicar/ensayar' : ''));
    } catch (e) {
      console.error(e);
      toast(e.message || 'No se pudo abrir el enlace.', 'error');
      location.replace('#/');
    } finally {
      busyHide();
    }
  }

  async function createShareLink() {
    const s = state.script;
    const raw = $('#raw');
    if (raw && raw.value !== s.rawText &&
      !confirm('Hiciste cambios en el texto que aún no analizaste. El enlace llevará la versión guardada. ¿Continuar?')) return;
    if (!s.shareId) { s.shareId = Store.newId(); Store.save(s); }
    const url = Share.link(await Share.encode({ v: 1, id: s.shareId, t: s.title, x: s.rawText }));
    const box = $('#shareBox');
    box.hidden = false;
    box.innerHTML = `
      <input id="shareUrl" class="input mono" readonly value="${esc(url)}" aria-label="Enlace para compartir">
      <div class="actions wrap">
        <button class="btn primary" data-action="share-copy">📋 Copiar enlace</button>
        ${navigator.share ? '<button class="btn ghost" data-action="share-native">📤 Enviar…</button>' : ''}
      </div>
      <p class="muted small">El enlace contiene la obra completa (${Math.max(1, Math.round(url.length / 1024))} KB), por eso es largo.
      Funciona por WhatsApp, correo o Google Classroom. Si corriges el libreto, crea un enlace nuevo y envíalo:
      quienes lo abran conservarán su personaje y su progreso.</p>`;
    $('#shareUrl').addEventListener('focus', e => e.target.select());
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const el = $('#shareUrl');
      el.focus();
      el.select();
      try { return document.execCommand('copy'); } catch (err) { return false; }
    }
  }

  // ---------- REVISAR / ELEGIR PERSONAJE ----------
  function renderReview() {
    const s = state.script, p = state.parsed;
    const chars = p.characters;
    app.innerHTML = `
      <nav class="crumbs"><a href="#/">← Mis obras</a></nav>
      ${s.shared && !state.chosen.size ? `
      <section class="card banner">
        <span class="big-emoji" aria-hidden="true">🎁</span>
        <div><b>¡Te compartieron el libreto de «${esc(s.title)}»!</b><br>
        <span class="muted">Ya está guardado en este dispositivo. Elige tu personaje para empezar.</span></div>
      </section>` : ''}
      <section class="card">
        <input class="title-input" id="title" value="${esc(s.title)}" aria-label="Título de la obra">
        <div class="stats">
          <span><b>${chars.length}</b> personajes</span>
          <span><b>${p.speeches}</b> parlamentos</span>
          <span><b>${p.scenes.length || 1}</b> ${p.scenes.length === 1 || !p.scenes.length ? 'escena' : 'escenas'}</span>
        </div>
        ${s.shared ? '' : `
        <div class="share">
          <div>
            <b>👩‍🏫 ¿Eres profesor o profesora?</b>
            <p class="muted small">Comparte este libreto con el curso: los estudiantes abren el enlace, la obra se carga sola y solo eligen su personaje. Revisa antes que los personajes se vean bien abajo.</p>
          </div>
          <button class="btn ghost" data-action="share-create">🔗 Crear enlace para el curso</button>
        </div>
        <div id="shareBox" class="share-box" hidden></div>`}
      </section>

      ${chars.length ? `
      <section class="card">
        <h2>¿Qué personaje eres?</h2>
        <p class="muted">Puedes elegir más de uno: por ejemplo si haces dos papeles, o para incluir las partes de «TODOS».</p>
        <div class="chips">${chars.map(c => `
          <button class="chip ${state.chosen.has(c.key) ? 'on' : ''}" data-action="toggle-char" data-key="${esc(c.key)}" style="--c:${colorFor(c.name)}">
            <span class="dot"></span>${esc(c.name)} <small>${c.groupOnly ? 'en grupo' : c.count + (c.count === 1 ? ' línea' : ' líneas')}</small>
          </button>`).join('')}
        </div>
        <div class="actions">
          <button class="btn primary big" id="startBtn" data-action="start" ${state.chosen.size ? '' : 'disabled'}>Empezar a aprender →</button>
        </div>
      </section>` : `
      <section class="card warn">
        <h2>No encontré personajes 🤔</h2>
        <p>Puede que el libreto tenga un formato poco común. Abajo puedes corregir el texto para que cada parlamento empiece con el nombre del personaje.</p>
      </section>`}

      <section class="card">
        <h2>Así leí el libreto</h2>
        <p class="muted">Revisa que los nombres y los diálogos estén bien separados. Tus líneas aparecen resaltadas.</p>
        <div class="script preview" id="preview">${blocksHtml(0, p.blocks.length)}</div>
      </section>

      <details class="card editor" ${chars.length ? '' : 'open'}>
        <summary>✏️ Corregir el texto del libreto</summary>
        <div class="format-help">
          <p>Para que la página reconozca bien los diálogos:</p>
          <pre>JUAN: Hola, ¿cómo estás?
MARÍA.— Muy bien, gracias.
(Juan se sienta junto a la ventana.)
ESCENA 2</pre>
          <p class="muted small">Cada parlamento empieza con el nombre del personaje (mejor en MAYÚSCULAS) seguido de «:» o «.—».
          Las acotaciones van entre paréntesis. Las escenas empiezan con ACTO, ESCENA o CUADRO y un número.</p>
        </div>
        <textarea id="raw" class="input mono" spellcheck="false" rows="16">${esc(s.rawText)}</textarea>
        <div class="actions"><button class="btn primary" data-action="reparse">Volver a analizar</button></div>
      </details>`;

    $('#title').addEventListener('change', e => {
      s.title = e.target.value.trim() || 'Mi obra';
      Store.save(s);
      toast('Título guardado');
    });
  }

  function blocksHtml(start, end, opts) {
    let html = '';
    for (let i = start; i < end; i++) html += blockHtml(blocks()[i], i, opts || {});
    return html;
  }
  function blockHtml(b, i, opts) {
    if (b.type === 'heading') return `<h3 class="b-heading" data-i="${i}">${esc(b.text)}</h3>`;
    if (b.type === 'direction') return `<p class="b-dir" data-i="${i}">${esc(b.text)}</p>`;
    const mine = isMine(b.speaker);
    const hide = opts.hide && mine;
    return `
      <div class="b-speech ${mine ? 'mine' : ''} ${hide ? 'veil' : ''}" data-i="${i}" style="--c:${colorFor(b.speaker)}">
        <div class="who">${esc(b.speaker)}${b.dir ? ` <em class="inline-dir">${esc(b.dir)}</em>` : ''}
          ${opts.listen ? `<button class="icon-btn small" data-action="say" data-i="${i}" title="Escuchar" aria-label="Escuchar">🔊</button>` : ''}</div>
        <div class="text">${fmt(b.text)}</div>
      </div>`;
  }

  // ---------- PRACTICAR ----------
  const MODES = {
    leer: { icon: '📖', label: 'Leer', render: renderLeer },
    ensayar: { icon: '🃏', label: 'Ensayar', render: renderEnsayar },
    desvanecer: { icon: '🌫️', label: 'Desvanecer', render: renderFade },
    escribir: { icon: '✍️', label: 'Escribir', render: renderWrite },
    escena: { icon: '🎙️', label: 'Escena con voces', render: renderScene },
  };

  function chosenNames() {
    return state.parsed.characters.filter(c => state.chosen.has(c.key)).map(c => c.name);
  }

  function renderPractice(mode) {
    state.mode = MODES[mode] ? mode : 'leer';
    const s = state.script, p = state.parsed;
    app.innerHTML = `
      <nav class="crumbs"><a href="#/">← Mis obras</a><a href="#/obra/${esc(s.id)}">Cambiar personaje</a></nav>
      <section class="card practice-head">
        <div class="ph-top">
          <div>
            <h1 class="ph-title">${esc(s.title)}</h1>
            <p class="ph-role">Eres ${chosenNames().map(n => `<span class="role" style="--c:${colorFor(n)}">${esc(n)}</span>`).join(' ')}</p>
          </div>
          <button class="icon-btn" data-action="settings" title="Ajustes" aria-label="Ajustes">⚙️</button>
        </div>
        ${p.scenes.length ? `
        <label class="scene-select">
          <span>Practicar</span>
          <select id="scene" class="input">
            <option value="-1">Toda la obra</option>
            ${p.scenes.map((sc, j) => {
              let n = 0;
              for (let i = sc.start; i < sc.end; i++) if (isMineBlock(i)) n++;
              return `<option value="${j}" ${state.scene === j ? 'selected' : ''}>${esc(sc.title)} — ${n ? n + (n === 1 ? ' línea tuya' : ' líneas tuyas') : 'no apareces'}</option>`;
            }).join('')}
          </select>
        </label>` : ''}
        <div class="progress" id="progress"></div>
      </section>
      <nav class="tabs" role="tablist">
        ${Object.entries(MODES).map(([k, m]) => `
          <a href="#/obra/${esc(s.id)}/practicar/${k}" class="tab ${k === state.mode ? 'on' : ''}" role="tab" aria-selected="${k === state.mode}">
            <span aria-hidden="true">${m.icon}</span>${m.label}</a>`).join('')}
      </nav>
      <section id="mode" class="mode"></section>`;

    const sel = $('#scene');
    if (sel) sel.addEventListener('change', () => {
      stopScene();
      state.scene = +sel.value;
      resetModes();
      updateProgress();
      MODES[state.mode].render();
    });
    updateProgress();
    MODES[state.mode].render();
  }

  function updateProgress() {
    const el = $('#progress');
    if (!el) return;
    const lines = myLines();
    const done = lines.filter(i => box(i) >= MASTER).length;
    const words = lines.reduce((a, i) => a + Parser.spoken(blocks()[i].text).split(' ').length, 0);
    const pct = lines.length ? Math.round(done / lines.length * 100) : 0;
    el.innerHTML = `
      <div class="bar big"><span style="width:${pct}%"></span></div>
      <small>Dominas <b>${done}</b> de <b>${lines.length}</b> ${lines.length === 1 ? 'línea' : 'líneas'}${state.scene >= 0 ? ' en esta escena' : ''} · ${words} palabras ${pct === 100 && lines.length ? '· ¡Te lo sabes todo! 🌟' : ''}</small>`;
  }

  const noLines = () => `<div class="empty card">No tienes líneas en esta parte de la obra. Elige otra escena arriba. 🌿</div>`;

  function cueHtml(i) {
    const c = cueIndex(i);
    const from = c == null ? range().start : c + 1;
    const dirs = blocks().slice(from, i).filter(b => b.type === 'direction' && !b.narrative).slice(-2);
    const dirsHtml = dirs.map(d => `<p class="b-dir small">${esc(d.text.length > 180 ? d.text.slice(0, 180) + '…' : d.text)}</p>`).join('');
    if (c == null) {
      return `<div class="cue first">🎬 Tú empiezas ${state.scene >= 0 ? 'esta escena' : 'la obra'}.</div>${dirsHtml}`;
    }
    const cb = blocks()[c];
    return `
      <div class="cue" style="--c:${colorFor(cb.speaker)}">
        <div class="who">${esc(cb.speaker)}${isMine(cb.speaker) ? ' (tú)' : ''} dice:</div>
        <div class="text">${fmt(tail(cb.text, 32))}</div>
      </div>${dirsHtml}`;
  }

  function diffHtml(result) {
    return result.words.map(w => `<span class="${w.ok ? 'w-ok' : 'w-miss'}">${esc(w.w)}</span>`).join(' ');
  }
  function scoreBadge(score) {
    const pct = Math.round(score * 100);
    const [cls, msg] = score >= 0.9 ? ['ok', '¡Excelente!'] : score >= 0.6 ? ['mid', '¡Casi!'] : ['bad', 'Sigue practicando'];
    return `<div class="score ${cls}"><b>${pct}%</b> ${msg}</div>`;
  }

  // ----- Modo LEER -----
  function renderLeer() {
    const el = $('#mode'), L = state.leer;
    const { start, end } = range();
    let idx = [];
    for (let i = start; i < end; i++) idx.push(i);
    if (L.compact) {
      const keep = new Set();
      idx.forEach(i => {
        if (isMineBlock(i)) { keep.add(i); const c = cueIndex(i); if (c != null) keep.add(c); }
      });
      idx = idx.filter(i => keep.has(i) || blocks()[i].type === 'heading');
    }
    el.innerHTML = `
      <p class="mode-intro">Lee la obra con calma. Tus líneas están resaltadas; toca 🔊 para escuchar cualquier parlamento.</p>
      <div class="toolbar">
        <label class="switch"><input type="checkbox" data-opt="hideMine" ${L.hideMine ? 'checked' : ''}><span></span>Tapar mis líneas</label>
        <label class="switch"><input type="checkbox" data-opt="compact" ${L.compact ? 'checked' : ''}><span></span>Solo mis líneas y sus entradas</label>
      </div>
      ${L.hideMine ? '<p class="muted small">Toca una línea tapada para verla.</p>' : ''}
      <div class="script">${idx.map(i => blockHtml(blocks()[i], i, { hide: L.hideMine, listen: Voice.canSpeak })).join('')}</div>`;
  }

  // ----- Modo ENSAYAR (tarjetas) -----
  function newEns(order) {
    let q = myLines();
    if (order === 'dificiles') q = [...q].sort((a, b) => (box(a) - box(b)) || a - b);
    if (order === 'azar') q = shuffle([...q]);
    return { order, queue: q, pos: 0, revealed: false, hint: 0, said: null, listening: false, live: '', res: { ok: 0, mid: 0, bad: 0 }, failed: [] };
  }

  function renderEnsayar() {
    const el = $('#mode');
    const E = state.ens = state.ens || newEns('orden');
    if (!myLines().length) { el.innerHTML = noLines(); return; }
    if (E.pos >= E.queue.length) { renderEnsSummary(); return; }
    const i = E.queue[E.pos], b = blocks()[i];
    const result = E.said != null ? Compare.compare(b.text, E.said) : null;
    const suggested = result ? (result.score >= 0.9 ? 2 : result.score >= 0.6 ? 1 : 0) : -1;
    const hintWords = Parser.spoken(b.text).split(' ');

    el.innerHTML = `
      <p class="mode-intro">Lee la entrada, di tu línea en voz alta (o en tu cabeza) y luego compruébala.</p>
      <div class="toolbar">
        <select id="ensOrder" class="input small" aria-label="Orden">
          <option value="orden" ${E.order === 'orden' ? 'selected' : ''}>En orden</option>
          <option value="dificiles" ${E.order === 'dificiles' ? 'selected' : ''}>Primero las que más me cuestan</option>
          <option value="azar" ${E.order === 'azar' ? 'selected' : ''}>Al azar</option>
        </select>
        <span class="counter">${E.pos + 1} / ${E.queue.length}</span>
      </div>
      <article class="card flash">
        ${cueHtml(i)}
        <div class="your-turn" style="--c:${colorFor(b.speaker)}">
          <div class="who">Tu turno · ${esc(b.speaker)}${b.dir ? ` <em class="inline-dir">${esc(b.dir)}</em>` : ''}</div>
          ${E.revealed
            ? `<div class="answer">${result ? diffHtml(result) : fmt(b.text)}</div>`
            : E.listening
              ? `<div class="answer listening"><span class="pulse"></span> ${esc(E.live) || 'Te escucho…'}</div>`
              : `<div class="answer veiled">${E.hint ? esc(hintWords.slice(0, E.hint * 3).join(' ')) + (E.hint * 3 < hintWords.length ? ' …' : '') : '¿Cómo sigue?'}</div>`}
          ${result ? scoreBadge(result.score) + `<p class="muted small">Oí: «${esc(E.said) || '…'}»</p>` : ''}
        </div>
        <div class="actions wrap">
          ${E.revealed ? `
            <p class="muted small full">¿Qué tal te salió?</p>
            <button class="btn rate bad ${suggested === 0 ? 'suggest' : ''}" data-action="ens-rate" data-g="0">😕 No me la sabía</button>
            <button class="btn rate mid ${suggested === 1 ? 'suggest' : ''}" data-action="ens-rate" data-g="1">🙂 Casi</button>
            <button class="btn rate ok ${suggested === 2 ? 'suggest' : ''}" data-action="ens-rate" data-g="2">😄 ¡Perfecta!</button>`
          : E.listening ? `
            <button class="btn primary" data-action="ens-stop-listen">✅ Ya terminé</button>`
          : `
            ${Voice.canSpeak ? '<button class="btn ghost" data-action="cue-say">🔊 Escuchar entrada</button>' : ''}
            ${Voice.canListen ? '<button class="btn ghost" data-action="ens-listen">🎙️ Decirla</button>' : ''}
            <button class="btn ghost" data-action="ens-hint">💡 Pista</button>
            <button class="btn primary" data-action="ens-reveal">👀 Ver mi texto</button>`}
        </div>
      </article>
      <p class="muted small center">Atajos: <kbd>Espacio</kbd> ver texto · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> calificar</p>`;

    $('#ensOrder').addEventListener('change', e => { state.ens = newEns(e.target.value); renderEnsayar(); });
  }

  function renderEnsSummary() {
    const E = state.ens;
    $('#mode').innerHTML = `
      <article class="card summary">
        <div class="big-emoji">${E.res.bad === 0 && E.res.mid === 0 ? '🌟' : '🌱'}</div>
        <h2>¡Terminaste la ronda!</h2>
        <div class="tally">
          <span class="ok">😄 ${E.res.ok} perfectas</span>
          <span class="mid">🙂 ${E.res.mid} casi</span>
          <span class="bad">😕 ${E.res.bad} por repasar</span>
        </div>
        <div class="actions wrap">
          ${E.failed.length ? `<button class="btn primary" data-action="ens-retry">Repasar las ${E.failed.length} que me costaron</button>` : ''}
          <button class="btn ${E.failed.length ? 'ghost' : 'primary'}" data-action="ens-again">Otra ronda</button>
        </div>
      </article>`;
  }

  async function ensListen() {
    const E = state.ens;
    const i = E.queue[E.pos];
    E.listening = true; E.live = '';
    renderEnsayar();
    try {
      const said = await Voice.listen({
        lang: state.settings.lang,
        onInterim: t => { E.live = t; const a = $('.answer.listening'); if (a) a.innerHTML = `<span class="pulse"></span> ${esc(t)}`; },
      });
      if (state.ens !== E || E.queue[E.pos] !== i) return;
      E.said = said; E.revealed = true;
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      E.listening = false;
      if (state.ens === E && state.mode === 'ensayar') renderEnsayar();
    }
  }

  // ----- Modo DESVANECER -----
  function seeded(seed) {
    let h = 0;
    for (const ch of seed) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0;
    return () => { h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) | 0; return ((h >>> 0) % 10000) / 10000; };
  }
  const FADE_LEVELS = ['Todo visible', 'Un poco oculto', 'Medio oculto', 'Solo iniciales', 'Todo oculto'];

  function renderFade() {
    const el = $('#mode'), F = state.fade, lines = myLines();
    if (!lines.length) { el.innerHTML = noLines(); return; }
    F.pos = Math.max(0, Math.min(F.pos, lines.length - 1));
    const i = lines[F.pos], b = blocks()[i];
    const rnd = seeded(lineKey(i));
    let w = 0;
    const html = b.text.split(/(\([^)]*\)|\[[^\]]*\]|\s+)/).map(tok => {
      if (!tok) return '';
      if (/^\s+$/.test(tok)) return tok.includes('\n') ? '<br>' : ' ';
      if (/^[(\[]/.test(tok)) return `<em class="inline-dir">${esc(tok)}</em>`;
      const m = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u.exec(tok);
      const [, pre, core, post] = m;
      if (!core) return esc(tok);
      const id = w++;
      const r = rnd();
      const hidden = F.level >= 3 || (F.level === 1 && r < 0.3) || (F.level === 2 && r < 0.6);
      if (!hidden || F.revealed.has(id)) {
        return `${esc(pre)}<span class="word ${F.revealed.has(id) ? 'peek' : ''}">${esc(core)}</span>${esc(post)}`;
      }
      const first = F.level === 4 ? '' : core[0];
      return `${esc(pre)}<button class="blank" data-action="peek" data-w="${id}" style="--len:${Math.max(2, core.length - (first ? 1 : 0))}ch" aria-label="Palabra oculta">${esc(first)}</button>${esc(post)}`;
    }).join('');

    el.innerHTML = `
      <p class="mode-intro">Lee tu línea varias veces mientras las palabras van desapareciendo. Toca un hueco si necesitas ver la palabra.</p>
      <div class="toolbar">
        <div class="stepper">
          <button class="icon-btn" data-action="fade-level" data-d="-1" ${F.level <= 0 ? 'disabled' : ''} aria-label="Mostrar más">−</button>
          <div class="level"><b>${FADE_LEVELS[F.level]}</b>
            <span class="dots">${FADE_LEVELS.map((_, k) => `<i class="${k <= F.level ? 'on' : ''}"></i>`).join('')}</span></div>
          <button class="icon-btn" data-action="fade-level" data-d="1" ${F.level >= 4 ? 'disabled' : ''} aria-label="Ocultar más">+</button>
        </div>
        <span class="counter">${F.pos + 1} / ${lines.length}</span>
      </div>
      <article class="card flash">
        ${cueHtml(i)}
        <div class="your-turn" style="--c:${colorFor(b.speaker)}">
          <div class="who">Tu turno · ${esc(b.speaker)}${b.dir ? ` <em class="inline-dir">${esc(b.dir)}</em>` : ''}</div>
          <div class="answer fade-text">${html}</div>
        </div>
        <div class="actions wrap">
          <button class="btn ghost" data-action="fade-nav" data-d="-1" ${F.pos === 0 ? 'disabled' : ''}>◀ Anterior</button>
          ${Voice.canSpeak ? '<button class="btn ghost" data-action="fade-say">🔊 Escuchar</button>' : ''}
          ${F.level < 4
            ? '<button class="btn primary" data-action="fade-level" data-d="1">Ocultar más ▲</button>'
            : '<button class="btn primary" data-action="fade-know">✅ ¡Me la sé!</button>'}
          <button class="btn ghost" data-action="fade-nav" data-d="1" ${F.pos >= lines.length - 1 ? 'disabled' : ''}>Siguiente ▶</button>
        </div>
      </article>
      <p class="muted small center">Atajos: <kbd>←</kbd> <kbd>→</kbd> cambiar línea · <kbd>↑</kbd> <kbd>↓</kbd> ocultar más o menos</p>`;
  }

  // ----- Modo ESCRIBIR -----
  function renderWrite() {
    const el = $('#mode'), W = state.write, lines = myLines();
    if (!lines.length) { el.innerHTML = noLines(); return; }
    W.pos = Math.max(0, Math.min(W.pos, lines.length - 1));
    const i = lines[W.pos], b = blocks()[i];
    el.innerHTML = `
      <p class="mode-intro">Escribe tu línea de memoria. No importan las tildes, las mayúsculas ni la puntuación.</p>
      <div class="toolbar"><span></span><span class="counter">${W.pos + 1} / ${lines.length}</span></div>
      <article class="card flash">
        ${cueHtml(i)}
        <div class="your-turn" style="--c:${colorFor(b.speaker)}">
          <div class="who">Tu turno · ${esc(b.speaker)}${b.dir ? ` <em class="inline-dir">${esc(b.dir)}</em>` : ''}</div>
          ${W.hint && !W.result ? `<p class="hint">💡 ${esc(initials(b.text))}</p>` : ''}
          ${W.result ? `
            <div class="answer">${diffHtml(W.result)}</div>
            ${scoreBadge(W.result.score)}
            <p class="muted small">Las palabras en rojo son las que faltaron o cambiaron.</p>`
          : `<textarea id="answer" class="input" rows="4" placeholder="Escribe aquí tu línea…" autocomplete="off" autocapitalize="sentences">${esc(W.draft)}</textarea>`}
        </div>
        <div class="actions wrap">
          ${W.result ? `
            <button class="btn ghost" data-action="write-retry">↺ Intentar de nuevo</button>
            <button class="btn primary" data-action="write-next" ${W.pos >= lines.length - 1 ? 'disabled' : ''}>Siguiente ▶</button>`
          : `
            <button class="btn ghost" data-action="write-nav" data-d="-1" ${W.pos === 0 ? 'disabled' : ''}>◀</button>
            <button class="btn ghost" data-action="write-hint">💡 Pista</button>
            <button class="btn primary" data-action="write-check">Comprobar</button>
            <button class="btn ghost" data-action="write-nav" data-d="1" ${W.pos >= lines.length - 1 ? 'disabled' : ''}>▶</button>`}
        </div>
      </article>
      <p class="muted small center">Atajo: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para comprobar</p>`;
    const ta = $('#answer');
    if (ta) {
      ta.addEventListener('input', () => { W.draft = ta.value; });
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); writeCheck(); } });
      if (window.matchMedia('(pointer: fine)').matches) ta.focus();
    }
  }
  function writeCheck() {
    const W = state.write, i = myLines()[W.pos];
    if (!W.draft.trim()) { toast('Escribe tu línea primero ✍️'); return; }
    W.result = Compare.compare(blocks()[i].text, W.draft);
    rate(i, W.result.score >= 0.9 ? 2 : W.result.score >= 0.6 ? 1 : 0);
    renderWrite();
  }

  // ----- Modo ESCENA CON VOCES -----
  function renderScene() {
    const el = $('#mode'), S = state.settings;
    const { start, end } = range();
    if (!Voice.canSpeak) {
      el.innerHTML = `<div class="card warn">Este navegador no puede leer en voz alta. Prueba con Chrome, Edge o Safari actualizados.</div>`;
      return;
    }
    if (!myLines().length) { el.innerHTML = noLines(); return; }
    const running = !!state.run;
    el.innerHTML = `
      <p class="mode-intro">La página lee las líneas de los demás personajes con voces distintas. Cuando llegue tu turno, di tu línea${Voice.canListen ? ' (con el micrófono te dice cuánto acertaste)' : ''}.
      Toca cualquier parlamento para empezar desde ahí.</p>
      <div class="toolbar wrap">
        <button class="btn primary" data-action="${running ? 'scene-stop' : 'scene-play'}">${running ? '⏸ Pausar' : '▶ Empezar'}</button>
        <label class="switch"><input type="checkbox" data-set="showMine" ${S.showMine ? 'checked' : ''}><span></span>Ver mis líneas</label>
        <label class="switch"><input type="checkbox" data-set="readDirections" ${S.readDirections ? 'checked' : ''}><span></span>Leer acotaciones</label>
        ${Voice.canListen ? `<label class="switch"><input type="checkbox" data-set="mic" ${S.mic ? 'checked' : ''}><span></span>Usar micrófono</label>` : ''}
      </div>
      <div class="script scene-script">${blocksHtml(start, end, { hide: !S.showMine })}</div>
      <div id="turnbar" class="turnbar" hidden></div>`;
    if (state.run) markCurrent(state.run.idx);
  }

  function markCurrent(i) {
    $$('.scene-script .current').forEach(x => x.classList.remove('current'));
    const node = $(`.scene-script [data-i="${i}"]`);
    if (node) {
      node.classList.add('current');
      node.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function stopScene() {
    if (!state.run) return;
    const r = state.run;
    state.run = null;
    r.cancel = true;
    Voice.stop();
    if (r.waiting) r.waiting();
    const tb = $('#turnbar');
    if (tb) tb.hidden = true;
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function runScene(from) {
    stopScene();
    const { end } = range();
    const run = { cancel: false, idx: from, waiting: null, resumeAt: from };
    state.run = run;
    renderScene();
    for (let i = from; i < end; i++) {
      if (run.cancel) return;
      run.idx = i;
      run.resumeAt = i;
      markCurrent(i);
      const b = blocks()[i];
      const S = state.settings;
      if (b.type === 'heading') await wait(700);
      else if (b.type === 'direction') {
        if (S.readDirections) await Voice.speak(b.text.replace(/[()[\]]/g, ''), { who: '__narrador', rate: S.rate, lang: S.lang });
        else await wait(300);
      } else if (isMine(b.speaker)) {
        await myTurn(i, run);
      } else {
        await Voice.speak(Parser.spoken(b.text), { who: b.speaker, rate: S.rate, lang: S.lang });
        await wait(150);
      }
    }
    if (run.cancel) return;
    state.run = null;
    $$('.scene-script .current').forEach(x => x.classList.remove('current'));
    renderScene();
    toast('¡Fin! 👏 Muy bien ensayado.');
  }

  function myTurn(i, run) {
    return new Promise(resolve => {
      run.waiting = resolve;
      run.turn = { i, said: null, result: null, listening: false, peek: false };
      drawTurn(run);
      if (state.settings.mic && Voice.canListen) turnListen(run);
    });
  }

  function drawTurn(run) {
    const tb = $('#turnbar');
    if (!tb || !run.turn) return;
    const t = run.turn, b = blocks()[t.i];
    tb.hidden = false;
    tb.style.setProperty('--c', colorFor(b.speaker));
    tb.innerHTML = `
      <div class="tb-head">🎭 Tu turno, <b>${esc(b.speaker)}</b></div>
      ${t.listening ? `<div class="tb-live"><span class="pulse"></span> ${esc(t.live || 'Te escucho…')}</div>` : ''}
      ${t.result ? `<div class="tb-result">${diffHtml(t.result)}</div>${scoreBadge(t.result.score)}` : ''}
      ${t.peek && !t.result ? `<div class="tb-result">${fmt(b.text)}</div>` : ''}
      <div class="actions wrap">
        ${t.listening ? '<button class="btn primary" data-action="turn-done-listen">✅ Ya terminé</button>' : `
          ${!t.peek && !t.result ? '<button class="btn ghost" data-action="turn-peek">👀 Ver mi línea</button>' : ''}
          <button class="btn ghost" data-action="turn-say">🔊 Escucharla</button>
          ${state.settings.mic && Voice.canListen ? '<button class="btn ghost" data-action="turn-listen">🎙️ Otra vez</button>' : ''}
          <button class="btn primary" data-action="turn-next">Seguir ▶</button>`}
      </div>`;
  }

  async function turnListen(run) {
    const t = run.turn;
    t.listening = true; t.live = ''; t.result = null;
    drawTurn(run);
    try {
      const said = await Voice.listen({
        lang: state.settings.lang,
        onInterim: s => { t.live = s; const l = $('.tb-live'); if (l) l.innerHTML = `<span class="pulse"></span> ${esc(s)}`; },
      });
      if (run.cancel || run.turn !== t) return;
      t.listening = false;
      t.result = Compare.compare(blocks()[t.i].text, said);
      rate(t.i, t.result.score >= 0.9 ? 2 : t.result.score >= 0.6 ? 1 : 0);
      drawTurn(run);
      if (t.result.score >= 0.6) { await wait(1600); if (!run.cancel && run.turn === t) finishTurn(run); }
    } catch (e) {
      t.listening = false;
      toast(e.message, 'error');
      drawTurn(run);
    }
  }

  function finishTurn(run) {
    Voice.stopListening();
    const tb = $('#turnbar');
    if (tb) tb.hidden = true;
    const node = $(`.scene-script [data-i="${run.turn.i}"]`);
    if (node) node.classList.remove('veil');
    run.turn = null;
    const w = run.waiting;
    run.waiting = null;
    if (w) w();
  }

  // ---------- ajustes ----------
  function openSettings() {
    const d = $('#settingsDialog'), S = state.settings;
    $('#setRate').value = S.rate;
    $('#setRateVal').textContent = S.rate.toFixed(1) + '×';
    $('#setLang').value = S.lang;
    if (!$('#setLang').value) $('#setLang').value = 'es-ES';
    $('#setDirections').checked = S.readDirections;
    d.showModal();
  }
  function bindSettings() {
    const d = $('#settingsDialog');
    $('#setRate').addEventListener('input', e => { $('#setRateVal').textContent = (+e.target.value).toFixed(1) + '×'; });
    d.addEventListener('close', () => {
      if (d.returnValue !== 'save') return;
      const S = state.settings;
      S.rate = +$('#setRate').value;
      S.lang = $('#setLang').value;
      S.readDirections = $('#setDirections').checked;
      Store.saveSettings(S);
      toast('Ajustes guardados');
      if (state.mode === 'escena' && $('#mode')) renderScene();
    });
    $('#setTest').addEventListener('click', () => {
      Voice.speak('Hola, así sonará la lectura de la obra.', { who: 'prueba', rate: +$('#setRate').value, lang: $('#setLang').value });
    });
    $('#resetProgress').addEventListener('click', () => {
      if (!state.script || !confirm('¿Borrar todo tu progreso en esta obra?')) return;
      state.progress = {};
      Store.saveProgress(state.script.id, {});
      d.close();
      updateProgress();
      toast('Progreso reiniciado');
    });
  }

  // ---------- acciones (clics) ----------
  const actions = {
    paste() { const b = $('#pasteBox'); b.hidden = !b.hidden; if (!b.hidden) $('#pasteText').focus(); },
    'paste-save'() {
      const text = $('#pasteText').value;
      if (!text.trim()) { toast('Pega primero el texto de la obra'); return; }
      createScript($('#pasteTitle').value.trim() || 'Mi obra', text);
    },
    sample() { createScript(window.SAMPLE_PLAY.title, window.SAMPLE_PLAY.text); },
    delete(el) {
      const s = Store.get(el.dataset.id);
      if (s && confirm(`¿Borrar «${s.title}» y tu progreso? No se puede deshacer.`)) { Store.remove(s.id); renderHome(); }
    },
    'toggle-char'(el) {
      const k = el.dataset.key;
      if (state.chosen.has(k)) state.chosen.delete(k); else state.chosen.add(k);
      el.classList.toggle('on', state.chosen.has(k));
      $('#startBtn').disabled = !state.chosen.size;
      state.script.chosen = [...state.chosen];
      Store.save(state.script);
      $('#preview').innerHTML = blocksHtml(0, blocks().length);
    },
    start() { go(`obra/${state.script.id}/practicar/ensayar`); },
    reparse() {
      const s = state.script;
      s.rawText = $('#raw').value;
      Store.save(s);
      loadScript(Object.assign({}, s));
      renderReview();
      toast(`Encontré ${state.parsed.characters.length} personajes`);
    },
    'share-create': createShareLink,
    async 'share-copy'() {
      toast(await copyText($('#shareUrl').value) ? '¡Enlace copiado! Pégalo en WhatsApp, el correo o Classroom.' : 'Selecciona el enlace y cópialo a mano.');
    },
    'share-native'() {
      navigator.share({
        title: state.script.title,
        text: `Libreto de «${state.script.title}» para aprender tu papel 🎭`,
        url: $('#shareUrl').value,
      }).catch(() => { /* el usuario canceló */ });
    },
    settings: openSettings,
    say(el) {
      const b = blocks()[+el.dataset.i];
      Voice.speak(Parser.spoken(b.text), { who: b.speaker, rate: state.settings.rate, lang: state.settings.lang });
    },
    'cue-say'() {
      const c = cueIndex(state.ens.queue[state.ens.pos]);
      if (c != null) Voice.speak(Parser.spoken(blocks()[c].text), { who: blocks()[c].speaker, rate: state.settings.rate, lang: state.settings.lang });
    },
    'ens-hint'() { state.ens.hint++; renderEnsayar(); },
    'ens-reveal'() { Voice.stop(); state.ens.revealed = true; renderEnsayar(); },
    'ens-listen'() { Voice.stop(); ensListen(); },
    'ens-stop-listen'() { Voice.finishListening(); },
    'ens-rate'(el) {
      const E = state.ens, g = +el.dataset.g, i = E.queue[E.pos];
      rate(i, g);
      E.res[['bad', 'mid', 'ok'][g]]++;
      if (g < 2) E.failed.push(i);
      Object.assign(E, { pos: E.pos + 1, revealed: false, hint: 0, said: null });
      renderEnsayar();
    },
    'ens-retry'() { const f = state.ens.failed; state.ens = newEns('orden'); state.ens.queue = f; renderEnsayar(); },
    'ens-again'() { state.ens = newEns(state.ens.order); renderEnsayar(); },
    peek(el) { state.fade.revealed.add(+el.dataset.w); renderFade(); },
    'fade-level'(el) {
      const F = state.fade;
      F.level = Math.max(0, Math.min(4, F.level + +el.dataset.d));
      F.revealed = new Set();
      renderFade();
    },
    'fade-nav'(el) { const F = state.fade; F.pos += +el.dataset.d; F.revealed = new Set(); F.level = Math.min(F.level, 1); renderFade(); },
    'fade-know'() {
      const F = state.fade, lines = myLines();
      rate(lines[F.pos], 2);
      if (F.pos < lines.length - 1) { F.pos++; F.level = 1; F.revealed = new Set(); toast('¡Bien! Siguiente línea 🌿'); }
      else toast('¡Llegaste a tu última línea! 🌟');
      renderFade();
    },
    'fade-say'() {
      const b = blocks()[myLines()[state.fade.pos]];
      Voice.speak(Parser.spoken(b.text), { who: b.speaker, rate: state.settings.rate, lang: state.settings.lang });
    },
    'write-check': writeCheck,
    'write-hint'() { state.write.hint = true; renderWrite(); },
    'write-retry'() { Object.assign(state.write, { result: null, draft: '', hint: false }); renderWrite(); },
    'write-next'() { Object.assign(state.write, { pos: state.write.pos + 1, result: null, draft: '', hint: false }); renderWrite(); },
    'write-nav'(el) { Object.assign(state.write, { pos: state.write.pos + +el.dataset.d, result: null, draft: '', hint: false }); renderWrite(); },
    'scene-play'() {
      const from = state.sceneResume != null ? state.sceneResume : range().start;
      state.sceneResume = null;
      runScene(from);
    },
    'scene-stop'() { const at = state.run && state.run.resumeAt; stopScene(); renderScene(); state.sceneResume = at; },
    'turn-peek'() { state.run.turn.peek = true; drawTurn(state.run); },
    'turn-say'() {
      const b = blocks()[state.run.turn.i];
      Voice.stopListening();
      Voice.speak(Parser.spoken(b.text), { who: b.speaker, rate: state.settings.rate, lang: state.settings.lang });
    },
    'turn-listen'() { Voice.stop(); turnListen(state.run); },
    'turn-done-listen'() { Voice.finishListening(); },
    'turn-next'() { Voice.stop(); finishTurn(state.run); },
  };
  app.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action]) {
      e.preventDefault();
      actions[el.dataset.action](el);
      return;
    }
    // tocar una línea tapada la destapa (modo Leer)
    const veil = e.target.closest('.b-speech.veil');
    if (veil && state.mode === 'leer') { veil.classList.toggle('veil'); veil.classList.add('peeked'); return; }
    // en el modo escena, tocar un bloque empieza desde ahí
    const blk = e.target.closest('.scene-script [data-i]');
    if (blk && !state.run && state.mode === 'escena') runScene(+blk.dataset.i);
  });

  app.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.opt) { state.leer[t.dataset.opt] = t.checked; renderLeer(); }
    if (t.dataset.set) {
      state.settings[t.dataset.set] = t.checked;
      Store.saveSettings(state.settings);
      if (t.dataset.set === 'showMine') {
        $$('.scene-script .b-speech.mine').forEach(n => n.classList.toggle('veil', !t.checked));
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey || $('#settingsDialog').open) return;
    if (!state.script || !$('#mode')) return;
    const click = sel => { const b = $(sel); if (b && !b.disabled) { e.preventDefault(); b.click(); } };
    if (state.mode === 'ensayar') {
      if (e.key === ' ') click('[data-action="ens-reveal"]');
      if (['1', '2', '3'].includes(e.key)) click(`[data-action="ens-rate"][data-g="${+e.key - 1}"]`);
    } else if (state.mode === 'desvanecer') {
      if (e.key === 'ArrowRight') click('[data-action="fade-nav"][data-d="1"]');
      if (e.key === 'ArrowLeft') click('[data-action="fade-nav"][data-d="-1"]');
      if (e.key === 'ArrowUp') click('.stepper [data-d="1"]');
      if (e.key === 'ArrowDown') click('.stepper [data-d="-1"]');
    } else if (state.mode === 'escena' && e.key === ' ' && state.run && state.run.turn) {
      click('[data-action="turn-next"]');
    }
  });

  window.addEventListener('hashchange', route);
  bindSettings();
  route();
})();
