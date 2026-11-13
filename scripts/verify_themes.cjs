// Real theme control, persistent choice and rendered contrast in isolated browsers.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/themes/browser'),base='http://terrasonic.test/';
const axePath=process.env.TERRASONIC_AXE||path.resolve('_work/axe/package/axe.min.js');
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'CSS viewports and native theme/menu keyboard controls; no WebGL or audio. Axe checks are not accessibility certification.',checks:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:1342,height:605},locale:'es-PE',reducedMotion:'reduce'});
  await context.route('**/*',route=>{const url=route.request().url();if(/^(blob:|data:)/.test(url))return route.continue();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#tour-a11y>summary').click();const control=page.getByRole('button',{name:'Modo claro',exact:true});await control.focus();await page.keyboard.press('Space');assert.equal(await page.locator('.px.app').getAttribute('data-theme'),'light');assert.equal(await control.getAttribute('aria-pressed'),'true');await page.keyboard.press('Escape');
  await page.reload();await page.waitForFunction(()=>window.__app);assert.equal(await page.locator('.px.app').getAttribute('data-theme'),'light');assert.equal(await page.evaluate(()=>localStorage.getItem('ts_theme')),'light');await page.addScriptTag({path:axePath});
  for(const [width,height]of [[390,844],[1342,605]])for(const lang of ['es','en'])for(const mode of ['light','dark'])for(const contrast of [false,true]){
   // Bound the lifetime of each rendered document during the long matrix.
   await page.reload();await page.waitForFunction(()=>window.__app);await page.addScriptTag({path:axePath});
   await page.setViewportSize({width,height});await page.evaluate(({lang,mode,contrast})=>{__app.setLang(lang);__app.setColorScheme(mode);__app.setPreference('contrast',contrast);},{lang,mode,contrast});
   for(const [tab,count]of [['home',1],['juke',1],['band',5],['how',2],['tech',5]]){
    await page.evaluate(tab=>__app.goTab(tab),tab);await page.waitForFunction(()=>!__app.state.trans);
    if(tab==='juke'){await page.locator('.discgrid .dcard').first().click();await page.waitForFunction(()=>__app.cur()&&!__app.state.trans);}
    for(let sub=0;sub<count;sub++){
    if(tab==='band')await page.locator('.bpick button').nth(sub).click();else if(count>1)await page.evaluate(sub=>__app.goSub(sub),sub);
    const label=`${width}-${lang}-${mode}-${contrast?'contrast':'normal'}-${tab}-${sub}`;
    const layout=await page.evaluate(()=>{const root=document.querySelector('.px.app');return {theme:root.dataset.theme,bg:getComputedStyle(root).backgroundColor,fg:getComputedStyle(root).color,width:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.scr button,.scr p,.scr h1,.scr select')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('.sr')).filter(el=>{const r=el.getBoundingClientRect();return r.left < -1||r.right>innerWidth+1;}).map(el=>el.textContent.trim().slice(0,65))};});
    assert.equal(layout.theme,mode);assert.deepEqual(layout.overflow,[],label+' overflow');assert(layout.width<=width+1,label+' page overflow');
    const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}}));
    const violations=audit.violations.map(rule=>({id:rule.id,help:rule.help,nodes:rule.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}));report.checks.push({label,...layout,violations,incomplete:audit.incomplete.map(rule=>({id:rule.id,nodes:rule.nodes.length}))});
    if(lang==='es'&&!contrast)await page.screenshot({path:path.join(output,label+'.png')});
    fs.writeFileSync(path.join(output,label+'.json'),JSON.stringify(report.checks.at(-1),null,2));
    }
   }
  }
  assert.deepEqual(report.errors,[]);const bad=report.checks.filter(check=>check.violations.length);assert.deepEqual(bad,[],JSON.stringify(bad));await context.close();
 }finally{try{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));}finally{await browser.close();}}
 console.log('PASS themes',report.checks.length,'rendered states');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
