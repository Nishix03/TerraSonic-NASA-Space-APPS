"""Package the interactive TerraSonic prototype for GitHub Pages."""

from hashlib import sha256
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
    avatar_version = version.hexdigest()[:12]
    html = (prototype / "Main.dc.html").read_text(encoding="utf-8")
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
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "index.html").write_text(html, encoding="utf-8")
    copy2(root / "scripts" / "pages-support.js", destination / "support.js")
    for folder in ("fotogramas", "fotogramas-anteriores", "modelos"):
        copytree(prototype / folder, destination / folder, dirs_exist_ok=True)
    for model in models:
        particle = Path("sprites") / model.stem / "particula.png"
        (destination / particle).parent.mkdir(parents=True, exist_ok=True)
        copy2(prototype / particle, destination / particle)
    runtime = destination / "runtime"
    runtime.mkdir(exist_ok=True)
    copy2(avatar_runtime, runtime)
    copytree(root / "scripts" / "vendor", runtime / "vendor", dirs_exist_ok=True)
    (destination / "data").mkdir(exist_ok=True)
    copy2(root / "data" / "nasa_power_monthly.json", destination / "data")


if __name__ == "__main__":
    build(Path(argv[1]))
