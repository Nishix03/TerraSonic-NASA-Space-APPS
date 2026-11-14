const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { gzipSync } = require('node:zlib');
const { launchBrowser } = require('./browser_fixture.cjs');

const site = path.resolve(process.argv[2] || '_site');
const output = path.resolve(process.argv[3] || '_work/reto05-v3/browser');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.json': 'application/json' };
const mobile = { width: 390, height: 844 };
const desktop = { width: 1342, height: 605 };

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const pages = new Map();
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://local');
    const asset = path.resolve(site, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
    if (!asset.startsWith(site + path.sep) || !fs.existsSync(asset)) return response.writeHead(404).end();
    const extension = path.extname(asset);
    if (!pages.has(asset)) {
      const binary = fs.readFileSync(asset);
      const gzip = ['.html', '.js', '.svg', '.css', '.json'].includes(extension);
      pages.set(asset, { body: gzip ? gzipSync(binary) : binary, gzip });
    }
    const { body, gzip } = pages.get(asset);
    response.writeHead(200, { 'Content-Type': types[extension], 'Content-Length': body.length, 'Cache-Control': 'no-store', ...(gzip && { 'Content-Encoding': 'gzip' }) });
    response.end(body);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  const browser = await launchBrowser({ executablePath: process.env.TERRASONIC_CHROMIUM });
  const report = { timing: [], animation: [], errors: [], responses: [], profile: 'Chromium, 4× CPU slowdown, 150 ms latency, 200 KiB/s download, gzip; fresh mobile contexts. Section timing is click to the section heading being visible.', physicalVibrationVerified: false };
  const releaseUrl = process.env.EARTHBEAT_PREVIEW_URL || url;
  function observe(page) {
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.responses.push(response.url()); });
  }
  async function ready(page, target) {
    await page.locator(target).waitFor({ state: 'visible' });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  async function assertMoving(page, selector) {
    await page.waitForFunction(selector => {
      const element = document.querySelector(selector);
      return element?.getAnimations().some(animation => animation.playState === 'running' && animation.currentTime > 0);
    }, selector);
    const before = await page.locator(selector).first().evaluate(element => getComputedStyle(element).transform);
    await page.waitForFunction(({ selector, before }) => getComputedStyle(document.querySelector(selector)).transform !== before, { selector, before });
  }
  try {
    for (const viewport of [mobile, desktop]) {
      const context = await browser.newContext({ viewport, locale: 'es-PE' });
      await context.addInitScript(() => {
        window.vibrations = [];
        Object.defineProperty(navigator, 'vibrate', { value: pattern => { vibrations.push(pattern); return true; } });
      });
      const page = await context.newPage();
      observe(page);
      const downloads = [];
      page.on('request', request => { if (request.url().includes('/baile/')) downloads.push(request.url()); });
      await page.goto(releaseUrl);
      const intro = page.locator('.ts-cinema');
      await intro.waitFor();
      assert.equal(await intro.getAttribute('data-duration'), viewport === mobile ? '6800' : '5200');
      assert.match(await intro.textContent(), /EARTHBEAT/);
      await assertMoving(page, '.cinema-world');
      await assertMoving(page, '.cinema-meteor');
      await intro.getByRole('button', { name: 'Pausar', exact: true }).click();
      assert(await page.locator('.cinema-world').evaluate(element => element.getAnimations().every(animation => animation.playState === 'paused')));
      await intro.getByRole('button', { name: 'Reanudar', exact: true }).click();
      await page.screenshot({ path: path.join(output, `intro-${viewport.width}.png`) });
      await page.getByRole('button', { name: 'Saltar introducción' }).click();
      assert.equal(await intro.count(), 0);
      assert(await page.locator('.preferences-header [lang="es"]').isVisible());
      await page.screenshot({ path: path.join(output, `welcome-${viewport.width}.png`) });
      await page.getByRole('button', { name: 'Ver guía · 3 pasos' }).click();
      const guide = page.locator('#tour-card');
      assert(await guide.locator('img.brisa-badge').isVisible());
      for (let step = 0; step < 2; step++) await guide.getByRole('button', { name: 'Saltar paso' }).click();
      await guide.getByRole('button', { name: 'Terminar guía' }).click();
      assert.equal(await guide.count(), 0);
      assert.equal(downloads.length, 0, 'Dance frames only load in the band');
      await page.getByRole('button', { name: 'Repetir introducción' }).click();
      await intro.waitFor();
      await page.keyboard.press('Escape');
      for (const selector of ['.solar-corona', '.solar-eclipse', '.space-meteor.meteor-one', '.space-flight.space-probe', '.space-flight.flight-one']) {
        if (await page.locator(selector).isVisible()) await assertMoving(page, selector);
      }
      assert.equal(await page.locator('.universe-portals, .portal-button').count(), 0);
      const homeMap = page.locator('.home-map img');
      const initialMap = await homeMap.getAttribute('src');
      const initialCaption = await page.locator('.home-map figcaption').textContent();
      await page.locator('#tour-nav button').nth(1).click();
      await page.locator('.bidentity h1').waitFor();
      await page.locator('.brand').click();
      await page.waitForFunction(previous => {
        const map = document.querySelector('.home-map img');
        return map && map.getAttribute('src') !== previous && map.naturalWidth > 0;
      }, initialMap);
      const nextMap = await homeMap.getAttribute('src');
      assert.notEqual(nextMap, initialMap);
      assert.notEqual(await page.locator('.home-map figcaption').textContent(), initialCaption);
      assert.match(nextMap, /fotogramas/);
      await page.waitForFunction(() => document.querySelector('.home-map img')?.naturalWidth > 0);
      await page.locator('#tour-nav button').nth(1).click();
      const dance = page.locator('earthbeat-dance');
      await page.locator('earthbeat-dance-button button').waitFor();
      assert.equal(await page.locator('.avatar-actions button').count(), 2);
      const characters = ['silbo', 'inti', 'mama', 'yaku', 'illapa'];
      for (const [index, key] of characters.entries()) {
        if (index) await page.locator('.bpick button').nth(index).click();
        await page.waitForFunction(key => {
          const el = document.querySelector('earthbeat-dance');
          return el?.dataset.character === key && el.dataset.frame === '1' && el.querySelector('.dance-frame').naturalWidth > 0;
        }, key);
        const frame = await dance.getAttribute('data-frame');
        await page.waitForFunction(start => document.querySelector('earthbeat-dance')?.dataset.frame !== start, frame);
        if (index === 0) {
          await page.getByRole('button', { name: 'Pausar baile' }).click();
          const stoppedAt = await dance.getAttribute('data-frame');
          await page.waitForTimeout(200);
          assert.equal(await dance.getAttribute('data-frame'), stoppedAt);
          await page.getByRole('button', { name: 'Bailar', exact: true }).click();
          await page.waitForFunction(start => document.querySelector('earthbeat-dance')?.dataset.frame !== start, stoppedAt);
          await page.screenshot({ path: path.join(output, `dance-${viewport.width}.png`) });
        }
      }
      assert.equal(new Set(downloads).size, 20);
      await page.locator('#tour-nav button').first().click();
      await page.locator('.discgrid .dcard').first().click();
      const stage = page.locator('.stage-musician');
      await stage.first().waitFor();
      assert.equal(await stage.count(), 5);
      assert.equal(await page.locator('.stage-musician[aria-pressed="true"]').count(), 5);
      assert.equal(await page.locator('.band-stage .stage-indicator, .band-stage .stage-note, .stage-motion-button').count(), 0);
      assert.equal(await page.locator('#stage-motion-status').textContent(), '');
      await stage.first().click();
      assert.equal(await stage.count(), 5);
      assert.equal(await stage.first().getAttribute('aria-pressed'), 'false');
      await stage.first().press('Space');
      assert.equal(await stage.first().getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#tour-frame #playback-position').count(), 1);
      const speed = page.getByRole('combobox', { name: 'Velocidad', exact: true });
      assert.equal(await speed.inputValue(), '110');
      assert((await speed.boundingBox()).width <= 58);
      const speedText = await page.locator('.transport-speed span').boundingBox();
      assert(speedText.y + speedText.height <= (await speed.boundingBox()).y);
      const mode = page.getByRole('button', { name: 'Melodía', exact: true });
      assert.match(await mode.getAttribute('title'), /acordes y un ritmo/);
      const modeHelp = page.locator('.mode-help summary');
      assert((await modeHelp.locator('span').boundingBox()).width <= 20);
      assert.equal(await modeHelp.evaluate(el => getComputedStyle(el).borderTopWidth), '0px');
      await modeHelp.press('Enter');
      assert.match(await page.locator('.mode-help dl').textContent(), /tonos directos/);
      const helpBox = await page.locator('.mode-help dl').boundingBox();
      assert(helpBox.x >= 0 && helpBox.x + helpBox.width <= viewport.width);
      await modeHelp.click();
      assert.equal(await page.locator('.mode-help').getAttribute('open'), null);
      if (viewport.width === desktop.width) {
        const panels = await page.locator('#tour-frame, #tour-machine, .listen-band').evaluateAll(els => els.map(el => {
          const rect = el.getBoundingClientRect();
          return [rect.top, rect.bottom];
        }));
        assert.deepEqual(panels, [panels[0], panels[0], panels[0]]);
      }
      const legend = page.locator('.legend-choice');
      assert.equal(await legend.count(), 14);
      assert.equal(await page.locator('.legend-help').count(), 0);
      const explanation = page.locator('.legend-detail');
      assert.match(await explanation.textContent(), /Elige un recuadro de color/);
      await legend.first().click();
      assert.match(await explanation.textContent(), /Calor extremo/);
      const high = await explanation.locator('p').textContent();
      await legend.nth(1).click();
      assert.notEqual(await explanation.locator('p').textContent(), high);
      await legend.last().click();
      assert.match(await explanation.textContent(), /Frío extremo/);
      assert.doesNotMatch(await page.locator('.player-detail .readout').textContent(), /\d/);
      const frameButtons = page.locator('#tour-frame .timeline button');
      await frameButtons.nth(2).click();
      assert.equal(await frameButtons.nth(2).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#playback-position').inputValue(), '56');
      await page.locator('#tour-frame #playback-position').focus();
      await page.keyboard.press('End');
      await page.keyboard.press('Home');
      assert.equal(await page.locator('#playback-position').inputValue(), '0');
      await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
      await page.locator('.band-stage').scrollIntoViewIfNeeded();
      const illapa = page.locator('.stage-musician').last().locator('.stage-note[data-note="rhythm"]').first();
      await illapa.waitFor({timeout:10000});
      assert.equal(await illapa.locator('b').count(), 0);
      assert.equal(await page.locator('.stage-note [data-chord], .stage-note-track[data-chord]').count(), 0);
      assert.equal(await illapa.evaluate(note => getComputedStyle(note, '::before').width), '12px');
      assert.equal(await illapa.locator('small').textContent(), 'Ritmo');
      const drop = await illapa.evaluate(async note => {
        const animation = note.getAnimations()[0];
        await animation.ready;
        const start = note.getBoundingClientRect().top;
        await new Promise(resolve => setTimeout(resolve, 150));
        return note.getBoundingClientRect().top - start;
      });
      assert(drop > 8, 'The marker visibly falls in the actual DOM');
      await page.waitForFunction(() => [...document.querySelectorAll('.stage-note-track')].some(track => track.children.length >= 2));
      await page.locator('.stage-musician earthbeat-dance[data-dancing]').first().waitFor({timeout:10000});
      for (const lane of await stage.all()) {
        const style = await lane.evaluate(el => {
          const lane = el.getBoundingClientRect(), track = el.querySelector('.stage-note-track').getBoundingClientRect();
          return { bg: getComputedStyle(el).backgroundColor, offset: Math.abs((track.x + track.width / 2) - (lane.x + lane.width / 2)) };
        });
        assert.equal(style.bg, 'rgba(0, 0, 0, 0)');
        assert(style.offset < 2, 'Each falling note is centered above its musician');
      }
      await page.screenshot({ path: path.join(output, `stage-${viewport.width}.png`) });
      await page.getByRole('button', { name: 'Pausar', exact: true }).click();
      assert.equal(await page.locator('.stage-musician earthbeat-dance[data-dancing]').count(), 0);
      assert.equal(await page.locator('.stage-note').count(), 0);
      await page.screenshot({ path: path.join(output, `player-${viewport.width}.png`) });
      await page.locator('#tour-a11y summary').scrollIntoViewIfNeeded();
      const header = await page.locator('header.top').boundingBox();
      const layout = await page.locator('.player-layout').boundingBox();
      await page.locator('#tour-a11y summary').click();
      assert.deepEqual(await page.locator('header.top').boundingBox(), header);
      assert.deepEqual(await page.locator('.player-layout').boundingBox(), layout);
      assert.equal(await page.getByRole('button', { name: 'Cómo prefiero usar EarthBeat', exact: true }).count(), 0);
      await page.getByRole('button', { name: 'Vibración', exact: true }).click();
      assert.deepEqual(await page.evaluate(() => vibrations), [15]);
      await page.waitForTimeout(725);
      await page.getByRole('button', { name: 'Probar vibración' }).click();
      assert.deepEqual(await page.evaluate(() => vibrations.at(-1)), [25, 50, 25]);
      await page.getByRole('button', { name: 'Movimiento reducido', exact: true }).click();
      assert.equal(await page.evaluate(() => vibrations.at(-1)), 0);
      assert(await page.getByRole('button', { name: 'Probar vibración' }).isDisabled());
      await page.keyboard.press('Escape');
      await page.reload();
      await intro.waitFor();
      assert.equal(await intro.getAttribute('data-static'), 'true', 'Reload honors reduced motion');
      assert.equal(await intro.evaluate(element => element.getAnimations({ subtree: true }).length), 0);
      await page.getByRole('button', { name: 'Entrar', exact: true }).click();
      assert.notEqual(await homeMap.getAttribute('src'), nextMap, 'Reload advances the home map');
      await page.locator('#tour-nav button').nth(2).click();
      assert(await page.locator('#tour-drop input').isVisible());
      assert.match(await page.locator('.rain-chart').getAttribute('alt'), /NASA POWER/);
      assert.equal(await page.locator('#tour-sample p').count(), 0);
      await page.locator('#tour-topics button').nth(1).click();
      assert.equal(await page.locator('#tour-steps li').count(), 8);
      assert.equal(await page.locator('.method-notes a:visible').count(), 5);
      assert.equal(await page.locator('.team-names li').count(), 6);
      assert.doesNotMatch(await page.locator('.team-names').textContent(), /@/);
      assert(await page.getByRole('heading', { name: 'Creadores de EarthBeat' }).isVisible());
      assert.equal(await page.getByText('Alvaro Mendoza Marín', { exact: true }).count(), 1);
      await page.screenshot({ path: path.join(output, `method-${viewport.width}.png`) });
      report.animation.push({ viewport, characters, patterns: [15, [25, 50, 25], 0] });
      await context.close();
    }
    const accessible = await browser.newContext({ viewport: mobile, locale: 'en', reducedMotion: 'reduce' });
    await accessible.addInitScript(() => {
      localStorage.setItem('ts_prefs', JSON.stringify({ version: 1, configured: true, values: { contrast: true } }));
      localStorage.setItem('ts_stage_note_motion', 'full');
    });
    const accessiblePage = await accessible.newPage();
    observe(accessiblePage);
    await accessiblePage.goto(releaseUrl);
    const staticIntro = accessiblePage.getByRole('dialog', { name: 'EarthBeat presentation' });
    assert.equal(await staticIntro.getAttribute('data-static'), 'true');
    assert.equal(await staticIntro.evaluate(element => element.getAnimations({ subtree: true }).length), 0);
    await staticIntro.getByRole('button', { name: 'Enter', exact: true }).click();
    assert(await accessiblePage.getByRole('heading', { name: 'Listen to the Pacific' }).isVisible());
    await accessiblePage.locator('#tour-nav button').first().click();
    await accessiblePage.locator('.discgrid .dcard').first().click();
    await accessiblePage.getByRole('button', { name: 'Play', exact: true }).click();
    await accessiblePage.locator('.band-stage').scrollIntoViewIfNeeded();
    assert.match(await accessiblePage.locator('#stage-motion-status').textContent(), /device settings/);
    const staticCue = accessiblePage.locator('.stage-note.is-static').first();
    await staticCue.waitFor();
    assert(await staticCue.evaluate(cue => getComputedStyle(cue).opacity === '1' && cue.getAnimations().length === 0));
    assert.equal(await accessiblePage.locator('.stage-motion-button').count(), 0);
    await accessiblePage.emulateMedia({ reducedMotion: 'no-preference' });
    await accessiblePage.waitForFunction(() => document.querySelector('.px.app').dataset.motionMode !== 'reduced');
    assert.equal(await accessiblePage.locator('#stage-motion-status').textContent(), '');
    const activeCue = accessiblePage.locator('.stage-note:not(.is-static)').first();
    await activeCue.waitFor();
    const drop = await activeCue.evaluate(async note => {
      await note.getAnimations()[0].ready;
      const before = note.getBoundingClientRect().top;
      await new Promise(resolve => setTimeout(resolve, 120));
      return note.getBoundingClientRect().top - before;
    });
    assert(drop > 5, 'Falling markers resume after system reduced motion is turned off');
    await accessiblePage.emulateMedia({ reducedMotion: 'reduce' });
    await staticCue.waitFor();
    await accessiblePage.getByRole('button', { name: 'Pause', exact: true }).click();
    assert.equal(await accessiblePage.locator('.stage-note').count(), 0);
    await accessible.close();
    for (let attempt = 0; attempt < 3; attempt++) {
      const context = await browser.newContext({ viewport: mobile, locale: 'es-PE', isMobile: true, hasTouch: true });
      const page = await context.newPage();
      observe(page);
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 204800, uploadThroughput: 102400 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      const start = performance.now();
      await page.goto(url, { waitUntil: 'commit' });
      await ready(page, '.cinema-skip');
      const time = { introReadyMs: Math.round(performance.now() - start) };
      await page.getByRole('button', { name: 'Saltar introducción' }).click();
      await page.locator('#preferences-voice').uncheck();
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      for (const [index, name, target] of [[0, 'escuchar', '.disc-library h1'], [1, 'banda', '.bidentity h1'], [2, 'práctica', '.pagehead h1'], [3, 'tecnología', '#tour-techcards']]) {
        const startSection = performance.now();
        await page.locator('#tour-nav button').nth(index).click();
        await ready(page, target);
        time[name] = Math.round(performance.now() - startSection);
        if (index === 0) {
          const startPlayer = performance.now();
          await page.locator('.dcard').first().click();
          await ready(page, '#player-title');
          time.player = Math.round(performance.now() - startPlayer);
          await page.waitForFunction(() => document.querySelector('.mapbox img.map')?.naturalWidth > 0);
          time.mapLoadedMs = Math.round(performance.now() - startPlayer);
        }
        if (index === 1) {
          await page.waitForFunction(() => document.querySelector('.bportrait-live')?.naturalWidth > 0);
          time.portraitLoadedMs = Math.round(performance.now() - startSection);
        }
        if (index === 2) {
          const startMethod = performance.now();
          await page.locator('#tour-topics button').nth(1).click();
          await ready(page, '#tour-steps');
          time.método = Math.round(performance.now() - startMethod);
        }
      }
      report.timing.push(time);
      console.log(JSON.stringify(time));
      await context.close();
    }
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.responses, []);
    console.log('PASS RETO 05 V3');
  } finally {
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
    await browser.close();
    server.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
