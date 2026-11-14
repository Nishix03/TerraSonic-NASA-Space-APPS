# Revisión del formulario NSAC y evolución del universo

## Fuentes y alcance

Se leyó el PDF local `Spanish NSAC.pdf`, cuatro páginas, y el brief de evolución visual adjunto. El PDF es una impresión del formulario de entrega del equipo, no una evaluación del prototipo ni una certificación de accesibilidad. La propia página advierte que incluye contenido de participantes que puede no haber sido revisado por NASA. No se envía ni modifica ese formulario desde esta tarea.

El brief amplía el producto con destinos interactivos, escenas, ambientación, accesibilidad y verificación. Se conserva el motor nativo HTML/CSS/JavaScript, Canvas y Web Audio, los PNG originales, los catálogos EIC/GIBS/POWER y las transiciones de banda. No se añade una dependencia de producción.

## Auditoría inicial

La presentación usa `CinematicIntro` y Web Animations. En móvil duraba tres segundos y el globo se desplazaba lateralmente mientras aumentaba de tamaño. El constructor forzaba movimiento incluso con una preferencia de reducción. El cielo contiene Sol, Luna, Saturno, un planeta lejano, eclipse, meteoros, cohetes y horizonte, todos decorativos. La banda utiliza cuatro dibujos originales por músico. No había destinos interactivos ni una capa ambiental separada.

La música de datos utiliza una cuadrícula de 28×16 extraída de imágenes, una paleta específica por producto, motores de datos/melodía y cinco voces sintetizadas. No es lectura de un campo científico numérico original: es una estimación derivada del color de imágenes recortadas y reducidas. La Vibration API ya tiene opt-in, activación, límites, deduplicación, cancelación y mensaje de capacidad; una respuesta `true` del navegador no acredita el movimiento físico del dispositivo.

## Plan visual revisado

Conservar el observatorio del Pacífico; dar protagonismo al viaje elegido y mantener quieta la interfaz. Paleta: pizarra `#171e2b`, panel `#202b3a`, agua `#8be7e9`, solar `#e8b969`, lunar `#c4d9ee`, vegetación `#9ad8bf`. Barlow para títulos, Inter para lectura y Atkinson Hyperlegible como opción existente. No se reemplazan las fuentes ni los dibujos.

```text
Móvil: entrada               Inicio                  Destino
     Tierra centrada        Hero y mapa             Volver al universo
     Texto centrado         Sol Luna Saturno Aqua   Título + explicación
     Pausar / Entrar                                Paisaje ilustrado
                                                    Escuchar / volumen
                                                    Abrir mapa NASA
```

Los accesos tienen texto y objetivos táctiles; el viaje es opcional y saltable. Las escenas ocupan una sección propia. Las asociaciones verano/invierno son narrativas terrestres; no describen estaciones del Sol ni de la Luna. Aqua es un mundo imaginario. Una nave observa el Sol y Saturno sin aterrizar en ellos.

## Criterios de accesibilidad

Se respeta la reducción de movimiento del sistema y la pausa guardada. La entrada sigue apareciendo en cada documento nuevo: versión estática si se solicita reducción, animada en caso contrario; el usuario puede activar una reproducción animada explícita. La introducción móvil dura 6,8 segundos y ofrece pausa y salida. Teclado, foco visible, retorno de foco, texto ES/EN, contraste, alternativas visuales al audio y controles sin gestos complejos forman parte de la revisión.

Referencias primarias: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [pausar, detener u ocultar](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) y [animación de interacciones](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). El último criterio es AAA; se usa como mejora de comodidad, sin declarar conformidad integral.

## Contraste con el PDF de entrega

| Requisito del formulario | Estado inicial y acción |
|---|---|
| Resumen de 50–200 palabras recomendado | El PDF lo muestra vacío; preparar un borrador para que el equipo lo revise |
| Demo pública ≤30 s o ≤7 diapositivas | Las grabaciones técnicas no equivalen a una demo final revisada; preparar guion y verificar duración de cualquier demo entregada |
| Enlace público al proyecto | Existe la vista independiente; comprobarla después de publicar esta edición |
| Detalles: funcionamiento, beneficio, herramientas, originalidad | Documentar el funcionamiento real y sus límites, sin afirmar accesibilidad universal |
| Declarar uso de SI/IA y marcar sus medios | Mantener registro de IA, metadatos y rótulos visibles en ilustraciones nuevas; revisar procedencia de las ilustraciones originales con el equipo |
| Usar y listar datos o recursos NASA | EIC/SVS 5176, JPL MUR, GIBS y POWER con referencias; preparar lista de enlaces completos |
| Listar recursos externos y confirmar derechos | Inventario existente; aceptación de originalidad y derechos corresponde al equipo |
| Guardar y enviar para evaluación | La captura muestra campos incompletos; no se deduce que esté enviado. El clic final y la aceptación de términos quedan a cargo del equipo |

La fecha del PDF es una captura del formulario. Se debe confirmar plazo y estado en la página del evento antes del envío. La consulta directa a Resources devolvió 502 durante esta revisión; no se presenta una copia inaccesible como guía verificada.

## Resultados y validaciones

Se completará con la evidencia de esta edición. Las pruebas de navegador no sustituyen una revisión con lector de pantalla, usuarios con distintas discapacidades, evaluación cultural ni validación del motor háptico en un teléfono real.
