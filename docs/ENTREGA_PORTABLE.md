# Entrega portable y recuperación

Los paquetes siguientes son históricos y contienen los modelos 3D descartados. La edición vigente usa sprites originales; el paquete 2D, cuando esté verificado, se identifica en SPRITES_2D.md y PUBLICACION.md. No atribuir el contenido de estos ZIP a la nueva publicación.

La copia final verificada es `terrasonic-review-f5522b9.zip`, fuente f5522b9, 58.337.305 bytes, SHA-256 `7a37523518d20702e222e64300a683d2b8e2f64154fcd9bea6107fabdff67a51`. Incluye los 103 archivos actuales idénticos a la vista pública c4f7aca y el registro de 420 minutos. [Entrega, pruebas y límites](ENTREGA_2026-11-13.md). Los checkpoints siguientes se conservan para recuperación.

El build normaliza los saltos de línea de los archivos de texto distribuidos y de la clave de caché del runtime 3D. Git puede producir CRLF en `archive` según `core.autocrlf`, incluso cuando el blob del repositorio es LF. La normalización evita que esa preferencia local cambie las huellas del sitio. Los binarios y los cuatro avisos originales OFL con huellas fijadas se conservan byte por byte; no se cambia la configuración Git global.

La prueba del commit `0fefefd` comparó exportaciones reales de Git con `core.autocrlf=true`, `false` y el árbol de trabajo: los 103 archivos generados coinciden byte por byte. Son 7.152.631 bytes, con HTML SHA-256 `ce9a2c6869246106dce477e491165dc1a8002ed33b8dbbf3f1c38a7b67988a90`, y las doce fuentes/avisos originales siguen intactos. Evidencia en `_work/reproducible-0fefefd/results.json`. Esa salida corresponde a la publicación inicial de GitHub Pages; la [vista pública actual](https://alvaro-mendoza-12.github.io/terrasonic-piero-preview-20261113/) tiene una fuente posterior identificada en PUBLICACION.md. Los paquetes históricos de abajo conservan su procedencia anterior.

El primer paquete verificado de esta revisión es un checkpoint del commit `122fd9d536393528b84d9871fe734ac93a761101`. No incluye las correcciones posteriores de este chat. Se conserva para recuperación y para comprobar el procedimiento de entrega.

| Dato | Checkpoint verificado |
| --- | --- |
| Archivo | `_work/delivery/terrasonic-checkpoint-122fd9d.zip` |
| Tamaño | 48.505.547 bytes |
| SHA-256 | `5ce18ab5e7b87258745fed02557c66995a2a55ee1f51dc3a81be3450f61ac027` |
| Fuente | ZIP de `git archive 122fd9d`, sin archivos ignorados |
| Sitio | 103 archivos construidos desde esa fuente en un directorio nuevo |
| Paquete completo | 157 archivos, incluido `manifest.json` |

La vista Sites continúa sirviendo el checkpoint de aplicación `409f197`. El ZIP y el enlace tienen procedencias distintas. [PUBLICACION.md](PUBLICACION.md) documenta el acceso de actualización pendiente; no debe atribuirse a la URL una corrección que solo existe en Git o en el paquete.

## Uso

Un checkpoint posterior ya creado es `terrasonic-checkpoint-f0f5d06.zip`, del commit `f0f5d06d8db782dd44b665def42725ea4644be34`: 64.746.015 bytes, SHA-256 `f2ea84c502cd878004b6528b8079a959c757d232be4ad7331e67f98e198a4081`. Incluye 196 archivos, la referencia explícita al código de la preview `409f197` y `baseline-models.zip`. Se verificaron por SHA-256 sus seis archivos originales —escena y cinco GLB— contra Git `59310ac`. Es otro checkpoint recuperable; las correcciones numéricas posteriores aún no forman parte de ese ZIP.

Extraer el ZIP en una carpeta nueva y ejecutar `python serve.py`. El servidor usa solo `127.0.0.1`, puerto 8765 por defecto; `--port` permite otro. Abrir http://127.0.0.1:8765/. No requiere Node, Blender, cuenta ni backend para usar el sitio. Audio requiere acción del usuario; voz y vibración dependen de capacidades del dispositivo. El texto y la pose estática permiten continuar sin esas APIs. Los enlaces documentales externos sí requieren red.

`python verify_package.py` comprueba cada tamaño y huella y rechaza archivos extra. La fuente va en `source.zip`, separada del sitio listo para servir. Extrayendo la fuente se puede volver a construir con `python scripts/build_pages.py _site`. Los originales artísticos y el `.blend` editable permanecen en la fuente.

## Comprobaciones realizadas

- Extracción segura en `_work/delivery/extracted-122fd9d`, sin sobrescribir otro directorio.
- Verificador ejecutado desde su carpeta y desde `D:/`, para comprobar que no depende del directorio de trabajo.
- Modificación intencional de un byte/texto en la copia extraída: el verificador la rechazó. Se restauró el archivo y la integridad volvió a pasar.
- Servidor independiente del paquete en `127.0.0.1:58921`: las 103 respuestas HTTP coinciden con el manifiesto.
- Dos contextos nuevos de Chromium por HTTP real, sin interceptar la red ni usar preferencias previas: Inicio completo, fuentes locales, mapa/leyenda, modelo 3D, muestra NASA, CSV de tres columnas y cambio de idioma. Cero respuestas fallidas, errores JS o solicitudes HTTP externas en esos recorridos. El sonido no forma parte de esta prueba de empaquetado.

Evidencia: `_work/delivery/http-122fd9d.json`, `_work/delivery/browser-122fd9d/results.json`, sus capturas y `_work/package-checkpoint.log`. Los tests del propio producto/audio se documentan aparte en [VERIFICACION.md](VERIFICACION.md).

## Generar otro checkpoint

El empaquetador actual escribe los archivos Git directamente en disco y calcula SHA-256 en bloques de 1 MiB, para no conservar dos ZIP grandes completos en RAM. Se comprobaron seis controles en un repositorio sintético nuevo: fuente comprometida sin el `.env` sin seguimiento, evidencia limitada, archivo de más de 2 MiB, integridad/alteración, archivo extra llamado `site/manifest.json`, rechazo de sobrescritura y rechazo de evidencia con forma de credencial. El verificador solo excluye el manifiesto raíz; antes podía pasar por alto otro archivo con ese nombre. Ejecutar `python scripts/test_package_portable.py`. El control sintético no sustituye la comprobación del paquete real.

La construcción real con el commit `f4ba00a` y los modelos base también pasó usando el flujo por disco: `_work/delivery/streaming-f4ba00a.zip`, 56.507.482 bytes, SHA-256 `b2d1f96e04062bef013576895fb140213ac0904ecd1e06135bc995798837d2f6`. Es una comprobación técnica sin la evidencia final y anterior al ajuste compacto; se conserva como checkpoint, no como entrega actual.

```powershell
python scripts/package_portable.py _work/delivery/terrasonic-NUEVO --commit COMMIT_COMPLETO --preview https://alvaro-mendoza-12.github.io/terrasonic-piero-preview-20261113/ --preview-source-commit COMMIT_PUBLICADO_VERIFICADO --evidence _work/benchmarks
```

Usar un directorio nuevo. El empaquetador no borra ni sobrescribe paquetes anteriores. Construye desde el commit, no desde el HTML generado de la copia de trabajo, y verifica las fuentes. Solo copia evidencia JSON/PNG/WebP de las carpetas elegidas; nunca copiar todo `_work`, que contiene cachés y logs privados de despliegue.

Se rechazan rutas de credenciales y patrones de claves conocidos. La selección limitada de entradas evita `.git`, `.env`, `.vercel`, `node_modules` y los directorios de trabajo. Un escaneo de patrones tiene límites: no se declara una auditoría universal de secretos ni una certificación de producción.


La exportación adicional c4f7aca con `core.autocrlf=true` produjo exactamente los mismos **103 archivos / 7.156.501 B** que la preparación pública desde Git con LF. La fuente del runtime exportada realmente contenía 138 líneas CRLF; no se supuso la conversión. Los doce archivos de fuentes/licencias pasan y el HTML conserva SHA-256 `4e89a5db6c675b9d477dd5d1059d5c96d6055ea17ac2f77ceb9bcd93db92fd27`. Evidencia: `_work/reproducible-c4f7aca/results.json`.
