// Initial player in the user's short desktop window, with readable fallbacks.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/player/compact'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'Initial short desktop CSS viewports, native fonts, enlarged text and WCAG text spacing; not native browser zoom',checks:[],interactions:[],errors:[]};
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.route('**/*',route=>{const url=route.request().url();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);await page.evaluate(()=>document.fonts.ready);
  for(const [width,height]of [[1342,605],[1366,600]])for(const setting of ['default','large','spacing']){
   await page.setViewportSize({width,height});await page.locator('#compact-text-fixture').evaluateAll(els=>els.forEach(el=>el.remove()));
   if(setting!=='default')await page.addStyleTag({content:setting==='large'?'.px.app{font-size:32px!important}':'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'}).then(handle=>handle.evaluate(el=>el.id='compact-text-fixture'));
   for(const language of ['es','en'])for(const set of [0,1])for(const engine of ['melody','raw']){
    await page.evaluate(language=>{__app.setLang(language);__app.goTab('juke');},language);await page.waitForFunction(()=>!__app.state.trans);
    await page.locator('#tour-sets button').nth(set).click();await page.locator('.discgrid .dcard').first().click();await page.waitForFunction(()=>__app.cur()&&!__app.state.trans);await page.evaluate(engine=>{__app.setEngine(engine);__app.setState({legendSelection:null});__app.setBandMute(__app.only('mama'));__app.resetScreenScroll();},engine);
    const geometry=await page.locator('.uni').evaluate(root=>{
     const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('.sr');
     const overflow=[...root.querySelectorAll('button,input,select,p,h1,h2,summary,strong')].filter(visible).filter(el=>{const r=el.getBoundingClientRect();return r.left < -1||r.right>innerWidth+1;}).map(el=>el.textContent.slice(0,60));
     const rect=selector=>{const r=root.querySelector(selector).getBoundingClientRect();return {top:r.top,bottom:r.bottom};};
     const buttons=[...root.querySelectorAll('.transport button,.player-sidebar>.controls button,.map-legend button')].filter(visible).map(el=>({label:el.textContent.trim(),height:el.getBoundingClientRect().height}));
     const transportOrder=[...root.querySelectorAll('.transport-tools button,.transport-tools input,.transport-tools select')].filter(visible).map(el=>{const r=el.getBoundingClientRect();return {label:el.textContent.trim()||el.id,top:r.top,left:r.left};});
     const mute=root.querySelector('.volume-control button'),range=document.createRange();range.selectNodeContents(mute);
     return {overflow,band:rect('.listen-band'),sidebar:rect('.player-sidebar'),buttons,transportOrder,muteLines:range.getClientRects().length,muteFits:mute.scrollWidth<=mute.clientWidth+1};
    });
    const label=`${width}-${height}-${setting}-${language}-${set}-${engine}`;report.checks.push({label,...geometry});
    assert.deepEqual(geometry.overflow,[],label+' horizontal overflow');assert(geometry.buttons.every(button=>button.height>=43.9),label+' targets below 44px');
    if(setting==='default'){
     assert(geometry.band.bottom<=height&&geometry.sidebar.bottom<=height,label+' initial core must fit the short desktop: '+JSON.stringify(geometry));
     assert(geometry.muteLines===1&&geometry.muteFits,label+' mute word must remain whole');
     for(let i=1;i<geometry.transportOrder.length;i++){const previous=geometry.transportOrder[i-1],current=geometry.transportOrder[i];assert(current.top>=previous.top-16,label+' keyboard order must follow visual rows');if(Math.abs(current.top-previous.top)<16)assert(current.left>=previous.left,label+' keyboard order must follow the row');}
     if(engine==='melody')await page.screenshot({path:path.join(output,label+'.png')});
     for(let choice=0;choice<4;choice++){
      await page.locator('.legend-choice').nth(choice).click();
      const layout=await page.locator('.map-legend').evaluate(root=>{const detail=root.querySelector('.legend-detail summary').getBoundingClientRect(),button=root.querySelector(':scope>button').getBoundingClientRect(),reading=root.querySelector('.legend-reading').getBoundingClientRect();return {detailTop:detail.top,buttonTop:button.top,buttonBottom:button.bottom,readingTop:reading.top,readingBottom:reading.bottom};});
      report.interactions.push({label,choice,...layout});
      assert(layout.buttonTop>=layout.detailTop-1,label+' selected legend must preserve visual/keyboard order');
      assert(layout.buttonBottom<=layout.readingTop+1||layout.buttonTop>=layout.readingBottom-1,label+' legend output must not overlap its button');
     }
     while(await page.locator('.listen-member[aria-pressed="true"]').count())await page.locator('.listen-member[aria-pressed="true"]').first().click();
     const notice=page.locator('.listen-band [role="status"]');assert(await notice.isVisible());assert((await notice.textContent()).trim());
     const last=page.locator('.listen-member').last();await last.focus();await last.scrollIntoViewIfNeeded();const box=await last.boundingBox();assert(box.y>=0&&box.y+box.height<=height+1,label+' all-muted state must keep the last musician reachable');report.interactions.push({label,allMutedNotice:true,lastMusicianReachable:true});
    }
   }
  }
  assert.deepEqual(report.errors,[]);await context.close();
 }finally{try{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));}finally{await browser.close();}}
 console.log('PASS compact player',report.checks.length,'initial layouts;',report.interactions.length,'interaction states');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
