// M4 · Accesibilidad y multisensorial. Contrato: docs/CONTRATOS.md
import { bus } from '../app/bus.js';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function montarControles(contenedor) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = 'Escuchar';
  boton.addEventListener('click', () => bus.emit('play:toggle'));
  bus.on('estado', ({ reproduciendo }) => { boton.textContent = reproduciendo ? 'Pausar' : 'Escuchar'; });

  const subtitulo = document.createElement('p');
  subtitulo.setAttribute('role', 'status');
  subtitulo.setAttribute('aria-live', 'polite');
  bus.on('tick', ({ i, lluvia, gotas, silba }) => {
    const sonido = silba ? 'el huaco silba, lluvia extrema' : gotas === 0 ? 'silencio' : gotas >= 4 ? 'aguacero de gotas' : 'gotas sueltas';
    subtitulo.textContent = `[${MESES[i % 12]} ${1981 + Math.floor(i / 12)}] ${sonido} (${lluvia.toFixed(1)} mm/día)`;
  });
  contenedor.append(boton, subtitulo);
}

export function decir(texto) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-PE';
  speechSynthesis.speak(u);
}

export function describirMes(serie, i) {
  const r = serie.lluvia[i];
  const ratio = serie.ratio[i];
  const comparacion = ratio >= 2 ? `${Math.round(ratio)} veces lo normal` : 'dentro de lo normal';
  return `${MESES[i % 12]} de ${1981 + Math.floor(i / 12)}. Lluvia de ${r.toFixed(1)} milímetros al día, ${comparacion}. Temperatura de ${serie.temp[i]} grados.`;
}
