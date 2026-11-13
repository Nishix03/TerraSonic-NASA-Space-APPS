# Reloj de reproducción y comprobación bajo carga

La medición con CPU ×4 reveló retrasos al usar `setInterval` para decidir cuándo empieza cada nota. Se cambió a programación adelantada sobre `AudioContext.currentTime`: una consulta cada 25 ms prepara hasta 650 ms de sonido. Las notas usan sus tiempos absolutos en Web Audio; el mapa, posición, acordes, registro y vibración se actualizan cuando llega el instante correspondiente. La programación de audio precede al trabajo de renderizado del DOM.

Las salidas y reverberaciones por músico se preparan antes de iniciar el reloj. Crear el primer `ConvolverNode` dentro de una nota provocaba una preparación costosa y consumía su margen temporal, especialmente con CPU limitada. La muestra individual también prepara su salida antes de fijar el tiempo de inicio.

Pausa, saltos, cambio de motor, protagonista, pantalla o disco cancelan la cola y las fuentes mediante el identificador de reproducción. Cada músico tiene además una versión que invalida animaciones/notas textuales de un grupo retirado; reactivarlo no resucita la reverberación ni una animación programada antes de silenciar. El idioma se resuelve al mostrar un paso: un acorde pendiente pasa de Rem7 a Dm7 al elegir inglés. El tempo del siguiente mes se calcula con su propia fecha y análisis, sin adelantar el mapa visible.

La consulta de saltos relativos actualiza primero la posición oída. Una interrupción que exceda el horizonte reanuda desde el próximo paso sin disparar una ráfaga de notas con tiempo pasado. El horizonte limita la tolerancia: no se promete continuidad ante suspensión del equipo, pérdida del dispositivo de audio o bloqueos arbitrariamente largos. Reactivar un músico puede esperar hasta el siguiente ataque que todavía no se había programado, hasta 650 ms; revisar esa latencia forma parte del pulido pendiente.

## Medición inicial y después del cambio

`scripts/measure_audio.cjs` utiliza Chromium, Web Audio real y salida final silenciada por el fixture. Emula 390×844, CPU ×4, latencia de 150 ms, descarga de 200 KiB/s, subida de 100 KiB/s y caché HTTP deshabilitada. Observa al menos nueve segundos e inyecta un bloqueo de 200 ms del hilo de interfaz como diagnóstico declarado, no como una acción normal del usuario. Las primeras pasadas permitían el 3D pero no registraban la mezcla efectiva; no acreditan cinco músicos/modelos activos.

| Versión | Motor | Mayor retraso entre pasos | Inicios de oscilador programados en el pasado |
| --- | --- | ---: | ---: |
| Base 59310ac | Melodía | 100 ms | 5 |
| Base 59310ac | Datos | 541 ms | 1 |
| Revisión antes del reloj | Melodía | 540 ms | 11 |
| Revisión antes del reloj | Datos | 330 ms | 3 |
| Reloj y salidas preparadas | Melodía | <0,001 ms en los tiempos programados | 0 |
| Reloj y salidas preparadas | Datos | <0,001 ms en los tiempos programados | 0 |

Son muestras instrumentadas individuales en esta laptop, no una prueba estadística ni escucha humana. Las diferencias de tiempos del reloj no miden directamente la latencia del altavoz o la percepción. El conteo de inicios pasados compara el instante pedido a cada oscilador con el reloj al llamar a `start`; tolera 3 ms de precisión. Los JSON conservan llamadas, tiempos de notas y tareas largas, incluso las pruebas intermedias que fallaron.

Evidencia: `_work/benchmarks/audio-base.json`, `audio-before-clock.json`, `audio-clock-prepared.json`. Las primeras mediciones intermedias `audio-clock.json` y `audio-clock-priority.json` aún tenían inicios tardíos; no se presentan como solución válida.

124 pruebas de producto pasan. Se añadieron casos de programación adelantada, reloj frente a UI, pausa/salto y cancelación de cola, reactivación sin animaciones viejas, idioma y cambio mensual con tempo de Pacora. El recorrido de navegador del reproductor pasa en los cuatro cruces EIC/GIBS × Melodía/Datos, las cinco muestras individuales y la cancelación aislada de reverberación. El recorrido de impactos confirma la regla de marzo y su ausencia en abril y en periodos incompatibles.

```powershell
python scripts/build_pages.py _site
node scripts/test_guides.cjs _site/index.html
node scripts/measure_audio.cjs _site _work/benchmarks/audio-final.json
node scripts/verify_player.cjs _site _work/player/clock-browser
node scripts/verify_impacts.cjs _site _work/impacts/clock-browser
```

