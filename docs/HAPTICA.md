# Vibración física del dispositivo

## Auditoría previa · 13 noviembre de 2026

La aplicación es estática, con un componente de estado `Component` en `prototipos/I11-eic/Main.dc.html`, compilación de enlaces DOM mediante `scripts/pages-support.js`, Canvas 2D y síntesis Web Audio. `scripts/build_pages.py` empaqueta el producto. No utiliza React, un servidor de aplicación ni dependencias hápticas. No hay manifiesto de instalación ni service worker: esta entrega no debe anunciarse como PWA instalada.

Antes de modificar la vibración se identificaron `vibrateSafely`, la preferencia booleana `vibe` guardada en `ts_prefs`, pulsos de 25/100/120 ms en los motores musicales y cancelación desde `stop()`. La cola de audio ya retrasa los pulsos hasta el instante audible. Se conservan esa sincronización y los controles existentes. Faltaban límite de frecuencia, identificación de eventos duplicados, tratamiento visible de rechazos, una comprobación explícita y suspensión al activar movimiento reducido o al ocultar la página.

Los puntos apropiados son la activación voluntaria, una imagen procesada correctamente, un error recuperable de archivo y la entrada musical excepcional de Illapa. No se utilizará cada clic, cada estrella, cada cambio de personaje ni cada columna del mapa como estímulo háptico. Los avisos de archivo son avisos de interfaz; los pulsos de la música no representan alertas reales de desastres.

## Compatibilidad y límites comprobados en fuentes

