# Vista independiente y protección de la web oficial

Vista de revisión actual: **https://alvaro-mendoza-12.github.io/terrasonic-piero-preview-20261113/**.

## Edición vigente · activación real de movimiento · 13 noviembre, 18:19 Bogotá

Aplicación **`58cecc25a64410019380a2980d57f8bfe229b835`**, commit estático **`5491a3d9f7e4b08df76faf90ed5ce20b8fdfbc46`**, fast-forward desde `f798af8`. Pages confirmó `built` a las **18:17:06**; la lectura anónima de las **18:19:00** comprobó `source.json` y HTML exacto de **449.555 bytes**, SHA-256 **`6dcf246608e5ba61fb413b4c63a0825bf755929523213fb5ede4900376ca21a1`**.

Se eliminó la lámina «Ver presentación sin movimiento». «Activar animaciones y ver intro» ahora guarda una elección explícita, reproduce la secuencia y activa el cielo aun si el sistema solicita reducción. El botón de pausa y el menú muestran el estado efectivo. La introducción incluye tres meteoros y el cielo reduce la espera inicial. La entrada omitida por reducción no se marca como vista. [Cambios, criterios y resultados](MOVIMIENTO.md).

El build exacto pasó 15 recorridos de presentación por motor en Chromium, Firefox y WebKit, además de las regresiones de redistribución, accesibilidad, personajes y producto. Se grabaron dos recorridos reales desde la URL pública, 1342×605 y 390×667, reproduciendo la combinación de preferencias de la captura. Las grabaciones comprueban movimiento visible del Sol, meteoros y pausa; no se limitan a verificar variables internas.

Evidencias: `_work/github-preview/browser-local-58cecc2/`, `readback-58cecc2.json`, `http-58cecc2.json`, `_work/motion-release/` y `_work/motion-public-video/`. La comprobación de las 18:19:01 conservó main remoto `885cd51e977f96bc421a3ad2d18cef322d28039b`, main local `a8f8203e8de3097584987a5ba5635bc813181c44`, `.github/` sin diferencias y la huella oficial `bf4db6d86b2f293ebbee90cf85ae4b4ac8973aaafb8ba50c88a9d32d18f6f951`. Esta actualización solo hizo push a `piero-mejoras` y a la copia de revisión.

## Checkpoint · controles 2D y viaje al Pacífico · 13 noviembre, 17:10 Bogotá

La URL sirve la aplicación **`2fec2269fedde019ad05102afb5e1cfcf131f91d`**, commit estático **`f798af8c09f3f64c5cdfc76735418959e9a64eca`**, por fast-forward desde `665b1cd`. Pages confirmó `built` a las **17:09:35**; la lectura anónima de las **17:10:09** comprobó `source.json` y HTML exacto: **445.614 bytes**, SHA-256 **`135a4dd6c80861643436a427e024dae3eff7b50c5778d294357e039c45fa5e4b`**. Hay 112 archivos de aplicación y cuatro metadatos en la copia pública.

Incluye el permiso local de movimiento y transporte reparado de los cinco personajes, botones legibles, introducción ilustrada saltable/repetible, estados estáticos, fondo solar ampliado y vibración opcional. [Diseño, pruebas y límites](CINEMATICA.md), [prompt investigado](PROMPT_CINEMATICO.md) y [entrega vigente](ENTREGA_2D_CINEMATICA.md). Los dos recorridos HTTP del build exacto pasaron antes de la subida, sin errores, respuestas fallidas ni peticiones externas.

La comprobación pública completa pasó normal y sin WebGL: dos catálogos, ambos modos del reproductor, los cinco personajes, lluvia, imagen propia, teclado e idioma. Los **106 recursos** comprobados coinciden por SHA-256 con el build. También pasaron **14 recorridos de la introducción** y **10 de capacidad/preferencias hápticas**, sin errores JavaScript ni respuestas fallidas. La vibración física sigue pendiente de teléfono compatible.

