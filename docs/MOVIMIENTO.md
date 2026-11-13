# Activación visible de las animaciones

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
