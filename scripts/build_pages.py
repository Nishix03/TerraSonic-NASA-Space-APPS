"""Package the interactive TerraSonic prototype for GitHub Pages."""

from hashlib import sha256
import json
from pathlib import Path
from shutil import copy2, copytree
from sys import argv


def build(destination: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    prototype = root / "prototipos" / "I11-eic"
    avatar_runtime = root / "scripts" / "avatar3d.js"
    models = sorted((prototype / "modelos").glob("*.glb"))
    if len(models) != 5:
        raise ValueError("Se necesitan los cinco modelos GLB de TerraSonic.")
    version = sha256(avatar_runtime.read_bytes())
    for model in models:
        version.update(model.read_bytes())
        for kind in ("pose", "face"):
            version.update((prototype / "sprites" / model.stem / f"{kind}-volume.webp").read_bytes())
    avatar_version = version.hexdigest()[:12]
    html = (prototype / "Main.dc.html").read_text(encoding="utf-8")
    impact_catalog = json.loads((root / "data" / "impacts.v1.json").read_text(encoding="utf-8"))
    if impact_catalog.get("version") != 1 or not isinstance(impact_catalog.get("records"), list):
        raise ValueError("El catálogo de impactos necesita versión 1 y una lista de registros.")
    impact_marker = "var IMPACT_CATALOG = { version: 1, records: [] };"
    if impact_marker not in html:
        raise ValueError("Falta el marcador del catálogo estático de impactos.")
    html = html.replace(impact_marker, "var IMPACT_CATALOG = " + json.dumps(impact_catalog, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";", 1)
    html = html.replace(
        '<meta charset="utf-8">',
        '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">',
        1,
    )
    # Keep the prototype's bindings inert until the browser has resolved them.
    html = html.replace("<x-dc>", '<template id="terrasonic-template">', 1)
    html = html.replace("</x-dc>", "</template>", 1)
    html = html.replace(
        "/_blob/73710d959697d6b73c436a389b19a0de", "./data/nasa_power_monthly.json"
    )
    html = html.replace(
        "</head>", f'<script type="module" src="./runtime/avatar3d.js?v={avatar_version}"></script>\n</head>', 1
    )
    for kind in ("pose", "face"):
        html = html.replace(f"{kind}-volume.webp", f"{kind}-volume.webp?v={avatar_version}")
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "index.html").write_text(html, encoding="utf-8")
    copy2(root / "scripts" / "pages-support.js", destination / "support.js")
    for folder in ("fotogramas", "fotogramas-anteriores", "modelos"):
        copytree(prototype / folder, destination / folder, dirs_exist_ok=True)
    for model in models:
        for filename in ("particula.png", "pose-volume.webp", "face-volume.webp"):
            sprite = Path("sprites") / model.stem / filename
            (destination / sprite).parent.mkdir(parents=True, exist_ok=True)
            copy2(prototype / sprite, destination / sprite)
    runtime = destination / "runtime"
    runtime.mkdir(exist_ok=True)
    copy2(avatar_runtime, runtime)
    copytree(root / "scripts" / "vendor", runtime / "vendor", dirs_exist_ok=True)
    (destination / "data").mkdir(exist_ok=True)
    copy2(root / "data" / "nasa_power_monthly.json", destination / "data")
    copy2(root / "data" / "impacts.v1.json", destination / "data")


if __name__ == "__main__":
    build(Path(argv[1]))
