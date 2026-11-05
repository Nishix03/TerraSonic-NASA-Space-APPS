# Registro de iteraciones del prototipo

Aquí queda documentado **cómo evolucionó el prototipo**, qué cambió en cada iteración y **quién la hizo**. Se actualiza con cada iteración nueva.

- **Prototipo interactivo (Claude Design):** https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU *(compartido con cualquiera que tenga el enlace)*
- **Autoría:** hasta ahora, **solo Nishix03** (dirige, decide y aprueba cada iteración). El código del prototipo lo **genera una IA** (Claude Design y Claude Code, de Anthropic) a partir de sus pedidos y él lo revisa. Esto también está en [`USO_DE_IA.md`](USO_DE_IA.md).
- **Cuando se sumen más personas**, cada iteración anota en la columna *Autor* quién la hizo.

## Línea de tiempo

Las versiones del artefacto de Claude Design se numeran en orden (v2, v3…). Algunos números no aparecen porque eran cambios intermedios sin publicar como hito.

| Iteración | Versión del artefacto | Qué cambió | Pedido y decisiones | Autor | Herramientas de IA |
|---|---|---|---|---|---|
| **I01** · Concepto inicial «Silbador» | v2 (`1793848375-2a3a`) | Primera app web: historia en capítulos de la lluvia de Chiclayo, «Orquesta del Pacífico» y «Laboratorio», con sonido real (Web Audio). Datos de NASA POWER 1981–2024 | Idea creativa para el reto 5 basada en el audio de orientación, con historia, módulos y plan para 6 miembros | Nishix03 | Claude Design, Claude Code, Whisper |
| **I02** · Giro al reto oficial | v3 (`1793849518-1e81`) | Pasa a **Earth Information Jukebox** con estilo retro pixelado: 5 discos con 30 fotogramas reales de GHRSST (anomalía de temperatura del mar), analizador de color, cinco músicos con personalidad y modo accesible | Estilo pixel profesional; la jukebox debe acompañar a los fotogramas del EIC; personajes con identidad | Nishix03 | Claude Design, Claude Code |
| **I03** · Marca Terrasonic | v4 (`1793851715-c935`) | Nombre **Terrasonic**, logo (planeta, anillo y satélite con ondas), fondo espacial animado, espacio para el logo oficial y panel grande del protagonista | Nombre profesional en inglés; fondo animado temático; símbolo de la NASA | Nishix03 | Claude Design, Claude Code |
| **I04** · Transiciones y «Tus datos» | v6 (`1793852288-9d44`) | Entradas escalonadas, efectos al pasar el cursor, fundido entre fotogramas y zona para **subir una imagen o un CSV** | Interfaz más profesional con transiciones; poder subir datos propios | Nishix03 | Claude Design, Claude Code |
| **I05** · Página Tecnología | v7 (`1793852599-c0e4`) | Pestaña con las tecnologías, los datos y las herramientas de IA, con su estado (hecho o planeado); paneles de la misma altura | Una página donde ver las tecnologías; se usará ChatGPT Codex e imágenes | Nishix03 | Claude Design, Claude Code |
| **I06** · Reorganización | v8 (`1793855607-475b`) | Reescritura: banda apagada al inicio y un protagonista por disco, «Tus datos» en su propia página, transición con **satélite** estilo videojuego y personaje grande más grande | Banda desactivada al inicio, sin espacios en blanco, transición personalizada | Nishix03 | Claude Design, Claude Code |
| **I07** · Melodía y objetivos | v9 (`1793856238-e28c`) | Motor **Melodía compuesta** (tonalidad, acordes y melodía por disco), selector de motor, flechas animadas, «Por qué suena así» y los objetivos del reto | Que suene como melodía y no al azar; flechas con animación; tener presentes los objetivos del reto | Nishix03 | Claude Design, Claude Code |
| **I08** · Escenario | v10 (`1793856971-7389`) | **Escenario** con un sprite por personaje encendido, que toca su instrumento según su participación y desaparece al apagarse; el protagonista usa el mismo estado | Escenario al pie con sprites animados; versión móvil planeada | Nishix03 | Claude Design, Claude Code |
| **I09** · Maqueta móvil | v11–v17 | Siete pantallas móviles (390×844 y 360×800): Jukebox, Jukebox al desplazar, Ver grande, La banda, Tus datos, Accesibilidad y Jukebox compacto | Maqueta móvil muy bien adaptada | Nishix03 | Claude Design, Claude Code |
| **I10** · Iconos y menos cajas | v18 (`1793859417-c59d`) | Iconos pixel en cada opción y menos botones y cuadros: opciones de accesibilidad solo con icono, mezclador de una fila por músico, selector de motor con 4 iconos, estadísticas en línea y «Por qué suena así» desplegable. Las maquetas móviles no cambiaron en esta iteración | «Agrega iconos a cada opción, no te llenes de botones o cuadros innecesarios» | Nishix03 | Claude Design, Claude Code |
| **I11** · Fotogramas oficiales del EIC | *(solo en el repo; falta subirlo a Claude Design)* | Las imágenes pasan de capturas de GIBS a **fotogramas del video oficial del EIC** (SVS 5176, Pacífico, 16 may 2024 – 2 nov 2026). Cinco discos por estación (invierno 2024, verano 2024–25, invierno 2025, verano 2025–26, invierno 2026), con el mismo personaje protagonista de antes. El analizador usa la escala de color del EIC y reconoce la tierra gris | Usar los fotogramas del EIC y adaptarlos a los personajes ya definidos | Nishix03 | Claude Code |

