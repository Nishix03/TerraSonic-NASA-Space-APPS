const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.TERRASONIC_PLAYWRIGHT || 'playwright-core');
const site = path.resolve(process.argv[2] || '_site');
const output = path.resolve(process.argv[3] || '_work/convert/browser');
const base = 'http://terrasonic.test/';

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.TERRASONIC_CHROMIUM,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const requests = [], errors = [], checks = [];
  try {
    await context.route('**/*', async route => {
      requests.push({ method: route.request().method(), url: route.request().url() });
      if (!route.request().url().startsWith(base)) return route.abort();
      const file = path.resolve(site, new URL(route.request().url()).pathname.slice(1) || 'index.html');
      if (file.startsWith(site + path.sep) && fs.existsSync(file)) return route.fulfill({ path: file });
      return route.fulfill({ status: 404 });
    });
    await context.addInitScript(() => {
      Object.defineProperty(window, 'DCLogic', { configurable: true, set(value) {
        Object.defineProperty(window, 'DCLogic', { value, writable: true, configurable: true });
        const original = value.prototype.setState;
        value.prototype.setState = function(...args) { window.__app = this; return original.apply(this, args); };
      } });
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base); await page.waitForFunction(() => window.__app);
    await page.evaluate(() => { __app.state.sfx = false; });
    await page.locator('#tour-nav button').nth(2).click();
    const back = async () => { await page.locator('.headtools button').click(); await page.locator('.convert-options').waitFor(); };
    const imageInput = () => page.locator('#tour-drop input');
    const secondary = async () => { const details = page.locator('.convert-secondary').first(); if (!(await details.evaluate(el => el.open))) await details.locator('summary').click(); };
    await page.locator('#tour-image-sample button').click();
    await page.waitForFunction(() => __app.state.custom?.source === 'eic' && __app.state.sub === 1);
    assert.equal(await page.evaluate(() => __app.state.customMode), 'palette');
    checks.push('Bundled NASA sample image analyzed and opened in the player'); await back();
    await imageInput().setInputFiles(path.join(site, 'fotogramas/ver2025_2.webp'));
    await page.waitForFunction(() => __app.state.custom?.name === 'ver2025_2.webp' && __app.state.sub === 1);
    assert.equal(await page.evaluate(() => __app.state.customMode), 'free');
    checks.push('Local WebP analyzed in free-color mode');
    const accepted = await page.evaluate(() => __app.state.custom.url); await back();
    for (const fixture of [
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
    await secondary();
    const csvInput = page.locator('.csv-picker input');
    await csvInput.setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from('one\ntwo\nthree\nfour\n') });
    await page.waitForFunction(() => /columna numérica/.test(__app.renderVals().upMsg));
    assert.equal(await page.evaluate(() => __app.state.custom.url), accepted);
    const csv = ['index,rain,temperature', ...Array.from({ length: 20 }, (_, i) => `${i},${i % 4 * i},${22 + i % 3 * 2}`)].join('\n');
    await csvInput.setInputFiles({ name: 'three-columns.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await page.waitForFunction(() => __app.state.custom?.cols?.length === 3 && __app.state.sub === 1);
    const column = page.locator('.file-settings select');
    await column.selectOption('2');
    await page.waitForFunction(() => __app.state.custom?.col === 2 && __app.cur());
    assert.equal(await column.inputValue(), '2');
    const series = await page.evaluate(() => __app.state.custom.cols[2].values);
    assert.equal(series.length, 20); checks.push('CSV parsed locally and a different numeric column selected');
    await page.locator('#tour-lang button').nth(1).click();
    assert.equal(await column.inputValue(), '2');
    await back(); await secondary(); await page.locator('#tour-sample button').click();
    await page.waitForFunction(() => __app.state.custom?.nameText?.en?.includes('rainfall') && __app.state.sub === 1);
    checks.push('NASA POWER Chiclayo sample preserved and opened in English'); await back();
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
      fixture: 'Chromium with local route fixtures and emulated viewport sizes' }, null, 2));
    checks.forEach(check => console.log('PASS', check));
  } finally { await context.close(); await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
