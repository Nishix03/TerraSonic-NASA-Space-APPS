// The instrument is independent of the optional 3D view, with real Web Audio monitoring.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/player/fallback-audio'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={fixture:'Native Web Audio observed before silent final output; WebGL/runtime failures are test fixtures, not human listening',checks:[],errors:[]};
 try{
  for(const scenario of ['no-webgl','missing-runtime']){
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await context.route('**/*',async route=>{const url=route.request().url();if(/^(blob:|data:)/.test(url))return route.continue();if(!url.startsWith(base))return route.abort();const requested=new URL(url).pathname.slice(1)||'index.html';if(scenario==='missing-runtime'&&requested==='runtime/avatar3d.js')return route.fulfill({status:404});const file=path.resolve(site,requested);return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
   await context.addInitScript(()=>{
    localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
    Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
    window.__monitors=[];const Native=window.AudioContext||window.webkitAudioContext;
    if(typeof Native!=='function')return;
    window.AudioContext=class extends Native{createDynamicsCompressor(){const comp=super.createDynamicsCompressor(),connect=comp.connect.bind(comp);comp.connect=(destination,...args)=>{if(destination===this.destination){const analyser=this.createAnalyser(),silent=this.createGain();analyser.fftSize=512;silent.gain.value=0;connect(analyser);analyser.connect(silent);silent.connect(destination);__monitors.push(analyser);return destination;}return connect(destination,...args);};return comp;}};
    window.__peak=()=>Math.max(0,...__monitors.map(analyser=>{const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);return Math.max(...values.map(Math.abs));}));
   });
   if(scenario==='no-webgl')await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);
   assert(await page.evaluate(()=>typeof __peak==='function'),'run this audio regression with a browser that offers native Web Audio');
   await page.locator('#tour-nav button').nth(1).click();
   for(const [index,key]of ['silbo','inti','mama','yaku','illapa'].entries()){
    await page.locator('.bsel').nth(index).click();const sample=page.locator('.avatar-actions button[aria-pressed]');
    assert(await sample.isVisible());assert.equal(await page.locator('.avatar-actions .model-action:visible').count(),0);
    const snapshot=await page.evaluate(()=>JSON.stringify([__app.state.disc,__app.state.frame,__app.state.col,__app.state.mute]));
    await sample.click();await page.waitForFunction(key=>__app.state.previewKey===key&&!__app.state.audioPending,key);await page.waitForFunction(()=>__peak()>.00001);
    const peak=await page.evaluate(()=>__peak());await sample.click();await page.waitForTimeout(180);
    const afterStop=await page.evaluate(()=>__peak());assert(afterStop<.00001);assert.equal(await sample.getAttribute('aria-pressed'),'false');assert.equal(await page.evaluate(()=>JSON.stringify([__app.state.disc,__app.state.frame,__app.state.col,__app.state.mute])),snapshot);
    report.checks.push({scenario,key,peak,afterStop});await page.screenshot({path:path.join(output,`${scenario}-${key}.png`)});
   }
   await context.close();console.log('PASS independent instrument audio',scenario,'five samples');
  }
  assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