La primera pasada pública de la introducción terminó por tiempo tras dos casos: esperaba el evento global `load`, que podía llegar después de la secuencia de tres segundos. Se conserva esa evidencia parcial en `browser-public-2fec226-cinema`; la prueba corregida observa DOM y aplicación listos y completó los 14 casos en `browser-public-2fec226-cinema-retry`. No fue necesario cambiar el producto publicado. Los demás informes están en `browser-public-2fec226-full`, `browser-public-2fec226-haptics`, `browser-local-2fec226`, `readback-2fec226.json` y `http-2fec226.json` bajo `_work/github-preview/`.

Se conservaron main local y `.github/` sin modificaciones. Antes de esta publicación, main remoto y la web oficial ya habían cambiado externamente respecto de la comprobación histórica inferior: a las 17:03:40 se registraron main remoto `885cd51e977f96bc421a3ad2d18cef322d28039b` y HTML oficial SHA-256 `bf4db6d86b2f293ebbee90cf85ae4b4ac8973aaafb8ba50c88a9d32d18f6f951`. La lectura posterior de las 17:10:20 conservó exactamente esos valores. Esta entrega solo hizo push a `piero-mejoras` y al repositorio independiente de revisión.

Los apartados siguientes son checkpoints históricos, no describen el producto vigente.

## Checkpoint · ajuste de zoom · 13 noviembre, 15:47 Bogotá

La misma URL sirve la aplicación **`e28c31f900103db54ef1885748ceb79f040f7f8b`**, commit estático **`c0ad86569b421f4991fd0fe4acfecbb82de13847`**. Pages confirmó `built` a las 15:47; la lectura anónima de las 15:48 verificó `source.json` y el HTML exacto: **409.567 bytes**, SHA-256 **`6af64c0f08ca360b7f2abe2041d07768ad0af02ade52a9ca79d4dc3418661bc4`**. El build conserva 112 archivos / **16.624.177 bytes** y los personajes 2D originales; la copia publicada añade cuatro metadatos.

Esta actualización añade la composición de bienvenida y guía para ventanas de hasta 320 píxeles de alto y abrevia las acciones de la guía. Pasan 16 casos de poca altura por motor en Chromium, Firefox y WebKit y se mantienen las 134 pruebas de lógica. [Alcance, evidencia y límites](RETO_05.md). El recorrido público completo volvió a comprobar **106 activos por SHA-256**, los dos catálogos y modos, los cinco personajes, lluvia, imagen propia e idioma, normal/sin WebGL, sin errores JavaScript, respuestas fallidas ni escrituras.

Evidencias de esta versión: `_work/github-preview/browser-local-e28c31f/`, `browser-public-e28c31f-full/`, `pushed-e28c31f.json`, `readback-e28c31f.json`, `http-e28c31f.json` y `official-after-e28c31f.json`. La comprobación pública de poca altura inicial completó 14 de 16 casos y terminó por tiempo de carga del documento. Se conserva separada; la repetición `browser-public-e28c31f-short-retry` completó los 16 casos, sin errores ni respuestas fallidas. Espera el DOM y la aplicación real, en lugar del evento global `load`.

A las 15:48, main remoto seguía en `59310ac43cd25e76cc68022a109326ca5cb27712`, main local en `a8f8203e8de3097584987a5ba5635bc813181c44`, `.github/` sin diferencias y la web oficial con SHA-256 **`a10648034b25fc4cda32a67d9c991960fab4f5c3a1ce0e4c180a57a708a98536`**. Los commits posteriores de pruebas y documentación no cambian el producto servido; la procedencia sigue identificada por `source.json`.

La entrega final queda en `_work/delivery/terrasonic-reto05-2026-11-13-final.zip` y su archivo `.sha256`. El manifiesto identifica el commit de la fuente completa, el commit de aplicación publicado y los resultados incluidos. La copia anterior sin el sufijo final conserva la primera publicación como checkpoint.

## Primera publicación RETO 05 · 13 noviembre, 15:31 Bogotá

La vista independiente sirve la aplicación **`ae859222721b655a9288ff745ad366fac4f0f03c`**, commit estático **`1813cad1f357e4a13f5b79de9d3818a383309509`**, publicado por fast-forward desde `4514aba`. Pages confirmó `built` a las 15:28. `source.json` identifica la procedencia. Esta edición utiliza exclusivamente la banda 2D original en el producto y aplica el brief confirmado, incluida la bienvenida/guía sin scroll interno, carga solo de imágenes, lluvia destacada y ¿Cómo funciona?. [Cambios, auditoría y límites](RETO_05.md).

