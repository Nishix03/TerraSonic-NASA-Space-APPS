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
| Menú | Escape, foco fuera o clic fuera lo cierran. Se expande en la cabecera sin cubrir controles. Se corrigió el contenedor `::details-content`. | Chromium comprobado; Safari y Firefox pendientes. |
| Redistribución | Sin desbordamiento horizontal ni recorte visible en 544 pantallas; 320×256, 320×568, móvil, horizontal y escritorio hasta 2732×1536, ES/EN. | Viewports CSS emulados, no zoom nativo ni teléfono físico. |
| Texto | Prueba adicional con base de texto 32 px y espaciado: línea 1,5, letras 0,12 em, palabras 0,16 em, párrafos 2 em. Se corrigieron mínimos de leyenda, músicos y selector de archivo. | Aumentar la base no equivale a ampliar el navegador. |
| Alternativas | Saltos por botones/rango/teclado, leyenda escrita con símbolos, descripción y eventos persistentes. | Comprensión por personas ciegas, sordas o con discapacidad cognitiva pendiente. |
| Movimiento | Preferencia manual y del sistema; pose en pausa, sin WebGL o con error. | Clips muestreados; no validación por especialistas en animación. |
| Vibración | Apagada inicialmente. Pulsos cortos opcionales; cancelación en pausa, salto, fecha, modo, colección y navegación. API ausente o con excepción no interrumpe audio. | API simulada; no se comprobó actuador físico. |

W3C explica que 320 píxeles CSS equivalen a 1280 al 400 % para [redistribución 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Se prueba ese ancho resultante; no se declara haber operado zoom nativo. El panel de preferencias se revisó también visualmente después de corregir un contenedor que comprimía etiquetas: una pasada automática limpia no bastó para encontrarlo.

## Evidencia reproducible

El pulido de las 04:00 añadió un menú de preferencias con columnas sensibles al tamaño del texto y una cabecera que reserva una fila completa para la marca cuando hace falta. Los 30 casos ES/EN × cinco viewports × texto normal/doble/espaciado verifican los ocho controles de 44 px, Tab, desplazamiento y Escape. Las capturas permitieron detectar palabras partidas que no eran desbordamientos. La portada tiene un recorrido específico de 14 casos, incluido el tamaño original de 1342×605, 320×568 y horizontal 667×375; comprueba el proceso completo dentro de la vista y etiquetas de navegación enteras. Con texto ampliado se permite el desplazamiento vertical para conservar lectura y controles.

La cabecera usa una [consulta de contenedor relativa a su fuente](https://www.w3.org/TR/css-contain-3/) para responder también al texto ampliado, y conserva la redistribución anterior como respaldo. Evidencia de este pulido: `_work/a11y/preferences-final/`, `_work/home/compact-small/`, `_work/a11y/reflow-header/`. Scripts: `verify_preferences_layout.cjs` y `verify_home.cjs`.

118 pruebas de producto pasan en este checkpoint. El build parte de `prototipos/I11-eic/Main.dc.html`.

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

## Proyectos similares revisados

[NASA GIBS Worldview](https://github.com/nasa-gibs/worldview) orienta la separación entre mapa, fuente y fechas. El README de [Earth Jukebox](https://github.com/jaherunhasanrimon/NasaSpaceApp1stPrototype_Earth-Jukebox-Listen-to-a-Changing-Planet) documenta transporte, leyenda y mapeo sonoro en navegador. Sus afirmaciones de accesibilidad/rendimiento no son evidencia de TerraSonic ni resultados verificados de aquel proyecto. Las [sonificaciones de NASA](https://www.nasa.gov/data-sonifications/) sirven de referencia para comunicar datos por sonido.

No se importó código, música, interfaz ni recursos de esos proyectos en esta revisión. Se aplicó el criterio de mostrar el vínculo dato–sonido, dar control de reproducción y explicar límites.
