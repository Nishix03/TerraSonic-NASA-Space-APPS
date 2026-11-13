const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.TERRASONIC_PLAYWRIGHT||'playwright-core');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/player/full-disc'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={checks:[],errors:[],fixture:'Complete six-frame playback in real Chromium/Web Audio, reduced motion, silent final test output, 1.4× speed. No human listening.'};
 try{
  const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{if(!route.request().url().startsWith(base))return route.abort();const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{
   localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
   Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
   const Native=window.AudioContext;window.AudioContext=class extends Native{createDynamicsCompressor(){const compressor=super.createDynamicsCompressor(),connect=compressor.connect.bind(compressor);compressor.connect=(destination,...args)=>{if(destination===this.destination){const silent=this.createGain();silent.gain.value=0;connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return compressor;}};
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);
  for(const catalog of ['eic','prev'])for(const mode of ['melody','raw']){
   await page.evaluate(({catalog,mode})=>{__app.stop();__app.goTab('juke');__app.applySet(catalog);__app.setState({disc:0,frame:0,col:-1,sub:1,engine:mode,speed:70,leadOverride:'mama',mute:__app.allMute(false),repeat:false,ended:false});__app.loadDisc(0);}, {catalog,mode});
   await page.waitForFunction(()=>__app.cur());
   await page.evaluate(()=>{window.__fullTrace=[];if(!__app.__originalRecordEvent){__app.__originalRecordEvent=__app.recordEvent;__app.recordEvent=function(...args){__fullTrace.push({frame:this.state.frame,col:this.state.col,chord:this.state.chord,at:this.ac.currentTime});return this.__originalRecordEvent(...args);};}});
   const expectedSeconds=await page.evaluate(()=>__app.playerSeconds(__app.playerSteps()));
   await page.locator('#tour-play button').click();await page.waitForFunction(()=>__app.state.playing);
   await page.waitForFunction(()=>__app.state.ended&&!__app.state.playing,{},{timeout:120000});
   const result=await page.evaluate(()=>({trace:__fullTrace,position:__app.playerPosition(),steps:__app.playerSteps(),frame:__app.state.frame,col:__app.state.col,groups:Object.keys(__app.voiceGroups).length,queue:__app.playbackQueue.length,timer:__app.timer,events:__app.state.events.length,elapsed:document.querySelector('#playback-position').getAttribute('aria-valuetext')}));
   assert.equal(result.trace.length,168,`${catalog} ${mode} must log every heard step exactly once`);
   result.trace.forEach((event,index)=>{assert.equal(event.frame,Math.floor(index/28));assert.equal(event.col,index%28);});
   assert.equal(result.position,168);assert.equal(result.frame,5);assert.equal(result.col,27);assert.equal(result.groups,0);assert.equal(result.queue,0);assert.equal(result.timer,null);assert(result.events<=200);
   report.checks.push({catalog,mode,expectedSeconds,...result});fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log('PASS full-disc',catalog,mode,'168 ordered steps',expectedSeconds,'seconds');
  }
  await page.evaluate(()=>{__app.seekPosition(166);__app.setState({repeat:true});});await page.locator('#tour-play button').click();
  await page.waitForFunction(()=>__app.state.playing&&__app.state.frame===0&&__app.state.col>=0,{},{timeout:10000});
  await page.locator('#tour-play button').click();assert.equal(await page.evaluate(()=>__app.state.playing),false);report.repeat=true;console.log('PASS repeat restarts and remains pausable');
  assert.deepEqual(report.errors,[]);await context.close();
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
