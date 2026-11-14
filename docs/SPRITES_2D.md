# Banda 2D original y guía móvil

**Interacción vigente:** baile automático con un solo botón de pausa/reanudación. Se retiraron Caminar, pasos e inspector por indicación posterior del usuario. [Diseño y comprobaciones actuales](EXPERIENCIA_AUTOMATICA.md). Las verificaciones de modos y pasos inferiores son checkpoints históricos.

## Reparación del transporte · 13 de noviembre de 2026

La captura recibida muestra el estado desactivado que produce Movimiento reducido. Ahora se explica su causa y se ofrece permiso temporal solo para el personaje seleccionado; la preferencia global permanece activa y el permiso se revoca al cambiar personaje o preferencias. Los pasos siguen disponibles sin movimiento automático.

El observador de visibilidad considera el escenario con sus controles, para que un dibujo fuera de la ventana no impida usar el transporte en una ventana corta. Los pasos recorren los cuatro dibujos sin repetir consecutivamente el mismo; Reposo recupera la pose original, y Pausar/Reanudar conservan el estado. El permiso local no activa fondo, audio ni vibración. Los controles tienen tipografía independiente del pie de figura, estado seleccionado y superficies de al menos 44 px.

Verificación: Chromium 156, Firefox 146 y WebKit 26, 60 recorridos reales por motor de los cinco personajes y tres modos: 30 con movimiento normal a 390/1342 px y 30 con movimiento reducido del sistema y permiso local a 360×640/320×256. Se comprueban imágenes originales, pausa/reanudación, pasos, reposo, revocación del permiso y limpieza al navegar. No equivale a validación física de teléfono ni a un nuevo ciclo anatómico de caminar. Especificación de la siguiente iteración: [prompt cinematográfico investigado](PROMPT_CINEMATICO.md).

**Edición vigente:** [RETO 05](RETO_05.md), que retira Escenario, CSV y las barras internas innecesarias. Las cifras del apartado histórico inferior corresponden a la primera pasada 2D, no a la publicación definitiva.

El usuario sustituyó el encargo de reconstrucción 3D por las ilustraciones 2D originales, en todos los lugares donde aparecen los músicos. Se detuvo el trabajo artístico en Blender. Las escenas de estudio y modelos previos quedan recuperables, fuera del build de esta edición.

## Arte y movimiento

Las cinco poses `prototipos/I11-eic/sprites/*/pose-banda.webp` y los veinte PNG `assets/avatares/*/banda/keyframes/00–03.png` coinciden byte por byte con main en `59310ac43cd25e76cc68022a109326ca5cb27712` y con la rama solicitada `prueba-acordes` en `5c62a2e5d734dcc9a0003aac24c66e9408a0b324`. No se redibujaron, extruyeron ni recomprimieron. La presentación respeta su proporción y los coloca sobre una superficie oscura también en modo claro, para conservar la lectura de sus contornos luminosos.

`scripts/avatar2d.js` muestra imágenes y usa las duraciones originales de cada `animacion.json` para la secuencia Animar. Las imágenes se decodifican antes del cambio de dibujo; los cuatro PNG de un músico se solicitan al iniciar su secuencia o abrir el inspector, no todos durante la portada. Se conservan las poses estáticas ligeras del equipo. Ya no se cargan GLB, Three.js, WebGL ni renders volumétricos en el producto.

En La banda, Animar, Caminar y Bailar ofrecen secuencias breves y detenibles. Pausar/Reanudar, Reposo y Paso anterior/siguiente permiten inspeccionarlas. El contador muestra paso y dibujo; «Ver los cuatro dibujos originales» abre cuatro selecciones quietas. El idioma de los controles cambia con la aplicación. La pausa automática al ocultar el documento o sacar el personaje de la vista evita mantener temporizadores de dibujo fuera de pantalla. Movimiento reducido detiene las secuencias y conserva la inspección manual.

**Límite de Caminar:** las cuatro imágenes disponibles no constituyen un ciclo anatómico nuevo de piernas. Caminar combina esos dibujos con un recorrido horizontal en escena; Bailar añade un balanceo discreto. La interfaz lo explica. No se afirma haber dibujado pasos de marcha inexistentes ni nuevas vistas traseras. Los sprites originales mantienen su composición e instrumentos.

