// M2 · Motor de sonificación. Contrato: docs/CONTRATOS.md
// STUB: emite 'tick' sin sonido para que los demás módulos puedan integrar desde la hora 0.
// Referencia de sonido funcionando con Web Audio: ver el prototipo enlazado en README.
import { bus } from '../app/bus.js';

let timer = null;
let msPorMes = 160;

export function play(series, desde = 0) {
  pause();
  let i = desde;
  bus.emit('estado', { reproduciendo: true });
  timer = setInterval(() => {
    if (i >= series[0].lluvia.length) return pause();
    playStep(series, i++);
  }, msPorMes);
}

export function pause() {
  if (timer) clearInterval(timer);
  timer = null;
  bus.emit('estado', { reproduciendo: false });
}

export function seek(i) { bus.emit('seek', { i }); }

export function playStep(series, i) {
  for (const s of series) {
    const lluvia = s.lluvia[i], ratio = s.ratio[i];
    const gotas = lluvia > 0.02 ? Math.min(9, Math.max(1, Math.round(Math.sqrt(ratio) * 2))) : 0;
    bus.emit('tick', { i, lugar: s.lugar, lluvia, temp: s.temp[i], ratio, gotas, silba: ratio >= 10 && lluvia >= 1 });
  }
}

export function setVelocidad(ms) { msPorMes = ms; }