Consulta de fuentes primarias: [especificación Vibration API](https://w3c.github.io/vibration/), [Navigator.vibrate en MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate) y [datos de compatibilidad de MDN](https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json).

| Plataforma | Compatibilidad documentada y límite |
| --- | --- |
| Android / Chrome | Ofrece la API; requiere interacción previa, página visible y hardware/ajustes que permitan vibrar. |
| Android / navegadores Chromium | Opera y Samsung Internet figuran como compatibles; se comprueba la función en ejecución. No se afirma una prueba física de esos navegadores. |
| Android / Firefox | MDN advierte que puede devolver true sin producir vibración; la existencia de la función no demuestra funcionamiento físico. |
| iOS / Safari | No implementa esta API. Se mantienen texto, imagen y sonido; no se emplean trucos para simular soporte. |
| Escritorio | Chromium puede exponer la función aun sin un motor vibrador. Firefox retiró su implementación de escritorio en la versión 129; WebKit no la implementa. |
| PWA instalada | Instalar una web no añade una API que el navegador no tenga. Se mantienen las restricciones de la plataforma y del dispositivo. La instalación como PWA no forma parte de esta modificación. |

El valor `true` significa que el navegador aceptó la solicitud; no confirma que se haya movido un motor. La API controla tiempos de pulso y pausa, no la intensidad mecánica. Silencio, No molestar, ahorro de batería y ajustes del sistema pueden impedir el efecto. La aplicación no solicita permisos inventados ni intenta evadir restricciones.

No se detectó `adb` en el PATH de esta computadora. No se dispone de una comprobación física de Android o iPhone en esta sesión. Las pruebas automatizadas deberán indicar qué llamadas son interceptadas y qué capacidades se consultaron realmente.

## Diseño de la solución

Un controlador reutilizable con entorno inyectable agrupa patrones, preferencia, activación, visibilidad, movimiento reducido, deduplicación, límites y parada. El componente conserva el guardado existente y traduce el estado para la interfaz. Los controles de prueba solicitan `navigator.vibrate()`; no utilizan una animación como sustituto. Las pruebas separan invocación de API y comportamiento visual de la validación del motor físico.

La vibración está apagada inicialmente. Movimiento reducido del sistema o de la aplicación suspende los pulsos; al ocultar, pausar, navegar o desmontar se cancela la secuencia. Ninguna vibración automática se solicita antes de una interacción real y de la activación de la preferencia.

## Patrones e integración

| Uso | Milisegundos |
| --- | --- |
| Activar la preferencia / archivo aceptado | 15 |
| Aviso reutilizable | 45 |
| Error recuperable de archivo | 35, pausa 55, 35 |
| Entrada excepcional de Illapa | 30, pausa 45, 60 |
| Comprobación voluntaria | 25, pausa 50, 25 |
| Detener | `navigator.vibrate(0)` |

Se separan las solicitudes al menos 700 ms; las entradas musicales excepcionales, 2200 ms. Hay un máximo de doce solicitudes por minuto y memoria de 32 identificadores para no repetir un evento. No hay temporizador que genere vibraciones indefinidas. Una excepción suspende nuevos intentos hasta que el usuario pide una nueva comprobación; el reintento respeta los límites. La cancelación se envía una vez para una secuencia aceptada, incluso si la preferencia ya se apagó.

El controlador `HapticFeedback` y sus patrones están junto al componente existente en `Main.dc.html`; sus dependencias se inyectan como funciones. `hapticVm()` traduce el estado y enlaza la preferencia existente y los botones «Probar vibración» y «Detener vibración». La opción se deshabilita cuando no existe la API y el aviso explica cómo continuar. No se cambia de arquitectura ni se agrega una dependencia de producción.

## Prueba física desde un celular

1. Abre la vista independiente por HTTPS en una pestaña completa de Chrome para Android. Evita probarla desde un navegador incrustado en otra aplicación.
2. Comprueba que tu dispositivo permite vibraciones y que sus ajustes de silencio, No molestar o batería no las bloquean.
3. Abre Accesibilidad y activa Vibración. Si Movimiento reducido está activado, la vibración permanece suspendida y se indica en pantalla.
4. Pulsa Probar vibración. Debes comprobar tú si sientes los dos pulsos: «el navegador aceptó» no demuestra que haya vibrado el motor. Anota modelo de teléfono, navegador/versión, sistema y resultado físico.
5. Pulsa Detener vibración, desactiva la preferencia o cambia de página para solicitar la cancelación. Prueba también con el dispositivo pasando a segundo plano y con Movimiento reducido.
6. Recarga: se conserva la elección, pero no se inicia ningún pulso solo por entrar. Con una imagen válida se solicita una confirmación; con un archivo inválido se conserva el aviso escrito y se solicita el patrón de error, sujeto al límite de frecuencia.

En iOS/Safari se espera el aviso de función no disponible. En una computadora sin motor también puede haber una aceptación de la API sin sensación física. No se toma ninguno de estos casos como una demostración háptica real.

## Validación

`scripts/test_haptics.cjs` prueba el controlador real con el límite de hardware inyectado: catorce casos de preferencias, activación, patrones, cancelación, ausencia de API, rechazos, excepciones, reintentos, movimiento reducido, ocultación, deduplicación y frecuencia. Son llamadas registradas por pruebas, no un motor físico. Las 134 pruebas del componente conservan la sincronización con el audio audible y la cancelación en transporte/navegación.

`scripts/verify_haptics.cjs` distingue escenarios nativos de escenarios interceptados. Los nativos reenvían las llamadas a la API real del navegador instalado; los demás simulan únicamente esa frontera para verificar respuestas y errores. Comprueba controles, persistencia, ausencia de pulsos al entrar, avisos de incompatibilidad, errores/aceptación de imagen y regresiones visuales. La validación de motor físico en Android, otros móviles, iOS y una instalación PWA sigue pendiente; no se afirma haberla hecho en esta computadora.

Resultado local: pasan los catorce casos del controlador, las 134 pruebas existentes del componente y diez recorridos de navegador por motor en Chromium 156, Firefox 146 y WebKit 26. En esta instalación Windows, Chromium expone la API y acepta las solicitudes nativas; Firefox y WebKit no la exponen. Los otros casos de cada motor prueban la frontera interceptada y no modifican esa tabla de compatibilidad. La primera prueba de persistencia reinicializaba la preferencia en su propio fixture al recargar; se corrigió el fixture para conservar localStorage. La aplicación mantiene la preferencia y no solicita pulsos por la mera recarga.

Evidencia: `_work/haptics-unit-v2.log`, `_work/haptics-controller-v2.log` y `_work/haptics-qa/chromium-v2`, `firefox`, `webkit`. Los reportes guardan `physicalMotorVerified: false` en cada caso. Esta entrega comprueba más que compilación: acciona controles reales, archivos, cancelación, persistencia y estados de la aplicación, pero deja la comprobación sensorial física expresamente pendiente.
