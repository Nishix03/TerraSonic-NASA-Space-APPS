# Entrega vigente · banda 2D y viaje al Pacífico

**Checkpoint portátil previo a la reparación de activación de movimiento.** Este ZIP conserva la aplicación `2fec226`; no contiene los cambios posteriores de [MOVIMIENTO.md](MOVIMIENTO.md). La URL pública y `source.json` identifican la aplicación publicada más reciente.

[Abrir la vista pública](https://alvaro-mendoza-12.github.io/terrasonic-piero-preview-20261113/). Aplicación `2fec2269fedde019ad05102afb5e1cfcf131f91d`, rama `piero-mejoras`; `source.json` identifica el build. Los commits posteriores de documentación no cambian el producto publicado.

Se repararon los controles Animar, Caminar, Bailar, Pausar/Reanudar, Paso anterior/siguiente y Reposo de los cinco personajes. La preferencia de movimiento reducido se explica y permite una autorización temporal solo para el personaje elegido. Se conservan los originales 2D, sus cuatro dibujos y el desplazamiento escénico, sin afirmar un ciclo nuevo de piernas. Se amplió la tipografía del transporte y se mantuvieron superficies de al menos 44 px.

La portada incorpora el viaje ilustrado del espacio al Pacífico de 5,2 segundos en escritorio y 3 en móvil, una vez por sesión, con salto, repetición y alternativa estática. El universo conserva Sol, eclipse decorativo, Luna, planetas, satélite y meteoros. La onda del fondo responde al estado de reproducción; las imágenes NASA auténticas mantienen su leyenda y no reciben efectos que oculten datos. La introducción no inicia sonido ni vibración.

Se mantienen RETO 05, bienvenida/guía adaptable sin scroll interno innecesario, temas claro/oscuro, mezcla, mapas, carga de imagen y lluvia de ejemplo. Los detalles y referencias están en [CINEMATICA.md](CINEMATICA.md), [SPRITES_2D.md](SPRITES_2D.md), [RETO_05.md](RETO_05.md), [HAPTICA.md](HAPTICA.md) y [el prompt detallado](PROMPT_CINEMATICO.md).

La entrega portátil se identifica mediante su manifiesto y archivo `.sha256`, con aplicación estática, código fuente del commit, instrucciones de uso y evidencia seleccionada. Las copias anteriores se conservan como checkpoints recuperables.

Archivo: `_work/delivery/terrasonic-reto05-2026-11-13-final.zip`, con su `.zip.sha256`. Contiene los 112 archivos de aplicación, fuente Git y 25 informes seleccionados con sus versiones. El manifiesto diferencia el commit de fuente completa del commit de aplicación publicado. Se comprueba su integridad extrayéndolo en una carpeta nueva y reconstruyendo desde `source.zip`; el resultado debe coincidir archivo por archivo con el sitio incluido y con el HTML público. `verify_package.py` permite volver a comprobarlo.

Verificación de producto: 148 pruebas de lógica, 14 recorridos de introducción por motor y 60 de sprites por motor, 408 estados de redistribución y 74 pantallas de axe sin infracciones detectadas. En la URL pública pasaron dos recorridos completos normal/sin WebGL, 106 hashes de activos, 14 recorridos de presentación y 10 hápticos. Las versiones exactas y los resultados iniciales corregidos se distinguen en [CINEMATICA.md](CINEMATICA.md) y [PUBLICACION.md](PUBLICACION.md).

## Recibo del paquete verificado

ZIP: **62.408.463 bytes**, SHA-256 `7b10e13ce54f0c21125c230deb13941b6976f3bea56aa1619225a9c0ba64d68c`. Fuente completa del paquete: `d877dc991d0c753d68f921b9bca20e3a032fc632`; aplicación: `2fec2269fedde019ad05102afb5e1cfcf131f91d`. Este recibo posterior solo documenta el artefacto ya sellado y no cambia esos commits.

La extracción independiente pasó la integridad de 148 archivos más el manifiesto. La reconstrucción desde su fuente produjo los mismos 112 archivos y el HTML público exacto; el runtime no contiene modelos 3D. Los dos recorridos HTTP de la copia extraída pasaron a 390×844 y 1342×605, sin errores JavaScript, respuestas fallidas ni peticiones externas. Evidencia: `_work/delivery/portable-verification-d877dc9/results.json` y `browser/results.json`.

No se afirma certificación WCAG, revisión cultural, escucha humana, rendimiento garantizado ni prueba de zoom nativo o teléfono físico. La vibración fue comprobada a nivel de API y preferencias; falta confirmar el motor en un Android compatible. Los tamaños móviles automatizados son viewports CSS.
