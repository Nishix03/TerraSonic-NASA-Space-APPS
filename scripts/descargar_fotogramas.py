"""M1 · Descarga los fotogramas de anomalía de temperatura del mar (GHRSST MUR 0.25°) desde NASA Worldview
y genera data/discos.json. Es el mismo producto que usa la visualización EIC "SST Anomaly - Near Real Time" (SVS 5176).

Uso:  python scripts/descargar_fotogramas.py   (solo usa la librería estándar)
"""
import json
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SNAPSHOT = ("https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME={fecha}T00:00:00Z"
            "&BBOX=-25,-140,15,-70&CRS=EPSG:4326"
            "&LAYERS=GHRSST_L4_MUR25_Sea_Surface_Temperature_Anomalies,Coastlines_15m"
            "&FORMAT=image/png&WIDTH=560&HEIGHT=320")
FUENTE = "NASA JPL GHRSST L4 MUR 0.25° SST Anomalies vía NASA GIBS/Worldview (producto de EIC SVS 5176)"

DISCOS = [
    ("nina2010", "1", "La Niña", "ago 2010 – ene 2011", "#38C6E8", (2010, 8)),
    ("nino2015", "2", "El Niño «Godzilla»", "jul – dic 2015", "#FF5A36", (2015, 7)),
    ("costero2017", "3", "Niño Costero", "dic 2016 – may 2017", "#FFD447", (2016, 12)),
    ("yaku2023", "4", "Yaku", "ene – jun 2023", "#7BE38A", (2023, 1)),
    ("nino2023", "5", "El Niño 2023", "jul – dic 2023", "#E0459B", (2023, 7)),
]


def fechas(anio, mes, cantidad=6):
    for i in range(cantidad):
        m = mes - 1 + i
        yield f"{anio + m // 12}-{m % 12 + 1:02d}-15"


def main():
    carpeta = RAIZ / "data" / "fotogramas"
    carpeta.mkdir(parents=True, exist_ok=True)
    manifiesto = []
    for id_, n, titulo, periodo, color, (anio, mes) in DISCOS:
        fotogramas = []
        for i, fecha in enumerate(fechas(anio, mes)):
            destino = carpeta / f"{id_}_{i}.png"
            if not destino.exists():
                urllib.request.urlretrieve(SNAPSHOT.format(fecha=fecha), destino)
            fotogramas.append({"url": f"data/fotogramas/{destino.name}", "fecha": fecha})
        manifiesto.append({"id": id_, "n": n, "titulo": titulo, "periodo": periodo, "color": color,
                           "fuente": FUENTE, "fotogramas": fotogramas})
        print(f"OK {titulo}: {len(fotogramas)} fotogramas")
    (RAIZ / "data" / "discos.json").write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
