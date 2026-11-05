// M5 · Historia. Contrato: docs/CONTRATOS.md
import { bus } from '../app/bus.js';

let capitulos = [];
let actual = null;

export async function cargarCapitulos() {
  capitulos = await (await fetch('src/historia/capitulos.json')).json();
  bus.on('tick', ({ i }) => {
    const c = capituloEn(i);
    if (c && c !== actual) { actual = c; bus.emit('capitulo', c); }
  });
  return capitulos;
}

export function capituloEn(i) {
  return capitulos.reduce((acc, c) => (i >= c.inicio ? c : acc), capitulos[0]);
}
