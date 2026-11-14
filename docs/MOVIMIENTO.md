# Activación visible de las animaciones

**Checkpoint anterior.** La instrucción posterior exige reproducción automática en cada entrada/recarga. La política vigente y el baile único se describen en [EXPERIENCIA_AUTOMATICA.md](EXPERIENCIA_AUTOMATICA.md).

La captura del usuario mostró que la experiencia publicada estaba en movimiento reducido: el botón abría una lámina estática y el cielo no se animaba. La comprobación previa de esa alternativa no satisfacía la intención de ver una introducción animada. Esta reparación elimina la presentación estática y hace explícita la activación del movimiento.

Dirección: conservar azul espacial, agua y dorado; mantener las fuentes y la composición existentes. Un control principal inicia el viaje y un botón de pausa de 44 px permite detener el movimiento. En móvil permanecen en una fila, con una explicación breve debajo cuando las animaciones están pausadas.

```text
Acciones de escuchar / conocer la banda
Cifras reales
[ Activar animaciones y ver intro ] [ pausa / reproducir ]
Explicación solo si el movimiento está pausado
```

La preferencia tiene tres estados: automático, activado expresamente o reducido expresamente. En automático se respeta el sistema y la preferencia existente. Pulsar «Activar animaciones y ver intro» es una elección explícita: activa movimiento en esta web y reproduce la secuencia, aunque el sistema solicite reducción. No modifica Windows ni el dispositivo. «Pausar animaciones» vuelve a detenerlo. La elección queda guardada; el menú de accesibilidad y los personajes utilizan el mismo estado efectivo.

La bienvenida y el menú muestran el estado efectivo, incluido el del sistema. Se evita la contradicción entre casillas desmarcadas y movimiento realmente bloqueado. La secuencia solo se marca como vista cuando empieza a reproducirse; una sesión anterior que solo mostró la lámina estática no impide ver la nueva entrada.

La introducción incluye tres estrellas fugaces con desplazamiento real. El cielo persistente muestra meteoros a los pocos segundos, en lugar de iniciar con una espera de casi veinte segundos. La retícula, la Tierra y las ondas siguen siendo ilustraciones; no simulan observaciones NASA. La onda se desplaza fuera de la zona del titular. No se inicia sonido ni vibración.

Se verifican transformaciones visibles de meteoros y Sol bajo movimiento reducido del sistema, activación desde una preferencia antigua guardada, persistencia, pausa, limpieza, idiomas, móvil y personajes. Los informes anteriores siguen siendo checkpoints y no describen esta reparación.

Referencias consultadas: [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) y [W3C: pausar, detener u ocultar](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Se conserva una salida clara y no se activan animaciones automáticamente contra una preferencia reducida.

## Publicación y comprobación

Aplicación publicada: **`58cecc25a64410019380a2980d57f8bfe229b835`**. [Abrir la versión corregida](https://alvaro-mendoza-12.github.io/terrasonic-piero-preview-20261113/?review=58cecc2). Pages confirmó el commit estático `5491a3d9f7e4b08df76faf90ed5ce20b8fdfbc46`; la lectura anónima verificó HTML de 449.555 bytes, SHA-256 `6dcf246608e5ba61fb413b4c63a0825bf755929523213fb5ede4900376ca21a1`.

| Prueba | Resultado |
| --- | --- |
| Lógica | 137 pruebas de componente y 14 hápticas, todas pasan |
| Introducción y elección de movimiento | 15 recorridos por motor en Chromium 156, Firefox 146 y WebKit 26 |
| Caso de la captura | Reducción del sistema + preferencia antigua guardada; un clic activa la secuencia y los sprites |
| Movimiento visible | Meteoros y Sol cambian de transformación real, incluso con reducción del sistema tras optar expresamente |
| Pausa y persistencia | El cielo se detiene; activar o pausar se conserva al refrescar |
| Redistribución / accesibilidad | 408 estados sin fallos y 74 pantallas de axe sin infracciones detectadas |
| Banda y háptica | 60 recorridos 2D y 10 de capacidad/preferencias en Chromium |
| Producto y ventanas cortas | 84 estados RETO 05 y 16 casos de poca altura |
| Grabación desde la URL pública | Escritorio 1342×605 y vista móvil 390×667: reproducción, meteoros, Sol y pausa comprobados |

Evidencia del build exacto: `_work/motion-release/`. La grabación pública está en `_work/motion-public-video/terrasonic-movimiento-1342.webm` y `terrasonic-movimiento-390.webm`, con `results.json`. Son capturas reales de navegador con preferencias de movimiento reducido reproducidas en el contexto de prueba; no son animaciones de muestra ni maquetas. Las grabaciones locales iniciales se conservan por separado en `_work/motion-choice-video/`.

Los tamaños móviles son viewports CSS, no teléfonos físicos. No se declara certificación WCAG, FPS garantizados ni motor háptico físicamente verificado. La aplicación publicada es la del commit anterior; los commits posteriores de documentación no alteran sus archivos.