El build tiene 112 archivos / **16.623.062 bytes**; la copia publicada añade cuatro metadatos. HTML: **408.452 bytes**, SHA-256 **`3d12113221704e1d9100668887f85a0ef0d3dd58970494e4b43d06657938e640`**. La comprobación anónima repitió ambos catálogos/modos de sonido, reproducción/pausa, teclado, los cinco personajes, lluvia, imagen propia e idioma, normal/sin WebGL. **106 activos coinciden por SHA-256**, sin errores JS, respuestas fallidas ni solicitudes de escritura. Los dos recorridos HTTP del build exacto pasaron antes de publicarlo.

Evidencias: `_work/github-preview/browser-local-ae85922/`, `browser-public-ae85922-full/`, `pushed-ae85922.json`, `readback-ae85922.json`, `http-ae85922.json` y `official-after-ae85922.json`. La matriz de producto queda en `_work/reto05-qa/`: 134 pruebas de lógica, 74 estados axe sin infracciones detectadas, 408 estados de redistribución y recorridos de sprites/guía en Chromium, Firefox y WebKit. No acredita teléfono físico, lector de pantalla, escucha humana ni revisión cultural. WebKit Windows conserva la alternativa escrita sin Web Audio nativo.

A las 15:30, main remoto continuaba en `59310ac43cd25e76cc68022a109326ca5cb27712`, el local en `a8f8203e8de3097584987a5ba5635bc813181c44` y `.github/` sin diferencias. La web oficial devolvió 200 y mantuvo la huella **`a10648034b25fc4cda32a67d9c991960fab4f5c3a1ce0e4c180a57a708a98536`**. Se mantuvieron las copias recuperables del estudio 3D fuera del build.

La entrega portátil definitiva se genera en `_work/delivery/terrasonic-reto05-2026-11-13-final.zip`, con su `.sha256`, manifiesto, build, fuente comprometida y evidencia seleccionada. La revisión documental posterior registra estos resultados; `source.json` sigue identificando el commit de aplicación efectivamente servido. La copia anterior sin el sufijo final conserva la primera publicación como checkpoint.

## Registro histórico anterior

## Actualización de temas · 13 noviembre, 11:17 Bogotá

La misma copia independiente sirve la aplicación **`9c385358604f861d9af7dfe7ac032f330df7eaf2`**, commit estático **`4514abab30c7ce8b76ce2e45c60e52d4e19b2dfa`**, fast-forward desde `bd92415`. Pages confirmó `built` para ese commit. El build tiene 103 archivos / **7.160.398 bytes**; el HTML tiene **427.594 bytes**, SHA-256 **`910ff229be45757aaa5fa12c37d4e745d0a406e1c9e20c10b83d08e7e86d61e4`**.

El cambio añade claro/pizarra y conserva las opciones de alto contraste. Pasan 142 pruebas de producto, 256 estados de temas por cada uno de tres motores y los recorridos del menú con nueve controles y texto ampliado. Dos recorridos HTTP locales del build exacto pasaron antes de actualizar. En público, `verify_public.cjs --full-player` repitió ambos catálogos y modos, normal/sin WebGL, los cinco modelos, CSV y 96 huellas, sin errores ni escrituras. Una comprobación adicional en 390×844 y 1342×605 accionó «Modo claro» mediante Espacio, conservó estado/archivo/columna y confirmó persistencia tras recargar, portada completa y ausencia de desbordamiento horizontal.

Evidencias: `_work/github-preview/browser-public-9c38535-full/results.json`, `browser-public-9c38535-themes-settled/results.json`, `pushed-9c38535.json`, `readback-9c38535.json` y `official-after-9c38535.json`. La primera comprobación adicional capturó el CSV mientras aún terminaba su conversión; se conserva como fallo del fixture y se corrigió esperando el estado de la columna antes de comparar. No se cambió producto para resolver esa carrera de la prueba.

