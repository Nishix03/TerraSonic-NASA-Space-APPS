const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),out=path.resolve(process.argv[3]||'_work/mobile-guide'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(out,{recursive:true});const b=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM});const report={checks:[],errors:[],fixture:'CSS phone/tablet viewports, actual keyboard and pointer controls; Web Audio disabled to check written fallback. Not a physical phone or screen reader.'};
 try{
  for(const [width,height]of [[320,568],[390,667],[667,375],[768,1024]])for(const language of ['es','en'])for(const large of [false,true]){
   const c=await b.newContext({viewport:{width,height},locale:language==='es'?'es-PE':'en-US',reducedMotion:'reduce'});
   await c.route('**/*',r=>{const u=r.request().url();if(/^(data:|blob:)/.test(u))return r.continue();if(!u.startsWith(base))return r.abort();const f=path.resolve(site,new URL(u).pathname.slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});});
   await c.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const set=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return set.apply(this,args);};}});});
   const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base);
   if(large)await p.locator('#preferences-big').check();
   const label=`${width}-${height}-${language}-${large?'large':'normal'}`;
   const visible=async locator=>{const box=await locator.boundingBox();assert(box&&box.x>=0&&box.x+box.width<=width+1&&box.y>=0&&box.y+box.height<=height+1,JSON.stringify({label,box}));return box;};
   for(const button of await p.locator('.preferences-actions button').all())await visible(button);
   await p.screenshot({path:path.join(out,label+'-welcome.png')});await p.locator('.preferences-actions button').last().click();
   for(let step=1;step<=3;step++){await p.waitForFunction(step=>__app.state.tour===step,step);const next=p.locator('#tour-card .tact .primary');assert.equal(await next.isDisabled(),false);await visible(next);await p.screenshot({path:path.join(out,label+`-skip-${step}.png`)});await next.click();}
   assert.equal(await p.locator('#tour-card').count(),0);assert.equal(await p.evaluate(()=>__app.state.playing),false);
   // Reopen and complete actual disc and legend actions; continue with text when audio is absent.
   await p.evaluate(()=>__app.startTutorial());await p.locator('.discgrid .dcard').first().click();await p.waitForFunction(()=>__app.state.tour===2);
   await p.locator('#tour-play button').click();await p.waitForFunction(()=>!!__app.state.audioError);await p.locator('#tour-card .tbubble .btn').click();await p.waitForFunction(()=>__app.state.tour===3);
   await p.locator('.legend-choice').nth(2).click();await p.locator('#tour-card .tact .primary').click();assert.equal(await p.locator('#tour-card').count(),0);
   assert.equal(await p.evaluate(()=>__app.state.tutorialDone.disc&&__app.state.tutorialDone.play&&__app.state.tutorialDone.legend),true);
   await p.locator('#tour-guide').click();await p.keyboard.press('Escape');assert.equal(await p.locator('#tour-card').count(),0);assert.equal(await p.evaluate(()=>document.activeElement.id),'tour-guide');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.checks.push({label,entryActionsVisible:true,skipAllSteps:true,realActionsAndWrittenFallback:true,escapeAndReturnFocus:true});await c.close();
  }
  assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await b.close();}
 console.log('PASS mobile introduction and tutorial',report.checks.length,'scenarios');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
