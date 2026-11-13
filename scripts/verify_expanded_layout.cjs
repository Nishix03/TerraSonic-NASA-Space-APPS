// Disclosures and the explanatory dialog must remain usable after opening them.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/layout/expanded'),base='http://terrasonic.test/';
async function audit(page,label,root='.scr .in'){
 const result=await page.locator(root).evaluate(container=>{
  const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('.sr');
  const overflow=[...container.querySelectorAll('button,input,select,summary,p,h1,h2,h3,dd,dt,li,strong,span,a,img,canvas,figure,section,details')].filter(visible).filter(el=>{const r=el.getBoundingClientRect();return r.left < -2||r.right>innerWidth+2;}).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,70)})).slice(0,10);
  const clipped=[...container.querySelectorAll('button,summary,p,h1,h2,h3,dd,strong,span,a')].filter(visible).filter(el=>el.clientWidth>0&&el.scrollWidth>el.clientWidth+3&&['clip','hidden'].includes(getComputedStyle(el).overflowX)).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,70)}));
  return {overflow,clipped};
 });
 assert.deepEqual(result.overflow,[],label+' overflow');assert.deepEqual(result.clipped,[],label+' clipped text');return {label,...result};
}
async function openDetails(page){
 for(const detail of await page.locator('.scr .in details').all())if(await detail.isVisible()&&await detail.getAttribute('open')===null)await detail.locator(':scope > summary').click();
}
async function checkEnd(page){
 const control=page.locator('.scr .in button:visible,.scr .in a:visible,.scr .in summary:visible,.scr .in select:visible').last();
 await control.focus();await control.scrollIntoViewIfNeeded();
 const result=await control.evaluate(el=>{const r=el.getBoundingClientRect(),s=el.closest('.scr').getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {top:r.top,bottom:r.bottom,scrollerTop:s.top,scrollerBottom:s.bottom,hit:hit===el||el.contains(hit),text:el.textContent.slice(0,70)};});
 const viewport=page.viewportSize();assert(result.top>=Math.max(0,result.scrollerTop)-1&&result.bottom<=Math.min(viewport.height,result.scrollerBottom)+1&&result.hit,JSON.stringify(result));return result;
}
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'CSS viewports/text settings, native disclosures, synthetic 200-event history; no audio, physical device or native zoom claim',checks:[],errors:[]};
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=route.request().url();if(/^(blob:|data:)/.test(url))return route.continue();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);await page.evaluate(()=>document.fonts.ready);
  for(const [width,height]of [[320,256],[320,568],[390,844],[667,375],[1342,605],[1920,1080]])for(const setting of ['default','large','spacing']){
   await page.setViewportSize({width,height});await page.locator('#expanded-text-fixture').evaluateAll(els=>els.forEach(el=>el.remove()));
   if(setting!=='default')await page.addStyleTag({content:setting==='large'?'.px.app{font-size:32px!important}':'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'}).then(handle=>handle.evaluate(el=>el.id='expanded-text-fixture'));
   for(const language of ['es','en'])for(const engine of ['melody','raw']){
    await page.evaluate(language=>{__app.setLang(language);__app.goTab('juke');},language);
    await page.waitForFunction(()=>!__app.state.trans);await page.locator('#tour-sets button').nth(1).click();
    await page.locator('.discgrid .dcard').nth(3).click();await page.evaluate(()=>__app.gotoFrame(2));
    await page.waitForFunction(()=>__app.cur()&&!__app.state.trans);
    await page.evaluate(engine=>__app.setEngine(engine),engine);
    assert.equal(await page.locator('.chordsrow').count(),engine==='melody'?1:0);
    await page.evaluate(()=>{const events=Array.from({length:200},()=>__app.eventFor({silbo:true,inti:true,mama:true,yaku:true,illapa:true},''));__app.setState({events});});
    await openDetails(page);await page.waitForFunction(()=>document.querySelectorAll('.event-history li').length===200);
    await page.waitForFunction(()=>document.querySelectorAll('.analysis-panel .heard>div').length===448);
    assert(await page.locator('.analysis-panel .heard>div').evaluateAll(cells=>new Set(cells.map(el=>el.style.background)).size>4),'the open grid must contain the current map analysis');
    await page.locator('.analysis-panel summary').click();await page.waitForFunction(()=>document.querySelectorAll('.analysis-panel .heard>div').length===0);
    assert.equal(await page.locator('.analysis-panel').getAttribute('open'),null,'false must remove the native boolean open attribute');
    await page.locator('.analysis-panel summary').click();await page.waitForFunction(()=>document.querySelectorAll('.analysis-panel .heard>div').length===448);
    await page.evaluate(()=>__app.seekPosition(69));
    assert.equal(await page.locator('.analysis-panel .heard>div').evaluateAll(cells=>cells.filter(el=>el.style.opacity==='1').length),16,'the reopened grid keeps exactly the current scan column highlighted');
    await page.locator('.event-history summary').focus();await page.keyboard.press('Tab');
    assert(await page.locator('.event-history ol').evaluate(el=>el===document.activeElement),'the scrollable event list must be reachable by Tab');
    await page.keyboard.press('End');await page.waitForFunction(()=>{const el=document.querySelector('.event-history ol');return el.scrollHeight-el.scrollTop-el.clientHeight<=2;});
    const label=`${width}-${height}-${setting}-${language}-${engine}`,player=await audit(page,label+' player'),end=await checkEnd(page);
    if(setting==='default'&&language==='es'&&[390,1342].includes(width))await page.screenshot({path:path.join(output,label+'-player-end.png')});
    const snapshot=await page.evaluate(()=>JSON.stringify([__app.state.disc,__app.state.frame,__app.state.col,__app.state.events.length]));
    await page.locator('#tour-more button').click();await page.locator('#more-dialog').waitFor();const dialog=await audit(page,label+' dialog','#more-dialog');
    const size=await page.locator('#more-dialog').evaluate(el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el),col=el.querySelector('.col').getBoundingClientRect();return {width:r.width,left:r.left,right:r.right,top:r.top,bottom:r.bottom,bodyWidth:col.width,innerWidth:r.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-2,decisions:el.querySelectorAll('.why').length};});
    assert.equal(size.decisions,4);assert(size.bodyWidth>=size.innerWidth-2,'dialog body must use its available width');assert(size.left>=0&&size.right<=width+1&&size.top>=0&&size.bottom<=height+1,JSON.stringify(size));
    if(language==='es'&&[320,1342].includes(width))await page.screenshot({path:path.join(output,label+'-dialog.png')});
    await page.locator('#more-close').focus();await page.keyboard.press('End');
    await page.waitForFunction(()=>{const el=document.getElementById('more-dialog');return el.scrollHeight-el.scrollTop-el.clientHeight<=2;});
    const readingEnd=await page.locator('#more-dialog .why').last().evaluate(el=>{const r=el.getBoundingClientRect(),dialog=el.closest('[role="dialog"]').getBoundingClientRect();return {bottom:r.bottom,dialogBottom:dialog.bottom};});assert(readingEnd.bottom<=readingEnd.dialogBottom+1,'the explanation can be read to the end with the keyboard');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#more-dialog').count(),0);assert.equal(await page.evaluate(()=>JSON.stringify([__app.state.disc,__app.state.frame,__app.state.col,__app.state.events.length])),snapshot);assert.equal(await page.locator('#tour-more button').evaluate(el=>el===document.activeElement),true);
    await page.evaluate(()=>__app.goTab('data'));await page.waitForFunction(()=>!__app.state.trans);await openDetails(page);const convert=await audit(page,label+' convert'),convertEnd=await checkEnd(page);
    report.checks.push({width,height,setting,language,engine,player,end,dialog,size,readingEnd,convert,convertEnd});fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));
   }
  }
  assert.deepEqual(report.errors,[]);await context.close();console.log('PASS expanded layouts',report.checks.length,'viewport/settings/language combinations');
 }finally{try{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));}finally{await browser.close();}}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
