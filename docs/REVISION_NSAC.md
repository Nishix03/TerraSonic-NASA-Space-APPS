# Revisión del formulario NSAC y evolución del universo

> Checkpoint inicial de esta revisión. La interacción final usa los astros del fondo, sin fila adicional; la entrada restaura la elección explícita de movimiento y la alternativa estática termina automáticamente. Véanse [FONDO_INTERACTIVO.md](FONDO_INTERACTIVO.md) y [CLARIDAD_PRODUCTO.md](CLARIDAD_PRODUCTO.md) para los cambios posteriores. Los resultados y mediciones siguientes corresponden a este checkpoint.

## Fuentes y alcance

Se leyó el PDF local `Spanish NSAC.pdf`, cuatro páginas, y el brief de evolución visual adjunto. El PDF es una impresión del formulario de entrega del equipo, no una evaluación del prototipo ni una certificación de accesibilidad. La propia página advierte que incluye contenido de participantes que puede no haber sido revisado por NASA. No se envía ni modifica ese formulario desde esta tarea.

El brief amplía el producto con destinos interactivos, escenas, ambientación, accesibilidad y verificación. Se conserva el motor nativo HTML/CSS/JavaScript, Canvas y Web Audio, los PNG originales, los catálogos EIC/GIBS/POWER y las transiciones de banda. No se añade una dependencia de producción.

## Auditoría inicial

La presentación usa `CinematicIntro` y Web Animations. En móvil duraba tres segundos y el globo se desplazaba lateralmente mientras aumentaba de tamaño. El constructor forzaba movimiento incluso con una preferencia de reducción. El cielo contiene Sol, Luna, Saturno, un planeta lejano, eclipse, meteoros, cohetes y horizonte, todos decorativos. La banda utiliza cuatro dibujos originales por músico. No había destinos interactivos ni una capa ambiental separada.

La música de datos utiliza una cuadrícula de 28×16 extraída de imágenes, una paleta específica por producto, motores de datos/melodía y cinco voces sintetizadas. No es lectura de un campo científico numérico original: es una estimación derivada del color de imágenes recortadas y reducidas. La Vibration API ya tiene opt-in, activación, límites, deduplicación, cancelación y mensaje de capacidad; una respuesta `true` del navegador no acredita el movimiento físico del dispositivo.

## Plan visual revisado

Conservar el observatorio del Pacífico; dar protagonismo al viaje elegido y mantener quieta la interfaz. Paleta: pizarra `#171e2b`, panel `#202b3a`, agua `#8be7e9`, solar `#e8b969`, lunar `#c4d9ee`, vegetación `#9ad8bf`. Barlow para títulos, Inter para lectura y Atkinson Hyperlegible como opción existente. No se reemplazan las fuentes ni los dibujos.

```text
Móvil: entrada               Inicio                  Destino
     Tierra centrada        Hero y mapa             Volver al universo
     Texto centrado         Sol Luna Saturno Aqua   Título + explicación
     Pausar / Entrar                                Paisaje ilustrado
                                                    Escuchar / volumen
                                                    Abrir mapa NASA
```

Los accesos tienen texto y objetivos táctiles; el viaje es opcional y saltable. Las escenas ocupan una sección propia. Las asociaciones verano/invierno son narrativas terrestres; no describen estaciones del Sol ni de la Luna. Aqua es un mundo imaginario. Una nave observa el Sol y Saturno sin aterrizar en ellos.

## Criterios de accesibilidad

Se respeta la reducción de movimiento del sistema y la pausa guardada. La entrada sigue apareciendo en cada documento nuevo: versión estática si se solicita reducción, animada en caso contrario; el usuario puede activar una reproducción animada explícita. La introducción móvil dura 6,8 segundos y ofrece pausa y salida. Teclado, foco visible, retorno de foco, texto ES/EN, contraste, alternativas visuales al audio y controles sin gestos complejos forman parte de la revisión.

Referencias primarias: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [pausar, detener u ocultar](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) y [animación de interacciones](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). El último criterio es AAA; se usa como mejora de comodidad, sin declarar conformidad integral.

