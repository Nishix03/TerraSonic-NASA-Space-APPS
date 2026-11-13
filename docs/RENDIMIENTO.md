# Rendimiento y peso · medición local comparable

Se reconstruyó `origin/main` en `59310ac43cd25e76cc68022a109326ca5cb27712` mediante `git archive`, sin cambiar ninguna rama. Tanto esa base como la revisión se sirvieron por HTTP local con el mismo fixture: viewport 390×844, DPR 1, toque/móvil emulado, CPU ×4, latencia 150 ms, descarga 200 KiB/s, subida 100 KiB/s, caché deshabilitada y movimiento reducido. Cada serie usa tres contextos nuevos y una visita con idioma español/preferencias configuradas. No se ejecutaron otros recorridos del proyecto al mismo tiempo.

## Tiempos de tarea

| Hito | Base, mediana de 3 | Revisión con fuentes locales, mediana de 3 |
| --- | ---: | ---: |
| Inicio: botón principal disponible desde navegación | 6067 ms | 2771 ms |
| Escuchar: desde clic de sección hasta primer mapa decodificado, análisis y botón habilitado | 3120 ms | 3143 ms |
| Inicio + Escuchar, suma por recorrido | 9174 ms | 5914 ms |
| Banda: desde clic hasta controles de la ficha | 405 ms | 218 ms |
| Banda: desde clic hasta primer modelo 3D renderizado | 36516 ms | 8763 ms |

Inicio mejora aproximadamente 54 % y el primer 3D 76 % en estas muestras. La espera incremental de Escuchar se mantiene alrededor de 3,1 segundos: no se presenta como una mejora; la diferencia de unos 23 ms no demuestra regresión ni equivalencia estadística. El tiempo combinado desde Inicio baja alrededor de 36 %. La pose y los controles se ofrecen antes del modelo.

Los hitos son de tarea, no LCP/INP de campo ni un Lighthouse certificado. El modelo de la ficha es uno; la base descargaba/renderizaba tres avatares al llegar a ese punto. La revisión carga el motor 3D cuando se necesita y comparte el renderer. Esa diferencia de trabajo forma parte de la optimización del producto, no significa que se hayan medido cinco escenas equivalentes. Los percentiles de usuarios reales y teléfonos físicos siguen pendientes.

## Peso exacto y bytes observados

| Medida | Base reconstruida | Revisión, build en directorio nuevo |
| --- | ---: | ---: |
| Archivos de sitio | 76 | 103 |
| Suma exacta sin comprimir | 11.820.035 B | 7.154.309 B |
| Cinco modelos GLB | 8.274.192 B | 3.148.248 B |
| HTML generado | 330.551 B | 423.092 B |
| Respuestas locales completadas al hito Inicio | 979.652 B | 445.046 B |

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

Se usan `TERRASONIC_PLAYWRIGHT` y `TERRASONIC_CHROMIUM` como en [VERIFICACION.md](VERIFICACION.md). Evidencia: `base-final-profile.json`, `local-fonts-final-profile.json` y `audio-route-fixed.json` en `_work/benchmarks/`. Las mediciones intermedias anteriores no sustituyen esta serie. La prioridad de carga de la fecha seleccionada se añadió como indicación al navegador; no se atribuye a ella una aceleración que las muestras no demuestran.
