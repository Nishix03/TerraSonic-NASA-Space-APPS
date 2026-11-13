// Effective CSS widths and user text settings; this does not claim native browser zoom.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/a11y/reflow'),base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});
 const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={fixture:'Emulated CSS viewports, text enlargement and WCAG text spacing; not a physical device or native zoom',checks:[],failures:[],errors:[]};
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.route('**/*',async route=>{if(!route.request().url().startsWith(base))return route.abort();const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{
   localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
   Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);
  const scenarios=[[320,256],[320,568],[390,844],[667,375],[768,1024],[1024,768],[1366,768],[1920,1080],[2732,1536]];
  const settings=['default','spacing','large-text'];
  for(const [width,height]of scenarios){
   await page.setViewportSize({width,height});
   for(const setting of settings){
    if(setting!=='default'&&![320,390,1366].includes(width))continue;
    await page.locator('#user-text-fixture').evaluateAll(elements=>elements.forEach(el=>el.remove()));
    if(setting==='spacing')await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'}).then(el=>el.evaluate(node=>node.id='user-text-fixture'));
    if(setting==='large-text')await page.addStyleTag({content:'.px.app{font-size:32px!important}'}).then(el=>el.evaluate(node=>node.id='user-text-fixture'));
    for(const language of ['es','en']){
     await page.evaluate(language=>__app.setLang(language),language);
     for(const [tab,count]of [['home',1],['juke',3],['band',1],['data',3],['how',3],['tech',5]]){
      await page.evaluate(tab=>__app.goTab(tab),tab);
      if(tab==='data'){await page.evaluate(()=>{__app.goSub(0);__app.loadImageSample();});await page.waitForFunction(()=>__app.state.custom&&__app.cur());}
      for(let sub=0;sub<count;sub++){
       await page.evaluate(sub=>{__app.goSub(sub);const scroller=document.querySelector('.scr');scroller.scrollTop=0;window.scrollTo(0,0);},sub);
       const result=await page.evaluate(()=>{
        const visible=el=>!el.closest('.sr')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
        const overflow=[...document.querySelectorAll('.top button,.top summary,.in button,.in input,.in select,.in p,.in h1,.in h2,.in h3,.in summary,.in dd,.bottomnav button')].filter(visible).map(el=>({el,r:el.getBoundingClientRect()})).filter(({el,r})=>r.right>innerWidth+2||r.left < -2).map(({el,r})=>({tag:el.tagName,cls:el.className,text:el.textContent.trim().slice(0,90),left:r.left,right:r.right}));
        const clipped=[...document.querySelectorAll('.top button,.in button,.in p,.in h1,.in h2,.in h3,.in dd,.in summary')].filter(visible).filter(el=>!el.closest('.home-process,.tagbox')&&el.clientWidth>0&&el.scrollWidth>el.clientWidth+3&&['hidden','clip'].includes(getComputedStyle(el).overflowX)).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.trim().slice(0,80)}));
        return {overflow,clipped,documentWidth:document.documentElement.scrollWidth,viewport:innerWidth};
       });
       const entry={width,height,setting,language,tab,sub,...result};report.checks.push(entry);
       if(result.overflow.length||result.clipped.length){report.failures.push(entry);await page.screenshot({path:path.join(output,`failure-${report.failures.length}.png`)});}
      }
     }
    }
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log('CHECK',width,height,setting,'failures',report.failures.length);
   }
  }
  await context.close();
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('TOTAL',report.checks.length,'screens;',report.failures.length,'reflow failures');if(report.failures.length||report.errors.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
