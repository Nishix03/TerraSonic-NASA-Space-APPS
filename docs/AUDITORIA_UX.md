# Auditoría de diseño y usabilidad de TerraSonic

> Documento histórico. La revisión actual y sus límites están en [AUDITORIA_2026-11-13.md](AUDITORIA_2026-11-13.md). Las afirmaciones antiguas sobre zoom nativo y vista previa no se usan como evidencia del checkpoint actual. Brisa sustituye a Silbo como guía y se retiraron las herramientas planeadas.

## Problemas observados

- **Portada.** El mapa a pantalla completa ocupaba la altura que necesitaban las acciones, las cifras y la secuencia de sonificación. El mapa ahora tiene un marco propio. La secuencia y la guía de Silbo forman parte del mismo bloque de portada.
- **Escuchar.** Abrir un disco mostraba controles dispersos y dos visualizaciones demasiado grandes en ventanas bajas. El reproductor ahora agrupa reproducción, fecha, estado y ajustes. Los dos paneles comparten tamaño y el análisis detallado se puede desplegar.
- **Convierte en música.** La carga competía con el texto explicativo. Ahora destacan el selector de archivo y el ejemplo. Los controles de paleta o columna aparecen junto a la reproducción del archivo que afectan.
- **Método y Tecnología.** Los temas se descubrían al final de cada pantalla. Los accesos directos están arriba. Método separa el proceso, la escala y los objetivos. Tecnología agrupa herramientas y créditos por tema, conserva el tema al filtrar y muestra el estado de cada herramienta junto a su nombre.
- **Banda.** Se redujo la altura de la escena y se acercaron las fichas a sus controles para que la figura y la información se puedan explorar juntas.

## Diez heurísticas

| Heurística | Aplicación en la revisión |
| --- | --- |
| 1. Estado del sistema | La fecha y «En pausa» o «Reproduciendo» están junto a Reproducir. El filtro de Tecnología anuncia el número de resultados. |
| 2. Lenguaje del usuario | La portada presenta el proceso como imagen, análisis y música. El selector dice qué archivos se pueden elegir y el método explica cómo se interpretan. |
| 3. Control y libertad | Cambiar disco, cambiar archivo, Atrás y cerrar el diálogo siguen disponibles. Escape devuelve el foco al control de origen. |
| 4. Consistencia | Reproductor, Método y Tecnología comparten ancho, espaciado y jerarquía de títulos. Las categorías usan el mismo indicador de selección. |
| 5. Prevención de errores | Los límites de carga se muestran junto al selector. La reproducción se inicia mediante una acción explícita y los controles temporales mantienen su estado deshabilitado cuando corresponde. |
| 6. Reconocimiento | Los temas de Método y Tecnología están visibles al entrar. Se pueden elegir fechas por etiqueta y miniatura en el reproductor. |
| 7. Flexibilidad | Se puede entrar directamente a la escala, créditos o categorías. Se conservan el teclado, los ajustes de lectura y la navegación secuencial. |
| 8. Diseño austero | El mapa deja de ser el fondo del texto. La transición pasa a una señal breve y los detalles del análisis y las notas técnicas se abren según se necesiten. |
| 9. Recuperación de errores | Los mensajes de archivos inválidos aparecen junto a la carga. Una categoría sin coincidencias indica cómo volver a mostrar todas las herramientas. |
| 10. Ayuda contextual | Silbo está junto a la secuencia inicial. La explicación del archivo acompaña la carga y la interpretación de la escala se ofrece junto a la leyenda. |

[Diez heurísticas de Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/)

## Referencias de diseño

- **Sounding Climate** combina mapas, gráficos y sonificación en la exploración de una misma señal. En TerraSonic, esa relación se refleja en los dos paneles contiguos y la línea de tiempo compartida. [Repositorio de NCAR](https://github.com/NCAR/climate_sonification)
- **GaiaSenses** separa la exploración de datos, la reproducción y el modo de exhibición. En TerraSonic, el mapa y la reproducción comparten una superficie y el escenario conserva su propia vista. [Repositorio de GaiaSenses](https://github.com/GaiaSenses/Gaiasenses-web)
- **Primer** propone anchos de lectura acotados y regiones de contenido centradas. Se aplicaron un ancho común y una jerarquía de controles repetible en las secciones interiores. [Guía de layout de GitHub Primer](https://primer.style/product/getting-started/foundations/layout/)

## Verificación de la vista previa

La revisión aplica criterios de contraste, redistribución, foco visible y tamaño de objetivo. Los controles principales apuntan a 44 píxeles CSS. El aumento de zoom y el texto grande conservan el acceso mediante desplazamiento vertical. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

- Portada completa sin desplazamiento a 320 × 568, 375 × 812 y 1342 × 605. El flujo y el botón de Silbo están dentro del área inicial.
- Reproductor con ambos paneles completos al abrir un disco a 1342 × 605.
- 78 pruebas del proyecto aprobadas. En Chromium se comprobaron zoom del 80 % al 400 %, teclado, guía, reproducción, carga inválida y válida de CSV, cambio de columna, escala y créditos. axe no detectó infracciones en las vistas muestreadas.

La aprobación de producción queda pendiente de la revisión del equipo y de una prueba en el dispositivo físico de la demo, incluida la navegación con lector de pantalla.
