# Entrada automática y astros del fondo

## Comportamiento vigente: cada astro abre un disco

Por indicación posterior del usuario, el viaje del cohete termina directamente en el reproductor de uno de los discos de «Elige un disco». Se elimina del recorrido la pantalla intermedia de escenario/ambientación. La selección comparte la misma función que las tarjetas de la biblioteca, de modo que carga el primer mapa, su contexto científico y el protagonista habitual; conserva una mezcla modificada por el visitante.

| Astro del fondo | Disco EIC que abre |
|---|---|
| Sol | Verano 2024–25 |
| Luna | Invierno 2024 |
| Saturno | Verano 2025–26 |
| Aqua | Invierno 2025 |

La etiqueta accesible y el texto del viaje nombran el disco de destino, en español e inglés. La llegada enfoca el título del reproductor, listo para pulsar Reproducir. «Abrir disco» salta el resto del viaje; Cancelar/Escape devuelve el foco al astro. Con movimiento reducido se abre el disco inmediatamente. Si antes se usó el catálogo histórico GIBS, el acceso cambia explícitamente a EIC para cargar el episodio indicado. La introducción, los astros y sus animaciones se conservan.

Las pruebas de esta actualización están bajo `_work/planet-discs/`: 143 pruebas de lógica, incluyendo los cuatro accesos desde otro catálogo; recorridos de astros en nueve ventanas Chromium y dos por Firefox/WebKit; 24 recorridos Chromium de los cuatro discos en español/inglés y tres anchuras, con identidad del mapa, foco, cancelación, reproducción/pausa y reglas axe sin fallos. Los resultados de publicación se registran en [PUBLICACION.md](PUBLICACION.md).

> Los apartados siguientes documentan el checkpoint previo de escenarios artísticos (`f30dfb6`) y sus pruebas. La tabla anterior sustituye su comportamiento de llegada; no se afirma que las escenas o su ambientación sigan siendo la ruta pública de los astros.

## Corrección del arranque

La edición anterior guardaba `ts_motion_mode=full` al repetir la introducción, pero el constructor no recuperaba esa elección. Con reducción del sistema, la entrada podía verse inmóvil mientras «Repetir introducción» sí animaba. Además, la alternativa estática no tenía final automático.

Ahora se recupera la elección explícita de activar animaciones. La introducción aparece en cada entrada y recarga: 6,8 segundos en móvil o ventana baja y 5,2 segundos en escritorio. Con reducción de movimiento elegida en Accesibilidad se presenta su alternativa quieta, que también termina automáticamente y permite entrar antes. La pausa del fondo dura la visita actual; no escribe una preferencia de reducción permanente. El control de Accesibilidad sí conserva su elección. No se cambia la configuración del sistema ni se inicia sonido o vibración al entrar.

## Interacción sobre el dibujo existente

Se retiraron la fila y el desplegable de cuatro planetas que estaban debajo de «Repetir introducción», incluido su CSS. Los SVG del Sol, la Luna, Saturno y Aqua del propio fondo son ahora botones nativos con nombre accesible, foco visible y superficie mínima de 44 × 44 píxeles. No se redibujan como tarjetas adicionales.

En escritorio se mantienen en los laterales del cielo. Hasta 1200 píxeles se sitúan en las esquinas de la composición; la portada reserva espacio para ellos. En horizontal de poca altura se usan los bordes laterales. No se superponen al título, descripción, acciones, mapa o repetición en los nueve tamaños comprobados. Los nombres aparecen al enfocar/pasar el puntero y permanecen visibles en móvil y alto contraste. Los cuatro destinos siguen disponibles si se oculta la decoración por alto contraste.

Cada astro abre su escenario artístico, con ambientación opcional y enlace al mapa NASA correspondiente. Aqua es ficticio; los escenarios y sus sonidos no son observaciones espaciales ni registros científicos NASA. Los cinco personajes conservan sus PNG originales y un solo baile automático con pausa.

## Viaje y cielo

El viaje dura 5,2 segundos: despegue, vuelo y aproximación. El cohete asciende realmente, recorre una trayectoria curva y llega al cuerpo pulsado, cuya ilustración se reutiliza en el viaje. En Luna/Aqua hay aproximación a una superficie ilustrada; en Sol/Saturno se representa una órbita, sin afirmar aterrizaje sobre una superficie sólida.

Dos resplandores blancos suaves, separados durante el viaje, alcanzan opacidad máxima 0,14 y 0,12. Se evitan destellos intensos o repetitivos. «Ir al destino», «Cancelar» y Escape permanecen disponibles. El fondo de la aplicación queda inerte mientras se muestra el diálogo; al cancelar o volver se recupera el foco. Se liberan animaciones y temporizadores al terminar, salir u ocultar la página. La ilustración SVG no captura clics: se corrigió una superposición detectada en WebKit sobre el botón de salto.

