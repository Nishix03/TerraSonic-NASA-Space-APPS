"""M1 · Descarga datos mensuales de NASA POWER (1981-2024) y genera data/nasa_power_monthly.json.

Uso:  python scripts/descargar_power.py   (solo usa la librería estándar)
"""
import json
import urllib.request
from pathlib import Path

LUGARES = {"chiclayo": (-6.77, -79.84), "galapagos": (-0.74, -90.31), "iquitos": (-3.75, -73.25)}
URL = ("https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR,T2M,RH2M"
       "&community=AG&longitude={lon}&latitude={lat}&start=1981&end=2024&format=JSON")


def descargar(lat, lon):
    with urllib.request.urlopen(URL.format(lat=lat, lon=lon), timeout=60) as respuesta:
        param = json.load(respuesta)["properties"]["parameter"]
    meses = sorted(k for k in param["PRECTOTCORR"] if not k.endswith("13"))  # "13" = promedio anual
    for k in meses:
        assert param["PRECTOTCORR"][k] != -999, f"dato faltante {k}"
    return {
        "p": [round(param["PRECTOTCORR"][k], 2) for k in meses],
        "t": [round(param["T2M"][k], 1) for k in meses],
        "h": [round(param["RH2M"][k]) for k in meses],
        "start": meses[0],
        "end": meses[-1],
    }


if __name__ == "__main__":
    salida = {nombre: descargar(*coords) for nombre, coords in LUGARES.items()}
    destino = Path(__file__).resolve().parent.parent / "data" / "nasa_power_monthly.json"
    destino.write_text(json.dumps(salida, separators=(",", ":")), encoding="utf-8")
    resumen = ", ".join(f"{k}: {len(v['p'])} meses" for k, v in salida.items())
    print(f"OK -> {destino} ({resumen})")
