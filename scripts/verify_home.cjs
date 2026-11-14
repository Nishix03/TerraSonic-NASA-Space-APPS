// The original compact desktop and common mobile viewports must show the full home.
// Enlarged text and very short viewports are checked by verify_reflow.cjs instead.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/home/browser'),base='http://terrasonic.test/',missingFonts=process.argv.includes('--no-fonts');
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'Browser CSS viewports, local fonts '+(missingFonts?'blocked to exercise system fallbacks':'enabled')+'; not native zoom',checks:[],failures:[],errors:[]};
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.route('**/*',async route=>{if(!route.request().url().startsWith(base)||missingFonts&&route.request().url().endsWith('.woff2'))return route.abort();const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.locator('.cinema-skip').click();await page.waitForFunction(()=>window.__app);await page.evaluate(()=>document.fonts.ready);
  for(const [width,height]of [[1342,605],[1366,768],[1920,1080],[390,844],[375,667],[320,568],[667,375]]){
   await page.setViewportSize({width,height});
   for(const language of ['es','en']){
    await page.evaluate(language=>{__app.setLang(language);window.scrollTo(0,0);document.querySelector('.scr').scrollTop=0;},language);
    const result=await page.evaluate(()=>{
     const elements=[...document.querySelectorAll('.hero h1,.hero .lede,.hero .cta button,.hero .facts,.home-process')];
     const brokenNavigation=[...document.querySelectorAll('.nav-short')].filter(el=>el.getClientRects().length).filter(el=>{const range=document.createRange();range.selectNodeContents(el);return range.getClientRects().length>1;}).map(el=>el.textContent);
     return {elements:elements.map(el=>{const r=el.getBoundingClientRect();return {name:el.className||el.tagName,left:r.left,right:r.right,top:r.top,bottom:r.bottom};}),brokenNavigation,documentWidth:document.documentElement.scrollWidth,scroller:{height:document.querySelector('.scr').clientHeight,content:document.querySelector('.scr').scrollHeight}};
    });
    const check={width,height,language,...result};report.checks.push(check);
    if(result.brokenNavigation.length||result.elements.some(r=>r.left<0||r.right>width+1||r.top<0||r.bottom>height+1)||result.documentWidth>width)report.failures.push(check);
    await page.screenshot({path:path.join(output,`${width}-${height}-${language}.png`)});
   }
  }
  assert.deepEqual(report.errors,[]);assert.equal(report.failures.length,0,JSON.stringify(report.failures));
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('PASS full home',report.checks.length,'viewports/languages');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
