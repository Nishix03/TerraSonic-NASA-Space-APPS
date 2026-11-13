// Exercise real history navigation without route mocks or a personal profile.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {launchBrowser,browserName}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/lifecycle');
async function main(){
 fs.mkdirSync(output,{recursive:true});const requests=[];
 const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://local');requests.push(url.pathname);
  if(url.pathname==='/away.html')return response.writeHead(200,{'Content-Type':'text/html'}).end('<!doctype html><html lang="es"><title>Prueba de historial</title><body><p>Documento local de prueba</p></body></html>');
  const file=path.resolve(site,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));if(!file.startsWith(site+path.sep)||!fs.existsSync(file))return response.writeHead(404).end();
  response.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.glb':'model/gltf-binary'})[path.extname(file)]||'application/octet-stream','Content-Length':fs.statSync(file).size});fs.createReadStream(file).pipe(response);
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,ignoreDefaultArgs:['--disable-back-forward-cache'],args:['--no-sandbox']});
 const report={fixture:'Real local HTTP navigation and history; isolated context, no routing mocks; only removes Playwright’s test-specific back/forward-cache disabling launch flag. Optional persisted lifecycle events are synthetic and identified separately.',browser:browserName,checks:[],syntheticPersistedChecks:[],errors:[],requests};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.addInitScript(()=>{
   if(!/^https?:$/.test(location.protocol))return;
   window.__documentId=Math.random().toString(36).slice(2);window.__pageShows=[];window.addEventListener('pageshow',event=>__pageShows.push({persisted:event.persisted,at:performance.now()}));window.addEventListener('pagehide',event=>sessionStorage.setItem('lifecycleLastHide',JSON.stringify({persisted:event.persisted,documentId:__documentId})));
   localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
   const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};
   window.__audioMonitors=[];window.__audioPeak=()=>Math.max(0,...__audioMonitors.map(node=>{const values=new Float32Array(node.fftSize);node.getFloatTimeDomainData(values);return Math.max(...values.map(Math.abs));}));
   const Native=window.AudioContext||window.webkitAudioContext;if(typeof Native==='function')window.AudioContext=class extends Native{createDynamicsCompressor(){const node=super.createDynamicsCompressor(),connect=node.connect.bind(node);node.connect=(destination,...args)=>{if(destination===this.destination){const monitor=this.createAnalyser();monitor.fftSize=256;__audioMonitors.push(monitor);const silent=this.createGain();silent.gain.value=0;connect(monitor);monitor.connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return node;}};
   Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);
  await page.locator('#tour-nav button').nth(2).click();await page.locator('.convert-secondary summary').first().click();
  await page.locator('.csv-picker input').setInputFiles({name:'history.csv',mimeType:'text/csv',buffer:Buffer.from('day,rain\n1,2\n2,4\n3,3\n4,6\n5,8\n6,1\n7,5\n8,9\n')});await page.waitForFunction(()=>__app.cur()&&__app.state.custom);await page.evaluate(()=>__app.seekPosition(8));
  if(!process.argv.includes('--native-only'))for(let pass=1;pass<=3;pass++){
   const audioAvailable=await page.evaluate(()=>typeof (window.AudioContext||window.webkitAudioContext)==='function');
   if(audioAvailable){await page.locator('#tour-play button').click();await page.waitForFunction(()=>__app.state.playing&&__app.playerPosition()>8);await page.waitForFunction(()=>__audioPeak()>.00001);}
   const before=await page.evaluate(()=>({name:__app.state.custom.name,url:__app.state.custom.url,position:__app.playerPosition(),events:__app.state.events.length,mute:__app.state.mute}));
   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
   const hidden=await page.evaluate(()=>({disposed:!!__app.disposed,playing:__app.state.playing,position:__app.playerPosition(),queue:__app.playbackQueue.length,timer:__app.timer}));
   report.syntheticPersistedChecks.push({pass,before,hidden});assert.equal(hidden.disposed,false,'persisted pagehide must not permanently dispose a reusable component');assert(!hidden.playing&&hidden.queue===0&&hidden.timer===null);
   await page.waitForTimeout(150);assert(await page.evaluate(()=>__audioPeak()<.00001),'persisted hide cancels audible dry and reverberant output');
   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
   const after=await page.evaluate(()=>({name:__app.state.custom.name,url:__app.state.custom.url,position:__app.playerPosition(),events:__app.state.events.length,mute:__app.state.mute}));assert.deepEqual(after,{...before,position:hidden.position},'the accepted file, heard position and mix must survive a persisted hide/show');
   await page.locator('#tour-play button').click();
   if(audioAvailable){
    await page.waitForFunction(()=>__app.state.playing&&__app.playerPosition()>8);await page.locator('#tour-play button').click();
   }else{await page.waitForFunction(()=>__app.state.audioError);assert.equal(await page.evaluate(()=>!!__app.disposed),false);}
   await page.evaluate(()=>__app.seekPosition(8));
  }
  for(let pass=1;pass<=2;pass++){
   const before=await page.evaluate(()=>({documentId:__documentId,name:__app.state.custom?.name,position:__app.playerPosition(),disposed:!!__app.disposed}));
   await page.evaluate(url=>{const link=document.createElement('a');link.href=url;link.id='lifecycle-away';link.textContent='Documento local de prueba';link.style.cssText='position:fixed;left:0;top:0;z-index:9999;background:white;color:black;padding:10px';document.body.append(link);},base+'away.html');
   await Promise.all([page.waitForURL(base+'away.html'),page.locator('#lifecycle-away').click()]);await page.goBack({waitUntil:'commit'});await page.waitForFunction(()=>window.__app&&__pageShows.length);
   const after=await page.evaluate(()=>({documentId:__documentId,name:__app.state.custom?.name,position:__app.playerPosition(),disposed:!!__app.disposed,shows:__pageShows,lastHide:JSON.parse(sessionStorage.getItem('lifecycleLastHide')),notRestoredReasons:performance.getEntriesByType('navigation')[0]?.notRestoredReasons?.toJSON()}));
   await page.locator('#lifecycle-away').evaluateAll(els=>els.forEach(el=>el.remove()));
   const restored=before.documentId===after.documentId;report.checks.push({pass,before,after,restored});fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));
   if(restored){assert(after.shows.some(event=>event.persisted),'same-document restore must be identified by pageshow');assert.equal(after.name,before.name);assert.equal(after.position,before.position);assert.equal(after.disposed,false,'a restored page must still accept player actions');}
   else break;
  }
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false})));assert.equal(await page.evaluate(()=>!!__app.disposed),true,'a final nonpersisted exit must still dispose the component');
  report.finalNonpersistedDisposal=true;assert.deepEqual(report.errors,[]);await context.close();console.log('PASS history navigation',report.checks.length,'passes; native persisted restores',report.checks.filter(check=>check.restored).length,'synthetic hide/show cycles',report.syntheticPersistedChecks.length);
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
