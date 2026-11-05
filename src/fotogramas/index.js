// M1 · Fotogramas EIC. Contrato: docs/CONTRATOS.md
export async function cargarDiscos() {
  const respuesta = await fetch('data/discos.json');
  if (!respuesta.ok) throw new Error('No se pudo cargar data/discos.json');
  return respuesta.json();
}
