# TerraSonic · Earth Information Jukebox

TerraSonic convierte imágenes del Pacífico y datos locales en música con cinco personajes. Proyecto de NASA Space Apps Challenge 2026 · Chiclayo, para [The Earth Information Jukebox](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/).

La aplicación es estática y funciona en español e inglés. Usa Canvas y Web Audio en el navegador; no requiere backend, AWS, base de datos remota ni servicios de IA para procesar archivos o generar sonido.

## Estado de esta rama

La revisión vive en `piero-mejoras`. No modifica `main` ni la [web oficial](https://nishix03.github.io/TerraSonic-NASA-Space-APPS/).

La [vista pública independiente](https://alvaro-mendoza-12.github.io/terrasonic-piero-preview-20261113/) sirve el checkpoint `c4f7aca`, verificado sin credenciales: HTML y 96 activos idénticos al paquete, ambos catálogos/modos, saltos con teclado, CSV multicolumna, cinco personajes y respaldo sin WebGL. Se publica desde una copia estática separada en la cuenta verificada, sin cambiar Pages ni main del proyecto original. La primera copia Sites permanece en `409f197` por pérdida de acceso de actualización. [Publicación y procedencia](docs/PUBLICACION.md).

La entrega y sus comprobaciones se resumen en [ENTREGA_2026-11-13.md](docs/ENTREGA_2026-11-13.md).

El alcance, tiempo efectivo, evidencia y tareas pendientes se mantienen en [PIERO-MEJORAS.md](docs/PIERO-MEJORAS.md). Las pruebas automatizadas no acreditan certificación WCAG, escucha humana ni aprobación cultural. Las tres referencias visuales históricas no están disponibles aquí.

## Qué incluye

- **Escuchar:** diez discos, sesenta mapas EIC/GIBS, selección de fechas, modos Melodía y Datos, posición/tiempo, pausa y reanudación, saltos, velocidad, volumen, silencio y repetición. Leyenda escrita, símbolos y registro consultable.
- **Banda:** cinco cuerpos 3D, mezcla compartida con Escenario, muestras de instrumento detenibles y poses de respaldo sin WebGL o con recursos lentos/ausentes. Fuentes históricas y propuestas de ficción diferenciadas.
- **Convertir:** muestra NASA e imagen propia como entradas principales; lluvia de Chiclayo y CSV como alternativas. Procesamiento local, elección de columna, límites y errores recuperables. Las imágenes se centran sin deformarse y usan la misma vista fija que el análisis.
- **Brisa y preferencias:** tutorial saltable/reabrible, texto, voz opcional, idioma guardado, texto grande, fuente legible, alto contraste y movimiento reducido combinables. Vibración optativa donde exista.
- **Método y Tecnología:** fuentes NASA, niveles derivados, seis perfiles armónicos, catálogo estático de impactos y una regla editorial mensual verificable, con límites científicos explícitos.

Los niveles derivados de las imágenes **no son grados de temperatura**. Las progresiones y el carácter musical son decisiones artísticas. EIC y GIBS usan paletas y rangos diferentes; no se presentan sus niveles como magnitudes físicas comparables.

## Ejecutar localmente

Con Python 3.10 o posterior, desde la raíz del repositorio (revisión realizada con 3.12.14):

```bash
python scripts/verify_fonts.py
python scripts/build_pages.py _site
python -m http.server 8765 --bind 127.0.0.1 --directory _site
```

Abrir [http://127.0.0.1:8765/](http://127.0.0.1:8765/). Detener el servidor con Ctrl+C. El build incluye mapas, modelos, poses y tipografías locales. Abrir el HTML por `file://` no es el modo soportado. La reproducción requiere una acción del usuario; voz y vibración dependen del navegador/dispositivo.

La fuente canónica es **`prototipos/I11-eic/Main.dc.html`**. `scripts/build_pages.py` genera el HTML y copia los recursos; editar solamente `_site/index.html` no cambia la aplicación fuente. El `index.html` de la raíz y parte de `src/` son material histórico de organización del equipo.

## Verificar y entregar

```bash
node scripts/test_guides.cjs _site/index.html
node --test scripts/models.test.cjs
python scripts/run_browser_checks.py --list
```

Node es una herramienta de pruebas; no hace falta para usar el sitio generado. Los recorridos requieren Playwright y un navegador de prueba configurados como describe [VERIFICACION.md](docs/VERIFICACION.md). Incluyen Chromium, Firefox y WebKit de Windows con límites documentados. WebKit de esta instalación no ofrece Web Audio: se comprueba la alternativa escrita y no se afirma audio en Safari.

- [Auditoría de diseño, Nielsen y objetivo WCAG/COGA](docs/AUDITORIA_2026-11-13.md)
- [Transporte, leyenda y mezcla](docs/REPRODUCTOR.md) · [Reloj de audio](docs/AUDIO_RELOJ.md)
- [Mediciones comparables](docs/RENDIMIENTO.md) · [Paquete portable y recuperación](docs/ENTREGA_PORTABLE.md)
- [Conversión local](docs/CONVERTIR.md) · [Brisa](docs/BRISA.md) · [Método](docs/METODO.md)
- [Impactos y fuentes](docs/IMPACTOS.md) · [Historias y referencias culturales](docs/PERSONAJES.md)

## Modelos editables

La escena está en `assets/avatares/terrasonic-banda.blend`. Se inspeccionó y generó con Blender 5.2.2 LTS. `scripts/modelar_banda.py` construye los cinco personajes y exporta los GLB; `scripts/inspect_banda.py` documenta rig, clips, dimensiones y renders multivista. [Inventario y comandos](docs/MODELOS_3D.md).

Los originales se conservan en Git, las ilustraciones del equipo y checkpoints de trabajo. El empaquetador puede incluir el `.blend` y los cinco GLB del commit base en un ZIP de recuperación separado. Los retratos pequeños no necesitan cargar el motor 3D.

## Datos, créditos e historia

Los fotogramas EIC proceden de [NASA SVS 5176](https://svs.gsfc.nasa.gov/5176/), y los históricos de NASA GIBS/Worldview. La serie de lluvia mensual procede de NASA POWER. Los catálogos versionados de impactos y personajes están en `data/`; cada hecho conserva fuente, periodo y limitaciones.

[Créditos y licencias](docs/CREDITOS.md) · [Uso de IA documentado](docs/USO_DE_IA.md) · [Licencias de tipografías](assets/fonts/README.md).

Se conserva la documentación histórica del equipo: [plan](docs/PLAN.md), [contratos entre módulos](docs/CONTRATOS.md), [iteraciones](docs/ITERACIONES.md) y [prototipos](prototipos/README.md). El [boceto privado original](https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU) requiere acceso del propietario y no es la versión desplegada de esta rama.
