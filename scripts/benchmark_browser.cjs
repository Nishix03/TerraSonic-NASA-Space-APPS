// Requires TERRASONIC_PLAYWRIGHT pointing to an installed playwright-core directory.
// node scripts/benchmark_browser.cjs _site _work/benchmarks/before.json
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { performance } = require("node:perf_hooks");
const { gzipSync } = require("node:zlib");
const os=require('node:os');
const { chromium } = require(process.env.TERRASONIC_PLAYWRIGHT || "playwright-core");

const site = path.resolve(process.argv[2] || "_site");
const output = path.resolve(process.argv[3] || "_work/benchmarks/result.json");
const measureVitals = process.argv.includes('--vitals');
const useGzip = process.argv.includes('--gzip');
const contentTypes = {
  ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".mp3": "audio/mpeg", ".css": "text/css", ".woff2": "font/woff2",
  ".png": "image/png", ".webp": "image/webp", ".glb": "model/gltf-binary",
};

async function main() {
  const compressed = new Map();
  const server = http.createServer((request, response) => {
    const file = path.resolve(site, "." + decodeURIComponent(new URL(request.url, "http://local").pathname));
    const target = file === site ? path.join(file, "index.html") : file;
    if (!target.startsWith(site + path.sep) || !fs.existsSync(target)) {
      response.writeHead(404).end();
      return;
    }
    if (useGzip && /\bgzip\b/.test(request.headers['accept-encoding'] || '') && ['.html','.js','.css','.json'].includes(path.extname(target))) {
      if (!compressed.has(target)) compressed.set(target,gzipSync(fs.readFileSync(target)));
      const body=compressed.get(target);
      response.writeHead(200, {"Content-Type":contentTypes[path.extname(target)],"Content-Encoding":"gzip","Content-Length":body.length,"Cache-Control":"no-store","Vary":"Accept-Encoding"});
      response.end(body); return;
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
    cache: "disabled", reducedMotion: "reduce", deviceScaleFactor: 1, textTransferEncoding:useGzip?'gzip when accepted':'identity' };
  const files=[];
  const walk=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){if(entry.name.startsWith('.'))continue;const file=path.join(directory,entry.name);if(entry.isDirectory())walk(file);else files.push({path:path.relative(site,file).replaceAll('\\','/'),bytes:fs.statSync(file).size});}};
  walk(site);
  const report = { base, profile, browserVersion:browser.version(), recordedAt:new Date().toISOString(),host:{platform:os.platform(),release:os.release(),totalMemoryBytes:os.totalmem(),freeMemoryAtStart:os.freemem()},
    indexSha256:createHash('sha256').update(fs.readFileSync(path.join(site,'index.html'))).digest('hex'),
    visit:'Returning visitor: Spanish and configured preferences saved in a fresh browser context',
    audioFixture:'Final output silenced. Narration and navigation effects are off to isolate playback.',
    bytesDefinition:'CDP encoded bytes of completed local responses at the milestone; cancelled/in-flight responses can be incomplete. File inventory is exact uncompressed disk size.',
    assets:{files:files.length,totalBytes:files.reduce((total,file)=>total+file.bytes,0),models:files.filter(file=>file.path.endsWith('.glb')),index:files.find(file=>file.path==='index.html')},
    samples: [], failures: [] };
  try {
    for (let run = 0; run < 3; run++) {
      const freeMemoryBeforeRun=os.freemem();
      const context = await browser.newContext({ viewport: profile.viewport,
        reducedMotion: profile.reducedMotion, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      await context.addInitScript(() => {
        localStorage.setItem('ts_lang', 'es');
        localStorage.setItem('ts_prefs', JSON.stringify({version:1,configured:true,values:{voice:false,sfx:false}}));
        Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;const before=performance.now();try{return original.apply(this,args);}finally{window.__stateTimes?.push(performance.now()-before);}};}});
        const Native=window.AudioContext||window.webkitAudioContext;
        if(typeof Native==='function')window.AudioContext=class extends Native{createGain(){const node=super.createGain(),connect=node.connect.bind(node);node.connect=(destination,...args)=>{if(destination===this.destination){const silent=super.createGain();silent.gain.value=0;connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return node;}};
      });
      if(measureVitals)await context.addInitScript(()=>{
        window.__labVitals={lcp:[],shifts:[],events:[],paints:[],supported:PerformanceObserver.supportedEntryTypes};
        for(const type of ['largest-contentful-paint','layout-shift','event','paint']){
          if(!PerformanceObserver.supportedEntryTypes.includes(type))continue;
          const observer=new PerformanceObserver(list=>{
            for(const entry of list.getEntries()){
              if(type==='largest-contentful-paint')__labVitals.lcp.push({at:entry.startTime,size:entry.size,tag:entry.element?.tagName,cls:entry.element?.className});
              if(type==='layout-shift')__labVitals.shifts.push({at:entry.startTime,value:entry.value,recentInput:entry.hadRecentInput,sources:entry.sources.map(source=>({tag:source.node?.tagName,cls:source.node?.className,previous:source.previousRect.toJSON(),current:source.currentRect.toJSON()}))});
              if(type==='event'&&entry.interactionId)__labVitals.events.push({at:entry.startTime,name:entry.name,duration:entry.duration,interactionId:entry.interactionId});
              if(type==='paint')__labVitals.paints.push({name:entry.name,at:entry.startTime});
            }
          });
          observer.observe(type==='event'?{type,buffered:true,durationThreshold:16}:{type,buffered:true});
        }
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
      let homeVitals;
      if(measureVitals){
        // A declared extra observation window makes this a separate diagnostic
        // series; its later navigation milestones must not replace normal runs.
        await page.waitForTimeout(3000);
        homeVitals=await page.evaluate(()=>({at:performance.now(),lcp:__labVitals.lcp,shifts:__labVitals.shifts,paints:__labVitals.paints}));
      }
      const listen = performance.now();
      await page.locator("#tour-nav button").nth(0).click();
      await page.locator(".discgrid .dcard").first().click();
      await page.locator("#tour-play button:not([disabled])").waitFor();
      await page.waitForFunction(()=>window.__app?.cur());
      await page.waitForFunction(()=>{const image=document.querySelector('.mapbox img.map');return image?.complete&&image.naturalWidth>0;});
      const listenMs = performance.now() - listen;
      const listenBytes = {...bytes};
      const playback = await page.evaluate(() => {
        const app = window.__app;
        app.setEngine('raw');
        app.setBandMute(app.allMute(false));
        window.__stateTimes = [];
        return { elements: document.querySelectorAll('.uni *').length };
      });
      await page.locator('#tour-play button').click();
      await page.waitForFunction(() => window.__app?.state.playing);
      await page.waitForFunction(() => window.__app?.state.col >= 18);
      const work = await page.evaluate(() => {
        const times = window.__stateTimes;
        delete window.__stateTimes;
        return { renders: times.length, renderMs: times.reduce((sum, value) => sum + value, 0), maxRenderMs: Math.max(...times) };
      });
      await page.locator('#tour-play button').click();
      Object.assign(playback, work);
      const band = performance.now();
      await page.locator("#tour-nav button").nth(1).click();
      await page.locator('.bportrait-live').waitFor();
      const bandControlsMs=performance.now()-band;
      await page.waitForFunction(() => {const portrait=document.querySelector(".bportrait-live");return portrait instanceof HTMLImageElement ? portrait.complete && portrait.naturalWidth>0 : portrait?.hasAttribute("data-rendered");});
      const bandMs = performance.now() - band;
      let vitals;
      if(measureVitals)vitals=await page.evaluate(()=>{
        let cls=0,sum=0,first=0,last=0;
        for(const shift of __labVitals.shifts.filter(item=>!item.recentInput)){
          if(shift.at-last<1000&&shift.at-first<5000)sum+=shift.value;else{sum=shift.value;first=shift.at;}
          last=shift.at;cls=Math.max(cls,sum);
        }
        return {...__labVitals,cls,maxScriptedInteractionMs:Math.max(0,...__labVitals.events.map(entry=>entry.duration))};
      });
      report.samples.push({ run: run + 1, homeMs, listenMs, bandMs, bandControlsMs, atHome, listenBytes, playback, totalBytes: { ...bytes },freeMemoryBeforeRun,freeMemoryAfterRun:os.freemem(),
        ...(measureVitals?{homeVitals,vitals,diagnostic:'Extra 3 s before interaction; LCP/CLS and scripted Event Timing only, not field INP'}:{}),
        portraitDecoded: true });
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, JSON.stringify(report, null, 2));
      const latest=report.samples.at(-1);
      console.log(JSON.stringify({...latest,...(measureVitals?{homeVitals:undefined,vitals:{lcpMs:latest.vitals.lcp.at(-1)?.at,cls:latest.vitals.cls,maxScriptedInteractionMs:latest.vitals.maxScriptedInteractionMs}}:{})}));
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