## Contraste con el PDF de entrega

| Requisito del formulario | Estado inicial y acción |
|---|---|
| Resumen de 50–200 palabras recomendado | El PDF lo muestra vacío; preparar un borrador para que el equipo lo revise |
| Demo pública ≤30 s o ≤7 diapositivas | Las grabaciones técnicas no equivalen a una demo final revisada; preparar guion y verificar duración de cualquier demo entregada |
| Enlace público al proyecto | Existe la vista independiente; comprobarla después de publicar esta edición |
| Detalles: funcionamiento, beneficio, herramientas, originalidad | Documentar el funcionamiento real y sus límites, sin afirmar accesibilidad universal |
| Declarar uso de SI/IA y marcar sus medios | Mantener registro de IA, metadatos y rótulos visibles en ilustraciones nuevas; revisar procedencia de las ilustraciones originales con el equipo |
| Usar y listar datos o recursos NASA | EIC/SVS 5176, JPL MUR, GIBS y POWER con referencias; preparar lista de enlaces completos |
| Listar recursos externos y confirmar derechos | Inventario existente; aceptación de originalidad y derechos corresponde al equipo |
| Guardar y enviar para evaluación | La captura muestra campos incompletos; no se deduce que esté enviado. El clic final y la aceptación de términos quedan a cargo del equipo |

La fecha del PDF es una captura del formulario. Se debe confirmar plazo y estado en la página del evento antes del envío. La consulta directa a Resources devolvió 502 durante esta revisión; no se presenta una copia inaccesible como guía verificada.

## Resultados y validaciones

Pasan **139 pruebas de componente y 14 de control háptico**. Los resultados bajo `_work/nsac-2026/` conservan las ejecuciones iniciales y las repeticiones finales.

| Recorrido | Resultado observado |
|---|---|
| Presentación | 15 recorridos por motor en Chromium, Firefox y WebKit: entrada, tres recargas, ocho tamaños, pausa, centrado, teclado, preferencias y ausencia de audio/vibración automática |
| Destinos | 24 combinaciones en Chromium, seis anchos × cuatro destinos; ocho combinaciones en Firefox y ocho en WebKit, 390 y 1440 px |
| Audio ambiental | AudioContext nativo y fuentes reales en Chromium/Firefox; el WebKit de Windows no expone Web Audio y se verifica el estado visible «Audio no disponible», sin fingir reproducción |
| Accesibilidad automática | 74 pantallas de axe sin infracciones detectadas y 408 estados de redistribución sin fallos en el archivo exacto del primer commit de esta entrega; cada destino también se audita con axe |
| Banda original | 15 recorridos de baile único, pausa y limpieza; las huellas de los veinte PNG coinciden con los originales |
| Móvil y guía | 16 casos de ventana baja, 16 de guía ES/EN con texto normal/grande y seis tamaños del cielo; inicio comprobado también en 320×568 y 667×375 |
| Háptica | Diez recorridos de capacidad y preferencias, separados de cualquier validación de motor físico |
| Paquete HTTP | Dos recorridos de la copia independiente antes de publicar, sin errores JS ni respuestas fallidas |

Informes: `chromium/cinema/`, `chromium/universe-final/`, `chromium/regression/`, `chromium/final/`, `chromium/candidate/`, `chromium-capability/`, `firefox/`, `webkit/`, `webkit-capability/` y `archive/` bajo `_work/nsac-2026/`. Las pruebas de destinos revisan llegada, Escape, retorno del foco, pausa, volumen, silencio al entrar, limpieza de temporizadores y acceso al mapa EIC. Las comprobaciones de estado oculto utilizan una frontera de visibilidad simulada, identificada en el informe.

