// Automatic entry/reload policy, native motion and accessible exits.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),out=path.resolve(process.argv[3]||'_work/cinema'),base=process.env.TERRASONIC_CINEMA_URL||'http://terrasonic.test/';
async function main(){
 fs.mkdirSync(out,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM});
 const report={fixture:'Native rendered animation on each document load/reload, including old session and motion settings. CSS viewports, not physical phones.',checks:[],errors:[],failedResponses:[]};
 async function open(viewport,{configured=true,lang='es',noAnimation=false,storageUnavailable=false}={}){
  const context=await browser.newContext({viewport,reducedMotion:'reduce',locale:'es-PE'});
  if(!process.env.TERRASONIC_CINEMA_URL)await context.route('**/*',r=>{const u=r.request().url();if(/^(blob:|data:)/.test(u))return r.continue();if(!u.startsWith(base))return r.abort();const f=path.resolve(site,new URL(u).pathname.slice(1)||'index.html');return f.startsWith(site+path.sep)&&fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});});
  await context.addInitScript(({configured,lang,noAnimation,storageUnavailable})=>{
   if(!localStorage.getItem('ts_prefs'))localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured,values:{sfx:false,reducedMotion:true}}));localStorage.setItem('ts_lang',lang);localStorage.setItem('ts_motion_mode','reduced');sessionStorage.setItem('ts_intro_seen','1');sessionStorage.setItem('ts_intro_seen_v2','1');window.__vibrations=[];Object.defineProperty(navigator,'vibrate',{value:p=>{__vibrations.push(p);return true;},configurable:true});
   Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const set=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return set.apply(this,args);};}});
   if(noAnimation)Element.prototype.animate=()=>{throw Error('Unavailable animation fixture');};
   if(storageUnavailable)Object.defineProperty(window,'localStorage',{get(){throw Error('Unavailable storage fixture');}});
  },{configured,lang,noAnimation,storageUnavailable});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResponses.push(r.url());});await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__app?.cinema);return {context,page};
 }
 const skip=async page=>{await page.locator('.ts-cinema').waitFor();await page.locator('.ts-cinema button').click();assert.equal(await page.locator('.ts-cinema').count(),0);};
 try{
  {
   const {context,page}=await open({width:390,height:667},{configured:false});await page.locator('.ts-cinema').waitFor();assert(await page.locator('#preferences-dialog').evaluate(e=>e.inert));assert.equal(await page.evaluate(()=>document.activeElement.closest('.ts-cinema')!==null),true);
   await skip(page);assert.equal(await page.locator('#preferences-dialog').evaluate(e=>e.inert),false);await page.getByRole('button',{name:'Continuar',exact:true}).click();assert.equal(await page.locator('.ts-cinema').count(),0,'Finishing preferences does not immediately play a second intro');
   for(let n=0;n<3;n++){await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__app?.cinema);await skip(page);}
   assert.equal(await page.locator('.home-cinema button').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(167, 239, 199)');
   await page.locator('.home-cinema button').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.ts-cinema').count(),0);assert(await page.locator('.home-cinema button').evaluate(e=>e===document.activeElement));
   await page.locator('.home-cinema button').click();await page.keyboard.press('Tab');assert.equal(await page.locator('.ts-cinema').count(),0);
   report.checks.push({autoBeforePreferences:true,threeReloadsReplayAutomatically:true,greenReplay:true,escapeAndTabExit:true,focusRestored:true});await context.close();
  }
  for(const viewport of [{width:360,height:640},{width:390,height:667},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:667,height:375},{width:320,height:256}]){
   const {context,page}=await open(viewport);const root=page.locator('.ts-cinema');await root.waitFor();const duration=Number(await root.getAttribute('data-duration'));assert.equal(duration,viewport.width<=640||viewport.height<=450?3000:5200);assert.equal(await root.locator('.cinema-meteor').count(),5);
   await page.waitForTimeout(duration*.25);const world=root.locator('.cinema-world');const before=await world.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(180);assert.notEqual(await world.evaluate(e=>getComputedStyle(e).transform),before);
   const box=await root.locator('button').boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1&&box.height>=44);
   await page.screenshot({path:path.join(out,`entry-${viewport.width}.png`)});await root.waitFor({state:'detached',timeout:duration+1500});
   assert.equal(await page.evaluate(()=>__app.cinema.animations.length+__app.cinema.timers.length),0);assert.equal(await page.evaluate(()=>__app.state.playing||!!__app.ac),false);assert.deepEqual(await page.evaluate(()=>__vibrations),[]);assert.equal(await page.locator('.space-meteor').count(),5);assert.equal(await page.evaluate(()=>__app.bandReduced()),false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:path.join(out,`home-${viewport.width}.png`)});report.checks.push({viewport,duration,automatic:true,oldFlagsDoNotSuppress:true,realTransformChange:true,fiveMeteors:true,naturalFinishAndCleanup:true,noAudioOrVibration:true});await context.close();
  }
  for(const lang of ['es','en']){
   const {context,page}=await open({width:390,height:667},{lang});await skip(page);await page.locator('.scene-motion-toggle').click();assert.equal(await page.locator('.space-sky').evaluate(e=>e.getAnimations({subtree:true}).length),0);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__app?.cinema);await page.locator('.ts-cinema').waitFor();assert.equal(await page.locator('.ts-cinema button').textContent(),lang==='es'?'Saltar introducción':'Skip intro');await skip(page);assert.equal(await page.evaluate(()=>__app.bandReduced()),false);report.checks.push({lang,pauseWorksDuringVisit:true,reloadAlwaysReplays:true,previousPauseDoesNotSuppressEntry:true});await context.close();
  }
  {
   const {context,page}=await open({width:1342,height:605});await page.locator('.ts-cinema').waitFor();await page.locator('#tour-nav button').nth(1).click();await page.waitForFunction(()=>document.querySelector('.bportrait-live')?.running);assert.equal(await page.locator('.ts-cinema').count(),0);assert.equal(await page.locator('ts-sprite-controls button').count(),1);await page.locator('.brand').click();await page.waitForFunction(()=>__app.state.tab==='home'&&!__app.state.trans);assert.equal(await page.locator('.ts-cinema').count(),0);report.checks.push({navigationStillWorks:true,bandDanceStartsAutomatically:true,noReplayOnInternalNavigation:true});await context.close();
  }
  {
   const {context,page}=await open({width:390,height:667});await page.locator('.ts-cinema').waitFor();await page.evaluate(()=>__app.setPreference('reducedMotion',true));assert.equal(await page.locator('.ts-cinema').count(),0);await context.close();report.checks.push({explicitPauseCanStopEntry:true});
  }
  {
   const {context,page}=await open({width:390,height:667});await page.locator('.ts-cinema').waitFor();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('.ts-cinema').count(),0);await context.close();report.checks.push({hiddenPageCleansTimelines:true});
  }
  {
   const {context,page}=await open({width:390,height:667},{noAnimation:true});assert.equal(await page.locator('.ts-cinema').count(),0);await page.locator('.hero .btn.primary').click();await page.locator('.discgrid').waitFor();report.checks.push({animationFailureLeavesAppUsable:true});await context.close();
  }
  {
   const {context,page}=await open({width:390,height:667},{storageUnavailable:true});await skip(page);await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.locator('.home-cinema button').click();await skip(page);report.checks.push({storageFailureDoesNotPreventAutomaticEntryOrReplay:true});await context.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);
 }finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('PASS automatic entry',report.checks.length,'journeys');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
