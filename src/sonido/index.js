// M3 · Motor de sonido: la banda. Contrato: docs/CONTRATOS.md
// STUB: calcula los niveles de cada personaje y emite 'voces', todavía sin audio.
// El audio funcionando (Web Audio) está en el prototipo: copiar tone(), noiseBurst(), whistle() y step().
import { bus } from '../app/bus.js';
import { columna } from '../analizador/index.js';

const silenciados = new Set();
let ctx = null;

export function iniciarAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
}

bus.on('silenciar', ({ personaje, silenciado }) => (silenciado ? silenciados.add(personaje) : silenciados.delete(personaje)));

bus.on('paso', ({ columna: c, analisis }) => {
  const info = columna(analisis, c);
  const niveles = {
    inti: Math.min(1, info.calido / 3),
    mama: Math.min(1, info.frio / 2),
    yaku: Math.min(1, info.fuertes.length / 10),
    illapa: info.extremo >= 0.25 ? Math.min(1, info.extremo * 1.5) : 0,
    silbo: c === 23 && analisis.costa >= 2 ? Math.min(1, analisis.costa / 5) : 0,
  };
  for (const p of silenciados) niveles[p] = 0;
  const eventos = [];
  if (niveles.illapa) eventos.push('¡Illapa truena!');
  if (niveles.silbo) eventos.push('Silbo silba: la costa del Perú está caliente');
  bus.emit('voces', { columna: c, niveles, eventos });
});
