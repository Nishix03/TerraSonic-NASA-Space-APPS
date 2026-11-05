// Bus de eventos: el ÚNICO punto de contacto entre módulos (ver docs/CONTRATOS.md). Dueño: M6.
const listeners = new Map();

export const bus = {
  on(evento, fn) {
    if (!listeners.has(evento)) listeners.set(evento, new Set());
    listeners.get(evento).add(fn);
    return () => listeners.get(evento).delete(fn);
  },
  emit(evento, payload) {
    (listeners.get(evento) || []).forEach((fn) => {
      try { fn(payload); } catch (err) { console.error(`[bus] error en "${evento}":`, err); }
    });
  },
};
