// Exercise an extracted, independently served HTTP package without route mocks.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const target=process.argv[2],output=path.resolve(process.argv[3]||'_work/delivery/browser');
assert(target&&['http:','https:'].includes(new URL(target).protocol),'Pass the independently served package URL');
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={url:target,fixture:'Fresh browser contexts, real HTTP, no routing mocks or stored profile; does not play audio',checks:[],errors:[],failedResponses:[],externalRequests:[]},origin=new URL(target).origin;
 try{
  for(const viewport of [{width:390,height:844},{width:1342,height:605}]){
   const context=await browser.newContext({viewport,locale:'es-PE',reducedMotion:'reduce'}),page=await context.newPage();
   await context.addInitScript(()=>{const Native=window.AudioContext||window.webkitAudioContext;if(typeof Native!=='function')return;window.AudioContext=class extends Native{createGain(){const node=super.createGain(),connect=node.connect.bind(node);node.connect=(destination,...args)=>{if(destination===this.destination){const silent=super.createGain();silent.gain.value=0;connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return node;}};});
   page.on('pageerror',error=>report.errors.push(error.message));page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(origin))report.failedResponses.push({url:response.url(),status:response.status()});});page.on('request',request=>{if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))report.externalRequests.push(request.url());});
   const response=await page.goto(target);assert.equal(response.status(),200);await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.evaluate(()=>document.fonts.ready);
   const process=await page.locator('.home-process').boundingBox();assert(process.y>=0&&process.y+process.height<=viewport.height);
   assert(await page.evaluate(()=>document.fonts.check('700 16px Barlow')));await page.screenshot({path:path.join(output,'home-'+viewport.width+'.png')});
   await page.locator('#tour-nav button').first().click();assert.equal(await page.locator('.discgrid .dcard').count(),5);await page.locator('.discgrid .dcard').first().click();await page.locator('#playback-position').waitFor();await page.waitForFunction(()=>{const image=document.querySelector('.mapbox img.map');return image?.complete&&image.naturalWidth>0;});
   assert.equal(await page.locator('#playback-position').getAttribute('max'),'168');assert.equal(await page.locator('.legend-choice').count(),3);assert.equal(await page.locator('#tour-machine .heard > div').count(),448);
   await page.evaluate(()=>document.fonts.ready);
   const playerCore=await page.locator('.uni').evaluate(root=>({bandBottom:root.querySelector('.listen-band').getBoundingClientRect().bottom,controlsBottom:root.querySelector('.player-sidebar').getBoundingClientRect().bottom}));
   if(viewport.width>=1280)assert(playerCore.bandBottom<=viewport.height&&playerCore.controlsBottom<=viewport.height,'The initial player must fit the original desktop window: '+JSON.stringify(playerCore));
   await page.screenshot({path:path.join(output,'player-'+viewport.width+'.png')});
   await page.locator('#tour-nav button').nth(1).click();
   await page.waitForFunction(()=>{const img=document.querySelector('.bportrait-live');return img?.complete&&img.naturalWidth>0;});
   await page.getByRole('button',{name:'¿Cómo funciona?',exact:true}).click();
   await page.getByRole('button',{name:'Prueba práctica',exact:true}).click();
   await page.locator('#tour-sample button').click();
   await page.getByRole('heading',{name:/Chiclayo.*NASA POWER/}).waitFor();
   const sample=await context.request.get(new URL('fotogramas/ver2025_2.webp',target).href);
   assert(sample.ok());
   await page.locator('#tour-drop input').setInputFiles({name:'portable.webp',mimeType:'image/webp',buffer:await sample.body()});
   await page.waitForFunction(()=>{const img=document.querySelector('.practice-example img');return img?.complete&&img.naturalWidth>0;});
   assert.equal(await page.locator('#tour-sample').count(),0);
   await page.locator('#tour-lang button').nth(1).click();
   assert.equal(await page.locator('html').getAttribute('lang'),'en');
   assert.equal(await page.locator('.practice-example img').getAttribute('alt'),'portable.webp');
   report.checks.push({viewport,home:true,fonts:true,mapAndLegend:true,playerCore,portrait2D:true,rainfall:true,imageUpload:true,language:true});
   await page.screenshot({path:path.join(output,'practice-'+viewport.width+'.png')});
   await context.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResponses,[]);assert.deepEqual(report.externalRequests,[]);console.log('PASS standalone package journeys',report.checks.length,'real HTTP viewports');
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
