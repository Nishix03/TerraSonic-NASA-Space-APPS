# Revisión de la banda 3D

## Línea base y propuestas

La base `59310ac` tiene cinco relieves con textura frontal, derivados de las ilustraciones del equipo. Se inspeccionaron en Blender 5.2.2 LTS. Los perfiles mostraban volumen inflado sin anatomía independiente y la espalda conservaba partes del dibujo frontal. Los cinco tenían la misma altura de 2,9 unidades. El total de sus GLB era 8 274 192 bytes.

El generador `scripts/modelar_banda.py` ahora construye cuerpos, rostros, prendas y objetos completos con geometría propia. Se conservan los nombres, colores y elementos reconocibles de la biblia visual. Es una propuesta de estilo volumétrico simplificado para revisión del equipo. Las ilustraciones originales y sus prompts permanecen disponibles y se pueden recuperar los modelos anteriores desde el commit base.

| Personaje | Rasgos del modelo nuevo | Altura Blender | Triángulos | GLB, bytes |
| --- | --- | --- | --- | --- |
| Silbo | Cabello y bigote plateados, media luna, orejeras, túnica, quena con agujeros y botella con asa | 2,70 | 17 872 | 674 444 |
| Inti | Sombrero, medallón solar, camisa, chaqueta, marimba con resonadores y dos mazos | 2,56 | 13 952 | 572 612 |
| Mamacocha | Trenzas, cabello largo, abrigo con ondas, medallón tejido y arpa con cuerdas | 2,55 | 17 736 | 679 524 |
| Yaku | Capucha con cresta, gafas, mochila, botas y tres botellas con diferentes niveles | 2,10 | 17 582 | 674 644 |
| Illapa | Sombrero, poncho asimétrico, gafas abiertas, honda, bombo con tensores y baqueta | 2,81 | 13 592 | 547 024 |

El conjunto ocupa 3 148 248 bytes, un 62 % menos que los GLB de la base. Cada modelo utiliza una malla y un material con atlas PBR de 64 × 32, con color, rugosidad y metalicidad. Las texturas van dentro de cada GLB. Las poses de respaldo y retratos WebP de los cinco suman 133 010 bytes.

## Rig y movimiento

Cada personaje tiene 17 huesos con jerarquía explícita de raíz, cadera, torso, cabeza, brazos, antebrazos, manos, muslos, piernas, pies e instrumento. Las piezas están ponderadas a su articulación. No se simula tela. Los clips Idle, Play, Walk, Dance y Speak son bucles cortos y mantienen la raíz en su sitio.

Walk es un paso en el lugar para una presentación web. Se muestrearon inicio, cuartos, mitad y final de los cinco clips por personaje. Los mínimos de la malla evaluada están sobre el suelo, con diferencias numéricas menores que la tolerancia de 2 cm. La inspección visual incluye frente, perfil, espalda y frames de Play y Walk. La captura de hechos está en `_work/models/after/state.json`; los renders están en el mismo directorio.

Las miniaturas y bustos muestran una imagen obtenida de la escena y no cargan el motor 3D. Las vistas grandes y los miembros activos de Escuchar cargan el modelo al entrar en el área visible. Una pose estática está disponible antes de esa descarga, con errores de red y sin WebGL. Al pausar se usa Idle en tiempo cero. Con movimiento reducido, una acción manual también conserva la pose. Girar sigue disponible como acción discreta.

## Referencias culturales y límites

Las formas nuevas son diseños del proyecto asistidos por código. Las referencias a materiales y lugares orientan el diseño. No se han importado modelos, texturas o fotos de terceros para estos personajes.

