// Real three-second image changes; no test-clock acceleration.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser,dismissEntry}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),out=path.resolve(process.argv[3]||'_work/home-carousel'),base=process.env.TERRASONIC_CAROUSEL_URL||'http://terrasonic.test/',quick=process.env.TERRASONIC_CAROUSEL_QUICK==='1';
const slides=[{file:'inv2025_0.webp',es:/mayo.*2025/i,en:/May.*2025/i},{file:'ver2026_2.webp',es:/enero.*2026/i,en:/January.*2026/i},{file:'inv2026_2.webp',es:/julio.*2026/i,en:/July.*2026/i},{file:'inv2024_2.webp',es:/julio.*2024/i,en:/July.*2024/i},{file:'ver2025_2.webp',es:/enero.*2025/i,en:/January.*2025/i}];
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM}),report={url:base,fixture:'Native image loading/decoding, actual elapsed time and CSS viewports. Hidden document is simulated to exercise its handler. No physical phone or human motion-comfort assessment.',checks:[],errors:[],failedResponses:[]};
 async function open(viewport,broken=false){
  const context=await browser.newContext({viewport,reducedMotion:'no-preference'});
  if(!process.env.TERRASONIC_CAROUSEL_URL)await context.route('**/*',r=>{const u=r.request().url();if(/^(blob:|data:)/.test(u))return r.continue();if(!u.startsWith(base))return r.abort();if(broken&&u.endsWith('/ver2026_2.webp'))return r.abort();const f=path.resolve(site,new URL(u).pathname.slice(1)||'index.html');return f.startsWith(site+path.sep)&&fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const set=value.prototype.setState;value.prototype.setState=function(...a){window.__app=this;return set.apply(this,a);};}});});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResponses.push(r.url());});await page.goto(base,{waitUntil:'domcontentloaded'});await dismissEntry(page);await page.evaluate(()=>document.fonts.ready);return {context,page};
 }
 async function current(page,lang='es'){
  const s=await page.locator('.home-map').evaluate(e=>({index:Number(e.dataset.slide),src:e.querySelector('img').getAttribute('src'),alt:e.querySelector('img').alt,caption:e.querySelector('figcaption').textContent,live:e.getAttribute('aria-live')}));assert(s.src.endsWith(slides[s.index].file));assert.match(s.caption,slides[s.index][lang]);assert.match(s.alt,slides[s.index][lang]);assert.match(s.caption,/NASA EIC/);assert.equal(s.live,'off');assert.equal(await page.locator('.home-process img.flow-art').getAttribute('src'),s.src);await page.waitForFunction(()=>{const image=document.querySelector('.home-map img');return image?.complete&&image.naturalWidth>0;});return s;
 }
 async function advance(page,previous){await page.waitForFunction(i=>Number(document.querySelector('.home-map').dataset.slide)!==i,previous.index,{timeout:4300});return current(page);}
 async function holds(page,label){const before=await page.evaluate(()=>__app.state.homePreview);await page.waitForTimeout(3300);assert.equal(await page.evaluate(()=>__app.state.homePreview),before,label);}
 try{
  const widths=(process.env.TERRASONIC_CAROUSEL_WIDTHS||'390,768,1440').split(',').map(Number);
  for(const width of widths){
   const viewport={width,height:width<700?844:900},{context,page}=await open(viewport);let slide=await current(page);const music=await page.evaluate(()=>JSON.stringify([__app.state.set,__app.state.disc,__app.state.frame,__app.state.col,__app.state.playing,__app.state.engine])),box=await page.locator('.home-demo').boundingBox();
   await page.screenshot({path:path.join(out,`${width}-before.png`)});await page.evaluate(()=>{window.__changes=[];const image=document.querySelector('.home-map img');new MutationObserver(()=>__changes.push({at:performance.now(),src:image.getAttribute('src')})).observe(image,{attributes:true,attributeFilter:['src']});});
   const count=!quick&&width===1440?5:2;
   for(let i=0;i<count;i++){const before=slide;slide=await advance(page,before);assert.equal(slide.index,(before.index+1)%5);}
   const times=await page.evaluate(()=>__changes);for(let i=1;i<times.length;i++){const delta=times[i].at-times[i-1].at;assert(delta>=2750&&delta<=3800,'Three-second cadence: '+delta);}
   const afterBox=await page.locator('.home-demo').boundingBox();for(const key of ['x','y','width','height'])assert(Math.abs(afterBox[key]-box[key])<=1,'Carousel must not move or resize the card');assert.equal(await page.evaluate(()=>JSON.stringify([__app.state.set,__app.state.disc,__app.state.frame,__app.state.col,__app.state.playing,__app.state.engine])),music);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${width}-after.png`)});
   await page.locator('.scene-motion-toggle').click();await holds(page,'Global pause must stop the carousel');await page.locator('.scene-motion-toggle').click();slide=await current(page);await advance(page,slide);
   await page.locator('#tour-lang button').nth(1).click();await current(page,'en');await page.locator('#tour-lang button').first().click();
   if(!quick&&width===1440){
    await page.locator('.home-demo').hover();await holds(page,'Reading with the pointer holds the current map');await page.mouse.move(0,0);await page.locator('#tour-guide').focus();await holds(page,'Focus inside the card holds the current map');await page.locator('#hero-sample').focus();
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await holds(page,'A hidden document does not advance');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
    await page.locator('#tour-nav button').first().click();await holds(page,'Other pages do not advance the preview');await page.locator('.brand').click();slide=await current(page);await advance(page,slide);
   }
   await page.emulateMedia({reducedMotion:'reduce'});await holds(page,'System reduction stops automatic image changes');assert.equal(await page.evaluate(()=>!!__app.ac),false,'The carousel must never start audio');
   await page.addScriptTag({path:process.env.TERRASONIC_AXE||'_work/axe/package/axe.min.js'});const violations=await page.evaluate(async()=>{const r=await axe.run('.home-demo',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));});assert.deepEqual(violations,[]);
   if(!quick&&width===1440){await page.evaluate(()=>__app.componentWillUnmount());await holds(page,'Disposal stops the preview');assert.equal(await page.evaluate(()=>__app.homePreviewImages.size),0);}
   report.checks.push({viewport,realTimedChanges:times.length,cadenceMs:times.map((t,i)=>i?Math.round(t.at-times[i-1].at):null).filter(Boolean),fiveFramesAndWrap:count===5,mapCaptionAndThumbnailAgree:true,stableCard:true,globalPause:true,reducedMotion:true,bilingual:true,noAudio:true,readingHiddenNavigationAndDisposalChecked:!quick&&width===1440,axeViolations:0});await context.close();
  }
  if(!quick&&!process.env.TERRASONIC_CAROUSEL_URL){const {context,page}=await open({width:1440,height:900},true);const first=await current(page),next=await advance(page,first);assert.equal(next.index,2,'A failed next image is skipped without showing a blank map');report.checks.push({deliberateNextImageFailure:true,keptCurrentUntilDecoded:true,skippedFailedImage:true});await context.close();}
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);
 }catch(error){report.failure={message:error.message};for(const c of browser.contexts())for(const p of c.pages())await p.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
 finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('PASS home carousel',report.checks.length,'native timed journeys');
})().catch(e=>{console.error(e);process.exitCode=1;});
