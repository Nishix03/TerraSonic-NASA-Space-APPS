// Requires TERRASONIC_PLAYWRIGHT pointing to an installed playwright-core directory.
// node scripts/benchmark_browser.cjs _site _work/benchmarks/before.json
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { chromium } = require(process.env.TERRASONIC_PLAYWRIGHT || "playwright-core");

const site = path.resolve(process.argv[2] || "_site");
const output = path.resolve(process.argv[3] || "_work/benchmarks/result.json");
const contentTypes = {
  ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".woff2": "font/woff2",
  ".png": "image/png", ".webp": "image/webp", ".glb": "model/gltf-binary",
};

async function main() {
  const server = http.createServer((request, response) => {
    const file = path.resolve(site, "." + decodeURIComponent(new URL(request.url, "http://local").pathname));
    const target = file === site ? path.join(file, "index.html") : file;
    if (!target.startsWith(site + path.sep) || !fs.existsSync(target)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(target)] || "application/octet-stream",
      "Cache-Control": "no-store", "Content-Length": fs.statSync(target).size });
    fs.createReadStream(target).pipe(response);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch({
    executablePath: process.env.TERRASONIC_CHROMIUM,
    args: ["--no-sandbox", "--no-proxy-server", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const profile = { viewport: { width: 390, height: 844 }, latency: 150,
    downloadBytesPerSecond: 204800, uploadBytesPerSecond: 102400, cpuRate: 4,
    cache: "disabled", reducedMotion: "reduce", deviceScaleFactor: 1 };
  const files=[];
  const walk=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){if(entry.name.startsWith('.'))continue;const file=path.join(directory,entry.name);if(entry.isDirectory())walk(file);else files.push({path:path.relative(site,file).replaceAll('\\','/'),bytes:fs.statSync(file).size});}};
  walk(site);
  const report = { base, profile, visit:'Returning visitor: Spanish and configured preferences saved in a fresh browser context',
    bytesDefinition:'CDP encoded bytes of completed local responses at the milestone; cancelled/in-flight responses can be incomplete. File inventory is exact uncompressed disk size.',
    assets:{files:files.length,totalBytes:files.reduce((total,file)=>total+file.bytes,0),models:files.filter(file=>file.path.endsWith('.glb')),index:files.find(file=>file.path==='index.html')},
    samples: [], failures: [] };
  try {
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({ viewport: profile.viewport,
        reducedMotion: profile.reducedMotion, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      await context.addInitScript(() => {
        localStorage.setItem('ts_lang', 'es');
        localStorage.setItem('ts_prefs', JSON.stringify({version:1,configured:true,values:{}}));
        Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
      });
      const page = await context.newPage();
      const bytes = { local: 0, glb: 0 };
      page.on("pageerror", error => report.failures.push(error.message));
      const session = await context.newCDPSession(page);
      await session.send("Network.enable");
      await session.send("Network.setCacheDisabled", { cacheDisabled: true });
      await session.send("Network.emulateNetworkConditions", { offline: false,
        latency: profile.latency, downloadThroughput: profile.downloadBytesPerSecond,
        uploadThroughput: profile.uploadBytesPerSecond });
      await session.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuRate });
      const resources = new Map();
      session.on("Network.responseReceived", event => resources.set(event.requestId, event.response.url));
      session.on("Network.loadingFinished", event => {
        const url = resources.get(event.requestId);
        if (url?.startsWith(base)) bytes.local += event.encodedDataLength;
        if (url?.includes(".glb")) bytes.glb += event.encodedDataLength;
      });
      const start = performance.now();
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.locator(".hero .btn.primary").waitFor();
      const homeMs = performance.now() - start;
      const atHome = { ...bytes };
      const listen = performance.now();
      await page.locator("#tour-nav button").nth(0).click();
      await page.locator(".discgrid .dcard").first().click();
      await page.locator("#tour-play button:not([disabled])").waitFor();
      await page.waitForFunction(()=>window.__app?.cur());
      await page.waitForFunction(()=>{const image=document.querySelector('.mapbox img.map');return image?.complete&&image.naturalWidth>0;});
      const listenMs = performance.now() - listen;
      const band = performance.now();
      await page.locator("#tour-nav button").nth(1).click();
      await page.locator('.bportrait-live').waitFor();
      const bandControlsMs=performance.now()-band;
      await page.locator(".bportrait-live[data-rendered]").waitFor({ timeout: 120000 });
      const bandMs = performance.now() - band;
      report.samples.push({ run: run + 1, homeMs, listenMs, bandMs, bandControlsMs, atHome, totalBytes: { ...bytes },
        modelsRendered: await page.locator("ts-avatar[data-rendered]").count() });
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, JSON.stringify(report, null, 2));
      console.log(JSON.stringify(report.samples.at(-1)));
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
