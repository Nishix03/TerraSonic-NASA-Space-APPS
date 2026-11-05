# Contratos entre módulos

Esto es lo **único** que un módulo puede usar de otro. Si algo cambia aquí, se avisa a todo el equipo y cambia en un PR propio.

## Bus de eventos (`src/app/bus.js`, dueño M6)

```js
import { bus } from '../app/bus.js';
bus.on('paso', (e) => { /* ... */ });
bus.emit('play:toggle');
```

| Evento | Quién emite | Datos (payload) | Quién escucha |
|---|---|---|---|
| `disco:elegido` | M4 (UI), M5 (teclas 1–5) | `{ disco }` | M6 |
| `fotograma:elegido` | M4 (tira), M5 (←/→) | `{ fotograma }` | M6 |
| `play:toggle` | M4, M5 | — | M6 |
| `fotograma:listo` | M6 | `{ disco, fotograma, analisis }` | M4, M5 |
| `paso` | M6 (reloj del escaneo) | `{ disco, fotograma, columna, analisis }` | M3, M4 |
| `voces` | M3 | `{ columna, niveles: {silbo,inti,mama,yaku,illapa}, eventos: ['Silbo silba', ...] }` | M4 (medidores, sprites), M5 (subtítulo, vibración) |
| `estado` | M6 | `{ reproduciendo }` | M4, M5 |
| `silenciar` | M4, M5 | `{ personaje, silenciado }` | M3 |
| `tema` | M5 | `{ contraste, grande, legible }` | M4 |
| `velocidad` | M4 | `{ msPorColumna }` (70, 110 o 180) | M6 |

## M1 · `src/fotogramas/index.js`
```js
export async function cargarDiscos(): Promise<Disco[]>
type Disco = { id, n, titulo, periodo, color, fuente, fotogramas: [{ url, fecha: 'YYYY-MM-DD' }] }  // 6 por disco
```

## M2 · `src/analizador/index.js`
```js
export async function analizar(url: string): Promise<Analisis>
type Analisis = { celdas: (number|null)[448],   // 28 columnas × 16 filas, nivel −5…+5, null = tierra
                  calido, frio, extremo, costa } // promedios del fotograma
export function columna(a: Analisis, c: number): { calido, frio, fuertes: [fila, nivel][], extremo, celdas }
export function nivel(r, g, b): number          // clasificador de color
```
Recuadro de la costa (Silbo): píxeles x 116–128 e y 36–66 de la imagen reducida a 140×80.

## M3 · `src/sonido/index.js`
```js
export function iniciarAudio(): void              // llamar tras un clic (política del navegador)
// Escucha 'paso' y 'silenciar'. Emite 'voces'.
```
Reglas musicales (cambian solo con acuerdo del equipo): ver `docs/PLAN.md` §5.

## M4 · `src/arte/index.js`
```js
export function montarJukebox(contenedor: HTMLElement, discos: Disco[]): void
export function montarBanda(contenedor: HTMLElement): void
// Sprites: assets/sprites/<silbo|inti|mama|yaku|illapa>.png, hoja horizontal de 4 frames de 32×32
```

## M5 · `src/accesibilidad/index.js`
```js
export function montarAccesibilidad(contenedor: HTMLElement): void   // teclado, aria-live, botones de tema
export function describirFotograma(disco: Disco, f: number, a: Analisis): string
export function decir(texto: string): void                          // speechSynthesis es-PE
```

## M6 · `src/app/`
`main.js` es el único archivo que importa todos los módulos. `index.html` tiene los contenedores `#jukebox`, `#banda`, `#metodo`, `#accesibilidad` y `#creditos`.
