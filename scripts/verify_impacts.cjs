const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site = path.resolve(process.argv[2] || '_site');
const output = path.resolve(process.argv[3] || '_work/impacts/browser');
const base = 'http://terrasonic.test/';

async function main() {
  fs.mkdirSync(output,{recursive:true});
  const browser = await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,
    args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const context = await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  const report = {checks:[],errors:[]};
  try {
    await context.route('**/*',async route=>{
      if(/^(blob:|data:)/.test(route.request().url()))return route.continue();if(!route.request().url().startsWith(base))return route.abort();
      const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');
      if(file.startsWith(site+path.sep)&&fs.existsSync(file))return route.fulfill({path:file});
      return route.fulfill({status:404});
    });
    await context.addInitScript(()=>{
      localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{}}));
      Object.defineProperty(window,'DCLogic',{configurable:true,set(value){
        Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;
        value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};
      }});
      const Native=window.AudioContext;
      window.AudioContext=class extends Native {
        createDynamicsCompressor(){const compressor=super.createDynamicsCompressor(),connect=compressor.connect.bind(compressor);
          compressor.connect=(destination,...args)=>{if(destination===this.destination){const silent=this.createGain();silent.gain.value=0;connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return compressor;}
      };
    });
    const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
    await page.goto(base);await page.waitForFunction(()=>window.__app);await page.evaluate(()=>{__app.state.sfx=false;});
    await page.locator('#tour-nav button').first().click();await page.locator('#tour-sets button').nth(1).click();
    await page.locator('.discgrid .dcard').nth(3).click();await page.locator('.timeline button').nth(2).click();
    await page.waitForFunction(()=>__app.cur());
    const profile=await page.evaluate(()=>{const p=__app.profile();return {bpm:p.bpm,base:p.baseBpm,mode:p.mode,impact:p.impactId,stepMs:__app.stepMs()};});
    assert.equal(profile.impact,'pacora-2023-03-08');assert.equal(profile.bpm,profile.base-10);
    assert.match(await page.locator('.when').textContent(),new RegExp(profile.bpm+' ppm'));
    await page.locator('.player-impact summary').click();
    assert.match(await page.locator('.player-impact').textContent(),/29 viviendas afectadas/);
    assert.match(await page.locator('.player-impact').textContent(),/110 personas afectadas/);
    assert.match(await page.locator('.player-impact a').first().getAttribute('href'),/2529/);
    await page.evaluate(()=>{
      window.__ticks=[];const original=__app.stepMelody;__app.stepMelody=function(col,scheduled){__ticks.push(scheduled?.at??this.ac.currentTime);return original.call(this,col,scheduled);};
      __app.setBandMute(__app.only('mama'));
    });
    await page.locator('#tour-play button').click();await page.waitForFunction(()=>__ticks.length>=6);
    await page.locator('#tour-play button').click();
    const times=await page.evaluate(()=>__ticks), differences=times.slice(1).map((time,i)=>time-times[i]);
    const median=differences.slice().sort((a,b)=>a-b)[Math.floor(differences.length/2)];
    assert(Math.abs(median-profile.stepMs/1000)<.08,'Actual scheduling must follow the editorial tempo');
    report.timing={profile,times,medianStepSeconds:median};report.checks.push('Real Web Audio scheduling follows the Pacora tempo change');
    await page.locator('#tour-lang button').nth(1).click();assert.equal(await page.evaluate(()=>__app.profile().bpm),profile.bpm);
    assert.match(await page.locator('.player-impact').textContent(),/affected homes/);
    await page.screenshot({path:path.join(output,'pacora-english.png')});
    await page.locator('.player-modes button').nth(1).click();
    assert.equal(await page.evaluate(()=>__app.profile().impactId),undefined);assert.equal(await page.evaluate(()=>__app.stepMs()),110);
    await page.locator('.player-modes button').first().click();await page.locator('.timeline button').nth(3).click();
    await page.waitForFunction(()=>__app.cur());assert.equal(await page.evaluate(()=>__app.profile().impactId),undefined);
    report.checks.push('English preserves music values; Data and April do not apply the March rule');
    await page.locator('.headtools button').click();await page.locator('.discgrid .dcard').nth(1).click();
    await page.locator('.timeline button').nth(5).click();assert.equal(await page.evaluate(()=>__app.currentImpact()),null);
    report.checks.push('Paita March 2016 does not activate on the July–December 2015 disc');
    await page.locator('.headtools button').click();await page.locator('.discgrid .dcard').nth(4).click();
    await page.locator('.timeline button').nth(5).click();
    assert.equal(await page.evaluate(()=>__app.currentImpact().id),'tumbes-2023-12-27');
    assert.equal(await page.evaluate(()=>__app.profile().impactId),undefined);
    assert.equal(await page.evaluate(()=>findImpactRecord(IMPACT_CATALOG,'nino2023','2024-02')),null);
    report.checks.push('Tumbes uses its December 2023 source and retains base harmony; February 2024 is absent');
    assert.deepEqual(report.errors,[]);report.checks.forEach(check=>console.log('PASS',check));
  } finally {fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await context.close();await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
