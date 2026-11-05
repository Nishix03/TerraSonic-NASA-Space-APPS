# Silbador

> Hace más de 1500 años, el agua ya cantaba en el norte del Perú. Ahora hacemos cantar los datos de la NASA.

Proyecto para **NASA Space Apps Challenge 2026 · Chiclayo · Reto 5 (Sonificación)**.

**Silbador** convierte 44 años de lluvia y temperatura (NASA POWER, 1981–2024) en sonido. El hilo conductor son los **huacos silbadores** moche y lambayeque, vasijas que silban cuando el agua se mueve dentro. El objetivo es que cualquiera, incluso una persona ciega, pueda *escuchar* El Niño en Chiclayo:

- Lluvia → gotas (escala pentatónica andina)
- Temperatura → tono de fondo
- Lluvia ≥ 10 veces lo normal → **el huaco silba**

| | |
|---|---|
| Plan de desarrollo | [`docs/PLAN.md`](docs/PLAN.md) |
| Contratos entre módulos | [`docs/CONTRATOS.md`](docs/CONTRATOS.md) |
| Prototipo interactivo (boceto) | https://claude.ai/artifact/L5G8i3kpm4XSqQgzxBs7FU *(privado: el dueño debe compartirlo)* |
| Uso de IA | [`docs/USO_DE_IA.md`](docs/USO_DE_IA.md) |
| Créditos y repos reutilizados | [`docs/CREDITOS.md`](docs/CREDITOS.md) |

## Estructura y dueños

| Carpeta | Módulo | Dueño |
|---|---|---|
| `data/`, `scripts/`, `src/datos/` | M1 · Datos NASA | [Miembro 1] |
| `src/sonido/` | M2 · Motor de sonificación | [Miembro 2] |
| `src/visual/` | M3 · Visualización | [Miembro 3] |
| `src/accesibilidad/` | M4 · Accesibilidad y multisensorial | [Miembro 4] |
| `src/historia/`, `docs/pitch/` | M5 · Historia y pitch | [Miembro 5] |
| `index.html`, `src/app/`, `.github/` | M6 · App, integración y despliegue | [Miembro 6] |

## Cómo correrlo

No hay que instalar nada ni compilar. Basta con un servidor estático:

```bash
python -m http.server 8000
```

Luego abre http://localhost:8000. También funciona con la extensión Live Server de VS Code.

## Cómo trabajamos

1. Cada quien trabaja **solo en su carpeta**, en la rama `mod/<módulo>`.
2. Entre módulos solo se usa lo que está en `docs/CONTRATOS.md` y el bus de eventos.
3. Cada PR lo revisa otra persona y se prueba en el navegador (también el código generado con IA).
4. Cada uso de IA se anota en `docs/USO_DE_IA.md`.

## Datos

NASA POWER: https://power.larc.nasa.gov (parámetros PRECTOTCORR, T2M y RH2M, mensual). Para regenerarlos:

```bash
python scripts/descargar_power.py
```
