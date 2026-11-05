# Silbador · Earth Information Jukebox

> Hace más de 1500 años, el agua ya cantaba en el norte del Perú. Ahora canta el Pacífico visto por la NASA.

Proyecto para **NASA Space Apps Challenge 2026 · Chiclayo · Reto 5: [The Earth Information Jukebox](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/)**.

**Silbador** es una jukebox retro pixelada que escanea, de oeste a este, los fotogramas de anomalía de temperatura del mar de las visualizaciones del **Earth Information Center** y los convierte en música en tiempo real. La toca una banda de cinco personajes:

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
| Créditos | [`docs/CREDITOS.md`](docs/CREDITOS.md) |

## Módulos y dueños

| Carpeta | Módulo | Dueño |
|---|---|---|
| `data/`, `scripts/`, `src/fotogramas/` | M1 · Fotogramas EIC y datos | [Miembro 1] |
| `src/analizador/` | M2 · Analizador visual | [Miembro 2] |
| `src/sonido/` | M3 · Motor de sonido: la banda | [Miembro 3] |
| `src/arte/`, `assets/` | M4 · Arte pixel, sprites y componentes | [Miembro 4] |
| `src/accesibilidad/`, `docs/pitch/` | M5 · Accesibilidad, textos y narrativa | [Miembro 5] |
| `index.html`, `src/app/`, `.github/` | M6 · App, integración y entrega | [Miembro 6] |

## Cómo correrlo

No hay que instalar ni compilar nada. Basta con un servidor estático:

```bash
python -m http.server 8000
```

Luego abre http://localhost:8000. También funciona con la extensión Live Server de VS Code.

## Datos

- Fotogramas: NASA JPL GHRSST L4 MUR 0,25° SST Anomalies, el producto de la visualización EIC *SST Anomaly – Near Real Time* ([SVS 5176](https://svs.gsfc.nasa.gov/5176)), descargados de Worldview/GIBS con `python scripts/descargar_fotogramas.py`.
- Lluvia de Chiclayo (extra): NASA POWER, con `python scripts/descargar_power.py`.

## Cómo trabajamos

1. Cada quien trabaja **solo en su carpeta**, en la rama `mod/<módulo>`.
2. Entre módulos solo se usa lo que define `docs/CONTRATOS.md`, además del bus de eventos.
3. Cada PR lo revisa otra persona y se prueba en el navegador, también si el código lo generó una IA.
4. Cada uso de IA se anota en `docs/USO_DE_IA.md`.
