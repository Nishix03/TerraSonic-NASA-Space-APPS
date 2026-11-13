# Conversión local de imágenes y tablas

La entrada principal ofrece una imagen NASA ya incluida y un selector de imagen propia. La muestra corresponde al fotograma EIC del 11 de enero de 2025. Se analiza con la paleta EIC; una imagen propia empieza en color libre y puede cambiar de lectura en el reproductor. Los dos resultados usan la misma cuadrícula y controles de reproducción.

Lluvia de Chiclayo y CSV/TSV/TXT están en una sección secundaria desplegable. Se conserva la muestra mensual NASA POWER, su selección de columna y el procesamiento local. El archivo mensual original sigue en `data/nasa_power_monthly.json`; la interfaz usa los 48 valores del periodo seleccionado por el proyecto.

Los archivos se limitan a 8 MiB. PNG, JPG, WebP y GIF se analizan como una imagen fija, hasta 32 millones de píxeles. Se leen las dimensiones de las cabeceras conocidas antes de crear la URL de la imagen y se vuelve a comprobar el tamaño al cargarla. Las tablas admiten hasta 5000 filas de datos y una columna válida debe contener al menos ocho números. Las selecciones tardías se descartan mediante el identificador de carga.

Los errores no borran el archivo aceptado. El selector se puede usar otra vez y permite escoger el mismo archivo corregido. PDF y SVG no están admitidos. El archivo se lee en el navegador, con `File`, Canvas y URL locales; no se envía por red.

`node scripts/verify_convert.cjs _site _work/convert/browser` comprueba imagen de ejemplo, imagen propia, paleta libre, PDF inválido, imagen corrupta, archivo de más de 8 MiB, imagen comprimida con dimensiones excesivas, CSV inválido, tres columnas, cambio de columna y NASA POWER en inglés. Conserva el archivo anterior ante errores y verifica que no haya peticiones distintas de GET. Guarda capturas a 320, 390, 768 y 1366 píxeles. Las pruebas son de Chromium con archivos y tamaños de pantalla emulados.
