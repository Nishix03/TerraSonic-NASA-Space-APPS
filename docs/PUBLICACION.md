# Vista independiente y protección de la web oficial

Vista de revisión: **https://terrasonic-piero-preview-20261113.satinkoi3.chatgpt.site**.

Se publicó con la integración y skill Sites como una copia estática independiente, sin base de datos ni backend de aplicación. El código del visitante sigue ejecutándose localmente. La audiencia pública se configuró solo para este Site nuevo, conforme al requisito de un enlace sin credenciales. No se cambió la protección del proyecto Vercel existente ni la configuración de GitHub Pages.

## Procedencia de la copia verificada

| Identificador | Valor |
| --- | --- |
| Repositorio original | `Nishix03/TerraSonic-NASA-Space-APPS` |
| Rama de trabajo | `piero-mejoras` |
| Código de aplicación de este checkpoint | `409f19758f44954eeb304645a5699a1ca72a6717` |
| Site | `appgprj_6af6c9713984819186c5a346e2b19cb9` |
| Versión Sites | 1 |
| Fuente estática Sites | `96f669644569f7c628c77f38780c8aa103f6c166` |
| Versión guardada | `appgprj_6af6c9713984819186c5a346e2b19cb9~appgver_b44e4e7049e881918f6c2977be28f7b3` |
| Despliegue | `appgdep_6af6c9fe82bc81918e8357729748f47f` |
| Resultado del proveedor | `succeeded`, 13 nov 2026 08:27:55 UTC |

La rama `main` del repositorio fuente de Sites es una copia nueva y aislada; no es `main` del proyecto GitHub. El manifiesto `.openai/hosting.json` queda en `_work/sites/terrasonic-piero-preview/` para reanudar el mismo Site, no crear otro. Declara exclusivamente `static.directory: dist`.

El helper oficial de Sites verificó el push de esa fuente y produjo el archivo de despliegue, de 7.014.400 bytes y 89 entradas, con huella `sha256:9cfbf5d7f7b97152e8a6c7e765c8ac5a0d9ea574f10b522614ed20afaa879f43`. Los credenciales del repositorio Sites se pasaron por stdin y memoria de sesión; no se guardaron en el código ni en este documento.

## Verificación sin credenciales

`scripts/verify_public.cjs` abre contextos nuevos de Chromium, sin cookies de inicio ni cabeceras de autenticación. La URL devuelve HTTP 200 y permanece en su propio origen. La prueba recorre portada, EIC y GIBS, reproducción/pausa, leyenda, los cinco músicos y la imagen de ejemplo; repite el recorrido con WebGL deshabilitado en el fixture.

Los 81 archivos comprobados coinciden por SHA-256 con el paquete local: 60 mapas, cinco GLB, diez poses/caras, dos scripts de ejecución y el módulo 3D, más los catálogos y la serie NASA POWER. No hubo errores JavaScript ni respuestas HTTP fallidas del Site en esos recorridos. Cada pose se decodificó en el navegador. Capturas y JSON: `_work/public/browser/`.

Una consulta directa con `urllib` devolvió 403; el navegador anónimo sí devolvió 200 y ejecutó el producto. Se conserva esa distinción: la prueba de acceso público acreditada es la sesión de navegador limpia, no la consulta de Python ni un token de acceso del propietario.

```powershell
node scripts/verify_public.cjs https://terrasonic-piero-preview-20261113.satinkoi3.chatgpt.site _site _work/public/browser
```

## GitHub y web oficial

La identidad `Alvaro-mendoza-12` se verificó mediante la API GitHub con un credencial existente del gestor Git, sin mostrarlo. El repositorio confirmó permiso `push: true`. El push se hizo explícitamente a `piero-mejoras:piero-mejoras`, sin force-push. Después, el remoto mostraba esta rama en `409f197` y `main` seguía en `59310ac43cd25e76cc68022a109326ca5cb27712`. La rama local main permanecía en `a8f8203e8de3097584987a5ba5635bc813181c44`.

`.github/workflows/pages.yml` solo publica en `push` a `main` o mediante un `workflow_dispatch` explícito. No hay diferencias de `.github/` en la rama y no se disparó un despacho manual. El trabajo no contiene un merge a main ni una publicación de GitHub Pages.

La lectura de la [web oficial](https://nishix03.github.io/TerraSonic-NASA-Space-APPS/) devolvió 200, con SHA-256 del HTML `a10648034b25fc4cda32a67d9c991960fab4f5c3a1ce0e4c180a57a708a98536` en la observación de las 03:35 de Bogotá. Esa huella se conserva para comparar al cierre; no se toma el build Windows reconstruido como si fuera una copia binaria idéntica del despliegue Linux.

## Intento Vercel

El CLI existente 54.7.1 estaba autenticado en `alvaro-mendoza-12`, equipo `alvaro-s-projects1`. Sus previews existentes tenían protección. Se mantuvo esa configuración.

Se probó el flujo temporal oficial con Vercel CLI 65.15.0, obtenido del registro npm oficial en una caché de D. Se usaron un directorio de build y una configuración temporal separados, sin cerrar la sesión existente. Vercel informó `READY` en `https://sonic-reef-tiugkfl.tmp.now`, con vencimiento el 13 nov a las 09:21:33 UTC, pero devolvió 403 tanto a Python como a un navegador sin credenciales. No se presenta como vista pública utilizable. El enlace privado de reclamación no se publicó ni se incluye en paquetes.

La URL de Sites anterior es la alternativa verificada. La entrega completa y el registro de tiempo siguen en `PIERO-MEJORAS.md`; publicar este checkpoint no acredita por sí solo el cierre de todos los requisitos.

## Revisión posterior y acceso de actualización

A las 04:45 de Bogotá, `get_site` seguía devolviendo el Site activo, su URL y versión 1. Sin embargo, no devolvía rol ni credencial de edición; `create_source_repository_write_credential` respondió `NOT_FOUND / project_not_found / 404`, y `list_sites(include_editable: true)` devolvió una lista vacía en la cuenta seleccionada. La credencial de la creación había vencido a las 08:35 UTC. No se reutilizó un token vencido, no se creó otro Site ni se cambió la audiencia.

Las correcciones posteriores de fuentes locales, selector CSV, foco en WebKit e imágenes sin deformación siguen separadas del checkpoint publicado. Para actualizar esta misma URL falta recuperar el acceso editor/propietario al Site existente desde la integración. El paquete portable y Git permiten revisar el código nuevo mientras tanto. El diagnóstico anterior no es un rechazo de aprobación automática ni significa que el enlace público haya dejado de funcionar.