## Historial de cambios en GitHub (commits)

Todos los commits son de la cuenta **nishix_03 / Nishix03**, con la IA como coautora.

| Commit | Fecha | Mensaje |
|---|---|---|
| `6800731` | 2026-11-04 22:17 | Plan, prototipo y esqueleto modular de Silbador (Reto 5) |
| `c658bf1` | 2026-11-04 22:36 | Giro al reto oficial: Earth Information Jukebox con fotogramas EIC |
| `4473c55` | 2026-11-04 23:31 | Terrasonic: marca, avatares anime, Tus datos, página Tecnología |
| `44bb366` | 2026-11-05 00:42 | Plan: motor de melodía, escenario de la banda y versión móvil |
| `ba027c4` | 2026-11-05 00:53 | Plan: maqueta móvil hecha (7 pantallas en Claude Design) |
| `443fa44` | 2026-11-05 01:05 | Plan: biblia visual y fichas de sprites por personaje (§9.6) |

*(El repo se llamaba `silbador`, se renombró a `terrasonic` y después a `TerraSonic-NASA-Space-APPS`, todo el 2026-11-05. GitHub redirige los nombres anteriores.)*

## Qué fuentes se guardan y cuáles no

- **Se guarda:** el código de la iteración en [`prototipos/`](../prototipos/README.md), una carpeta por iteración a partir de la **I09** (`I09-maqueta-movil/` y `I10-iconos/`).
- **No se guardó antes de la I09:** el código de las iteraciones I01 a I08 se fue sobrescribiendo en el mismo artefacto y **no se conservó una copia local**. Quedan **documentadas** arriba (qué cambió, quién y por qué) y siguen en el **historial de versiones del artefacto de Claude Design**, con los números de versión de la tabla.
- **Desde ahora:** cada iteración nueva se guarda en su propia carpeta de `prototipos/` y se agrega una fila aquí, antes de pasar a la siguiente.

## Cómo registrar una iteración nueva
1. Copiar los archivos del prototipo a `prototipos/IXX-nombre/`.
2. Agregar una fila a la tabla de iteraciones: versión del artefacto, qué cambió, qué se pidió, **quién la hizo** y qué IA se usó.
3. Hacer commit con un mensaje claro y, si usa IA, anotarlo en [`USO_DE_IA.md`](USO_DE_IA.md).
