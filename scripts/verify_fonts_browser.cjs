// Verify actual font decoding and a usable fallback when local font responses fail or wait.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.TERRASONIC_PLAYWRIGHT||'playwright-core');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/fonts/browser'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'Native Chromium FontFace decoding; network failures/delay are controlled fixtures',checks:[],errors:[]};
 try{
  for(const scenario of ['normal','missing','delayed']){
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),requests=[],external=[];
   let release;const gate=new Promise(resolve=>release=resolve);
   await context.route('**/*',async route=>{
    const url=route.request().url();if(!url.startsWith(base)){external.push(url);return route.abort();}
    if(url.endsWith('.woff2')){requests.push(url);if(scenario==='missing')return route.abort();if(scenario==='delayed')await gate;}
    const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});
   });
   await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('.cinema-skip').click();await page.waitForFunction(()=>window.__app);
   const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
   if(scenario==='delayed')await page.waitForFunction(()=>document.fonts.status==='loading');
   assert(await page.locator('.hero h1').isVisible());assert(await page.locator('.hero .btn.primary').isEnabled());
   const before=await page.evaluate(()=>({status:document.fonts.status,text:document.querySelector('.hero h1').textContent,faces:[...document.fonts].filter(face=>face.status==='loaded').length}));
   release();await page.evaluate(()=>document.fonts.ready);
   let decoded=[];
   if(scenario!=='missing'){
    decoded=await page.evaluate(async()=>{
     const specifications=[['Barlow',500],['Barlow',600],['Barlow',700],['Inter',400],['Inter',500],['Inter',600],['IBM Plex Mono',400],['IBM Plex Mono',500],['Atkinson Hyperlegible',400],['Atkinson Hyperlegible',700]];
     return Promise.all(specifications.map(async([family,weight])=>{const faces=await document.fonts.load(`${weight} 16px "${family}"`,'Árbol Ñandú');return {family,weight,faces:faces.map(face=>({family:face.family,status:face.status}))};}));
    });
    decoded.forEach(item=>{assert.equal(item.faces.length,1,JSON.stringify(item));assert.equal(item.faces[0].status,'loaded');});
    assert.equal(new Set(requests).size,8);
   }else assert.equal(await page.evaluate(()=>document.fonts.check('500 16px Barlow')),false);
   const states=[];
   for(const legible of [false,true]){
    await page.evaluate(legible=>__app.setPreference('legible',legible),legible);await page.evaluate(()=>document.fonts.ready);
    const geometry=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,body:getComputedStyle(document.querySelector('.app')).fontFamily,nav:[...document.querySelectorAll('#tour-nav button')].every(button=>button.getBoundingClientRect().width>=44)}));
    const document=await cdp.send('DOM.getDocument'),node=await cdp.send('DOM.querySelector',{nodeId:document.root.nodeId,selector:'.hero h1'}),rendered=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});
    assert(geometry.width<=geometry.viewport);assert(geometry.nav);
    const expected=legible?'Atkinson Hyperlegible':'Barlow';
    if(scenario!=='missing')assert(rendered.fonts.some(font=>font.familyName===expected&&font.isCustomFont),JSON.stringify(rendered));
    else assert(rendered.fonts.every(font=>!font.isCustomFont));
    states.push({legible,...geometry,renderedFonts:rendered.fonts});
    await page.screenshot({path:path.join(output,`${scenario}-${legible?'atkinson':'default'}.png`)});
   }
   assert.deepEqual(external,[],'the static product needs no third-party font request');report.checks.push({scenario,before,decoded,states,fontRequests:new Set(requests).size});
   console.log('PASS fonts',scenario);await context.close();
  }
  assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
