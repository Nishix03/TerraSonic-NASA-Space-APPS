// Run with node scripts/test_guides.cjs [path/to/generated/index.html].
// Exercises the actual component with a minimal DOM boundary, without dependencies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, '../prototipos/I11-eic/Main.dc.html'), 'utf8');
const source = html.match(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];

test('the comparison uses the same valid sea cells, regions and note scale for both dates', () => {
  const { context } = setup();
  const a = Array(448).fill(null);
  const b = Array(448).fill(null);
  a[0] = 5; // The second map has no data here.
  a[1] = -3; b[1] = 1;
  const coastalCell = 7 * 28 + 23;
  a[coastalCell] = 1; b[coastalCell] = 1;
  const whole = context.compareTemperature(a, b, 'all');
  assert.equal(whole.answer, 'B');
  assert.deepEqual(Array.from(whole.levels), [-1, 1]);
  assert.equal(whole.tones[0][0], -3);
  assert.equal(whole.tones[1][0], 1);
  assert.equal(whole.tones[0][1], null);
  assert.equal(whole.tones[1][1], null);
  const coastal = context.compareTemperature(a, b, 'coast');
  assert.equal(coastal.answer, 'similar');
  assert.deepEqual(Array.from(coastal.levels), [1, 1]);
  assert.equal(context.compareTemperature(a, Array(448).fill(null), 'all'), null);
  assert(context.learningFrequency(-3) < context.learningFrequency(0));
  assert(context.learningFrequency(0) < context.learningFrequency(3));
  assert.equal(context.learningFrequency(5), context.learningFrequency(50));
});

test('Method 02 preserves the ten legend mappings and translates its explanatory content without resetting state', () => {
  const { component: c } = setup();
  c.state.tab = 'how'; c.state.sub = 1;
  const preserved = () => JSON.stringify(['tab','sub','disc','frame','col','playing','mute','custom','an','tour'].map(k => c.state[k]));
  const before = preserved();
  const expected = [
    ['+5','#7A0F1E','Illapa'], ['+4,5','#C21F7A','Illapa'],
    ['+4','#E8283A','Inti · Yaku'], ['+3','#FF6A2B','Inti · Yaku'],
    ['+2','#FFA62B','Inti · Yaku'], ['+1','#FFD447','Inti'],
    ['0','#7E849E','silencio'], ['−1','#7BE38A','Mamacocha'],
    ['−2 / −3','#38C6E8','Mamacocha · Yaku'], ['−4 / −5','#2F4FD0','Mamacocha · Yaku']
  ];
  const es = c.renderVals();
  assert.deepEqual(JSON.parse(JSON.stringify(es.legend.map(l => [l.v,l.c,l.who]))), expected);
  const keys = ['howTitle2','scaleIntro','scaleSource','scaleDirection','scaleLabel','scaleRead','scaleContext','scaleMusic'];
  const spanish = keys.map(k => es.tx[k]);
  assert(spanish.every(Boolean)); assert(es.legend.every(l => l.sound));
  c.setLang('en'); const en = c.renderVals();
  keys.forEach((k,i) => { assert(en.tx[k]); assert.notEqual(en.tx[k], spanish[i]); });
  assert.equal(en.legend[1].v, '+4.5'); assert.equal(en.legend[6].who, 'silence');
  en.legend.forEach((l,i) => { assert(l.sound); assert.notEqual(l.sound, es.legend[i].sound); });
  c.setLang('es');
  assert.equal(preserved(), before);
});

function setup() {
  const elements = new Map(), timers = new Map(), events = new Map();
  let serial = 0;
  const listen = (type, fn) => events.set(type, fn);
  const unlisten = type => events.delete(type);
  const context = {
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { hidden: false, documentElement: {}, getElementById: id => elements.get(id),
      querySelector: () => null, addEventListener: listen, removeEventListener: unlisten },
    window: { innerWidth: 1200, innerHeight: 900, matchMedia: () => ({ matches: true }),
      addEventListener: listen, removeEventListener: unlisten,
      visualViewport: { addEventListener: listen, removeEventListener: unlisten } },
    setTimeout: fn => { timers.set(++serial, fn); return serial; },
    clearTimeout: id => timers.delete(id), setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: fn => { timers.set(++serial, fn); return serial; },
    cancelAnimationFrame: id => timers.delete(id),
    DCLogic: class { constructor(props) { this.props = props; } setState(patch, done) { Object.assign(this.state, patch); done?.(); } }
  };
  vm.createContext(context);
  vm.runInContext(source + '\nglobalThis.ComponentUnderTest = Component;', context);
  const component = new context.ComponentUnderTest({});
  component.loadDisc = component.preloadArt = component.playCue = component.warmBandClips = () => {};
  function element(id, left, top, width, height, clip = null) {
    const el = { getBoundingClientRect: () => ({ left, top, width, height, right: left + width, bottom: top + height }),
      closest: () => clip, scrollIntoView() {}, focus() { context.document.activeElement = this; } };
    elements.set(id, el);
    return el;
  }
  return { component, context, elements, timers, events, element };
}

test('guides are optional on startup and when changing section', () => {
  const { component: c, timers } = setup();
  c.componentDidMount();
  assert.equal(timers.size, 0, 'startup must not schedule an unsolicited guide');
  c.goTab('how');
  assert.equal(timers.size, 0, 'navigation must not schedule an unsolicited guide');
  assert.equal(c.state.tour, 0);
});

test('each section has a brief, bilingual guide with real target IDs', () => {
  const { component: c, context } = setup();
  for (const lang of ['es', 'en', 'es']) {
    c.setLang(lang);
    for (const tab of context.PAGE_ORDER) {
      const steps = c.guideSteps(tab);
      assert(steps.length >= 3 && steps.length <= 5, tab + ' needs 3–5 steps');
      for (const step of steps) {
        assert(step.t && step.b && step.en.t && step.en.b);
        assert(html.includes('id="' + step.id + '"'), 'missing target ' + step.id);
      }
    }
  }
});

test('closing resumes the section step; skipping resets only guide progress', () => {
  const { component: c } = setup();
  c.state.tab = 'juke';
  const original = JSON.stringify({ disc: c.state.disc, frame: c.state.frame, mute: c.state.mute, playing: c.state.playing });
  c.tourOpen(); c.tourGo(2); c.tourClose();
  assert.equal(c.state.tour, 0);
  c.tourOpen();
  assert.equal(c.state.tour, 2);
  c.renderVals().tour.back();
  assert.equal(c.state.tour, 1);
  c.renderVals().tour.next();
  assert.equal(c.state.tour, 2);
  c.renderVals().tour.skip(); c.tourOpen();
  assert.equal(c.state.tour, 1);
  assert.equal(JSON.stringify({ disc: c.state.disc, frame: c.state.frame, mute: c.state.mute, playing: c.state.playing }), original);
});

test('guide restoration stops playback on a screen change while retaining scroll and instrument choices', () => {
  const { component: c, context } = setup();
  const screen = { scrollTop: 135, scrollLeft: 0 }, app = { scrollTop: 0, scrollLeft: 0 };
  context.document.querySelector = selector => selector === '.px .scr' ? screen : selector === '.px.app' ? app : null;
  c.state.tab = 'juke'; c.state.sub = 0;
  c.tourOpen(); c.tourGo(4);
  assert.equal(c.state.sub, 2);
  screen.scrollTop = 400; app.scrollTop = 2;
  c.state.playing = true; c.state.mute.inti = false;
  c.tourClose();
  assert.equal(c.state.sub, 0); assert.equal(screen.scrollTop, 135); assert.equal(app.scrollTop, 0);
  assert.equal(c.state.playing, false); assert.equal(c.state.mute.inti, false);
});

test('guide targeting scrolls only the screen, never hidden app or document ancestors', () => {
  const { component: c, element } = setup();
  c.state.tab = 'juke';
  const clip = element('screen', 0, 100, 1200, 600);
  Object.assign(clip, { scrollTop: 100, scrollHeight: 1800, clientHeight: 600, scrollTo(options) { this.scrollTop = options.top; } });
  const target = element('tour-discs', 20, 1000, 400, 300, clip);
  target.scrollIntoView = () => assert.fail('scrollIntoView can move hidden ancestors');
  c.tourGo(1);
  assert.equal(clip.scrollTop, 850);
});

