const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.TERRASONIC_PLAYWRIGHT||'playwright-core');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/a11y/keyboard'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={checks:[],focus:[],errors:[],fixture:'Native Chromium keyboard events and AX tree, test-only final audio silenced; no screen reader or human listening'};
 try{
  for(const width of [320,390,1366])for(const language of ['es','en']){
   const context=await browser.newContext({viewport:{width,height:width===320?256:width===390?844:768},reducedMotion:'reduce'});
   await context.route('**/*',async route=>{if(!route.request().url().startsWith(base))return route.abort();const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
   await context.addInitScript(language=>{
    localStorage.setItem('ts_lang',language);localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
    Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
    const Native=window.AudioContext;window.AudioContext=class extends Native{createDynamicsCompressor(){const compressor=super.createDynamicsCompressor(),connect=compressor.connect.bind(compressor);compressor.connect=(destination,...args)=>{if(destination===this.destination){const silent=this.createGain();silent.gain.value=0;connect(silent);silent.connect(destination);return destination;}return connect(destination,...args);};return compressor;}};
    window.__vibrations=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{__vibrations.push(pattern);return true;}});
   },language);
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);
   await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'skip-content');
   await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content');
   const nav=page.locator('#tour-nav button');await nav.first().focus();await page.keyboard.press('ArrowRight');
   assert.equal(await nav.nth(1).evaluate(el=>el===document.activeElement),true);
   assert.equal(await page.evaluate(()=>__app.state.tab),'home','arrows move focus without changing the page');
   await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>__app.state.tab),'band');
   await nav.first().focus();await page.keyboard.press('Enter');await page.locator('.dcard').nth(2).focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>__app.cur());assert.equal(await page.evaluate(()=>document.activeElement.id),'player-title');
   const range=page.locator('#playback-position');await range.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');
   assert.equal(await range.inputValue(),'1');assert.equal(await page.evaluate(()=>__app.state.playing),false);
   await page.locator('#tour-play button').focus();await page.keyboard.press('Space');await page.waitForFunction(()=>__app.state.playing&&__app.state.col>=2);
   await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__app.state.playing),false);
   const paused=await range.inputValue();await page.waitForTimeout(200);assert.equal(await range.inputValue(),paused);
   await page.getByRole('button',{name:/\+5 s/}).focus();await page.keyboard.press('Enter');assert(Number(await range.inputValue())>Number(paused));
   const volume=page.locator('#playback-volume');await volume.focus();await page.keyboard.press('Home');assert.equal(await page.evaluate(()=>__app.state.volume),0);
   await page.keyboard.press('End');assert.equal(await page.evaluate(()=>__app.state.volume),100);
   await page.locator('.listen-member').first().focus();const before=await page.evaluate(()=>__app.state.mute.silbo);await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__app.state.mute.silbo),!before);
   await page.locator('.timeline button').nth(3).focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>__app.state.frame),3);assert.equal(await page.evaluate(()=>__app.state.playing),false);
   await page.locator('#tour-a11y>summary').focus();await page.keyboard.press('Enter');assert(await page.locator('#tour-a11y').getAttribute('open')!==null);
   await page.screenshot({path:path.join(output,`${width}-${language}-preferences.png`)});
   await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'opt');
   await page.keyboard.press('Escape');assert.equal(await page.locator('#tour-a11y').getAttribute('open'),null);assert.equal(await page.locator('#tour-a11y>summary').evaluate(el=>el===document.activeElement),true);
   await page.locator('#tour-more button').focus();await page.keyboard.press('Enter');assert(await page.locator('#more-dialog').isVisible());
   await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#more-dialog').evaluate(el=>el.contains(document.activeElement)),true);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#tour-more button').evaluate(el=>el===document.activeElement),true);
   await page.locator('.scr').evaluate(el=>{el.scrollTop=0;window.scrollTo(0,0);});
   await page.screenshot({path:path.join(output,`${width}-${language}-player.png`)});
   await page.locator('.skip-content').focus();
   const trace=[];
   for(let step=0;step<75;step++){
    await page.keyboard.press('Tab');
    const item=await page.evaluate(()=>{
     const el=document.activeElement,r=el.getBoundingClientRect(),cs=getComputedStyle(el),x=Math.max(0,Math.min(innerWidth-1,r.x+r.width/2)),y=Math.max(0,Math.min(innerHeight-1,r.y+r.height/2)),hit=document.elementFromPoint(x,y);
     return {tag:el.tagName,id:el.id,text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,65),rect:{x:r.x,y:r.y,w:r.width,h:r.height},inViewport:r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight,obscured:el.tagName!=='BODY'&&hit&&!el.contains(hit)&&!hit.contains(el),outline:cs.outlineStyle,outlineWidth:cs.outlineWidth};
    });
    trace.push(item);
    if(item.tag!=='BODY'){
      assert(item.inViewport&&!item.obscured,`${width} ${language} focus obscured: ${JSON.stringify(item)}`);
      assert(item.outline!=='none'&&item.outlineWidth!=='0px',`${width} ${language} missing focus outline: ${item.text}`);
    }
   }
   report.focus.push({width,language,trace});
   const cdp=await context.newCDPSession(page),tree=await cdp.send('Accessibility.getFullAXTree');
   const names=tree.nodes.filter(node=>!node.ignored).map(node=>({role:node.role?.value,name:node.name?.value}));
   assert(names.some(node=>node.role==='slider'&&node.name));assert(names.some(node=>node.role==='main'));
   fs.writeFileSync(path.join(output,`${width}-${language}-ax.json`),JSON.stringify(names,null,2));
   report.checks.push({width,language,skipLink:true,navigationArrows:true,discEntryFocus:true,playPause:true,nativeSeek:true,volume:true,mute:true,date:true,popoverEscape:true,dialogTrap:true,tabTrace:75});
   console.log('PASS keyboard',width,language);await context.close();
  }
  assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
