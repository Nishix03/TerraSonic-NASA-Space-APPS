// Run with node scripts/test_guides.cjs [path/to/generated/index.html].
// Exercises the actual component with a minimal DOM boundary, without dependencies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, '../prototipos/I11-eic/Main.dc.html'), 'utf8');
const source = html.match(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];

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
  c.state.playing = true;
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
      assert.equal(view.moving, false);
      assert.equal(view.entrance, '');
      assert(view.poseUrl.endsWith('/pose-banda.webp'));
    }
  }
  assert.equal(timers.size, 0);
});
