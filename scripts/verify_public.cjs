// Credential-free browser verification of the independent published static copy.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {chromium}=require(process.env.TERRASONIC_PLAYWRIGHT||'playwright-core');
const target=process.argv[2],site=path.resolve(process.argv[3]||'_site'),output=path.resolve(process.argv[4]||'_work/public/browser');
assert(target?.startsWith('https://'),'Pass the published HTTPS URL');const origin=new URL(target).origin;
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={url:target,credentialFree:true,checks:[],assets:[],html:[],errors:[],failedResponses:[]};
 try{
  for(const scenario of ['normal','no-webgl']){
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',locale:'es-PE'});
   assert.deepEqual(await context.cookies(),[]);
   await context.addInitScript(()=>{
    Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
    const Native=window.AudioContext;window.AudioContext=class extends Native{createDynamicsCompressor(){const compressor=super.createDynamicsCompressor(),connect=compressor.connect.bind(compressor);compressor.connect=(destination,...args)=>{if(destination===this.destination){const silent=this.createGain();silent.gain.value=0;connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return compressor;}};
   });
   if(scenario==='no-webgl')await context.addInitScript(()=>{const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:getContext.call(this,type,...args);};});
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push({scenario,message:error.message}));page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)report.failedResponses.push({scenario,url:response.url(),status:response.status()});});
   const response=await page.goto(target);assert.equal(response.status(),200);assert.equal(new URL(page.url()).origin,origin);
   const received=await response.body(),expected=fs.readFileSync(path.join(site,'index.html'));let providerScripts=0;
   // Compare source without the observed Cloudflare transport insertion. The real
   // browser response stays untouched and still executes its provider script.
   const normalized=received.toString('utf8').replace(/<script>([\s\S]*?)<\/script>/g,(whole,body)=>{
    if(body.startsWith('(function(){function c(){var b=a.contentDocument')&&body.includes('window.__CF$cv$params=')&&body.includes('/cdn-cgi/challenge-platform/scripts/jsd/main.js')){providerScripts++;return '';}
    return whole;
   });
   assert(providerScripts<=1);const sourceHash=createHash('sha256').update(normalized).digest('hex'),expectedHash=createHash('sha256').update(expected).digest('hex');
   assert.equal(sourceHash,expectedHash,'all application HTML must match after removing only the identified provider insertion');report.html.push({scenario,receivedSha256:createHash('sha256').update(received).digest('hex'),applicationSha256:sourceHash,providerScripts});await page.waitForFunction(()=>window.__app);
   assert.equal(await page.locator('html').getAttribute('lang'),'es');await page.getByRole('button',{name:'Continuar',exact:true}).click();
   await page.evaluate(()=>__app.setPreference('sfx',false));
   const flow=await page.locator('.home-process').boundingBox();assert(flow&&flow.y>=0&&flow.y+flow.height<=844,'The whole map-to-music strip fits in the initial mobile home');
   await page.screenshot({path:path.join(output,`${scenario}-home.png`)});
   if(scenario==='normal'){
    const files=await page.evaluate(()=>[...DISC_SETS.eic,...DISC_SETS.prev].flatMap(disc=>disc.files).concat(['support.js','runtime/avatar3d.js','runtime/vendor/three-gltf.js','data/impacts.v1.json','data/characters.v1.json','data/nasa_power_monthly.json'],['silbo','inti','mama','yaku','illapa'].flatMap(key=>[`modelos/${key}.glb`,`sprites/${key}/pose-volume.webp`,`sprites/${key}/face-volume.webp`])));
    if(fs.existsSync(path.join(site,'fonts')))files.push(...fs.readdirSync(path.join(site,'fonts')).map(file=>'fonts/'+file));
    for(const file of files){
     const result=await page.evaluate(async file=>{const response=await fetch(new URL(file,location.href),{credentials:'omit'});const bytes=await response.arrayBuffer(),hash=await crypto.subtle.digest('SHA-256',bytes);return {status:response.status,bytes:bytes.byteLength,sha256:[...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join(''),contentType:response.headers.get('Content-Type')};},file);
     assert.equal(result.status,200,file);const local=fs.readFileSync(path.join(site,file));assert.equal(result.sha256,createHash('sha256').update(local).digest('hex'),file+' must match the packaged file');report.assets.push({file,...result});
    }
   }
   await page.locator('#tour-nav button').first().click();
   for(const catalog of [0,1]){
    await page.locator('#tour-sets button').nth(catalog).click();await page.locator('.discgrid .dcard').first().click();await page.waitForFunction(()=>__app.cur());
    await page.waitForFunction(()=>{const image=document.querySelector('.mapbox img.map');return image?.complete&&image.naturalWidth>0;});
    assert.equal(await page.locator('.legend-choice').count(),4);await page.locator('#tour-play button').click();await page.waitForFunction(()=>__app.state.playing&&__app.state.col>=2);await page.locator('#tour-play button').click();assert.equal(await page.evaluate(()=>__app.state.playing),false);
    await page.locator('.headtools button').click();
   }
   await page.locator('#tour-nav button').nth(1).click();
   for(const [index,key]of ['silbo','inti','mama','yaku','illapa'].entries()){
    await page.locator('.bsel').nth(index).click();const avatar=page.locator('.bportrait-live');await avatar.scrollIntoViewIfNeeded();assert.equal(await avatar.getAttribute('data-character'),key);
    if(scenario==='normal')await page.waitForFunction(()=>document.querySelector('.bportrait-live')?.hasAttribute('data-rendered'),{},{timeout:30000});
    else await page.waitForFunction(()=>document.querySelector('.bportrait-live')?.hasAttribute('data-error'));
    const decoded=await page.evaluate(async key=>{const img=new Image();img.src=`sprites/${key}/pose-volume.webp`;await img.decode();return img.naturalWidth>0&&img.naturalHeight>0;},key);assert(decoded);
    await page.screenshot({path:path.join(output,`${scenario}-${key}.png`)});
   }
   await page.locator('#tour-nav button').nth(2).click();await page.evaluate(()=>__app.goSub(0));await page.getByRole('button',{name:'Usar imagen de ejemplo',exact:true}).click();await page.waitForFunction(()=>__app.state.custom&&__app.cur());assert.equal(await page.evaluate(()=>__app.state.custom.source),'eic');
   report.checks.push({scenario,home:true,collections:2,playPause:true,legend:true,characters:5,decodedPoses:5,sampleImage:true});console.log('PASS public',scenario);
   await context.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);console.log('PASS',report.assets.length,'public assets match the packaged SHA-256');
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
