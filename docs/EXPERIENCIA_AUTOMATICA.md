# Introducción automática, baile único y guía móvil

Esta edición aplica la instrucción posterior del usuario: **la introducción debe reproducirse en cada entrada y cada recarga**, con un botón verde para repetirla; la banda conserva una sola animación tipo baile y la guía móvil debe ser mínima. Esta política sustituye la anterior de una vez por sesión y la de activación manual cuando había reducción guardada.

## Diseño

Se conservan las fuentes locales, las ilustraciones originales y la composición. Paleta principal: pizarra `#171e2b`, panel `#1d2939`, agua `#8be7e9`, dorado `#e8b969`, verde de reproducción `#a7efc7` y tinta `#08261b`. El botón verde tiene borde oscuro y foco visible; en alto contraste conserva los colores efectivos del tema.

```text
Entrada / recarga        Banda                    Guía en celular
Viaje animado           Personaje bailando        Guía rápida        1/3   ×
Inicio o bienvenida     Escuchar instrumento      Elige un disco
[Repetir introducción]  Pausar baile              Toca una portada…
                                                 [Saltar paso]
```

Se eliminan pasos de inspección, modos redundantes y texto repetido. La instrucción es lo principal; el contador y cerrar están en una sola cabecera. La voz aparece en móvil cuando el usuario la ha elegido. Se mantienen las acciones reales y la posibilidad de salir sin completar ejercicios.

## Comportamiento

- Cada documento nuevo comienza con movimiento activado. La presentación arranca automáticamente sin pulsar ningún botón, aunque hubiera una pausa guardada o una marca antigua de sesión. No se modifican ajustes del dispositivo.
- La animación dura 5,2 segundos en escritorio y 3 en móvil/ventana baja. Saltar y Escape siguen disponibles. No inicia audio ni vibración.
- En la primera visita, la presentación se muestra antes de la bienvenida. Las preferencias quedan temporalmente inertes y fuera del árbol accesible mientras la intro las cubre; al finalizar recuperan foco y uso. Terminar la bienvenida no provoca una segunda intro inmediata.
- El botón verde «Repetir introducción» reproduce otra vez la secuencia. La pausa detiene el movimiento durante la visita actual; una recarga vuelve a empezar animada, según el requisito explícito.
- La navegación interna entre secciones no reproduce la entrada completa. Una nueva carga de la web sí lo hace.
- Hay cinco estrellas fugaces en la presentación y cinco en el cielo de escritorio, frente a las tres anteriores. Móvil reduce una de las trayectorias existentes y conserva las dos añadidas.
- Al abrir la banda, el personaje elegido baila automáticamente. Solo hay un control de movimiento: «Pausar baile» / «Bailar». Se retiraron Caminar, Animar, pasos anterior/siguiente, Reposo y el inspector de dibujos.
- El baile utiliza los cuatro PNG originales y un balanceo continuo ligero. La pausa conserva dibujo y posición; al salir de la sección se cancelan tiempos y animación. Los iconos de navegación permanecen legibles y el reproductor conserva sus movimientos ligados a la música.
- La guía móvil mantiene tres acciones: elegir disco, reproducir y tocar un color. Texto de una frase, contador, cerrar y acciones breves, sin panel con scroll interno. La bienvenida también usa opciones compactas.

## Verificación

`scripts/verify_cinema.cjs` comprueba reproducción automática, tres recargas seguidas, preferencias y marcas antiguas, entrada anterior a bienvenida, botón verde, salidas, siete tamaños, limpieza y ausencia de audio/vibración. `scripts/verify_sprites.cjs` comprueba los cinco músicos, un único control, los cuatro dibujos originales, movimiento suave, pausa/reanudación y limpieza al salir. `scripts/verify_mobile_guide.cjs` recorre la guía en español/inglés con texto normal/grande y alternativa sin Web Audio.

Los demás recorridos de navegador usan el botón real de saltar antes de comprobar sus pantallas. Las pruebas unitarias de navegación aíslan los efectos temporales; las pruebas de entrada utilizan el constructor real y los recorridos de navegador verifican su comportamiento sin ese aislamiento. Los resultados iniciales y sus correcciones se conservan separados de los informes finales.

Se trata de pruebas de navegador y viewports CSS; no se declara certificación WCAG, revisión de teléfono físico ni FPS garantizados.