test('repeated guide close/end releases observed elements and callbacks and returns focus', () => {
  const { component: c, context, timers, element } = setup();
  const removed = [], opener = { isConnected: true, focus() { context.document.activeElement = this; } };
  c.tourObserver = { observe() {}, unobserve(el) { removed.push(el); } };
  c.state.tab = 'band';
  const target = element('tour-bpick', 20, 100, 400, 120), card = element('tour-card', 20, 300, 410, 240);
  for (let i=0; i<5; i++) {
    context.document.activeElement = opener; c.tourOpen();
    if (i%2) c.tourEnd(); else c.tourClose();
    assert.equal(context.document.activeElement, opener); assert.equal(timers.size, 0);
    assert.equal(c.tourTarget, null); assert.equal(c.tourCard, null);
    assert.equal(c.state.tourCardH, 0); assert.equal(c.state.tourRect, null);
  }
  assert(removed.includes(target)); assert(removed.includes(card));
});

test('resize and restore keep the current step and refresh target geometry', () => {
  const { component: c, context, element, events } = setup();
  c.componentDidMount(); c.state.tab = 'juke'; c.tourGo(1);
  element(c.guideStep().id, 40, 100, 300, 180);
  events.get('resize')();
  assert.equal(c.state.tour, 1); assert.equal(c.state.tourRect.x, 40);
  context.document.hidden = true;
  element(c.guideStep().id, 0, 0, 0, 0);
  events.get('visibilitychange')();
  assert.equal(c.state.tourRect.x, 40, 'minimizing must not replace valid geometry with zeroes');
  context.document.hidden = false; context.window.innerWidth = 390;
  element(c.guideStep().id, 16, 150, 350, 200);
  events.get('visibilitychange')();
  assert.equal(c.state.tour, 1); assert.equal(c.state.tourRect.x, 16); assert.equal(c.state.vw, 390);
});

test('spotlight never points at an element clipped outside its screen', () => {
  const { component: c, element } = setup();
  c.state.tab = 'juke'; c.tourGo(1);
  const clip = element('clip', 0, 80, 1200, 700);
  element(c.guideStep().id, 40, -100, 300, 50, clip);
  c.measureTour();
  assert.equal(c.renderVals().tour.spot, false);
});

test('guide geometry stays in the visual viewport when zoomed and panned', () => {
  const { component: c, context, element } = setup();
  Object.assign(context.window.visualViewport, { width: 500, height: 320, offsetLeft: 100, offsetTop: 120 });
  c.state.tab = 'juke'; c.tourGo(1);
  element('tour-discs', 50, 100, 900, 500); element('tour-card', 0, 0, 410, 296);
  c.measureTour();
  assert.deepEqual(JSON.parse(JSON.stringify(c.state.tourRect)), { x:100, y:120, w:500, h:320 });
  const style = c.renderVals().tour.cardSt;
  const x = +style.match(/left:([\d.]+)px/)[1], y = +style.match(/top:([\d.]+)px/)[1];
  assert(x >= 112 && x + 410 <= 588, style); assert(y >= 132 && y + 296 <= 428, style);
});

test('card placement accounts for its measured height', () => {
  const { component: c, element } = setup();
  c.state.tab = 'juke'; c.tourGo(1);
  element(c.guideStep().id, 450, 400, 300, 30);
  element('tour-card', 0, 0, 410, 500);
  c.measureTour();
  const card = c.renderVals().tour;
  const top = Number(card.cardSt.match(/(?:^|;)top:([\d.]+)px/)?.[1]);
  assert(Number.isFinite(top));
  assert(top >= 12 && top + 500 <= 888, card.cardSt);
});