La referencia técnica es [A tale of two clocks, Chris Wilson / web.dev](https://web.dev/articles/audio-scheduling). Se aplicó la separación entre reloj de audio y tareas de interfaz; el código de esta implementación se escribió para TerraSonic y no se copió del ejemplo.

## Actualización atómica del estado oído

El perfil de interfaz detectó dos renders por paso: posición/mapa y luego registro. Ahora el evento se construye para la nueva posición y ambos se publican en una sola actualización. Las regresiones comprueban el evento del mes correcto y un solo render por paso; el recorrido de cuatro discos completos observa el estado ya comprometido, no depende de interceptar un método interno de registro.

En dos muestras individuales del mismo perfil de nueve segundos, Melodía pasó de 50 actualizaciones/580 ms de trabajo síncrono medido a 31/321 ms; Datos, de 192/2155 ms a 114/1323 ms. El máximo individual de Datos fue mayor en la segunda muestra (51 frente a 33 ms): no se presenta como una mejora de todos los tiempos. Ambos conservaron cero inicios de oscilador pasados. Son muestras diagnósticas, no estadística de campo ni una prueba de percepción. Evidencia: `audio-render-before.json` y `audio-render-after.json`.

## Mezcla y modelos comprobados en la medición

El pulido posterior encontró una condición de preparación del fixture: intentaba activar toda la banda antes de que terminara la entrada al disco, y el valor inicial de protagonista podía reemplazar esa mezcla. Se corrige la prueba para esperar el reproductor estable, usar la acción de mezcla y registrar los cinco estados al observar. No es un fallo de selección manual del producto: los recorridos funcionales la ejercitan por separado. Los reportes antiguos sin mezcla registrada se conservan como evidencia de reloj/interfaz, sin atribuirles una carga de cinco modelos.

`audio-corrected-mix-before-lazy.json` registra explícitamente cinco músicos activados, pero cero modelos renderizados durante su ventana fría de nueve segundos; la red limitada todavía puede estar descargándolos. La variante `--warm-models` precarga los cinco activos en memoria, entra al reproductor y espera cinco modelos renderizados antes de observar. Sigue deshabilitada la caché HTTP; se declara la precarga de aplicación. La primera variante fallida al esperar cinco modelos se conserva con cero muestras y no se considera una prueba pasada.

La pasada `audio-warm-models-corrected-before.json` del checkpoint 0fefefd confirma cinco modelos al inicio y final, cinco músicos activados y cero inicios de oscilador pasados en Melodía/Datos. Los JSON identifican versión de Chromium y SHA-256 del HTML; la comparación de la cuadrícula bajo demanda usa el mismo perfil y registra su resultado por separado. La salida permanece silenciada: esto no reemplaza escucha humana ni prueba de altavoces.

## Cuadrícula solo al consultar el análisis

Las 448 celdas del modelo de presentación y sus elementos se generan al abrir «Lo que ve la máquina». Cerrarlo retira esos elementos; el análisis completo de 448 valores sigue disponible para el motor musical. El atributo booleano nativo `open` se enlaza al estado para conservar la elección al cambiar de pantalla y no actualizar una vista oculta por accidente. La misma sincronización se aplica al historial. Los eventos de un panel ya retirado no alteran la pantalla actual.

La comparación con cinco modelos ya renderizados usa `audio-warm-models-corrected-before.json` y `audio-warm-models-after-lazy.json`:

| Motor | Trabajo medio síncrono por actualización, antes → después | Máximo de una actualización, antes → después | Inicios pasados |
| --- | ---: | ---: | ---: |
| Melodía | 17,37 → 9,36 ms | 44,7 → 23,7 ms | 0 en ambas |
| Datos | 18,22 → 8,84 ms | 43,8 → 35,8 ms | 0 en ambas |

Son dos muestras individuales con el mismo perfil y bloqueo declarado de 200 ms. La ventana después de la preparación dura al menos nueve segundos; hubo 19/18 pasos Melodía y 83/81 Datos dentro de las observaciones, por eso se presenta también la media por actualización. Se registran cinco modelos al inicio y final, y mezcla con cinco músicos activados en ambas versiones. La cuadrícula cerrada pasa de 448 a cero elementos. No se convierten estas diferencias en una garantía estadística, INP de campo o continuidad ante suspensión.

Las regresiones de paneles comprueban apertura/cierre, 448 celdas con colores del mapa, retirada al cerrar y una sola columna de 16 celdas resaltada al saltar, en los tres motores. El control de caché de la entrega usa una versión de `support.js` derivada del archivo normalizado: un navegador con el runtime anterior recibe el nuevo antes de interpretar los atributos booleanos.
