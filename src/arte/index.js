// M4 · Arte pixel y componentes visuales. Contrato: docs/CONTRATOS.md
// STUB: visor con cabezal, botones de disco y medidores en texto. Reemplazar con el kit retro del prototipo.
import { bus } from '../app/bus.js';

const BANDA = ['silbo', 'inti', 'mama', 'yaku', 'illapa'];

export function montarJukebox(contenedor, discos) {
  const botones = document.createElement('div');
  discos.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `${d.n} · ${d.titulo}`;
    b.addEventListener('click', () => bus.emit('disco:elegido', { disco: i }));
    botones.appendChild(b);
  });

  const play = document.createElement('button');
  play.type = 'button';
  play.textContent = 'Reproducir';
  play.addEventListener('click', () => bus.emit('play:toggle'));
  bus.on('estado', ({ reproduciendo }) => { play.textContent = reproduciendo ? 'Pausar' : 'Reproducir'; });

  const visor = document.createElement('div');
  visor.style.cssText = 'position:relative;max-width:560px';
  const img = document.createElement('img');
  img.style.cssText = 'width:100%;display:block;image-rendering:pixelated';
  const cabezal = document.createElement('div');
  cabezal.style.cssText = 'position:absolute;top:0;bottom:0;width:3.6%;border:2px solid #FFD447';
  visor.append(img, cabezal);

  bus.on('fotograma:listo', ({ disco, fotograma }) => {
    const f = discos[disco].fotogramas[fotograma];
    img.src = f.url;
    img.alt = `Anomalía de temperatura del mar, ${f.fecha}`;
  });
  bus.on('paso', ({ columna }) => { cabezal.style.left = `${(columna / 28) * 100}%`; });
  contenedor.append(botones, play, visor);
}

export function montarBanda(contenedor) {
  const lista = document.createElement('ul');
  const items = Object.fromEntries(BANDA.map((p) => {
    const li = document.createElement('li');
    lista.appendChild(li);
    return [p, li];
  }));
  bus.on('voces', ({ niveles }) => {
    for (const p of BANDA) items[p].textContent = `${p.toUpperCase()} ${'■'.repeat(Math.round(niveles[p] * 10))}`;
  });
  contenedor.appendChild(lista);
}
