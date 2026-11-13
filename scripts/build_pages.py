"""Package the interactive TerraSonic prototype for GitHub Pages."""

from hashlib import sha256
import json
import re
from pathlib import Path
from shutil import copy2, copytree
from sys import argv


def lf_bytes(path: Path) -> bytes:
    """Canonical text bytes, independent of Git's checkout/archive line endings."""
    return path.read_bytes().replace(b"\r\n", b"\n")


def build(destination: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    prototype = root / "prototipos" / "I11-eic"
    if any((destination / stale).exists() for stale in ("modelos", "runtime/avatar3d.js", "runtime/vendor")):
        raise ValueError("La edición 2D necesita una carpeta de salida nueva; esta conserva un build 3D anterior. Elige otro destino para preservar esa copia.")
    avatar_runtime = root / "scripts" / "avatar2d.js"
    support_runtime = root / "scripts" / "pages-support.js"
    characters = ("silbo", "inti", "mama", "yaku", "illapa")
    version = sha256(lf_bytes(avatar_runtime))
    for key in characters:
        version.update((prototype / "sprites" / key / "pose-banda.webp").read_bytes())
        for frame in range(4):
            version.update((root / "assets" / "avatares" / key / "banda" / "keyframes" / f"{frame:02}.png").read_bytes())
    avatar_version = version.hexdigest()[:12]
    support_version = sha256(lf_bytes(support_runtime)).hexdigest()[:12]
    html = (prototype / "Main.dc.html").read_text(encoding="utf-8")
    # Keep bound image addresses inert during native template cloning too.
    html = re.sub(r'(?<![\w-])src="(\{\{[^"\n]+\}\})"', r'data-ts-src="\1"', html)
    impact_catalog = json.loads((root / "data" / "impacts.v1.json").read_text(encoding="utf-8"))
    if impact_catalog.get("version") != 1 or not isinstance(impact_catalog.get("records"), list):
        raise ValueError("El catálogo de impactos necesita versión 1 y una lista de registros.")
    impact_marker = "var IMPACT_CATALOG = { version: 1, records: [] };"
    if impact_marker not in html:
        raise ValueError("Falta el marcador del catálogo estático de impactos.")
    html = html.replace(impact_marker, "var IMPACT_CATALOG = " + json.dumps(impact_catalog, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";", 1)
    character_catalog = json.loads((root / "data" / "characters.v1.json").read_text(encoding="utf-8"))
    if character_catalog.get("version") != 1 or {item["key"] for item in character_catalog.get("characters", [])} != set(characters):
        raise ValueError("El catálogo de personajes necesita versión 1 y los cinco músicos.")
    character_marker = "var CHARACTER_CATALOG = { version: 1, characters: [], ethics: {} };"
    if character_marker not in html:
        raise ValueError("Falta el marcador del catálogo estático de personajes.")
    html = html.replace(character_marker, "var CHARACTER_CATALOG = " + json.dumps(character_catalog, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";", 1)
    html = html.replace(
        '<meta charset="utf-8">',
        '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">',
        1,
    )
    # Keep the prototype's bindings inert until the browser has resolved them.
    html = html.replace("<x-dc>", '<template id="terrasonic-template">', 1)
    html = html.replace("</x-dc>", "</template>", 1)
    support_marker = 'src="./support.js"'
    if support_marker not in html:
        raise ValueError("Falta el script de enlaces de estado del prototipo.")
    html = html.replace(support_marker, f'src="./support.js?v={support_version}"', 1)
    html = html.replace(
        "/_blob/73710d959697d6b73c436a389b19a0de", "./data/nasa_power_monthly.json"
    )
    html = html.replace(
        "</head>", f'<script type="module" src="./runtime/avatar2d.js?v={avatar_version}"></script>\n</head>', 1
    )
    html = html.replace("pose-banda.webp", f"pose-banda.webp?v={avatar_version}")
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "index.html").write_bytes(html.encode("utf-8"))
    copy2(support_runtime, destination / "support.js")
    copytree(root / "assets" / "fonts", destination / "fonts", dirs_exist_ok=True)
    for folder in ("fotogramas", "fotogramas-anteriores"):
        copytree(prototype / folder, destination / folder, dirs_exist_ok=True)
    for key in characters:
        for filename in ("particula.png", "pose-banda.webp"):
            sprite = Path("sprites") / key / filename
            (destination / sprite).parent.mkdir(parents=True, exist_ok=True)
            copy2(prototype / sprite, destination / sprite)
        frames = Path("sprites") / key / "keyframes"
        (destination / frames).mkdir(parents=True, exist_ok=True)
        for frame in range(4):
            filename = f"{frame:02}.png"
            copy2(root / "assets" / "avatares" / key / "banda" / "keyframes" / filename, destination / frames / filename)
    runtime = destination / "runtime"
    runtime.mkdir(exist_ok=True)
    copy2(avatar_runtime, runtime)
    (destination / "data").mkdir(exist_ok=True)
    copy2(root / "data" / "nasa_power_monthly.json", destination / "data")
    copy2(root / "data" / "impacts.v1.json", destination / "data")
    copy2(root / "data" / "characters.v1.json", destination / "data")
    # git archive also applies core.autocrlf. Normalize shipped text and the
    # runtime cache key; keep pinned original font notices byte-for-byte intact.
    for asset in destination.rglob("*"):
        if asset.is_file() and asset.suffix.lower() in {".html", ".js", ".json", ".css", ".md", ".txt"} and not asset.name.endswith("-OFL.txt"):
            normalized = lf_bytes(asset)
            if normalized != asset.read_bytes():
                asset.write_bytes(normalized)


if __name__ == "__main__":
    build(Path(argv[1]))
