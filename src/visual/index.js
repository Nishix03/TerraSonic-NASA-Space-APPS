// M3 · Visualización. Contrato: docs/CONTRATOS.md
// STUB: muestra el mes actual en texto. Reemplazar por el canvas.
import { bus } from '../app/bus.js';

export function montarHistoria(contenedor, serie) {
  const p = document.createElement('p');
  contenedor.appendChild(p);
  bus.on('tick', ({ i, lluvia, ratio }) => {
    p.textContent = `${1981 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')} · ${lluvia.toFixed(1)} mm/día · ×${ratio.toFixed(0)}`;
  });
}

export function montarOrquesta(contenedor, series) { /* M3: vista de 3 lugares */ }