test('Silbo remains visible when a guide points to him; Escape closes the guide', () => {
  const { component: c, context, events } = setup();
  c.componentDidMount(); c.state.tab = 'home'; c.tourGo(5);
  assert.equal(c.guideStep().id, 'tour-guide');
  assert.notEqual(c.renderVals().guideFabCls, 'hide');
  let prevented = false;
  events.get('keydown')?.({ key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(c.state.tour, 0); assert(prevented);
  c.componentWillUnmount();
  assert.equal(events.has('keydown'), false);
});

test('language changes retain upload errors, filenames and application state', () => {
  const { component: c } = setup();
  c.state.tab = 'data'; c.state.sub = 0;
  c.handleFile({ name: 'mi archivo.csv', size: 9 * 1024 * 1024 });
  const spanishError = c.renderVals().upMsg;
  c.state.frame = 2; c.state.playing = true; c.state.tour = 2; c.state.more = true;
  const snapshot = () => JSON.stringify([c.state.tab, c.state.sub, c.state.frame, c.state.disc,
    c.state.playing, c.state.tour, c.state.more, c.state.mute, c.state.an, c.state.custom, c.state.bsel]);
  const before = snapshot();
  c.setLang('en');
  assert.equal(snapshot(), before);
  assert.match(c.renderVals().upMsg, /larger than 8 MB/);
  c.setLang('es');
  assert.equal(c.renderVals().upMsg, spanishError);
});

test('generated CSV column labels and status messages follow the selected language', () => {
  const { component: c } = setup();
  c.drawSeries = (_, done) => done('data:image/png;base64,test');
  c.state.tab = 'data';
  c.loadCsv('columna 1.csv', '1,11\n2,12\n3,13\n4,14\n5,15\n6,16\n7,17\n8,18');
  const custom = c.state.custom;
  c.setLang('en');
  const v = c.renderVals();
  assert.equal(c.state.custom, custom);
  assert.equal(v.colOpts[0].l, 'column 1');
  assert.match(v.fileName, /^columna 1\.csv · column /, 'user filename must remain untouched');
  assert.match(v.upMsg, /^Ready:/);
  c.setLang('es');
  assert.equal(c.renderVals().colOpts[0].l, 'columna 1');
});

test('language switching keeps the current chord highlighted without changing musical values', () => {
  const { component: c } = setup();
  c.state.tab = 'juke'; c.state.sub = 2; c.state.playing = true;
  c.state.chord = c.renderVals().progItems[0].label;
  const numericProfile = () => JSON.stringify([c.profile().root, c.profile().scale, c.profile().bpm, c.profile().prog]);
  const before = numericProfile();
  c.setLang('en');
  assert.equal(numericProfile(), before);
  assert.equal(c.state.chord, c.renderVals().progItems[0].label);
});

test('all fixed UI keys, guides, method and technology content render in both languages', () => {
  const { component: c, context } = setup();
  assert.deepEqual(Object.keys(context.TX.es).sort(), Object.keys(context.TX.en).sort());
  for (const [, key] of html.matchAll(/\{\{tx\.(\w+)\}\}/g)) {
    assert(context.TX.es[key] && context.TX.en[key], 'missing UI translation: ' + key);
  }
  for (const tool of context.TECH) {
    assert(context.TECH_EN[(tool.es || tool).name]?.use, 'missing technology translation: ' + tool.name);
  }
  for (const lang of ['es', 'en', 'es']) {
    c.setLang(lang);
    for (const tab of ['home', ...context.PAGE_ORDER]) {
      c.state.tab = tab;
      for (let sub = 0; sub < c.subCount(); sub++) {
        c.state.sub = sub;
        const v = c.renderVals();
        assert.equal(Object.values(v.scr).filter(Boolean).length, 1);
        for (const value of Object.values(v.tx)) assert.equal(typeof value, 'string');
      }
    }
  }
});

test('sample labels translate without reloading or modifying their numerical values', async () => {
  const { component: c, context } = setup();
  c.state.tab = 'data';
  const samples = Array.from({ length: 500 }, (_, i) => i);
  context.fetch = async () => ({ json: async () => ({ chiclayo: { p: samples } }) });
  c.drawSeries = (_, done) => done('data:image/png;base64,sample');
  c.loadSample();
  await new Promise(resolve => setImmediate(resolve));
  const custom = c.state.custom, values = JSON.stringify(custom.cols[0].values);
  assert.match(c.renderVals().fileName, /lluvia/);
  c.setLang('en');
  assert.equal(c.state.custom, custom);
  assert.match(c.renderVals().fileName, /rainfall/);
  assert.match(c.renderVals().upMsg, /rainfall \(mm\/day\)/);
  assert.equal(JSON.stringify(custom.cols[0].values), values);
  c.setLang('es');
  assert.match(c.renderVals().fileName, /lluvia/);
});

test('reduced motion keeps all five portraits static at mobile and desktop widths', () => {
  const { component: c, context, timers } = setup();
  c.state.tab = 'band';
  for (const width of [320, 390, 1200]) {
    context.window.innerWidth = width;
    for (let i = 0; i < 5; i++) {
      c.pickBand(i);
      const view = c.renderVals().bandCur;
      assert.equal(c.state.bsel, i);
      assert.equal(view.entering, false);
      assert.equal(view.modelCue, '');
      assert.equal(view.entrance, '');
      assert.equal(view.key, c.renderVals().bandSel[i].key);
    }
  }
  assert.equal(timers.size, 0);
});

test('rapid character selection keeps the last choice and ignores canceled animation frames and gestures', () => {
  const { component: c, context, timers } = setup();
  context.window.matchMedia = () => ({ matches: false }); c.state.tab = 'band';
  c.pickBand(1); c.pickBand(2);
  const canceledFrame = timers.get(c.bandRaf);
  c.pickBand(4); const frameId = c.bandRaf;
  canceledFrame(); assert.equal(c.bandRaf,frameId);
  for(let i=0;i<2;i++) {
    const id = i ? c.bandRaf2 : c.bandRaf, fn=timers.get(id);timers.delete(id);fn();
  }
  assert.equal(c.state.bsel, 4);assert.equal(c.state.bphase,'entry');
  const timer=c.bandTimer,finish=timers.get(timer);timers.delete(timer);finish();
  assert.equal(c.state.bphase, 'play');
  const oldGesture = timers.get(c.bandTimer);
  c.pickBand(2); oldGesture();
  assert.equal(c.state.bsel, 2); assert.equal(c.state.bphase, 'entry');
  assert.equal(c.renderVals().bandCur.hasOutgoing,true);
  assert(context.BAND_ENTRY_DURATION >= 450 && context.BAND_ENTRY_DURATION <= 650);
});

test('navigation has one transition in flight and releases completed timers', () => {
  const { component: c, context, timers } = setup();
  context.window.matchMedia = () => ({ matches: false });
  c.goTab('juke');
  assert.equal(c.state.trans, true);
  assert.equal(c.state.tab, 'home', 'the route remains stable until the scheduled swap');
  c.routeChange({ tab: 'tech', sub: 0 }, 'tech');
  assert.equal(timers.size, 2, 'a second request must not add another transition');
  const flush = () => { const tasks = [...timers]; timers.clear(); tasks.forEach(([, fn]) => fn()); };
  flush();
  assert.equal(c.state.tab, 'juke');
  assert.equal(c.state.trans, false);
  assert.equal(c.state.routeArrived, false);
  assert.equal(c.routeTimers.length, 0);
  c.goTab('tech'); flush();
  assert.equal(c.state.tab, 'tech');
});

test('all section transitions settle on mobile and desktop without stacking rapid requests', () => {
  for (const width of [320, 390, 1440]) {
    const { component: c, context, timers } = setup();
    context.window.innerWidth = width;
    context.window.matchMedia = () => ({ matches: false });
    for (const tab of ['juke', 'band', 'data', 'how', 'tech', 'home']) {
      c.goTab(tab);
      for (const other of ['home', 'tech', 'data']) c.goTab(other);
      assert.equal(timers.size, 2);
      const tasks = [...timers]; timers.clear(); tasks.forEach(([, fn]) => fn());
      assert.equal(c.state.tab, tab);
      assert.equal(c.state.trans, false);
    }
  }
});

test('enabling reduced motion during a transition commits once and clears the overlay', () => {
  const { component: c, context, events, timers } = setup();
  const media = { matches: false, addEventListener: (type, fn) => events.set('motion', fn), removeEventListener: () => events.delete('motion') };
  context.window.matchMedia = () => media;
  c.componentDidMount(); c.goTab('how');
  const stale = [...timers.values()];
  media.matches = true; events.get('motion')?.();
  assert.equal(c.state.tab, 'how');
  assert.equal(c.state.trans, false);
  assert.equal(c.routeTimers.length, 0);
  c.goTab('tech'); stale.forEach(fn => fn());
  assert.equal(c.state.tab, 'tech', 'late callbacks must not revert the selected screen');
  c.componentWillUnmount();
  assert.equal(events.has('motion'), false);
});

test('late transition callbacks cannot update an unmounted component', () => {
  const { component: c, context, timers } = setup();
  context.window.matchMedia = () => ({ matches: false });
  c.goTab('band');
  const stale = [...timers.values()];
  c.componentWillUnmount();
  const before = JSON.stringify(c.state);
  stale.forEach(fn => fn());
  assert.equal(JSON.stringify(c.state), before);
});

test('the 448-cell display model is built only when its player screen is visible', () => {
  const { component: c } = setup();
  for (const tab of ['home', 'band', 'how', 'tech']) {
    c.state.tab = tab; c.state.sub = 0;
    assert.equal(c.renderVals().cells.length, 0);
  }
  for (const tab of ['juke', 'data']) {
    c.state.tab = tab;
    for (const sub of [0, 1, 2]) {
      c.state.sub = sub;
      assert.equal(c.renderVals().cells.length, sub === 1 ? 448 : 0);
    }
  }
});

function delayedImages() {
  const h = setup(), images = [], revoked = [];
  h.context.URL = { createObjectURL: f => 'blob:' + f.name, revokeObjectURL: url => revoked.push(url) };
  h.context.Image = class { set src(url) { this.url = url; images.push(this); } };
  h.context.document.createElement = () => {
    let image;
    return { getContext: () => ({ drawImage: im => { image = im; }, getImageData: () => {
      const data = new Uint8ClampedArray(140 * 80 * 4);
      const color = image.url.includes('first') ? [255, 0, 0, 255] : [0, 0, 255, 255];
      for (let i = 0; i < data.length; i += 4) data.set(color, i);
      return { data };
    } }) };
  };
  h.component.state.tab = 'data'; h.component.state.customMode = 'free';
  return { ...h, images, revoked, upload: name => h.component.handleFile({ name, type: 'image/png', size: 100 }) };
}

test('out-of-order image success and error cannot replace the newest complete file', () => {
  const { component: c, images, upload, revoked } = delayedImages();
  upload('first.png'); upload('second.png');
  images[1].onload();
  const state = JSON.stringify(c.state);
  images[0].onload(); images[0].onerror();
  assert.equal(JSON.stringify(c.state), state);
  assert.equal(c.state.custom.name, 'second.png');
  assert(c.state.an['5_0'].cold > c.state.an['5_0'].warm);
  assert(revoked.includes('blob:first.png'));
  upload('third.png');
  assert.equal(c.state.custom.name, 'second.png', 'keep the accepted image and analysis together until the new one is ready');
});

test('CSV reads cannot overwrite a newer image and stale CSV canvases release their URLs', () => {
  const { component: c, context, images, upload, revoked } = delayedImages();
  const readers = [], drawings = [];
  context.FileReader = class { constructor() { readers.push(this); } readAsText() {} };
  c.drawSeries = (_, done) => drawings.push(done);
  const csv = 'rain\n1\n2\n3\n4\n5\n6\n7\n8';
  c.handleFile({ name: 'old.csv', type: 'text/csv', size: 100 });
  upload('second.png'); images[0].onload();
  const state = JSON.stringify(c.state);
  readers[0].result = csv; readers[0].onload(); readers[0].onerror();
  assert.equal(JSON.stringify(c.state), state);
  assert.equal(drawings.length, 0, 'stale text must not start a canvas job');
  c.loadCsv('pending.csv', csv);
  upload('newest.png'); images[1].onload();
  const accepted = JSON.stringify(c.state);
  drawings[0]('blob:stale-canvas');
  assert.equal(JSON.stringify(c.state), accepted);
  assert(revoked.includes('blob:stale-canvas'));
});

test('switching disc sets and unmounting invalidate pending image callbacks', () => {
  for (const cancel of [c => c.applySet('prev'), c => c.componentWillUnmount()]) {
    const { component: c, images, upload } = delayedImages();
    upload('pending.png'); cancel(c);
    const state = JSON.stringify(c.state);
    images[0].onload(); images[0].onerror();
    assert.equal(JSON.stringify(c.state), state);
  }
});

test('late NASA frame analyses from the previous disc set are discarded', () => {
  const { component: c, images } = delayedImages();
  c.analyze(2, 0, true); c.applySet('prev');
  const state = JSON.stringify(c.state);
  images[0].onload(); images[0].onerror();
  assert.equal(JSON.stringify(c.state), state);
});

test('repeated column selections accept only the newest canvas response', () => {
  const { component: c, context } = setup(), drawings = [], revoked = [];
  context.URL = { revokeObjectURL: url => revoked.push(url) };
  c.state.custom = { name: 'data.csv', baseName: 'data.csv', kind: 'csv', url: 'blob:old', col: 0,
    cols: [{ name: 'A', values: [1,2,3,4,5,6,7,8] }, { name: 'B', values: [8,7,6,5,4,3,2,1] }] };
  c.drawSeries = (_, done) => drawings.push(done);
  c.setCol(1); c.setCol(0);
  drawings[1]('blob:newest'); const state = JSON.stringify(c.state);
  drawings[0]('blob:stale');
  assert.equal(JSON.stringify(c.state), state);
  assert.equal(c.state.custom.col, 0); assert(revoked.includes('blob:stale'));
});

function modalHarness() {
  const h = setup(), background = { inert: false }, opener = { isConnected: true, focus() { h.context.document.activeElement = this; } };
  const dialog = { focus() { h.context.document.activeElement = this; }, contains: el => controls.includes(el) || el === dialog };
  const controls = Array.from({ length: 3 }, () => ({ disabled: false, tabIndex: 0, hidden: false,
    getClientRects: () => [{}], closest: () => null, focus() { h.context.document.activeElement = this; } }));
  dialog.querySelectorAll = () => controls; dialog.querySelector = () => controls[0];
  h.elements.set('more-dialog', dialog); h.elements.set('more-close', controls[0]);
  h.context.document.querySelectorAll = () => [background];
  h.context.document.activeElement = opener;
  h.component.componentDidMount();
  function key(key, shiftKey = false) {
    const e = { key, shiftKey, prevented: false, preventDefault() { this.prevented = true; }, stopPropagation() {} };
    h.events.get('keydown')(e); return e;
  }
  return { ...h, background, opener, controls, dialog, key };
}

test('More options moves focus inside, wraps Tab both ways and restores its opener', () => {
  const { component: c, context, background, opener, controls, key } = modalHarness();
  c.renderVals().toggleMore({ currentTarget: opener });
  assert.equal(context.document.activeElement, controls[0]); assert(background.inert);
  assert(key('Tab', true).prevented); assert.equal(context.document.activeElement, controls[2]);
  assert(key('Tab').prevented); assert.equal(context.document.activeElement, controls[0]);
  controls[1].focus(); assert.equal(key('Tab').prevented, false, 'normal Tab between interior controls must remain native');
  assert(key('Escape').prevented); assert.equal(c.state.more, false);
  assert.equal(context.document.activeElement, opener); assert.equal(background.inert, false);
});

test('modal focus containment handles external focus, removed openers and an active guide', () => {
  const { component: c, context, events, opener, controls, key } = modalHarness();
  c.state.tour = 2;
  c.renderVals().toggleMore({ currentTarget: opener });
  context.document.activeElement = opener;
  events.get('focusin')?.({ target: opener });
  assert.equal(context.document.activeElement, controls[0]);
  opener.isConnected = false;
  key('Escape');
  assert.equal(c.state.more, false); assert.equal(c.state.tour, 2, 'Escape must close only the modal');
  c.componentWillUnmount(); assert.equal(events.has('focusin'), false);
});

test('late sample fetch successes and errors cannot replace a later upload', async () => {
  const { component: c, context, images, upload } = delayedImages();
  let resolveOld, rejectOld;
  context.fetch = () => new Promise((resolve, reject) => { resolveOld = resolve; rejectOld = reject; });
  c.loadSample(); const firstFetch = resolveOld;
  c.loadSample(); const secondFailure = rejectOld;
  upload('latest.png'); images[0].onload();
  const state = JSON.stringify(c.state);
  firstFetch({ json: async () => ({ chiclayo: { p: Array(500).fill(1) } }) });
  secondFailure(new Error('late network error'));
  await new Promise(resolve => setImmediate(resolve));
  assert(JSON.stringify(c.state) === state, 'stale fetch callbacks changed the accepted upload');
});

test('late image errors preserve the previous accepted image and its analysis', () => {
  const { component: c, images, upload, revoked } = delayedImages();
  upload('accepted.png'); images[0].onload();
  const custom = c.state.custom, analysis = c.state.an['5_0'];
  upload('broken.png'); images[1].onerror();
  assert.equal(c.state.custom, custom); assert.equal(c.state.an['5_0'], analysis);
  assert(!revoked.includes('blob:accepted.png')); assert(revoked.includes('blob:broken.png'));
});

test('background NASA errors cannot overwrite the status of the accepted user file', () => {
  const { component: c, images, upload } = delayedImages();
  c.analyze(2, 0, true);
  upload('latest.png'); images[1].onload();
  const state = JSON.stringify(c.state);
  images[0].onerror();
  assert(JSON.stringify(c.state) === state, 'unrelated frame failure overwrote the latest upload status');
});

test('re-analysis of the same frame or custom image ignores superseded callbacks', () => {
  const { component: c, images, upload } = delayedImages();
  upload('accepted.png'); images[0].onload();
  c.setMode('palette'); c.setMode('free');
  images[2].onload(); const state = JSON.stringify(c.state);
  images[1].onload(); images[1].onerror();
  assert(JSON.stringify(c.state) === state, 'old color-mode result replaced the selected mode');
  c.analyze(2, 0, true); c.analyze(2, 0, true);
  images[4].onload(); const frames = JSON.stringify(c.state.an);
  images[3].onload(); images[3].onerror();
  assert(JSON.stringify(c.state.an) === frames);
});

test('pending CSV canvas callbacks after unmount release resources without setting state', () => {
  const { component: c, context } = setup(), callbacks = [], revoked = [];
  context.URL = { revokeObjectURL: url => revoked.push(url) };
  c.drawSeries = (_, done) => callbacks.push(done);
  c.loadCsv('pending.csv', 'rain\n1\n2\n3\n4\n5\n6\n7\n8');
  c.componentWillUnmount(); const state = JSON.stringify(c.state);
  callbacks[0]('blob:late');
  assert(JSON.stringify(c.state) === state); assert(revoked.includes('blob:late'));
});

test('leaving the upload section invalidates pending files instead of changing another screen', () => {
  const { component: c, context } = setup(), callbacks = [], revoked = [];
  context.URL = { revokeObjectURL: url => revoked.push(url) };
  c.state.tab = 'data'; c.drawSeries = (_, done) => callbacks.push(done);
  c.loadCsv('pending.csv', 'rain\n1\n2\n3\n4\n5\n6\n7\n8');
  c.goTab('how'); const state = JSON.stringify(c.state);
  callbacks[0]('blob:late');
  assert(JSON.stringify(c.state) === state); assert.equal(c.state.sub, 0);
  assert(revoked.includes('blob:late'));
});

test('modal Tab excludes disabled and hidden controls and handles an empty dialog', () => {
  const { component: c, context, dialog, controls, key } = modalHarness();
  c.renderVals().toggleMore();
  controls[1].disabled = true; controls[2].hidden = true;
  assert(key('Tab').prevented); assert.equal(context.document.activeElement, controls[0]);
  controls[0].disabled = true;
  assert(key('Tab', true).prevented); assert.equal(context.document.activeElement, dialog);
  c.renderVals().closeMore(); assert.equal(c.state.more, false);
});

test('modal restores existing inert state and releases the background before navigation', () => {
  const { component: c, background } = modalHarness();
  background.inert = true;
  c.renderVals().toggleMore(); c.renderVals().closeMore();
  assert.equal(background.inert, true, 'pre-existing inert state must be preserved');
  background.inert = false;
  c.renderVals().toggleMore(); c.goTab('how');
  assert.equal(c.state.more, false); assert.equal(background.inert, false);
});

function audioHarness() {
  const h = setup(), intervals = new Set();
  h.context.document.timeline = { currentTime: 0 };
  h.context.navigator = { userActivation: { isActive: true } };
  h.context.setInterval = fn => { intervals.add(fn); return fn; };
  h.context.clearInterval = fn => intervals.delete(fn);
  class AudioContextStub {
    constructor() { this.state = 'running'; this.sampleRate = 8; this.currentTime = 0; this.destination = {}; }
    createGain() { return { gain: { value: 0 }, connect() {}, disconnect() {} }; }
    createDynamicsCompressor() { return { connect() {}, disconnect() {} }; }
    createConvolver() { return { connect() {}, disconnect() {} }; }
    createBuffer(channels, samples) { const data = Array.from({ length: channels }, () => new Float32Array(samples)); return { getChannelData: i => data[i] }; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
  }
  h.context.window.AudioContext = AudioContextStub;
  return { ...h, intervals, AudioContextStub };
}

test('unsupported or failed AudioContext initialization leaves Play available with bilingual feedback', async () => {
  for (const mode of ['missing', 'throws', 'bad graph']) {
    const { component: c, context, intervals, AudioContextStub } = audioHarness();
    if (mode === 'missing') delete context.window.AudioContext;
    if (mode === 'throws') context.window.AudioContext = class { constructor() { throw new Error('blocked'); } };
    if (mode === 'bad graph') context.window.AudioContext = class extends AudioContextStub { createGain() { throw new Error('failed node'); } };
    await assert.doesNotReject(async () => c.play());
    assert.equal(c.state.playing, false); assert.equal(c.state.audioPending, false); assert.equal(intervals.size, 0);
    const spanishError = c.renderVals().audioError;
    assert(spanishError);
    c.setLang('en'); assert.match(c.renderVals().audioError, /audio/i);
    assert.notEqual(c.renderVals().audioError, spanishError);
    c.setLang('es'); assert.match(c.renderVals().audioError, /audio/i);
  }
});

test('rejected or ineffective resume never starts playback and can be retried', async () => {
  for (const reject of [true, false]) {
    const { component: c, context, intervals, AudioContextStub } = audioHarness();
    context.window.AudioContext = class extends AudioContextStub {
      constructor() { super(); this.state = 'suspended'; }
      resume() { const p = reject ? Promise.reject(new Error('not allowed')) : Promise.resolve(); p.catch(() => {}); return p; }
    };
    await c.play();
    assert.equal(c.state.playing, false); assert.equal(c.state.audioPending, false); assert.equal(intervals.size, 0);
    c.ac.resume = function () { this.state = 'running'; return Promise.resolve(); };
    await c.play();
    assert.equal(c.state.playing, true); assert.equal(intervals.size, 1); assert.equal(c.renderVals().audioError, '');
  }
});

test('a cancelled pending audio activation cannot restart after navigation or unmount', async () => {
  for (const cancel of [c => c.stop(), c => c.goTab('how'), c => c.componentWillUnmount()]) {
    const { component: c, context, intervals, AudioContextStub } = audioHarness();
    let resolveResume;
    context.window.AudioContext = class extends AudioContextStub {
      constructor() { super(); this.state = 'suspended'; }
      resume() { return new Promise(resolve => { resolveResume = () => { this.state = 'running'; resolve(); }; }); }
    };
    const pending = c.play();
    assert.equal(c.state.audioPending, true); c.play();
    cancel(c); const state = JSON.stringify(c.state);
    resolveResume(); await pending;
    assert(JSON.stringify(c.state) === state); assert.equal(intervals.size, 0);
  }
});

test('retry after a partial audio graph failure creates a complete graph', async () => {
  const { component: c, context, intervals, AudioContextStub } = audioHarness();
  let fail = true;
  context.window.AudioContext = class extends AudioContextStub {
    createBuffer(...args) { if (fail) { fail = false; throw new Error('failed buffer'); } return super.createBuffer(...args); }
  };
  await c.play(); assert.equal(c.state.playing, false);
  await c.play(); assert.equal(c.state.playing, true);
  assert(c.master && c.bus && c.noise); assert.equal(intervals.size, 1);
  c.state.col = 9; c.stop(); assert.equal(c.state.col, 9);
  await c.play(); assert.equal(c.state.col, -1, 'the existing restart-from-frame behavior must remain unchanged');
});

test('images with no usable pixels retain the accepted file and report errors in ES/EN', () => {
  for (const sparse of [false, true]) {
    const { component: c, context, images, upload, revoked } = delayedImages();
    upload('accepted.png'); images[0].onload();
    const previous = c.state.custom, analysis = c.state.an['5_0'];
    context.document.createElement = () => ({ getContext: () => ({ drawImage() {}, getImageData: () => {
      const data = new Uint8ClampedArray(140 * 80 * 4);
      if (sparse) { data[0] = 255; data[3] = 255; }
      return { data };
    } }) });
    upload('empty.png'); images[1].onload();
    assert.equal(c.state.custom, previous); assert.equal(c.state.an['5_0'], analysis);
    assert.match(c.renderVals().upMsg, /píxeles/); c.setLang('en'); assert.match(c.renderVals().upMsg, /pixels/);
    assert(revoked.includes('blob:empty.png'));
  }
});

test('CSV handles quoted separators, escaped quotes, multiline fields and a BOM', () => {
  const { component: c } = setup(); c.drawSeries = (_, done) => done('data:image/png;base64,csv');
  const rows = ['\uFEFFstation,"rain, ""daily"""', ...Array.from({ length: 8 }, (_, i) => '"Lima, ""Centro""\nPeru",' + (i + 1))];
  c.loadCsv('quoted.csv', rows.join('\r\n'));
  assert(c.state.custom);
  assert.equal(c.state.custom.cols[0].name, 'rain, "daily"');
  assert.equal(JSON.stringify(c.state.custom.cols[0].values), '[1,2,3,4,5,6,7,8]');
});

test('CSV retains semicolon decimal commas, TSV and headerless compatibility', () => {
  for (const text of [
    ['station;rain', ...Array.from({ length: 8 }, (_, i) => '"Lima, Peru";' + (i + 1) + ',5')].join('\n'),
    ['station\train', ...Array.from({ length: 8 }, (_, i) => '"Lima, Peru"\t' + (i + 1))].join('\n'),
    Array.from({ length: 8 }, (_, i) => (i + 1) + ',' + (i + 11)).join('\n')
  ]) {
    const { component: c } = setup(); c.drawSeries = (_, done) => done('data:image/png;base64,csv');
    c.loadCsv('supported.csv', text); assert(c.state.custom); assert.equal(c.state.custom.cols[0].values.length, 8);
  }
});

test('CSV accepts 5000 data records but rejects overflow without partial processing', () => {
  const { component: c } = setup(); let rendered = 0;
  c.drawSeries = (_, done) => { rendered++; done('data:image/png;base64,csv'); };
  const records = Array.from({ length: 5000 }, (_, i) => String(i));
  c.loadCsv('limit.csv', ['rain', ...records].join('\n')); assert(c.state.custom);
  assert.equal(c.state.custom.cols[0].values.length, 5000);
  const accepted = c.state.custom;
  for (const header of [[], ['rain']]) c.loadCsv('overflow.csv', [...header, ...records, '5001'].join('\n'));
  assert.equal(c.state.custom, accepted); assert.equal(rendered, 1);
  assert.match(c.renderVals().upMsg, /5000/); c.setLang('en'); assert.match(c.renderVals().upMsg, /5000/);
  assert.match(c.renderVals().upMsg, /not processed|no rows/i);
});

test('malformed CSV quotes show a bilingual error without replacing accepted data', () => {
  const { component: c } = setup();
  c.loadCsv('broken.csv', 'station,rain\n"Lima,1\n"Peru,2');
  assert.equal(c.state.custom, null); assert.match(c.renderVals().upMsg, /comillas/);
  c.setLang('en'); assert.match(c.renderVals().upMsg, /quot/i);
});

test('audio rejects non-Error failures safely and supports the prefixed browser API', async () => {
  const { component: c, context, AudioContextStub } = audioHarness();
  context.window.AudioContext = class extends AudioContextStub {
    constructor() { super(); this.state = 'suspended'; }
    resume() { return Promise.reject(null); }
  };
  await c.play(); assert.equal(c.state.playing, false); assert(c.renderVals().audioError);
  delete context.window.AudioContext;
  context.window.webkitAudioContext = AudioContextStub;
  c.ac.state = 'closed';
  await c.play(); assert.equal(c.state.playing, true); assert.equal(c.renderVals().audioError, '');
});

test('optional audio cues cannot throw through navigation on resume or synthesis failures', async () => {
  const { component: c, context, AudioContextStub } = audioHarness();
  const realCue = Object.getPrototypeOf(c).playCue;
  context.window.AudioContext = class extends AudioContextStub { createOscillator() { throw new Error('node error'); } };
  assert.doesNotThrow(() => realCue.call(c, ['sine', [440]]));
  c.ac.state = 'suspended'; c.ac.resume = () => { throw new Error('resume error'); };
  assert.doesNotThrow(() => realCue.call(c, ['sine', [440]]));
  c.ac.resume = () => Promise.reject(new Error('resume rejected'));
  realCue.call(c, ['sine', [440]]);
  await new Promise(resolve => setImmediate(resolve));
});

test('neutral but visible image pixels remain valid and an invalid color mode rolls back', () => {
  const { component: c, context, images, upload } = delayedImages();
  context.document.createElement = () => ({ getContext: () => ({ drawImage() {}, getImageData: () => {
    const data = new Uint8ClampedArray(140 * 80 * 4);
    for (let i = 0; i < data.length; i += 4) { data[i] = 127; data[i+1] = 127; data[i+2] = 127; data[i+3] = 255; }
    return { data };
  } }) });
  upload('neutral.png'); images[0].onload();
  assert(c.state.custom); assert(c.state.an['5_0'].cells.every(Number.isFinite));
  const previous = c.state.custom, analysis = c.state.an['5_0'];
  context.document.createElement = () => ({ getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray(140 * 80 * 4) }) }) });
  c.setMode('palette'); images[1].onload();
  assert.equal(c.state.custom, previous); assert.equal(c.state.customMode, 'free'); assert.equal(c.state.an['5_0'], analysis);
});

