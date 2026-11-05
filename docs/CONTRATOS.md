# Contratos entre módulos

Esto es lo **único** que un módulo puede usar de otro. Si algo cambia aquí, se avisa a todo el equipo y cambia en un PR propio.

## Bus de eventos (`src/app/bus.js`, dueño M6)

```js
import { bus } from '../app/bus.js';
bus.on('tick', (e) => { /* ... */ });
bus.emit('play:toggle');
```

| Evento | Quién emite | Datos (payload) | Quién escucha |
|---|---|---|---|
| `datos:listos` | M1 | `{ lugares: ['chiclayo','galapagos','iquitos'] }` | M6 |
| `play:toggle` | M4 (UI y teclado), M6 | — | M6 → llama a M2 |
| `seek` | M4, M3 (clic en el gráfico) | `{ i }` | M2, M3 |
| `tick` | M2 | `{ i, lugar, lluvia, temp, ratio, gotas, silba }` | M3, M4, M5 |
| `estado` | M2 | `{ reproduciendo: boolean }` | M4 (etiqueta del botón) |
| `capitulo` | M5 | `{ id, titulo, texto, narracion }` | M3 (panel), M4 (voz) |
| `opciones` | M6 (Laboratorio) | `{ escala, instrumento, alturaSigue, capas }` | M2 |
| `tema` | M4 | `{ contraste: boolean, grande: boolean }` | M3 (colores del canvas) |

`i` es el índice del mes: `0` = enero de 1981 y `527` = diciembre de 2024 (`año = 1981 + floor(i/12)`, `mes = i % 12`).

## M1 · `src/datos/index.js`

```js
export async function cargarSeries(): Promise<void>
export function getSerie(lugar: 'chiclayo'|'galapagos'|'iquitos'): Serie

type Serie = {
  lugar: string, nombre: string, lat: number, lon: number,
  lluvia: number[],   // mm/día, 528 valores (PRECTOTCORR)
  temp: number[],     // °C (T2M)
  humedad: number[],  // % (RH2M)
  ratio: number[],    // lluvia / mediana
  stats: { mediana, maxLluvia, tMin, tMax },
  anual: number[]     // promedio anual de lluvia, 44 valores
}
```

## M2 · `src/sonido/index.js`

```js
export function play(series: Serie[], desde: number): void   // 1 serie = historia, 3 = orquesta
export function pause(): void
export function seek(i: number): void
export function playStep(series: Serie[], i: number): void   // un solo mes (modo explorar)
export function setVelocidad(msPorMes: number): void           // 70 | 160 | 320
// Lee las opciones por el evento 'opciones'
```

Reglas de mapeo (no cambian sin acuerdo del equipo):
- gotas = `min(9, max(1, round(sqrt(ratio) * 2)))` si lluvia > 0,02.
- silba = `ratio >= 10 && lluvia >= 1`.
- tono de fondo = `55 Hz * 2^((T - tMin)/(tMax - tMin))`.

## M3 · `src/visual/index.js`

```js
export function montarHistoria(contenedor: HTMLElement, serie: Serie): void
export function montarOrquesta(contenedor: HTMLElement, series: Serie[]): void
```

## M4 · `src/accesibilidad/index.js`

```js
export function montarControles(contenedor: HTMLElement): void  // botones, slider, atajos
export function decir(texto: string): void                       // speechSynthesis es-PE
export function describirMes(serie: Serie, i: number): string    // texto para voz y subtítulo
```

## M5 · `src/historia/`

```js
// capitulos.json
[{ "id": "c1", "inicio": 0, "kicker": "Capítulo 1 · 1981–1996", "titulo": "...", "texto": "...", "narracion": "..." }]
// index.js
export async function cargarCapitulos(): Promise<Capitulo[]>
export function capituloEn(i: number): Capitulo
```

## M6 · `src/app/`

`main.js` es el único archivo que importa todos los módulos. `index.html` solo tiene los contenedores vacíos con estos `id`: `#controles`, `#historia`, `#orquesta`, `#laboratorio`, `#creditos`.
