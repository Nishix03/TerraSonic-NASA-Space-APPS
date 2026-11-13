// Verify portrait gestures do not steal vertical scrolling or a two-pointer zoom.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/models/interactions'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={fixture:'Native mouse events and synthetic PointerEvents for multitouch/cancel; does not claim physical pinch or native browser zoom',checks:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=route.request().url();if(/^(blob:|data:)/.test(url))return route.continue();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.locator('#tour-nav button').nth(1).click();
  const avatar=page.locator('.bportrait-live');await avatar.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.bportrait-live')?.hasAttribute('data-rendered'));
  const box=await avatar.boundingBox(),yaw=await avatar.evaluate(el=>el.targetYaw);await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+25,box.y+box.height/2);await page.mouse.up();
  assert((await avatar.evaluate(el=>el.targetYaw))>yaw);report.checks.push('A real mouse drag still rotates the model');
  const gestures=await avatar.evaluate(el=>{
   const captured=new Set(),nativeSet=el.setPointerCapture.bind(el),nativeHas=el.hasPointerCapture.bind(el),nativeRelease=el.releasePointerCapture.bind(el);
   el.setPointerCapture=id=>id>=9000?captured.add(id):nativeSet(id);el.hasPointerCapture=id=>id>=9000?captured.has(id):nativeHas(id);el.releasePointerCapture=id=>id>=9000?captured.delete(id):nativeRelease(id);
   const event=(type,id,x,y)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',button:0,buttons:type==='pointerdown'||type==='pointermove'?1:0,isPrimary:id===9001,clientX:x,clientY:y,bubbles:true}));
   const initial=el.targetYaw;
   event('pointerdown',9001,100,100);event('pointermove',9001,103,160);const afterVertical=el.targetYaw;event('pointercancel',9001,103,160);event('pointermove',9001,180,160);const afterCancelled=el.targetYaw;
   event('pointerdown',9001,100,100);event('pointerdown',9002,220,100);event('pointermove',9001,80,100);event('pointermove',9002,240,100);const afterTwoPointers=el.targetYaw;
   event('pointerup',9001,80,100);event('pointerup',9002,240,100);
   const beforeSingle=el.targetYaw;event('pointerdown',9001,100,100);event('pointermove',9001,125,100);event('pointerup',9001,125,100);const afterSingle=el.targetYaw;
   const beforeAfterRelease=el.targetYaw;event('pointermove',9001,170,100);
   return {initial,afterVertical,afterCancelled,afterTwoPointers,beforeSingle,afterSingle,afterRelease:el.targetYaw,beforeAfterRelease,touchAction:getComputedStyle(el).touchAction};
  });
  report.gestures=gestures;assert.equal(gestures.afterVertical,gestures.initial);assert.equal(gestures.afterCancelled,gestures.initial,'a cancelled scroll cannot resume rotation');assert.equal(gestures.afterTwoPointers,gestures.initial,'two pointers must not rotate the portrait');assert(gestures.afterSingle>gestures.beforeSingle);assert.equal(gestures.afterRelease,gestures.beforeAfterRelease);assert.match(gestures.touchAction,/pan-y/);assert.match(gestures.touchAction,/pinch-zoom/);
  report.checks.push('Vertical movement, cancellation, release and two-pointer gestures preserve their intended behavior');
  await page.evaluate(async()=>{
   const {Scene}=await import('./runtime/vendor/three-gltf.js'),add=Scene.prototype.add;
   window.__sceneCounts=[];
   Scene.prototype.add=function(...objects){const result=add.apply(this,objects);window.__sharedScene=this;__sceneCounts.push(this.children.filter(child=>!child.isLight).length);return result;};
   for(const Context of [window.WebGLRenderingContext,window.WebGL2RenderingContext].filter(Boolean))for(const method of ['drawElements','drawArrays']){
    const draw=Context.prototype[method];Context.prototype[method]=function(...args){if(document.querySelector('.bportrait-live')?.dataset.character==='silbo')throw Error('controlled renderer failure');return draw.apply(this,args);};
   }
   document.querySelector('.bportrait-live').rotate();
  });
  await page.waitForFunction(()=>document.querySelector('.bportrait-live')?.hasAttribute('data-error'));
  const fallback=await avatar.evaluate(el=>getComputedStyle(el,'::before').display!=='none');assert(fallback);
  report.sceneAfterFailure=await page.evaluate(()=>__sharedScene.children.filter(child=>!child.isLight).length);
  assert.equal(report.sceneAfterFailure,0,'a failed render releases its character from the shared scene');
  await page.locator('.bsel').nth(1).click();await page.waitForFunction(()=>document.querySelector('.bportrait-live')?.dataset.character==='inti'&&document.querySelector('.bportrait-live')?.hasAttribute('data-rendered'));
  report.sceneCounts=await page.evaluate(()=>__sceneCounts);assert(report.sceneCounts.every(count=>count===1),'a failed render must not leave an old character in the shared scene');
  report.checks.push('A controlled renderer failure keeps the static pose and does not contaminate the next model');
  assert.deepEqual(report.errors,[]);await page.screenshot({path:path.join(output,'portrait.png')});await context.close();console.log('PASS portrait gestures');
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