test('CSV row limit counts logical records rather than newlines inside quoted fields', () => {
  const { component: c } = setup(); c.drawSeries = (_, done) => done('data:image/png;base64,csv');
  const rows = ['station,rain', ...Array.from({ length: 5000 }, (_, i) => '"Lima\nPeru",' + i)];
  c.loadCsv('multiline.csv', rows.join('\n'));
  assert(c.state.custom); assert.equal(c.state.custom.cols[0].values.length, 5000);
});

test('resume that never settles times out, restores Play and permits retry', async () => {
  const { component: c, context, timers, intervals, AudioContextStub } = audioHarness(), delays = [];
  const schedule = context.setTimeout;
  context.setTimeout = (fn, delay) => { delays.push(delay); return schedule(fn); };
  context.window.AudioContext = class extends AudioContextStub {
    constructor() { super(); this.state = 'suspended'; }
    resume() { return new Promise(() => {}); }
  };
  const pending = c.play(); c.play();
  assert.equal(timers.size, 1, 'one bounded activation wait, even after repeated Play');
  assert.equal(delays[0], 8000);
  [...timers.values()][0](); await pending;
  assert.equal(timers.size, 0); assert.equal(intervals.size, 0);
  assert.equal(c.state.audioPending, false); assert.equal(c.state.playing, false);
  assert.equal(c.renderVals().playPending, false); assert.equal(c.renderVals().playLabel, 'Reproducir');
  assert.match(c.renderVals().audioError, /tardó demasiado/);
  c.setLang('en'); assert.match(c.renderVals().audioError, /timed out/i);
  c.ac.resume = function () { this.state = 'running'; return Promise.resolve(); };
  await c.play();
  assert.equal(c.state.playing, true); assert.equal(intervals.size, 1);
  assert.equal(c.renderVals().audioError, ''); assert.equal(timers.size, 0);
});

