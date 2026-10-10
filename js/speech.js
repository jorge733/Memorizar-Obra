/*
 * Voz: lectura en voz alta y reconocimiento de voz.
 * Usa las voces más naturales que tenga el dispositivo (las "Natural" de Edge,
 * las de Google en Chrome, las "mejoradas" de Apple) y da a cada personaje una
 * voz distinta en lugar de deformar el tono, que es lo que las hace sonar robóticas.
 */
window.Voice = (function () {
  'use strict';

  const synth = window.speechSynthesis;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voices = [];
  const listeners = [];

  function loadVoices() {
    voices = synth ? synth.getVoices() : [];
    recast();
    listeners.forEach(fn => fn());
  }

  const NARRATOR = '__narrador';
  const keyOf = who => (who === NARRATOR ? NARRATOR : window.Parser.key(who || ''));

  const REGION = {
    ES: 'España', MX: 'México', AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Perú', US: 'EE. UU.',
    VE: 'Venezuela', UY: 'Uruguay', CU: 'Cuba', BO: 'Bolivia', EC: 'Ecuador', CR: 'Costa Rica',
    DO: 'R. Dominicana', GT: 'Guatemala', HN: 'Honduras', NI: 'Nicaragua', PA: 'Panamá', PY: 'Paraguay',
    PR: 'Puerto Rico', SV: 'El Salvador', GQ: 'Guinea Ecuatorial', '419': 'Latinoamérica',
  };

  /** 3 = natural/neuronal, 2 = buena (Google, en red), 1 = básica, 0 = robótica */
  function quality(v) {
    const n = v.name;
    if (/natural|neural|online|premium|enhanced|mejorad|siri/i.test(n)) return 3;
    if (/google/i.test(n) || v.localService === false) return 2;
    if (/espeak|desktop/i.test(n)) return 0;
    return 1;
  }
  const sameLang = (v, lang) => v.lang.toLowerCase().replace('_', '-') === String(lang).toLowerCase();

  function ranked(lang) {
    const seen = new Set();
    return voices
      .filter(v => /^es\b|^es[-_]/i.test(v.lang) && !seen.has(v.name) && seen.add(v.name))
      .sort((a, b) => (quality(b) - quality(a)) || (sameLang(b, lang) - sameLang(a, lang)) || a.name.localeCompare(b.name));
  }

  function label(v) {
    const name = v.name
      .replace(/^(Microsoft|Google|Apple)\s+/i, '')
      .replace(/\s*Online\s*\(Natural\)/i, '')
      .replace(/\s*[-–]\s*(Spanish|español|espagnol).*$/i, '')
      .replace(/\s*\((mejorada|enhanced|premium)\)/i, '')
      .trim();
    const region = REGION[(v.lang.split(/[-_]/)[1] || '').toUpperCase()] || v.lang;
    return `${name || 'Voz'} · ${region}${quality(v) === 3 ? ' ★' : ''}`;
  }

  // ----- Género (para no dar una voz de hombre a ANA ni de mujer a PEDRO) -----
  const FEMALE_VOICES = new Set(('elvira ximena abril estrella irene laia lia triana vera arabella catalina dalia ' +
    'beatriz candela carlota larissa marina nuria renata elena salome camila paola valentina sofia karina ramona ' +
    'tania andrea belkys teresa lorena margarita maria paloma yolanda helena laura monica paulina marisol angelica ' +
    'isabela francisca sabina elsa lupe penelope conchita lucia mia emma luciana martina violeta').split(' '));
  const MALE_VOICES = new Set(('alvaro arnau dario elias esteban gerardo jorge lorenzo tomas mateo alonso emilio ' +
    'gonzalo federico andres alex carlos luciano liberto yago nil saul teo pablo diego juan rodrigo luis mario ' +
    'sebastian manuel roberto victor cecilio pelayo cristhian javier rafael enrique marcelo enrico miguel ' +
    'antonio eddy reed rocko grandpa').split(' '));
  const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function voiceGender(v) {
    if (/\bfemale\b|mujer/i.test(v.name)) return 'f';
    if (/\bmale\b|hombre/i.test(v.name)) return 'm';
    const first = plain(v.name.replace(/^(Microsoft|Google|Apple)\s+/i, '')).split(/[\s(-]/)[0];
    if (FEMALE_VOICES.has(first) || /^google espanol/.test(plain(v.name))) return 'f';
    if (MALE_VOICES.has(first)) return 'm';
    return null;
  }

  const FEMALE_NAMES = new Set(('carmen isabel raquel mercedes ines luz sol pilar rocio consuelo dolores beatriz ' +
    'mama abuela reina princesa madre hija hermana nina doncella hada bruja senora dama esther ruth miriam ' +
    'abigail noemi raquel belen azucena flor estrella nieve primavera').split(' '));
  const MALE_NAMES = new Set(('poeta papa profeta guardia cura rey principe padre hijo hermano nino senor ' +
    'caballero mago brujo duende abuelo jose luca joshua elias tobias nicolas jonas matias barrabas judas ' +
    'herodes').split(' '));
  const NEUTRAL = /^(todos|todas|coro|grupo|varios|voces|voz|pueblo|ninos|ninas|publico)$/;

  /** Adivina el género de un personaje por su nombre: 'f', 'm' o null (no se sabe / grupo). */
  function characterGender(name) {
    const words = plain(name).replace(/[^a-zñ ]/g, ' ').split(/\s+/).filter(Boolean);
    if (!words.length || words.some(w => w === 'y' || w === 'e') || NEUTRAL.test(words[0])) return null;
    if (/^(la|las|una|dona|sra|senora|sor|santa)$/.test(words[0])) return 'f';
    if (/^(el|los|un|don|sr|senor|fray|san|santo)$/.test(words[0])) return 'm';
    const w = words.filter(x => !/^(de|del|la|el|los|las)$/.test(x))[0] || words[0];
    if (FEMALE_NAMES.has(w)) return 'f';
    if (MALE_NAMES.has(w)) return 'm';
    if (/(a|ora|triz|isa|esa)$/.test(w)) return 'f';
    if (/(o|or|on|el|al|ez|es|is|us|an|in|ar|er|ir)$/.test(w)) return 'm';
    return null;
  }

  // Reparto: cada personaje recibe una voz distinta (las mejores para los papeles más largos)
  let cast = { names: [], overrides: {}, lang: 'es-ES' };
  let castMap = {};
  function setCast(names, overrides, lang) {
    cast = { names: names || [], overrides: overrides || {}, lang: lang || 'es-ES' };
    recast();
  }
  function recast() {
    castMap = {};
    const vs = ranked(cast.lang);
    if (!vs.length) return;
    const best = quality(vs[0]);
    let pool = vs.filter(v => quality(v) >= Math.min(best, 2));
    // Primero las voces con el acento elegido
    const local = pool.filter(v => sameLang(v, cast.lang));
    pool = [...local, ...pool.filter(v => !local.includes(v))];
    const taken = new Set(Object.values(cast.overrides));
    const free = pool.filter(v => !taken.has(v.voiceURI));
    const base = free.length ? free : pool;
    const used = new Map();

    const pick = gender => {
      let cands = base;
      if (gender) {
        const exact = base.filter(v => voiceGender(v) === gender);
        const unknown = base.filter(v => !voiceGender(v));
        cands = exact.length || unknown.length ? [...exact, ...unknown] : base;
      }
      // La voz menos usada; a igualdad, la de mejor calidad (ya vienen ordenadas)
      let voice = cands[0], n = Infinity;
      for (const v of cands) {
        const c = used.get(v.voiceURI) || 0;
        if (c < n) { n = c; voice = v; }
      }
      used.set(voice.voiceURI, n + 1);
      // Solo si hay más personajes que voces se varía el tono, y con suavidad
      return { voice, pitch: [1, 1.08, 0.93, 1.15, 0.87][n % 5] };
    };

    [...cast.names, NARRATOR].forEach(name => {
      const key = keyOf(name);
      const chosen = cast.overrides[key] && vs.find(v => v.voiceURI === cast.overrides[key]);
      castMap[key] = chosen ? { voice: chosen, pitch: 1 } : pick(name === NARRATOR ? null : characterGender(name));
    });
  }

  function voiceFor(who, lang) {
    const hit = castMap[keyOf(who)];
    if (hit) return hit;
    const vs = ranked(lang);
    if (!vs.length) return { voice: null, pitch: 1 };
    let h = 5381;
    for (const ch of String(who)) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
    const good = vs.filter(v => quality(v) >= quality(vs[0]) - 1);
    return { voice: good[Math.abs(h) % good.length], pitch: 1 };
  }

  function listVoices(lang) {
    return ranked(lang).map(v => ({ uri: v.voiceURI, label: label(v), quality: quality(v) }));
  }
  function describe(who) {
    const v = voiceFor(who, cast.lang).voice;
    return v ? label(v) : 'Voz del sistema';
  }
  function bestQuality() {
    const vs = ranked(cast.lang);
    return vs.length ? quality(vs[0]) : -1;
  }

  function chunks(text) {
    const parts = String(text).replace(/\s+/g, ' ').split(/(?<=[.!?…;:])\s+/);
    const out = [];
    for (const p of parts) {
      const last = out[out.length - 1];
      if (last && (last + ' ' + p).length < 180) out[out.length - 1] = last + ' ' + p;
      else out.push(p);
    }
    return out.filter(s => s.trim());
  }

  let token = 0;
  async function speak(text, opts = {}) {
    if (!synth || !String(text || '').trim()) return true;
    const my = ++token;
    synth.cancel();
    let { voice, pitch } = voiceFor(opts.who, opts.lang || 'es-ES');
    if (opts.voiceURI) {
      const forced = voices.find(v => v.voiceURI === opts.voiceURI);
      if (forced) { voice = forced; pitch = 1; }
    }
    for (const part of chunks(text)) {
      if (my !== token) return false;
      await new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(part);
        if (voice) u.voice = voice;
        u.lang = voice ? voice.lang : (opts.lang || 'es-ES');
        u.pitch = pitch;
        u.rate = opts.rate || 1;
        const t = setTimeout(resolve, 3000 + part.length * 150 / u.rate);
        u.onend = u.onerror = () => { clearTimeout(t); resolve(); };
        synth.speak(u);
      });
    }
    return my === token;
  }

  let rec = null;
  function listen(opts = {}) {
    return new Promise((resolve, reject) => {
      if (!SR) return reject(new Error('Este navegador no permite usar el micrófono para reconocer voz.'));
      stopListening();
      const r = new SR();
      rec = r;
      r.lang = opts.lang || 'es-ES';
      r.continuous = true;
      r.interimResults = true;
      let finalText = '', interim = '', error = null, silence = null;
      const finish = () => { clearTimeout(silence); clearTimeout(maxT); try { r.stop(); } catch (e) { /* ya detenido */ } };
      const arm = ms => { clearTimeout(silence); silence = setTimeout(finish, ms); };
      const maxT = setTimeout(finish, opts.maxMs || 90000);
      r.onresult = e => {
        interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalText += res[0].transcript + ' ';
          else interim += res[0].transcript;
        }
        opts.onInterim && opts.onInterim((finalText + interim).trim());
        arm(opts.silenceMs || 2200);
      };
      r.onerror = e => { if (e.error !== 'no-speech' && e.error !== 'aborted') error = e.error; };
      r.onend = () => {
        clearTimeout(silence); clearTimeout(maxT);
        if (rec === r) rec = null;
        const text = (finalText + ' ' + interim).trim();
        if (error && !text) {
          reject(new Error(error === 'not-allowed' || error === 'service-not-allowed'
            ? 'No hay permiso para usar el micrófono. Actívalo en el navegador.'
            : 'No se pudo escuchar (' + error + ').'));
        } else resolve(text);
      };
      arm(9000);
      try { r.start(); } catch (e) { reject(e); }
    });
  }

  /** Termina la escucha actual y entrega lo que se haya oído. */
  function finishListening() { if (rec) try { rec.stop(); } catch (e) { /* nada */ } }
  function stopListening() { if (rec) { const r = rec; rec = null; try { r.abort(); } catch (e) { /* nada */ } } }

  function stop() {
    token++;
    if (synth) synth.cancel();
    stopListening();
  }

  if (synth) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices);
  }

  return {
    canSpeak: !!synth,
    canListen: !!SR,
    NARRATOR,
    speak, listen, finishListening, stopListening, stop,
    setCast, listVoices, describe, bestQuality, characterGender,
    onVoicesChanged: fn => listeners.push(fn),
  };
})();