La primera prueba de ganancia encontró la representación Float32 de 0,8 y se corrigió su tolerancia. La prueba inicial del cielo detectó un pseudoelemento solar animado que escapaba de la pausa al ocultar la página: se retiró ese movimiento redundante. Se compactaron los accesos y se ocultaron estadísticas auxiliares en las vistas más bajas para conservar todos los controles. La antigua receta de sprites forzaba reducción de movimiento y esperaba baile automático; se actualizó para probar el baile en un contexto sin esa preferencia. La ausencia real de Web Audio en WebKit motivó el mensaje y bloqueo de reproducción por capacidad, con validación posterior de esa alternativa.

## Sonificación y calidad del audio

La sonificación científica existente se conserva. En Datos, el promedio positivo `w` orienta Inti mediante `mtof(60 + min(5,w)×2,4)`; el promedio frío `c` orienta Mamacocha mediante `mtof(48 − min(5,c)×2,4)`. La conversión `mtof(m)=440×2^((m−69)/12)` usa temperamento igual. Son decisiones artísticas sobre niveles derivados del color, no frecuencias físicas de la temperatura. Yaku utiliza posición vertical y una escala pentatónica; Illapa responde a una proporción de extremos y Silbo a la zona costera seleccionada. Melodía añade las escalas, acordes y tiempos ya documentados por disco.

Los destinos usan **otra capa identificada como artística**: dos osciladores suaves por evento, raíces MIDI 60/48/55/53 y secuencias específicas para Sol/Luna/Saturno/Aqua. Se reutilizan el control de volumen, compresor y envolventes del motor. Solo hay una capa activa; navegar o pausar cancela la programación y desvanece la salida. Las fuentes se limpian al finalizar. Los efectos opcionales de interacción y la música de mapas conservan sus controles. No se reproduce música en la entrada ni por elegir un destino.

## Rendimiento observado

Tres recorridos Chromium a 390×844, CPU ralentizada ×4, latencia 150 ms, descarga 200 KiB/s, caché desactivada y gzip negociado: LCP observado **2.024–2.804 ms**, CLS **0,0094–0,0113**, máximos de interacciones programadas **888–1.104 ms**. Informe: `_work/nsac-2026/performance.json`. El máximo programado no es un INP de campo. La respuesta bajo CPU ralentizada necesita optimización; no se declara que cumpla un objetivo de 200 ms. La primera medida supera el objetivo orientativo de LCP 2,5 s. No se publican FPS ni consumo de GPU no medidos.

El recorrido completo transfirió aproximadamente 1,04 MB, sin GLB; la llegada al inicio registró 137.686 bytes en este diagnóstico. Los datos de destinos con activos interceptados muestran CLS inferior a 0,005, pero ese recorrido no simula una red real y se mantiene separado. No se añaden dependencias ni nuevas imágenes rasterizadas. Cada viaje tiene duración acotada y cancela su temporizador/animaciones; el ambiente deja de programarse al ocultar la página. Las cifras son observaciones de laboratorio en este equipo, no promesas sobre teléfonos físicos.

## Archivos y pendientes

Producto: `prototipos/I11-eic/Main.dc.html`. Verificación: `scripts/verify_cinema.cjs`, `verify_universe.cjs`, `verify_sprites.cjs`, `browser_fixture.cjs`, `benchmark_browser.cjs`, `record_motion_demo.cjs`, `run_browser_checks.py` y `test_guides.cjs`. Documentación: esta revisión, el borrador de entrega, créditos, registro de IA y referencias del README. Los personajes, catálogos científicos y el constructor de publicación se conservan.

**Estado: prototipo apto para revisión con pendientes documentados.** Las pruebas de navegador no sustituyen revisión con lector de pantalla, usuarios con distintas discapacidades, evaluación cultural, escucha humana ni validación del motor háptico en un teléfono real. Quedan por confirmar Safari/iOS físico, TalkBack/VoiceOver/NVDA, dispositivos de conmutación, audición y comodidad del movimiento con participantes. La revisión visual fue manual sobre capturas; no hay una comparación automática de píxeles que pruebe equivalencia con una referencia aprobada. También quedan la optimización del tiempo de respuesta bajo CPU ralentizada, la demo final y las acciones del formulario indicadas en el borrador.
