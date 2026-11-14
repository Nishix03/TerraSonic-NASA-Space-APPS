const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/method/browser');
const base='http://terrasonic.test/';
async function main(){
 fs.mkdirSync(output,{recursive:true});
 const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={checks:[],errors:[],viewports:[]};
 try{
  for(const width of [320,390,768,1366,1920]){
   const context=await browser.newContext({viewport:{width,height:width<768?844:768},reducedMotion:'reduce'});
   await context.route('**/*',async route=>{
    if(/^(blob:|data:)/.test(route.request().url()))return route.continue();if(!route.request().url().startsWith(base))return route.abort();
    const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');
    return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});
   });
   await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));});
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);
   for(const lang of ['es','en']){
    await page.locator('#tour-lang button').nth(lang==='es'?0:1).click();
    const nav = page.locator('#tour-nav button');
    await nav.nth(2).click();
    assert.equal(await page.locator('#tour-drop input').count(),1);
    assert.equal(await page.locator('.topics button').count(),2);
    for(let sub=0;sub<2;sub++){
     await page.locator('.topics button').nth(sub).click();
     if(sub===1){
      assert.equal(await page.locator('#tour-steps li').count(),8);
      assert.equal(await page.locator('.method-notes a:visible').count(),5);
      assert.equal(await page.locator('.team-names li').count(),6);
     }
     await checkOverflow(page,`${width} ${lang} how it works ${sub}`);
     if(lang==='es'&&[390,1366].includes(width)){await resetScroll(page);await page.screenshot({path:path.join(output,`${width}-how-${sub}.png`)});}
    }
    await nav.nth(3).click();
    for(let sub=0;sub<5;sub++){
     await page.locator('.topics button').nth(sub).click();
     if(sub<4){
      assert(await page.locator('#tour-techcards article').count()>0);
      assert.equal(await page.locator('#tour-techfilter,.techchip').count(),0);
      assert.doesNotMatch(await page.locator('#tour-techcards').textContent(),/Three\.js|GLTFLoader|Blender|Planeado|Planned/);
      await checkOverflow(page,`${width} ${lang} technology ${sub}`);
     }else assert.match(await page.locator('#credit-ai-title').locator('..').locator('..').textContent(),lang==='es'?/pendiente/:/awaiting review/);
     if(lang==='es'&&[390,1366].includes(width)){await resetScroll(page);await page.screenshot({path:path.join(output,`${width}-technology-${sub}.png`)});}
    }
   }
   report.viewports.push({width,languages:2,howScreens:2,technologyScreens:5,horizontalOverflow:false});await context.close();
  }
  assert.deepEqual(report.errors,[]);report.checks.push('How it works and Technology in both languages at five viewport widths');
  report.checks.push('Technology categories show the relevant tools without filters or status badges');
  report.checks.push('Technology keeps documented AI credits');
  report.checks.forEach(check=>console.log('PASS',check));
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
async function checkOverflow(page,label){const nodes=await page.evaluate(()=>[...document.querySelectorAll('.in *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(el).visibility!=='hidden';}).map(el=>el.tagName+'.'+el.className).slice(0,8));assert.deepEqual(nodes,[],label);}
async function resetScroll(page){await page.locator('.scr').evaluate(el=>{el.scrollTop=0;window.scrollTo(0,0);});}
main().catch(error=>{console.error(error);process.exitCode=1;});
