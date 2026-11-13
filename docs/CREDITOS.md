# Créditos, datos y código reutilizado

Cada librería, repositorio, imagen o snippet que reutilicemos va aquí, con su enlace y licencia.

## Marca del reto
- Logos oficiales de NASA Space Apps (solo estos; no se redibujan): https://www.spaceappschallenge.org/brand/ · kit: https://assets.spaceappschallenge.org/media/documents/NASA_Space_Apps_Logos_2026.zip · guía de marca: https://assets.spaceappschallenge.org/media/documents/Space_Apps_Brand_Guide_VUGpVJm.pdf

## Datos
- **Fotogramas oficiales del Earth Information Center**: *Sea Surface Temperature (SST) Anomaly – Near Real Time*, variante Pacífico (https://svs.gsfc.nasa.gov/5176), 16 may 2024 – 2 nov 2026. Crédito: NASA's Scientific Visualization Studio (visualizador Kel Elkins, USRA; científica Atousa Saberi, NASA/GSFC). Los fotogramas se recortan al Pacífico sudeste y se reducen a 560×320; la escala de color (−4 °C a +4 °C) es la de la visualización. Datos de origen: JPL MUR SST (https://podaac.jpl.nasa.gov/dataset/MUR-JPL-L4-GLOB-v4.1). Reutilización según las guías de la NASA: https://www.nasa.gov/multimedia/guidelines/index.html
- Los extras SVS 5207 y 4897 figuraban en planes anteriores; no forman parte de los discos de esta versión.
- **NASA POWER** (Prediction Of Worldwide Energy Resources), NASA Langley Research Center. https://power.larc.nasa.gov — parámetros PRECTOTCORR, T2M y RH2M, resolución mensual, 1981–2024.
- **NASA Worldview / GIBS**, capa GHRSST Sea Surface Temperature Anomalies: 30 mapas, día 15 de cada mes, cinco episodios 2010–2023. La paleta oficial se conserva en `data/colormaps/` con procedencia y huella. No son imágenes MODIS. [Paleta oficial](https://gitc.earthdata.nasa.gov/colormaps/v1.0/output/GHRSST_Sea_Surface_Temperature_Anomalies.html).
- Los hechos de impactos y las referencias culturales, con sus límites, están en `data/impacts.v1.json`, `data/characters.v1.json`, `docs/IMPACTOS.md` y `docs/PERSONAJES.md`.

## Referencias culturales (por citar con fuente exacta)
Los diseños de los personajes (docs/PLAN.md §9.6) están **inspirados** en piezas y lugares reales. M5 anota aquí cada fuente consultada:
- Museo Tumbas Reales de Sipán y Museo Nacional Sicán (Lambayeque): orfebrería, tocados y botellas silbadoras.
- Museo Brüning (Lambayeque) y el sitio de Chan Chan (La Libertad): cerámica y frisos.
- Pescadores de Huanchaco (Trujillo): caballitos de totora.
- Artesanía en paja de Catacaos (Piura) y Monsefú (Lambayeque), y la marimba de chonta del Pacífico de Ecuador y Colombia.
- Parque Nacional Galápagos: fauna.
- Textiles, honda y bombo andinos (sierra norte del Perú).

## Inspiración
- Sonificaciones de NASA Chandra: https://chandra.si.edu/sound/
- Botellas silbadoras precolombinas del norte del Perú (Vicús, Moche, Chimú, Lambayeque). *(M5: agregar las fuentes del museo)*

## Librerías
| Librería | Uso | Licencia | Enlace |
|---|---|---|---|
| Three.js + GLTFLoader, copia local combinada | Vistas 3D con respaldo estático | MIT, copia en `scripts/vendor/three-LICENSE.txt` | https://github.com/mrdoob/three.js |

El audio utiliza Web Audio nativo, sin Tone.js. axe-core 4.14.0 (MPL-2.0) se descarga exclusivamente como herramienta de auditoría local y no se incluye en el producto. Su licencia acompaña el paquete en `_work/axe/`. Las tipografías se solicitan a Google Fonts con alternativas del sistema. Los modelos procedurales nuevos y sus atlas se generan dentro del repositorio; no se importaron modelos de terceros.

## Repos y snippets reutilizados
| Qué | De dónde | Licencia | Dónde lo usamos |
|---|---|---|---|
| | | | |
