// Retained DOM/JS measurements after repeated navigation, separate from timing QA.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser,browserName}=require('./browser_fixture.cjs');
assert.equal(browserName,'chromium','This diagnostic uses Chrome DevTools counters');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/memory'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'One isolated Chromium context, WebGL disabled, no sound, repeated local-file/screen navigation. Explicit garbage collection and discarding inspector console references are used only to compare retained objects, not as product behavior or a physical RAM guarantee.',samples:[],errors:[]};
 report.fileInputFixture=process.argv.includes('--file-api')?'Synthetic File/DataTransfer dispatched through the native input change handler; no OS file picker':'Playwright setInputFiles; inspector handles can retain old input nodes';
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=route.request().url();if(/^(blob:|data:)/.test(url))return route.continue();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{
   localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
   const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};
   window.__urls=new Map();const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=create(blob);__urls.set(url,true);return url;};URL.revokeObjectURL=url=>{__urls.set(url,false);return revoke(url);};
   Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);const session=await context.newCDPSession(page);await session.send('Performance.enable');
  const sample=async cycle=>{
   await page.evaluate(()=>__app.goTab('home'));await page.waitForFunction(()=>!__app.state.trans);await session.send('Runtime.discardConsoleEntries');await session.send('HeapProfiler.collectGarbage');
   const dom=await session.send('Memory.getDOMCounters'),metrics=await session.send('Performance.getMetrics'),selected=Object.fromEntries(metrics.metrics.filter(entry=>['JSHeapUsedSize','JSHeapTotalSize','Nodes','Documents','JSEventListeners'].includes(entry.name)).map(entry=>[entry.name,entry.value]));
   const retained={};
   if([1,5,25].includes(cycle))for(const name of ['FileReader','HTMLInputElement','HTMLImageElement','HTMLDetailsElement']){
    const prototype=await session.send('Runtime.evaluate',{expression:name+'.prototype',objectGroup:'memory-inspection'}),objects=await session.send('Runtime.queryObjects',{prototypeObjectId:prototype.result.objectId,objectGroup:'memory-inspection'});
    const result=await session.send('Runtime.callFunctionOn',{objectId:objects.objects.objectId,functionDeclaration:'function(){return {count:this.length,detached:this.filter(value=>value.nodeType===1&&!value.isConnected).map(value=>({name:value.tagName,id:value.id,cls:value.className,value:value.value,html:value.outerHTML?.slice(0,180)}))};}',returnByValue:true});retained[name]=result.result.value;await session.send('Runtime.releaseObjectGroup',{objectGroup:'memory-inspection'});
   }
   const app=await page.evaluate(()=>({activeUrls:[...__urls.values()].filter(Boolean).length,totalCreatedUrls:__urls.size,analysisEntries:Object.keys(__app.state.an).length,events:__app.state.events.length,detachedAvatarCount:document.querySelectorAll('ts-avatar').length}));
   report.samples.push({cycle,dom,metrics:selected,app,retained});fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log('MEMORY',cycle,JSON.stringify({dom,heap:Math.round(selected.JSHeapUsedSize/1048576*100)/100,activeUrls:app.activeUrls}));
  };
  for(let cycle=1;cycle<=25;cycle++){
   await page.evaluate(()=>__app.goTab('how',1));await page.waitForFunction(()=>!__app.state.trans);
   const filename='memory-'+cycle+'.webp';
   const buffer=fs.readFileSync(path.join(site,'fotogramas/ver2025_2.webp'));
   if(process.argv.includes('--file-api'))await page.evaluate(({filename,bytes})=>{
     const input=document.querySelector('#tour-drop input'),transfer=new DataTransfer();
     transfer.items.add(new File([new Uint8Array(bytes)],filename,{type:'image/webp'}));
     input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
   },{filename,bytes:[...buffer]});
   else await page.locator('#tour-drop input').setInputFiles({name:filename,mimeType:'image/webp',buffer});
   await page.waitForFunction(name=>__app.state.custom?.name===name&&__app.cur(),filename);
   await page.evaluate(()=>__app.setState({events:Array.from({length:200},()=>__app.eventFor({mama:true},''))}));
   if(await page.locator('.event-history').getAttribute('open')===null)await page.locator('.event-history summary').click();
   await page.waitForFunction(()=>document.querySelectorAll('.event-history li').length===200);
   await page.evaluate(()=>__app.goTab('band'));await page.waitForFunction(()=>!__app.state.trans);await page.locator('.bsel').nth(cycle%5).click();
   await sample(cycle);
  }
  assert.deepEqual(report.errors,[]);assert(report.samples.every(item=>item.app.activeUrls<=1),'only the accepted file URL remains live');
  const reference=report.samples[4],last=report.samples.at(-1);report.deltaAfterWarmup={cycles:last.cycle-reference.cycle,nodes:last.dom.nodes-reference.dom.nodes,listeners:last.dom.jsEventListeners-reference.dom.jsEventListeners,heapBytes:last.metrics.JSHeapUsedSize-reference.metrics.JSHeapUsedSize};
  if(process.argv.includes('--heap-snapshot')){
   const chunks=[];session.on('HeapProfiler.addHeapSnapshotChunk',event=>chunks.push(event.chunk));await session.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});
   fs.writeFileSync(path.join(output,'retained.heapsnapshot'),chunks.join(''));report.heapSnapshot='retained.heapsnapshot';
  }
  await page.evaluate(()=>__app.componentWillUnmount());report.activeUrlsAfterDispose=await page.evaluate(()=>[...__urls.values()].filter(Boolean).length);assert.equal(report.activeUrlsAfterDispose,0);await context.close();
 }finally{try{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));}finally{await browser.close();}}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
