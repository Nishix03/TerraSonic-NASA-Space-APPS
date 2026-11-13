# Terrasonic · Earth Information Jukebox

> Hace más de 1500 años, el agua ya cantaba en el norte del Perú. Ahora canta el Pacífico visto por la NASA.

Proyecto para **NASA Space Apps Challenge 2026 · Chiclayo · Reto 5: [The Earth Information Jukebox](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/)**.

**Terrasonic** es una jukebox retro pixelada que escanea, de oeste a este, los fotogramas de anomalía de temperatura del mar de las visualizaciones del **Earth Information Center** y los convierte en música en tiempo real. La toca una banda de cinco personajes:

| Personaje | Escucha | Toca |
|---|---|---|
| **Silbo**, el huaco silbador | la costa del Perú | silbido de alarma |
| **Inti** | píxeles cálidos | acordes |
| **Mamacocha** | píxeles fríos | bajo |
| **Yaku** | densidad de anomalías | gotas pentatónicas |
| **Illapa** | extremos | truenos |

| | |
|---|---|
| Plan de desarrollo | [`docs/PLAN.md`](docs/PLAN.md) |
| Contratos entre módulos | [`docs/CONTRATOS.md`](docs/CONTRATOS.md) |
| Prototipo interactivo (boceto) | https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU *(privado: el dueño debe compartirlo)* |
| Uso de IA | [`docs/USO_DE_IA.md`](docs/USO_DE_IA.md) |
| Historial de iteraciones del prototipo (qué cambió y quién) | [`docs/ITERACIONES.md`](docs/ITERACIONES.md) · código en [`prototipos/`](prototipos/README.md) |
| Créditos | [`docs/CREDITOS.md`](docs/CREDITOS.md) |

## Módulos y dueños

| Carpeta | Módulo | Dueño |
|---|---|---|
| `data/`, `scripts/`, `src/fotogramas/` | M1 · Fotogramas EIC y datos | [Miembro 1] |
| `src/analizador/` | M2 · Analizador visual | [Miembro 2] |
| `src/sonido/` | M3 · Motor de sonido: la banda | [Miembro 3] |
| `src/arte/`, `assets/` | M4 · Arte, avatares anime y componentes | [Miembro 4] |
| `src/accesibilidad/`, `docs/pitch/` | M5 · Accesibilidad, textos y narrativa | [Miembro 5] |
| `index.html`, `src/app/`, `.github/` | M6 · App, integración y entrega | [Miembro 6] |

## Cómo correrlo

Genera el paquete estático que usa GitHub Pages y sírvelo desde `_site`:

```bash
python scripts/build_pages.py _site
python -m http.server 8765 --bind 127.0.0.1 --directory _site
```

Abre [la vista local](http://127.0.0.1:8765/). En [La banda](http://127.0.0.1:8765/#banda) puedes girar cada personaje y verlo tocar, caminar y bailar.

La escena editable está en `assets/avatares/terrasonic-banda.blend`. Para regenerarla y exportar los cinco GLB de `prototipos/I11-eic/modelos/`, ejecuta `blender --background --factory-startup --python scripts/modelar_banda.py` y vuelve a generar `_site`.

En la plantilla web, `ts-avatar` reutiliza cada GLB mediante `data-character`. Los atributos `data-view` y `data-cue` indican el encuadre y la señal que activa la animación. La vista de personajes requiere WebGL 2.

En `piero-mejoras` se está completando el encargo ampliado. El estado verificable y los pasos para reanudar están en [docs/PIERO-MEJORAS.md](docs/PIERO-MEJORAS.md). La revisión de modelos y sus comandos están en [docs/MODELOS_3D.md](docs/MODELOS_3D.md). Las vistas nuevas usan una pose estática durante la carga o cuando WebGL no está disponible.

La [vista independiente de revisión](https://terrasonic-piero-preview-20261113.satinkoi3.chatgpt.site) conserva la web oficial. La publicación y su verificación sin credenciales se documentan en [docs/PUBLICACION.md](docs/PUBLICACION.md).

## Datos

- Fotogramas: los de la visualización oficial del EIC *SST Anomaly – Near Real Time*, variante Pacífico ([SVS 5176](https://svs.gsfc.nasa.gov/5176)), extraídos y recortados con `python scripts/descargar_fotogramas.py` (necesita ffmpeg; baja un video de ~340 MB que no se sube a git). Cubren del 16 may 2024 al 2 nov 2026: cinco discos de seis fotogramas, uno cada 30 días.
- Lluvia de Chiclayo (extra): NASA POWER, con `python scripts/descargar_power.py`.

## Cómo trabajamos

1. Cada quien trabaja **solo en su carpeta**, en la rama `mod/<módulo>`.
2. Entre módulos solo se usa lo que define `docs/CONTRATOS.md`, además del bus de eventos.
3. Cada PR lo revisa otra persona y se prueba en el navegador, también si el código lo generó una IA.
4. Cada uso de IA se anota en `docs/USO_DE_IA.md`.
