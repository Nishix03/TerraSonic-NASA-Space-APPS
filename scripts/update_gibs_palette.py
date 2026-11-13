"""Refresh the static NASA MUR palette without any runtime network dependency.

The conversion to -5..+5 is an explicit artistic normalization of the published
color intervals, not a retrieval of a measured temperature from each pixel.
"""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
from urllib.request import urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://gitc.earthdata.nasa.gov/colormaps/v1.0/GHRSST_Sea_Surface_Temperature_Anomalies.xml"


def refresh():
    folder = ROOT / "data" / "colormaps"
    folder.mkdir(parents=True, exist_ok=True)
    payload = urlopen(SOURCE, timeout=30).read()
    tree = ET.fromstring(payload)
    colors = []
    for entry in tree.iter("ColorMapEntry"):
        if entry.get("transparent", "false").lower() == "true":
            continue
        interval = entry.get("value", "").strip("[]()")
        low, high = [float(value) for value in interval.split(",")]
        midpoint = low if high == float("inf") else high if low == -float("inf") else (low + high) / 2
        level = round(max(-3, min(3, midpoint)) * 5 / 3, 6)
        colors.append([*[int(channel) for channel in entry.get("rgb").split(",")], level])
    if len(colors) < 50 or not colors[0][3] == -5 or not colors[-1][3] == 5:
        raise ValueError("Unexpected NASA palette schema or interval endpoints")
    (folder / "GHRSST_Sea_Surface_Temperature_Anomalies.xml").write_bytes(payload)
    metadata = {"source": SOURCE, "retrieved_utc": datetime.now(timezone.utc).isoformat(),
        "sha256": sha256(payload).hexdigest(), "entries": len(colors),
        "normalization": "Finite interval midpoint, clamp to [-3,+3], multiply by 5/3. Open extreme bins use the finite edge.",
        "meaning": "Approximate artistic levels inferred from rendered colors, not measured degrees."}
    (folder / "provenance.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    template = ROOT / "prototipos/I11-eic/Main.dc.html"
    html = template.read_text(encoding="utf-8")
    start = "// BEGIN NASA GIBS PALETTE\n"
    end = "// END NASA GIBS PALETTE"
    generated = start + "var GIBS_SCALE = " + json.dumps(colors, separators=(",", ":")) + ";\n" + end
    if start in html:
        a, b = html.index(start), html.index(end) + len(end)
        html = html[:a] + generated + html[b:]
    else:
        html = html.replace("function scoreOld(r, g, b) {", generated + "\nfunction scoreOld(r, g, b) {", 1)
    template.write_text(html, encoding="utf-8", newline="\n")
    print(json.dumps(metadata, ensure_ascii=False))


if __name__ == "__main__":
    refresh()
