# EarthBeat · Earth Information Jukebox

EarthBeat convierte imágenes del Pacífico y datos locales en música con cinco personajes. Proyecto de NASA Space Apps Challenge 2026 · Chiclayo, para [The Earth Information Jukebox](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/).

La aplicación es estática y funciona en español e inglés. Usa Canvas y Web Audio en el navegador; no requiere backend, AWS, base de datos remota ni servicios de IA para procesar archivos o generar sonido.

## Reto 05

`piero-mejoras-v2` parte de `piero-mejoras` en `fcb1396`. Recupera las ilustraciones 2D de `prueba-acordes`.

- **Escuchar** muestra el mapa NASA junto a la cuadrícula de 28 × 16. La leyenda está debajo de la cuadrícula y los músicos activos se ven juntos en el escenario.
- **La banda** presenta a los cinco músicos con sus historias y muestras de instrumento.
- **¿Cómo funciona?** reúne una explicación breve y una prueba con lluvia de Chiclayo o una imagen propia procesada en el navegador.
- **Tecnología** conserva sus categorías y créditos.
- **Brisa** narra en español o inglés tras la primera interacción. El modo voz se puede desactivar en Accesibilidad y cada apartado tiene un botón para volver a escuchar la narración.

Los niveles de color de −5 a +5 se usan para la sonificación. Las progresiones y el carácter musical son decisiones artísticas.

## Ejecutar localmente

Con Python 3.10 o posterior, desde la raíz del repositorio (revisión realizada con 3.12.14):

```bash
python scripts/verify_fonts.py
python scripts/build_pages.py _site
python -m http.server 8765 --bind 127.0.0.1 --directory _site
```

Abrir [http://127.0.0.1:8765/](http://127.0.0.1:8765/). Detener el servidor con Ctrl+C. El build incluye mapas, ilustraciones 2D y tipografías locales. Abrir el HTML por `file://` no es el modo soportado. La reproducción requiere una acción del usuario; voz y vibración dependen del navegador/dispositivo.

La fuente canónica es **`prototipos/I11-eic/Main.dc.html`**. `scripts/build_pages.py` genera el HTML y copia los recursos; editar solamente `_site/index.html` no cambia la aplicación fuente. El `index.html` de la raíz y parte de `src/` son material histórico de organización del equipo.

## Verificar y entregar

```bash
node scripts/test_guides.cjs _site/index.html
python scripts/run_browser_checks.py --list
```

Node es una herramienta de pruebas; no hace falta para usar el sitio generado. Los recorridos requieren Playwright y un navegador de prueba configurados como describe [VERIFICACION.md](docs/VERIFICACION.md). Incluyen Chromium, Firefox y WebKit de Windows con límites documentados. WebKit de esta instalación no ofrece Web Audio: se comprueba la alternativa escrita y no se afirma audio en Safari.

- [Auditoría de diseño, Nielsen y objetivo WCAG/COGA](docs/AUDITORIA_2026-11-13.md)
- [Transporte, leyenda y mezcla](docs/REPRODUCTOR.md) · [Reloj de audio](docs/AUDIO_RELOJ.md)
- [Mediciones comparables](docs/RENDIMIENTO.md) · [Paquete portable y recuperación](docs/ENTREGA_PORTABLE.md)
- [Conversión local](docs/CONVERTIR.md) · [Brisa](docs/BRISA.md) · [Método](docs/METODO.md)
- [Impactos y fuentes](docs/IMPACTOS.md) · [Historias y referencias culturales](docs/PERSONAJES.md)

## Datos, créditos e historia

Los fotogramas EIC proceden de [NASA SVS 5176](https://svs.gsfc.nasa.gov/5176/), y los históricos de NASA GIBS/Worldview. La serie de lluvia mensual procede de NASA POWER. Los catálogos versionados de impactos y personajes están en `data/`; cada hecho conserva fuente, periodo y limitaciones.

[Créditos y licencias](docs/CREDITOS.md) · [Uso de IA documentado](docs/USO_DE_IA.md) · [Licencias de tipografías](assets/fonts/README.md).

Se conserva la documentación histórica del equipo: [plan](docs/PLAN.md), [contratos entre módulos](docs/CONTRATOS.md), [iteraciones](docs/ITERACIONES.md) y [prototipos](prototipos/README.md). El [boceto privado original](https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU) requiere acceso del propietario y no es la versión desplegada de esta rama.
