// Original drawings, manual motion/steps, lifecycle and no-3D delivery.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),out=path.resolve(process.argv[3]||'_work/sprites/browser'),base='http://terrasonic.test/';
const keys=['silbo','inti','mama','yaku','illapa'];
const hash=data=>createHash('sha256').update(data).digest('hex');
async function main(){
 fs.mkdirSync(out,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM});
 const report={fixture:'Native 2D image decoding, real timers and DOM controls in CSS viewports. No physical phone or human animation review claimed.',assets:[],checks:[],errors:[],failedResponses:[],requests:[]};
 try{
  for(const key of keys)for(let n=0;n<4;n++){
   const relative=`sprites/${key}/keyframes/0${n}.png`,source=path.resolve('assets/avatares',key,'banda/keyframes',`0${n}.png`);
   const packaged=fs.readFileSync(path.join(site,relative));assert.equal(hash(packaged),hash(fs.readFileSync(source)));report.assets.push({relative,sha256:hash(packaged),bytes:packaged.length});
  }
  assert(!fs.existsSync(path.join(site,'modelos')));assert(!fs.existsSync(path.join(site,'runtime/vendor')));
  for(const viewport of [{width:390,height:667},{width:1342,height:605}]){
   const context=await browser.newContext({viewport,locale:'es-PE',reducedMotion:'no-preference'});
   await context.route('**/*',r=>{const u=r.request().url();report.requests.push(u);if(/^(blob:|data:)/.test(u))return r.continue();if(!u.startsWith(base))return r.abort();const f=path.resolve(site,new URL(u).pathname.slice(1)||'index.html');return f.startsWith(site+path.sep)&&fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});});
   await context.addInitScript(()=>{
    localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
    Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const set=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return set.apply(this,args);};}});
    const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...a){if(/webgl/i.test(type))throw Error('No 3D contexts are allowed in the 2D edition');return get.call(this,type,...a);};
   });
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResponses.push(r.url());});
   await page.goto(base);await page.locator('#tour-nav button').nth(1).click();
   for(const [i,key]of keys.entries()){
    await page.locator('.bsel').nth(i).click();const avatar=page.locator('.bportrait-live');await avatar.scrollIntoViewIfNeeded();
    await page.waitForFunction(key=>{const a=document.querySelector('.bportrait-live');return a?.key===key&&a.hasAttribute('data-rendered')&&a.image.complete&&a.image.naturalWidth>0;},key);
    for(const mode of ['Play','Walk','Dance']){
     await page.locator(`ts-sprite-controls [data-action="${mode}"]`).click();await page.waitForFunction(mode=>{const a=document.querySelector('.bportrait-live');return a.running&&a.mode===mode&&a.currentFrame===1;},mode);
     await page.locator('ts-sprite-controls [data-action="pause"]').click();const frame=await avatar.getAttribute('data-frame');await page.waitForTimeout(240);assert.equal(await avatar.getAttribute('data-frame'),frame);assert.equal(await avatar.evaluate(a=>a.running),false);
     const before=await avatar.evaluate(a=>a.index);await page.locator('ts-sprite-controls [data-action="next"]').click();assert.equal(await avatar.evaluate(a=>a.index),before+1);
     await page.locator('ts-sprite-controls [data-action="previous"]').click();assert.equal(await avatar.evaluate(a=>a.index),before);
     report.checks.push({viewport,key,mode,pauseFreezes:true,stepForwardAndBack:true});
    }
    await page.locator('ts-sprite-controls summary').click();await page.locator('.sprite-frames button').nth(3).waitFor();assert.equal(await page.locator('.sprite-frames button').count(),4);
    for(let n=0;n<4;n++){await page.locator(`.sprite-frames [data-original="${n}"]`).click();assert.equal(await avatar.getAttribute('data-frame'),String(n));await page.waitForFunction(()=>document.querySelector('.bportrait-live img')?.complete);assert.equal(await avatar.locator('img').evaluate(im=>im.naturalWidth),512);}
    await page.locator('ts-sprite-controls summary').click();await page.locator('ts-sprite-controls [data-action="stop"]').click();
    await avatar.scrollIntoViewIfNeeded();if(viewport.width===390)await page.screenshot({path:path.join(out,`mobile-${key}.png`),fullPage:true});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false);
   }
   await page.locator('ts-sprite-controls [data-action="Walk"]').click();await page.waitForFunction(()=>document.querySelector('.bportrait-live').running);
   await page.evaluate(()=>__app.setPreference('reducedMotion',true));assert.equal(await page.locator('.bportrait-live').evaluate(a=>a.running),false);assert(await page.locator('[data-action="Walk"]').isDisabled());
   await page.locator('[data-action="next"]').click();assert.equal(await page.locator('.bportrait-live').evaluate(a=>a.running),false);
   await page.locator('#tour-lang button').nth(1).click();assert.equal(await page.locator('[data-action="next"]').textContent(),'Next step');
   await page.evaluate(()=>__app.setPreference('reducedMotion',false));
   await page.locator('[data-action="Walk"]').click();await page.waitForFunction(()=>document.querySelector('.bportrait-live').running);
   await page.evaluate(()=>window.__departingSprite=document.querySelector('.bportrait-live'));
   await page.locator('#tour-nav button').first().click();await page.locator('.discgrid .dcard').first().click();assert.equal(await page.locator('.listen-members ts-avatar').count(),5);
   assert.equal(await page.evaluate(()=>__departingSprite.isConnected),false);assert.equal(await page.evaluate(()=>__departingSprite.timer),0);assert.equal(await page.evaluate(()=>__departingSprite.running),false);
   await page.locator('.listen-members').scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('.listen-members ts-avatar img')].every(im=>im.complete&&im.naturalWidth>0));
   await page.evaluate(()=>__app.goSub(2));await page.locator('.musicians').scrollIntoViewIfNeeded();assert.equal(await page.locator('.musicians ts-avatar').count(),5);
   await page.waitForFunction(()=>[...document.querySelectorAll('.musicians ts-avatar img')].every(im=>im.complete&&im.naturalWidth>0));await context.close();
  }
  assert(!report.requests.some(u=>/\.glb|three-gltf|avatar3d|volume\.webp/.test(u)));assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);
 }finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('PASS original 2D sprites',report.assets.length,'original PNGs,',report.checks.length,'motion/step journeys');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
