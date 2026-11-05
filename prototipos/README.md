# Prototipos (Claude Design)

Copias del código de cada iteración del prototipo, para no perder la historia. El registro completo de iteraciones, con **qué cambió y quién lo hizo**, está en [`docs/ITERACIONES.md`](../docs/ITERACIONES.md).

| Carpeta | Iteración | Contenido |
|---|---|---|
| [`I10-iconos/`](I10-iconos/) | I10 · Iconos y menos cajas (v18 del artefacto) | `Main.dc.html` (prototipo de escritorio con iconos) y `canvas.json`. Las maquetas móviles no cambiaron: están en I09 |
| [`I09-maqueta-movil/`](I09-maqueta-movil/) | I09 · Maqueta móvil (estado de la v17 del artefacto) | `Main.dc.html` (prototipo jugable de escritorio) y 7 maquetas móviles `Movil-*.dc.html`, más `canvas.json` |

## Cómo verlos
- **Lo más fácil:** el prototipo publicado: https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU *(privado hasta que su dueño lo comparta)*.
- Los archivos `.dc.html` son el formato de **Claude Design**: no se abren directo en el navegador. Para trabajar con ellos se publican en un lienzo de Claude Design (`canvas.json` es el índice con la posición de cada pantalla).
- Los fotogramas del prototipo se cargan desde el almacén de ese artefacto (`/_blob/...`); los mismos 30 fotogramas están en [`data/fotogramas/`](../data/fotogramas/).

## Autoría
Por ahora, **Nishix03**. El código lo genera una IA (Claude Design y Claude Code) a partir de sus pedidos y él lo revisa; ver [`docs/USO_DE_IA.md`](../docs/USO_DE_IA.md).