test('late completion of a timed-out resume cannot finish a newer activation', async () => {
  const { component: c, context, timers, intervals, AudioContextStub } = audioHarness(), resumes = [];
  context.window.AudioContext = class extends AudioContextStub {
    constructor() { super(); this.state = 'suspended'; }
    resume() { return new Promise((resolve, reject) => resumes.push({ resolve: () => { this.state = 'running'; resolve(); }, reject })); }
  };
  const first = c.play();
  assert.equal(timers.size, 1);
  [...timers.values()][0](); await first;
  const second = c.play(); const state = JSON.stringify(c.state);
  resumes[0].resolve(); await new Promise(resolve => setImmediate(resolve));
  assert(JSON.stringify(c.state) === state); assert.equal(intervals.size, 0);
  resumes[1].resolve(); await second;
  assert.equal(intervals.size, 1); assert.equal(c.state.playing, true); assert.equal(timers.size, 0);
});

test('stop, navigation, file operations and unmount settle a pending activation immediately', async () => {
  for (const cancel of [c => c.stop(), c => c.goTab('how'), c => c.loadCsv('new.csv', 'v\n1\n2\n3\n4\n5\n6\n7\n8'), c => c.componentWillUnmount()]) {
    const { component: c, context, timers, intervals, AudioContextStub } = audioHarness();
    c.state.tab = 'data'; c.drawSeries = (_, done) => done('data:image/png;base64,new');
    let rejectLate;
    context.window.AudioContext = class extends AudioContextStub {
      constructor() { super(); this.state = 'suspended'; }
      resume() { return new Promise((resolve, reject) => { rejectLate = reject; }); }
    };
    let settled = false;
    const pending = c.play().then(() => { settled = true; });
    cancel(c); await new Promise(resolve => setImmediate(resolve));
    assert(settled, 'cancellation must release the caller without waiting for native resume');
    assert.equal(timers.size, 0); assert.equal(c.state.audioPending, false);
    const state = JSON.stringify(c.state);
    rejectLate(new Error('late browser rejection')); await pending;
    await new Promise(resolve => setImmediate(resolve));
    assert(JSON.stringify(c.state) === state); assert.equal(intervals.size, 0);
  }
});

