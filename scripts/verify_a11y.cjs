// Automated WCAG checks complement keyboard/zoom/AT review; they are not certification.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/a11y/browser');
const axePath=process.env.TERRASONIC_AXE||path.resolve('_work/axe/package/axe.min.js');
const base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});assert(fs.existsSync(axePath),'Set TERRASONIC_AXE to axe-core 4.14.0');
 const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={engine:'axe-core',version:'',checks:[],errors:[]};
 try{
  for(const width of [390,1366]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:768},reducedMotion:'reduce'});
   await context.route('**/*',async route=>{
    if(!route.request().url().startsWith(base))return route.abort();
    const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');
    return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});
   });
   await context.addInitScript(()=>{
    localStorage.setItem('ts_lang','es');
    Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
   });
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.addScriptTag({path:axePath});
   report.version=await page.evaluate(()=>axe.version);
   const audit=async label=>{
    const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}));
    const entry={width,label,violations:result.violations.map(rule=>({id:rule.id,impact:rule.impact,help:rule.help,url:rule.helpUrl,nodes:rule.nodes.map(node=>({target:node.target,html:node.html,summary:node.failureSummary}))})),incomplete:result.incomplete.map(rule=>({id:rule.id,nodes:rule.nodes.length})),passes:result.passes.length};
    report.checks.push(entry);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log(label,width,'violations',entry.violations.length);
   };
   await audit('first-visit-preferences');await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.evaluate(()=>__app.setPreference('sfx',false));
   for(const lang of ['es','en']){
    await page.locator('#tour-lang button').nth(lang==='es'?0:1).click();
    await page.locator('.brand').click();await audit(lang+'-home');
    for(const [nav,tab,count] of [[0,'juke',3],[1,'band',1],[2,'data',3],[3,'how',3],[4,'tech',5]]){
     await page.locator('#tour-nav button').nth(nav).click();
     if(tab==='data'){await page.evaluate(()=>__app.goSub(0));await page.getByRole('button',{name:lang==='es'?'Usar imagen de ejemplo':'Use sample image',exact:true}).click();}
     if(tab==='juke')await page.locator('.discgrid .dcard').nth(2).click();
     for(let sub=0;sub<count;sub++){
      if(tab==='juke'||tab==='data')await page.evaluate(sub=>__app.goSub(sub),sub);
      else if(tab==='how'||tab==='tech')await page.locator('.topics button').nth(sub).click();
      await audit(lang+'-'+tab+'-'+sub);
     }
    }
    await page.locator('#tour-nav button').first().click();await page.locator('.discgrid .dcard').nth(2).click();
    const legend=page.locator('.legend-detail summary');if(await legend.count())await legend.click();
    await audit(lang+'-player-legend-expanded');
    await page.evaluate(()=>__app.openMore());await audit(lang+'-music-dialog');await page.keyboard.press('Escape');
    await page.locator('#tour-guide').click();await audit(lang+'-Brisa');await page.keyboard.press('Escape');
    await page.locator('#tour-a11y > summary').click();await audit(lang+'-accessibility-menu');await page.keyboard.press('Escape');
    assert.equal(await page.locator('#tour-a11y').getAttribute('open'),null,'Escape closes the preference popover');
    await page.evaluate(()=>{__app.setPreference('contrast',true);__app.setPreference('big',true);});
    await audit(lang+'-player-high-contrast-large-text');
    await page.evaluate(()=>{__app.setPreference('contrast',false);__app.setPreference('big',false);});
   }
   await context.close();
  }
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 const violations=report.checks.reduce((total,check)=>total+check.violations.length,0);console.log('TOTAL',report.checks.length,'screens;',violations,'rule failures');
 if(report.errors.length||violations)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
