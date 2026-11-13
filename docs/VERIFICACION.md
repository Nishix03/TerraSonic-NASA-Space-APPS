# Pruebas reproducibles y límites

El sitio se genera desde `prototipos/I11-eic/Main.dc.html`; editar `_site/index.html` no modifica la fuente. Python 3 construye el paquete sin dependencias. Node ejecuta las regresiones de producto. Los navegadores, axe y Blender son herramientas de revisión, no servicios del producto.

```powershell
python scripts/verify_fonts.py
python scripts/build_pages.py _site
node scripts/test_guides.cjs _site/index.html
node scripts/models.test.cjs
python scripts/run_browser_checks.py --list
```

Para los recorridos, `TERRASONIC_PLAYWRIGHT` debe apuntar a una instalación de `playwright-core`, y `TERRASONIC_CHROMIUM` al ejecutable de Chromium de prueba. Para axe se usa `TERRASONIC_AXE`. El runner mantiene los procesos secuenciales y guarda JSON con código de salida, duración real del proceso y log de cada caso; esa duración no se suma al tiempo efectivo de trabajo.

```powershell
python scripts/run_browser_checks.py --site _site --evidence _work/qa/local --only home fonts preferences reflow keyboard a11y method characters convert image-geometry brisa player impacts models
```

La instalación utilizada es Playwright Core 1.58.2 y Chromium Headless Shell 156.0.8078.4. Las pruebas adicionales usan Firefox 146.0.1, revisión 1509, y WebKit 26.0, revisión 2248, correspondientes al catálogo de esa instalación de Playwright. Los binarios se obtuvieron de las URL oficiales del CLI y se extrajeron en D. El instalador inicial quedó atascado en la extracción; se detuvieron exclusivamente sus dos procesos identificados, y la descarga/extracción aislada por Python completó los paquetes. No se instalaron navegadores globales ni se usaron perfiles personales.

`TERRASONIC_FIREFOX` y `TERRASONIC_WEBKIT` permiten señalar sus ejecutables. `PLAYWRIGHT_BROWSERS_PATH` puede indicar una instalación convencional del CLI. No se debe copiar una ruta absoluta de esta laptop a otra sin comprobarla.

```powershell
python scripts/run_browser_checks.py --browser firefox --site _site --evidence _work/qa/firefox
python scripts/run_browser_checks.py --browser webkit --site _site --evidence _work/qa/webkit
```

Estos son motores de prueba para Windows: WebKit no acredita Safari en iPhone, y un viewport móvil no equivale a un teléfono físico. Las pruebas con árboles de accesibilidad y eventos de teclado no equivalen a una persona con lector de pantalla. La voz usa stubs para cancelación/mezcla y APIs ausentes; no se ha escuchado su timbre.

El binario WebKit 26.0 de Windows no expone `AudioContext` ni `webkitAudioContext` en la observación realizada. Sus intentos de recorridos de audio fallaron antes de corregir la instrumentación; no se presentan como reproducción verificada. La pasada de Brisa se adaptó para comprobar la alternativa escrita real y documenta `nativeAudioAvailable: false`. Chromium y Firefox sí completan los recorridos de audio/impactos. El audio en Safari y dispositivos Apple queda pendiente.

## Hallazgos que cambiaron el producto

- El menú rompía palabras con texto doble: ahora calcula las columnas con espacio relativo a la fuente. La marca reserva otra fila cuando hace falta. A 320 px la navegación usa dos filas y evita palabras partidas.
- WebKit no desplazaba de manera fiable el foco dentro de preferencias en una vista de 320×256. El foco de cada opción se lleva a la zona visible con desplazamiento inmediato; Escape restaura y hace visible el resumen. La preferencia de movimiento reducido del sistema también desactiva el desplazamiento suave de `html`.
- Firefox añade una parada nativa al contenedor desplazable: se conserva y la prueba recorre después los ocho controles en orden. No se eliminó una función válida para conseguir un conteo idéntico al de Chromium.
- El selector CSV usaba una etiqueta personalizada dentro de `select`; Firefox perdía las opciones durante el análisis HTML. Se usa una plantilla nativa `template` y se comprueban las tres opciones, la elección y su conservación al cambiar idioma. [Modelo de contenido de select, HTML](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element).
- En WebKit, un clic en Brisa no trasladaba siempre el foco al botón como ocurre en Chromium. La ayuda recuerda ahora el elemento que la abre; al cerrarla devuelve el foco allí sin cambiar archivo, fecha ni posición.
- Las imágenes propias se estiraban para el análisis y se recortaban en la vista. Ahora se centran sin deformar y se usa la misma imagen fija para ambas representaciones. [Detalles y evidencia](CONVERTIR.md).

## Interpretación de la evidencia

Se conservan los fallos iniciales y las pasadas corregidas por separado. El fixture bloquea peticiones externas, pero permite `blob:` y `data:` locales; en WebKit interceptarlas y abortarlas producía un falso fallo de carga. Los reportes de rendimiento usan un servidor HTTP real, perfil declarado y caché deshabilitada, sin ejecutar otros recorridos del proyecto a la vez.

axe informa infracciones detectadas y casos incompletos; un resultado cero no prueba conformidad completa. La redistribución comprueba desbordamiento y recorte, mientras las capturas y verificaciones específicas de texto detectan palabras partidas. No hay una línea base visual aprobada por el equipo; las capturas constituyen una revisión de la propuesta, no una certificación de igualdad con Figma ni una aprobación cultural.

El zoom nativo no se pudo revisar por la herramienta de control de ventana y se mantiene pendiente. Sí se prueban anchos CSS de hasta 320 px, texto de base 32 px, espaciado WCAG y el tamaño original de captura 1342×605. El desplazamiento vertical con texto ampliado se conserva para no sacrificar lectura.

Referencias: [Playwright y sus motores](https://playwright.dev/docs/browsers), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [COGA](https://www.w3.org/TR/coga-usable/).
