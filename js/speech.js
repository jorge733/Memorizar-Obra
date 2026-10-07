/*
 * Voz: lectura en voz alta (cada personaje con una voz/tono distinto)
 * y reconocimiento de voz para comprobar lo que dice el estudiante.
 */
window.Voice = (function () {
  'use strict';

  const synth = window.speechSynthesis;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voices = [];

  function loadVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) {
    loadVoices();
    synth.addEventListener && synth.addEventListener('voiceschanged', loadVoices);
  }

  function hash(s) {
    let h = 5381;
    for (const ch of String(s)) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
    return Math.abs(h);
  }

  function spanishVoices(lang) {
    const es = voices.filter(v => /^es/i.test(v.lang));
    const region = es.filter(v => v.lang.toLowerCase().replace('_', '-') === String(lang).toLowerCase());
    return [...region, ...es.filter(v => !region.includes(v))];
  }

  const PITCHES = [1, 0.8, 1.2, 0.9, 1.35, 0.7, 1.1];
  function voiceFor(who, lang) {
    const vs = spanishVoices(lang);
    const h = hash(who || 'narrador');
    return { voice: vs.length ? vs[h % vs.length] : null, pitch: PITCHES[(h >> 3) % PITCHES.length] };
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
    const { voice, pitch } = voiceFor(opts.who, opts.lang || 'es-ES');
    for (const part of chunks(text)) {
      if (my !== token) return false;
      await new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(part);
        if (voice) u.voice = voice;
        u.lang = voice ? voice.lang : (opts.lang || 'es-ES');
        u.pitch = opts.pitch || pitch;
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

  return {
    canSpeak: !!synth,
    canListen: !!SR,
    speak, listen, finishListening, stopListening, stop,
  };
})();
