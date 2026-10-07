/*
 * Enlaces para compartir un libreto sin servidor: el texto de la obra viaja
 * comprimido dentro del propio enlace (después del #), que nunca se envía a Vercel.
 */
window.Share = (function () {
  'use strict';

  function toB64u(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64u(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function pipe(bytes, transform) {
    const stream = new Blob([bytes]).stream().pipeThrough(transform);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  const canZip = typeof CompressionStream !== 'undefined';

  async function encode(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    if (canZip) return 'z' + toB64u(await pipe(raw, new CompressionStream('deflate-raw')));
    return 'u' + toB64u(raw);
  }

  async function decode(payload) {
    let bytes;
    try { bytes = fromB64u(payload.slice(1)); } catch (e) { throw new Error('El enlace está incompleto. Pide que te lo vuelvan a enviar.'); }
    let raw;
    if (payload[0] === 'z') {
      if (typeof DecompressionStream === 'undefined') {
        throw new Error('Este navegador es muy antiguo para abrir el enlace. Actualízalo o prueba con Chrome.');
      }
      try { raw = await pipe(bytes, new DecompressionStream('deflate-raw')); } catch (e) {
        throw new Error('El enlace está incompleto o dañado. Pide que te lo vuelvan a enviar.');
      }
    } else if (payload[0] === 'u') {
      raw = bytes;
    } else {
      throw new Error('Este enlace no es válido.');
    }
    const obj = JSON.parse(new TextDecoder().decode(raw));
    if (!obj || typeof obj.x !== 'string') throw new Error('Este enlace no contiene un libreto.');
    return obj;
  }

  const link = payload => location.origin + location.pathname + '#/l/' + payload;

  return { encode, decode, link };
})();
