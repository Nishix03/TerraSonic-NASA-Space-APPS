// Compare animated model bounds with the real runtime camera, using native Three.js.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/models/framing'),base='http://terrasonic.test/';
const keys=['silbo','inti','mama','yaku','illapa'];
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={fixture:'Native GLTF/skin transforms and actual orthographic camera; sampled clip fractions and CSS viewports. Pose timing is driven by this fixture, not music. Not every animation frame or physical device.',checks:[],failures:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  await context.route('**/*',route=>{const url=route.request().url();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false,reduce:false}}));Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);
  await page.evaluate(async()=>{window.__framingAPI=await import('./runtime/vendor/three-gltf.js');const proto=__framingAPI.OrthographicCamera.prototype,original=proto.updateProjectionMatrix;proto.updateProjectionMatrix=function(...args){const result=original.apply(this,args);window.__framingCamera=this;return result;};});
  async function sample(avatar,label,portrait){
   await avatar.scrollIntoViewIfNeeded();await page.waitForFunction(selector=>{const el=document.querySelector(selector);return el?.model&&el.inView&&el.hasAttribute('data-rendered');},await avatar.evaluate(el=>{el.id='framing-target';return '#framing-target';}));
   const result=await avatar.evaluate((el,{label,portrait})=>{
    const {Box3,Vector3}=__framingAPI,originalAnimation=el.animation,originalYaw=el.targetYaw,rows=[],failures=[];
    const angles=portrait?Array.from({length:8},(_,i)=>.32+i*Math.PI/4):[el.dataset.view==='stage'?.17:.12];
    try{
     for(const [name,clip]of el.clips){let worst=1,total=0;
      for(const fraction of [0,.25,.5,.75,.99])for(const yaw of angles){
       el.animation=()=>[clip,clip.duration*fraction,true];el.yaw=el.targetYaw=yaw;if(!el.draw(performance.now()))throw Error('No drawable model: '+label);
       const camera=__framingCamera;camera.updateMatrixWorld(true);el.model.updateMatrixWorld(true);const box=new Box3().setFromObject(el.model,true);let extent=0;
       for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new Vector3(x,y,z).project(camera);extent=Math.max(extent,Math.abs(p.x),Math.abs(p.y),Math.abs(p.z));}
       // A projected AABB can overestimate corners with no actual vertex.
       // Only when that envelope crosses the camera, inspect skinned vertices.
       let precise=false;
       if(extent>1.0001){extent=0;precise=true;el.model.traverse(mesh=>{if(!mesh.isMesh)return;const vertex=new Vector3();for(let i=0;i<mesh.geometry.attributes.position.count;i++){mesh.getVertexPosition(i,vertex);vertex.applyMatrix4(mesh.matrixWorld).project(camera);extent=Math.max(extent,Math.abs(vertex.x),Math.abs(vertex.y),Math.abs(vertex.z));}});}
       total++;worst=Math.min(worst,1-extent);if(extent>1.0001)failures.push({label,clip:name,fraction,yaw,extent,precise});
      }
      rows.push({label,clip:name,samples:total,minNormalizedMargin:worst,width:el.width,height:el.height});
     }
    }finally{el.animation=originalAnimation;el.targetYaw=originalYaw;el.removeAttribute('id');}
    return {rows,failures};
   },{label,portrait});report.checks.push(...result.rows);report.failures.push(...result.failures);
  }
  for(const viewport of [{width:390,height:844},{width:1342,height:605}]){
   await page.setViewportSize(viewport);await page.evaluate(()=>__app.goTab('band'));await page.waitForFunction(()=>!__app.state.trans);
   for(const [index,key]of keys.entries()){await page.locator('.bpick button').nth(index).click();await sample(page.locator('.bportrait-live'),`${viewport.width}-portrait-${key}`,true);}
   await page.evaluate(()=>__app.goTab('juke'));await page.waitForFunction(()=>!__app.state.trans);await page.locator('.discgrid .dcard').first().click();await page.waitForFunction(()=>__app.cur()&&!__app.state.trans);await page.evaluate(()=>__app.setBandMute(__app.allMute(false)));
   for(const [index,key]of keys.entries())await sample(page.locator('.listen-member ts-avatar').nth(index),`${viewport.width}-member-${key}`,false);
   await page.locator('.bar .side.r button').click();await page.waitForFunction(()=>!__app.state.trans);
   for(const [index,key]of keys.entries())await sample(page.locator('ts-avatar[data-view="stage"]').nth(index),`${viewport.width}-stage-${key}`,false);
   console.log('CHECK framing',viewport.width,report.failures.length,'failures');
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failures,[],'Sampled animated geometry must stay within the actual full-body camera');await context.close();
 }finally{try{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));}finally{await browser.close();}}
 console.log('PASS animated framing',report.checks.reduce((sum,row)=>sum+row.samples,0),'samples');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
