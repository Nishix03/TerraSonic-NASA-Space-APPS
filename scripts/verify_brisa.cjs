const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site = path.resolve(process.argv[2] || '_site');
const output = path.resolve(process.argv[3] || '_work/brisa/browser');
const base = 'http://terrasonic.test/';

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await launchBrowser({ executablePath: process.env.TERRASONIC_CHROMIUM,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { preferences: [], journeys: [], errors: [],
    fixture: 'Browser emulated viewports, speech API stubs for lifecycle checks, native Web Audio with muted final output; no human timbre or assistive-technology test' };
  async function create(options = {}) {
    const context = await browser.newContext({ locale: options.locale || 'es-PE',
      viewport: options.viewport || { width: 1366, height: 768 }, reducedMotion: 'reduce' });
    await context.route('**/*', async route => {
      if (/^(blob:|data:)/.test(route.request().url())) return route.continue();
      if (!route.request().url().startsWith(base)) return route.abort();
      const file = path.resolve(site, new URL(route.request().url()).pathname.slice(1) || 'index.html');
      if (file.startsWith(site + path.sep) && fs.existsSync(file)) return route.fulfill({ path: file });
      return route.fulfill({ status: 404 });
    });
    await context.addInitScript(options => {
      if (options.savedLang && !localStorage.getItem('ts_lang')) localStorage.setItem('ts_lang', options.savedLang);
      if (options.configured && !localStorage.getItem('ts_prefs')) localStorage.setItem('ts_prefs', JSON.stringify({version:1,configured:true,values:{voice:options.automatic??false}}));
      Object.defineProperty(window, 'DCLogic', { configurable: true, set(value) {
        Object.defineProperty(window, 'DCLogic', { value, writable: true, configurable: true });
        const original = value.prototype.setState;
        value.prototype.setState = function(...args) { window.__app = this; return original.apply(this, args); };
      } });
      if (options.stubSpeech) window.Audio=undefined;
      if (options.muteNarration) {
        const NativeAudio=window.Audio;
        window.Audio=function (src) { const audio=new NativeAudio(src);audio.muted=true;return audio; };
      }
      if (options.noSpeech) {
        Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});
        Object.defineProperty(window,'SpeechSynthesisUtterance',{value:undefined,configurable:true});
      } else if (options.stubSpeech) {
        window.__speech = { spoken: [], cancelled: 0, active: null };
        window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
          getVoices: () => options.emptyVoices ? [] : [{name:'Spanish fixture',lang:'es-MX'},{name:'English fixture',lang:'en-GB'}],
          speak(utterance) { __speech.active = utterance; __speech.spoken.push({text:utterance.text,lang:utterance.lang}); },
          cancel() { __speech.cancelled++; __speech.active = null; }, addEventListener(){}, removeEventListener(){}
        }});
      }
      if (options.noAudio) { window.AudioContext = undefined; window.webkitAudioContext = undefined; }
      else {
        const Native = window.AudioContext || window.webkitAudioContext;
        if (typeof Native === 'function') window.AudioContext = class extends Native {
          createDynamicsCompressor() {
            const compressor = super.createDynamicsCompressor(), connect = compressor.connect.bind(compressor);
            compressor.connect = (target, ...args) => {
              if (target === this.destination) { const silent = this.createGain(); silent.gain.value=0; connect(silent); silent.connect(target); return target; }
              return connect(target, ...args);
            }; return compressor;
          }
        };
      }
    }, options);
    const page = await context.newPage(); page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(base); await page.waitForFunction(() => window.__app);
    await page.evaluate(() => { __app.state.sfx = false; });
    return { context, page };
  }
  const next = page => page.locator('#tour-card .tact .primary');
  const close = page => page.locator('#tour-card .tguide .tsay').last();
  try {
    for (const sample of [{locale:'es-PE',expected:'es'}, {locale:'fr-FR',expected:'en'}, {locale:'fr-FR',savedLang:'es',expected:'es'}]) {
      const { context, page } = await create(sample);
      await page.locator('#preferences-dialog').waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), sample.expected);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'preferences-voice');
      await page.locator('.preferences-header button').first().focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), await page.locator('.preferences-actions button').last().textContent());
      await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.lang), 'es');
      await page.screenshot({ path: path.join(output,'preferences-'+sample.locale+'-'+sample.expected+'.png') });
      for (const id of ['big','contrast','reducedMotion']) await page.locator('#preferences-'+id).check();
      await page.locator('.preferences-actions button').first().click();
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ts_prefs')));
      assert(saved.configured && saved.values.big && saved.values.contrast && saved.values.reducedMotion);
      assert.equal(await page.evaluate(() => __app.bandReduced()), true);
      await page.reload(); await page.waitForFunction(() => window.__app);
      assert.equal(await page.locator('#preferences-dialog').count(), 0);
      assert.equal(await page.evaluate(() => __app.state.big && __app.state.contrast && __app.state.reducedMotion), true);
      report.preferences.push({ ...sample, saved });
      console.log('PASS preferences', sample.locale, sample.expected, 'focus/combinations/persistence');
      await context.close();
    }
    const { context, page } = await create({ configured:true, stubSpeech:true });
    const nativeAudio=await page.evaluate(()=>typeof(window.AudioContext||window.webkitAudioContext)==='function');
    report.nativeAudioAvailable=nativeAudio;
    await page.locator('#tour-nav button').nth(2).click();
    await page.getByRole('button',{name:'Prueba práctica',exact:true}).click();
    await page.locator('#tour-drop input').setInputFiles(path.join(site,'fotogramas/ver2025_2.webp'));
    await page.waitForFunction(() => __app.state.custom?.kind === 'image' && __app.state.sub === 0);
    await page.locator('#playback-position').evaluate(el => { el.value='8'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    const snapshot = await page.evaluate(() => JSON.stringify([__app.state.tab,__app.state.sub,__app.state.disc,__app.state.frame,__app.state.col,__app.state.custom.url,__app.state.customMode,__app.state.mute,__app.state.playing]));
    await page.locator('#tour-guide').click();
    assert.equal(await page.locator('#tour-card ts-avatar').count(),0);
    assert.match(await page.locator('#tour-card .tmeta').textContent(),/Brisa/);
    await page.locator('#tour-card .tguide .tsay').first().click();
    assert.equal(await page.evaluate(() => __app.state.speaking),true);
    assert.equal(await page.evaluate(() => __speech.spoken.at(-1).lang),'es-MX');
    await next(page).click(); assert.equal(await page.evaluate(() => __app.state.speaking),false);
    await page.locator('#tour-card .tguide .tsay').first().click();
    await page.locator('#tour-lang button').nth(1).click(); assert.equal(await page.evaluate(() => __app.state.speaking),false);
    assert.match(await page.locator('#tour-b').textContent(),/grid scale runs from blue/);
    await page.locator('#tour-lang button').first().click(); await close(page).click();
    assert.equal(await page.evaluate(() => JSON.stringify([__app.state.tab,__app.state.sub,__app.state.disc,__app.state.frame,__app.state.col,__app.state.custom.url,__app.state.customMode,__app.state.mute,__app.state.playing])),snapshot);
    assert.equal(await page.evaluate(() => document.activeElement.id),'tour-guide');
    report.journeys.push('Contextual help preserves file/date/position, restores focus and cancels voice on step/language changes');
    if(nativeAudio){
    await page.locator('#tour-play button').click(); await page.waitForFunction(() => __app.state.playing);
    await page.locator('#tour-guide').click();
    await page.locator('#tour-card .tguide .tsay').first().click();
    assert(Math.abs(await page.evaluate(() => __app.master.gain.value)-.24)<.0001);
    await page.locator('#tour-card .tguide .tsay').first().click();
    assert(Math.abs(await page.evaluate(() => __app.master.gain.value)-.8)<.0001);
    await close(page).click(); await page.locator('#tour-play button').click();
    report.journeys.push('Spoken help ducks and restores real music output without restarting playback');
    }else report.journeys.push('Native Web Audio is absent in this test build; mixing and audible playback are not verified here');
    for (const viewport of [{width:1366,height:768},{width:390,height:844}]) {
      await page.setViewportSize(viewport);
      await page.locator('#tour-guide').click();
      // Start can be offered only on the first contextual step.
      while (await page.evaluate(() => __app.state.tour>1)) await page.locator('#tour-card .tact .quiet').click();
      await page.locator('#tour-card .tbubble .btn').first().click();
      assert.equal(await page.evaluate(() => __app.state.tour),1); assert.match(await next(page).textContent(),/Saltar paso/);
      await page.locator('.discgrid .dcard').first().click();
      await page.waitForFunction(() => __app.state.tour===2);
      assert.match(await next(page).textContent(),/Saltar paso/);
      await page.locator('#tour-play button').click();
      if(!nativeAudio){await page.waitForFunction(()=>!!__app.state.audioError);await page.locator('#tour-card .tbubble .btn').click();}
      await page.waitForFunction(() => __app.state.tour===3);
      await page.locator('.legend-choice').last().click(); assert.match(await next(page).textContent(),/Terminar guía/);
      await page.locator('.legend-choice').first().click(); assert.equal(await next(page).isDisabled(),false);
      await page.screenshot({path:path.join(output,'tutorial-'+viewport.width+'.png')});
      await next(page).click(); assert.equal(await page.locator('#tour-card').count(),0);
      assert.equal(await page.evaluate(() => __app.state.playing),nativeAudio);
      if(nativeAudio)await page.locator('#tour-play button').click();
      report.journeys.push('Tutorial completed at '+viewport.width+'px with '+(nativeAudio?'real playback':'the written no-audio alternative'));
    }
    await page.locator('#tour-nav button').nth(1).click();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.bpick button').nth(1).click();
    await page.waitForFunction(() => document.querySelector('earthbeat-dance[data-dancing]'));
    await page.locator('#tour-a11y summary').click();
    await page.getByRole('button',{name:'Movimiento reducido'}).click();
    await page.locator('earthbeat-dance[data-dancing]').waitFor({state:'detached'});
    assert.match(await page.locator('.bportrait-live').getAttribute('src'),/inti\/pose-banda\.webp$/);
    report.journeys.push('The reduced-motion preference leaves the original 2D pose visible');
    await context.close();
    for (const options of [{noAudio:true,noSpeech:true,muteNarration:true},{stubSpeech:true,emptyVoices:true}]) {
      const {context,page}=await create({configured:true,...options});
      await page.locator('#tour-guide').click();
      if (options.emptyVoices) {
        await page.locator('#tour-card .tguide .tsay').first().click();
        assert.equal(await page.evaluate(()=>__app.state.speaking),false);
        assert.match(await page.locator('#tour-card .tbubble').textContent(),/No hay una voz/);
      } else {
        await page.locator('#tour-card .tbubble .btn').first().click();
        await page.locator('.discgrid .dcard').first().click();
        await page.locator('#tour-play button').click();
        await page.waitForFunction(()=>!!__app.state.audioError);
        await page.locator('#tour-card .tbubble .btn').click();
        await page.locator('.legend-choice').first().click(); await next(page).click();
        assert.equal(await page.locator('#tour-card').count(),0);
      }
      report.journeys.push(options.emptyVoices?'Empty voice list keeps written help':'Tutorial has a written fallback without Web Audio or speech APIs');
      await context.close();
    }
    const automatic = await create({configured:true,automatic:true,noSpeech:true,muteNarration:true});
    const speaking = automatic.page;
    const nav = speaking.locator('#tour-nav button');
    for(const [index,section] of [[0,'juke'],[1,'band'],[2,'practice'],[3,'tech']]){
      await nav.nth(index).click();
      await speaking.waitForFunction(section=>__app.brisaAudio?.src.endsWith('/es-'+section+'-1.mp3')&&__app.brisaAudio.currentTime>0,section);
      assert(await speaking.locator('.section-voice').getByText('Detener voz',{exact:true}).isVisible());
    }
    await speaking.locator('#tour-lang button').nth(1).click();
    await speaking.waitForFunction(()=>__app.brisaAudio?.src.endsWith('/en-tech-1.mp3')&&__app.brisaAudio.currentTime>0);
    await speaking.locator('#tour-a11y summary').click();
    await speaking.getByRole('button',{name:'Voice mode',exact:true}).click();
    assert.equal(await speaking.evaluate(()=>__app.state.speaking),false);
    await speaking.keyboard.press('Escape');
    await nav.nth(1).click();
    assert.equal(await speaking.evaluate(()=>__app.state.speaking),false);
    await speaking.getByRole('button',{name:'Listen to voice',exact:true}).click();
    await speaking.waitForFunction(()=>__app.brisaAudio?.currentTime>0);
    await speaking.getByRole('button',{name:'Stop voice',exact:true}).click();
    await speaking.reload();
    assert.equal(await speaking.evaluate(()=>JSON.parse(localStorage.getItem('ts_prefs')).values.voice),false);
    await automatic.context.close();
    report.journeys.push('Bundled Brisa narration plays in Spanish and English without system voices, and respects stop and opt-out');
    assert.deepEqual(report.errors,[]);
    report.journeys.forEach(check=>console.log('PASS',check));
  } finally { fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2)); await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
