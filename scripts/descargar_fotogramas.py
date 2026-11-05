"""M1 · Fotogramas oficiales del Earth Information Center (EIC).

Descarga el video «SST Anomaly – Pacific» (NASA SVS 5176, 4096×2048, un fotograma por día desde el 16 may 2024),
recorta la región del Pacífico sudeste (140°–70°O, 25°S–15°N), la reduce a 560×320 (WebP, calidad 90: unos 50 KB por fotograma) y genera data/discos.json
con 5 discos de 6 fotogramas (uno cada 30 días, 150 días por disco).

Requisitos: ffmpeg en el PATH. Solo usa la librería estándar de Python.
Uso:  python scripts/descargar_fotogramas.py
Crédito: NASA's Scientific Visualization Studio. Datos: JPL MUR SST (PO.DAAC).
"""
import json
import subprocess
import urllib.request
from datetime import date, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VIDEO_URL = "https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005176/sst_anomaly_pacific_30_sec_4096x2048_2x1_30p.mp4"
VIDEO = RAIZ / "data" / "eic" / "sst_pacific.mp4"  # ~340 MB; no se sube a git
PRIMER_DIA = date(2024, 5, 16)                      # fotograma 0 del video (la fecha va impresa en la imagen)
FUENTE = ("NASA Scientific Visualization Studio · SVS 5176 «Sea Surface Temperature Anomaly» (Earth Information Center), "
          "datos JPL MUR SST")

# Mapa equirrectangular de 4096×2048 con longitud 0°–360°E y latitud 90°N–90°S.
# Recorte = mismo recuadro que usa el analizador: 140°–70°O, 15°N–25°S  →  797×455 px.
CROP = "crop=797:455:2503:853"
TAM = "scale=560:320:flags=lanczos"

# (id, n, titulo, color, protagonista)
DISCOS = [
    ("inv2024", "1", "Invierno 2024", "#38C6E8", "mama"),
    ("ver2025", "2", "Verano 2024–25", "#FF5A36", "inti"),
    ("inv2025", "3", "Invierno 2025", "#FFD447", "silbo"),
    ("ver2026", "4", "Verano 2025–26", "#7BE38A", "yaku"),
    ("inv2026", "5", "Invierno 2026", "#E0459B", "illapa"),
]
POR_DISCO, PASO, SALTO_DISCO = 6, 30, 180
MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def numero_de_fotograma(disco, i):
    return disco * SALTO_DISCO + i * PASO


def main():
    VIDEO.parent.mkdir(parents=True, exist_ok=True)
    if not VIDEO.exists():
        print("Descargando video del EIC…")
        urllib.request.urlretrieve(VIDEO_URL, VIDEO)
    carpeta = RAIZ / "data" / "fotogramas"
    carpeta.mkdir(parents=True, exist_ok=True)

    numeros = [numero_de_fotograma(d, i) for d in range(len(DISCOS)) for i in range(POR_DISCO)]
    seleccion = "+".join(f"eq(n\\,{n})" for n in numeros)
    temporal = carpeta / "_tmp_%02d.webp"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(VIDEO), "-vf",
                    f"select='{seleccion}',{CROP},{TAM}", "-fps_mode", "vfr", "-c:v", "libwebp", "-quality", "90", "-compression_level", "6", str(temporal)], check=True)

    manifiesto = []
    k = 0
    for d, (id_, n, titulo, color, prota) in enumerate(DISCOS):
        fotogramas = []
        for i in range(POR_DISCO):
            k += 1
            destino = carpeta / f"{id_}_{i}.webp"
            destino.unlink(missing_ok=True)
            (carpeta / f"_tmp_{k:02d}.webp").rename(destino)
            fecha = PRIMER_DIA + timedelta(days=numero_de_fotograma(d, i))
            fotogramas.append({"url": f"data/fotogramas/{destino.name}", "fecha": fecha.isoformat()})
        ini, fin = date.fromisoformat(fotogramas[0]["fecha"]), date.fromisoformat(fotogramas[-1]["fecha"])
        periodo = f"{MESES[ini.month - 1]} {ini.year} – {MESES[fin.month - 1]} {fin.year}"
        manifiesto.append({"id": id_, "n": n, "titulo": titulo, "periodo": periodo, "color": color,
                           "protagonista": prota, "fuente": FUENTE, "fotogramas": fotogramas})
        print(f"OK {titulo}: {periodo}")
    (RAIZ / "data" / "discos.json").write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
