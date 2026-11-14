# Introducción automática, baile único y guía móvil

> Checkpoint anterior. La [revisión NSAC posterior](REVISION_NSAC.md) mantiene una presentación en cada entrada y respeta la reducción guardada o del sistema mediante una portada estática. La duración móvil vigente es de 6,8 segundos, con pausa y centrado; las cifras y la política inferiores corresponden a la edición anterior.

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

Los demás recorridos de navegador usan el botón real de saltar antes de comprobar sus pantallas. Los recorridos de accesibilidad, redistribución y ventanas bajas eligen además pausa mediante la interfaz real, para medir contenido estático. Entrada, baile y guía se prueban con el movimiento automático efectivo. Las pruebas unitarias de navegación aíslan los efectos temporales; las pruebas de entrada utilizan el constructor real y los recorridos de navegador verifican su comportamiento sin ese aislamiento. Los resultados iniciales y sus correcciones se conservan separados de los informes finales.

### Resultados finales · 13 noviembre de 2026

Aplicación publicada: `14fda6728cd1feb8bf09c1e59d6ba678fa33fe0d`. Pasan **137 pruebas de componente y 14 de control háptico**. Los controles hápticos verifican capacidad e invocaciones; no acreditan vibración física.

| Motor | Entrada y recargas | Cinco músicos y pausa | Guía móvil ES/EN |
|---|---:|---:|---:|
| Chromium | 15 recorridos | 15 recorridos | 16 recorridos |
| Firefox 146 | 15 recorridos | 15 recorridos | 16 recorridos |
| WebKit 26 | 15 recorridos | 15 recorridos | 16 recorridos |

El build exacto servido por HTTP también pasa las seis suites generales de Chromium: 74 pantallas de axe sin infracciones detectadas, 408 estados de redistribución, 84 estados RETO 05, 10 recorridos de capacidad/preferencias hápticas, 16 casos de ventana baja y seis de fondo espacial. Pasan los dos recorridos HTTP de publicación.

Informes de entrada, banda y guía: `_work/automatic-entry-qa/chromium/cinema/`, `_work/automatic-entry-qa/final-smoke/sprites/`, `_work/automatic-entry-qa/chromium/mobile-guide/`, `_work/automatic-release/firefox/cinema/`, `_work/automatic-release/firefox-ready/sprites/`, `_work/automatic-release/firefox/mobile-guide/`, `_work/automatic-release/webkit-rendered/cinema/`, `_work/automatic-release/webkit/sprites/` y `_work/automatic-release/webkit/mobile-guide/`. Regresión general: `_work/automatic-release/chromium/run.json`. Lógica: `_work/automatic-release-unit.log` y `_work/automatic-entry-haptics-unit.log`.

Las primeras mediciones de Firefox comenzaron antes de terminar la precarga de dibujos; la receta espera ahora el primer fotograma real y la carga completa. WebKit necesitó esperar un fotograma renderizado, en vez de asumir una cadencia fija de 180 ms. Las repeticiones finales conservan la exigencia de observar dibujos y transformaciones reales; estos ajustes de las recetas no alteran el producto publicado. Las primeras ejecuciones quedan conservadas en sus carpetas originales.

Se grabó la URL pública en **1342×605 y 390×667**, sin pulsar reproducir al entrar, con reducción antigua guardada y reducción de sistema simulada. Ambos recorridos verifican arranque automático, pausa, recarga con otra introducción automática, meteoros visibles, movimiento solar, guía compacta y baile automático con un solo control. No registraron errores JavaScript ni respuestas HTTP fallidas. Evidencia: `_work/automatic-public-video/results.json`, `terrasonic-movimiento-1342.webm` y `terrasonic-movimiento-390.webm` en la misma carpeta. Las capturas `guide-390.png` y `band-390.png` muestran el resultado público.

Se trata de pruebas de navegador y viewports CSS; no se declara certificación WCAG, revisión de teléfono físico ni FPS garantizados.
