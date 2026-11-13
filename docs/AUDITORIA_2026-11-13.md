# Auditoría de diseño y accesibilidad · 13 noviembre 2026

Rama `piero-mejoras`. Se aplicaron las skills `frontend-design-review`, `frontend-a11y` y `browser-qa`. La dirección visual conserva la banda y el observatorio oscuro del equipo, con mapa en una región propia, lectura acotada, controles agrupados y detalles secundarios desplegables. No se dispone de un sistema Figma aprobado con el que acreditar coincidencia de componentes.

La vista independiente está publicada para revisión. El reloj de audio ya tiene medición bajo carga y cuatro recorridos completos; la entrega sigue abierta mientras se consolidan las mediciones finales y el paquete portable. La revisión humana del producto, la validación cultural y una certificación WCAG no se afirman.

El intento de revisión nativa en Chrome se detuvo porque la herramienta no pudo verificar con confianza la URL de la ventana. No se continuó por otra vía de control nativo ni se cambiaron ajustes de seguridad. Las afirmaciones antiguas de `AUDITORIA_UX.md` sobre zoom 80–400 % no son evidencia de esta revisión.

## Diez heurísticas de Nielsen

| Heurística | Cambio concreto | Evidencia |
| --- | --- | --- |
| 1. Visibilidad del estado | Fecha del mapa separada del tiempo del disco; pausa, preparación, volumen, motor y tempo visibles. Log consultable sin anunciar cada nota. | Regresiones de transporte y Web Audio. |
| 2. Relación con el mundo real | Leyenda con cálido respecto a lo esperado, referencia, frío y sin datos, con texto y símbolo. Método distingue anomalía y nivel derivado. | Paletas oficiales y Método bilingüe. |
| 3. Control y libertad | Pausa conserva posición; saltos por botones/teclado; muestras y voz detenibles; Escape y devolución de foco; Brisa saltable y reabrible. | Transporte, guía y teclado. |
| 4. Consistencia y estándares | Reproductor común para EIC, GIBS y archivos; categoría técnica conservada al filtrar; nombres accesibles incluyen texto visible. | Ambos idiomas y axe-core. |
| 5. Prevención de errores | Límites de bytes y píxeles antes de decodificar; lecturas antiguas no sustituyen la selección nueva; impactos por episodio y mes. | Conversión, concurrencia y catálogo de impactos. |
| 6. Reconocimiento | Fechas y leyenda junto al mapa; temas de Método/Tecnología arriba; fichas separan historia, instrumento y fuentes. | Capturas y recorridos de cinco anchos. |
| 7. Flexibilidad | Flechas de navegación, enlace de salto al contenido, rangos nativos y preferencias combinables; movimiento reducido y pose de respaldo. | Teclado, preferencias y escenarios de modelos. |
| 8. Diseño estético y austero | Portada sin texto superpuesto al mapa; controles y visuales agrupados; análisis, fuentes y notas a demanda. Tecnologías planeadas retiradas. | Capturas y redistribución. |
| 9. Recuperación de errores | Archivo inválido conserva el aceptado; filtro vacío explica cómo recuperar resultados; texto/pose cuando faltan APIs o recursos. | Conversión y ausencia de APIs. |
| 10. Ayuda y documentación | Brisa separada de músicos; ayuda conserva contexto, tutorial de tres acciones, voz opcional y fuentes metodológicas. | Recorridos Brisa y Método. |

[Descripción de las heurísticas, Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/).

## Objetivo WCAG y COGA

