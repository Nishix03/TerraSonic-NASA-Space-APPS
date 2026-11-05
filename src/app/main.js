// Punto de entrada. Único archivo que importa todos los módulos. Dueño: M6.
import { bus } from './bus.js';
import { cargarSeries, getSerie } from '../datos/index.js';
import * as sonido from '../sonido/index.js';
import { montarHistoria } from '../visual/index.js';
import { montarControles } from '../accesibilidad/index.js';
import { cargarCapitulos } from '../historia/index.js';

async function iniciar() {
  await Promise.all([cargarSeries(), cargarCapitulos()]);
  const chiclayo = getSerie('chiclayo');
  montarControles(document.getElementById('controles'));
  montarHistoria(document.getElementById('historia'), chiclayo);

  let reproduciendo = false;
  let ultimo = 0;
  bus.on('tick', ({ i }) => { ultimo = i; });
  bus.on('estado', (e) => { reproduciendo = e.reproduciendo; });
  bus.on('play:toggle', () => (reproduciendo ? sonido.pause() : sonido.play([chiclayo], ultimo)));
  bus.emit('datos:listos', { lugares: ['chiclayo', 'galapagos', 'iquitos'] });
}

iniciar();