test('successful and rejected audio activations release their deadline timers', async () => {
  for (const reject of [false, true]) {
    const { component: c, context, timers, AudioContextStub } = audioHarness();
    context.window.AudioContext = class extends AudioContextStub {
      constructor() { super(); this.state = 'suspended'; }
      resume() { if (reject) return Promise.reject(new Error('blocked')); this.state = 'running'; return Promise.resolve(); }
    };
    await c.play(); assert.equal(timers.size, 0);
    assert.equal(c.state.audioPending, false); assert.equal(c.state.playing, !reject);
  }
});

test('Technology categories remain reachable and selected when filtering in either language', () => {
  for (const [width, height] of [[320,568],[390,844],[660,900],[768,1024],[1366,768],[1920,1080]]) {
    const { component: c, context } = setup(); context.window.innerWidth = width; context.window.innerHeight = height;
    for (const lang of ['es', 'en']) {
      c.setLang(lang); c.state.tab = 'tech'; c.state.sub = 0;
      for (let sub = 0; sub < c.subCount(); sub++) {
        const v = c.renderVals();
        assert.equal(v.nav.counter, ('0' + (sub + 1)).slice(-2) + ' / 05');
        assert.equal(v.nav.shortNext, lang === 'es' ? 'Siguiente' : 'Next');
        assert.equal(v.nav.dots.length, 5);
        assert(v.nav.topics);
        assert(v.bottomNavClass.includes('with-pages'));
        if (sub < 4) v.nav.next();
      }
      for (let sub = 4; sub > 0; sub--) c.renderVals().nav.prev();
      assert.equal(c.state.sub, 0);
      c.renderVals().nav.dots[2].go();
      const all = c.renderVals();
      all.techFilters[1].pick();
      const filtered = c.renderVals();
      assert.equal(c.state.sub, 2);
      assert.equal(filtered.techCur.title, all.techCur.title);
      assert(filtered.techCur.items.length < all.techCur.items.length);
      assert.equal(filtered.nav.dots.length, all.nav.dots.length);
      filtered.techFilters[0].pick();
    }
  }
});

