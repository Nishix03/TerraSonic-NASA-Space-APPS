# Terrasonic — Plan de desarrollo
### NASA Space Apps 2026 · Reto 5: *The Earth Information Jukebox*

> **En una frase:** hace más de 1500 años, los huacos silbadores moche ya convertían el agua en sonido. **Terrasonic** es una *jukebox* retro pixelada que escanea los fotogramas de las visualizaciones del **Earth Information Center (EIC)** de la NASA y los convierte en música en tiempo real, tocada por una banda de cinco personajes andinos. Así cualquiera, incluso quien no ve, puede **escuchar** cómo se calienta el Pacífico.

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
9. [Plan de avatares anime con IA](#9-plan-de-avatares-anime-con-ia)
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
| E9 | **Traducción exploratoria** | "the translation from sight to sound is exploratory" | Zona **«Tus datos»**: la persona sube su propia imagen o CSV y lo escucha (sección 4.1) |

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
| R10 | **Declarar el uso de IA** (con marca de agua) | 06:03–06:52 | Sección 11 y etiqueta en cada avatar generado con IA |
| R11 | **Supervisar el código generado por IA** | 07:03 | Revisión cruzada de PRs |
| R12 | **Reutilizar repositorios y citarlos** | 07:21 | `docs/CREDITOS.md` |

---

## 2. La idea y la historia

**El gancho.** En Lambayeque, las culturas moche y lambayeque hacían botellas silbadoras: al inclinarlas, el agua empuja el aire y la vasija silba. El agua ya sonaba aquí hace siglos.

**El conflicto.** El Pacífico frente al Perú cambia de color en los mapas de la NASA, y cuando se pone rojo (El Niño) el desierto de Chiclayo se inunda. En 2017, el Niño Costero trajo 62 veces la lluvia normal (NASA POWER). Pero esos mapas son pura vista: una persona ciega no puede "leerlos".

**La resolución.** Terrasonic es una jukebox con 5 discos, y cada disco es una secuencia de fotogramas de anomalía de temperatura del mar:

| Disco | Periodo | Lo que se oye (medido por nuestro analizador) |
|---|---|---|
| 1 · La Niña | ago 2010 – ene 2011 | Mamacocha domina (frío 1,63), Inti casi no toca y Silbo calla (costa −1,4) |
| 2 · El Niño «Godzilla» | jul – dic 2015 | Inti a todo volumen, 36% de píxeles extremos e Illapa truena |
| 3 · Niño Costero | dic 2016 – may 2017 | El océano está tibio, pero la costa del Perú arde (+3,9): Silbo silba |
| 4 · Yaku | ene – jun 2023 | La costa pasa de −0,3 a +4,4 en tres meses y se oye cómo Silbo despierta |
| 5 · El Niño 2023 | jul – dic 2023 | Toda la banda a la vez |

*(Valores del analizador del prototipo sobre fotogramas GHRSST MUR. La escala va de −5 a +5 y es la de la paleta de color, no grados exactos.)*

**Nombre del equipo:** *Los Silbadores de Ñaylamp*. Según la leyenda, Ñaylamp, fundador de Lambayeque, llegó por el mar, igual que El Niño.

### Identidad de marca: **Terrasonic**
| Elemento | Decisión |
|---|---|
| **Nombre** | **Terrasonic** · *Earth Information Jukebox*. En inglés y profesional: *Terra* = Tierra (y el nombre de un satélite de observación de la NASA) + *sonic* = sonido. Eslogan: *"Hear the Earth."* Alternativas que descartamos: Echo Earth, Orbitone, Earthsong |
| **Mascota** | Silbo, el huaco silbador, sigue siendo el hilo cultural de la historia. El nombre del producto ya no depende de él |
| **Logo** | Planeta Tierra en pixel art con un anillo orbital y un satélite que emite tres ondas de sonido (amarillo → naranja → rojo, la escala de calor de los mapas). El prototipo trae una primera versión; M4 la pule |
| **Fondo animado** | Campo de estrellas que titila, un satélite que cruza, estrellas fugaces y un horizonte de la Tierra cuyo resplandor **cambia con el fotograma** (cian si domina el frío, naranja si hay calor, rojo con extremos). Una línea de escaneo recorre el horizonte, igual que el cabezal de la jukebox. Se desactiva con alto contraste y `prefers-reduced-motion` |
| **Transiciones y efectos** | Entrada escalonada de las secciones, elevación al pasar el cursor, fundido con desenfoque al cambiar de fotograma, cabezal de escaneo con brillo y movimiento suave, celdas y medidores que se animan, el protagonista entra deslizando y el botón principal late mientras espera. Todo se apaga con `prefers-reduced-motion` |
| **Transición entre páginas** | Estilo videojuego: un **satélite pixelado cruza la pantalla** de izquierda a derecha dejando una estela, mientras 14 barras verticales cubren y descubren la pantalla y aparece el rótulo «PÁGINA 0N · NOMBRE». El contenido cambia cuando la pantalla está cubierta (~0,5 s) y todo dura ~1,1 s. Detalles y límites de seguridad en §4.2 |
| **Logos de la NASA** | Solo se usan los **oficiales** del reto. El kit de logos y la guía de marca de Space Apps se descargan desde https://www.spaceappschallenge.org/brand/. **No dibujamos réplicas** del emblema de la NASA. Para el uso del emblema de la NASA se consulta la guía de marca o se escribe al equipo de Space Apps. El prototipo reserva el espacio y lleva el aviso *"Proyecto independiente, no respaldado por NASA"* |
| **Nombre del equipo** | *Los Silbadores de Ñaylamp* se mantiene como nombre del equipo (distinto del nombre del producto). Si quieren cambiarlo también, queda como decisión del kickoff |

---

## 3. La banda: cinco avatares anime, cinco conjuntos de sonidos

Cada personaje es **un conjunto de sonidos ligado a un rasgo visual**. La personalidad ayuda a contar la historia ("Illapa casi nunca aparece; si aparece, es en serio") y hace que la sonificación se entienda sin explicar teoría.

| Personaje | Origen del nombre | Escucha (rasgo visual) | Toca (sonido) | Carácter |
|---|---|---|---|---|
| **SILBO** | Huaco silbador moche | Recuadro de la costa norte del Perú (82°–76°O, 3°–18°S) | Silbido de vasija con vibrato cuando la costa supera +2 | Viejo y sabio. Narrador y alarma |
| **INTI** | Sol (quechua) | Promedio de píxeles cálidos cada 4 columnas | Acordes de marimba: C, F, G y E (tensión) | Entusiasta y ruidoso |
| **MAMACOCHA** | Madre del mar (cosmovisión andina) | Promedio de píxeles fríos | Bajo profundo | Calma protectora. Si calla, algo anda mal |
| **YAKU** | Agua (quechua) | Densidad de celdas con anomalía ±2 o más por columna, y su latitud | Gotas en pentatónica andina, más agudas hacia el norte | Inquieto y travieso |
| **ILLAPA** | Rayo y trueno (cosmovisión andina) | Columnas con ≥25% de píxeles extremos (+4,5/+5) | Truenos graves | Aparece poco. Cuando llega, todos callan |

**Cómo se ven:** cada personaje es un **avatar 2D original, detallado y animado, de estética anime**, con ropa aesthetic que fusiona motivos andinos con techwear/streetwear, y comparte el estilo visual de la página (paleta de la escala de anomalías, contornos de 4 px y marco pixelado). Acompañan cada fotograma y reaccionan al sonido de su voz. Diseño y producción: sección 9.

### Banda en vivo y protagonista por disco
Cada disco tiene **un protagonista**, el personaje que mejor cuenta ese evento. Es el que se muestra grande junto al fotograma.

| Disco | Protagonista | Por qué |
|---|---|---|
| 1 · La Niña | **Mamacocha** | Domina el agua fría: su bajo es lo que más suena |
| 2 · El Niño «Godzilla» | **Inti** | Un océano rojo: los acordes cálidos mandan |
| 3 · Niño Costero | **Silbo** | La costa del Perú arde: es su silbido de alarma |
| 4 · Yaku | **Yaku** | Es el nombre del evento y su lluvia de gotas |
| 5 · El Niño 2023 | **Illapa** | Los extremos: truenos |
| Tus datos | **Inti** o **Mamacocha** | Según predomine lo cálido o lo frío en el archivo |

Reglas de la banda en vivo:
1. Al abrir la app la banda está **apagada**: no suena ninguna voz.
2. Al elegir un disco se enciende **solo su protagonista**; las demás voces se apagan.
3. La persona puede **encender a cada personaje** con su botón ON/OFF, o usar **«Banda completa»** y **«Apagar banda»**, hasta armar la banda de cinco.
4. Si pulsa Reproducir con la banda apagada, se enciende el protagonista del disco y la app lo avisa (así nunca se queda en silencio sin explicación).
5. El personaje grande siempre es el protagonista del disco y muestra su estado: *apagado*, *calmo*, *activo* o *intenso*.

Respeto cultural: M5 valida los nombres y las descripciones con fuentes, como el Museo Tumbas Reales de Sipán y el Museo Brüning, y evita caricaturizar a las divinidades.

---

## 4. Qué construimos (alcance)

### MVP (obligatorio, listo a la hora 30)
1. **Jukebox** con 5 discos de 6 fotogramas cada uno: reproducir/pausar, tira de fotogramas, fotograma anterior/siguiente y velocidad del escaneo.
2. **Analizador visual en el navegador**: cuadrícula 28×16, clasificación de color → nivel y recuadro de la costa.
3. **La banda** sonando en tiempo real: 5 voces. Inicia apagada, cada disco enciende a su protagonista y se pueden ir sumando los demás hasta la banda completa (sección 3). El sonido sale del motor **Melodía compuesta** (por defecto) o de **Datos puros**, a elección (sección 5.1).
4. **Visualización**: cabezal de escaneo sobre el fotograma, vista "lo que oye la máquina" y medidores por personaje.
5. **Accesibilidad**: subtítulos de sonido, botón "Describir fotograma" (texto y voz), vibración, alto contraste, texto grande, fuente legible y todo con teclado.
6. **Identidad Terrasonic** (logo, fondo espacial animado que reacciona al fotograma) y los **5 avatares en dos versiones**: modelo anime grande junto al fotograma y sprite 32×32 (respiración, parpadeo y 3 estados según su voz; ver sección 9).
7. **«Tus datos»**: subir una imagen o un CSV y escucharlo con la misma banda, **en su propia página** (sección 4.1). Va dentro del MVP, pero **después del núcleo** (horas 24–30).
8. **Página «Tecnología»**: una pestaña de la app que muestra qué tecnologías, datos y herramientas de IA se usaron, con su estado (*en el prototipo* o *planeado*) y la declaración de uso de IA (sección 6.1).
9. **Escenario de la banda**: sprites animados de cada personaje encendido, que tocan su instrumento según su participación en la melodía. Si un personaje se apaga, desaparece del escenario, y el panel del protagonista se anima igual que su sprite (sección 4.3).
10. **Versión móvil** bien adaptada: una columna, barra de pestañas inferior, reproductor fijo y escenario compacto (sección 4.4).

### Extras (solo con el MVP cerrado)
11. Más discos del EIC: **Global Temperature Anomalies 1880–2023** (SVS 5207) y **Seasonal Global Precipitation, GPM** (SVS 4897). Para el de lluvia, Yaku pasa a escuchar la densidad de precipitación.
12. **Eco de Chiclayo** (R4): tras cada disco suena la lluvia mensual real de Chiclayo de NASA POWER (ya descargada en `data/`).
13. **Exportar .wav** de cada disco (playlist de respaldo para el envío).
14. **Ropa alternativa por disco** (variante según el evento), efectos de gotas y destellos, y animación avanzada de los avatares (Live2D/Spine solo si alguien ya lo domina).

### Fuera de alcance
Backend, login, base de datos, entrenar modelos de ML, app nativa.

### 4.1 «Tus datos»: subir un archivo y escucharlo
| Aspecto | Decisión |
|---|---|
| **Qué acepta** | Una **imagen** (PNG, JPG, WebP, GIF) o un **CSV/TSV/TXT** con una columna numérica (mínimo 8 valores, hasta 5000 filas). Máximo 8 MB |
| **Dónde vive** | En su **propia página** «Tus datos» (ya no dentro de la jukebox). Al cargar un archivo aparece el mismo reproductor, con su banda y su protagonista |
| **Imagen** | Misma cuadrícula 28×16 y mismo escaneo. Dos modos: **Mapa de anomalía** (paleta NASA, para mapas del EIC) y **Color libre** (cualquier imagen: lo cálido suma, lo frío resta y los grises siguen el brillo) |
| **CSV** | La serie se resume en 28 columnas (se conserva el valor más extremo de cada grupo). Lo que está **sobre la media** se lee como cálido (Inti y Yaku, y Illapa si es extremo) y lo que está **bajo la media** como frío (Mamacocha). La persona elige la columna; por defecto se evita una columna que sea solo un índice (año, número de fila) |
| **Ejemplo incluido** | Lluvia mensual de Chiclayo 2015–2018 (NASA POWER) para probar sin tener archivos |
| **Privacidad** | Todo se procesa en el navegador. **El archivo no se sube a ningún servidor** |
| **Accesibilidad** | Zona de carga con teclado (`label` + `input`), mensajes de estado en `aria-live` y descripción por voz del resultado |
| **Límites honestos** | Es una sonificación artística: los niveles de una imagen libre no son magnitudes físicas. El silbido de Silbo (costa del Perú) solo aplica a los fotogramas del EIC |
| **Responsables** | M2 (análisis), M4 (interfaz), M5 (accesibilidad), M6 (integración) |
| **Prioridad** | Dentro del MVP, después del núcleo (horas 24–30). Si no llega, pasa a extra |

### 4.2 Navegación, transiciones y reglas de interfaz
La app tiene **cinco páginas**: *Jukebox*, *La banda*, *Tus datos*, *Cómo suena* y *Tecnología*.

| Tema | Decisión |
|---|---|
| **Transición del satélite** | Al cambiar de página, un satélite pixelado cruza la pantalla con una estela y 14 barras verticales cubren y descubren la imagen. En el centro aparece «PÁGINA 0N» y el nombre de la página, como el cambio de nivel de un videojuego. El contenido cambia a ~0,5 s y todo dura ~1,1 s |
| **Seguridad y accesibilidad de la transición** | Sin destellos rápidos (nada parpadea más de 3 veces por segundo). Con `prefers-reduced-motion` la página cambia al instante, sin animación. La transición bloquea los clics solo ese ~1 s. Al terminar se anuncia «Página: NOMBRE» en una región `aria-live` |
| **Sin espacios en blanco** | En la jukebox, la columna izquierda (discos y banda) y el panel derecho miden **lo mismo de alto** y se rellenan: la nota de fuente y el subtítulo se anclan abajo. Las cuadrículas de tarjetas rellenan su última fila. No hay columnas vacías (por ejemplo, la página *La banda* trae una sexta tarjeta, «Banda completa») |
| **Personaje grande** | El modelo detallado ocupa la columna derecha del reproductor (~400×600 px, casi el doble que antes) y se estira a la altura del fotograma, la cuadrícula y las estadísticas |
| **Banda en vivo** | Es un mezclador en la columna izquierda, debajo de los discos. Inicia apagada (§3) |
| **Tus datos** | Página propia, con su zona de carga a la izquierda y, al cargar un archivo, el mismo reproductor a la derecha. Sin archivo, la derecha explica cómo se lee una imagen y un CSV |
| **Flechas animadas** | Los botones «anterior» y «siguiente» se sustituyen por **flechas pixeladas animadas** a los lados del fotograma: se deslizan en reposo, más rápido al pasar el cursor, se desactivan en los extremos y tienen `aria-label`. Se añade el contador «fotograma N de 6» |
| **Selector de motor de sonido** | Tarjeta «Motor de sonido» en la columna izquierda: *Melodía compuesta*, *Datos puros* y, planeadas y desactivadas, *IA en el navegador* e *IA generativa en la nube* |
| **«Por qué suena así»** | Panel dentro del reproductor que empareja **lo que ves** (descripción del fotograma) con **lo que oyes** (tonalidad, tempo y progresión con el acorde activo resaltado), y explica cuatro decisiones. Cubre «contar el porqué» y «documentar el proceso» del reto |
| **Objetivos del reto en la interfaz** | La página *Cómo suena* trae «Lo que pide el reto y dónde verlo»: ocho objetivos, cada uno con un botón que lleva a la página donde se cumple |
| **Responsables** | M4 (visual y animación), M6 (orquesta el cambio de página y el estado de la banda) y M5 (aviso `aria-live` y modo sin movimiento) |

### 4.3 El escenario de la banda
Al pie de las páginas *Jukebox* y *Tus datos* hay un **escenario** donde se ve quién está tocando y cómo. Refuerza el núcleo del reto: que lo que se ve y lo que se oye vayan juntos.

| Tema | Decisión |
|---|---|
| **Ubicación** | Parte inferior de la página, debajo del reproductor y a todo el ancho |
| **Quién aparece** | Solo los personajes **encendidos (ON)**. Si uno se apaga, **desaparece** del escenario (se encoge y se desvanece) y los demás se reparten el espacio. Al encenderlo, **vuelve a entrar** con un salto. Con la banda apagada se ve el cartel «Escenario vacío» |
| **Escena** | Telón y cenefa, tarima de madera, un reflector por músico (más intenso cuando toca) y, de fondo, **el fotograma que suena** con su cabezal de escaneo. Abajo, un metrónomo de 8 pasos, el acorde actual y los pulsos por minuto |
| **Participación → animación** | Cada voz se anima con tres señales que salen del motor de sonido: **estado** (calmo = *idle*; activo = *tocar*), **disparo** (cada nota que toca la voz lanza su gesto: golpe, nota, gota, latido) y **ritmo** (el balanceo o el rebote duran 60 / ppm segundos, es decir, siguen el tempo del disco) |
| **Protagonista del disco** | El modelo grande usa **exactamente el mismo estado** que su sprite del escenario: mismos clips, mismos disparos y mismo ritmo. Si en el escenario toca la marimba, en el panel también. Si el personaje está apagado, el panel lo muestra atenuado y quieto |
| **Partículas y efectos** | Notas (♪ ♫ ♩), gotas (▾) y chispas (✦) suben y se desvanecen con cada disparo. El **trueno** de Illapa da un destello suave y un temblor corto del escenario |
| **Accesibilidad** | El escenario es decorativo (`aria-hidden`); la información equivalente está en los subtítulos de sonido y en la región «En el escenario: …» (`aria-live`). El destello es único, de máximo 35 % de opacidad, nunca más de 3 por segundo, y se desactiva con `prefers-reduced-motion` |
| **Fuente de verdad** | Un único estado: el evento `voces` (niveles, `disparos` y `trueno`) más el ON/OFF de la banda. El escenario y el protagonista solo lo dibujan, así que nunca se desincronizan |

#### Hoja de animaciones (clips) por personaje
Todos tienen además `aparecer` y `salir` (4 frames).

| Personaje | Instrumento | Clips | Qué los dispara |
|---|---|---|---|
| **Silbo** | Flauta | `idle` (respira, 2 f, bucle) · `tocar_flauta` (se balancea al pulso, 4 f, bucle) · `nota` (sube la flauta, 3 f) · `motivo_silbo` (levanta la botella y silba, 6 f) | Nivel ≥ 0,15 → `tocar`. Cada nota → `nota`. Costa > +2 → `motivo_silbo` |
| **Inti** | Marimba | `idle` · `tocar_marimba` (rebota al pulso) · `golpe_izq` / `golpe_der` (2 f, los mazos alternan en cada arpegio) · `acento` (acorde fuerte, 4 f) | Cada nota del arpegio → golpe. Mucho calor → `acento` |
| **Mamacocha** | Bajo + colchón | `idle` (olas) · `tocar_pad` (onda lenta) · `acorde` (anillo de agua al cambiar de acorde, 4 f) · `apagarse` (se encoge cuando el mar se calienta y casi no suena, 6 f) | Cada cambio de acorde → `acorde`. Nivel muy bajo → `apagarse` |
| **Yaku** | Gotero | `idle` · `saltar` (salta al pulso) · `gota` (cae una gota, 3 f) · `salpicadura` (dos gotas a la vez, 4 f) | Cada gota → `gota`. Dos gotas juntas → `salpicadura` |
| **Illapa** | Timbal | `idle` (inmóvil) · `latido` (golpe suave cada 8 pasos, 3 f) · `trueno` (golpe fuerte y relámpago, 6 f) | Cada 8 pasos → `latido`. Columna extrema → `trueno` |

**Arte:** sprite de 32×32 con al menos 4 frames por clip a 8–12 fps, escalado en múltiplos enteros (×4 = 128 px) para que quede nítido. El modelo detallado se anima por capas (cuerpo, cabeza, brazos, instrumento) con los mismos nombres de clip. El prototipo ya trae **placeholders animados** (una caja punteada para el personaje y otra para el instrumento) que muestran los gestos, los disparos y la sincronización; M4 los reemplaza por el arte real sin cambiar el código.

**Orden de trabajo:** (1) placeholders animados *(hecho en el prototipo)*, (2) sprites 32×32 estáticos, (3) clips `idle` y `tocar`, (4) disparos y efectos, (5) `aparecer`/`salir` y detalles.

### 4.4 Versión móvil (diseño y plan)
**Objetivo:** que toda la app se use con una mano, en vertical, en un teléfono de gama media (360–430 px de ancho), sin perder el escenario, la banda ni la accesibilidad. Muchas personas con baja visión usan el móvil con TalkBack o VoiceOver, así que esta versión es parte del núcleo del reto, no un adorno.

**Estado honesto:** el prototipo actual ya apila las columnas y el escenario es proporcional al ancho, pero **no tiene todavía** la barra inferior, el reproductor fijo ni los acordeones, y no lo he probado en un teléfono. Lo siguiente está **planeado**.

| Ancho | Diseño |
|---|---|
| **≥ 1100 px** (escritorio) | Dos columnas (discos y banda a la izquierda, reproductor a la derecha) y escenario debajo |
| **700–1099 px** (tableta) | Discos en una fila horizontal arriba, reproductor a ancho completo, mezclador de la banda debajo del reproductor y escenario al pie |
| **< 700 px** (móvil vertical) | Una sola columna, barra de pestañas inferior y reproductor fijo |
| **Móvil horizontal** | Dos columnas: fotograma a un lado y escenario al otro, con la barra de reproducción lateral |

**Principios:** pulgar y una mano (las acciones principales en la mitad inferior, objetivos táctiles de al menos 48 px, texto de al menos 16 px, nada que dependa del hover); una pantalla, una tarea (lo secundario va plegado en acordeones); rendimiento y batería; y que funcione sin conexión.

**Página Jukebox en el móvil, de arriba abajo:**
1. **Barra superior compacta** (56 px): logo Terrasonic, espacio pequeño para el logo oficial de Space Apps y un botón «Accesibilidad» que abre una hoja con contraste, texto grande, fuente legible, voz y vibración.
2. **Selector de discos:** carrusel horizontal con ajuste de posición; 5 fichas con el color del disco y su protagonista.
3. **Visor del fotograma** a ancho completo con las flechas animadas, el cabezal de escaneo y «fotograma N de 6». Deslizar a izquierda o derecha también cambia de fotograma (alternativa, nunca la única vía).
4. **Escenario compacto** (~200 px de alto) con sprites pequeños; los músicos apagados no aparecen.
5. **Fila de la banda:** 5 interruptores con el sprite 32×32 (un toque = ON/OFF) y, debajo, «Banda completa» y «Apagar banda».
6. **Tarjeta «Protagonista»** compacta (modelo de ~220×330 px) con el botón «Ver grande», que abre una hoja a pantalla completa. Mismo estado y misma animación que el escenario.
7. **Acordeones plegados:** «Por qué suena así», «Lo que oye la máquina», «Motor de sonido» y «Describir fotograma».
8. **Barra de reproducción fija**, justo sobre la de pestañas: botón Reproducir/Pausa grande (56 px), acorde actual y velocidad. Siempre al alcance del pulgar.
9. **Barra de pestañas inferior** (5 iconos con etiqueta): Jukebox, Banda, Datos, Método y Tecnología.

**Otras páginas:** *La banda* en una columna, con el modelo grande en un carrusel. *Tus datos* con un botón grande «Elegir archivo» y otro «Tomar foto» (cámara), el ejemplo de Chiclayo y el reproductor debajo, con el mismo diseño. *Cómo suena* con acordeones y los objetivos del reto en tarjetas apiladas con botón «Ir a». *Tecnología* con filtros que se desplazan en horizontal y fichas en una columna.

| Aspecto | Decisión |
|---|---|
| **Transición y fondo** | La transición del satélite dura ~0,7 s con 8 barras y solo usa `transform` y `opacity`. El fondo espacial lleva 30 estrellas, sin estrella fugaz. Todo se pausa con la pestaña oculta o con `prefers-reduced-motion` |
| **Viewport y áreas seguras** | `meta viewport` con `viewport-fit=cover` y `env(safe-area-inset-*)` en las barras fijas (iPhone con muesca) |
| **Audio** | Se desbloquea con el primer toque. Se avisa si el interruptor de silencio del iPhone está activado. El audio se corta con la pantalla bloqueada: opcionalmente se usa Wake Lock mientras suena |
| **Vibración** | La Vibration API no existe en el Safari de iPhone: hay alternativa visual (pulso del escenario) y nada depende de la vibración |
| **Imágenes** | Fotogramas en dos tamaños (560×320 y 280×160) con `srcset`; el análisis usa 140×80 en ambos |
| **Rendimiento** | Objetivo de 60 fps en un Android de gama media (4 GB de RAM): animaciones solo con `transform`/`opacity`, como máximo 5 partículas visibles y sin `backdrop-filter` |
| **Sin conexión** | PWA (manifest y service worker) que guarda los 30 fotogramas (~1,3 MB), el JSON y el código, con icono para añadir a la pantalla de inicio |
| **Gestos** | Deslizar para cambiar de fotograma y mantener pulsado un músico para ver su ficha, siempre como atajo |
| **Accesibilidad** | TalkBack y VoiceOver con orden de lectura lógico, etiquetas en todos los iconos, contraste AA, el escenario como decoración y respeto al tamaño de texto del sistema |

**Matriz de pruebas:** iPhone SE y iPhone 14/15 (Safari), Pixel 7 y un Samsung Galaxy A de gama media (Chrome), una tableta, conexión lenta y modo sin conexión, con TalkBack y con VoiceOver.

**Responsables:** M4 (diseño responsivo), M6 (PWA, viewport, desbloqueo de audio y caché), M5 (accesibilidad móvil y pruebas con TalkBack y VoiceOver), M3 (audio en iOS) y M1 (tamaños de fotograma y lista de caché).

**Plan de trabajo:** primero una **maqueta móvil en Claude Design** (artboards de 390×844 y 360×800) para aprobarla; luego el CSS responsivo (horas 12–24) y, por último, pruebas en dispositivos reales (horas 24–30).

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

### 5.1 Capa musical: de datos a melodía (investigación y decisión)
**Pregunta del equipo:** ¿se puede lograr que los sonidos que salen del análisis de los fotogramas suenen como una melodía con sentido, que represente a cada disco y personaje? **Sí.** Suena "aleatorio" cuando cada píxel se convierte en una nota suelta, sin tonalidad, sin ritmo y sin acordes. Se arregla de dos maneras que se pueden combinar: **componer con reglas musicales** (lo que hace el prototipo) y, opcionalmente, **sumar IA generativa**.

**Qué pide el reto:** sonificaciones "generadas en tiempo real" a partir de los fotogramas y un equilibrio "entre la traducción estricta de datos y la musicalidad", con escalas, armonías y salidas "agradables". Permite reglas artísticas, aprendizaje automático, sintetizadores de código abierto, o una colección de audios generados.

#### Opciones investigadas
Investigación hecha con documentación pública el 5 de noviembre de 2026. **Precios, licencias y estado de cada servicio deben verificarse antes de usarlos**: varias fuentes secundarias se contradicen.

| Opción | Qué es | Tiempo real | Fidelidad a los datos | Requisitos y costo | Veredicto |
|---|---|---|---|---|---|
| **Compositor por reglas en el navegador** (Web Audio; Tone.js y Tonal.js opcionales) | Teoría musical programada: tonalidad, acordes, ritmo y melodía que salen de los datos | Sí | **Alta**: cada nota se explica | Gratis, sin servidor ni cuenta, funciona sin internet | **Recomendado. Es el MVP y ya está en el prototipo** |
| **Magenta.js** (MusicRNN, MusicVAE) | Modelos de IA de código abierto que corren en el navegador con TensorFlow.js. Solo inferencia | Casi (tarda unos segundos en generar) | Media: varía o continúa un motivo que ya viene de los datos | Gratis. Hay que descargar los modelos (se alojan en Google Cloud Storage). Verificar versión y mantenimiento | Extra opcional: «IA en el navegador» |
| **Lyria RealTime** (Gemini API) | Modelo de Google que genera música instrumental en streaming por WebSocket. Parámetros: tempo (60–200), densidad, brillo y escala. La salida lleva marca de agua | Sí | Baja: se guía con texto y parámetros, **no con píxeles** | Es **experimental**. Pide clave de API: en una web pública quedaría expuesta, así que haría falta un servidor intermediario. Cambiar tempo o escala obliga a reiniciar el contexto. La documentación no indica precios | Experimento opcional. **No entra en el MVP** |
| **ElevenLabs Music** (`POST /v1/music`) | API de texto a música | No | Baja | Plan de pago para uso comercial (las fuentes citan desde unos 6 USD al mes) y límites mensuales. Verificar | Solo para pistas pregeneradas |
| **Stable Audio 3.0** (API, y variantes de pesos abiertos) | Texto a audio, hasta varios minutos | No | Baja | Licencia comunitaria con un tope de ingresos de la empresa (se cita 1 millón de USD). Verificar | Solo para pistas pregeneradas |

No se evaluaron Suno, Udio, MusicGen ni Mubert.

#### Decisión: arquitectura en tres capas
1. **Capa 1 · Compositor por reglas (MVP).** Es la capa que se oye por defecto. Es en tiempo real, determinista (el mismo fotograma siempre suena igual), accesible y no depende de nada externo.
2. **Capa 2 · IA en el navegador (extra).** Magenta.js varía o continúa la melodía de la capa 1 sin salir del equipo. Es la opción «IA en el navegador», hoy desactivada en el prototipo.
3. **Capa 3 · Pistas pregeneradas (extra).** Para la **playlist de respaldo** que el reto permite entregar ("una colección de audios originales generados"), y para la música del video, se generan pistas con Stable Audio o ElevenLabs **fuera de línea**, con prompts derivados de los datos de cada disco. Se declaran como IA, con su licencia revisada. Lyria RealTime queda como experimento en vivo solo si el equipo monta un servidor intermediario.

Se mantiene siempre el motor **Datos puros** para quien quiera la traducción más literal, sin "embellecer".

#### Identidad musical por disco y personaje
Cada personaje tiene su propia tonalidad, tempo y progresión. Todos los músicos tocan **dentro de la misma armonía**, así que suenan bien juntos o por separado.

| Protagonista | Tonalidad y modo | Tempo | Progresión | Carácter musical |
|---|---|---|---|---|
| **Mamacocha** (La Niña) | Re dórico | 60 ppm | Rem7 – Lam7 – Famaj7 – Domaj7 | Lento y profundo: bajo y colchón de cuerdas |
| **Inti** (Godzilla) | Mi mayor | 108 ppm | Mi – Si – Do♯m – La | Brillante y enérgico: arpegios de marimba |
| **Silbo** (Niño Costero) | La menor pentatónico | 76 ppm | Lam – Sol – Fa – Mi | Aire andino de huayno: flauta melancólica |
| **Yaku** (Yaku) | Sol mayor pentatónico | 96 ppm | Sol – Mim – Do – Re | Juguetón: gotas en pentatónica |
| **Illapa** (Niño 2023) | Si menor natural | 84 ppm | Sim – Sol – Re – La | Tensión de tormenta: timbales y trueno |

#### Reglas de composición (todas se pueden explicar)
- **Pulso:** cada columna del fotograma es una corchea. Un fotograma dura entre 8 y 14 segundos según el disco, y la velocidad (lenta, normal, rápida) cambia el tempo.
- **Armonía:** el acorde cambia cada 4 columnas siguiendo la progresión del disco. Las **últimas 4 columnas vuelven al acorde de reposo**, así cada fotograma termina con sensación de cierre.
- **Melodía (Silbo):** la anomalía más fuerte de cada columna decide la nota: **más al norte, más agudo**. Los saltos se limitan a dos grados para que suene a melodía, y en los tiempos fuertes la nota se ajusta al acorde. Si la columna es neutra, hay silencio, así que el **ritmo también cuenta los datos**.
- **Motivo de Silbo:** cuando la costa del Perú supera +2, toca su motivo descendente (en La menor pentatónico: Sol – Mi – Do – La).
- **Inti:** arpegios sobre el acorde actual; con más calor suben una octava y suenan más fuerte.
- **Mamacocha:** nota grave del acorde y colchón; su fuerza sigue al frío del fotograma.
- **Yaku:** hasta dos gotas por columna en la pentatónica de la tonalidad, con la altura según la latitud.
- **Illapa:** latido de timbal cada 8 columnas y **trueno** cuando una columna supera el 25 % de valores extremos.
- **Sonido:** reverberación generada en el navegador para que suene más cálido.

**Límites honestos:** la melodía es una **interpretación artística** de los datos, no una medición. Decide la tonalidad el equipo, no los datos; lo que sí viene de los datos es la altura, el ritmo, la intensidad y qué voces aparecen. Las capas 2 y 3 están planeadas y **no están hechas**.

**Fuentes de la investigación:** [Lyria RealTime (Google)](https://aistudio.google.com/docs/realtime-music-generation) · [Magenta.js](https://magenta.github.io/magenta-js/music/) · [@magenta/music en npm](https://npmjs.com/package/@magenta/music) · [Tonal.js](https://github.com/tonaljs/tonal) · [ElevenLabs, precios](https://www.elevenlabs.io/pricing) · [ElevenLabs, Eleven Music API](https://elevenlabs.io/hi/eleven-music-api) · [Stable Audio 3.0 (The Decoder)](https://the-decoder.com/stability-ai-launches-stable-audio-3-0-with-up-to-six-minute-tracks-and-open-weights/) · [Stability AI, licencias](https://stability.ai/license).

---

## 6. Tecnología: lo mínimo que funciona

| Necesidad | Elección | Por qué |
|---|---|---|
| App | HTML, CSS y JS con módulos ES, sin build | Lo recomendaron en la charla. Cualquiera puede editarla |
| Visión por computadora | **Canvas 2D `getImageData`** | Nativo del navegador, sin librerías |
| Audio | **Web Audio** (ya funciona en el prototipo), con compositor por reglas y reverb propios. Tone.js y Tonal.js opcionales | Sin dependencias. Ver §5.1 |
| Voz | Web Speech API | Gratis y offline |
| Fotogramas | Script Python (`scripts/descargar_fotogramas.py`) que guarda PNG en `data/fotogramas/` | La demo no depende de internet |
| Extracción desde el video del EIC | `ffmpeg -i video.mp4 -vf fps=1 frame_%03d.png` | Para los discos extra de SVS |
| Sprites | PNG con transparencia, hojas de 32×32 | Se cargan con `<img>` y `image-rendering: pixelated` |
| Hosting | GitHub Pages | URL pública para el envío |

**Fuente de los fotogramas.** La visualización EIC *Sea Surface Temperature (SST) Anomaly – Near Real Time* (SVS 5176) usa el producto **GHRSST MUR**. Como esa visualización solo cubre los últimos ~2,5 años, para los eventos de 2010–2023 descargamos el **mismo producto MUR** desde NASA GIBS/Worldview (capa `GHRSST_L4_MUR25_Sea_Surface_Temperature_Anomalies`), con el mismo encuadre para todos. Los discos extra salen directamente de los videos del EIC (SVS 5207 y 4897). Esto se declara tal cual en la app y en el envío.

### 6.1 Página «Tecnología» y herramientas de IA
La app incluye una **pestaña «Tecnología»** (ya existe en el prototipo) que lista, agrupado por categoría, todo lo que se usó para construirla: *Interfaz y código*, *Datos de la NASA* e *IA y herramientas*. Cada ficha indica para qué se usó, el módulo responsable y un estado: **En el prototipo** o **Planeado**. Tiene filtros por estado, un contador y la **declaración de uso de IA**. Dueño: M4 (interfaz) con el contenido revisado por M5; la lista se actualiza con cada herramienta nueva.

Herramientas de IA acordadas por el equipo, con su estado real:
| Herramienta | Uso | Estado |
|---|---|---|
| **Claude Design y Claude Code (Anthropic)** | Boceto interactivo, plan, análisis del audio y del reto, cálculos y estructura del repositorio | Usadas en el prototipo |
| **Whisper (OpenAI, en local)** | Transcribir la charla de orientación | Usada |
| **ChatGPT Codex (OpenAI)** | Programar **ciertas funciones** de la versión final. Propuesta: exportar .wav (M3), parser de CSV y pruebas del analizador (M2), animación por capas de los avatares (M4) y pruebas del bus (M6) | Planeada |
| **ChatGPT (OpenAI), generación de imágenes** | Conceptos de los 5 avatares (modelo anime detallado y sprite 32×32) | Planeada. **Confirmar la herramienta exacta y sus condiciones de uso antes de generar** |

Reglas para el código y las imágenes generadas con IA (R10 y R11):
- Cada función generada con Codex lleva un comentario `// Generado con ChatGPT Codex · revisado por <nombre>`, se integra con un cambio aparte, la revisa otra persona y se prueba en el navegador. Si algo no se entiende, no se integra.
- Cada imagen generada se retoca a mano, pasa la búsqueda inversa de originalidad y lleva la etiqueta visible «generado con IA».
- Cada uso se anota en `docs/USO_DE_IA.md` (fecha, quién, herramienta y prompt).
- La página «Tecnología» nunca marca como *usado* algo que todavía es *planeado*.

---

## 7. Arquitectura y contratos

```
index.html
└── src/app/main.js            (M6) arranca y monta todo
    ├── src/app/bus.js         (M6) bus de eventos: único punto de contacto
    ├── src/fotogramas/        (M1) manifiesto de discos → URLs de fotogramas
    ├── src/analizador/        (M2) fotograma → cuadrícula 28×16 + estadísticas
    ├── src/sonido/            (M3) cuadrícula + columna → la banda suena
    ├── src/arte/              (M4) visor, tira, cuadrícula, medidores, avatares
    ├── src/accesibilidad/     (M5) teclado, subtítulos, voz, vibración, temas
    └── assets/avatares/       (M4) capas PNG y manifiesto de los 5 avatares
```

Regla de oro: ningún módulo importa archivos internos de otro. Solo se usa su `index.js` público y los eventos del bus, todo documentado en [`CONTRATOS.md`](CONTRATOS.md).

Flujo: `play` → M6 avanza la columna → emite `paso {disco, fotograma, columna}` → M3 consulta a M2 (`columna(...)`) y toca → emite `voces {silbo, inti, ...}` → M4 mueve el cabezal y los medidores, y M5 escribe el subtítulo y hace vibrar.

---

## 8. Reparto: 6 miembros, 6 módulos

Cada persona es dueña de sus carpetas (`.github/CODEOWNERS`) y trabaja en la rama `mod/<módulo>`.

### M1 · Fotogramas EIC y datos (`data/`, `scripts/`, `src/fotogramas/`)
- [ ] `scripts/descargar_fotogramas.py`: 5 discos × 6 fotogramas GHRSST MUR desde Worldview, con encuadre 140°O–70°O y 25°S–15°N (las fechas están en el prototipo).
- [ ] `data/discos.json`: manifiesto con id, título, periodo, fuente, **protagonista** (`mama`, `inti`, `silbo`, `yaku` o `illapa`), fechas y ruta de cada fotograma.
- [ ] *(Extra)* Extraer fotogramas de los videos EIC SVS 5207 y 4897 con ffmpeg y agregarlos como discos 6 y 7.
- [ ] `docs/DATOS.md`: fuentes, licencias, paleta de color y limitaciones (MUR 0,25°, no son grados exactos).
- [ ] *(Extra)* Serie de lluvia de NASA POWER para el "Eco de Chiclayo" (ya está en `data/nasa_power_monthly.json`).
- [ ] Fotogramas en **dos tamaños** (560×320 y 280×160) para móviles, y la **lista de archivos** para la caché sin conexión (§4.4).
- **Hecho cuando:** `getDiscos()` devuelve los 5 discos y todas las imágenes cargan sin internet.

### M2 · Analizador visual (`src/analizador/`)
- [ ] `analizar(urlImagen)` → `{ celdas[448], calido, frio, extremo, costa }`, con canvas y `getImageData`.
- [ ] Clasificador HSV → nivel −5…+5, calibrado con los píxeles reales (la tabla está en la sección 5).
- [ ] `columna(analisis, c)` → `{ calido, frio, fuertes: [[fila, nivel]], extremo }`.
- [ ] **«Tus datos»**: `analizarArchivo(file, modo)` para imágenes (modo paleta NASA o color libre) y `analizarSerie(valores)` para CSV (sobre/bajo la media). Máximo 8 MB, mensajes claros de error.
- [ ] Test con los 30 fotogramas: que La Niña dé frío > cálido y que el Niño Costero dé costa ≥ 2.
- [ ] *(Extra)* Clasificador para la paleta de precipitación de GPM.
- **Hecho cuando:** los valores coinciden con la tabla de la sección 2 (±0,2).

### M3 · Motor de sonido: la banda (`src/sonido/`)
- [ ] Las 5 voces con Web Audio y **dos motores**: **Melodía compuesta** (por defecto; §5.1: tonalidad, tempo y progresión por personaje, melodía desde la latitud de la anomalía, cierre en el acorde de reposo y reverb) y **Datos puros** (§5). Puedes partir del código del prototipo, que ya trae ambos.
- [ ] Mezclador y **estado de la banda**: inicia apagada; `banda:preset` enciende solo al protagonista del disco, a la banda completa o a ninguno; `silenciar(personaje)` y volumen general.
- [ ] Emitir `voces` con el nivel 0…1 de cada personaje en cada paso.
- [ ] Ajuste musical: que suene bien a 70, 110 y 180 ms por columna.
- [ ] *(Extra)* Exportar .wav de cada disco con `MediaRecorder` y armar la playlist de respaldo.
- [ ] *(Extra)* Grabar una réplica real de huaco silbador y usarla como muestra de Silbo.
- [ ] Emitir en `voces` los **`disparos`** (qué voces sonaron en este paso) y el **`trueno`**, para animar el escenario y el protagonista (§4.3).
- [ ] *(Extra)* **IA en el navegador** (Magenta.js): variar o continuar la melodía de la capa 1. Verificar versión, tamaño del modelo y mantenimiento antes de integrarla.
- [ ] *(Extra)* **Pistas pregeneradas** para la playlist de respaldo (Stable Audio o ElevenLabs, fuera de línea; §5.1). Se declaran como IA y se revisa la licencia.
- **Hecho cuando:** con los ojos cerrados se distingue el disco 1 del disco 2 y **3 personas ajenas al equipo dicen que la melodía suena agradable**.

### M4 · Arte, avatares anime y componentes visuales (`src/arte/`, `assets/`)
- [ ] **Sprites 32×32 de los 5 personajes** (primero: son la red de seguridad) y **modelos anime detallados** por capas PNG en `assets/avatares/` (diseño, proceso y prioridades en la sección 9).
- [ ] **Pulido visual**: transiciones y efectos de la sección 2 (entradas escalonadas, hover, fundido entre fotogramas, escaneo con brillo), siempre con `prefers-reduced-motion`.
- [ ] Página **«Tecnología»** (§6.1): fichas por categoría, filtros, contador y declaración de IA. Se mantiene al día.
- [ ] **Jukebox sin espacios en blanco** (§4.2): columna de discos y banda, y panel de visualización de la misma altura; **personaje grande (~400×600 px)** a la derecha del fotograma; mezclador de la banda con ON/OFF, «Banda completa» y «Apagar banda».
- [ ] **Transición del satélite** entre páginas (§4.2): satélite, estela, 14 barras y rótulo «PÁGINA 0N».
- [ ] **Flechas animadas** de fotograma, tarjeta **«Motor de sonido»**, panel **«Por qué suena así»** y la sección de **objetivos del reto** en *Cómo suena* (§4.2).
- [ ] **Escenario de la banda** (§4.3): telón, tarima, reflectores, metrónomo, entrada y salida de cada músico, y animaciones (placeholders ya hechos; sustituir por sprites y clips reales). El panel del protagonista usa el mismo estado.
- [ ] **Diseño móvil** (§4.4): maqueta en Claude Design, CSS responsivo, barra de pestañas inferior, reproductor fijo, acordeones y hoja «Ver grande».
- [ ] Página **«Tus datos»** (zona de arrastrar y soltar, selector de modo y de columna, ejemplo de Chiclayo, y estado vacío con explicación).
- [ ] Marca **Terrasonic**: logo final, fondo espacial animado y cabecera con el espacio del logo oficial de Space Apps (§2, identidad de marca).
- [ ] Kit visual retro: bordes de 4 px, sombras duras, tipografías Press Start 2P (títulos cortos), Pixelify Sans (encabezados) e IBM Plex (texto) y paleta derivada de la escala de anomalías.
- [ ] Componentes: visor de fotograma con cabezal y recuadro de Silbo, cuadrícula "lo que oye la máquina", tira de fotogramas y tarjetas de la banda con medidores.
- [ ] Animación de los avatares (respiración, parpadeo, balanceo y 3 estados calmo/activo/intenso según el evento `voces`), respetando `prefers-reduced-motion`.
- **Hecho cuando:** la interfaz se ve como el prototipo, con los avatares reales acompañando cada fotograma. Es el módulo con más carga: aplicar las prioridades de la sección 9.5.

### M5 · Accesibilidad, textos y narrativa (`src/accesibilidad/`, `docs/pitch/`)
- [ ] Teclado: espacio (play), ←/→ (fotograma), 1–5 (disco), M+número (silenciar personaje), D (describir).
- [ ] Subtítulos de sonido en `aria-live` y `describirFotograma(analisis)` con texto rico, en voz `es-PE`.
- [ ] Vibración en truenos y en gotas densas. Modos: alto contraste, texto grande y fuente legible (sin tipografía pixel).
- [ ] Prueba real con NVDA o TalkBack, idealmente con una persona ciega o con baja visión. Grabar la prueba para el pitch.
- [ ] Textos de los personajes y del pitch, validando los nombres andinos con fuentes.
- [ ] Accesibilidad de **«Tus datos»**: carga con teclado, estados en `aria-live` y descripción por voz del resultado.
- [ ] **Cambio de página**: anuncio «Página: NOMBRE» en `aria-live` y cambio inmediato con `prefers-reduced-motion`.
- [ ] **Prueba de escucha** del motor Melodía con personas ciegas o con baja visión: ¿entienden qué pasa en el fotograma solo con el sonido y la descripción?
- [ ] Pruebas con **TalkBack y VoiceOver** en móvil, y comprobar que el escenario es decorativo (la información equivalente está en los subtítulos y en «En el escenario: …»).
- **Hecho cuando:** se recorre la jukebox completa sin mirar la pantalla.

### M6 · App, integración, despliegue y entrega (`index.html`, `src/app/`, `.github/`)
- [ ] Hora 0: `bus.js` y `CONTRATOS.md` cerrados con todos, más el esqueleto de `index.html`.
- [ ] Reloj del escaneo (columna y fotograma), navegación por pestañas (Jukebox, La banda, Cómo suena).
- [ ] GitHub Pages e integraciones en las horas 12, 24 y 36.
- [ ] `docs/METODO.md` (E6) y `docs/CREDITOS.md`.
- [ ] Coordina el video y el formulario de envío con M5.
- [ ] Conectar **«Tus datos»**: evento `datos:subidos` → M2 → `fotograma:listo`, con un solo disco temporal «Tus datos».
- [ ] **Router de páginas**: `pagina:cambio` con el cambio de contenido a ~0,5 s (cuando la pantalla está cubierta) y estado de la banda por disco (`banda:preset`).
- [ ] **Móvil** (§4.4): `viewport-fit=cover` y áreas seguras, PWA instalable (manifest y service worker que guarda los 30 fotogramas), Wake Lock opcional y desbloqueo del audio en el primer toque.
- **Hecho cuando:** la URL pública funciona en Chrome de escritorio y de Android, y la app instalada funciona sin conexión.

---

## 9. Plan de avatares anime con IA

**Decisión del equipo:** cada personaje tendrá **dos versiones**: un **modelo 2D original, detallado y grande, de estética anime**, que se muestra **al lado del fotograma** que analiza la jukebox, y un **sprite de 32×32** para los lugares pequeños. Cada diseño (peinado, ropa, paleta, gestos) expresa la personalidad del conjunto de sonidos que representa.

**Responsable:** M4 (arte), con M5 en textos y validación cultural. Los avatares **no los genera este plan: se producen durante la hackathon**; aquí queda la especificación.

### 9.0 Dos versiones por avatar
| Versión | Formato | Dónde se usa |
|---|---|---|
| **Modelo detallado** | PNG por capas de 768×1152 px, con fondo transparente (se muestra a ~400×600 px, grande, junto al fotograma) | En la jukebox, **junto al fotograma**, como **protagonista del disco** (el personaje asignado a ese disco, ver §3). Y en la pestaña *La banda* |
| **Sprite 32×32** | Hoja horizontal de 4 frames (2 reposo + 2 activos) con la paleta compartida | En la barra de la banda con los medidores, el mezclador, la tira de fotogramas y como icono de cada voz |

Ambas versiones salen del **mismo diseño**: primero se cierra el concepto, y el sprite se deriva simplificando el modelo (unas 1–2 horas extra por personaje). Así se ven como la misma familia.

### 9.1 Reglas de diseño comunes (para que parezcan de la misma banda y de la misma página)
| Regla | Detalle |
|---|---|
| **Originales** | Diseños propios. Los prompts **no** nombran series, estudios, artistas ni personajes existentes. Antes de publicar, M4 hace una búsqueda inversa de imagen de cada avatar para descartar parecidos |
| **Estilo anime** | Cel-shading con 2 tonos de sombra, línea de contorno gruesa y ojos expresivos. Retrato de cuerpo entero o de 3/4 |
| **Moda alternativa / aesthetic** | Ropa con identidad: fusión de **motivos andinos y moches** (chakana, escalonados, ceramios, tejidos) con *techwear*, *streetwear* y capas largas. Evitar disfraces folclóricos caricaturescos |
| **Coherencia con la página** | Misma paleta que la escala de anomalías (azules, verdes, grises, amarillos, rojos, magentas), contorno de 4 px y sombra dura como las tarjetas, marco con bordes pixelados y *scanlines* CRT encima. Cada avatar vive dentro de un marco igual al del resto de la interfaz |
| **Paleta limitada** | Máximo ~24 colores por personaje, más una paleta compartida de 16. Así se ven pixel-coherentes y pesan poco |
| **Tamaño** | Modelo de 768×1152 px con fondo transparente (se muestra a ~400×600 px, grande, junto al fotograma) y sprite de 32×32 (se amplía con `image-rendering: pixelated`) |
| **Accesibles** | Cada avatar tiene texto alternativo y una ficha de texto con su personalidad (para lectores de pantalla). No transmiten información solo con el color |

### 9.2 Diseño por personaje (según la personalidad de su sonido)
| Personaje | Personalidad del sonido | Diseño propuesto | Paleta | Gesto y animación característicos |
|---|---|---|---|---|
| **SILBO** | Viejo y sabio. Silbido solitario, aparece poco | Anciano de pelo plateado trenzado, lentes redondos y poncho-chaqueta ocre con bordado escalonado. Lleva colgada una botella silbadora en miniatura | Ocre, arcilla, plata | Respira lento. Al sonar su silbido se lleva la botella a los labios y salen gotas |
| **INTI** | Entusiasta y brillante. Acordes cálidos y fuertes | Joven de pelo corto y desordenado, chaqueta *bomber* amarilla con rayos escalonados y auriculares con forma de sol | Amarillo, naranja, rojo | Rebota al ritmo. Cuanto más calor hay en el mapa, más brilla la aureola |
| **MAMACOCHA** | Calma y protección. Bajo profundo | Figura serena de pelo largo turquesa y abrigo oversize con olas bordadas, pies descalzos sobre agua | Turquesa, azul profundo | Pelo y abrigo ondulan lento. **Se apaga y se entristece cuando el mar se calienta y su sonido casi desaparece** |
| **YAKU** | Inquieto y travieso. Gotas rápidas | Niña/niño bajito con pelo corto, pasadores en forma de gota e impermeable transparente verde-amarillo con botas de goma | Verde, cian, amarillo claro | Salta y guiña. Su velocidad sigue la densidad de gotas |
| **ILLAPA** | Aparece poco, pero con fuerza. Truenos graves | Figura alta de capa oscura asimétrica con vetas magenta tipo rayo, honda como accesorio y mirada intensa (estilo *storm punk*) | Violeta oscuro, magenta | Quieto y serio; al sonar un trueno hay destello, la capa se agita y la pantalla vibra |

La historia se cuenta con ellos: cuando Mamacocha se apaga y Silbo se pone alerta, el público entiende que algo pasa en el océano sin ver el mapa.

### 9.3 Cómo se animan (tecnología simple)
**Plan A (recomendado, sin librerías nuevas): avatar por capas + CSS/Canvas.**
- Cada avatar se exporta en capas PNG: cuerpo, cabeza, ojos abiertos/cerrados, 3 bocas, pelo trasero/delantero, ropa y accesorio.
- Animaciones con transformaciones de CSS: respiración, parpadeo cada 3–5 s, balanceo del pelo y rebote.
- **Reactividad:** M4 escucha el evento `voces` y cambia el estado de cada avatar: *calmo* (nivel < 0,15), *activo* (0,15–0,6) e *intenso* (> 0,6), con cambio de expresión y pose de boca.
- Con `prefers-reduced-motion` los avatares quedan estáticos con expresión según el estado.

**Sprite 32×32:** hoja de 4 frames que alterna con `steps()` en CSS: 2 de reposo y 2 activos según el estado de la voz.

**Plan A+ (extras):**
- **Ropa alternativa por disco:** una variante de color/atuendo según el evento (por ejemplo, abrigos más fríos en La Niña, ropa más cálida y roja en El Niño). La versión barata es un cambio de paleta con filtros de color sobre la capa de ropa.
- Efectos extra: partículas de gotas, destellos y viento.

**Plan B+ (solo si alguien del equipo ya domina la herramienta):** **Live2D Cubism** o **Spine** para modelos con malla deformable. Da un resultado más "modelo animado", pero tiene curva de aprendizaje de varios días y licencias propias (revisar condiciones de uso antes de publicar). **No** es parte del MVP.

### 9.4 Proceso de producción
| Paso | Detalle |
|---|---|
| 1. Brief | Ficha por personaje (sección 9.2) y paleta común. Un `ficha.md` en cada carpeta de avatar |
| 2. Concepto con IA | Generar hojas de personaje con **ChatGPT (generación de imágenes)**, que es la herramienta acordada por el equipo; se le piden varias vistas del mismo personaje para mantener la coherencia. **Se anota la herramienta y el prompt de cada imagen en `docs/USO_DE_IA.md`**. M4 revisa las condiciones de uso de la herramienta (uso comercial y concursos) antes de elegirla |
| 3. Rediseño humano | La IA no entrega capas ni dibujo limpio. M4 repinta y corrige a mano en **Krita** (gratis), Clip Studio o Photopea, unifica la paleta y separa las capas |
| 4. Animación | Capas del modelo en `assets/avatares/<personaje>/capas/`, hoja `sprite.png` (4 frames de 32×32) y estados en `assets/avatares/avatares.json` |
| 5. Validación | M5 revisa los textos y que nombres y símbolos andinos se usen con respeto (fuentes: Museo Tumbas Reales de Sipán, Museo Brüning) |
| 6. Declarar | Etiqueta visible "Avatar generado con IA y rediseñado por el equipo" en la pestaña *La banda*, en el pie y en el video (R10) |

### 9.5 Prioridad y presupuesto de tiempo (con honestidad)
Un modelo detallado por capas es mucho trabajo: se estima **4–8 horas por personaje** entre concepto, repintado, capas y animación, más **1–2 horas** para su sprite 32×32. Los cinco modelos en 48 horas son exigentes para una sola persona.

| Prioridad | Qué entra | Cuándo |
|---|---|---|
| 0 | **Los 5 sprites 32×32** (red de seguridad: con ellos la interfaz ya tiene personajes) | Horas 2–8 |
| 1 | **Silbo** (la mascota): modelo detallado, parpadeo y animación de silbido | Horas 8–18 |
| 2 | Modelos de **Illapa** y **Mamacocha** (los que mejor cuentan la historia) | Horas 18–28 |
| 3 | Modelos de **Inti** y **Yaku** | Horas 28–36 |
| 4 | Ropa alternativa por disco, efectos y mejoras | Solo en extras |

Recomendación: si alguien más del equipo sabe dibujar, sumarlo **como apoyo de M4** (aporta archivos y M4 los integra, para no cruzar carpetas).

**Plan B:** si un modelo detallado no llega, ese personaje se muestra con su **sprite 32×32 ampliado** junto al fotograma. El contrato solo pide "un avatar por personaje con estados calmo/activo/intenso", así que el resto del plan no cambia.

---

## 10. Cronograma de las 48 horas

| Hora | Hito | Quién |
|---|---|---|
| Antes | Clonar el repo, instalar VS Code + Live Server, ffmpeg (M1) y Aseprite/Piskel (M4). Conseguir una réplica de huaco | Todos |
| 0–2 | Kickoff: leer el plan, firmar los contratos, crear ramas. Brief de avatares (§9) | Todos (lidera M6) |
| 2–12 | Construcción en paralelo, con datos simulados donde haga falta. M4 produce los avatares por prioridad (§9.5) | Todos |
| 12 | **Integración 1**: play → escaneo → sonido → cabezal y subtítulo | M6 + todos |
| 12–24 | MVP completo con los primeros avatares (Silbo, Illapa, Mamacocha) | Todos |
| 24 | **Integración 2** en GitHub Pages | M6 |
| 24–30 | Bugs, prueba con lector de pantalla y **pruebas en móviles reales** | M5 lidera |
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
| **ChatGPT (OpenAI), generación de imágenes** | **Conceptos de los 5 avatares (modelo anime detallado y sprite 32×32)** | Repintado y separación en capas a mano (Krita), prompts guardados, búsqueda inversa de originalidad y etiqueta visible |
| **ChatGPT Codex (OpenAI)** | **Ciertas funciones de código de la versión final** (exportar .wav, parser de CSV, pruebas, animación por capas) | Revisión cruzada de cada cambio, prueba manual y comentario de autoría en la función |
| **Servicios de música con IA** (Lyria RealTime, Stable Audio, ElevenLabs Music): *candidatas, no acordadas* | Pistas pregeneradas o un experimento en vivo (§5.1) | Solo si el equipo decide usarlas: se declaran, se revisa su licencia y se etiqueta el audio |
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
| Los avatares anime no llegan a tiempo o no convencen | Priorizar por orden (§9.5). Plan B: mostrar el sprite 32×32 (ya hecho como red de seguridad) en lugar del modelo detallado |
| La herramienta de IA tiene condiciones de uso restrictivas o el diseño se parece a un personaje existente | Revisar términos antes de elegirla, no nombrar obras ni artistas en los prompts y hacer búsqueda inversa de imagen |
| Archivos del usuario enormes, corruptos o con formatos raros | Límite de 8 MB, validación y mensajes claros, más un ejemplo incluido para la demo |
| El código de Codex no encaja con los contratos o tiene errores | Pedirle funciones pequeñas con la firma del contrato, revisarlas y probarlas antes de integrarlas. Si no convence, se escribe a mano |
| La transición del satélite marea, ralentiza un equipo modesto o frustra por lenta | Dura ~1,1 s, sin destellos, solo `transform`/`opacity`, se desactiva con `prefers-reduced-motion` y se prueba en un móvil de gama baja |
| La banda apagada parece un error (no se oye nada) | Texto de estado visible, y al pulsar Reproducir con la banda apagada se enciende el protagonista del disco |
| La melodía suena bonita pero se pierde la fidelidad a los datos | El motor **Datos puros** siempre está disponible, y «Por qué suena así» explica qué viene de los datos y qué es decisión artística |
| Un servicio de música con IA expone la clave, cuesta, tiene una licencia restrictiva o tarda | No entra en el MVP. Si se usa: pistas pregeneradas fuera de línea, o un servidor intermediario para la clave; revisar licencia y declarar el uso de IA |
| Cinco sprites animados más el fondo ralentizan un móvil modesto | Animaciones solo con `transform` y `opacity`, pocas partículas, pausar con la pestaña oculta, menos estrellas en móvil y probar en un Android de gama baja |
| El audio no suena en iPhone (modo silencio o bloqueo del navegador) | Desbloquear el audio con el primer toque, avisar si el interruptor de silencio está activado y no depender de la vibración (no existe en el Safari de iPhone) |
| El relámpago de Illapa incomoda a personas sensibles a la luz | Un solo destello suave (máx. 35 % de opacidad), nunca más de 3 por segundo, y se desactiva con `prefers-reduced-motion` |
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
