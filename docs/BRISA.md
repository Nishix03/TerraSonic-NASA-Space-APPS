# Brisa, preferencias y tutorial

> Alcance actualizado: [RETO 05](RETO_05.md). Este documento conserva detalles de la revisión anterior. Se retiraron CSV, Escenario, Método y los controles marcados en el brief; la guía permite omitir pasos y ya no usa una caja con scroll interno.

Brisa es la guía de la interfaz, separada de los cinco músicos. No se encontró una referencia visual aprobada de Brisa en los recursos disponibles ni se pudo recuperar la conversación compartida. Se utiliza su nombre con un símbolo de ayuda convencional. No se inventó un retrato, vestimenta o personaje 3D para ella.

En la primera visita se pregunta «¿Cómo prefieres usar TerraSonic?». Guía hablada, texto grande, alto contraste y movimiento reducido se pueden combinar. No se pide información sobre discapacidad. Las preferencias se guardan como booleanos conocidos en `ts_prefs`, con versión, y se pueden reabrir desde Accesibilidad. No requieren una cuenta.

El idioma inicial sigue `navigator.language`: español para `es` y variantes, inglés en los demás casos. Una elección manual válida guardada en `ts_lang` tiene prioridad. La interfaz, `lang`, mensajes, nombres y guía se presentan en ese idioma. Cambiarlo detiene la locución anterior.

La ayuda contextual utiliza objetivos de la pantalla actual. Abrir, avanzar o cerrarla no cambia la pantalla, disco, fecha, columna, archivo ni reproducción. Devuelve el foco al botón que la abrió y conserva el desplazamiento. Sus pasos se recuerdan por pantalla.

El tutorial es opcional y se puede reabrir. Exige elegir una portada NASA, pulsar Reproducir e interpretar el azul/flecha hacia abajo en la leyenda. No depende de oír ni de responder rápido. Si falta Web Audio hay un paso explícito para seguir con texto. Incluye progreso, atrás, cierre y salto. Al saltar o cerrar recupera la pantalla y posición previas; al terminar conserva el disco elegido y la reproducción que inició el usuario.

La voz está apagada inicialmente. Se elige una voz disponible del idioma seleccionado y se permite detenerla. Una lista vacía, idioma ausente o error mantiene la explicación escrita. La locución reduce la música al 30 % de su volumen y la restaura al terminar o cancelarse. Pasos, pantalla e idioma cancelan la locución anterior. No se ha verificado el timbre mediante escucha humana.

La preferencia de movimiento se combina con la del sistema operativo. Detiene CSS, transiciones, gestos manuales y animaciones 3D; conserva las poses y controles. No cambia la reproducción musical.

Se consultaron las recomendaciones de [COGA sobre contenido usable](https://www.w3.org/TR/coga-usable/) y las [heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) para mantener la ayuda localizable, lenguaje cotidiano, pasos breves y salidas claras. Son criterios de diseño, no una certificación ni una prueba con usuarios.

La prueba `node scripts/verify_brisa.cjs _site _work/brisa/browser` verifica tres combinaciones de idioma, teclado y persistencia; estado conservado y foco; voz simulada y mezcla de música real; las tres acciones a 1366 y 390 píxeles; movimiento 3D reducido manualmente; y ausencia de voz y Web Audio. Las voces son fixtures para comprobar ciclo de vida e idioma. No representan un lector de pantalla ni timbres reales. Las regresiones de lógica están en `scripts/test_guides.cjs`.
