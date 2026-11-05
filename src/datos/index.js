// M1 · Datos NASA. Contrato: docs/CONTRATOS.md
const INFO = {
  chiclayo: { nombre: 'Chiclayo, Lambayeque', lat: -6.77, lon: -79.84 },
  galapagos: { nombre: 'Puerto Ayora, Galápagos', lat: -0.74, lon: -90.31 },
  iquitos: { nombre: 'Iquitos, Loreto', lat: -3.75, lon: -73.25 },
};
const series = {};

export async function cargarSeries() {
  const crudo = await (await fetch('data/nasa_power_monthly.json')).json();
  for (const [lugar, d] of Object.entries(crudo)) {
    const ordenada = [...d.p].sort((a, b) => a - b);
    const mediana = Math.max(ordenada[Math.floor(ordenada.length / 2)], 0.05);
    const anual = [];
    for (let y = 0; y < d.p.length / 12; y++) anual.push(d.p.slice(y * 12, y * 12 + 12).reduce((a, b) => a + b, 0) / 12);
    series[lugar] = {
      lugar, ...INFO[lugar], lluvia: d.p, temp: d.t, humedad: d.h,
      ratio: d.p.map((v) => v / mediana),
      stats: { mediana, maxLluvia: Math.max(...d.p), tMin: Math.min(...d.t), tMax: Math.max(...d.t) },
      anual,
    };
  }
}

export function getSerie(lugar) {
  if (!series[lugar]) throw new Error(`Serie no cargada: ${lugar}`);
  return series[lugar];
}
