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
  function observe(page) {
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.responses.push(response.url()); });
  }
  async function ready(page, target) {
    await page.locator(target).waitFor({ state: 'visible' });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
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
      await page.goto(url);
      const intro = page.locator('.ts-cinema');
      await intro.waitFor();
      assert.equal(await intro.getAttribute('data-duration'), viewport === mobile ? '3000' : '5200');
      assert.match(await intro.textContent(), /EARTHBEAT/);
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
      await page.locator('#tour-nav button').nth(1).click();
      const dance = page.locator('earthbeat-dance');
      const characters = ['silbo', 'inti', 'mama', 'yaku', 'illapa'];
      for (const [index, key] of characters.entries()) {
        if (index) await page.locator('.bpick button').nth(index).click();
        await page.waitForFunction(key => {
          const el = document.querySelector('earthbeat-dance');
          return el?.dataset.character === key && el.dataset.frame === '1' && el.querySelector('.dance-frame').naturalWidth > 0;
        }, key);
        await page.getByRole('button', { name: 'Pausar baile' }).click();
        const frame = await dance.getAttribute('data-frame');
        await page.waitForTimeout(190);
        assert.equal(await dance.getAttribute('data-frame'), frame);
        if (index === 0) {
          await page.getByRole('button', { name: 'Bailar', exact: true }).click();
          await page.waitForFunction(start => document.querySelector('earthbeat-dance')?.dataset.frame !== start, frame);
          await page.screenshot({ path: path.join(output, `dance-${viewport.width}.png`) });
        }
      }
      assert.equal(new Set(downloads).size, 20);
      await page.locator('#tour-a11y summary').click();
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
      await page.locator('.hero h1').waitFor();
      assert.equal(await intro.count(), 0, 'Reload honors the saved motion preference');
      await page.locator('#tour-nav button').nth(2).click();
      assert(await page.locator('#tour-drop input').isVisible());
      assert.match(await page.locator('.rain-chart').getAttribute('alt'), /NASA POWER/);
      assert.equal(await page.locator('#tour-sample p').count(), 0);
      await page.locator('#tour-topics button').nth(1).click();
      assert.equal(await page.locator('#tour-steps li').count(), 8);
      assert.equal(await page.locator('.method-notes a:visible').count(), 5);
      assert.equal(await page.locator('.team-names li').count(), 6);
      assert.doesNotMatch(await page.locator('.team-names').textContent(), /@/);
      await page.screenshot({ path: path.join(output, `method-${viewport.width}.png`) });
      report.animation.push({ viewport, characters, patterns: [15, [25, 50, 25], 0] });
      await context.close();
    }
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
      await ready(page, '.ts-cinema button');
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
