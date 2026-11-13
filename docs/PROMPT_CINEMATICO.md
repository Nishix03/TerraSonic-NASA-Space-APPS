# Prompt de implementación: del espacio al Pacífico

Este prompt responde a las capturas y al brief compartidos el 13 de noviembre de 2026. Incluye las restricciones reales del repositorio; se puede utilizar como especificación para una siguiente iteración. Las referencias se consultaron antes de redactarlo.

## Base investigada y diagnóstico

- W3C distingue la animación automática de la iniciada por una persona. El movimiento no esencial debe poder detenerse y la preferencia de movimiento reducido debe tener una alternativa útil: [animación de interacciones](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [pausar, detener u ocultar](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Estos documentos no certifican este producto.
- Google propone ordenar primero el contenido en una columna y ampliar con Grid/Flex cuando exista espacio: [macro layouts](https://web.dev/learn/design/macro-layouts). Por ello, partir de 360 px; no reducir una pantalla de escritorio mediante `transform: scale()`.
- Para las animaciones decorativas, preferir `transform` y `opacity`; medir antes de promover capas: [guía de rendimiento](https://web.dev/articles/animations-guide). Es una orientación técnica, no una garantía de FPS.
- Verificar el contenido con reflow a 320 CSS px, sin ocultar acciones mediante `overflow:hidden`: [WCAG: reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). La página larga puede conservar desplazamiento vertical normal; los cuadros pequeños no deben añadir desplazamiento interno innecesario.
- Aplicar las [diez heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/): estado visible, lenguaje comprensible, control y salida, consistencia, prevención, reconocimiento, eficiencia, orden visual, recuperación y ayuda. Cada heurística debe corresponder a comportamientos comprobables.
- Como referencia narrativa, [NASA Eyes on the Earth](https://science.nasa.gov/resource/interactive-eyes-on-the-earth/) conecta el planeta y los satélites con información observable. La decisión para TerraSonic es tomar esa relación visual en una ilustración ligera; no atribuirle los datos en tiempo real de Eyes ni copiar su tecnología 3D.
- Como referencia funcional de GitHub, [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) relaciona visualización y reproducción de audio. La decisión para este proyecto es conservar sus controles ligados al estado real del reproductor existente. No se incorpora esa biblioteca ni se presenta una onda decorativa como análisis acústico.

En el código previo, `scripts/avatar2d.js` desactiva Animar/Caminar/Bailar/Reanudar cuando detecta movimiento reducido del sistema o de la aplicación. La captura coincide con ese estado, aunque no demuestra qué preferencia estaba activada en el equipo. Además, la visibilidad se medía sobre el dibujo y no sobre el escenario con sus controles; esto permite detenerlo al alcanzar los botones en una ventana corta. Los pasos recorrían una secuencia que repite dibujos y Reposo mostraba un fotograma, en vez de recuperar la pose original. La tipografía heredaba el tamaño pequeño del pie del escenario.

## Prompt listo para usar

Actúa como responsable de frontend, diseño de interacción y movimiento para TerraSonic, proyecto de NASA Space Apps. Audita primero los archivos reales y después implementa, verifica y publica una mejora concreta. No presentes una maqueta estática como funcionalidad terminada.

### 1. Contexto y límites

El frontend es HTML/CSS/JavaScript nativo: `prototipos/I11-eic/Main.dc.html`, compilado por `scripts/build_pages.py`, con enlaces de estado en `scripts/pages-support.js`. Los personajes son elementos nativos de `scripts/avatar2d.js`. No convertir a React ni añadir GSAP, Three.js o WebGL por decoración. Mantener las funciones reales del reproductor, los mapas, la conversión de imágenes, los cinco músicos, los dos idiomas y las preferencias.

Usar exclusivamente las poses y cuatro PNG originales de cada personaje. Conservar sus bytes y autoría. Caminar puede ser desplazamiento escénico del dibujo y Bailar balanceo; no presentarlos como un nuevo ciclo anatómico de piernas. No volver a modelos 3D ni redibujar los personajes.

Trabajar en `piero-mejoras`, conservar copias recuperables y subir commits por bloques terminados. No actualizar main ni el sitio oficial. Mantener la URL pública de revisión con procedencia del commit publicado.

### 2. Dirección de arte

Concepto: una observación del Pacífico que se transforma en música. El mapa científico y los personajes llevan el contenido; el universo aporta profundidad alrededor de ellos.

Paleta: espacio azul pizarra `#182332`, océano `#153e63`, atmósfera agua `#8be7e9`, luz solar `#e8b969`, texto frío `#eef3fa`, texto secundario `#b6c5d5`. Adaptar estos valores a los tokens existentes y comprobar contraste en los dos temas. Evitar negro puro como gran superficie.

Mantener las fuentes locales existentes: titular compacto y fuerte; texto y controles legibles. Reservar mayúsculas para la identidad y navegación si siguen siendo claras. Botones de acción en estilo de oración, con jerarquía primaria/secundaria y foco visible. No cubrir el mapa con brillos o texto decorativo.

Móvil: navegación, título, explicación corta, acciones, cifras y demostración en ese orden. Escritorio: texto y acciones a la izquierda; demostración NASA a la derecha. Alinear bordes, agrupar contenidos relacionados y sustituir separaciones arbitrarias por una escala de 4/8/12/16/24/32 px. Evitar el gran vacío inferior de la captura sin comprimir la lectura.

### 3. Reparar todos los controles de la banda

Para Silbo, Inti, Mamacocha, Yaku e Illapa, comprobar clic, teclado y estado real:

1. Animar reproduce los cuatro dibujos con la cadencia original.
2. Caminar recorre el escenario manteniendo los dibujos originales.
3. Bailar combina dibujos y balanceo escénico.
4. Pausar congela imagen y posición; Reanudar continúa y cambia su nombre correctamente.
5. Paso anterior/siguiente muestran un dibujo distinto y dejan el movimiento pausado.
6. Reposo cancela tiempos pendientes y recupera la pose original.
7. Escuchar instrumento inicia audio únicamente por una acción expresa; el botón informa cuándo permite detenerlo y cualquier error real.

Los controles deben medir al menos 44 px de alto como objetivo de comodidad del proyecto. Evitar tipografía diminuta heredada del pie de figura. En móvil, distribuir transporte en dos columnas y los tres modos de forma compacta. No colocar controles dentro de un contenedor con `role=img`.

El modo reducido debe mantener los dibujos estáticos y los pasos disponibles. Explicar la causa de la desactivación. Ofrecer permiso expreso, temporal y exclusivo para ese personaje; no cambiar la preferencia global ni activar fondo, sonido o vibración. Revocar ese permiso al cambiar personaje o preferencias. Medir visibilidad del escenario completo para no cancelar el movimiento mientras se usa su transporte. Detener al salir de la sección, ocultar la pestaña o desmontar.

### 4. Introducción cinematográfica

Crear una presentación narrativa de unos 5 segundos en escritorio y unos 3 en móvil. Escena 1: estrellas en planos y luz dorada tenue. Escena 2: Sol iluminando una Tierra con atmósfera azul y orientación al Pacífico. Escena 3: acercamiento al océano con líneas de observación que pasan a ondas musicales. Escena 4: revelar marca, navegación, título, acciones, mapa y cifras, con retrasos breves y coherentes.

Preferir SVG inline y Web Animations API/CSS. Las órbitas, ondas, coordenadas y planeta son ilustraciones, nunca observaciones NASA inventadas. Identificar la ilustración como tal cuando lleve información textual. Mantener intacta la leyenda de la imagen NASA real.

Mostrarla solo una vez por sesión. No repetir al refrescar ni navegar; incluir «Repetir introducción» para jurados. Siempre ofrecer «Saltar introducción», alcanzable con teclado, y Escape. No reproducir audio ni vibración. La bienvenida de accesibilidad tiene prioridad; si se elige la guía, la introducción no debe taparla.

Si el sistema o la aplicación reducen movimiento, omitir la entrada automática y mostrar una acción clara: «Activar animaciones y ver intro». Esa acción debe activar realmente movimiento para la web y reproducir la secuencia; no abrir una lámina estática. Guardar la elección expresa y ofrecer una pausa visible. No cambiar ajustes del dispositivo. Si falla la animación o el almacenamiento, conservar contenido y navegación. No dejar capas invisibles capturando clics, temporizadores sin cancelar o elementos permanentemente transparentes.

### 5. Universo persistente y estados visuales

Refinar el fondo existente: estrellas fijas con algunos brillos lentos, nebulosa sutil, corona solar, eclipse ocasional claramente decorativo, relieve lunar, horizonte azul, satélite y meteoros esporádicos. Menos elementos simultáneos en móvil. Evitar flashes, movimientos constantes cerca de los textos y grandes filtros animados.

Pausar al ocultar la pestaña. Respetar movimiento reducido, alto contraste y colores forzados. Ofrecer una forma comprensible de detener el fondo sin bloquear la navegación. Cualquier reacción musical debe derivarse del estado real del reproductor; nunca simular mediciones científicas en directo.

Mejorar botones, navegación y panel NASA mediante contraste, bordes, profundidad y estados coherentes. Hover solo en dispositivos que lo admiten; foco de teclado siempre perceptible. Los botones desactivados deben explicar su motivo. Las transiciones entre secciones deben ser cortas y cancelables; no secuestrar el scroll.

### 6. Verificación y entrega

Verificar 360, 390, 768, 1024 y 1440 px, orientación horizontal y una ventana corta. Añadir 320 CSS px para reflow y texto grande. No hay contenido recortado ni scroll horizontal; los diálogos breves caben completos. A zoom alto se admite el desplazamiento vertical del documento necesario para conservar contenido legible.

Probar los cinco personajes y cada botón, incluidos sistema reducido, preferencia reducida, permiso local, pausa/reanudación, los cuatro dibujos y la limpieza al salir. Capturar pruebas reales del movimiento y estados, sin confundir cambios de variables con imagen visible.

Probar primera sesión, refresco, navegación, reproducción manual de la introducción, salto temprano, Escape, ambos idiomas, foco, preferencia reducida y ocultación de pestaña. Repetir los recorridos existentes del reproductor, mapas, conversión, guía y accesibilidad en Chromium, Firefox y WebKit según disponibilidad.

Entregar cambios implementados, archivos modificados, resultados de build y pruebas, capturas revisadas y URL pública que corresponda al commit. Informar limitaciones: no declarar certificación WCAG, rendimiento garantizado, prueba física de vibración, aprobación cultural ni validación de teléfono real si no se realizaron. Publicar el prompt y la auditoría junto a la implementación.
