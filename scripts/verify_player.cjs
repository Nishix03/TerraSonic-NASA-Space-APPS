// Uses an existing Playwright installation. Audio is synthesized and measured,
// then muted at the test fixture's final output so automated runs stay quiet.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site = path.resolve(process.argv[2] || '_site');
const output = path.resolve(process.argv[3] || '_work/player/browser');
const base = 'http://terrasonic.test/';

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await launchBrowser({ executablePath: process.env.TERRASONIC_CHROMIUM,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { audio: [], previews: [], layouts: [], fixture: 'Browser headless, silent final output, real Web Audio nodes; no human listening' };
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
    await context.route('**/*', async route => {
      if (/^(blob:|data:)/.test(route.request().url())) return route.continue();
      if (!route.request().url().startsWith(base)) return route.abort();
      const file = path.resolve(site, new URL(route.request().url()).pathname.slice(1) || 'index.html');
      if (file.startsWith(site + path.sep) && fs.existsSync(file)) await route.fulfill({ path: file });
      else await route.fulfill({ status: 404 });
    });
    await context.addInitScript(() => {
      localStorage.setItem('ts_lang', 'es');
      localStorage.setItem('ts_prefs', JSON.stringify({version:1,configured:true,values:{voice:false}}));
      Object.defineProperty(window, 'DCLogic', { configurable: true, set(value) {
        Object.defineProperty(window, 'DCLogic', { value, writable: true, configurable: true });
        const original = value.prototype.setState;
        value.prototype.setState = function(...args) { window.__app = this; return original.apply(this, args); };
      } });
      const Native = window.AudioContext;
      window.__audioMonitors = [];
      window.AudioContext = class extends Native {
        createDynamicsCompressor() {
          const compressor = super.createDynamicsCompressor(), nativeConnect = compressor.connect.bind(compressor);
          compressor.connect = (destination, ...args) => {
            if (destination === this.destination) {
              const analyser = this.createAnalyser(), silent = this.createGain();
              analyser.fftSize = 512; silent.gain.value = 0;
              nativeConnect(analyser); analyser.connect(silent); silent.connect(destination);
              window.__audioMonitors.push(analyser);
              return destination;
            }
            return nativeConnect(destination, ...args);
          };
          return compressor;
        }
      };
      window.__audioPeak = () => {
        let peak = 0;
        for (const analyser of window.__audioMonitors) {
          const samples = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(samples);
          for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
        }
        return peak;
      };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base); await page.waitForFunction(() => window.__app);
    await page.evaluate(() => { __app.state.sfx = false; });
    await page.locator('#tour-nav button').first().click();
    if (process.argv.includes('--layout-only')) {
      await page.locator('.discgrid .dcard').first().click();
      await page.waitForFunction(() => __app.cur());
    } else for (const [setIndex, set] of ['eic', 'prev'].entries()) {
      if (setIndex) await page.locator('#tour-sets button').nth(setIndex).click();
      await page.locator('.discgrid .dcard').first().click();
      await page.waitForFunction(() => __app.cur());
      await page.evaluate(() => { __app.setState({ mute: __app.allMute(false), leadOverride: 'mama' }); });
      for (const mode of ['melody', 'raw']) {
        await page.locator('.player-modes button').nth(mode === 'melody' ? 0 : 1).click();
        assert.equal(await page.locator('.player-detail .chips').count(),mode==='melody'?1:0);
        assert.equal(await page.locator('.band-stage .stage-musician').count(),5);
        const slider = page.locator('#playback-position');
        await slider.focus(); await slider.press('Home'); await slider.press('ArrowRight');
        assert.equal(await page.evaluate(() => __app.playerPosition()), 1);
        assert.equal(await page.evaluate(() => __app.state.playing), false);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'playback-position');
        await page.locator('#tour-play button').click();
        await page.waitForFunction(() => __app.state.playing && __app.state.col >= 4);
        await page.waitForFunction(() => __audioPeak() > .00001);
        const peak = await page.evaluate(() => __audioPeak());
        await page.locator('#tour-play button').click();
        const paused = await slider.inputValue();
        await page.waitForTimeout(150);
        const silent = await page.evaluate(() => __audioPeak());
        assert(silent < .00001, 'Paused graphs must have no measurable residual output');
        await page.waitForTimeout(200); assert.equal(await slider.inputValue(), paused);
        await page.locator('#tour-play button').click();
        await page.waitForFunction(position => __app.playerPosition() > +position, paused);
        await page.locator('#tour-play button').click();
        await slider.evaluate(element => { element.value = '35'; element.dispatchEvent(new Event('input', { bubbles: true })); });
        assert.deepEqual(await page.evaluate(() => [__app.state.frame, __app.state.col, __app.state.playing]), [1, 6, false]);
        assert.equal(await slider.inputValue(), '35');
        const date = await page.locator('.when b').textContent();
        assert(await page.evaluate(() => __app.state.events.length > 0));
        assert.equal(await page.locator('.event-history, #tour-more, .current-event').count(),0);
        assert.equal(await page.locator('.map-legend .legend-choice').count(),3);
        assert.equal(await page.locator('#tour-machine .heard > div').count(),448);
        assert.equal(await page.getByRole('button',{name:'Escenario',exact:true}).count(),0);
        assert.equal(await page.locator('.listen-member').count(),5);
        const before = await page.evaluate(() => __app.playerPosition());
        await page.locator('#tour-lang button').nth(1).click();
        assert.equal(await page.evaluate(() => __app.playerPosition()), before);
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        assert.match(await page.locator('#playback-position').getAttribute('aria-valuetext'), /Map:/);
        await page.locator('#tour-lang button').first().click();
        report.audio.push({ set, mode, peak, afterPausePeak: silent, pausedPosition: +paused, chosenDate: date, errors: [...errors] });
        console.log('PASS playback', set, mode, 'pause/resume/seek/keyboard/history/language/audio silence');
      }
      if (setIndex === 0) await page.evaluate(() => __app.goSub(0));
    }
    if (!process.argv.includes('--layout-only')) {
      await page.evaluate(() => {
        __app.setEngine('melody'); __app.setBandMute(__app.only('mama')); __app.seekPosition(0);
      });
      await page.locator('#tour-play button').click();
      await page.waitForFunction(() => __app.state.col === 1 && __audioPeak() > .00001);
      const mama = page.locator('.listen-member').nth(2);
      await mama.click();
      assert.equal(await page.locator('.band-stage .stage-musician').count(),0);
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => __app.state.playing), true);
      assert((await page.evaluate(() => __audioPeak())) < .00001, 'Individual mute also cuts reverb');
      assert.equal(await page.evaluate(() => !!__app.voiceGroups.mama), false);
      await mama.click();
      assert.equal(await page.locator('.band-stage .stage-musician').count(),1);
      await page.waitForTimeout(30);
      assert((await page.evaluate(() => __audioPeak())) < .00001, 'Unmuting must not revive an earlier tail');
      await page.locator('#tour-play button').click();
      console.log('PASS isolated mute with no resumed reverb tail');
      await page.locator('#tour-nav button').nth(1).click();
      for (const [i, key] of ['silbo','inti','mama','yaku','illapa'].entries()) {
        await page.locator('.bpick button').nth(i).click();
        const preview = page.locator('.avatar-actions > button').first();
        await preview.click();
        await page.waitForFunction(key => __app.state.previewKey === key && !__app.state.audioPending, key);
        await page.waitForFunction(() => __audioPeak() > .00001);
        const peak = await page.evaluate(() => __audioPeak());
        assert.deepEqual(await page.evaluate(() => Object.keys(__app.voiceGroups)), [key]);
        await preview.click(); await page.waitForTimeout(150);
        const afterStop = await page.evaluate(() => __audioPeak());
        assert(afterStop < .00001, key + ' solo must stop completely');
        assert.equal(await page.evaluate(() => __app.state.previewKey), '');
        report.previews.push({ key, peak, afterStop });
        console.log('PASS instrument preview', key, 'start/stop/reduced motion/isolated graph');
      }
      await page.locator('#tour-nav button').first().click();
      await page.locator('.discgrid .dcard').first().click();
    }
    if(!process.argv.includes('--layout-only')){
      await page.evaluate(()=>{__app.stop();__app.setBandMute(__app.allMute(true));__app.seekPosition(0);});
      for(let pass=0;pass<2;pass++){
        const before=await page.evaluate(()=>__app.playerPosition());await page.locator('#tour-play button').click();await page.waitForFunction(position=>__app.state.playing&&__app.playerPosition()>position+1,before);
        assert(await page.evaluate(()=>Object.values(__app.state.mute).every(Boolean)),'Play must preserve an explicit all-instruments mute');
        assert((await page.evaluate(()=>__audioPeak()))<.00001);await page.locator('#tour-play button').click();
      }
      report.allMutedPreserved=true;console.log('PASS explicit all-instruments mute survives play and resume');
    }
    if(process.argv.includes('--all-muted'))await page.evaluate(()=>__app.setBandMute(__app.allMute(true)));
    else await page.evaluate(()=>__app.setBandMute(__app.only('mama')));
    for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1342, height: 605 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => __app.resetScreenScroll());
      await page.waitForTimeout(80);
      const geometry = await page.evaluate(() => {
        const root = document.querySelector('.px'), screen = document.querySelector('.scr');
        const clipped = [...screen.querySelectorAll('button,input,select,.map-legend')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width && (r.left < -1 || r.right > innerWidth + 1);
        }).map(el => ({ tag: el.tagName, id: el.id, text: el.textContent.slice(0, 45) }));
        return { width: innerWidth, rootWidth: root.scrollWidth, screenWidth: screen.scrollWidth,
          screenClientWidth: screen.clientWidth, clipped,
          bandBottom: document.querySelector('.listen-band').getBoundingClientRect().bottom,
          footerTop: document.querySelector('footer.bar').getBoundingClientRect().top };
      });
      await page.screenshot({ path: path.join(output, 'player-' + viewport.width + '.png') });
      report.layouts.push({ viewport, geometry });
      assert.deepEqual(geometry.clipped, [], 'Controls and legend must stay within the viewport');
      assert(geometry.screenWidth <= geometry.screenClientWidth + 1, 'No horizontal player overflow');
      if (viewport.width >= 1280 && !process.argv.includes('--all-muted')) assert(geometry.bandBottom <= Math.min(geometry.footerTop,viewport.height),
        'Desktop must show the map, controls, legend and five complete musicians together: ' + JSON.stringify(geometry));
    }
    assert.deepEqual(errors, []);
    await context.close();
  } finally { fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2)); await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
