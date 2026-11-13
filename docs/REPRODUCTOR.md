# Reproductor, leyenda y verificación

## Controles

El mismo reproductor atiende los discos EIC, los históricos GIBS y los archivos locales. Pausar conserva fotograma y columna. Reanudar continúa en la siguiente columna. Seleccionar una fecha salta al principio de ese fotograma; si estaba en pausa conserva la pausa. La barra nativa admite flechas, Inicio y Fin, y los botones permiten saltar cinco segundos sin arrastrar.

El tiempo del disco cuenta los pasos musicales y se muestra separado de la fecha del mapa. Cada fotograma tiene 28 pasos. En Melodía, el tempo del perfil y la velocidad elegida determinan su duración; Datos usa 110 ms por columna a velocidad normal. Las velocidades son 0,75×, 1× y 1,4×. El tiempo se presenta redondeado hacia abajo al segundo. El disco puede repetirse por elección expresa.

Cambiar posición o modo retira la salida seca y reverberada del recorrido anterior con una salida gradual de 20 ms. Los callbacks llevan un identificador de ejecución para que una activación de audio antigua no reinicie el reproductor. El volumen y el silencio general conservan los interruptores individuales de la banda. La voz reduce la música al 30 % del volumen configurado y la restaura al terminar o detenerse.

Melodía usa escalas y progresiones. Datos asigna frecuencias a niveles cálidos y fríos sin la antigua progresión escondida de acordes. Las opciones de IA local/nube del reproductor se retiraron. Los eventos quedan en una lista consultable de los últimos 200 pasos y no se anuncian nota por nota. Cambiar idioma vuelve a presentar el historial en el idioma elegido.

## Paletas y límites

- EIC. La [visualización SVS 5176](https://svs.gsfc.nasa.gov/5176/) publica una barra de anomalías entre −4 y +4 °C. El prototipo conserva sus 33 muestras RGB y deriva niveles entre −5 y +5 multiplicando la posición de la barra por 1,25.
- GIBS. Se usa la [tabla oficial MUR de NASA](https://gitc.earthdata.nasa.gov/colormaps/v1.0/output/GHRSST_Sea_Surface_Temperature_Anomalies.html), con 62 intervalos y sus extremos abiertos. Se aproxima cada píxel al color más cercano. La mitad del intervalo, limitada a −3…+3, se multiplica por 5/3 para obtener el nivel artístico. El negro de ausencia de datos y el blanco del contorno no se cuentan como agua neutra.
- La tabla XML y su hash están en `data/colormaps/`. `python scripts/update_gibs_palette.py` permite actualizarlas expresamente desde NASA. El navegador usa la tabla incluida y no necesita consultar ese servicio.
- La cuadrícula usa la paleta propia de TerraSonic. Los niveles no son mediciones recuperadas del dato científico original ni grados de temperatura. Los dos productos tienen rangos de color distintos; sus niveles normalizados no son directamente comparables como magnitudes físicas.
- La leyenda muestra texto y símbolos para cálido, referencia, frío y ausencia de datos. La explicación de la paleta original se puede desplegar y la locución es optativa. Los archivos propios explican su normalización por separado.

## Evidencia reproducible

`node scripts/test_guides.cjs _site/index.html` cubre progresiones, notas MIDI enviadas al sintetizador, pausa/reanudación, saltos, duración, repetición, volumen, modo, historial y las dos paletas, además de las regresiones existentes.

`node scripts/verify_player.cjs _site _work/player/browser` usa Chromium y nodos Web Audio reales. La instalación existente se indica con `TERRASONIC_PLAYWRIGHT` y `TERRASONIC_CHROMIUM`. El monitor registra señal antes de una salida final silenciada para que la automatización no haga ruido en la laptop. Comprueba los dos catálogos y modos, manejo con teclado, fechas, historial, idioma, posición conservada y amplitud cero después de pausar. No representa escucha humana ni una prueba con lector de pantalla.

El mismo recorrido comprueba anchos de 320, 390, 768, 1366 y 1920 píxeles y guarda capturas y geometría. Una vista de 320 píxeles ayuda a comprobar el [reflujo de WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html); las pruebas de zoom de navegador y tecnologías de asistencia se documentarán por separado. No se afirma certificación.

Cada músico tiene una salida seca y reverberada propia. Al silenciarlo se retiran ambas y se cancelan sus fuentes programadas; activarlo de nuevo crea una salida nueva. Las otras voces mantienen su grafo. La ficha de cada personaje ofrece una muestra del mismo sintetizador, de tres segundos y detenible; una nueva muestra, cambiar de personaje o salir cancela la anterior. La muestra respeta el volumen y el silencio general y funciona con movimiento reducido.

La regresión de navegador también mide salida cero al silenciar una voz sostenida, comprueba que activarla no reabra su reverberación anterior y verifica las cinco muestras de instrumentos por separado. El recorrido se mantiene en pausa al terminar cada muestra.

La secuencia usa programación adelantada con el reloj Web Audio. La medición inicial detectó notas tardías y motivó la corrección documentada en [AUDIO_RELOJ.md](AUDIO_RELOJ.md). Se comprobaron también cuatro discos completos de 168 pasos, ambos catálogos y ambos modos, final y repetición. La escucha humana y la continuidad ante bloqueos mayores que el horizonte de 650 ms no se afirman.

La descripción del mapa informa niveles derivados y porcentaje de píxeles incluidos con nivel cálido ≥+4. No promete que un instrumento esté sonando por observar un color: eso depende del modo, la posición y los silencios elegidos. Las tablas usan la media de su columna y el porcentaje de celdas dibujadas; no se describen como condiciones oceánicas. Una zona costera sin píxeles utilizables se identifica como tal.

El solo inicial sigue al protagonista sugerido al escoger otro disco. Después de editar los interruptores de músicos, la mezcla se conserva entre discos y al cambiar la interpretación o aceptar otro archivo. Reproducir y reanudar mantienen todos silenciados si esa fue la elección; el reproductor muestra un aviso escrito que invita a activar un músico. Cambiar explícitamente de protagonista lo activa. «Armar la banda» activa los cinco por petición del usuario.

La muestra individual está disponible aunque falte WebGL, tarde un modelo o no cargue el módulo 3D. Solo los controles de giro y animación dependen de que el modelo esté renderizado. `verify_fallback_audio.cjs` comprueba cinco muestras en ausencia de WebGL y cinco sin el runtime; la señal medida vuelve a cero al detener cada una.