A las 11:19 de Bogotá, main remoto seguía en `59310ac`, el local en `a8f8203`, `.github/` sin diferencias y la web oficial con su huella anterior. **Esta publicación no rehace los personajes:** siguen visibles los modelos rechazados por el usuario, hasta terminar y comprobar la nueva revisión artística por la interfaz de Blender. La copia de estudio no se exportó ni se presenta como trabajo terminado.

## Copia GitHub Pages anterior · c4f7aca

La copia estática independiente está en [Alvaro-mendoza-12/terrasonic-piero-preview-20261113](https://github.com/Alvaro-mendoza-12/terrasonic-piero-preview-20261113), repositorio público nuevo, ID `1456496176`. Se verificó identidad `Alvaro-mendoza-12`, ID `203316642`, y permiso administrador exclusivamente en esta copia antes de habilitar Pages. El conector GitHub disponible no ofrecía creación de repositorios/Pages; se usaron Git y la API oficial con el credencial existente del gestor, solo en memoria. No se copiaron credenciales al repositorio, archivos públicos ni URL.

| Procedencia | Valor |
| --- | --- |
| Código de aplicación original | `c4f7aca45b1c8aabcd6bbf46918e4e08cc728e20` en `piero-mejoras` |
| Commit estático de la copia | `bd92415ccf233308c793ad2b6616345c08e2e17c`, descendiente directo de `1f67440baffada3396807ec2bffb820362b2443d` |
| Rama de la copia y fuente Pages | `piero-mejoras`, directorio `/`, `build_type: legacy` |
| Archivos de la copia | 107; 103 del build más README, procedencia y dos archivos de configuración estática |
| HTML publicado | 423.697 bytes, SHA-256 `4e89a5db6c675b9d477dd5d1059d5c96d6055ea17ac2f77ceb9bcd93db92fd27` |
| HTTPS y acceso | Valores iniciales del proveedor: `https_enforced: true`, `public: true` |
| Resultado | API Pages `built` para el commit estático exacto; navegador anónimo y Python reciben HTTP 200 |

La preparación parte de `git archive` del commit identificado, sin archivos ignorados, y conserva las licencias incluidas. Se sirvió localmente bajo el mismo subdirectorio que usa Pages: dos recorridos reales por HTTP pasaron antes de publicar cada checkpoint. La actualización de las 09:54 fue un fast-forward del mismo repositorio, sin force-push. La copia solo tiene la rama `piero-mejoras`, que GitHub seleccionó como predeterminada tras el primer push. No se creó una rama main en ella ni se añadió un workflow propio. No se modificaron la protección Vercel ni los ajustes de publicación del repositorio original, ni se contrataron pagos.

`verify_public.cjs --full-player` abrió dos contextos nuevos sin credenciales, normal y sin WebGL. Pasaron portada completa móvil, EIC/GIBS × Melodía/Datos, reproducir/pausar, saltos con teclado en pausa, leyenda, cuadrícula de 448 celdas bajo demanda, los cinco GLB/poses, la imagen de ejemplo y CSV de tres columnas. Cambiar a inglés conserva la columna. Las 96 huellas comprobadas incluyen fuentes/licencias locales además de los 81 activos de la primera copia. El HTML completo coincide sin necesitar excluir inserciones del proveedor. No hubo errores JavaScript, respuestas HTTP fallidas ni solicitudes de escritura. Evidencia actual: `_work/github-preview/browser-public-c4f7aca-full/`, `pushed-c4f7aca.json` y `readback-c4f7aca.json`; la comprobación inicial se conserva en `browser-public/` y `official-after-publication.json`. `source.json` en la URL pública identifica la fuente.

```powershell
node scripts/verify_public.cjs https://alvaro-mendoza-12.github.io/terrasonic-piero-preview-20261113/ ruta/al/build-exacto _work/public/actual --full-player
```

La comprobación de las 06:10 de Bogotá mantuvo el remoto main original en `59310ac`, el main local en `a8f8203`, cero cambios de `.github/` y la web oficial con su SHA-256 `a10648034b25fc4cda32a67d9c991960fab4f5c3a1ce0e4c180a57a708a98536`. El push original solo actualizó `piero-mejoras` a `0fefefd`. Para publicar otro checkpoint se reutiliza esta misma copia, después de generar y verificar sus archivos; no se debe crear otra ni enviar el build a main del proyecto.

Referencias de la operación: [GitHub Pages en repositorios públicos](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [API de creación de repositorio](https://docs.github.com/en/rest/repos/repos#create-a-repository-for-the-authenticated-user), [fuente Pages mediante API](https://docs.github.com/en/rest/pages/pages#create-a-github-pages-site).

## Primera publicación Sites, conservada como checkpoint

Vista inicial: **https://terrasonic-piero-preview-20261113.satinkoi3.chatgpt.site**. La información siguiente corresponde a esa versión, no a la copia GitHub Pages actual.

Se publicó con la integración y skill Sites como una copia estática independiente, sin base de datos ni backend de aplicación. El código del visitante sigue ejecutándose localmente. La audiencia pública se configuró solo para este Site nuevo, conforme al requisito de un enlace sin credenciales. No se cambió la protección del proyecto Vercel existente ni la configuración de GitHub Pages.

## Procedencia de la copia verificada

| Identificador | Valor |
| --- | --- |
| Repositorio original | `Nishix03/TerraSonic-NASA-Space-APPS` |
| Rama de trabajo | `piero-mejoras` |
| Código de aplicación de este checkpoint | `409f19758f44954eeb304645a5699a1ca72a6717` |
| Site | `appgprj_6af6c9713984819186c5a346e2b19cb9` |
| Versión Sites | 1 |
| Fuente estática Sites | `96f669644569f7c628c77f38780c8aa103f6c166` |
| Versión guardada | `appgprj_6af6c9713984819186c5a346e2b19cb9~appgver_b44e4e7049e881918f6c2977be28f7b3` |
| Despliegue | `appgdep_6af6c9fe82bc81918e8357729748f47f` |
| Resultado del proveedor | `succeeded`, 13 nov 2026 08:27:55 UTC |

La rama `main` del repositorio fuente de Sites es una copia nueva y aislada; no es `main` del proyecto GitHub. El manifiesto `.openai/hosting.json` queda en `_work/sites/terrasonic-piero-preview/` para reanudar el mismo Site, no crear otro. Declara exclusivamente `static.directory: dist`.

El helper oficial de Sites verificó el push de esa fuente y produjo el archivo de despliegue, de 7.014.400 bytes y 89 entradas, con huella `sha256:9cfbf5d7f7b97152e8a6c7e765c8ac5a0d9ea574f10b522614ed20afaa879f43`. Los credenciales del repositorio Sites se pasaron por stdin y memoria de sesión; no se guardaron en el código ni en este documento.

## Verificación sin credenciales

`scripts/verify_public.cjs` abre contextos nuevos de Chromium, sin cookies de inicio ni cabeceras de autenticación. La URL devuelve HTTP 200 y permanece en su propio origen. La prueba recorre portada, EIC y GIBS, reproducción/pausa, leyenda, los cinco músicos y la imagen de ejemplo; repite el recorrido con WebGL deshabilitado en el fixture.

Los 81 archivos comprobados coinciden por SHA-256 con el paquete local: 60 mapas, cinco GLB, diez poses/caras, dos scripts de ejecución y el módulo 3D, más los catálogos y la serie NASA POWER. No hubo errores JavaScript ni respuestas HTTP fallidas del Site en esos recorridos. Cada pose se decodificó en el navegador. Capturas y JSON: `_work/public/browser/`.

Una consulta directa con `urllib` devolvió 403; el navegador anónimo sí devolvió 200 y ejecutó el producto. Se conserva esa distinción: la prueba de acceso público acreditada es la sesión de navegador limpia, no la consulta de Python ni un token de acceso del propietario.

```powershell
node scripts/verify_public.cjs https://terrasonic-piero-preview-20261113.satinkoi3.chatgpt.site _site _work/public/browser
```

## GitHub y web oficial

La identidad `Alvaro-mendoza-12` se verificó mediante la API GitHub con un credencial existente del gestor Git, sin mostrarlo. El repositorio confirmó permiso `push: true`. El push se hizo explícitamente a `piero-mejoras:piero-mejoras`, sin force-push. Después, el remoto mostraba esta rama en `409f197` y `main` seguía en `59310ac43cd25e76cc68022a109326ca5cb27712`. La rama local main permanecía en `a8f8203e8de3097584987a5ba5635bc813181c44`.

`.github/workflows/pages.yml` solo publica en `push` a `main` o mediante un `workflow_dispatch` explícito. No hay diferencias de `.github/` en la rama y no se disparó un despacho manual. El trabajo no contiene un merge a main ni una publicación de GitHub Pages del repositorio original.

La lectura de la [web oficial](https://nishix03.github.io/TerraSonic-NASA-Space-APPS/) devolvió 200, con SHA-256 del HTML `a10648034b25fc4cda32a67d9c991960fab4f5c3a1ce0e4c180a57a708a98536` en la observación de las 03:35 de Bogotá. Esa huella se conserva para comparar al cierre; no se toma el build Windows reconstruido como si fuera una copia binaria idéntica del despliegue Linux.

## Intento Vercel

El CLI existente 54.7.1 estaba autenticado en `alvaro-mendoza-12`, equipo `alvaro-s-projects1`. Sus previews existentes tenían protección. Se mantuvo esa configuración.

Se probó el flujo temporal oficial con Vercel CLI 65.15.0, obtenido del registro npm oficial en una caché de D. Se usaron un directorio de build y una configuración temporal separados, sin cerrar la sesión existente. Vercel informó `READY` en `https://sonic-reef-tiugkfl.tmp.now`, con vencimiento el 13 nov a las 09:21:33 UTC, pero devolvió 403 tanto a Python como a un navegador sin credenciales. No se presenta como vista pública utilizable. El enlace privado de reclamación no se publicó ni se incluye en paquetes.

La URL de Sites anterior es la alternativa verificada. La entrega completa y el registro de tiempo siguen en `PIERO-MEJORAS.md`; publicar este checkpoint no acredita por sí solo el cierre de todos los requisitos.

## Revisión posterior y acceso de actualización

A las 04:45 de Bogotá, `get_site` seguía devolviendo el Site activo, su URL y versión 1. Sin embargo, no devolvía rol ni credencial de edición; `create_source_repository_write_credential` respondió `NOT_FOUND / project_not_found / 404`, y `list_sites(include_editable: true)` devolvió una lista vacía en la cuenta seleccionada. La credencial de la creación había vencido a las 08:35 UTC. No se reutilizó un token vencido, no se creó otro Site ni se cambió la audiencia.

Las correcciones posteriores de fuentes locales, selector CSV, foco en WebKit e imágenes sin deformación siguen separadas del checkpoint publicado. Para actualizar esta misma URL falta recuperar el acceso editor/propietario al Site existente desde la integración. El paquete portable y Git permiten revisar el código nuevo mientras tanto. El diagnóstico anterior no es un rechazo de aprobación automática ni significa que el enlace público haya dejado de funcionar.

La revisión anónima de las 04:58 volvió a pasar normal/sin WebGL y 81 huellas. También comprobó todo el HTML de aplicación frente al `dist` de la versión 1. Cloudflare inserta al final un script de detección con un identificador variable; se conserva su huella de transporte y solo se excluye esa inserción identificada para comparar el código de aplicación. La respuesta real que ejecuta el navegador no se altera. El HTML oficial observado a las 04:55 mantuvo la huella original de las 03:35; el remoto main seguía en `59310ac` y piero-mejoras en `122fd9d`.

La revisión de las 09:56 conserva las mismas referencias de main y la misma huella de la web oficial, después de actualizar la copia independiente a c4f7aca. Evidencia: `_work/github-preview/official-after-c4f7aca.json`. La comprobación adicional `_work/github-preview/browser-public-c4f7aca-layout/` recorre HTTP real a 390×844 y 1342×605 y exige que mapa/banda y controles principales del reproductor inicial quepan en la ventana original. No registra solicitudes externas, respuestas fallidas ni errores JS.
