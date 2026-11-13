// Native browser timelines, first-session policy, controls and static alternative.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),out=path.resolve(process.argv[3]||'_work/cinema'),base=process.env.TERRASONIC_CINEMA_URL||'http://terrasonic.test/';
async function main(){
 fs.mkdirSync(out,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM});
 const report={fixture:'Real DOM, native Web Animations API and CSS viewport sizes. No physical mobile device or frame-rate guarantee.',checks:[],errors:[],failedResponses:[]};
 async function open(viewport,{reducedMotion='no-preference',configured=true,lang='es',noAnimation=false,appReduced=false}={}){
  const context=await browser.newContext({viewport,reducedMotion,locale:'es-PE'});
  if(!process.env.TERRASONIC_CINEMA_URL)await context.route('**/*',r=>{const u=r.request().url();if(/^(blob:|data:)/.test(u))return r.continue();if(!u.startsWith(base))return r.abort();const f=path.resolve(site,new URL(u).pathname.slice(1)||'index.html');return f.startsWith(site+path.sep)&&fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});});
  await context.addInitScript(({configured,lang,noAnimation,appReduced})=>{
   if(!localStorage.getItem('ts_prefs'))localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured,values:{sfx:false,...(appReduced?{reducedMotion:true}:{})}}));localStorage.setItem('ts_lang',lang);window.__vibrations=[];Object.defineProperty(navigator,'vibrate',{value:p=>{__vibrations.push(p);return true;},configurable:true});
   Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const set=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return set.apply(this,args);};}});
   if(noAnimation)Element.prototype.animate=()=>{throw Error('Deliberate unavailable animation fixture');};
  },{configured,lang,noAnimation,appReduced});
  // Remote image preloads can outlast the finite intro. Observe actual app
  // readiness instead of starting assertions after the global load event.
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResponses.push(r.url());});await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__app?.cinema);return {context,page};
 }
 try{
  // Welcome has priority; skip, replay, refresh and ordinary navigation.
  {
   const {context,page}=await open({width:390,height:667},{configured:false});assert.equal(await page.locator('.ts-cinema').count(),0);await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.locator('.ts-cinema').waitFor();
   await page.getByRole('button',{name:'Saltar introducción',exact:true}).click();assert.equal(await page.locator('.ts-cinema').count(),0);
   await page.reload();await page.waitForFunction(()=>window.__app?.cinema);assert.equal(await page.locator('.ts-cinema').count(),0);
   await page.locator('.home-cinema button').click();await page.locator('.ts-cinema').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('.ts-cinema').count(),0);assert(await page.locator('.home-cinema button').evaluate(b=>b===document.activeElement));
   await page.locator('.home-cinema button').click();await page.keyboard.press('Tab');assert.equal(await page.locator('.ts-cinema').count(),0);
   await page.locator('.home-cinema button').click();await page.locator('#tour-nav button').nth(1).click();assert.equal(await page.locator('.ts-cinema').count(),0);await page.evaluate(()=>__app.goTab('home'));assert.equal(await page.locator('.ts-cinema').count(),0);
   report.checks.push({welcomePriority:true,skip:true,replay:true,escape:true,tabLeavesPresentation:true,refreshDoesNotRepeat:true,navigationRemainsUsable:true});await context.close();
  }
  for(const viewport of [{width:360,height:640},{width:390,height:667},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:667,height:375},{width:320,height:256}]){
   const {context,page}=await open(viewport);const root=page.locator('.ts-cinema');await root.waitFor();const duration=Number(await root.getAttribute('data-duration'));assert.equal(duration,viewport.width<=640||viewport.height<=450?3000:5200);
   await page.waitForTimeout(duration*.4);assert(await root.evaluate(r=>r.getAnimations({subtree:true}).some(a=>a.currentTime>0)));
   const box=await root.locator('button').boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1&&box.height>=44);
   await page.screenshot({path:path.join(out,`journey-${viewport.width}.png`)});await root.waitFor({state:'detached',timeout:duration+1500});
   assert.equal(await page.evaluate(()=>__app.cinema.animations.length+__app.cinema.timers.length),0);assert.equal(await page.evaluate(()=>__app.state.playing||!!__app.ac),false);assert.deepEqual(await page.evaluate(()=>__vibrations),[]);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:path.join(out,`home-${viewport.width}.png`)});
   report.checks.push({viewport,duration,nativeTimelineAdvanced:true,naturalFinishRemovesLayer:true,timersAndAnimationsReleased:true,noAudioOrVibration:true,noHorizontalOverflow:true});await context.close();
  }
  for(const lang of ['es','en']){
   const {context,page}=await open({width:390,height:667},{reducedMotion:'reduce',lang});assert.equal(await page.locator('.ts-cinema').count(),0);
   assert.equal(await page.evaluate(()=>sessionStorage.getItem('ts_intro_seen_v2')),null,'An unplayed intro must not be marked seen');
   assert.match(await page.locator('.home-cinema button').textContent(),lang==='es'?/Activar animaciones/:/Enable animations/);
   await page.locator('.home-cinema button').click();await page.locator('.ts-cinema[data-static=false]').waitFor();assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));assert.equal(await page.evaluate(()=>__app.bandReduced()),false);
   const meteor=page.locator('.cinema-meteor').first();await page.waitForTimeout(300);const first=await meteor.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(180);assert.notEqual(await meteor.evaluate(e=>getComputedStyle(e).transform),first,'The visible meteor must move, even with OS reduced motion');
   await page.locator('.ts-cinema').waitFor({state:'detached',timeout:6000});const sun=page.locator('.solar-corona');const before=await sun.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(250);assert.notEqual(await sun.evaluate(e=>getComputedStyle(e).transform),before,'The persistent sky must actually move after explicit opt-in');
   assert.notEqual(await page.locator('.meteor-one').evaluate(e=>getComputedStyle(e).display),'none');
   await page.locator('.scene-motion-toggle').click();assert.equal(await page.locator('.space-sky').evaluate(e=>e.getAnimations({subtree:true}).length),0);
   await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__app?.cinema);assert.equal(await page.evaluate(()=>__app.bandReduced()),true);
   await page.locator('.home-cinema button').click();await page.locator('.ts-cinema').waitFor();await page.keyboard.press('Escape');await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__app?.cinema);assert.equal(await page.evaluate(()=>__app.bandReduced()),false);assert.equal(await page.locator('.ts-cinema').count(),0);
   await page.screenshot({path:path.join(out,`enabled-under-os-reduce-${lang}.png`)});report.checks.push({lang,systemReducedRespectedByDefault:true,explicitChoiceStartsAnimatedIntro:true,actualMeteorAndSunTransformChanges:true,pauseStopsSky:true,choiceSurvivesRefresh:true,osSettingUnchanged:true});await context.close();
  }
  {
   const {context,page}=await open({width:1342,height:605},{reducedMotion:'reduce',appReduced:true});assert.equal(await page.locator('.ts-cinema').count(),0);await page.locator('.home-cinema button').click();await page.locator('.ts-cinema').waitFor();assert.equal(await page.evaluate(()=>__app.state.reducedMotion),false);assert.equal(await page.evaluate(()=>localStorage.getItem('ts_motion_mode')),'full');await page.keyboard.press('Escape');await page.locator('#tour-nav button').nth(1).click();await page.locator('[data-action=Play]').click();await page.waitForFunction(()=>document.querySelector('.bportrait-live')?.currentFrame===1);assert.equal(await page.locator('[data-action=Walk]').isEnabled(),true);report.checks.push({legacySavedReducedPlusOsReduced:true,explicitGlobalChoiceEnablesSpritesAndScene:true});await context.close();
  }
  {
   const {context,page}=await open({width:390,height:667});await page.locator('.ts-cinema').waitFor();await page.evaluate(()=>__app.setPreference('reducedMotion',true));assert.equal(await page.locator('.ts-cinema').count(),0);await context.close();report.checks.push({appReducedCancelsIntro:true});
  }
  {
   const {context,page}=await open({width:390,height:667});await page.locator('.ts-cinema').waitFor();await page.evaluate(()=>__app.setLang('en'));assert.equal(await page.locator('.ts-cinema button').textContent(),'Skip intro');await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.ts-cinema').waitFor({state:'detached'});await context.close();report.checks.push({languageUpdatesDuringIntro:true,systemMotionChangeCancelsIntro:true});
  }
  {
   const {context,page}=await open({width:390,height:667});await page.locator('.ts-cinema').waitFor();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('.ts-cinema').count(),0);await context.close();report.checks.push({simulatedPageHiddenCleansIntro:true});
  }
  {
   const {context,page}=await open({width:390,height:667},{noAnimation:true});assert.equal(await page.locator('.ts-cinema').count(),0);assert(await page.locator('.hero .btn.primary').isVisible());await page.locator('.hero .btn.primary').click();await page.locator('.discgrid').waitFor();await context.close();report.checks.push({animationFailureLeavesAppUsable:true});
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);
 }finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('PASS cinematic presentation',report.checks.length,'journeys');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
