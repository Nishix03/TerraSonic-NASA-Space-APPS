# Método y tecnologías de esta versión

La interfaz pública explica la secuencia real: imágenes fechadas, reducción a 448 celdas, búsqueda de color en la paleta del producto, niveles derivados, barrido por columnas, motor Melodía/Datos, decisiones editoriales y alternativas locales. Conserva los ocho objetivos de Space Apps y sus rutas al producto. El enlace del reto usa la ruta oficial `the-earth-information-jukebox`; la búsqueda oficial la confirma, aunque la consulta directa devolvió 502 durante esta revisión.

## Datos y alcance

- EIC: 30 archivos conservados del video Pacífico SVS 5176, selección cada 30 días entre el 16 de mayo de 2024 y el 2 de noviembre de 2026. `data/discos.json` y `scripts/descargar_fotogramas.py` conservan la selección y fechas. No se consulta una actualización diaria durante la visita.
- GIBS: 30 mapas de los cinco episodios históricos de 2010–2023. La fecha de cada mapa es el día 15. Se conserva la [paleta oficial GHRSST](https://gitc.earthdata.nasa.gov/colormaps/v1.0/output/GHRSST_Sea_Surface_Temperature_Anomalies.html) y su huella en `data/colormaps/`.
- Región: Pacífico 140°–70°O y 25°S–15°N. El recuadro costero utilizado por Silbo es una selección del algoritmo, no la delimitación administrativa de todas las localidades citadas.
- NASA POWER: el JSON existente conserva precipitación, temperatura y humedad mensuales 1981–2024 de tres lugares. El ejemplo público utiliza 48 valores de Chiclayo 2015–2018, en −6,77°, −79,84°, parámetro PRECTOTCORR. Son promedios mensuales de precipitación diaria en mm/día, no acumulados mensuales. [Documentación del servicio mensual](https://power.larc.nasa.gov/docs/services/api/temporal/monthly/).

La anomalía es una diferencia respecto a una referencia climática, no temperatura absoluta. La extracción de color de imágenes reducidas no recupera sin pérdida el campo científico original. EIC y GIBS utilizan paletas y rangos distintos; los niveles derivados entre −5 y +5 no son grados ni hacen ambos productos físicamente comparables. El producto lo explica junto al mapa y en Método. La tabla de colores es la representación propia de TerraSonic; las leyendas textuales del reproductor diferencian fuente, referencia y ausencia de datos.

En tablas se selecciona el valor de mayor desviación respecto a la media en cada grupo de la serie, se normaliza con la mitad de su rango y se representa en 28 pasos. Los niveles de una foto propia o una serie numérica tampoco son anomalías oceánicas.

## Música y fuentes de impactos

Las escalas y acordes son decisiones compositivas. `docs/REPRODUCTOR.md` documenta su concordancia con las notas; `docs/IMPACTOS.md` documenta el catálogo y la reducción fija de 10 ppm en Melodía de Yaku durante marzo de 2023, basada en el registro de Pacora. La regla no convierte víctimas en emociones ni aplica daños de periodos distintos. Las fichas culturales se explican en `docs/PERSONAJES.md`.

## Tecnología

La página tiene cuatro categorías estables y créditos. Los filtros «Todo», «Navegador», «Producción» y «Datos» distinguen dónde se utiliza cada herramienta; un filtro sin coincidencias conserva la categoría y muestra un estado vacío recuperable. Se retiraron servicios y bibliotecas planeados: Tone.js, Tonal.js, Magenta, Lyria, Stable Audio, ElevenLabs, Krita y Piskel.

Se declara la carga diferida de Three.js/GLTFLoader y el respaldo WebP, Web Audio, Canvas, lectura local y preferencias, voz/vibración condicionadas a disponibilidad y tipografías con alternativas. Blender/Python, ffmpeg, Node/Playwright y Git son herramientas de producción o verificación; no se ejecutan como servicios remotos de la app. El sitio sigue estático y no tiene backend, base de datos remota ni generación de música por IA. La declaración de IA se limita al registro y explicita la revisión humana pendiente.

## Evidencia

116 pruebas pasan tras esta revisión. `scripts/verify_method.cjs` recorre Método y Tecnología en español e inglés, cinco anchos (320, 390, 768, 1366, 1920), ocho pantallas en total y los cuatro filtros de cada categoría técnica. Comprueba contexto conservado, contenido, fuentes y ausencia de desbordamiento horizontal. Las capturas están en `_work/method/browser/`. Son comprobaciones Chromium, no una certificación ni una evaluación con usuarios.