## Entrada y guía

La reproducción del defecto a 320×568 confirmó que las acciones de bienvenida quedaban debajo del contenido inicial y que Siguiente aparecía desactivado en el tutorial hasta completar una acción. La revisión RETO 05 redistribuye la bienvenida en dos columnas y conserva visibles los controles sin scroll interno. La guía usa altura natural y texto breve, con acciones en una fila. Las páginas largas usan el documento; no se oculta contenido para esconder barras.

Las acciones reales elegir disco, reproducir e interpretar la leyenda siguen funcionando. «Siguiente sin practicar» y «Terminar sin responder» permiten avanzar sin depender de ellas. Los pasos omitidos se registran aparte: no se marcan como acciones realizadas. Terminar una práctica incompleta restaura el trabajo anterior; completar las tres conserva la reproducción de la práctica. Atrás, cerrar, Escape, reapertura, foco e idioma siguen disponibles. Sin Web Audio se conserva la alternativa escrita.

## Verificación

La evidencia inicial y sus fallos están separados de las repeticiones. `verify_sprites.cjs` comprueba las veinte huellas PNG, decodificación, cinco personajes, tres secuencias, pausa y pasos, idioma, movimiento reducido, Escuchar y ausencia de solicitudes 3D. `verify_mobile_guide.cjs` recorre 320×568, 390×667, 667×375 y 768×1024, español/inglés y texto normal/grande: entrada visible, omisión de pasos y práctica real con alternativa escrita, Escape y foco. Las comprobaciones son viewports CSS automatizados; no acreditan teléfono físico, lector de pantalla ni aprobación humana de la coreografía.

El primer runtime dejó un indicador de carga sin completar al cambiar rápidamente de músico; se corrigió separando la decodificación de la pose de la cancelación de la secuencia. La prueba móvil detectó que el botón escrito quedaba tapado en horizontal; se redujo a una fila la navegación de la guía y se amplió su espacio de lectura. La revisión automática encontró el nombre magenta de Illapa por debajo de 4,5:1 en Escenario; el nombre usa ahora el color de texto del tema. Los fallos de espera del fixture se conservan identificados, sin atribuirlos a una regresión visual inexistente.

El build necesita un destino nuevo si el directorio conserva archivos de una edición 3D. Rechaza ese destino antes de modificarlo; no borra la copia anterior. Ejemplo: `python scripts/build_pages.py _site_2d` y `python -m http.server 8765 --bind 127.0.0.1 --directory _site_2d`.

La vista independiente se actualiza solo después de comprobar el build exacto. Su versión y resultados definitivos se registran en PUBLICACION.md; la web oficial y main no se reemplazan.


## Primera pasada 2D anterior a RETO 05 · registro histórico

Pasan 143 pruebas de producto y las doce huellas de tipografías/avisos. La pasada Chromium `chromium-release` completa 30 recorridos de movimiento, 16 de introducción/guía, la revisión de Brisa con audio nativo silenciado, 90 estados axe sin infracciones detectadas y 544 comprobaciones de redistribución. Firefox `firefox-inert` repite 30 movimientos y 16 recorridos de guía sin solicitudes fallidas. Las variantes de texto grande son preferencias de la aplicación o CSS emulado, no zoom físico.

La pasada Firefox anterior conservó las solicitudes erróneas a enlaces de imagen sin resolver al clonar la plantilla. Se corrigió el soporte para mantener inertes los atributos src enlazados hasta asignar una URL real; el caché de soporte cambia con su contenido. La repetición quedó separada de aquel fallo. WebKit y la comprobación pública se registran después de terminar, sin anticipar resultados.

Los originales de los cinco sprites estáticos y veinte PNG se compararon byte por byte contra Git main, además del build. El paquete 2D sin comprimir contiene 111 archivos y unos 16,64 MB, de los cuales 12,78 MB son los veinte PNG originales. Su peso completo aumenta respecto al checkpoint 3D optimizado por conservar la resolución de los originales; la portada no descarga esas veinte imágenes. Las cinco poses estáticas suman 606.756 bytes y el runtime 2D ocupa aproximadamente 11 KB. No se afirma una mejora porcentual de tiempo sin medirla.
