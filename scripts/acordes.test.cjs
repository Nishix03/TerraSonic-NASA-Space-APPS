const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const html = readFileSync(path.join(root, 'prototipos/I11-eic/Main.dc.html'), 'utf8');
const script = html.match(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
const comparison = readFileSync(path.join(root, 'prueba-acordes.html'), 'utf8');
const reference = vm.createContext({});
vm.runInContext(comparison.match(/<script>([\s\S]*?)var NAMES/)[1], reference);
const plain = value => JSON.parse(JSON.stringify(value));

function runtime() {
  const timers = new Map();
  let nextTimer = 0;
  const context = vm.createContext({
    DCLogic: class {
      setState(patch, done) { Object.assign(this.state, patch); done?.(); }
    },
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(script + '\nthis.App = Component;', context);
  return { context, timers };
}

test('los seis perfiles y símbolos coinciden con Ahora en el adjunto original', () => {
  const { context } = runtime();
  assert.deepEqual(plain(context.MUSIC), plain(reference.NEW.MUSIC));
  assert.deepEqual(plain(context.QUAL), plain(reference.NEW.QUAL));
  assert.deepEqual(plain(context.SUF), plain(reference.NEW.SUF));
  assert.deepEqual(plain(context.QUAL.dim), [0, 3, 6]);
  assert.deepEqual(plain(context.QUAL.sus4), [0, 5, 7]);
  const profiles = Object.values(context.MUSIC).flatMap(p => p.dark ? [p, p.dark] : [p]);
  assert.equal(profiles.length, 6);
});

test('el motor ejecuta los acordes suministrados y vuelve a la tónica en el cierre', () => {
  const { context } = runtime();
  const analysis = { warm: 2, cold: 1, coast: 3, hot: 0.3, cells: Array(448).fill(3) };
  const profiles = Object.entries(reference.NEW.MUSIC).flatMap(([key, p]) =>
    [{ key, expected: p, warm: false }, ...(p.dark ? [{ key, expected: p.dark, warm: true }] : [])]);

  for (const { key, expected, warm } of profiles) {
    const app = new context.App({});
    app.state.leadOverride = key;
    app.state.mute = app.allMute(false);
    app.ac = { currentTime: 1 };
    app.cur = () => ({ ...analysis, warm: warm ? 3 : 1 });
    app.leadNote = () => {};
    const played = [];
    for (const method of ['note', 'marimba', 'flute', 'droplet', 'timpani']) {
      app[method] = (...args) => {
        const midi = method === 'note' ? args[1] : args[0];
        assert.ok(Number.isFinite(midi) && midi >= 0 && midi <= 127,
          `${key}: nota MIDI inválida en ${method}: ${midi}`);
        played.push({ method, args });
      };
    }
    app.noiseBurst = () => {};

    for (let col = 0; col < 28; col++) {
      const begin = played.length;
      app.stepMelody(col);
      // La comparación define seis bloques de cuatro columnas y un cierre en I.
      const index = col >= 24 ? 0 : Math.floor(col / 4) % expected.prog.length;
      const [offset, quality] = expected.prog[index];
      const chordRoot = expected.root + offset;
      const label = reference.NEW.NOTE_ES[chordRoot % 12] + reference.NEW.SUF[quality];
      assert.equal(app.state.chord, label, `${key}, columna ${col}`);
      if (col % 4 === 0) {
        const calls = played.slice(begin).filter(call => call.method === 'note');
        assert.equal(calls[0].args[0], 'sine');
        assert.equal(calls[0].args[1], chordRoot - 12, `${key}: raíz del bajo`);
        assert.deepEqual(calls.slice(1).map(call => call.args[1]),
          plain(reference.NEW.QUAL[quality]).map(interval => chordRoot + interval),
          `${key}: notas del acorde ${label}`);
      }
    }
    for (const method of ['note', 'marimba', 'flute', 'droplet', 'timpani']) {
      assert.ok(played.some(call => call.method === method), `${key}: no tocó ${method}`);
    }
  }
});

test('el selector recorre toda la banda, conserva modo automático y la variante cálida de Yaku', () => {
  const { context } = runtime();
  const app = new context.App({});
  app.cur = () => ({ warm: 3, cold: 0 });
  for (const key of Object.keys(context.MUSIC)) {
    app.selectLead(key);
    assert.equal(app.leadChar(), key);
    assert.equal(app.state.mute[key], false);
  }
  app.selectLead('yaku');
  assert.equal(app.profile(), context.MUSIC.yaku.dark);
  app.cur = () => ({ warm: 0, cold: 2 });
  assert.equal(app.profile(), context.MUSIC.yaku);
  const first = app.leadChar();
  const seen = new Set();
  for (let i = 0; i < 5; i++) { seen.add(app.leadChar()); app.cycleLead(1); }
  assert.equal(seen.size, 5);
  assert.equal(app.leadChar(), first);
  app.cycleLead(-1);
  app.cycleLead(1);
  assert.equal(app.leadChar(), first);
  app.selectLead('auto');
  assert.equal(app.state.leadOverride, null);
  app.state.disc = 0;
  assert.equal(app.leadChar(), 'mama');
  app.state.disc = 1;
  assert.equal(app.leadChar(), 'inti');
});

test('la animación del protagonista sigue sus notas y vuelve al reposo', () => {
  const { context, timers } = runtime();
  const app = new context.App({});
  app.state.leadOverride = 'inti';
  app.state.playing = true;
  app.state.mute.inti = false;
  app.ac = { currentTime: 1 };
  app.bandReduced = () => false;
  app.leadNote('mama', 1.1, 0.4);
  assert.equal(timers.size, 0, 'otro músico no anima al protagonista');

  function runTimer(id) {
    const timer = timers.get(id);
    timers.delete(id);
    timer.fn();
    return timer.delay;
  }
  for (const beat of ['beat-a', 'beat-b']) {
    app.leadNote('inti', 1.1, 0.4);
    const onset = [...app.leadTimers][0];
    assert.ok(Math.abs(runTimer(onset) - 100) < 0.001);
    const active = app.leadInfo({ fg: '#fff' });
    assert.equal(active.state, 'tocando');
    assert.ok(active.cls.includes(beat));
    assert.equal(active.fDur, '0.4s');
    assert.equal(runTimer(app.leadRestTimer), 400);
    assert.equal(app.state.leadPulse, null);
    assert.equal(app.leadInfo({ fg: '#fff' }).state, 'calmo');
  }
});
