# Reloj de reproducción y comprobación bajo carga

La medición con CPU ×4 reveló retrasos al usar `setInterval` para decidir cuándo empieza cada nota. Se cambió a programación adelantada sobre `AudioContext.currentTime`: una consulta cada 25 ms prepara hasta 650 ms de sonido. Las notas usan sus tiempos absolutos en Web Audio; el mapa, posición, acordes, registro y vibración se actualizan cuando llega el instante correspondiente. La programación de audio precede al trabajo de renderizado del DOM.

Las salidas y reverberaciones por músico se preparan antes de iniciar el reloj. Crear el primer `ConvolverNode` dentro de una nota provocaba una preparación costosa y consumía su margen temporal, especialmente con CPU limitada. La muestra individual también prepara su salida antes de fijar el tiempo de inicio.

Pausa, saltos, cambio de motor, protagonista, pantalla o disco cancelan la cola y las fuentes mediante el identificador de reproducción. Cada músico tiene además una versión que invalida animaciones/notas textuales de un grupo retirado; reactivarlo no resucita la reverberación ni una animación programada antes de silenciar. El idioma se resuelve al mostrar un paso: un acorde pendiente pasa de Rem7 a Dm7 al elegir inglés. El tempo del siguiente mes se calcula con su propia fecha y análisis, sin adelantar el mapa visible.

La consulta de saltos relativos actualiza primero la posición oída. Una interrupción que exceda el horizonte reanuda desde el próximo paso sin disparar una ráfaga de notas con tiempo pasado. El horizonte limita la tolerancia: no se promete continuidad ante suspensión del equipo, pérdida del dispositivo de audio o bloqueos arbitrariamente largos. Reactivar un músico puede esperar hasta el siguiente ataque que todavía no se había programado, hasta 650 ms; revisar esa latencia forma parte del pulido pendiente.

## Medición inicial y después del cambio

`scripts/measure_audio.cjs` utiliza Chromium, Web Audio real y salida final silenciada por el fixture. Emula 390×844, CPU ×4, latencia de 150 ms, descarga de 200 KiB/s, subida de 100 KiB/s y caché deshabilitada. Activa la banda completa, permite el 3D y observa al menos nueve segundos tras el comienzo del recorrido. Inyecta un bloqueo de 200 ms del hilo de interfaz como diagnóstico declarado, no como una acción normal del usuario.

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
