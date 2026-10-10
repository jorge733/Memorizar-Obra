# 🎭 Aprendo mi Papel

Web para que los estudiantes del **Colegio Waldorf Michelangelo** se aprendan su libreto de forma rápida y didáctica.

1. **Sube el libreto** (PDF, Word `.docx`, `.txt` o fotos de las páginas). La página lee el texto y detecta personajes, diálogos, acotaciones y escenas.
2. **Elige tu personaje** (puedes elegir varios, p. ej. el tuyo y «TODOS»).
3. **Practica** con cinco modos:
   - 📖 **Leer** — la obra completa con tus líneas resaltadas; puedes taparlas o ver solo tus líneas y sus entradas.
   - 🃏 **Ensayar** — tarjetas: ves la entrada (lo que dice el personaje anterior), dices tu línea y te calificas. Con micrófono, la página te dice cuánto acertaste.
   - 🌫️ **Desvanecer** — tu línea va perdiendo palabras hasta que la dices de memoria.
   - ✍️ **Escribir** — escribes tu línea y ves qué palabras faltaron.
   - 🎙️ **Escena con voces** — la página lee a los demás personajes con voces distintas y se detiene en tu turno.

Una barra de progreso muestra cuántas líneas dominas (por obra o por escena).

## Compartir con el curso

El profesor sube el libreto, revisa que los personajes se vean bien y pulsa **«Crear enlace para el curso»**. Los estudiantes abren el enlace, la obra se guarda sola en su dispositivo y solo eligen su personaje.

- El libreto viaja **comprimido dentro del enlace** (después del `#`), así que no hace falta servidor ni base de datos, y Vercel nunca recibe el texto.
- Si el profesor corrige el libreto y envía un enlace nuevo, quienes lo abran reciben la versión actualizada y **conservan su personaje y su progreso**.
- Abrir el mismo enlace varias veces no duplica la obra.

## Voces

La lectura en voz alta usa las voces del propio dispositivo, sin coste:

- Elige siempre las más naturales disponibles: las **«Natural» de Microsoft Edge** (neuronales, las más realistas), las de Google en Chrome o las «mejoradas» de iPhone/Mac.
- Cada personaje recibe **una voz distinta** y acorde a su nombre (voces femeninas para ANA o LA REINA, masculinas para PEDRO o EL REY). No se deforma el tono, que es lo que hace sonar robótica una voz.
- En **⚙️ Ajustes › Voces del reparto** se puede elegir y escuchar la voz de cada personaje.
- Si el navegador solo tiene voces básicas, la página recomienda abrirla en Edge.

## Privacidad

Todo funciona en el navegador. El libreto y el progreso se guardan solo en el dispositivo (`localStorage`); no hay servidor ni base de datos.

## Formato recomendado del libreto

```
ESCENA 1
(Un bosque al amanecer.)
JUAN: Hola, ¿cómo estás?
MARÍA.— Muy bien, gracias.
```

También reconoce `JUAN. Texto`, `JUAN — Texto` y el nombre solo en una línea con el texto debajo. Si algo no se detecta bien, el texto se puede corregir dentro de la propia página.

## Publicación

Es un sitio estático (HTML + CSS + JS, sin compilación). En Vercel: importar el repositorio, framework **Other**, sin comando de build. Las librerías para leer PDF/Word/OCR se cargan desde CDN solo cuando se necesitan.

El micrófono (reconocimiento de voz) funciona mejor en Chrome y Edge y requiere HTTPS (Vercel ya lo da).

## Desarrollo local

```bash
npx serve .
```
