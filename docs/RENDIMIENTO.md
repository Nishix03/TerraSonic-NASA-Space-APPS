# Rendimiento y peso · medición local comparable

Se reconstruyó `origin/main` en `59310ac43cd25e76cc68022a109326ca5cb27712` mediante `git archive`, sin cambiar ninguna rama. Tanto esa base como la revisión se sirvieron por HTTP local con el mismo fixture: viewport 390×844, DPR 1, toque/móvil emulado, CPU ×4, latencia 150 ms, descarga 200 KiB/s, subida 100 KiB/s, caché deshabilitada y movimiento reducido. Cada serie usa tres contextos nuevos y una visita con idioma español/preferencias configuradas. No se ejecutaron otros recorridos del proyecto al mismo tiempo.

## Tiempos de tarea

| Hito | Base, mediana de 3 | Revisión con fuentes locales, mediana de 3 |
| --- | ---: | ---: |
| Inicio: botón principal disponible desde navegación | 6067 ms | 2726 ms |
| Escuchar: desde clic de sección hasta primer mapa decodificado, análisis y botón habilitado | 3120 ms | 3173 ms |
| Inicio + Escuchar, suma por recorrido | 9174 ms | 5899 ms |
| Banda: desde clic hasta controles de la ficha | 405 ms | 197 ms |
| Banda: desde clic hasta primer modelo 3D renderizado | 36516 ms | 8765 ms |

Inicio mejora aproximadamente 55 % y el primer 3D 76 % en estas muestras. La espera incremental de Escuchar se mantiene alrededor de 3,2 segundos: no se presenta como una mejora; la diferencia de unos 53 ms no demuestra regresión ni equivalencia estadística. El tiempo combinado desde Inicio baja alrededor de 36 %. La pose y los controles se ofrecen antes del modelo.

Los hitos son de tarea, no LCP/INP de campo ni un Lighthouse certificado. El modelo de la ficha es uno; la base descargaba/renderizaba tres avatares al llegar a ese punto. La revisión carga el motor 3D cuando se necesita y comparte el renderer. Esa diferencia de trabajo forma parte de la optimización del producto, no significa que se hayan medido cinco escenas equivalentes. Los percentiles de usuarios reales y teléfonos físicos siguen pendientes.

## Peso exacto y bytes observados

| Medida | Base reconstruida | Revisión, build en directorio nuevo |
| --- | ---: | ---: |
| Archivos de sitio | 76 | 103 |
| Suma exacta sin comprimir | 11.820.035 B | 7.154.639 B |
| Cinco modelos GLB | 8.274.192 B | 3.148.248 B |
| HTML generado | 330.551 B | 423.422 B |
| Respuestas locales completadas al hito Inicio | 979.652 B | 445.376 B |

Los GLB bajan 62 % y el build nuevo alrededor de 39 %. El HTML crece porque incluye funciones, textos bilingües y catálogos; se documenta ese coste. Ocho archivos de tipografía suman 180.108 B y se cargan por uso, con licencias y fuentes del sistema de respaldo. El subconjunto latino admite los textos español/inglés; no se instaló en Windows.

Los bytes del protocolo de Chrome representan respuestas locales completadas hasta el hito, no toda la transferencia efectiva: cancelaciones/respuestas en vuelo pueden quedar incompletas. Los bytes externos de la base no se incluyen en ese contador local; la revisión no solicita fuentes a terceros. El tamaño del build es un inventario de disco independiente de esa limitación.

El directorio `_site` antiguo contenía recursos sobrantes de iteraciones previas y daba 147 archivos/18 MB. No se usó para afirmar una reducción final: se generó `_work/final-site` desde cero, conservando los archivos anteriores para recuperación. Un build incremental no elimina archivos ajenos o antiguos.

## Audio y navegación bajo carga

El [reloj adelantado](AUDIO_RELOJ.md) prepara 650 ms de audio por tiempos absolutos de Web Audio y actualiza mapa/registro al llegar el paso. En la muestra final se observaron 20 pasos Melodía y 88 Datos; cero inicios de oscilador en el pasado. Las separaciones programadas fueron 500 y 110 ms, respectivamente, con error numérico inferior a 0,001 ms. Se incluyó un bloqueo declarado de 200 ms de la interfaz. Esto no prueba latencia del altavoz ni calidad percibida: la salida final del fixture permanece silenciada.