- **Silbo.** La media luna y las orejeras continúan la propuesta moche de `docs/PLAN.md`. La documentación del Ministerio de Cultura describe tocados de media luna en contextos de Sipán. El sombrero de Catacaos es una referencia contemporánea distinta; falta incorporar y revisar esa adaptación del personaje solicitada en el encargo. [Artículo de Arqueológicas](https://revistas.cultura.gob.pe/index.php/arqueologicas/article/download/445/526/1850), [declaratoria de Catacaos](https://transparencia.cultura.gob.pe/rvm-ndeg-033-2013-vmpcic-mc)
- **Inti.** La marimba toma como referencia el instrumento de madera de palma con resonadores de bambú descrito por UNESCO para comunidades afrodescendientes del Pacífico colombiano y Esmeraldas. El personaje no representa a esas comunidades. El traje de faena de Paita y el episodio 2015–2016 necesitan una ficha histórica y revisión adicional. [UNESCO, expediente 01099](https://ich.unesco.org/en/RL/marimba-music-traditional-chants-and-dances-from-the-colombia-south-pacific-region-and-esmeraldas-province-of-ecuador-01099)
- **Mamacocha.** La fibra de iraca se usa en tejeduría y cestería de Usiacurí; el documento consultado describe una estructura de alambre revestida de tejido. El medallón es una interpretación geométrica nueva. La fuente no acredita un arpa de iraca ni una indumentaria de Santa Lucía. El arpa sigue siendo ficción del diseño del equipo. [Artesanías de Colombia](https://repositorio.artesaniasdecolombia.com.co/items/ad4424f8-ba9a-4b58-93d3-f8a65cd9f159)
- **Yaku.** La ficha de MINCETUR identifica a Mórrope y el tejido en algodón nativo. El parche de colores crema y pardo es una propuesta visual. Mórrope y Pacora son referencias geográficas distintas; la relación con el episodio de marzo de 2023 está pendiente de documentar. [MINCETUR, ficha 13353](https://consultasenlinea.mincetur.gob.pe/fichaInventario/index.aspx?cod_Ficha=13353)
- **Illapa.** PROMPERÚ documenta trabajos de pasalla, fibra del tallo del plátano, en la artesanía de Tumbes. La fuente acredita artesanía y no el uso de esa fibra en un poncho. La adaptación del vestuario y la ficha del episodio 2023–2024 siguen pendientes. [Guía de Tumbes, página 6 del PDF](https://repositorio.promperu.gob.pe/server/api/core/bitstreams/354822f2-1e01-450c-93a2-ee46f6076285/content#page=6)

Se consultaron los principios de UNESCO sobre diálogo, consentimiento y papel de las comunidades ante representaciones de su patrimonio. Falta revisión por el equipo y por personas vinculadas a esas prácticas. Las tres imágenes históricas mencionadas en el encargo no se pudieron recuperar de la conversación compartida. [Principios éticos de UNESCO](https://ich.unesco.org/en/ethics-and-ich-00866)

## Pruebas reproducibles

La escena editable se guarda en `assets/avatares/terrasonic-banda.blend`. Los modelos e imágenes nuevos se generan con estos comandos desde la raíz del repositorio.

```powershell
& 'D:/Blender Foundation/blender.exe' --background --factory-startup --threads 4 --python scripts/modelar_banda.py
& 'D:/Blender Foundation/blender.exe' --background assets/avatares/terrasonic-banda.blend --threads 4 --python scripts/inspect_banda.py -- --output _work/models/after --render --motion-renders --fallbacks
python scripts/build_pages.py _site
node scripts/test_guides.cjs _site/index.html
node --test scripts/models.test.cjs
```

La comprobación web usa una instalación existente de Playwright Core y Chromium mediante variables, sin añadir dependencias al producto.

```powershell
$env:TERRASONIC_PLAYWRIGHT = 'ruta/a/playwright-core'
$env:TERRASONIC_CHROMIUM = 'ruta/a/chrome-headless-shell.exe'
node scripts/verify_models.cjs _site _work/models/browser
node scripts/benchmark_browser.cjs _site _work/benchmarks/after.json
```

La regresión de navegador prueba cinco personajes en seis situaciones: carga normal, movimiento reducido, ausencia de WebGL, modelo lento, modelo ausente y runtime ausente. Comprueba además los cuerpos completos en Escuchar y la activación compartida con Escenario. Las capturas y el JSON se guardan fuera del paquete público.

## Rendimiento y evidencia pendiente

El perfil local emula 390 × 844, latencia de 150 ms, descarga de 200 KiB/s, CPU ×4 y caché deshabilitada. Se hicieron tres recorridos por versión. La mediana inicial fue de 6,25 s hasta Inicio utilizable, 2,40 s desde elegir Escuchar hasta el control del reproductor y 37,83 s desde Banda hasta el primer render 3D. Con carga diferida y los nuevos modelos, una medición intermedia dio 2,60 s, 0,90 s y 10,67 s respectivamente. Son recorridos emulados en esta laptop, con SwiftShader. Las imágenes de respaldo son visibles durante la descarga. El conteo de bytes GLB por CDP resultó incompleto; el peso de los archivos se obtiene del disco.

Quedan por medir el paquete final completo, continuidad de audio con el nuevo reproductor, teléfono físico, escucha humana y revisión cultural. Esta revisión de modelos no acredita el cierre del encargo completo de TerraSonic.
