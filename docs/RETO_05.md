# RETO 05 · revisión de interfaz y banda 2D

Alcance confirmado por el usuario el 13 de noviembre de 2026: aplicar ambos PDF, conservar los personajes originales y resolver el desplazamiento interno innecesario. Esta revisión sustituye las indicaciones anteriores de modelado 3D, carga CSV y pantalla de Escenario. La rama sigue siendo `piero-mejoras`.

## Cambios de producto

| Requisito | Resultado |
| --- | --- |
| Bienvenida completa | Dos columnas, idioma en cabecera, espaciado compacto y acciones visibles. No se recorta contenido ni se oculta una barra para disimular el exceso. |
| Guía móvil | Tres acciones opcionales; siguiente, atrás, salir y alternativa escrita. Altura del contenido, sin caja de texto desplazable. Medición fuera del ciclo de ResizeObserver. |
| Pantallas adaptables | Flujo normal del documento y menús sin límites de altura artificiales. Pasos de navegación envueltos; historial con seis eventos por página y 200 eventos retenidos. El documento puede desplazarse verticalmente al leer páginas largas o ampliar texto. |
| Elementos marcados | Se retiran saltos de cinco segundos, repetir y silencio general de la interfaz; se conservan reproducción, posición, velocidad, volumen y silencio individual. Se retiran impactos, detalles extensos y la pantalla de Escenario señalados. |
| Escuchar | Mapa original y cuadrícula visibles juntos. Banda original y lectura de leyenda reubicadas. Cada color de la escala proviene de la misma paleta que la cuadrícula; incluye los niveles intermedios reales, sin asignaciones de músicos. |
| ¿Cómo funciona? | Una sola página con ocho tarjetas breves en español e inglés. Sustituye Método; «Cómo suena» abre esta explicación. Se retira «Retos del Space Apps». |
| Convierte | Lluvia de Chiclayo destacada y una única entrada de imágenes. La imagen aceptada más reciente sustituye el ejemplo. Un error conserva la imagen anterior. CSV, TSV y TXT ya no se importan. |
| Tecnología | Se conservan las cuatro categorías y los créditos. Se retiran los filtros genéricos y etiquetas repetidas de ámbito. |
| Personajes | Cinco poses y veinte PNG idénticos a `prueba-acordes`, commit `5c62a2e5d734dcc9a0003aac24c66e9408a0b324`. Historias conservadas, sin la palabra «Propuesta»; siguen identificadas como ficción. |
| Movimiento | Animar, Caminar, Bailar, pausa, reanudación, pasos e inspector de cuatro dibujos originales. Movimiento reducido detiene las secuencias. No hay modelos 3D en la aplicación generada. |

La caminata desplaza el personaje 2D por su escenario usando los dibujos disponibles. No se afirma haber creado un nuevo ciclo anatómico de piernas ni nuevos dibujos. La revisión cultural humana sigue pendiente.

## Auditoría con las diez heurísticas

Referencia: [Nielsen Norman Group, diez heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/). Se utilizan como criterios de revisión, no como certificación.

| Heurística | Cambio y evidencia que debe comprobarse |
| --- | --- |
| Estado visible | Carga, error recuperable, reproducción/pausa, selección de músico y paso de animación. |
| Lenguaje cotidiano | Ocho tarjetas breves; cálido, neutral y frío en la escala. |
| Control y salida | Guía saltable, Escape, pausa y vuelta al archivo sin perderlo. |
| Consistencia | Mismos controles nativos, idioma y temas en todas las secciones. |
| Prevención de errores | Solo imágenes, límites de bytes/píxeles, cancelación de cargas obsoletas. |
| Reconocimiento | Imagen seleccionada visible, cinco músicos con nombre, fotogramas inspeccionables. |
| Flexibilidad | Teclado, posición, texto grande, alto contraste, voz y movimiento reducido. |
| Diseño mínimo | Sin filtros vacíos, paneles redundantes ni explicaciones largas junto a la carga. |
| Recuperación | Un archivo inválido no reemplaza el último aceptado; se puede elegir otro. |
| Ayuda | Brisa reabrible, práctica opcional y página ¿Cómo funciona? separada de la prueba. |

