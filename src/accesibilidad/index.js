// M5 · Accesibilidad, textos y narrativa. Contrato: docs/CONTRATOS.md
import { bus } from '../app/bus.js';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function montarAccesibilidad(contenedor) {
  const subtitulo = document.createElement('p');
  subtitulo.setAttribute('role', 'status');
  subtitulo.setAttribute('aria-live', 'polite');
  bus.on('voces', ({ columna, eventos }) => {
    const lon = Math.round(140 - (columna + 0.5) * 2.5);
    subtitulo.textContent = `[${lon}°O] ${eventos.join(' · ') || '…'}`;
    if (navigator.vibrate && eventos.some((e) => e.includes('Illapa'))) navigator.vibrate(120);
  });
  contenedor.appendChild(subtitulo);
}

export function describirFotograma(disco, f, a) {
  const [anio, mes] = disco.fotogramas[f].fecha.split('-').map(Number);
  const general = a.frio > a.calido ? 'Domina el agua más fría de lo normal: Mamacocha canta fuerte.'
    : a.extremo > 0.15 ? 'Una gran franja del océano está en rojo intenso: Inti e Illapa dominan.'
    : a.calido > 0.8 ? 'El océano está más cálido de lo normal.' : 'El océano está cerca de lo normal.';
  const costa = a.costa >= 2 ? `La costa del Perú está muy caliente (nivel ${a.costa.toFixed(1)} de 5): Silbo silba.` : 'La costa del Perú está fría o normal.';
  return `${disco.titulo}, ${MESES[mes - 1]} de ${anio}. ${general} ${Math.round(a.extremo * 100)} por ciento del mar visible tiene anomalías extremas. ${costa}`;
}

export function decir(texto) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-PE';
  speechSynthesis.speak(u);
}
