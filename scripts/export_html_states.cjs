// Export resolved application markup for a local Nu HTML structural check.
// Script/template nodes are omitted from diagnostic copies only; product is untouched.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/html/states'),base='http://terrasonic.test/';
async function main(){
 for(const folder of ['with-styles','structure-only'])fs.mkdirSync(path.join(output,folder),{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'Resolved Light DOM copies; scripts and inert templates omitted from both sets. The separately named structure-only copies also omit CSS style nodes/attributes. Shadow DOM, CSS conformance and behavior require separate checks.',states:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:1342,height:605},reducedMotion:'reduce'});
  await context.route('**/*',route=>{const url=route.request().url();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);
  const save=async name=>{const snapshot=await page.evaluate(()=>{const clone=document.documentElement.cloneNode(true);clone.querySelectorAll('script,template').forEach(el=>el.remove());const unresolved=[...clone.querySelectorAll('*')].flatMap(el=>[...el.attributes].filter(attr=>attr.value.includes('{{')).map(attr=>({tag:el.localName,attribute:attr.name,value:attr.value})));const html='<!doctype html>\n'+clone.outerHTML;clone.querySelectorAll('style').forEach(el=>el.remove());clone.querySelectorAll('[style]').forEach(el=>el.removeAttribute('style'));return {html,structure:'<!doctype html>\n'+clone.outerHTML,unresolved};});assert.deepEqual(snapshot.unresolved,[],name+' unresolved live bindings');const file=name+'.html';fs.writeFileSync(path.join(output,'with-styles',file),snapshot.html);fs.writeFileSync(path.join(output,'structure-only',file),snapshot.structure);report.states.push({file,bytes:Buffer.byteLength(snapshot.html),structureBytes:Buffer.byteLength(snapshot.structure)});};
  await save('es-first-visit');await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.evaluate(()=>__app.setPreference('sfx',false));
  for(const lang of ['es','en']){
   await page.evaluate(lang=>__app.setLang(lang),lang);
   for(const [tab,count]of [['home',1],['juke',1],['band',1],['data',1],['how',3],['tech',5]]){
    await page.evaluate(tab=>__app.goTab(tab),tab);await page.waitForFunction(()=>!__app.state.trans);
    for(let sub=0;sub<count;sub++){await page.evaluate(sub=>__app.goSub(sub),sub);await save(`${lang}-${tab}-${sub}`);}
   }
   for(const catalog of [0,1])for(const engine of ['melody','raw']){
    await page.evaluate(()=>__app.goTab('juke'));await page.waitForFunction(()=>!__app.state.trans);await page.locator('#tour-sets button').nth(catalog).click();await page.locator('.discgrid .dcard').first().click();await page.waitForFunction(()=>__app.cur()&&!__app.state.trans);
    await page.evaluate(engine=>__app.setEngine(engine),engine);await save(`${lang}-player-${catalog}-${engine}`);
    await page.evaluate(()=>{__app.setState({events:[__app.eventFor({mama:true},'')]});document.querySelectorAll('.uni details').forEach(el=>el.open=true);});await save(`${lang}-player-${catalog}-${engine}-expanded`);
   }
   await page.evaluate(()=>{__app.goTab('data');__app.goSub(0);__app.loadImageSample();});await page.waitForFunction(()=>__app.state.custom&&__app.cur());await save(`${lang}-sample-image`);
   await page.locator('#tour-more button').click();await save(`${lang}-dialog`);await page.keyboard.press('Escape');
  }
  assert.deepEqual(report.errors,[]);await context.close();
 }finally{try{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));}finally{await browser.close();}}
 console.log('PASS exported HTML states',report.states.length);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
