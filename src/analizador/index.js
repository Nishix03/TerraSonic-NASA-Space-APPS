// M2 · Analizador visual. Contrato: docs/CONTRATOS.md
// Calibrado con la escala de color de las visualizaciones del EIC (SVS 5176). M2 la mejora y la testea.
const ANCHO = 140, ALTO = 80, COLS = 28, FILAS = 16, CELDA = 5;
const COSTA = { x0: 116, x1: 128, y0: 36, y1: 66 }; // costa norte del Perú (82°–76°O, 3°–18°S)

// Escala de color oficial del EIC (SVS 5176): anomalía de −4 °C a +4 °C, una muestra cada 0,25 °C.
const ESCALA = [[0,35,63],[0,44,79],[0,53,97],[1,67,119],[0,82,142],[1,100,168],[5,117,191],[3,129,203],[0,139,208],
  [0,149,215],[51,161,220],[90,175,229],[121,190,232],[145,201,238],[166,211,244],[185,219,246],[227,227,229],
  [255,227,187],[250,216,168],[243,200,147],[234,184,131],[225,169,118],[213,151,102],[203,134,92],[194,116,80],
  [185,90,68],[170,70,55],[154,55,50],[138,47,46],[123,43,46],[105,36,41],[86,30,33],[74,25,28]];

// Tierra en los fotogramas del EIC: gris oscuro sin color (el océano casi neutro es muy claro).
export function esTierra(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx - mn < 22 && mx < 175;
}

// Nivel −5…+5 (= anomalía en °C × 1,25) por el color más cercano de la escala oficial.
export function nivel(r, g, b) {
  let mejor = 0, dmin = Infinity;
  for (let i = 0; i < ESCALA.length; i++) {
    const [er, eg, eb] = ESCALA[i];
    const d = (r - er) ** 2 + (g - eg) ** 2 + (b - eb) ** 2;
    if (d < dmin) { dmin = d; mejor = i; }
  }
  return (mejor - 16) / 4 * 1.25;
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
          if (px[i + 3] < 128 || esTierra(px[i], px[i + 1], px[i + 2])) continue; // tierra
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
