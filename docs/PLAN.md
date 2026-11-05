# Silbador — Plan de desarrollo
### NASA Space Apps 2026 · Reto 5: *The Earth Information Jukebox*

> **En una frase:** hace más de 1500 años, los huacos silbadores moche ya convertían el agua en sonido. **Silbador** es una *jukebox* retro pixelada que escanea los fotogramas de las visualizaciones del **Earth Information Center (EIC)** de la NASA y los convierte en música en tiempo real, tocada por una banda de cinco personajes andinos. Así cualquiera, incluso quien no ve, puede **escuchar** cómo se calienta el Pacífico.

- **Prototipo interactivo (Claude Design):** https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU *(privado hasta que el dueño lo comparta)*
- **Reto oficial:** https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/
- **Galería EIC:** https://svs.gsfc.nasa.gov/gallery/earth-information-center/

---

## Índice
1. [Requerimientos](#1-requerimientos)
2. [La idea y la historia](#2-la-idea-y-la-historia)
3. [La banda: cinco personajes, cinco conjuntos de sonidos](#3-la-banda-cinco-personajes-cinco-conjuntos-de-sonidos)
4. [Qué construimos (alcance)](#4-qué-construimos-alcance)
5. [Cómo se convierte un fotograma en música](#5-cómo-se-convierte-un-fotograma-en-música)
6. [Tecnología: lo mínimo que funciona](#6-tecnología-lo-mínimo-que-funciona)
7. [Arquitectura y contratos](#7-arquitectura-y-contratos)
8. [Reparto: 6 miembros, 6 módulos](#8-reparto-6-miembros-6-módulos)
9. [Plan de sprites con IA](#9-plan-de-sprites-con-ia)
10. [Cronograma de las 48 horas](#10-cronograma-de-las-48-horas)
11. [Uso de IA: declaración honesta](#11-uso-de-ia-declaración-honesta)
12. [Criterios de evaluación](#12-criterios-de-evaluación)
13. [Riesgos y plan B](#13-riesgos-y-plan-b)
14. [Guion del pitch (3 minutos)](#14-guion-del-pitch-3-minutos)

---

## 1. Requerimientos

### 1.1 Del enunciado oficial del reto
| ID | Requerimiento | Qué dice el reto | Cómo lo cubrimos |
|---|---|---|---|
| E1 | **Jukebox que acompaña fotogramas del EIC** | "pairs EIC visual frames with dynamic sonifications generated in real time" | Cada "disco" es una secuencia de fotogramas EIC. Se escanean y suenan en el navegador al momento |
| E2 | **Elegir una visualización y oírla** | "individuals can select or experience a specific EIC visualization alongside its corresponding soundscape" | Selector de discos y tira de fotogramas para saltar a cualquiera |
| E3 | **Analizar la imagen (visión por computadora)** | "map color spectrums to musical chords… pixel density into rhythm… visual shapes" | Color → nivel de anomalía → acordes (Inti/Mamacocha). Densidad → ritmo (Yaku). Extremos → truenos (Illapa). Región → silbido (Silbo) |
| E4 | **Musical, no ruido** | "a direct pixel-to-sound translation might result in chaotic noise… apply musical scales, harmonies" | Progresión de acordes Am–C–F–G–E y gotas en escala pentatónica andina |
| E5 | **Accesibilidad como eje central** | "screen-reader compatibility, tactile feedback, or rich descriptive text" | Subtítulos de sonido `aria-live`, descripción del fotograma por voz, vibración, teclado, alto contraste y fuente legible |
| E6 | **Contar el proceso** | "sharing the why behind your artistic choices or explaining the algorithms" | Pestaña "Cómo suena", más `docs/METODO.md` |
| E7 | **Impacto emocional** | "reflect the urgency of climate change or the beauty of our planet" | Personajes con personalidad. Cuando Mamacocha calla, algo anda mal |
| E8 | **Formato libre** (web, app, API o playlist) | "interactive web-based jukebox…" | Web estática, más una playlist de audios exportados como respaldo |

### 1.2 De la charla de orientación (audio "Reto 5 y 6", transcripción en `docs/orientacion_transcripcion.md`)
| ID | Requerimiento | Minuto | Cobertura |
|---|---|---|---|
| R1 | Traducir a sonido datos que normalmente son **imágenes** | 01:13 | Toda la jukebox se basa en fotogramas |
| R2 | Ciencia **inclusiva y multisensorial** | 00:18, 01:08 | E5 |
| R3 | Que **cada sonido represente algo** | 00:35 | Cada personaje representa un rasgo visual concreto |
| R4 | **Cruzar variables** (temperatura × lluvia) | 01:18–01:33 | Extra: "Eco de Chiclayo", la lluvia de NASA POWER suena después de cada disco |
| R5 | Un **fenómeno regional** contado como historia (ej. lluvia en Galápagos) | 01:40–02:11 | El Niño frente al Perú y Galápagos (están dentro del encuadre) |
| R6 | **Storytelling** desde el nombre del equipo | 01:46, 02:44 | Huaco silbador y banda andina. Equipo: *Los Silbadores de Ñaylamp* |
| R7 | **Dar voz** a algo que no la tenía (ejemplo de ElevenLabs con edificios) | 00:43 | Le damos voz al océano a través de cinco personajes |
| R8 | **Prototipo funcional** aunque sea simple | 04:16, 05:48 | MVP congelado en la hora 30 |
| R9 | **Tecnología simple** (HTML, canvas) | 04:54 | HTML, CSS y JS con Canvas y Web Audio. Sin backend |
| R10 | **Declarar el uso de IA** (con marca de agua) | 06:03–06:52 | Sección 11 y etiqueta en cada sprite generado con IA |
| R11 | **Supervisar el código generado por IA** | 07:03 | Revisión cruzada de PRs |
| R12 | **Reutilizar repositorios y citarlos** | 07:21 | `docs/CREDITOS.md` |

---

## 2. La idea y la historia

**El gancho.** En Lambayeque, las culturas moche y lambayeque hacían botellas silbadoras: al inclinarlas, el agua empuja el aire y la vasija silba. El agua ya sonaba aquí hace siglos.

**El conflicto.** El Pacífico frente al Perú cambia de color en los mapas de la NASA, y cuando se pone rojo (El Niño) el desierto de Chiclayo se inunda. En 2017, el Niño Costero trajo 62 veces la lluvia normal (NASA POWER). Pero esos mapas son pura vista: una persona ciega no puede "leerlos".

**La resolución.** Silbador es una jukebox con 5 discos, y cada disco es una secuencia de fotogramas de anomalía de temperatura del mar:

| Disco | Periodo | Lo que se oye (medido por nuestro analizador) |
|---|---|---|
| 1 · La Niña | ago 2010 – ene 2011 | Mamacocha domina (frío 1,63), Inti casi no toca y Silbo calla (costa −1,4) |
| 2 · El Niño «Godzilla» | jul – dic 2015 | Inti a todo volumen, 36% de píxeles extremos e Illapa truena |
| 3 · Niño Costero | dic 2016 – may 2017 | El océano está tibio, pero la costa del Perú arde (+3,9): Silbo silba |
| 4 · Yaku | ene – jun 2023 | La costa pasa de −0,3 a +4,4 en tres meses y se oye cómo Silbo despierta |
| 5 · El Niño 2023 | jul – dic 2023 | Toda la banda a la vez |

*(Valores del analizador del prototipo sobre fotogramas GHRSST MUR. La escala va de −5 a +5 y es la de la paleta de color, no grados exactos.)*

**Nombre del equipo:** *Los Silbadores de Ñaylamp*. Según la leyenda, Ñaylamp, fundador de Lambayeque, llegó por el mar, igual que El Niño.

---

## 3. La banda: cinco personajes, cinco conjuntos de sonidos

Cada personaje es **un conjunto de sonidos ligado a un rasgo visual**. La personalidad ayuda a contar la historia ("Illapa casi nunca aparece; si aparece, es en serio") y hace que la sonificación se entienda sin explicar teoría.

| Personaje | Origen del nombre | Escucha (rasgo visual) | Toca (sonido) | Carácter |
|---|---|---|---|---|
| **SILBO** | Huaco silbador moche | Recuadro de la costa norte del Perú (82°–76°O, 3°–18°S) | Silbido de vasija con vibrato cuando la costa supera +2 | Viejo y sabio. Narrador y alarma |
| **INTI** | Sol (quechua) | Promedio de píxeles cálidos cada 4 columnas | Acordes de marimba: C, F, G y E (tensión) | Entusiasta y ruidoso |
| **MAMACOCHA** | Madre del mar (cosmovisión andina) | Promedio de píxeles fríos | Bajo profundo | Calma protectora. Si calla, algo anda mal |
| **YAKU** | Agua (quechua) | Densidad de celdas con anomalía ±2 o más por columna, y su latitud | Gotas en pentatónica andina, más agudas hacia el norte | Inquieto y travieso |
| **ILLAPA** | Rayo y trueno (cosmovisión andina) | Columnas con ≥25% de píxeles extremos (+4,5/+5) | Truenos graves | Aparece poco. Cuando llega, todos callan |

Respeto cultural: M5 valida los nombres y las descripciones con fuentes, como el Museo Tumbas Reales de Sipán y el Museo Brüning, y evita caricaturizar a las divinidades.

---

## 4. Qué construimos (alcance)

### MVP (obligatorio, listo a la hora 30)
1. **Jukebox** con 5 discos de 6 fotogramas cada uno: reproducir/pausar, tira de fotogramas, fotograma anterior/siguiente y velocidad del escaneo.
2. **Analizador visual en el navegador**: cuadrícula 28×16, clasificación de color → nivel y recuadro de la costa.
3. **La banda** sonando en tiempo real: 5 voces, con mezclador para silenciar a cada personaje.
4. **Visualización**: cabezal de escaneo sobre el fotograma, vista "lo que oye la máquina" y medidores por personaje.
5. **Accesibilidad**: subtítulos de sonido, botón "Describir fotograma" (texto y voz), vibración, alto contraste, texto grande, fuente legible y todo con teclado.
6. **Identidad retro pixelada** con los sprites de los 5 personajes (ver sección 9).

### Extras (solo con el MVP cerrado)
7. Más discos del EIC: **Global Temperature Anomalies 1880–2023** (SVS 5207) y **Seasonal Global Precipitation, GPM** (SVS 4897). Para el de lluvia, Yaku pasa a escuchar la densidad de precipitación.
8. **Eco de Chiclayo** (R4): tras cada disco suena la lluvia mensual real de Chiclayo de NASA POWER (ya descargada en `data/`).
9. **Exportar .wav** de cada disco (playlist de respaldo para el envío).
10. Sprites animados que reaccionan: bailan cuando su voz está activa.

### Fuera de alcance
Backend, login, base de datos, entrenar modelos de ML, app nativa.

---

## 5. Cómo se convierte un fotograma en música

1. **Fotograma** (PNG, 560×320) → `drawImage` a 140×80 en un canvas → `getImageData`.
2. **Color → nivel** con HSV, calibrado con la paleta real de GHRSST: gris = 0, amarillo = +1, naranja = +2, rojo-naranja = +3, rojo = +4, magenta = +4,5, rojo oscuro = +5; verde = −1, turquesa = −2, cian = −3, azul = −4/−5. Transparente = tierra, se ignora.
3. **Cuadrícula 28×16**: el promedio por celda de 5×5 px es "lo que oye la máquina".
4. **Escaneo oeste → este**: 28 columnas, cada una es un paso (110 ms). El paneo estéreo sigue la posición, así que el oeste suena a la izquierda y la costa del Perú a la derecha.
5. **Reglas musicales**:
   - Cada 4 columnas, Inti y Mamacocha eligen el acorde: más frío → Am; neutro → C; tibio → F; cálido → G; muy cálido → E (tensión).
   - Por columna, Yaku toca hasta 3 gotas según las celdas con |nivel| ≥ 2, con la altura según la latitud.
   - Illapa truena si una columna tiene ≥25% de valores extremos.
   - Silbo silba al pasar por la costa del Perú si su promedio es ≥ +2.
6. **Salida para todos**: subtítulo en cada paso ("[mar 2017 · 79°O] muy cálido · Silbo silba"), descripción completa del fotograma por voz y vibración en los truenos.

Validación: el algoritmo se probó con los 30 fotogramas. La Niña da frío ≈1,6 y costa −1,4; el Niño Costero 2017 da costa +3,9; Yaku 2023 sube de −0,3 a +4,4.

---

## 6. Tecnología: lo mínimo que funciona

| Necesidad | Elección | Por qué |
|---|---|---|
| App | HTML, CSS y JS con módulos ES, sin build | Lo recomendaron en la charla. Cualquiera puede editarla |
| Visión por computadora | **Canvas 2D `getImageData`** | Nativo del navegador, sin librerías |
| Audio | **Web Audio** (ya funciona en el prototipo). Tone.js opcional | Sin dependencias |
| Voz | Web Speech API | Gratis y offline |
| Fotogramas | Script Python (`scripts/descargar_fotogramas.py`) que guarda PNG en `data/fotogramas/` | La demo no depende de internet |
| Extracción desde el video del EIC | `ffmpeg -i video.mp4 -vf fps=1 frame_%03d.png` | Para los discos extra de SVS |
| Sprites | PNG con transparencia, hojas de 32×32 | Se cargan con `<img>` y `image-rendering: pixelated` |
| Hosting | GitHub Pages | URL pública para el envío |

**Fuente de los fotogramas.** La visualización EIC *Sea Surface Temperature (SST) Anomaly – Near Real Time* (SVS 5176) usa el producto **GHRSST MUR**. Como esa visualización solo cubre los últimos ~2,5 años, para los eventos de 2010–2023 descargamos el **mismo producto MUR** desde NASA GIBS/Worldview (capa `GHRSST_L4_MUR25_Sea_Surface_Temperature_Anomalies`), con el mismo encuadre para todos. Los discos extra salen directamente de los videos del EIC (SVS 5207 y 4897). Esto se declara tal cual en la app y en el envío.

---

## 7. Arquitectura y contratos

```
index.html
└── src/app/main.js            (M6) arranca y monta todo
    ├── src/app/bus.js         (M6) bus de eventos: único punto de contacto
    ├── src/fotogramas/        (M1) manifiesto de discos → URLs de fotogramas
    ├── src/analizador/        (M2) fotograma → cuadrícula 28×16 + estadísticas
    ├── src/sonido/            (M3) cuadrícula + columna → la banda suena
    ├── src/arte/              (M4) visor, tira, cuadrícula, medidores, sprites
    ├── src/accesibilidad/     (M5) teclado, subtítulos, voz, vibración, temas
    └── assets/sprites/        (M4) hojas de sprites PNG
```

Regla de oro: ningún módulo importa archivos internos de otro. Solo se usa su `index.js` público y los eventos del bus, todo documentado en [`CONTRATOS.md`](CONTRATOS.md).

Flujo: `play` → M6 avanza la columna → emite `paso {disco, fotograma, columna}` → M3 consulta a M2 (`columna(...)`) y toca → emite `voces {silbo, inti, ...}` → M4 mueve el cabezal y los medidores, y M5 escribe el subtítulo y hace vibrar.

---

## 8. Reparto: 6 miembros, 6 módulos

Cada persona es dueña de sus carpetas (`.github/CODEOWNERS`) y trabaja en la rama `mod/<módulo>`.

### M1 · Fotogramas EIC y datos (`data/`, `scripts/`, `src/fotogramas/`)
- [ ] `scripts/descargar_fotogramas.py`: 5 discos × 6 fotogramas GHRSST MUR desde Worldview, con encuadre 140°O–70°O y 25°S–15°N (las fechas están en el prototipo).
- [ ] `data/discos.json`: manifiesto con id, título, periodo, fuente, fechas y ruta de cada fotograma.
- [ ] *(Extra)* Extraer fotogramas de los videos EIC SVS 5207 y 4897 con ffmpeg y agregarlos como discos 6 y 7.
- [ ] `docs/DATOS.md`: fuentes, licencias, paleta de color y limitaciones (MUR 0,25°, no son grados exactos).
- [ ] *(Extra)* Serie de lluvia de NASA POWER para el "Eco de Chiclayo" (ya está en `data/nasa_power_monthly.json`).
- **Hecho cuando:** `getDiscos()` devuelve los 5 discos y todas las imágenes cargan sin internet.

### M2 · Analizador visual (`src/analizador/`)
- [ ] `analizar(urlImagen)` → `{ celdas[448], calido, frio, extremo, costa }`, con canvas y `getImageData`.
- [ ] Clasificador HSV → nivel −5…+5, calibrado con los píxeles reales (la tabla está en la sección 5).
- [ ] `columna(analisis, c)` → `{ calido, frio, fuertes: [[fila, nivel]], extremo }`.
- [ ] Test con los 30 fotogramas: que La Niña dé frío > cálido y que el Niño Costero dé costa ≥ 2.
- [ ] *(Extra)* Clasificador para la paleta de precipitación de GPM.
- **Hecho cuando:** los valores coinciden con la tabla de la sección 2 (±0,2).

### M3 · Motor de sonido: la banda (`src/sonido/`)
- [ ] Las 5 voces (sección 5) con Web Audio. Puedes partir del código del prototipo.
- [ ] Mezclador: `silenciar(personaje)` y volumen general.
- [ ] Emitir `voces` con el nivel 0…1 de cada personaje en cada paso.
- [ ] Ajuste musical: que suene bien a 70, 110 y 180 ms por columna.
- [ ] *(Extra)* Exportar .wav de cada disco con `MediaRecorder` y armar la playlist de respaldo.
- [ ] *(Extra)* Grabar una réplica real de huaco silbador y usarla como muestra de Silbo.
- **Hecho cuando:** con los ojos cerrados se distingue el disco 1 del disco 2.

### M4 · Arte pixel, sprites y componentes visuales (`src/arte/`, `assets/`)
- [ ] **Sprites de los 5 personajes** (ver sección 9).
- [ ] Kit visual retro: bordes de 4 px, sombras duras, tipografías Press Start 2P (títulos cortos), Pixelify Sans (encabezados) e IBM Plex (texto) y paleta derivada de la escala de anomalías.
- [ ] Componentes: visor de fotograma con cabezal y recuadro de Silbo, cuadrícula "lo que oye la máquina", tira de fotogramas y tarjetas de la banda con medidores.
- [ ] Animación de los sprites (2 frames idle y 2 activos), respetando `prefers-reduced-motion`.
- **Hecho cuando:** la interfaz se ve como el prototipo, con los sprites reales.

### M5 · Accesibilidad, textos y narrativa (`src/accesibilidad/`, `docs/pitch/`)
- [ ] Teclado: espacio (play), ←/→ (fotograma), 1–5 (disco), M+número (silenciar personaje), D (describir).
- [ ] Subtítulos de sonido en `aria-live` y `describirFotograma(analisis)` con texto rico, en voz `es-PE`.
- [ ] Vibración en truenos y en gotas densas. Modos: alto contraste, texto grande y fuente legible (sin tipografía pixel).
- [ ] Prueba real con NVDA o TalkBack, idealmente con una persona ciega o con baja visión. Grabar la prueba para el pitch.
- [ ] Textos de los personajes y del pitch, validando los nombres andinos con fuentes.
- **Hecho cuando:** se recorre la jukebox completa sin mirar la pantalla.

### M6 · App, integración, despliegue y entrega (`index.html`, `src/app/`, `.github/`)
- [ ] Hora 0: `bus.js` y `CONTRATOS.md` cerrados con todos, más el esqueleto de `index.html`.
- [ ] Reloj del escaneo (columna y fotograma), navegación por pestañas (Jukebox, La banda, Cómo suena).
- [ ] GitHub Pages e integraciones en las horas 12, 24 y 36.
- [ ] `docs/METODO.md` (E6) y `docs/CREDITOS.md`.
- [ ] Coordina el video y el formulario de envío con M5.
- **Hecho cuando:** la URL pública funciona en Chrome de escritorio y de Android.

---

## 9. Plan de sprites con IA

**Responsable:** M4 (con apoyo de M5 en los textos y la validación cultural).

| Paso | Detalle |
|---|---|
| 1. Brief | Una ficha por personaje con nombre, rasgo visual, sonido y personalidad (sección 3 y pestaña "La banda" del prototipo). Paleta común de 16 colores tomada de la escala de anomalías (azules, verdes, grises, amarillos, rojos y magentas) |
| 2. Referencias | Fotos de huacos silbadores (Museo Tumbas Reales de Sipán, Museo Brüning) e iconografía andina. Se citan en `docs/CREDITOS.md` |
| 3. Generación con IA | Generador especializado en pixel art (por ejemplo PixelLab o Retro Diffusion) o uno general (ChatGPT/DALL·E, Gemini). Se guarda cada prompt y la herramienta en `docs/USO_DE_IA.md` |
| 4. Retoque humano | En **Aseprite**, **LibreSprite** o **Piskel** (estos dos son gratis): ajustar a 32×32, limpiar píxeles sueltos, forzar la paleta de 16 colores y dibujar 2 frames idle + 2 activos |
| 5. Exportar | `assets/sprites/<personaje>.png` en hoja horizontal de 4 frames de 32×32 con fondo transparente |
| 6. Declarar | Etiqueta "Sprite generado con IA y retocado por el equipo" en la pestaña La banda y en el video (R10: la marca de agua da credibilidad) |

Prompts base, a ajustar por M4:
- **Silbo:** *"32x32 pixel art sprite, pre-Columbian Moche whistling vessel (stirrup-spout clay bottle), ochre clay, small kind eyes, water droplets from the spout, transparent background, limited 16-color palette, game character, front view"*
- **Inti:** *"32x32 pixel art sprite, cheerful sun character with stepped Andean rays, yellow-orange-red palette, expressive face, transparent background"*
- **Mamacocha:** *"32x32 pixel art sprite, calm female figure made of ocean waves, blue and turquoise, foam hair, transparent background"*
- **Yaku:** *"32x32 pixel art sprite, small playful water drop with tiny legs and big eyes, green-cyan highlights, transparent background"*
- **Illapa:** *"32x32 pixel art sprite, Andean storm warrior holding a sling and a zigzag magenta lightning bolt, dark cloud behind, transparent background"*

Plan B: si la IA no da buen resultado en 3 horas, M4 dibuja versiones simples de 16×16 a mano en Piskel.

---

## 10. Cronograma de las 48 horas

| Hora | Hito | Quién |
|---|---|---|
| Antes | Clonar el repo, instalar VS Code + Live Server, ffmpeg (M1) y Aseprite/Piskel (M4). Conseguir una réplica de huaco | Todos |
| 0–2 | Kickoff: leer el plan, firmar los contratos, crear ramas. Brief de sprites | Todos (lidera M6) |
| 2–12 | Construcción en paralelo, con datos simulados donde haga falta. M4 genera los sprites (horas 2–8) | Todos |
| 12 | **Integración 1**: play → escaneo → sonido → cabezal y subtítulo | M6 + todos |
| 12–24 | MVP completo con sprites reales | Todos |
| 24 | **Integración 2** en GitHub Pages | M6 |
| 24–30 | Bugs y prueba con lector de pantalla | M5 lidera |
| 30 | **Congelar el MVP** | Todos |
| 30–40 | Extras (discos EIC 5207/4897, Eco de Chiclayo, .wav, animación) y video | M1–M4 / M5–M6 |
| 40–44 | Congelar el código. Ensayos del pitch | M5 |
| 44–48 | Envío: repo, video, descripción y declaración de IA | M6 + M5 |

Stand-up de 5 minutos cada 6 horas: ¿qué terminé?, ¿qué me bloquea?, ¿qué contrato necesito?

---

## 11. Uso de IA: declaración honesta

| Herramienta | Uso | Revisión humana |
|---|---|---|
| **Claude Code (Anthropic)** | Redactar este plan, analizar la charla y el enunciado, calibrar el analizador de color, armar el repo | El equipo revisa el plan en el kickoff |
| **Claude Design (Anthropic)** | Prototipo interactivo (interfaz, analizador y sonido) | Es un boceto. El código final lo escribe y prueba el equipo |
| **Whisper (OpenAI, modelo abierto, ejecutado en local)** | Transcribir la charla de orientación | Se revisaron a mano los fragmentos citados |
| **Generador de imágenes con IA** (PixelLab / Retro Diffusion / ChatGPT / Gemini, según elija M4) | **Sprites de los 5 personajes**, con retoque manual | Retoque a mano, prompts guardados y etiqueta visible |
| **Asistente de código (Claude / Copilot), si se usa** | Funciones durante la hackathon | Revisión cruzada de cada PR y prueba manual |
| **ElevenLabs (opcional)** | Voz del video | Guion escrito por el equipo |

**No es IA:** el analizador de color (reglas explícitas), Web Audio, Web Speech API (síntesis clásica del navegador) y los datos de la NASA.

---

## 12. Criterios de evaluación

| Criterio | Cómo lo atacamos |
|---|---|
| **Impacto** | Visualizaciones del EIC accesibles para personas ciegas o con baja visión. Educación sobre El Niño en la región que lo sufre |
| **Creatividad** | Huaco silbador × satélites, banda andina con personalidad y estética retro |
| **Validez** | Fotogramas reales de NASA, analizador calibrado y reproducible, limitaciones declaradas |
| **Relevancia** | Cumple E1–E8 del enunciado oficial |
| **Presentación** | Objeto real en el escenario, demo con los ojos cerrados y personajes memorables |

---

## 13. Riesgos y plan B

| Riesgo | Plan B |
|---|---|
| Sin internet en la demo | Fotogramas en `data/` y audio generado en el navegador |
| Canvas "contaminado" por CORS | Servimos los fotogramas desde el mismo dominio (GitHub Pages) |
| Los sprites de IA no convencen | Sprites de 16×16 a mano en Piskel (sección 9) |
| Conflictos de Git | Carpetas separadas, CODEOWNERS y merges pequeños |
| No llegamos a los extras | El MVP se congela en la hora 30 |
| El audio no arranca solo | Arranca tras el clic en Reproducir (política del navegador) |

---

## 14. Guion del pitch (3 minutos)

- **0:00–0:20** — Silencio. Alguien inclina el huaco silbador y suena. *"Así sonaba el agua en Lambayeque hace 1500 años."*
- **0:20–0:45** — Se proyecta un mapa rojo del Pacífico. *"Esto es El Niño visto por la NASA. ¿Y si no puedes verlo?"*
- **0:45–1:45** — *"Cierren los ojos."* Disco 1 (La Niña): Mamacocha, calma. Disco 3 (Niño Costero): Silbo silba e Illapa truena.
- **1:45–2:20** — Abrimos los ojos y presentamos la banda: cinco personajes, cinco sonidos y cinco rasgos de la imagen. Mostramos el modo accesible.
- **2:20–3:00** — Datos del EIC, código abierto, IA declarada. *"La ciencia no debería necesitar ojos. Somos Los Silbadores de Ñaylamp."*
