# Carrusel del mapa de portada

El mapa cambia automáticamente cada tres segundos nominales entre cinco fotogramas EIC que ya están incluidos en la aplicación. La primera imagen se conserva y los siguientes ejemplos recorren los cinco episodios de invierno/verano. No se generan imágenes ni se añade una dependencia.

| Orden | Archivo existente | Fecha del fotograma |
|---|---|---|
| 1 | `inv2025_0.webp` | 11 mayo 2025 |
| 2 | `ver2026_2.webp` | 6 enero 2026 |
| 3 | `inv2026_2.webp` | 5 julio 2026 |
| 4 | `inv2024_2.webp` | 15 julio 2024 |
| 5 | `ver2025_2.webp` | 11 enero 2025 |

El cambio es directo y conserva las dimensiones de la tarjeta. La fecha, la fuente «NASA EIC», el texto alternativo y la miniatura del proceso acompañan a la imagen. El siguiente fotograma se carga y decodifica antes de sustituir al visible; una carga fallida se omite. En la composición móvil compacta cambia la miniatura, sin añadir otra tarjeta grande o desplazamiento.

El control existente «Pausar animaciones» también detiene el carrusel. Se mantiene quieto con movimiento reducido, durante la introducción, bienvenida, guía o viaje, fuera de Inicio y cuando se oculta la página. El puntero o foco dentro de la tarjeta permite leer el mapa sin cambios. Al volver a estar disponible comienza otro plazo de tres segundos. No arranca audio, no modifica el disco seleccionado o su reproducción y no anuncia cada imagen como una alerta a lectores de pantalla. El temporizador compartido y los manejadores de precarga se liberan al desmontar.

## Verificación

Pasan las 143 pruebas de lógica existentes. `verify_home_carousel.cjs` observa cambios reales sin adelantar el reloj: tres ventanas Chromium (390, 768 y 1440 píxeles), el ciclo completo de cinco imágenes y retorno, fecha/miniatura/texto alternativo sincronizados, estabilidad de la tarjeta, pausa/reanudación, reducción, idioma, lectura con puntero/foco, página oculta, navegación, desmontaje y fallo deliberado de la siguiente imagen. Los intervalos medidos entre cambios en esta ejecución fueron de 3002 a 3202 ms, con el sondeo compartido de 200 ms. También pasan los dos tamaños 390/1440 por Firefox y WebKit y las 14 comprobaciones de portada en español/inglés.

Las reglas axe sobre la tarjeta no detectaron fallos; no acreditan conformidad completa ni una evaluación con lectores de pantalla reales. Son ventanas CSS de navegadores, no teléfonos físicos. Evidencias locales en `_work/home-carousel/`: `chromium`, `firefox`, `webkit`, `unit-fixed.log`. La publicación exacta y sus comprobaciones están en [PUBLICACION.md](PUBLICACION.md).
