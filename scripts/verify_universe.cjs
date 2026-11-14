// Background astros share the actual seasonal-disc selection and native player.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser,dismissEntry}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),out=path.resolve(process.argv[3]||'_work/universe'),base=process.env.TERRASONIC_UNIVERSE_URL||'http://terrasonic.test/';
const discs={sun:{index:1,id:'ver2025',es:'Verano 2024–25',en:'Summer 2024–25'},moon:{index:0,id:'inv2024',es:'Invierno 2024',en:'Winter 2024'},saturn:{index:3,id:'ver2026',es:'Verano 2025–26',en:'Summer 2025–26'},aqua:{index:2,id:'inv2025',es:'Invierno 2025',en:'Winter 2025'}};
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM}),report={url:base,fixture:'Native pointer/keyboard, journey cancellation, EIC map identity and Web Audio playback when available. CSS viewports, not physical devices or human listening.',checks:[],errors:[],failedResponses:[]};
 try{
  for(const width of (process.env.TERRASONIC_UNIVERSE_WIDTHS||'390,768,1440').split(',').map(Number)){
   const context=await browser.newContext({viewport:{width,height:width<700?760:900},reducedMotion:'no-preference'});
   if(!process.env.TERRASONIC_UNIVERSE_URL)await context.route('**/*',r=>{const u=r.request().url();if(/^(blob:|data:)/.test(u))return r.continue();if(!u.startsWith(base))return r.abort();const f=path.resolve(site,new URL(u).pathname.slice(1)||'index.html');return f.startsWith(site+path.sep)&&fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});});
   await context.addInitScript(()=>{localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));localStorage.setItem('ts_lang','es');Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const set=value.prototype.setState;value.prototype.setState=function(...a){window.__app=this;return set.apply(this,a);};}});});
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResponses.push(r.url());});await page.goto(base,{waitUntil:'domcontentloaded'});await dismissEntry(page);await page.addScriptTag({path:process.env.TERRASONIC_AXE||'_work/axe/package/axe.min.js'});
   for(const lang of ['es','en']){
    await page.locator('#tour-lang button').nth(lang==='es'?0:1).click();await page.locator('#tour-nav button').first().click();await page.locator('#tour-sets button').nth(1).click();await page.locator('.brand').click();
    for(const [key,disc] of Object.entries(discs)){
     const portal=page.locator(`.planet-portal[data-destination="${key}"]`);assert((await portal.getAttribute('aria-label')).includes(disc[lang]));await portal.click();await page.locator('.ts-voyage').waitFor();assert((await page.locator('.voyage-copy p').first().textContent()).includes(disc[lang]));
     if(key==='sun'){await page.keyboard.press('Tab');assert(await page.locator('.voyage-cancel').evaluate(e=>e===document.activeElement));await page.keyboard.press('Escape');assert(await portal.evaluate(e=>e===document.activeElement));assert.equal(await page.evaluate(()=>__app.state.tab),'home');await portal.click();}
     await page.locator('.voyage-skip').click();await page.locator('#player-title').waitFor();await page.waitForFunction(()=>!__app.state.trans&&!!__app.cur());assert((await page.locator('#player-title').textContent()).includes(disc[lang]));assert(await page.locator('#player-title').evaluate(e=>e===document.activeElement));assert.equal(await page.locator('.destination,.ts-voyage').count(),0);
     assert.deepEqual(await page.evaluate(()=>({set:__app.state.set,disc:__app.state.disc,frame:__app.state.frame,playing:__app.state.playing,destination:__app.state.destination})),{set:'eic',disc:disc.index,frame:0,playing:false,destination:''});
     assert((await page.locator('.mapbox img.map').getAttribute('src')).includes(disc.id+'_0.webp'));await page.waitForFunction(()=>{const image=document.querySelector('.mapbox img.map');return image?.complete&&image.naturalWidth>0;});assert.equal(await page.evaluate(()=>__app.journey.animations.length+__app.journey.phaseTimers.length),0);
     const nativeAudio=await page.evaluate(()=>typeof(window.AudioContext||window.webkitAudioContext)==='function');if(nativeAudio){await page.locator('#tour-play button').click();await page.waitForFunction(()=>__app.state.playing&&__app.state.col>=1);await page.locator('#tour-play button').click();assert.equal(await page.evaluate(()=>__app.state.playing),false);}
     const violations=await page.evaluate(async()=>{const r=await axe.run('.uni',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});assert.deepEqual(violations,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     await page.screenshot({path:path.join(out,`${width}-${lang}-${key}.png`),fullPage:true});await page.locator('.brand').click();await portal.waitFor();report.checks.push({width,lang,key,disc:disc[lang],directPlayer:true,correctEicMap:true,cancelRestoresFocus:key==='sun',playerHeadingFocused:true,nativeAudio,playAndPause:nativeAudio,axeViolations:0});
    }
   }
   await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.planet-portal[data-destination="moon"]').focus();await page.keyboard.press('Enter');await page.locator('#player-title').waitFor();assert.equal(await page.locator('.ts-voyage').count(),0);assert((await page.locator('#player-title').textContent()).includes('Winter 2024'));await context.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);
 }catch(error){report.failure={message:error.message};for(const c of browser.contexts())for(const p of c.pages())await p.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
 finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('PASS planet discs',report.checks.length,'native seasonal-disc journeys');
})().catch(e=>{console.error(e);process.exitCode=1;});
