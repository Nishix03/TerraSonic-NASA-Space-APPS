// A returning visitor with an old cached binding runtime must receive the new one.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{createHash}=require('node:crypto');
const {launchBrowser}=require('./browser_fixture.cjs');
const previous=path.resolve(process.argv[2]),next=path.resolve(process.argv[3]),output=path.resolve(process.argv[4]||'_work/cache-release');
assert(fs.existsSync(path.join(previous,'index.html'))&&fs.existsSync(path.join(next,'index.html')),'Pass the old and new generated site directories');
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function main(){
 fs.mkdirSync(output,{recursive:true});let current=previous;const requests=[];
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.glb':'model/gltf-binary'};
 const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://local'),file=path.resolve(current,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
  if(!file.startsWith(current+path.sep)||!fs.existsSync(file))return response.writeHead(404).end();requests.push({release:current===previous?'previous':'next',url:url.pathname+url.search});
  response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':fs.statSync(file).size,'Cache-Control':path.extname(file)==='.html'?'no-store':'public,max-age=3600'});fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'Real HTTP cache in one isolated browser context; HTML no-store, assets max-age=3600; simulates a release without changing production headers',oldIndexSha256:digest(path.join(previous,'index.html')),newIndexSha256:digest(path.join(next,'index.html')),requests,errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  for(const suffix of ['old','old-again']){await page.goto(base+'?release='+suffix);await page.waitForFunction(()=>window.__app);await page.evaluate(()=>document.fonts.ready);}
  const oldScript=await page.locator('script[src*="support.js"]').getAttribute('src'),oldUrl=new URL(oldScript,base),oldSupportPath=oldUrl.pathname+oldUrl.search;
  report.oldSupportUrl=oldSupportPath;report.oldSupportRequests=requests.filter(item=>item.url===oldSupportPath).length;assert.equal(report.oldSupportRequests,1,'precondition: the old script must really be reused from HTTP cache');
  current=next;await page.goto(base+'?release=new');await page.waitForFunction(()=>window.__app);
  const script=await page.locator('script[src*="support.js"]').getAttribute('src'),version=new URL(script,base).searchParams.get('v');assert.equal(version,digest(path.join(next,'support.js')).slice(0,12));
  assert.notEqual(oldSupportPath,new URL(script,base).pathname+new URL(script,base).search,'the new release must use a different runtime URL');
  await page.locator('#tour-nav button').first().click();await page.locator('.discgrid .dcard').first().click();await page.locator('#tour-play button').waitFor();await page.waitForFunction(()=>__app.state.sub===1&&!__app.state.trans&&__app.cur());
  assert.equal(await page.locator('.analysis-panel').getAttribute('open'),null);assert.equal(await page.locator('.analysis-panel .heard>div').count(),0);
  await page.locator('.analysis-panel summary').click();await page.waitForFunction(()=>document.querySelectorAll('.analysis-panel .heard>div').length===448);
  await page.goto(base+'?release=new-again');await page.waitForFunction(()=>window.__app);
  report.newSupportRequests=requests.filter(item=>item.url==='/support.js?v='+version).length;assert.equal(report.newSupportRequests,1,'the versioned runtime is reusable after its first request');
  report.supportVersion=version;report.navigationCount=4;report.closedCells=0;report.openCells=448;assert.deepEqual(report.errors,[]);await context.close();console.log('PASS cached release: old runtime reused once, new runtime fetched once and reused; native disclosures work');
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
