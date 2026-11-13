# Observatorio del Pacífico

Dirección visual solicitada: sol y luna laterales, estrellas fugaces, cohetes ocasionales y horizonte curvo, tomando la captura del usuario como referencia de ambiente. Se conservan las pantallas, controles y músicos originales.

Paleta: pizarra `#171e2b`, cielo profundo `#13233d`, horizonte `#274d74`, luz solar `#ffc76b`, luz lunar `#cfdeef` y estelas `#c4f2ff`. Se mantienen las tipografías y la composición de la aplicación. La escena ocupa una capa fija detrás del contenido: sol a la izquierda, luna a la derecha, zona central atenuada y horizonte inferior. No añade márgenes ni altera el alto de las pantallas.

La implementación usa SVG y CSS nativos dentro de la plantilla existente; no añade imágenes remotas, Canvas, WebGL ni bibliotecas. Los únicos valores animados son transform y opacity. La corona gira lentamente; las estrellas fugaces aparecen en ciclos de 23/31/43 segundos y los cohetes en ciclos de 38/59 segundos, durante una parte breve de cada ciclo. En móvil se reduce el número de objetos y el cohete visible tiene un ciclo de 46 segundos.

La capa es `aria-hidden`, `inert` y no recibe punteros. Movimiento reducido del sistema o de la aplicación detiene las animaciones y elimina los objetos viajeros. Alto contraste de la aplicación y los colores forzados del sistema ocultan la decoración. El evento de página oculta pausa las animaciones y al volver se reanudan. No se utiliza vibración, sonido ni una supuesta notificación NASA para acompañar el fondo.

`verify_space_background.cjs` comprueba seis viewports, temas claro/oscuro, avance real de las líneas de tiempo CSS, propiedades animadas, portada completa, clics, movimiento reducido, evento de ocultación simulado y alto contraste. Chromium, Firefox y WebKit completan los seis casos cada uno. La simulación del evento de visibilidad verifica el controlador; no acredita gestión de batería en un teléfono físico.

La escena queda guardada en un commit independiente de la ampliación háptica. Los resultados y capturas están en `_work/space-sky-qa/`; las 134 pruebas de lógica existentes siguen pasando.
