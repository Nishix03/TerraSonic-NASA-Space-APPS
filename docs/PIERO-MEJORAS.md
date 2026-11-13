# Continuación de TerraSonic

## Alcance y punto de partida

Se sigue el encargo de `pasted-text-1.txt` adjunto a esta conversación y la ampliación sobre cinco modelos, recursos de la laptop y limpieza segura.

La rama `piero-mejoras` se creó el 13 de noviembre de 2026 desde `origin/main`, commit `59310ac43cd25e76cc68022a109326ca5cb27712`. La rama histórica no existe en el remoto consultado. El árbol de esa base coincide con el de `alvaro-mejoras`, commit `e974fdb`. Las afirmaciones sobre 81 pruebas y una integración anterior de acordes quedan sin verificar. Aquí la base genera el sitio y pasa 78 pruebas.

El enlace compartido de la conversación original no devolvió contenido legible. Las tres referencias visuales mencionadas en el encargo no están adjuntas aquí. Existen las cinco ilustraciones y prompts del repositorio, que se conservarán como referencias del equipo. Los cambios de apariencia nuevos se identificarán como propuestas.

## Protección y recuperación

- Trabajo local y publicación de vista previa en `piero-mejoras`. La rama local tiene el seguimiento a main desactivado para evitar un push accidental.
- El valor de main consultado al inicio es `59310ac`. La configuración de GitHub Pages se conserva.
- El directorio regenerable `_work/` guarda la línea base, métricas, renders y copias recuperables. El historial Git conserva las versiones anteriores.
- C tenía 18.956 millones de bytes libres al iniciar, aproximadamente 17,7 GiB. D tenía aproximadamente 296,7 GiB. Por ahora se usa D para las salidas, sin limpieza.
- Blender 5.2.2 LTS ya está instalado en `D:\Blender Foundation\blender.exe`. No se necesita instalar software.

## Matriz del encargo

| ID | Requisito | Implementación y verificación previstas | Estado actual |
| --- | --- | --- | --- |
| R1 | Escuchar | Posición, tiempos, saltos, pausa, volumen, silencio, repetición y velocidad en EIC y GIBS. Cancelación de notas. Modos claros, leyenda y eventos consultables. | Implementado en checkpoint del reproductor. 90 pruebas, cuatro recorridos de audio y cinco anchos. Salida cero tras pausar. Se corrigió la paleta GIBS y la tierra negra. Falta continuidad bajo carga y URL final. Ver docs/REPRODUCTOR.md. |
| R2 | Retirar A/B | Eliminar vista, estado, audio, ayudas, traducciones, estilos y recursos exclusivos. Conservar fechas del reproductor. | Implementado. Se retiraron pantalla, entradas, hash, estilos, estado, análisis y audio exclusivo en ambos idiomas. La regresión recorre las seis fechas de los diez discos. 81 pruebas pasan. |
| R3 | Banda en Escuchar | Cinco cuerpos completos, activación compartida con Escenario y respaldo estático con carga lenta o sin WebGL. | Implementado en checkpoint 3D. Falta reverificar en la URL independiente final y cancelar notas por músico en el motor nuevo. |
| R4 | Convertir | Imagen de ejemplo y propia como acciones principales, CSV y lluvia secundarios. Casos inválidos, tamaño, columnas y procesamiento local. | Parcial en base. Falta prioridad de imagen. |
| R5 | Brisa, preferencias e idioma | Guía separada, tutorial con acciones reales, foco y voz cancelable, primera visita y elección guardada. | Pendiente. Silbo todavía es guía. |
| R6 | Accesibilidad | Teclado, estados, contraste, zoom, móvil, movimiento reducido y alternativas a sonido/vista/arrastre. Vibración optativa y cancelable. | Parcial en base. Requiere nueva verificación integral. |
| R7 | Armonía | Seis perfiles con acordes y notas concretas, incluidos disminuidos y sus4. Concordancia entre rótulo y motor. | Implementado. 81 pruebas: seis progresiones, notas MIDI emitidas por el sintetizador, rótulos bilingües y umbral de Yaku cálido. Pendiente prueba de audio final en navegador. |
| R8 | Impactos | Catálogo con episodio, territorio, periodo, métrica, fecha y fuente oficial. Al menos una regla musical editorial activada por evidencia del periodo. | Pendiente. |
| R9 | Cultura e historias | Cinco fichas con hechos, referencia cultural y propuesta de ficción. Fuentes y cuidado UNESCO. Sonidos individuales detenibles. | Pendiente. Biblia visual antigua disponible. |
| R9-3D | Cinco modelos | Inventario y renders multivista, anatomía, rostro, prendas, instrumentos, materiales, rig y clips. Peso, contacto, respaldo y movimiento reducido. | Propuesta volumétrica implementada. 5 pruebas GLB y 6 escenarios web. Ver docs/MODELOS_3D.md. Faltan revisión cultural, visuales históricas y URL final. |
| R10 | Método y Tecnología | Documentar comportamiento real, niveles derivados y decisiones artísticas. Conservar Retos. Retirar tecnología planeada o no usada. | Pendiente. |
| R11 | Pruebas y rendimiento | Antes/después con perfil idéntico, Inicio/Escuchar/Banda, peso, audio, ambos catálogos y modos, ausencia de APIs. | Línea base y 3 recorridos por versión medidos. 90 pruebas del producto, 5 GLB, seis escenarios 3D y cuatro recorridos con Web Audio medido. Falta continuidad bajo carga y medir la versión final. |
| R12 | Entrega | Matriz, tiempo real, decisiones, commits, URL pública independiente, main intacto, paquete portable e instrucciones. | Este documento es el checkpoint inicial. |
| R13 | Disco y recursos | Comprobar C periódicamente, salidas en D, limpiar solo temporales identificados si fuera necesario. | C conserva 18.581.864.448 bytes libres en la revisión de las 01:02, unos 17,3 GiB. No se ha realizado limpieza. Salidas en D. |
| R14 | 420 minutos efectivos | Registrar bloques reales de trabajo y excluir pausas y esperas. No mantener procesos inactivos para completar horas. | Registro iniciado. Tiempo histórico no acreditado. |

