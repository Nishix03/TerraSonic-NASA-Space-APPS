const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site = path.resolve(process.argv[2] || '_site');
const output = path.resolve(process.argv[3] || '_work/convert/browser');
const base = 'http://terrasonic.test/';

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await launchBrowser({ executablePath: process.env.TERRASONIC_CHROMIUM,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const requests = [], errors = [], checks = [];
  try {
    await context.route('**/*', async route => {
      requests.push({ method: route.request().method(), url: route.request().url() });
      if (/^(blob:|data:)/.test(route.request().url())) return route.continue();
      if (!route.request().url().startsWith(base)) return route.abort();
      const file = path.resolve(site, new URL(route.request().url()).pathname.slice(1) || 'index.html');
      if (file.startsWith(site + path.sep) && fs.existsSync(file)) return route.fulfill({ path: file });
      return route.fulfill({ status: 404 });
    });
    await context.addInitScript(() => {
      localStorage.setItem('ts_lang', 'es');
      localStorage.setItem('ts_prefs', JSON.stringify({version:1,configured:true,values:{}}));
      Object.defineProperty(window, 'DCLogic', { configurable: true, set(value) {
        Object.defineProperty(window, 'DCLogic', { value, writable: true, configurable: true });
        const original = value.prototype.setState;
        value.prototype.setState = function(...args) { window.__app = this; return original.apply(this, args); };
      } });
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base); await page.waitForFunction(() => window.__app);
    await page.evaluate(() => { __app.state.sfx = false; });
    await page.getByRole('button',{name:'¿Cómo funciona?',exact:true}).click();
    await page.getByRole('button',{name:'Prueba práctica',exact:true}).click();
    const imageInput = () => page.locator('#tour-drop input');
    assert.equal(await page.locator('input[type=file]').count(),1);
    await page.locator('#tour-sample button').click();
    await page.waitForFunction(() => __app.state.custom?.kind === 'rain' && __app.cur()?.cells.length === 448);
    assert.equal(await page.locator('#tour-machine .heard > div').count(),448);
    assert.match(await page.locator('#player-legend').textContent(),/Bajo el promedio/);
    checks.push('NASA POWER rainfall opens a playable analysis with the right units');
    await imageInput().setInputFiles(path.join(site, 'fotogramas/ver2025_2.webp'));
    await page.waitForFunction(() => __app.state.custom?.name === 'ver2025_2.webp' && __app.state.sub === 1);
    assert.equal(await page.evaluate(() => __app.state.customMode), 'free');
    assert.equal(await page.locator('#tour-sample').count(),0);
    assert.match(await page.locator('.practice-example img').getAttribute('src'),/^blob:/);
    while(await page.locator('.listen-member[aria-pressed="true"]').count())await page.locator('.listen-member[aria-pressed="true"]').first().click();
    await page.evaluate(()=>window.__previousAnalysis=__app.cur());await page.locator('.file-settings select').selectOption('palette');
    await page.waitForFunction(()=>__app.cur()!==window.__previousAnalysis&&__app.state.customMode==='palette');
    assert(await page.evaluate(()=>Object.values(__app.state.mute).every(Boolean)),'changing image interpretation keeps the user’s instrument mix');
    assert.match(await page.locator('.listen-band [role="status"]').textContent(),/silenciados/);
    checks.push('Local WebP analyzed in free-color mode');
    const accepted = await page.evaluate(() => __app.state.custom.url);
    for (const fixture of [
      { name: 'data.csv', mimeType: 'text/csv', buffer: Buffer.from('x,y\n1,2'), expected: /Formato no admitido/ },
      { name: 'invalid.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not supported'), expected: /Formato no admitido/ },
      { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('invalid image'), expected: /No se pudo leer la imagen/ },
      { name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(8 * 1024 * 1024 + 1), expected: /8 MB/ },
    ]) {
      await imageInput().setInputFiles({ name: fixture.name, mimeType: fixture.mimeType, buffer: fixture.buffer });
      await page.waitForFunction(pattern => new RegExp(pattern).test(__app.renderVals().upMsg), fixture.expected.source);
      assert.equal(await page.evaluate(() => __app.state.custom.url), accepted);
      assert.equal(await imageInput().inputValue(), '');
      checks.push(fixture.name + ' rejected without losing the accepted file');
    }
    const header = Buffer.alloc(33); header.set([137,80,78,71,13,10,26,10]);
    header.write('IHDR', 12); header.writeUInt32BE(40000, 16); header.writeUInt32BE(40000, 20);
    await imageInput().setInputFiles({ name: 'too-many-pixels.png', mimeType: 'image/png', buffer: header });
    await page.waitForFunction(() => /32 millones/.test(__app.renderVals().upMsg));
    assert.equal(await page.evaluate(() => __app.state.custom.url), accepted);
    checks.push('A tiny file declaring 1.6 billion pixels rejected before image decode');
    await page.locator('#tour-lang button').nth(1).click();
    assert.match(await page.locator('#player-legend').textContent(),/Cooler.*Neutral.*Warmer/s);
    await page.getByRole('button',{name:'From map to sound',exact:true}).click();
    await page.getByRole('button',{name:'Try it',exact:true}).click();
    assert.equal(await page.locator('.practice-example img').getAttribute('src'),accepted);
    checks.push('The uploaded image replaces the rain sample and survives navigation and language changes');
    for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }]) {
      await page.setViewportSize(viewport); await page.evaluate(() => __app.resetScreenScroll());
      const sizes = await page.locator('.scr').evaluate(el => [el.clientWidth, el.scrollWidth]);
      assert(sizes[1] <= sizes[0] + 1, 'Conversion screen must not overflow horizontally');
      await page.screenshot({ path: path.join(output, 'convert-' + viewport.width + '.png') });
    }
    assert.deepEqual(errors, []);
    assert(requests.every(request => request.method === 'GET'), 'Local files must not be uploaded');
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checks, errors,
      nonGetRequests: requests.filter(request => request.method !== 'GET'),
      fixture: 'Browser with local route fixtures and emulated viewport sizes' }, null, 2));
    checks.forEach(check => console.log('PASS', check));
  } finally { await context.close(); await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
