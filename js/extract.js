/*
 * Extrae el texto de los archivos que sube el estudiante: PDF, Word (.docx), texto
 * y fotos/escaneos (con reconocimiento de texto OCR). Todo ocurre en el navegador.
 */
window.Extract = (function () {
  'use strict';

  const LIBS = {
    pdf: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    pdfWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    mammoth: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
    tesseract: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  };

  const loading = {};
  function load(src) {
    if (!loading[src]) {
      loading[src] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => {
          delete loading[src];
          reject(new Error('No se pudo descargar una herramienta necesaria. Revisa tu conexión a internet.'));
        };
        document.head.appendChild(s);
      });
    }
    return loading[src];
  }

  const baseName = name => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Mi obra';

  async function fromFiles(fileList, onProgress, askOcr) {
    const files = [...fileList];
    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length && images.length === files.length) {
      images.sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }));
      return { title: baseName(files[0].name), text: await ocrImages(images, onProgress) };
    }
    const f = files[0];
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    const title = baseName(f.name);
    if (ext === 'pdf' || f.type === 'application/pdf') return { title, text: await pdf(f, onProgress, askOcr) };
    if (ext === 'docx') return { title, text: await docx(f, onProgress) };
    if (ext === 'doc' || ext === 'odt' || ext === 'pages' || ext === 'rtf') {
      throw new Error(`Los archivos .${ext} no se pueden leer directamente. Ábrelo en Word o Google Docs y descárgalo como .docx o PDF.`);
    }
    if (['txt', 'md', 'text'].includes(ext) || f.type.startsWith('text/')) return { title, text: await txt(f) };
    throw new Error('Formato no reconocido. Usa un PDF, un Word (.docx), un .txt o fotos de las páginas.');
  }

  async function txt(file) {
    const buf = await file.arrayBuffer();
    let t = new TextDecoder('utf-8').decode(buf);
    if (t.includes('�')) t = new TextDecoder('windows-1252').decode(buf);
    return t.replace(/^﻿/, '');
  }

  // ---------- Word ----------
  async function docx(file, onProgress) {
    onProgress && onProgress('Leyendo el documento de Word…');
    await load(LIBS.mammoth);
    const { value } = await window.mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    const dom = new DOMParser().parseFromString(value, 'text/html');
    const paras = [];

    const textOf = el => {
      const c = el.cloneNode(true);
      c.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      return c.textContent.replace(/[ \t]+/g, ' ').trim();
    };
    const italicShare = el => {
      const total = el.textContent.replace(/\s/g, '').length;
      if (!total) return 0;
      let it = 0;
      el.querySelectorAll('em, i').forEach(e => {
        if (!e.parentElement.closest('em, i')) it += e.textContent.replace(/\s/g, '').length;
      });
      return it / total;
    };

    (function walk(node) {
      for (const el of node.children) {
        if (el.tagName === 'TABLE') {
          // Libretos en tabla: | PERSONAJE | texto |
          el.querySelectorAll('tr').forEach(tr => {
            const cells = [...tr.children].map(td => textOf(td).replace(/\n+/g, ' ')).filter(Boolean);
            if (cells.length === 2 && cells[0].length < 40) {
              paras.push({ text: cells[0].replace(/[:.\s—–-]+$/, '') + ': ' + cells[1], italic: false });
            } else if (cells.length) {
              paras.push({ text: cells.join(' '), italic: false });
            }
          });
        } else if (/^(P|H[1-6]|LI)$/.test(el.tagName)) {
          const t = textOf(el);
          if (t) paras.push({ text: t, italic: italicShare(el) > 0.9 });
        } else {
          walk(el);
        }
      }
    })(dom.body);

    // Párrafos completos en cursiva suelen ser acotaciones (salvo que TODO esté en cursiva)
    const useItalic = paras.filter(p => p.italic).length < paras.length * 0.5;
    return paras.map(p => (useItalic && p.italic && !/^[(\[]/.test(p.text)) ? `(${p.text})` : p.text).join('\n');
  }

  // ---------- PDF ----------
  async function pdf(file, onProgress, askOcr) {
    onProgress && onProgress('Abriendo el PDF…');
    await load(LIBS.pdf);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.pdfWorker;
    const doc = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = [];
    for (let p = 1; p <= doc.numPages; p++) {
      onProgress && onProgress(`Leyendo página ${p} de ${doc.numPages}…`, p / doc.numPages);
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      pages.push(pageLines(tc.items));
    }
    const chars = pages.reduce((a, ls) => a + ls.join('').length, 0);
    if (chars < 40 * doc.numPages && askOcr && await askOcr()) return ocrPdf(doc, onProgress);
    return cleanPages(pages);
  }

  function pageLines(items) {
    const rows = [];
    let cur = null;
    for (const it of items) {
      if (typeof it.str !== 'string' || it.str === '') continue;
      const x = it.transform[4], y = it.transform[5];
      const h = Math.abs(it.transform[3]) || it.height || 10;
      if (cur && Math.abs(y - cur.y) <= h * 0.5) {
        const gap = x - cur.xEnd;
        if (gap > h * 0.15 && !/\s$/.test(cur.text) && !/^\s/.test(it.str)) cur.text += ' ';
        cur.text += it.str;
        cur.xEnd = x + (it.width || 0);
      } else {
        if (cur) rows.push(cur);
        cur = { y, h, text: it.str, xEnd: x + (it.width || 0) };
      }
    }
    if (cur) rows.push(cur);
    const out = [];
    rows.forEach((r, i) => {
      if (i > 0 && rows[i - 1].y - r.y > r.h * 1.9) out.push('');
      out.push(r.text.replace(/\s+/g, ' ').trim());
    });
    return out;
  }

  // Quita números de página y encabezados/pies que se repiten en cada página
  function cleanPages(pages) {
    const sig = l => l.toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
    const edges = pages.map(ls => {
      const idx = ls.map((l, i) => (l ? i : -1)).filter(i => i >= 0);
      return [...idx.slice(0, 2), ...idx.slice(-2)];
    });
    const freq = {};
    pages.forEach((ls, p) => new Set(edges[p].map(i => sig(ls[i]))).forEach(s => { freq[s] = (freq[s] || 0) + 1; }));
    const minRep = Math.max(3, Math.ceil(pages.length * 0.5));
    const pageNum = /^(p[aá]g(ina)?\.?\s*)?[-–—]?\s*\d{1,4}\s*[-–—]?(\s*(de|\/)\s*\d+)?$/i;
    return pages.map((ls, p) => ls.filter((l, i) => {
      if (pageNum.test(l)) return false;
      if (edges[p].includes(i) && l.length < 80 && freq[sig(l)] >= minRep) return false;
      return true;
    }).join('\n')).join('\n');
  }

  // ---------- OCR ----------
  async function makeWorker(onProgress, label) {
    onProgress && onProgress('Preparando el reconocimiento de texto (la primera vez tarda un poco)…');
    await load(LIBS.tesseract);
    return window.Tesseract.createWorker('spa', 1, {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) onProgress(label.text, m.progress);
      },
    });
  }

  async function ocrPdf(doc, onProgress) {
    const label = { text: '' };
    const worker = await makeWorker(onProgress, label);
    const out = [];
    try {
      for (let p = 1; p <= doc.numPages; p++) {
        label.text = `Reconociendo el texto de la página ${p} de ${doc.numPages}…`;
        onProgress && onProgress(label.text, 0);
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const { data } = await worker.recognize(canvas);
        out.push(data.text);
      }
    } finally {
      await worker.terminate();
    }
    return out.join('\n');
  }

  async function ocrImages(images, onProgress) {
    const label = { text: '' };
    const worker = await makeWorker(onProgress, label);
    const out = [];
    try {
      for (let i = 0; i < images.length; i++) {
        label.text = `Reconociendo el texto de la foto ${i + 1} de ${images.length}…`;
        onProgress && onProgress(label.text, 0);
        const { data } = await worker.recognize(images[i]);
        out.push(data.text);
      }
    } finally {
      await worker.terminate();
    }
    return out.join('\n');
  }

  return { fromFiles };
})();
