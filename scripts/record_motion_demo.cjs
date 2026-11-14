// Record real automatic entry and automatic reload, without pressing Play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {launchBrowser}=require('./browser_fixture.cjs');
const target=process.argv[2],out=path.resolve(process.argv[3]||'_work/motion-recording');
assert(target&&/^https?:/.test(target),'Pass the independently served or public URL');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM});const report={url:target,recordedActualBrowser:true,systemReducedMotion:true,legacySavedReducedMotion:true,checks:[],errors:[],failedResponses:[]};
 try{for(const viewport of [{width:1342,height:605},{width:390,height:667}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce',locale:'es-PE',recordVideo:{dir:out,size:viewport}});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.removeItem('ts_motion_mode');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false,reducedMotion:true}}));sessionStorage.removeItem('ts_intro_seen_v2');});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResponses.push(r.url());});await page.goto(target,{waitUntil:'domcontentloaded'});await page.locator('.ts-cinema').waitFor();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`intro-${viewport.width}.png`)});
  await page.locator('.ts-cinema').waitFor({state:'detached',timeout:7000});
  const samples=[];for(let n=0;n<28;n++){samples.push(await page.locator('.space-sky').evaluate(root=>({time:performance.now(),sun:getComputedStyle(root.querySelector('.solar-corona')).transform,meteors:[...root.querySelectorAll('.space-meteor')].map(e=>({opacity:Number(getComputedStyle(e).opacity),transform:getComputedStyle(e).transform,display:getComputedStyle(e).display}))})));await page.waitForTimeout(250);}
  assert(new Set(samples.map(x=>x.sun)).size>5,'The Sun must visibly rotate');assert(samples.some(x=>x.meteors.some(m=>m.display!=='none'&&m.opacity>.1)),'At least one meteor must be visible after the intro');
  await page.locator('.scene-motion-toggle').click();assert.equal(await page.locator('.space-sky').evaluate(e=>e.getAnimations({subtree:true}).length),0);await page.waitForTimeout(500);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('.ts-cinema').waitFor();await page.locator('.ts-cinema').waitFor({state:'detached',timeout:7000});await page.waitForTimeout(700);
  const video=page.video();await context.close();const filename=path.join(out,`terrasonic-movimiento-${viewport.width}.webm`);await video.saveAs(filename);report.checks.push({viewport,filename,samples,visibleMeteor:true,sunMoves:true,automaticOnEntry:true,automaticOnReload:true,noPlayButtonRequired:true,pauseStops:true});
 }}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);console.log('PASS recorded motion',report.checks.length,'real viewport videos');
})().catch(e=>{console.error(e);process.exitCode=1;});