function sectionNavHarness() {
  const h = setup(), scrolled = [];
  const buttons = ['juke', 'band', 'data', 'how', 'tech'].map(key => ({ key,
    scrollIntoView: options => scrolled.push({ key, options }), focus() { h.context.document.activeElement = this; } }));
  const nav = { clientWidth: 280, scrollWidth: 680, scrollLeft: 0,
    querySelector: () => buttons.find(b => b.key === h.component.state.tab) || null,
    querySelectorAll: () => buttons };
  h.elements.set('tour-nav', nav);
  return { ...h, nav, buttons, scrolled };
}

test('section changes and language changes bring the active tab into view without moving focus', () => {
  const { component: c, context, buttons, scrolled } = sectionNavHarness();
  context.document.activeElement = buttons[0];
  c.goTab('tech');
  assert.equal(scrolled.at(-1).key, 'tech'); assert.equal(scrolled.at(-1).options.block, 'nearest');
  assert.equal(scrolled.at(-1).options.behavior, 'auto', 'respect reduced motion');
  assert.equal(context.document.activeElement, buttons[0]);
  c.setLang('en'); assert.equal(scrolled.at(-1).key, 'tech');
});

test('navigation keyboard supports arrows, Home and End without activating another section', () => {
  const { component: c, context, nav, buttons } = sectionNavHarness();
  c.state.tab = 'juke'; buttons[0].focus();
  for (const [key, target] of [['End',4],['ArrowLeft',3],['Home',0],['ArrowRight',1]]) {
    let prevented = false;
    c.navKey({ key, currentTarget: nav, preventDefault() { prevented = true; } });
    assert(prevented); assert.equal(context.document.activeElement, buttons[target]);
    assert.equal(c.state.tab, 'juke');
  }
});

test('compact navigation has five bilingual labels while preserving full section names and the active page', () => {
  const { component: c, context } = setup();
  c.state.tab = 'data'; c.state.sub = 1;
  const expected = { es: ['Escuchar','Banda','Convierte','Método','Tecnología'], en: ['Listen','Band','Convert','Method','Technology'] };
  for (const lang of ['es','en','es']) {
    c.setLang(lang);
    const tabs = c.renderVals().tabs;
    assert.deepEqual(JSON.parse(JSON.stringify(tabs.map(t => t.short))), expected[lang]);
    context.PAGE_ORDER.forEach((key,i) => assert.equal(tabs[i].label, context.ROUTE_LOOK[key].title));
    assert.equal(tabs[2].label, lang === 'es' ? 'Convierte en música' : 'Convert to music');
    tabs.forEach(tab => assert(tab.label.toLowerCase().includes(tab.short.toLowerCase())));
    assert.equal(tabs[2].cur, 'page'); assert.equal(tabs.filter(t => t.cur === 'page').length, 1);
    assert.equal(c.state.tab, 'data'); assert.equal(c.state.sub, 1);
  }
});

test('navigation preserves modified keyboard shortcuts', () => {
  const { component: c, nav, buttons } = sectionNavHarness(); buttons[0].focus();
  const preventDefault = () => assert.fail('native browser interaction must not be intercepted');
  c.navKey({ key: 'ArrowLeft', altKey: true, currentTarget: nav, preventDefault });
});

test('navigation uses an earlier compact layout for either larger or readable text', () => {
  const { component: c } = setup();
  assert.equal(c.renderVals().headerClass, '');
  for (const key of ['big','legible']) {
    c.renderVals().a11y[key === 'big' ? 1 : 2].toggle();
    assert.equal(c.renderVals().headerClass, 'readable-nav');
    c.renderVals().a11y[key === 'big' ? 1 : 2].toggle();
    assert.equal(c.renderVals().headerClass, '');
  }
});

test('resize reveals the active tab again and releases the resize callback on unmount', () => {
  const { component: c, events, timers, scrolled } = sectionNavHarness();
  c.componentDidMount(); c.goTab('tech'); const initial = scrolled.length;
  events.get('resize')();
  const callbacks = [...timers]; timers.clear(); callbacks.forEach(([, fn]) => fn());
  assert(scrolled.length > initial); assert.equal(scrolled.at(-1).key, 'tech');
  events.get('resize')(); assert(timers.size > 0);
  c.componentWillUnmount(); assert.equal(timers.size, 0);
});


test('leaving a playback screen stops immediately, clears activity and preserves instrument preferences', async () => {
  for (const [tab,sub,leave] of [
    ['juke',2,c=>c.goSub(0)], ['juke',2,c=>c.goSub(1)],
    ['juke',2,c=>c.goTab('juke')], ['juke',2,c=>c.goTab('data')],
    ['band',0,c=>c.goTab('juke')], ['band',0,c=>c.goTab('how')], ['band',0,c=>c.goTab('tech')]
  ]) {
    const { component:c, intervals } = audioHarness();
    c.state.tab=tab; c.state.sub=sub;
    c.state.mute={silbo:true,inti:false,mama:false,yaku:true,illapa:true};
    c.state.leadOverride='mama'; c.state.speed=140;
    const preferences=JSON.stringify([c.state.mute,c.state.leadOverride,c.state.speed,c.state.engine]);
    await c.play(); c.state.levels.inti=1; c.state.hits.inti=3; c.state.flash=2; c.state.chord='C';
    leave(c);
    assert.equal(c.state.playing,false,tab+' / '+sub); assert.equal(intervals.size,0);
    assert.equal(c.state.audioPending,false); assert.equal(c.state.leadPulse,null);
    assert(Object.values(c.state.levels).every(v=>v===0)); assert.equal(c.state.flash,0); assert.equal(c.state.chord,'');
    assert.equal(JSON.stringify([c.state.mute,c.state.leadOverride,c.state.speed,c.state.engine]),preferences);
    assert.match(c.renderVals().playLabel,/Reproducir/); assert.equal(c.renderVals().signalClass,'');
  }
});

test('opening a disc reaches the player at its first frame and preserves the configured band', async () => {
  const {component:c,intervals}=audioHarness(); c.state.tab='juke';c.state.sub=2;
  c.state.mute={silbo:false,inti:false,mama:true,yaku:false,illapa:true};
  const mute=JSON.stringify(c.state.mute); await c.play();
  c.goSub(0);
  c.state.frame=2;
  const loaded=[];
  c.loadDisc=disc=>loaded.push(disc);
  const open=c.renderVals().discs[3].pick;
  open();
  open();
  assert.equal(c.state.playing,false);assert.equal(intervals.size,0);assert.equal(c.state.disc,3);
  assert.equal(c.state.sub,1);assert.equal(c.state.frame,0);assert.deepEqual(loaded,[3]);
  assert.equal(JSON.stringify(c.state.mute),mute);
  c.goSub(0);c.goSub(2);assert.equal(c.state.playing,false);assert.equal(intervals.size,0);
  c.setLang('en');assert.match(c.renderVals().playLabel,/Play/);assert.equal(JSON.stringify(c.state.mute),mute);
});