## Registro de trabajo efectivo

Los intervalos usan America/Bogota. El tiempo se registra de forma conservadora al cerrar cada bloque, excluyendo esperas sin trabajo paralelo. Una interrupción no registrada no se suma al total.

| Bloque | Intervalo | Actividad | Minutos efectivos acreditados |
| --- | --- | --- | --- |
| 1 | 13 nov 2026, 00:14–00:19 | Leer adjunto, verificar base/remoto, build, 78 pruebas, espacio, Blender y referencias. | 4 |
| 2 | 13 nov 2026, 00:19–00:45 | Modelado, inspección multivista, respaldo, carga diferida, integración y pruebas. 78 pruebas de producto, 5 de GLB y seis escenarios Chromium con cinco personajes, incluida mezcla compartida Escuchar/Escenario. | 23 |
| 3 | 13 nov 2026, 00:45–01:09 | Armonía, retirada A/B, transporte, paletas oficiales, voz/volumen, historial y composición del reproductor. 90 pruebas y verificación de Web Audio en ambos catálogos/modos. | 22 |

Total conservador acreditado: **49 de 420 minutos**. Las esperas de Blender y navegador sin otra actividad no se sumaron. Los recorridos de navegador usan Chromium con rasterización WebGL por software, no un teléfono físico.

## Decisiones

- Se conserva toda la especificación. El trabajo de los modelos y su red de seguridad es el primer bloque de implementación.
- Las imágenes del equipo son ilustraciones monocromas. El inventario y los renders confirmaron las limitaciones de su extrusión anterior. El generador nuevo conserva rasgos del equipo y construye geometría completa.
- Los rasgos culturales se acreditarán con fuentes. Las referencias de Usiacurí, Mórrope y Catacaos no se convertirán en afirmaciones de indumentaria local ni en réplicas ceremoniales.
- La rama local main sigue en `a8f8203` y el remoto main consultado sigue en `59310ac`. Solo se creó `piero-mejoras` desde este último.

## Reanudación

1. Leer este documento y `git status`. No cambiar de rama si aparecen cambios ajenos.
2. Comprobar espacio con `Get-PSDrive -Name C,D`.
3. Revisar los procesos de Blender y su log en `_work/`. Consultar el proceso existente antes de volver a ejecutar un trabajo.
4. Generar el sitio con `python scripts/build_pages.py _site` y ejecutar `node scripts/test_guides.cjs _site/index.html`.
5. Continuar el primer requisito pendiente de la matriz y añadir su evidencia. El objetivo permanece activo mientras haya requisitos sin probar.
