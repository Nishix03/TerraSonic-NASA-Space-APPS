# Del espacio al Pacífico

## Auditoría y dirección

El frontend continúa en HTML/CSS/JavaScript nativo. `Main.dc.html` contiene el componente, las preferencias, los mapas y el reproductor; `pages-support.js` resuelve sus enlaces de estado y `avatar2d.js` presenta las ilustraciones originales. No había una introducción narrativa ni GSAP, React, Framer Motion o un motor 3D vigente. La base ya incluía un cielo SVG/CSS con Sol, eclipse decorativo, Luna, estrellas, satélite, meteoros y pequeños planetas.

La captura de los controles coincide con su bloqueo por Movimiento reducido, sin explicar el motivo. El observador del dibujo también podía detenerlo al llegar al transporte en una ventana corta. Esta reparación se documenta y verifica en [Banda 2D](SPRITES_2D.md). La introducción no sustituye esas reparaciones.

Dirección elegida: el Pacífico ocupa el centro de una Tierra ilustrada, se aproxima durante unos segundos y da paso a una onda y al mapa auténtico. La Tierra es una ilustración esquemática, no una imagen NASA ni una representación cartográfica precisa. La leyenda lo indica; las cifras y mapas de la aplicación mantienen sus fuentes y valores reales.

Tokens: azul espacial `#182332`, océano `#153e63`, atmósfera `#8be7e9`, luz solar `#e8b969`, texto `#eef3fa`, secundario `#b6c5d5`. La introducción hereda la fuente local del producto. La interfaz conserva sus tokens para ambos temas y alto contraste.

Composición prevista:

```text
Móvil                  Escritorio
Navegación              Navegación
Título + explicación    Título + acciones | Mapa NASA
Acciones                Cifras + repetir | Imagen > análisis > música
Cifras + repetir
Imagen > análisis > música
```

Se conserva la composición solicitada. El gesto memorable se concentra en el viaje inicial; los botones tienen bordes suaves, foco perceptible y respuesta al pulsar. El mapa gana profundidad alrededor del panel, sin filtros ni dibujos encima de la imagen científica. La tipografía de transporte deja de heredar el tamaño diminuto del pie de figura.

## Implementación

`CinematicIntro`, dentro del archivo canónico, construye una capa temporal con SVG inline. No añade bibliotecas, fuentes remotas, imágenes nuevas ni peticiones externas. La Web Animations API coordina transformaciones y opacidades durante **5200 ms**; a anchuras de hasta 640 px o ventanas bajas, **3000 ms**.

Secuencia: estrellas y luz solar; entrada de la Tierra; acercamiento al Pacífico, retícula y órbita ilustradas; transformación en onda; revelación escalonada de marca, cabecera, titular, explicación, acciones, mapa y cifras. El relieve lunar, eclipse, meteoros y satélite siguen en el cielo existente. La onda persistente solo se anima cuando el estado real del reproductor indica reproducción: no se presenta como medición acústica ni como flujo científico en directo.

`sessionStorage.ts_intro_seen` evita repetirla al refrescar o navegar en la misma sesión. Si el almacenamiento está bloqueado, permanece una protección en memoria durante la vida del componente. La bienvenida de accesibilidad tiene prioridad; elegir la guía marca la introducción como vista. «Repetir introducción» está disponible en inicio. No cambia preferencias ni inicia audio o vibración.

«Saltar introducción» y Escape terminan la secuencia. Tab sale de la presentación y devuelve el foco, sin atraparlo. Una interacción con el contenido subyacente también termina la capa, que no intercepta sus clics. Al finalizar se eliminan nodo, animaciones, temporizadores y listeners; se restaura el foco solo cuando estaba dentro de la presentación. Se cancela al ocultar la página, navegar, abrir preferencias o activar movimiento reducido. Un temporizador de respaldo y la captura de errores evitan una capa permanente.

Con movimiento reducido del sistema o de la aplicación, alto contraste o colores forzados, no hay introducción automática. La repetición solicitada muestra una ilustración estática con botón de cerrar. El cielo respeta movimiento reducido y se pausa al ocultarse la página; el menú de accesibilidad ofrece la preferencia que lo detiene.

Los elementos reales de la aplicación son visibles por defecto: una animación fallida no los deja transparentes. En móvil se elimina una capa de estrellas y se compacta la escena. No se impide el desplazamiento vertical natural del documento cuando es necesario para texto grande.

## Referencias y criterios

La implementación sigue las orientaciones de [W3C sobre animación por interacción](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [control del movimiento automático](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [diseño desde una columna](https://web.dev/learn/design/macro-layouts) y [animaciones con transform y opacity](https://web.dev/articles/animations-guide). No constituyen certificación WCAG ni garantía de velocidad en cualquier equipo.

El [prompt detallado](PROMPT_CINEMATICO.md) conserva la especificación, los criterios de aceptación y las fuentes. `scripts/verify_cinema.cjs` comprueba la política de sesión, prioridad de bienvenida, salto, repetición, foco, navegación, reproducción nativa de la secuencia en 360/390/768/1024/1440 px, limpieza, ausencia de audio/vibración, ES/EN, versión estática, cancelación y fallo de la API. Las medidas de pantalla son viewports CSS de navegadores de escritorio; no se declara prueba en teléfono físico ni FPS medidos.