La primera pasada final no llegó a reproducir: con CPU limitada, el disco ya estaba visible pero el corte anterior aún rechazaba el clic. Se corrigió el cierre de una transición que ya llegó a destino antes de aceptar la siguiente acción; los callbacks antiguos quedan invalidados. La prueba conserva la prohibición de reproducir en una pantalla saliente. Se guarda también la medición fallida para no confundirla con una muestra de audio válida.

## Reproducción

```powershell
python scripts/build_pages.py _work/nuevo-build
node scripts/benchmark_browser.cjs _work/nuevo-build _work/benchmarks/nueva-serie.json
node scripts/measure_audio.cjs _work/nuevo-build _work/benchmarks/nuevo-audio.json
```

Se usan `TERRASONIC_PLAYWRIGHT` y `TERRASONIC_CHROMIUM` como en [VERIFICACION.md](VERIFICACION.md). Evidencia de la tabla: `base-final-profile.json` y `checkpoint-122fd9d-profile.json`; audio: `audio-route-fixed.json` en `_work/benchmarks/`. La tabla corresponde al checkpoint de aplicación `122fd9d`, HTML SHA-256 `4115e016592a7195f1edc5ad0545029b968d2797d13b487d8eeb4e015d8957ee`, Chromium 156.0.8078.4. Las correcciones posteriores se medirán por separado. La prioridad de carga de la fecha seleccionada se añadió como indicación al navegador; no se atribuye a ella una aceleración que las muestras no demuestran.

Una pasada diagnóstica separada, `--vitals`, añade tres segundos antes del primer clic para observar fuentes y estabilidad. Sus tres LCP fueron 2736, 2616 y 2592 ms; CLS, aproximadamente 0,008. Los mayores tiempos de eventos de las interacciones programadas fueron 328, 280 y 280 ms. No alcanzan en todas las muestras los objetivos de laboratorio 2,5 s/200 ms; no se declaran como INP de campo. Esta pasada tiene más precarga antes de navegar y sus tiempos posteriores de Escuchar/Banda no deben sustituir la tabla de tarea. Las definiciones proceden de [LCP](https://web.dev/articles/lcp), [CLS](https://web.dev/articles/cls) e [INP](https://web.dev/articles/inp), web.dev.

## Transferencia comprimida y experimento de cabecera

La respuesta pública de GitHub Pages se comprobó con `Accept-Encoding: gzip`: 118.293 bytes recibidos para el HTML de 420.438 bytes del checkpoint `0fefefd`, con `Content-Encoding: gzip`. El fixture anterior servía texto sin compresión. Se añadió `--gzip` al medidor como perfil explícito; las series comprimidas no sustituyen ni se mezclan con la comparación base/revisión sin comprimir.

Se exploró mover las hojas y estilos estáticos del prototipo al `head` generado y diferir `support.js`, solo en `_work/critical-head-experiment`. Con tres contextos nuevos por versión, gzip y la misma ventana diagnóstica, el tiempo mediano hasta Inicio fue 1176 → 1146 ms; los LCP, 1252/1108/1124 → 1224/1092/1068 ms. Es una diferencia pequeña y no demuestra una mejora estable. CLS se mantuvo aproximadamente en 0,008 y los mayores eventos programados fueron 312/280/264 → 304/272/280 ms, todavía superiores a 200 ms en estas muestras. El traslado de estilos no se incorporó al producto: no se justifica cambiar el montaje por esta señal. Se añadió únicamente un fondo negro inicial en el documento para conservar la apariencia durante la carga.

Evidencia: `response-compression.json` en `_work/github-preview/` y `gzip-head-before.json`/`gzip-head-after.json` en `_work/benchmarks/`. La columna `textTransferEncoding` identifica el perfil; el JSON conserva FCP/LCP, eventos y huellas. La salida de sonido del fixture está silenciada, manteniendo el cómputo de los efectos configurados. No se afirma que estas mediciones locales sean percentiles de visitantes reales ni que el producto cumpla un objetivo de INP de campo.
