// Measure command/onset timing with a real AudioContext. Output is silenced only
// after the compressor; this is a timing benchmark, not a human listening test.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{performance}=require('node:perf_hooks');
const {createHash}=require('node:crypto');
const {chromium}=require(process.env.TERRASONIC_PLAYWRIGHT||'playwright-core');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/benchmarks/audio.json');
const warmModels=process.argv.includes('--warm-models');
async function main(){
 const server=http.createServer((request,response)=>{const requested=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(site,'.'+(requested==='/'?'/index.html':requested));if(!file.startsWith(site+path.sep)||!fs.existsSync(file))return response.writeHead(404).end();response.writeHead(200,{'Content-Type':({'.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.html':'text/html','.json':'application/json','.webp':'image/webp','.glb':'model/gltf-binary','.png':'image/png'})[path.extname(file)]||'application/octet-stream','Content-Length':fs.statSync(file).size,'Cache-Control':'no-store'});fs.createReadStream(file).pipe(response);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--no-proxy-server','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={provenance:{observedAt:new Date().toISOString(),browserVersion:browser.version(),indexSha256:createHash('sha256').update(fs.readFileSync(path.join(site,'index.html'))).digest('hex')},profile:{width:390,height:844,cpuRate:4,latency:150,downloadBytesPerSecond:204800,uploadBytesPerSecond:102400,cache:'disabled',reducedMotion:'no-preference'},fixture:'Real AudioContext timing; silent final output. A 200 ms main-thread block is deliberately injected after 2 s as a diagnostic, not a normal user action.',samples:[],errors:[]};
 report.profile.models=warmModels?'All five assets preloaded in application memory, then all five player models rendered before observation':'Cold model requests allowed during observation';
 try{
  for(const mode of ['melody','raw']){
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
   await context.addInitScript(()=>{
    localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
    window.__renders=[];
    Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;const start=performance.now(),result=original.apply(this,args);if(__renders.length<2000)__renders.push({at:start,ms:performance.now()-start,keys:Object.keys(args[0]||{})});return result;};}});
    window.__starts=[];window.__ticks=[];window.__longTasks=[];
    try{new PerformanceObserver(list=>__longTasks.push(...list.getEntries().map(entry=>({start:entry.startTime,duration:entry.duration})))).observe({type:'longtask',buffered:true});}catch(ignored){}
    const Native=window.AudioContext;window.AudioContext=class extends Native{
     createOscillator(){const oscillator=super.createOscillator(),start=oscillator.start.bind(oscillator);oscillator.start=(when=0)=>{__starts.push({at:when,calledAt:this.currentTime,wall:performance.now(),frame:window.__stepFrame,col:window.__stepCol});return start(when);};return oscillator;}
     createDynamicsCompressor(){const compressor=super.createDynamicsCompressor(),connect=compressor.connect.bind(compressor);compressor.connect=(destination,...args)=>{if(destination===this.destination){const silent=this.createGain();silent.gain.value=0;connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return compressor;}
    };
   });
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));const cdp=await context.newCDPSession(page);
   await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:204800,uploadThroughput:102400});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__app);await page.evaluate(()=>__app.state.sfx=false);
   if(warmModels){
    await page.locator('#tour-nav button').nth(1).click();
    for(let index=0;index<5;index++){
     console.log('PRELOAD',mode,index+1);
     await page.locator('.bpick button').nth(index).click();await page.locator('.bportrait-live').scrollIntoViewIfNeeded();
     await page.locator('.bportrait-live[data-rendered]').waitFor({timeout:120000});
    }
   }
   await page.locator('#tour-nav button').first().click();await page.locator('.dcard').first().click();
   await page.locator('#tour-play button').waitFor();await page.waitForFunction(()=>__app.cur()&&__app.state.sub===1&&!__app.state.trans);
   await page.evaluate(mode=>{
    if(typeof __app.setEngine==='function')__app.setEngine(mode);else __app.setState({engine:mode});
    if(typeof __app.setBandMute==='function')__app.setBandMute(__app.allMute(false));else __app.setState({mute:__app.allMute(false)});
    if(Object.values(__app.state.mute).some(Boolean))throw Error('The measured mix must enable all five musicians');
    for(const method of ['stepMelody','step']){const original=__app[method];__app[method]=function(col,...args){const scheduled=args[0],frame=scheduled?.state?.frame??this.state.frame;window.__stepFrame=frame;window.__stepCol=col;__ticks.push({at:scheduled?.at??this.ac.currentTime,calledAt:this.ac.currentTime,wall:performance.now(),frame,col,expectedMs:scheduled?this.frameStepMs(frame):this.stepMs()});return original.call(this,col,...args);};}
   },mode);
   const start=performance.now();await page.locator('#tour-play button').click();await page.waitForFunction(()=>__app.state.playing);
   if(await page.locator('.listen-members').count())await page.locator('.listen-members').scrollIntoViewIfNeeded();
   else await page.locator('#tour-band').scrollIntoViewIfNeeded();
   if(warmModels)try{await page.waitForFunction(()=>document.querySelectorAll('.listen-member ts-avatar[data-rendered]').length===5,{},{timeout:30000});}catch(error){
    report.failedWarmup=await page.evaluate(()=>({mix:__app.state.mute,playing:__app.state.playing,avatars:[...document.querySelectorAll('.listen-member ts-avatar')].map(el=>({character:el.dataset.character,muted:el.dataset.muted,visible:el.inView,model:!!el.model,rendered:el.hasAttribute('data-rendered'),error:el.hasAttribute('data-error'),rect:el.getBoundingClientRect().toJSON()}))}));throw error;
   }
   await page.evaluate(warm=>{
    window.__startWall=performance.now();window.__renders.length=0;window.__modelsAtStart=document.querySelectorAll('.listen-member ts-avatar[data-rendered]').length;if(warm){window.__ticks.length=0;window.__starts.length=0;}
    window.__taskTimer=setTimeout(()=>{const from=performance.now();while(performance.now()-from<200){};window.__block={start:from,duration:performance.now()-from};},2000);
   },warmModels);
   await page.waitForFunction(()=>performance.now()-__startWall>=9000,{},{timeout:30000});
   const sample=await page.evaluate(()=>{__app.stop();clearTimeout(__taskTimer);return {ticks:__ticks,starts:__starts,block:__block,longTasks:__longTasks,renders:__renders,mix:__app.state.mute,modelsAtObservationStart:__modelsAtStart,models:document.querySelectorAll('ts-avatar[data-rendered]').length,analysisOpen:document.querySelector('.analysis-panel')?.open,analysisCellElements:document.querySelectorAll('.analysis-panel .heard>div').length,position:{frame:__app.state.frame,col:__app.state.col}};});
   sample.mode=mode;sample.observedMs=performance.now()-start;
   const intervals=sample.ticks.slice(1).map((tick,index)=>({actualMs:1000*(tick.at-sample.ticks[index].at),expectedMs:sample.ticks[index].expectedMs}));
   sample.summary={steps:sample.ticks.length,medianIntervalMs:median(intervals.map(item=>item.actualMs)),maxLateMs:Math.max(...intervals.map(item=>item.actualMs-item.expectedMs)),meanAbsoluteJitterMs:intervals.reduce((total,item)=>total+Math.abs(item.actualMs-item.expectedMs),0)/intervals.length,scheduledInPast:sample.starts.filter(event=>event.at<event.calledAt-.003).length};
   report.samples.push(sample);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(mode,JSON.stringify(sample.summary));await context.close();
  }
 }finally{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));await browser.close();server.close();}
 if(report.errors.length)process.exitCode=1;
}
function median(values){const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)];}
main().catch(error=>{console.error(error);process.exitCode=1;});