Se añaden puntos azules/agua y una lluvia ocasional de seis trazos, cuatro en móvil, sobre los meteoros existentes. La lluvia ocupa un intervalo breve del ciclo de 64 segundos. Se anima con transformación y opacidad; pausa, página oculta y reducción de movimiento también se aplican a los astros interactivos. Con reducción se accede directamente al destino, sin vuelo ni resplandor.

La primera grabación de la publicación detectó una regresión adicional: la corona del Sol y el satélite dependían de una variable CSS heredada solo del contenedor decorativo. Al convertir el dibujo en botón fuera de ese contenedor, su órbita quedaba sin duración válida. Se añadió el valor de respaldo de 96 segundos y una comprobación del cambio real de transformación del Sol, además de la órbita del satélite cuando es visible. Se conserva el intento de grabación fallido; no se presenta como vídeo aprobado.

## Comprobaciones técnicas

| Recorrido | Resultado y alcance |
|---|---|
| Lógica | 142 pruebas de guías/preferencias y 14 de háptica; elección de movimiento restaurada, pausa temporal y reducción persistente diferenciadas |
| Entrada | 15 recorridos por motor en Chromium, Firefox y WebKit: entrada, recarga, cambio real de transformación, móvil centrado, alternativa estática con final, almacenamiento no disponible y ausencia de audio/vibración automática |
| Astros | Chromium: nueve ventanas entre 320 × 568 y 1440 × 900, incluida 667 × 375; cuatro destinos, clic nativo, ausencia del menú duplicado, tamaño y ausencia de solapamiento, ascenso, llegada, limpieza y retorno del foco |
| Compatibilidad del viaje | Firefox y WebKit: 390 y 1440 píxeles; los cuatro destinos, reducción de movimiento y alto contraste/teclado. El fallo de capa SVG de WebKit quedó corregido y su repetición pasa |
| Primera escucha | Chromium: 15 recorridos; Firefox/WebKit: siete por motor, español e inglés, muestra/datos/reglas, cancelación de carga y distinción de POWER. WebKit de Windows no tiene Web Audio: se verifica la alternativa escrita, no audio inexistente |
| Regresión de producto | Reproductor con señal Web Audio medida, pausa, posición, mezcla e instrumentos; seis ventanas del cielo; Método/Tecnología en dos idiomas y cinco anchuras |
| Teclado y presentación | Ocho recorridos de teclado con árbol accesible, 74 pantallas axe sin fallos de reglas, 408 estados de redistribución sin fallos y 16 de ventanas bajas. Axe no acredita conformidad completa |

Evidencias locales en `_work/portals/`: `viewport-qa`, `cross-firefox`, `cross-webkit/cinema`, `deep/player`, `deep/space-background`, `deep-retry`, `final-chromium/background-portals`, `final-webkit` y `final-keyboard`. La corrección final de órbita pasa nueve tamaños en `orbit-chromium`, dos en `orbit-firefox` y dos en `orbit-webkit-retry`; observa transformación real con sondeo de frames y comprueba el satélite en escritorio. `cross-webkit/background-portals`, el muestreo fijo demasiado breve de `orbit-webkit` y las primeras pruebas de teclado conservan fallos de diagnóstico; sus repeticiones finales son las válidas. El muestreo de lluvia adelanta de forma controlada la línea temporal CSS y se identifica así en el informe; no es una observación física de un teléfono.

La publicación exacta, hashes y lectura pública se registran en [PUBLICACION.md](PUBLICACION.md). La mejora de propósito y primer uso se documenta en [CLARIDAD_PRODUCTO.md](CLARIDAD_PRODUCTO.md).

La edición pública final `f30dfb6` pasa dos recorridos de astros y dos grabaciones reales de navegador, escritorio y móvil. Las grabaciones comprueban entrada automática, recarga, Sol en movimiento, meteoro visible, pausa, viaje, guía y el único baile. Sus informes no tienen errores JavaScript ni respuestas fallidas. Las pruebas físicas y humanas indicadas a continuación siguen pendientes.

## Límites pendientes

Faltan sesiones humanas de comprensión, comodidad del movimiento, lectores de pantalla reales y teléfonos físicos. No se acredita certificación WCAG, funcionamiento para toda discapacidad ni vibración física. El [protocolo de cinco participantes](PROTOCOLO_USABILIDAD.md) sigue sin resultados inventados. Las mediciones de rendimiento anteriores y sus límites están en [REVISION_NSAC.md](REVISION_NSAC.md); no se han convertido en una afirmación de rendimiento de campo. El formulario NSAC no fue enviado y el equipo debe revisar fuentes, derechos y entrega.