Se usan como referencia [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) y [COGA, Making Content Usable](https://www.w3.org/TR/coga-usable/). COGA es orientación complementaria; automatización no equivale a conformidad ni a pruebas con personas.

| Aspecto | Comprobación y corrección | Límite |
| --- | --- | --- |
| Nombre, función y estado | Controles nativos, rangos etiquetados, selección con `aria-pressed`. Se quitaron nombres redundantes que omitían texto visible; fechas y saltos lo incluyen. | Falta revisión con lector de pantalla. |
| Contraste | Los nombres de músicos silenciados conservan opacidad completa; solo se atenúa la imagen. Alto contraste y texto grande se combinan. | Los casos incompletos de axe requieren inspección; no prueba comprensión de mapas. |
| Teclado y foco | Entrada al disco enfoca el título; salto al contenido, flechas sin activar, rangos, volumen, pausa, fechas y mezcla. Diálogo contiene Tab y restaura foco. | Eventos reales de Chromium automatizados, sin persona usuaria. |
| Menú | Escape, foco fuera o clic fuera lo cierran. Se expande en la cabecera sin cubrir controles. Se corrigió el contenedor `::details-content`. | Comprobado en Chromium, Firefox y WebKit de Windows; Safari de producción pendiente. |
| Redistribución | Sin desbordamiento horizontal ni recorte visible en 544 pantallas; 320×256, 320×568, móvil, horizontal y escritorio hasta 2732×1536, ES/EN. | Viewports CSS emulados, no zoom nativo ni teléfono físico. |
| Texto | Prueba adicional con base de texto 32 px y espaciado: línea 1,5, letras 0,12 em, palabras 0,16 em, párrafos 2 em. Se corrigieron mínimos de leyenda, músicos y selector de archivo. | Aumentar la base no equivale a ampliar el navegador. |
| Alternativas | Saltos por botones/rango/teclado, leyenda escrita con símbolos, descripción y eventos persistentes. | Comprensión por personas ciegas, sordas o con discapacidad cognitiva pendiente. |
| Movimiento | Preferencia manual y del sistema; pose en pausa, sin WebGL o con error. | Clips muestreados; no validación por especialistas en animación. |
| Vibración | Apagada inicialmente. Pulsos cortos opcionales; cancelación en pausa, salto, fecha, modo, colección y navegación. API ausente o con excepción no interrumpe audio. | API simulada; no se comprobó actuador físico. |

W3C explica que 320 píxeles CSS equivalen a 1280 al 400 % para [redistribución 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Se prueba ese ancho resultante; no se declara haber operado zoom nativo. El panel de preferencias se revisó también visualmente después de corregir un contenedor que comprimía etiquetas: una pasada automática limpia no bastó para encontrarlo.

## Evidencia reproducible

El pulido de las 04:00 añadió un menú de preferencias con columnas sensibles al tamaño del texto y una cabecera que reserva una fila completa para la marca cuando hace falta. Los 30 casos ES/EN × cinco viewports × texto normal/doble/espaciado verifican los ocho controles de 44 px, Tab, desplazamiento y Escape. Las capturas permitieron detectar palabras partidas que no eran desbordamientos. La portada tiene un recorrido específico de 14 casos, incluido el tamaño original de 1342×605, 320×568 y horizontal 667×375; comprueba el proceso completo dentro de la vista y etiquetas de navegación enteras. Con texto ampliado se permite el desplazamiento vertical para conservar lectura y controles.

La cabecera usa una [consulta de contenedor relativa a su fuente](https://www.w3.org/TR/css-contain-3/) para responder también al texto ampliado, y conserva la redistribución anterior como respaldo. Evidencia de este pulido: `_work/a11y/preferences-final/`, `_work/home/compact-small/`, `_work/a11y/reflow-header/`. Scripts: `verify_preferences_layout.cjs` y `verify_home.cjs`.

La suite de producto actual suma 139 pruebas. Los recuentos de las pasadas de accesibilidad siguientes corresponden al código con fuentes locales y cabecera corregida; no constituyen una prueba de cada cambio posterior. El build parte de `prototipos/I11-eic/Main.dc.html`.

```powershell
python scripts/build_pages.py _site
node scripts/test_guides.cjs _site/index.html
node scripts/verify_a11y.cjs _site _work/a11y/axe-final
node scripts/verify_reflow.cjs _site _work/a11y/reflow-fixed
node scripts/verify_keyboard.cjs _site _work/a11y/keyboard-final
```

`TERRASONIC_PLAYWRIGHT` y `TERRASONIC_CHROMIUM` apuntan a instalaciones existentes. `TERRASONIC_AXE` admite una copia local de axe-core 4.14.0, obtenido del registro npm oficial con su licencia y sin scripts de instalación; no se incluye en el producto.

- axe: 86 estados, dos anchos y dos idiomas, incluida primera visita, reproductor, escenario, fichas, conversión, método, tecnología, leyenda, diálogo, Brisa, menú y contraste/texto grande. La pasada final `axe-final` tiene cero infracciones detectadas. Se conservan casos incompletos en JSON.
- Redistribución: 544 estados, cero fallos detectados. Excluye únicamente texto `.sr` deliberadamente oculto; inspecciona controles y texto visible, también fuera de la zona vertical inicial.
- Teclado: seis recorridos ES/EN a 320×256, 390×844 y 1366×768; 75 cambios de foco por recorrido, sin foco oculto/cubierto y con contorno. Árbol de accesibilidad guardado. Todos pasan en `keyboard-final`.
- Capturas del panel corregido y reproductor: `_work/a11y/keyboard-layout/`; pasada final en `keyboard-final`. Método y personajes tienen carpetas propias de evidencia.

## Pulido de estados desplegados

La inspección visual posterior encontró un problema que no era desbordamiento: el diálogo «Más opciones» usaba dos columnas externas y solo llenaba una. Se reemplazó por una región de ancho completo con cuatro explicaciones en dos columnas, o una según el texto y ancho disponibles. El nombre «Cómo suena» describe el contenido real y no promete controles que no existen. La cabecera, el cierre y la explicación se conservan dentro de una ventana desplazable; Escape devuelve el foco sin alterar fecha, posición ni historial.

`verify_expanded_layout.cjs` revisa 36 combinaciones de seis viewports × texto normal/doble/espaciado × ES/EN. Abre leyenda, impactos, cuadrícula, lectura e historial de 200 eventos sintéticos; comprueba textos/controles sin recorte horizontal, el último control accesible al desplazar, contenido del diálogo a ancho completo y lectura hasta el final con teclado. También abre las alternativas y explicación de Convertir. La evidencia distingue estas pruebas de los 544 estados básicos con paneles cerrados.

El historial necesitó una corrección adicional: WebKit no incluía su lista desplazable en Tab. Ahora tiene foco explícito solo cuando hay eventos y permite usar `Fin` para recorrerlos. Las diferencias entre `Control+Fin` y `Fin` se diagnosticaron como comportamiento nativo de los motores de prueba, sin interceptar esas teclas en la aplicación. El control final se comprueba contra el viewport visible además del contenedor, porque en móvil la página puede desplazar el documento completo.

La pasada ampliada de axe añade el reproductor con todos esos paneles abiertos y 200 eventos: **90 estados y cero infracciones detectadas en cada uno de Chromium, Firefox y WebKit**. Los 36 recorridos de redistribución desplegada pasan también en cada motor. Evidencia nueva: `_work/a11y/expanded-{chromium,firefox,webkit}/` y `_work/layout/expanded-with-history-{chromium,firefox,webkit}/`. La lista larga es sintética y las pruebas de audio se mantienen separadas. Se conservan los casos incompletos de axe y todos los límites de revisión humana/nativa anteriores.

La ampliación posterior incluye ambos motores musicales: **72 combinaciones de paneles pasan en cada navegador**, con acordes visibles solo en Melodía y explicaciones de niveles derivados en Datos. Chromium y WebKit se reejecutaron secuencialmente tras presión de memoria; las pasadas interrumpidas no cuentan. Evidencias: `_work/qa/content-chromium-sequential/`, `content-firefox/` y `content-webkit-sequential/`. También pasan allí Método y el ciclo de página. La URL pública del checkpoint `f4ba00a` tiene un recorrido ampliado propio, documentado en [PUBLICACION.md](PUBLICACION.md).

## Reproductor en la ventana original

La revisión específica de 1342×605 encontró un fallo que la comprobación anterior no detectaba: comparaba el final de la banda con el pie, aunque ambos estuvieran fuera de la ventana. Ahora se comprueba también la altura visible. Antes, la banda acababa en 659,45 px. La distribución nueva reduce el espacio del encabezado, organiza leyenda y transporte, y conserva completos los cinco músicos y controles principales. En Chromium y Firefox el borde inferior queda aproximadamente en 597 px. El botón «Silenciar» mantiene la palabra entera y los controles conservan al menos 44 px de altura.

`verify_compact_player.cjs` comprueba 48 casos: 1342×605 y 1366×600 × texto normal/doble/espaciado × ES/EN × EIC/GIBS × Melodía/Datos. Con texto normal exige mapa/banda y controles dentro de la ventana; con texto ampliado permite crecer verticalmente y comprueba la anchura. El orden DOM de saltos, repetir, volumen y velocidad sigue el orden visual; el recorrido de teclado añade 1342×605 y suma ocho trayectos. Las consultas de contenedor relativas al texto evitan imponer el diseño compacto a texto de 32 px. Paneles abiertos y estados que necesitan más explicación conservan desplazamiento vertical. No se intenta meter todo el contenido de todas las secciones en una pantalla.

Evidencia del ajuste: `_work/qa/compact-chromium/`, `compact-keyboard/` y `compact-firefox/`. Son viewports CSS y eventos de teclado de motores Windows; permanecen los límites de zoom nativo y equipos físicos.

Una segunda inspección de interacción encontró que fijar la fila del botón de voz lo adelantaba visualmente cuando aparecía la explicación del color seleccionado. Se dejó que ambos controles ocupen la fila siguiente en su orden natural. La regresión compacta añade 80 estados: los cuatro colores y el aviso de silencio total en cada combinación de texto normal. Comprueba orden visual/teclado, ausencia de superposición y acceso al último músico desplazando. Evidencia antes/corrección: `_work/player/legend-order-before-2/` y `compact-interactions-chromium/`. No se exige ocultar mensajes ni comprimir texto para que todos esos estados ocupen siempre una sola pantalla.

La pasada con atributos corregidos ya pasó en WebKit: portada, 48 estados iniciales, 544 pantallas de redistribución, 72 estados desplegados, preferencias, conversión y Brisa. Chromium también completó de nuevo 90 estados axe sin infracciones, ocho trayectos de teclado, conversión, Brisa y audio/pausa. Evidencias en `_work/qa/conformance-{chromium,webkit}/`; los 80 estados de interacción tienen su pasada separada.

## Validación del HTML renderizado

Se descargó el [Nu HTML Checker oficial](https://github.com/validator/validator) `26.11.9 (0f0f1f9)`, asset 726509742, y se contrastó su SHA-256 con el publicado por GitHub. Se ejecuta localmente con Java 24 y un heap máximo de 256 MiB; no se envió el producto a un servicio de validación. Su comprobación del HTML estático no basta para revisar una aplicación cuyas plantillas se resuelven en el navegador.

`export_html_states.cjs` exporta 45 estados resueltos ES/EN: bienvenida, secciones, dos catálogos/modos, detalles abiertos, muestra y diálogo. La revisión detectó atributos booleanos que conservaban el texto de plantilla cuando estaban activos, atributos `value` impropios en `select` y dos nombres ARIA sobre elementos genéricos. Se corrigió la compilación de atributos; el contador de pantallas ahora ofrece texto accesible explícito y la progresión tiene un grupo con nombre. Las 45 copias ya no contienen atributos sin resolver.

La pasada con estilos conserva **315 mensajes CSS** relativos a consultas de contenedor y la unidad `cqw`, que esta versión del comprobador no reconoce. Esas funciones se documentan en [CSS Containment Level 3](https://www.w3.org/TR/css-contain-3/), un borrador del grupo CSS, y se comprueban en los tres motores de prueba; eso no acredita conformidad CSS universal. Por separado, las 45 copias `structure-only` eliminan estilos únicamente de las copias diagnósticas y pasan con **cero mensajes HTML**. No se borran ni filtran los errores del informe completo. Scripts, plantillas inertes y Shadow DOM no forman parte de estas copias y tienen pruebas funcionales separadas.

Evidencia: `_work/nu-validator/provenance.json`, `rendered-before.json`, `rendered-after.json`, `structure-final.json` y `_work/html/resolved-final/`. Se usa `--skip-non-html` para no interpretar el JSON de resultados como HTML. El informe estático conserva además un aviso de detección de idioma basado en texto de código; el idioma visible real se comprueba en los recorridos bilingües.

## Proyectos similares revisados

[NASA GIBS Worldview](https://github.com/nasa-gibs/worldview) orienta la separación entre mapa, fuente y fechas. El README de [Earth Jukebox](https://github.com/jaherunhasanrimon/NasaSpaceApp1stPrototype_Earth-Jukebox-Listen-to-a-Changing-Planet) documenta transporte, leyenda y mapeo sonoro en navegador. Sus afirmaciones de accesibilidad/rendimiento no son evidencia de TerraSonic ni resultados verificados de aquel proyecto. Las [sonificaciones de NASA](https://www.nasa.gov/data-sonifications/) sirven de referencia para comunicar datos por sonido.

No se importó código, música, interfaz ni recursos de esos proyectos en esta revisión. Se aplicó el criterio de mostrar el vínculo dato–sonido, dar control de reproducción y explicar límites.

La regresión compacta ampliada pasa finalmente en Chromium, Firefox y WebKit: 48 estados iniciales y 80 interacciones por motor. La repetición de los 72 paneles Firefox acotada también pasa; el fallo de memoria previo se conserva y no se cuenta como pasada. Las tres actualizaciones de caché entre runtimes versionados pasan. La URL c4f7aca tiene evidencia HTTP propia de 390×844 y 1342×605, documentada en PUBLICACION.md.