test('queued sequencer and visual-note callbacks from a previous run cannot affect a later playback', async () => {
  const {component:c,intervals,timers}=audioHarness();c.state.tab='juke';c.state.sub=2;
  await c.play();const staleTick=[...intervals][0];
  c.leadNote(c.leadChar(),c.ac.currentTime+1,1);const staleLead=[...timers.values()][0];
  c.stop();await c.play();const before=JSON.stringify(c.state);
  staleTick();staleLead();assert.equal(JSON.stringify(c.state),before);
  c.stop();c.tick();assert.equal(c.state.playing,false);assert.equal(intervals.size,0);
});

test('subscreen navigation cancels pending resume and a late resolution cannot autoplay on return', async () => {
  const {component:c,context,AudioContextStub,intervals}=audioHarness();let resume;
  context.window.AudioContext=class extends AudioContextStub { constructor(){super();this.state='suspended'} resume(){return new Promise(r=>{resume=()=>{this.state='running';r()}})} };
  c.state.tab='juke';c.state.sub=2;const pending=c.play();c.goSub(0);
  assert.equal(c.state.audioPending,false);resume();await pending;
  c.goSub(2);assert.equal(c.state.playing,false);assert.equal(intervals.size,0);
});

test('stop fades and retires the old music graph; restarting reuses the context without reviving its tails', async () => {
  const {component:c,context,AudioContextStub,timers}=audioHarness();
  context.window.AudioContext=class extends AudioContextStub {
    createGain(){const events=[];return {events,disconnected:false,gain:{value:.8,cancelScheduledValues(t){events.push(['cancel',t])},setValueAtTime(v,t){events.push(['set',v,t])},linearRampToValueAtTime(v,t){events.push(['ramp',v,t])}},connect(){},disconnect(){this.disconnected=true}}}
  };
  await c.play();const ac=c.ac,old=c.master,impulse=c.reverbImpulse;c.stop();
  assert.equal(c.master,null);assert(old.events.some(e=>e[0]==='ramp'&&e[1]===0));
  await c.play();const current=c.master;assert.notEqual(current,old);assert.equal(c.ac,ac);assert.equal(c.reverbImpulse,impulse);
  for(const [id,fn] of [...timers]){timers.delete(id);fn()}
  assert(old.disconnected);assert.equal(current.disconnected,false);assert.equal(c.state.playing,true);
});

test('character transition owns its outgoing model and removes temporary state after its gesture', () => {
  const {component:c,context,timers}=setup();context.window.matchMedia=()=>({matches:false});c.state.tab='band';
  c.pickBand(1);
  assert.equal(c.renderVals().bandCur.hasOutgoing,true);assert.equal(c.renderVals().bandCur.previousKey,'silbo');
  const id=c.bandTimer,finish=timers.get(id);timers.delete(id);finish();
  assert.match(c.renderVals().bandCur.modelCue, /^selection-/);
  const gesture=c.bandTimer,settle=timers.get(gesture);timers.delete(gesture);settle();
  assert.equal(c.renderVals().bandCur.entering,false);assert.equal(c.renderVals().bandCur.hasOutgoing,false);assert.equal(c.bandTimer,null);
});

test('reselecting the same character does not restart a transition or stop current music', () => {
  const {component:c,context,timers}=setup();context.window.matchMedia=()=>({matches:false});c.state.tab='band';c.state.playing=true;
  c.preloadBandClip=()=>Promise.resolve(null);c.pickBand(1);const id=c.bandTimer,turn=c.bandTurn;
  for(let i=0;i<8;i++)c.pickBand(1);
  assert.equal(c.bandTimer,id);assert.equal(c.bandTurn,turn);assert.equal(timers.size,1);assert.equal(c.state.playing,true);
});

test('leaving and returning to the band cancels its outgoing image, frames, and stale completion', () => {
  const {component:c,context,timers}=setup();context.window.matchMedia=()=>({matches:false});c.state.tab='band';c.preloadBandClip=()=>Promise.resolve(null);
  c.pickBand(1);const old=timers.get(c.bandTimer);context.window.matchMedia=()=>({matches:true});c.goTab('how');
  assert.equal(c.state.bphase,'idle');assert.equal(c.bandTimer,null);old();c.goTab('band');
  assert.equal(c.state.bsel,1);assert.equal(c.renderVals().bandCur.entering,false);assert.equal(c.renderVals().bandCur.hasOutgoing,false);
});


test('language changes and a guide on the same screen neither start nor stop music', async () => {
  const {component:c,intervals}=audioHarness();c.state.tab='band';
  await c.play();const mute=JSON.stringify(c.state.mute);
  c.setLang('en');c.tourOpen();c.tourClose();
  assert.equal(c.state.playing,true);assert.equal(intervals.size,1);assert.equal(JSON.stringify(c.state.mute),mute);
  c.stop();c.tourOpen();c.tourClose();assert.equal(c.state.playing,false);assert.equal(intervals.size,0);
});

test('playing cannot restart on an outgoing screen while its navigation transition is in flight', async () => {
  const {component:c,context,intervals}=audioHarness();context.window.matchMedia=()=>({matches:false});
  c.state.tab='juke';c.state.sub=2;await c.play();c.goSub(0);await c.play();
  assert.equal(c.state.trans,true);assert.equal(c.state.playing,false);assert.equal(intervals.size,0);
});


test('enabling reduced motion cancels an in-flight cut without restarting it or stopping music', () => {
  const {component:c,context,timers}=setup();const media={matches:false};context.window.matchMedia=()=>media;
  c.componentDidMount();c.state.tab='band';c.state.playing=true;c.preloadBandClip=()=>Promise.resolve(null);
  c.pickBand(1);assert.equal(c.state.bphase,'entry');media.matches=true;c.onRouteMotion();
  assert.equal(c.state.bphase,'idle');assert.equal(c.bandTimer,null);assert.equal(timers.size,0);assert.equal(c.state.playing,true);
  media.matches=false;assert.equal(c.renderVals().bandCur.entering,false);assert.equal(c.renderVals().bandCur.hasOutgoing,false);
});


test('the initially selected character can still run its introduction once without repeat-click accumulation', () => {
  const {component:c,context}=setup();context.window.matchMedia=()=>({matches:false});c.state.tab='band';c.preloadBandClip=()=>Promise.resolve(null);
  c.pickBand(0);assert.equal(c.state.bphase,'entry');const id=c.bandTimer;
  c.pickBand(0);assert.equal(c.bandTimer,id);assert.equal(c.state.bsel,0);
});

test('unmount disconnects fading music graphs and cancels their retirement callbacks', async () => {
  const {component:c,timers}=audioHarness();await c.play();const old=c.master;
  old.gain.cancelScheduledValues=()=>{};old.gain.setValueAtTime=()=>{};old.gain.linearRampToValueAtTime=()=>{};
  let disconnected=false;old.disconnect=()=>{disconnected=true};
  c.stop();assert.equal(c.audioRetirements.size,1);c.componentWillUnmount();
  assert(disconnected);assert.equal(c.audioRetirements.size,0);assert.equal(timers.size,0);
});


test('stop also invalidates optional UI cues still waiting for native audio activation', async () => {
  const {component:c,context,AudioContextStub}=audioHarness();let resume,oscillators=0;
  c.playCue=context.ComponentUnderTest.prototype.playCue.bind(c);
  context.window.AudioContext=class extends AudioContextStub {
    constructor(){super();this.state='suspended'}
    resume(){return new Promise(r=>{resume=()=>{this.state='running';r()}})}
    createOscillator(){oscillators++;return {frequency:{},connect(){},start(){},stop(){}}}
  };
  c.playCue(['sine',[440]]);c.stop();resume();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(oscillators,0);
});
