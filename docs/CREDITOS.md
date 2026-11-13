# Créditos, datos y código reutilizado

Créditos de los recursos distribuidos y de las referencias consultadas. El catálogo de cada personaje conserva las fuentes culturales exactas; citar una fuente no implica aprobación de esa representación por su comunidad.

## Marca del reto
- Logos oficiales de NASA Space Apps (solo estos; no se redibujan): https://www.spaceappschallenge.org/brand/ · kit: https://assets.spaceappschallenge.org/media/documents/NASA_Space_Apps_Logos_2026.zip · guía de marca: https://assets.spaceappschallenge.org/media/documents/Space_Apps_Brand_Guide_VUGpVJm.pdf

## Datos
- **Fotogramas oficiales del Earth Information Center**: *Sea Surface Temperature (SST) Anomaly – Near Real Time*, variante Pacífico (https://svs.gsfc.nasa.gov/5176). La selección distribuida contiene treinta archivos fechados entre el 16 may 2024 y el 3 oct 2026, según `data/discos.json`; no es una consulta en vivo. Crédito: NASA's Scientific Visualization Studio (visualizador Kel Elkins, USRA; científica Atousa Saberi, NASA/GSFC). Los fotogramas se recortan al Pacífico sudeste y se reducen a 560×320; la escala de color (−4 °C a +4 °C) es la de la visualización. Datos de origen: JPL MUR SST (https://podaac.jpl.nasa.gov/dataset/MUR-JPL-L4-GLOB-v4.1). Reutilización según las guías de la NASA: https://www.nasa.gov/multimedia/guidelines/index.html
- Los extras SVS 5207 y 4897 figuraban en planes anteriores; no forman parte de los discos de esta versión.
- **NASA POWER** (Prediction Of Worldwide Energy Resources), NASA Langley Research Center. https://power.larc.nasa.gov — parámetros PRECTOTCORR, T2M y RH2M, resolución mensual, 1981–2024.
- **NASA Worldview / GIBS**, capa GHRSST Sea Surface Temperature Anomalies: 30 mapas, día 15 de cada mes, cinco episodios 2010–2023. La paleta oficial se conserva en `data/colormaps/` con procedencia y huella. No son imágenes MODIS. [Paleta oficial](https://gitc.earthdata.nasa.gov/colormaps/v1.0/output/GHRSST_Sea_Surface_Temperature_Anomalies.html).
- Los hechos de impactos y las referencias culturales, con sus límites, están en `data/impacts.v1.json`, `data/characters.v1.json`, `docs/IMPACTOS.md` y `docs/PERSONAJES.md`.

## Referencias culturales y límites

Los conceptos históricos del equipo están en `docs/PLAN.md` §9.6. Su lista de museos, lugares y materiales es una inspiración propuesta, no un registro de visitas ni autorización de uso. La revisión actual distingue hechos, referencias e interpretaciones nuevas en [PERSONAJES.md](PERSONAJES.md) y `data/characters.v1.json`.

Se consultaron fuentes del Ministerio de Cultura para Catacaos e instrumentos moche, UNESCO para marimba del Pacífico colombiano/Esmeraldas, Artesanías de Colombia para iraca de Usiacurí, MINCETUR para algodón nativo de Mórrope y PROMPERÚ para pasalla de Tumbes. Allí constan los enlaces exactos y lo que cada documento permite afirmar. Los modelos no son réplicas de una indumentaria certificada, y no se atribuye una práctica de otra localidad a las personas de un episodio. No se importaron fotografías de esas fuentes.

## Inspiración
- Sonificaciones de NASA Chandra: https://chandra.si.edu/sound/
- La inspiración moche del equipo se contrasta con [Arqueológicas 31, Ministerio de Cultura](https://museos.cultura.pe/sites/default/files/publicaciones/pdf/arqueologicas31_2022%20%281%29.pdf). La quena del modelo, la vasija visual y el sonido sintetizado se distinguen; no se afirma una reconstrucción acústica arqueológica.

## Librerías
| Librería | Uso | Licencia | Enlace |
|---|---|---|---|
| Three.js + GLTFLoader, copia local combinada | Vistas 3D con respaldo estático | MIT, copia en `scripts/vendor/three-LICENSE.txt` | https://github.com/mrdoob/three.js |

El audio utiliza Web Audio nativo, sin Tone.js. axe-core 4.14.0 (MPL-2.0) se descarga exclusivamente como herramienta de auditoría local y no se incluye en el producto. Su licencia acompaña el paquete en `_work/axe/`. Las tipografías Barlow, Inter, IBM Plex Mono y Atkinson Hyperlegible se incluyen localmente en `assets/fonts/`, con sus cuatro licencias SIL OFL 1.1, copyright y huellas de los WOFF2 originales de Google Fonts. El navegador conserva alternativas del sistema y no solicita fuentes a terceros. Los modelos procedurales nuevos y sus atlas se generan dentro del repositorio; no se importaron modelos de terceros.

Khronos glTF Validator `2.0.0-dev.3.10` (Apache-2.0) se usa solo como herramienta local de auditoría, con el paquete original/licencia en `_work/gltf-validator/`; no se distribuye como runtime ni se envían modelos a un servidor de validación. [Fuente oficial](https://github.com/KhronosGroup/glTF-Validator).

## Referencias de diseño y código

[NASA GIBS Worldview](https://github.com/nasa-gibs/worldview), el proyecto [Earth Jukebox](https://github.com/jaherunhasanrimon/NasaSpaceApp1stPrototype_Earth-Jukebox-Listen-to-a-Changing-Planet) y el ejemplo de [reloj Web Audio de Chris Wilson](https://web.dev/articles/audio-scheduling) se consultaron como referencias. No se importaron su código, interfaces, imágenes o música. La copia local Three.js de la tabla anterior sí se distribuye con su aviso MIT. La asistencia de IA documentada está en [USO_DE_IA.md](USO_DE_IA.md).
