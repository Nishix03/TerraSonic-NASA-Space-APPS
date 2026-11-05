# Silbador — Plan de desarrollo (NASA Space Apps 2026 · Reto 5: Sonificación)

> **Una frase:** hace más de 1500 años, los huacos silbadores del norte del Perú ya convertían el agua en sonido. *Silbador* hace lo mismo con 44 años de datos de lluvia y temperatura de la NASA, para que cualquiera pueda **escuchar** El Niño, incluso quien no puede ver un gráfico.

- Prototipo interactivo (Claude Design): https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU *(privado hasta que el dueño lo comparta)*
- Datos base: NASA POWER, API mensual, 1981–2024 (ya descargados en `data/nasa_power_monthly.json`)

---

## 0. Índice

1. [Requerimientos extraídos de la charla de orientación](#1-requerimientos-extraídos-de-la-charla-de-orientación)
2. [La idea y la historia](#2-la-idea-y-la-historia)
3. [Qué construimos (alcance)](#3-qué-construimos-alcance)
4. [Tecnología: lo mínimo que funciona](#4-tecnología-lo-mínimo-que-funciona)
5. [Arquitectura por módulos y contratos](#5-arquitectura-por-módulos-y-contratos)
6. [Reparto: 6 miembros, 6 módulos](#6-reparto-6-miembros-6-módulos)
7. [Cronograma de las 48 horas](#7-cronograma-de-las-48-horas)
8. [Uso de IA: declaración honesta](#8-uso-de-ia-declaración-honesta)
9. [Cómo cumplimos los criterios de evaluación](#9-cómo-cumplimos-los-criterios-de-evaluación)
10. [Riesgos y plan B](#10-riesgos-y-plan-b)
11. [Guion del pitch (3 minutos)](#11-guion-del-pitch-3-minutos)

---

## 1. Requerimientos extraídos de la charla de orientación

Transcripción hecha a partir del audio de la charla *"Reto 5 y 6"* (7:43 min). Entre corchetes va el minuto del audio de donde sale cada requerimiento.

| ID | Requerimiento | Qué dijeron | Cómo lo cubrimos |
|---|---|---|---|
| R1 | **Traducir datos a sonido** | "propone traducir los datos a sonidos" [00:07]; "generalmente vas a traducir datos que son imágenes, pero lo vas a llevar a un nivel sonoro" [01:13] | Motor de sonificación: lluvia → gotas, temperatura → tono de fondo, anomalía → silbido |
| R2 | **Ciencia inclusiva y multisensorial** | "hacer la ciencia un poco más accesible y multisensorial" [00:18]; "volver la ciencia más inclusiva" [01:08] | Módulo de accesibilidad: lector de pantalla, subtítulos de sonido, voz, vibración, alto contraste, todo con teclado |
| R3 | **Cada sonido debe representar algo** | "cómo cada sonido puede representar" [00:35] | Leyenda fija "Qué estás escuchando" y mapeo documentado (sección 3) |
| R4 | **Cruzar variables (correlaciones)** | "temperatura y tipos de sonidos, lluvia y temperatura, cómo se pueden ir cruzando estas variables" [01:18–01:33] | Lluvia y temperatura suenan a la vez, en capas. En el Laboratorio eliges qué variable controla la altura de las notas |
| R5 | **Un fenómeno regional contado como historia** | El ejemplo de la lluvia en Galápagos: "algo particular que ocurre en una región geográfica… un hecho tan común como es la lluvia, pero le agregas la capa del sonido" [01:40–02:11] | El Niño en Chiclayo (1998, 2017, 2023), comparado con Galápagos e Iquitos |
| R6 | **Storytelling y creatividad desde el nombre del equipo** | "no solamente es proponer una solución, sino tienes que contarla con una historia" [01:46]; "sean creativos desde el nombre del equipo" [02:44–02:58]; "como región tenemos muchas historias" [02:37] | Huaco silbador (Moche/Lambayeque) como hilo conductor. Equipo sugerido: **"Los Silbadores de Ñaylamp"** |
| R7 | **"Dar voz" a algo que no la tenía** | Ejemplo de ElevenLabs "dándole voz a los edificios" [00:43–01:08] | Le damos voz al cielo de Chiclayo… a través de un huaco |
| R8 | **Prototipo funcional, aunque sea sencillo** | "un prototipo jugable, aunque sea sencillo, vale más que una idea perfecta sin demo" [04:16]; "que sí logren completarlo" [05:48] *(dicho sobre el reto 6, pero vale igual)* | Alcance cerrado (MVP) más extras opcionales separados. Demo funcionando desde la hora 30 |
| R9 | **Tecnología simple** | "podrían diseñar algo en HTML, usar canvas… lo más sencillo posible" [04:54–05:07] | HTML, CSS y JS sin framework ni backend, publicado en GitHub Pages |
| R10 | **Declarar el uso de IA** | "es muy importante que sí la citen a la IA… este texto fue traducido por IA, pero luego revisado por un humano" [06:03–06:21]; dejar la marca de agua [06:34–06:52] | Sección 8, archivo `docs/USO_DE_IA.md` y pie de página en la app |
| R11 | **Supervisar el código generado por IA** | "ustedes tienen que supervisar el paso a paso, que no haya bucles" [07:03–07:15] | Cada PR lo revisa otra persona y se prueba en el navegador antes del merge |
| R12 | **Reutilizar repositorios y citarlos** | "busquen repositorios en Github… reutilicen contenido pero vayan siempre citando" [07:21–07:33] | `docs/CREDITOS.md`: cada librería, repo o snippet reutilizado con su enlace y licencia |

**De la guía de datos abiertos del grupo:** R05 sugiere como inspiración las sonificaciones de Chandra (chandra.si.edu/sound). Como datos usamos NASA POWER (power.larc.nasa.gov, sin cuenta y con JSON directo) y, para imágenes, Worldview (worldview.earthdata.nasa.gov). Earthdata y GPM IMERG quedan como mejora opcional si alguien ya tiene cuenta.

---

## 2. La idea y la historia

### El gancho
En Lambayeque, las culturas moche, chimú y lambayeque hacían **botellas silbadoras**: dos cámaras unidas, y al inclinarlas el agua empuja el aire y la vasija *silba*. Es decir, el agua ya sonaba en Chiclayo hace siglos.

### El conflicto
Chiclayo es **desierto**. Según NASA POWER, en un mes típico cae ~0,1 mm de lluvia al día. Pero cuando el Pacífico se calienta (El Niño), el desierto se inunda:

| Evento | Mes pico (NASA POWER) | Lluvia | Frente a un mes normal |
|---|---|---|---|
| El Niño 1997–98 | febrero 1998 | 5,2 mm/día | **×52** |
| El Niño Costero | marzo 2017 | 6,2 mm/día | **×62** (máximo de la serie) |
| Ciclón Yaku | abril 2023 | 4,0 mm/día | **×40** |
| Galápagos, El Niño 1982–83 | mayo 1983 | 15,1 mm/día | **×47** |

*(Cifras calculadas por nosotros con la API mensual de NASA POWER. "Normal" es la mediana mensual 1981–2024 de cada lugar. El módulo de Datos las vuelve a verificar.)*

Un gráfico muestra estos picos, pero una persona ciega no los ve. Y aun quien ve el gráfico no *siente* lo raro que es que llueva 62 veces más en un desierto.

### La resolución
**Silbador** convierte cada mes en un compás:
- Normalmente suenan gotas sueltas, casi silencio.
- Cuando llueve más de 10 veces lo normal, **el huaco silba**: la alarma de El Niño hecha sonido.
- Se cruzan variables: la temperatura sube el tono de fondo y se oye cómo el mar caliente *anticipa* la lluvia.

### Los 3 actos del pitch
1. **El huaco** (pasado): soplamos o inclinamos una réplica de huaco silbador en vivo. *"Nuestros ancestros ya hacían sonar el agua."*
2. **El dato** (presente): reproducimos 1981–2024 en 60 segundos, con los ojos cerrados. El público *oye* 1998, 2017 y 2023.
3. **La orquesta** (futuro e inclusión): Chiclayo, Galápagos e Iquitos suenan juntos. Mostramos el modo accesible con lector de pantalla y vibración. *"La ciencia no debería necesitar ojos."*

### Nombre del equipo (propuesta)
**Los Silbadores de Ñaylamp**. Ñaylamp es el fundador mítico de Lambayeque que, según la leyenda, *llegó por el mar*, igual que El Niño. Alternativas: *Huaco Sonoro*, *Yaku Lab* (yaku = agua en quechua).

---

## 3. Qué construimos (alcance)

### MVP (obligatorio, listo a la hora 30)
1. **Historia guiada**: Chiclayo 1981–2024 en 5 capítulos, con reproducción, pausa, control del tiempo, velocidad y texto narrativo.
2. **Mapeo sonoro**:
   - Lluvia → número y volumen de **gotas** (escala pentatónica andina).
   - Temperatura (T2M) → **tono de fondo** grave que sube y baja.
   - Anomalía (lluvia ≥ 10× la mediana y ≥ 1 mm/día) → **silbido del huaco**.
3. **Visualización sincronizada**: barras por mes, cursor de reproducción y números grandes (mes, mm/día, ×normal, °C).
4. **Accesibilidad**: todo funciona con teclado, subtítulos de sonido en `aria-live`, botón "leer este mes" (Web Speech API), alto contraste, texto grande y vibración en móvil.
5. **Créditos y declaración de IA** visibles en la app.

### Extras (solo si el MVP está cerrado)
6. **Orquesta del Pacífico**: Chiclayo, Galápagos e Iquitos a la vez, con instrumentos distintos y paneo estéreo.
7. **Laboratorio**: el usuario elige instrumento, escala, qué variable controla la altura y qué capas suenan.
8. **Imagen satelital del evento**: captura de Worldview (MODIS) de Lambayeque en marzo de 2017 que aparece en el capítulo 3.
9. **Exportar .wav** de la pieza (Tone.js `Recorder`).

### Fuera de alcance (no lo hacemos)
Backend, base de datos, login, app móvil nativa, machine learning, mapas 3D.

---

## 4. Tecnología: lo mínimo que funciona

| Necesidad | Elección | Por qué |
|---|---|---|
| App | **HTML + CSS + JavaScript (módulos ES)**, sin framework y sin build | Cualquiera del equipo puede editar. Lo recomendaron en la charla |
| Sonido | **Tone.js** (CDN) sobre Web Audio | Sintetizadores y programación temporal resueltos. El prototipo usa Web Audio puro, así que también sirve como plan B |
| Gráfico | **Canvas 2D** (o divs como en el prototipo) | Sin librerías |
| Voz | **Web Speech API** (`speechSynthesis`, viene en el navegador) | Gratis y sin red |
| Datos | **NASA POWER API** → script Python → `data/*.json` estático | Sin cuenta. La app carga un JSON local, así que la demo no depende de internet |
| Hosting | **GitHub Pages** | Gratis, con URL pública para el envío |
| Colaboración | GitHub: una rama por módulo, PRs y `CODEOWNERS` | Nadie toca carpetas ajenas |

Endpoint de datos (ejemplo, Chiclayo):
```
https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR,T2M,RH2M&community=AG&longitude=-79.84&latitude=-6.77&start=1981&end=2024&format=JSON
```

---

## 5. Arquitectura por módulos y contratos

```
index.html
└── src/app/main.js            (M6) arranca todo y monta las vistas
    ├── src/app/bus.js         (M6) bus de eventos: el ÚNICO punto de contacto entre módulos
    ├── src/datos/             (M1) carga data/*.json → series normalizadas
    ├── src/sonido/            (M2) series → audio (Tone.js)
    ├── src/visual/            (M3) series y cursor → canvas
    ├── src/accesibilidad/     (M4) teclado, aria-live, voz, vibración, temas
    └── src/historia/          (M5) capítulos (JSON) y textos narrativos
```

**Regla de oro:** ningún módulo importa archivos internos de otro. Solo se usa (a) la función pública que cada módulo exporta en su `index.js`, documentada en [`CONTRATOS.md`](CONTRATOS.md), y (b) los eventos del bus. Si necesitas algo de otro módulo, abre un issue y su dueño lo agrega.

Flujo de una reproducción:
```
[usuario pulsa Escuchar]
  → accesibilidad/ui emite  bus "play:toggle"
  → app/main llama           sonido.play(serie, opciones)
  → sonido emite cada mes    bus "tick" {i, lugar, lluvia, temp, ratio}
       ├→ visual mueve el cursor
       ├→ accesibilidad actualiza el subtítulo y vibra
       └→ historia cambia de capítulo si corresponde
```

---

## 6. Reparto: 6 miembros, 6 módulos

Cada persona es **dueña** de una carpeta (ver `.github/CODEOWNERS`) y trabaja en su rama `mod/<nombre>`. Para tocar algo ajeno se abre un issue o se pide un PR al dueño.

### M1 · Datos NASA (`data/`, `scripts/`, `src/datos/`)
**Perfil:** quien maneje Python o tenga curiosidad por la ciencia de datos.
- [ ] `scripts/descargar_power.py`: descarga PRECTOTCORR, T2M y RH2M mensuales 1981–2024 para los 3 puntos y guarda `data/nasa_power_monthly.json` (ya hay una primera versión del JSON en el repo).
- [ ] Calcular por lugar: mediana, máximo, mín./máx. de temperatura, promedios anuales y **ratio** (lluvia / mediana).
- [ ] `src/datos/index.js`: `cargarSeries()` y `getSerie(lugar)` según el contrato.
- [ ] Verificar las cifras de la tabla de la sección 2 y escribir `docs/DATOS.md` (fuente, parámetros, unidades, limitaciones: POWER usa reanálisis MERRA-2 con celdas de ~50 km, no una estación local).
- [ ] *(Extra)* Validar con un dato independiente (por ejemplo, noticias o reportes de SENAMHI sobre 2017) para el pitch.
- **Hecho cuando:** el JSON pasa un test simple (528 meses por lugar, sin `-999`) y `getSerie('chiclayo')` responde.

### M2 · Motor de sonificación (`src/sonido/`)
**Perfil:** quien sepa algo de música o de audio, o quiera aprender Tone.js.
- [ ] `play(serie, opciones)`, `pause()`, `seek(i)`, `playStep(i)` (un solo mes, para el modo explorar).
- [ ] Tres capas: **gotas** (lluvia), **tono de fondo** (temperatura) y **silbido** (anomalía ≥10×).
- [ ] Escalas: pentatónica andina (por defecto), mayor y cromática. La altura puede seguir a la temperatura o a la lluvia.
- [ ] 3 instrumentos: silbido de huaco (Chiclayo), marimba de agua (Galápagos), tambor amazónico (Iquitos).
- [ ] Emitir `tick` en el bus en cada mes.
- [ ] *(Extra)* Grabar un sample real de un huaco silbador (réplica) y usarlo en lugar del silbido sintético. *(Extra)* Exportar .wav.
- **Hecho cuando:** con los ojos cerrados se distingue 2017 de 2010.

### M3 · Visualización (`src/visual/`)
**Perfil:** quien disfrute del diseño visual y de canvas.
- [ ] Gráfico de barras mensual en canvas con cursor sincronizado al `tick`, responsive.
- [ ] Panel "ahora": mes, mm/día, ×normal y °C.
- [ ] Vista **Orquesta**: 3 filas (una por lugar), barras anuales y un color por lugar (que se distinga también por luminosidad, no solo por tono).
- [ ] Animación de gotas que caen (respetando `prefers-reduced-motion`).
- [ ] *(Extra)* Imagen de Worldview de marzo de 2017 en el capítulo 3 (API de snapshots de Worldview, sin cuenta).
- **Hecho cuando:** el cursor nunca se desincroniza del audio más de un mes.

### M4 · Accesibilidad y multisensorial (`src/accesibilidad/`)
**Perfil:** quien tenga empatía de usuario. Ideal si puede probar con una persona con discapacidad visual.
- [ ] Controles con teclado: espacio (play/pausa), flechas (mes), Shift+flechas (año), `L` (leer en voz alta).
- [ ] Subtítulos de sonido en una región `aria-live`, por ejemplo: `[marzo 2017] el huaco silba, lluvia extrema (6,2 mm/día)`.
- [ ] Narración con `speechSynthesis` en `es-PE`.
- [ ] Vibración (`navigator.vibrate`) proporcional a las gotas, en móvil.
- [ ] Temas: normal, **alto contraste** y texto grande. Contraste AA verificado.
- [ ] Prueba con lector de pantalla (NVDA en Windows o TalkBack en Android) y video corto de esa prueba para el pitch.
- **Hecho cuando:** se recorre toda la historia **sin mirar la pantalla**.

### M5 · Historia, contenido y pitch (`src/historia/`, `docs/pitch/`)
**Perfil:** quien mejor cuente historias o hable en público.
- [ ] `src/historia/capitulos.json`: 5 capítulos (inicio, título, texto y frase narrada).
- [ ] Investigar y citar el huaco silbador (Museo Tumbas Reales de Sipán, Museo Brüning) y los eventos de 1998, 2017 y 2023.
- [ ] Conseguir una réplica de huaco silbador para el pitch en vivo y grabar su sonido para M2.
- [ ] Guion del pitch, video de 30 s / 2 min y slides.
- [ ] Textos del formulario de envío de Space Apps.
- **Hecho cuando:** el pitch se ensaya completo 2 veces dentro del tiempo.

### M6 · App, integración, Laboratorio y despliegue (`index.html`, `src/app/`, `.github/`)
**Perfil:** quien tenga más experiencia con Git y JavaScript.
- [ ] En la hora 0: `bus.js` y `CONTRATOS.md` cerrados con todo el equipo, más el esqueleto de `index.html` que monta los módulos.
- [ ] Navegación: Historia, Orquesta y Laboratorio.
- [ ] Vista **Laboratorio**: selectores que llaman a la API pública de `sonido`.
- [ ] GitHub Pages, revisión de PRs y merges de integración en las horas 12, 24 y 36.
- [ ] Pie de página con créditos y declaración de IA. Mantener `docs/CREDITOS.md`.
- **Hecho cuando:** la URL pública funciona en Chrome de escritorio y de Android.

---

## 7. Cronograma de las 48 horas

| Hora | Hito | Quién |
|---|---|---|
| Antes | Cuenta Earthdata (opcional), clonar el repo, instalar VS Code y la extensión Live Server, conseguir la réplica de huaco | Todos |
| 0–2 | **Kickoff**: leer este plan, firmar los contratos, crear ramas | Todos (lo lidera M6) |
| 2–12 | Construcción en paralelo, cada quien en su módulo y con datos simulados si hace falta | Todos |
| 12 | **Integración 1**: play → tick → cursor y subtítulo | M6 + todos |
| 12–24 | MVP completo | Todos |
| 24 | **Integración 2**: MVP de punta a punta en GitHub Pages | M6 |
| 24–30 | Bugs y prueba con lector de pantalla | M4 lidera |
| 30 | **Congelar MVP**. Desde aquí, solo extras en ramas aparte | Todos |
| 30–40 | Extras (Orquesta, Laboratorio, Worldview, .wav), video y slides | M2, M3, M6 / M5 |
| 40–44 | Congelar código. Ensayos del pitch | M5 lidera |
| 44–48 | Envío: repo, video, descripción y declaración de IA | M5 + M6 |

Hay un *stand-up* de 5 min cada 6 horas con tres preguntas: ¿qué terminé?, ¿qué me bloquea?, ¿qué contrato necesito?

---

## 8. Uso de IA: declaración honesta

Lo dijeron claro en la charla: **citar la IA da credibilidad**. Esta es la lista real:

| Herramienta | Para qué se usó / se usará | Qué hizo un humano |
|---|---|---|
| **Claude (Anthropic) · Claude Code** | Redactar este plan, analizar los requerimientos, calcular las cifras de NASA POWER y generar la estructura del repo | El equipo revisa y ajusta el plan |
| **Claude Design (Anthropic)** | Generar el prototipo interactivo de interfaz y sonido | Se usa como boceto. El código final lo escribe y revisa el equipo |
| **Whisper (OpenAI, modelo abierto, ejecutado localmente con faster-whisper)** | Transcribir el audio de la charla de orientación | Se revisaron a mano los fragmentos citados |
| **Asistente de código (Claude / Copilot), *si se usa*** | Autocompletar y generar funciones durante la hackathon | Cada PR lo revisa otra persona y se prueba manualmente (R11) |
| **ElevenLabs (opcional)** | Voz de la narración del video, si la voz del navegador suena muy robótica | Guion escrito por el equipo. Se declara en el video |
| **Generación de imágenes** | **No planeada.** Usamos imágenes reales de la NASA (Worldview, images.nasa.gov) | Si se usara, se deja la marca de agua |

**No son IA** (para no confundir): Tone.js, Web Audio, la Web Speech API del navegador (síntesis de voz clásica) y NASA POWER (datos de modelos físicos y satélites).

Cada miembro anota en `docs/USO_DE_IA.md` cuándo usó IA y para qué (una línea por uso).

---

## 9. Cómo cumplimos los criterios de evaluación

| Criterio Space Apps | Cómo lo atacamos |
|---|---|
| **Impacto** | Ciencia climática accesible para personas ciegas o con baja visión. Educación sobre El Niño en una región que lo sufre |
| **Creatividad** | Huaco silbador precolombino × datos satelitales. Escala pentatónica andina |
| **Validez** | Datos reales de NASA POWER, cifras reproducibles con un script público y limitaciones declaradas |
| **Relevancia** | Responde directo al reto 5: sonificación, inclusión y cruce de variables |
| **Presentación** | Pitch en 3 actos con un objeto real en el escenario y demo con los ojos cerrados |

---

## 10. Riesgos y plan B

| Riesgo | Plan B |
|---|---|
| Se cae el wifi o la API durante la demo | La app usa un JSON local y el audio se genera en el navegador, sin red |
| Tone.js da problemas | Volver a Web Audio puro (el prototipo ya funciona así) |
| El navegador bloquea el audio sin interacción | El audio arranca solo tras el clic en "Escuchar" |
| Conflictos de Git | Carpetas separadas, CODEOWNERS y merges pequeños y frecuentes |
| No llegamos a los extras | El MVP se congela en la hora 30, así que siempre hay algo que mostrar |
| Alguien se enferma o se va | Cada módulo tiene README y contrato para que otro lo tome |

---

## 11. Guion del pitch (3 minutos)

- **0:00–0:25** — En silencio, alguien inclina el huaco silbador. *"Esto lo hicieron en Lambayeque hace más de mil años. Agua que se convierte en sonido."*
- **0:25–0:50** — *"Chiclayo es desierto. Pero en 2017 llovió 62 veces lo normal. ¿Cómo explicas eso a alguien que no puede ver un gráfico?"*
- **0:50–1:50** — Demo: *"Cierren los ojos."* Suenan 44 años. Se oye 1998, luego 2017 y luego 2023.
- **1:50–2:30** — Orquesta del Pacífico y modo accesible (lector de pantalla y vibración).
- **2:30–3:00** — Datos NASA POWER, código abierto, IA declarada. *"La ciencia no debería necesitar ojos. Somos Los Silbadores de Ñaylamp."*
