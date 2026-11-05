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
| `datos:subidos` | M4 (zona «Tus datos») | `{ archivo: File, modo: 'paleta'\|'libre' }` | M6 → llama a M2 y emite `fotograma:listo` |
| `play:toggle` | M4, M5 | — | M6 |
| `fotograma:listo` | M6 | `{ disco, fotograma, analisis }` | M4, M5 |
| `paso` | M6 (reloj del escaneo) | `{ disco, fotograma, columna, analisis }` | M3, M4 |
| `voces` | M3 | `{ columna, niveles: {silbo,inti,mama,yaku,illapa}, eventos: ['Silbo silba', ...], acorde: 'Lam', disparos: { silbo, inti, mama, yaku, illapa }, trueno }` | M4 (medidores, avatares), M5 (subtítulo, vibración) |
| `estado` | M6 | `{ reproduciendo }` | M4, M5 |
| `silenciar` | M4, M5 | `{ personaje, silenciado }` | M3 |
| `tema` | M5 | `{ contraste, grande, legible }` | M4 |
| `velocidad` | M4 | `{ msPorColumna }` (70, 110 o 180) | M6 |
| `pagina:cambio` | M4 (pestañas) | `{ desde, hacia }` | M6 (router: cambia el contenido a ~0,5 s), M4 (transición), M5 (`aria-live`) |
| `motor:cambio` | M4 (tarjeta «Motor de sonido») | `{ motor: 'melodia'\|'datos' }` | M3 |
| `banda:preset` | M4 (botones), M6 (al elegir disco) | `{ modo: 'protagonista'\|'completa'\|'apagada', disco }` | M3 (enciende y apaga voces) |

## M1 · `src/fotogramas/index.js`
```js
export async function cargarDiscos(): Promise<Disco[]>
type Disco = { id, n, titulo, periodo, color, fuente, protagonista: 'mama'|'inti'|'silbo'|'yaku'|'illapa', fotogramas: [{ url, fecha: 'YYYY-MM-DD' }] }  // 6 por disco
```

## M2 · `src/analizador/index.js`
```js
export async function analizar(url: string): Promise<Analisis>
type Analisis = { celdas: (number|null)[448],   // 28 columnas × 16 filas, nivel −5…+5, null = tierra
                  calido, frio, extremo, costa } // promedios del fotograma
export function columna(a: Analisis, c: number): { calido, frio, fuertes: [fila, nivel][], extremo, celdas }
export function nivel(r, g, b): number          // clasificador de color (paleta NASA)
export function nivelLibre(r, g, b): number     // clasificador de color libre (cualquier imagen)
export async function analizarArchivo(file: File, modo: 'paleta'|'libre'): Promise<{ analisis: Analisis, url: string, nombre: string }>   // imagen o CSV; máx. 8 MB
export function analizarSerie(valores: number[]): Analisis   // 28 columnas: sobre la media = cálido, bajo la media = frío
```
Recuadro de la costa (Silbo): píxeles x 116–128 e y 36–66 de la imagen reducida a 140×80.

## M3 · `src/sonido/index.js`
```js
export function iniciarAudio(): void              // llamar tras un clic (política del navegador)
// Escucha 'paso', 'silenciar' y 'motor:cambio'. Emite 'voces'.
// Motores: 'melodia' (por defecto: tonalidad, tempo y progresión por personaje; ver docs/PLAN.md §5.1) y 'datos' (traducción literal).
// Perfil musical = el del protagonista del disco: { tonalidad, modo, tempo, progresión }. Todas las voces tocan en esa armonía.
```
Reglas musicales (cambian solo con acuerdo del equipo): ver `docs/PLAN.md` §5 y §5.1.

## M4 · `src/arte/index.js`
```js
export function montarJukebox(contenedor: HTMLElement, discos: Disco[]): void
export function montarBanda(contenedor: HTMLElement): void
export function montarEscenario(contenedor: HTMLElement): void   // escucha 'voces', 'silenciar' y 'banda:preset'
export function montarAvatares(contenedor: HTMLElement): void   // escucha 'voces', 'fotograma:listo' y 'tema'
// Avatares: assets/avatares/<silbo|inti|mama|yaku|illapa>/ con cuerpo.png, instrumento.png, particula.png, busto.png, icono.png,
// modelo/capas/*.png y poses/*.png (nombres y medidas en docs/PLAN.md §9.6.6). Atrezo (satélite, atril, micrófono): assets/avatares/atrezo/
// y assets/avatares/avatares.json: { id, nombre, alt, ficha, modelo: { capas[], tam: '768x1152' }, sprite: 'sprite.png (4 frames 32x32)', estados: ['calmo','activo','intenso'] }
// El modelo detallado (~400x600 px) va junto al fotograma y es el protagonista del disco (`disco.protagonista`); el sprite 32x32 va en el mezclador de la banda y en la tira.
// Estado por nivel de 'voces': calmo < 0,15 · activo 0,15–0,6 · intenso > 0,6
// Animaciones (clips) por personaje: docs/PLAN.md §4.3. El escenario y el protagonista usan el MISMO estado: nivel, `disparos`, `trueno` y ON/OFF.
```

## M5 · `src/accesibilidad/index.js`
```js
export function montarAccesibilidad(contenedor: HTMLElement): void   // teclado, aria-live, botones de tema
export function describirFotograma(disco: Disco, f: number, a: Analisis): string
export function decir(texto: string): void                          // speechSynthesis es-PE
```

## M6 · `src/app/`
`main.js` es el único archivo que importa todos los módulos. `index.html` tiene los contenedores `#jukebox`, `#banda`, `#metodo`, `#accesibilidad` y `#creditos`.
