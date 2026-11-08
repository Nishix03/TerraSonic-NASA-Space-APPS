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
