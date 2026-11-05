// M2 · Analizador visual. Contrato: docs/CONTRATOS.md
// Versión inicial portada del prototipo y calibrada con la paleta GHRSST MUR. M2 la mejora y la testea.
const ANCHO = 140, ALTO = 80, COLS = 28, FILAS = 16, CELDA = 5;
const COSTA = { x0: 116, x1: 128, y0: 36, y1: 66 }; // costa norte del Perú (82°–76°O, 3°–18°S)

function hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, mx ? d / mx : 0, mx];
}

export function nivel(r, g, b) {
  const [h, s, v] = hsv(r, g, b);
  if (s < 0.15) return 0;
  if (v < 0.6 && (h < 20 || h > 330)) return 5;
  if (h >= 300 && h < 345) return 4.5;
  if (h >= 345 || h < 7) return 4;
  if (h < 27) return 3;
  if (h < 43) return 2;
  if (h < 53) return 1;
  if (h < 75) return s > 0.3 ? 0.5 : 0;
  if (h < 118) return -0.5;
  if (h < 145) return -1;
  if (h < 170) return -2;
  if (h < 190) return -3;
  if (h < 250) return -4;
  return -5;
}

function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    img.src = url;
  });
}

export async function analizar(url) {
  const img = await cargarImagen(url);
  const canvas = document.createElement('canvas');
  canvas.width = ANCHO; canvas.height = ALTO;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, ANCHO, ALTO);
  const px = ctx.getImageData(0, 0, ANCHO, ALTO).data;

  const celdas = [];
  let calido = 0, frio = 0, extremos = 0, total = 0, costaSuma = 0, costaN = 0;
  for (let fy = 0; fy < FILAS; fy++) {
    for (let cx = 0; cx < COLS; cx++) {
      let suma = 0, n = 0;
      for (let y = fy * CELDA; y < (fy + 1) * CELDA; y++) {
        for (let x = cx * CELDA; x < (cx + 1) * CELDA; x++) {
          const i = (y * ANCHO + x) * 4;
          if (px[i + 3] < 128) continue; // transparente = tierra
          const v = nivel(px[i], px[i + 1], px[i + 2]);
          suma += v; n++; total++;
          if (v > 0) calido += v; else frio -= v;
          if (v >= 4) extremos++;
          if (x >= COSTA.x0 && x <= COSTA.x1 && y >= COSTA.y0 && y <= COSTA.y1) { costaSuma += v; costaN++; }
        }
      }
      celdas.push(n > 6 ? suma / n : null);
    }
  }
  return {
    celdas,
    calido: calido / total,
    frio: frio / total,
    extremo: extremos / total,
    costa: costaN ? costaSuma / costaN : 0,
  };
}

export function columna(a, c) {
  let calido = 0, frio = 0, extremos = 0, n = 0;
  const fuertes = [];
  for (let f = 0; f < FILAS; f++) {
    const v = a.celdas[f * COLS + c];
    if (v === null) continue;
    n++;
    if (v > 0) calido += v; else frio -= v;
    if (Math.abs(v) >= 2) fuertes.push([f, v]);
    if (v >= 4.4) extremos++;
  }
  return { calido: n ? calido / n : 0, frio: n ? frio / n : 0, fuertes, extremo: n ? extremos / n : 0, celdas: n };
}
