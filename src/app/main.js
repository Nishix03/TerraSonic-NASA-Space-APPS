// M6 · Punto de entrada y reloj del escaneo. Único archivo que importa todos los módulos.
import { bus } from './bus.js';
import { cargarDiscos } from '../fotogramas/index.js';
import { analizar } from '../analizador/index.js';
import { iniciarAudio } from '../sonido/index.js';
import { montarJukebox, montarBanda } from '../arte/index.js';
import { montarAccesibilidad, describirFotograma, decir } from '../accesibilidad/index.js';

const COLUMNAS = 28;
const estado = { disco: 2, fotograma: 0, columna: -1, ms: 110, timer: null, analisis: null };

async function cargarFotograma(discos) {
  const f = discos[estado.disco].fotogramas[estado.fotograma];
  estado.analisis = await analizar(f.url);
  estado.columna = -1;
  bus.emit('fotograma:listo', { disco: estado.disco, fotograma: estado.fotograma, analisis: estado.analisis });
}

function detener() {
  clearInterval(estado.timer);
  estado.timer = null;
  bus.emit('estado', { reproduciendo: false });
}

function reproducir(discos) {
  iniciarAudio();
  bus.emit('estado', { reproduciendo: true });
  estado.timer = setInterval(async () => {
    estado.columna++;
    if (estado.columna < COLUMNAS) {
      bus.emit('paso', { disco: estado.disco, fotograma: estado.fotograma, columna: estado.columna, analisis: estado.analisis });
      return;
    }
    if (estado.fotograma >= discos[estado.disco].fotogramas.length - 1) return detener();
    estado.fotograma++;
    await cargarFotograma(discos);
  }, estado.ms);
}

async function iniciar() {
  const discos = await cargarDiscos();
  montarJukebox(document.getElementById('jukebox'), discos);
  montarBanda(document.getElementById('banda'));
  montarAccesibilidad(document.getElementById('accesibilidad'));

  bus.on('play:toggle', () => (estado.timer ? detener() : reproducir(discos)));
  bus.on('disco:elegido', async ({ disco }) => { detener(); estado.disco = disco; estado.fotograma = 0; await cargarFotograma(discos); });
  bus.on('fotograma:elegido', async ({ fotograma }) => {
    detener(); estado.fotograma = fotograma; await cargarFotograma(discos);
    decir(describirFotograma(discos[estado.disco], estado.fotograma, estado.analisis));
  });
  bus.on('velocidad', ({ msPorColumna }) => { estado.ms = msPorColumna; });
  await cargarFotograma(discos);
}

iniciar();