Se consultaron [WCAG 2.2: redistribución](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) y las implementaciones públicas de [WaveSurfer](https://github.com/katspaugh/wavesurfer.js) y [Navidrome](https://github.com/navidrome/navidrome) como referencias de controles y separación entre reproducción y navegación. No se copió código de esos proyectos ni se añadieron dependencias.

## Comprobaciones reproducibles

- `scripts/test_guides.cjs`: lógica de audio, carga, cancelación, preferencias, guía, fuentes y nueva paginación; se sustituyen las pruebas de funciones retiradas por sus nuevos criterios.
- `scripts/verify_reto05.cjs`: seis tamaños, navegación de las cinco áreas, colores de cuadrícula, botones del reproductor, mezcla, historial, ejemplo de lluvia, sustitución y rechazo de archivos, idiomas, temas y detección de cajas con scroll interno.
- `scripts/verify_mobile_guide.cjs`: 16 combinaciones de tamaño/idioma/texto, caja completa, guía sin scroll interno, práctica, omisión, alternativa escrita y retorno del foco.
- `scripts/verify_sprites.cjs`: veinte huellas originales y treinta recorridos de movimiento, pausa e inspección; sin solicitudes 3D ni WebGL.
- `scripts/verify_convert.cjs`: imagen real, interpretación de color, límites, archivos dañados, CSV rechazado, conservación y lluvia.
- `scripts/verify_a11y.cjs` y `scripts/verify_reflow.cjs`: auditoría automática y anchuras CSS, espaciado y texto ampliado. No equivalen a pruebas con lector de pantalla ni teléfono físico.

Los resultados definitivos, su versión pública y el paquete portátil se registran en PUBLICACION.md al terminar la verificación. Los fallos intermedios se conservan separados de las repeticiones; no se cuentan como aprobados.

## Resultado de la revisión local

Pasan 134 pruebas de lógica, doce verificaciones de fuentes/licencias y seis controles del empaquetador. Los recorridos RETO 05 pasan en Chromium 156, Firefox 146 y WebKit 26 para 320×568, 390×667, 667×375, 768×1024, 1342×605 y 1920×1080: 84 estados por motor sin cajas con scroll interno, errores JavaScript ni solicitudes fallidas. Se comprueban los cinco botones de mezcla, las muestras de los cinco instrumentos, navegación, tiempo, volumen, velocidad, paginación, importación y reemplazo de imágenes, temas e idioma.

La bienvenida/guía completa 16 combinaciones por motor; la secuencia 2D completa 30 recorridos de movimiento por motor. La portada cabe en 14 tamaños/idiomas. La auditoría axe en Chromium completa 74 estados sin infracciones detectadas; la redistribución de la edición final completa 408 estados sin fallos. WebKit Windows no ofrece Web Audio en esta instalación: allí se comprueba la alternativa escrita y el error recuperable de la muestra. En Chromium/Firefox se sintetiza con salida silenciada; no se afirma una escucha humana.

El primer recorrido WebKit detectó que la banda quedaba 20 píxeles fuera de la ventana original. La repetición `webkit-release`, junto con `firefox-release` y `chromium-release`, verifica el ajuste de altura. Se conserva el fallo inicial en `webkit-final`; las otras comprobaciones de ese directorio (sprites, guía, conversión y Brisa) sí pasan. El aviso anterior de ResizeObserver desaparece al aplazar las escrituras de tamaño a un frame posterior.

Evidencias locales: `_work/reto05-qa/`, `_work/reto05-release-unit.log` y `_work/sprites-qa/source-integrity/prueba-acordes.json`. El build final contiene 112 archivos y 16.624.177 bytes sin comprimir; conserva íntegros los veinte PNG originales. No se presenta este tamaño total como una mejora de descarga inicial. El paquete incorpora una selección de resultados y capturas, no los archivos PDF personales ni todo `_work`.

### Ventanas de poca altura y zoom alto

La revisión adicional reprodujo una bienvenida recortada a 320×256. Se añadió una composición compacta para alturas de hasta 320 píxeles, conservando las cuatro opciones, el idioma y ambos botones visibles, con blancos de interacción de 44 píxeles. «Saltar paso», «Terminar guía» y «Seguir con texto» describen la acción sin alargar los botones. En esa composición se retira la punta decorativa de la guía; no se corta texto para esconder barras.

`verify_short_viewport.cjs` pasa 16 casos adicionales por motor: anchuras 320, 390, 667 y 1342 con 256 píxeles de alto, español/inglés y texto normal/grande. Comprueba bienvenida completa, guía, práctica con alternativa escrita y ausencia de contenido recortado. La ventana 320×256 corresponde a la redistribución CSS de 1280×1024 al 400%; no se afirma haber medido zoom nativo. Los resultados están separados en `chromium-short-v3`, `firefox-short-v3` y `webkit-short-v3`. Las 134 pruebas de lógica siguen pasando.
