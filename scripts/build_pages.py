"""Package the interactive EarthBeat prototype for GitHub Pages."""

from hashlib import sha256
import json
from pathlib import Path
from shutil import copy2, copytree
from sys import argv


def lf_bytes(path: Path) -> bytes:
    """Canonical text bytes, independent of Git's checkout/archive line endings."""
    return path.read_bytes().replace(b"\r\n", b"\n")


def build(destination: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    prototype = root / "prototipos" / "I11-eic"
    support_runtime = root / "scripts" / "pages-support.js"
    musicians = {"silbo", "inti", "mama", "yaku", "illapa"}
    support_version = sha256(lf_bytes(support_runtime)).hexdigest()[:12]
    html = (prototype / "Main.dc.html").read_text(encoding="utf-8")
    impact_catalog = json.loads((root / "data" / "impacts.v1.json").read_text(encoding="utf-8"))
    if impact_catalog.get("version") != 1 or not isinstance(impact_catalog.get("records"), list):
        raise ValueError("El catálogo de impactos necesita versión 1 y una lista de registros.")
    impact_marker = "var IMPACT_CATALOG = { version: 1, records: [] };"
    if impact_marker not in html:
        raise ValueError("Falta el marcador del catálogo estático de impactos.")
    html = html.replace(impact_marker, "var IMPACT_CATALOG = " + json.dumps(impact_catalog, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";", 1)
    character_catalog = json.loads((root / "data" / "characters.v1.json").read_text(encoding="utf-8"))
    if character_catalog.get("version") != 1 or {item["key"] for item in character_catalog.get("characters", [])} != musicians:
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
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "index.html").write_bytes(html.encode("utf-8"))
    copy2(support_runtime, destination / "support.js")
    copytree(root / "assets" / "fonts", destination / "fonts", dirs_exist_ok=True)
    for folder in ("fotogramas", "fotogramas-anteriores", "brisa"):
        copytree(prototype / folder, destination / folder, dirs_exist_ok=True)
    for musician in sorted(musicians):
        for filename in ("miniatura-banda.webp", "pose-banda.webp", "pose-banda-animada.webp"):
            sprite = Path("sprites") / musician / filename
            (destination / sprite).parent.mkdir(parents=True, exist_ok=True)
            copy2(prototype / sprite, destination / sprite)
    (destination / "data").mkdir(exist_ok=True)
    copy2(root / "data" / "nasa_power_monthly.json", destination / "data")
    copy2(root / "data" / "impacts.v1.json", destination / "data")
    copy2(root / "data" / "characters.v1.json", destination / "data")
    # Keep shipped text independent of checkout line endings and preserve font notices.
    for asset in destination.rglob("*"):
        if asset.is_file() and asset.suffix.lower() in {".html", ".js", ".json", ".css", ".md", ".txt"} and not asset.name.endswith("-OFL.txt"):
            normalized = lf_bytes(asset)
            if normalized != asset.read_bytes():
                asset.write_bytes(normalized)


if __name__ == "__main__":
    build(Path(argv[1]))
