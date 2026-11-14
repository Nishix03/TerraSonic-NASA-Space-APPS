const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {launchBrowser,dismissEntry}=require('./browser_fixture.cjs');
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
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await dismissEntry(page);
   for(const lang of ['es','en']){
    await page.locator('#tour-lang button').nth(lang==='es'?0:1).click();
    await page.locator('#tour-nav button').nth(3).click();
    assert.equal(await page.locator('#tour-steps li').count(),8);
    for(const detail of await page.locator('.method-notes details').all())await detail.locator('summary').click();
    assert.match(await page.locator('.viewport').textContent(),/28.*16/s);
    assert.match(await page.locator('.viewport').textContent(),/NASA/);
    const sources=await page.locator('.method-sources a').evaluateAll(links=>links.map(link=>link.href));assert.equal(sources.length,5);
    assert(sources.some(url=>url.includes('the-earth-information-jukebox')));
    assert.equal(await page.locator('#tour-topics').count(),0,'How it works is one concise page');
    await checkOverflow(page,`${width} ${lang} method`);
    if(lang==='es'&&[390,1366].includes(width)){await resetScroll(page);await page.screenshot({path:path.join(output,`${width}-method.png`)});}
    await page.locator('#tour-nav button').nth(4).click();
    for(let sub=0;sub<5;sub++){
     await page.locator('.topics button').nth(sub).click();
     if(sub<4){
      const title=await page.locator('.pagehead h1').textContent();
      assert.equal(await page.locator('#tour-techfilter').count(),0,'Approved brief removes technology filters');
      assert.equal(await page.locator('.pagehead h1').textContent(),title);
      assert(!/Magenta|Lyria|ElevenLabs|Tonal\.js|Tone\.js|Planeado|Planned/.test(await page.locator('#tour-techcards').textContent()));
      await checkOverflow(page,`${width} ${lang} technology ${sub}`);
     }else assert.match(await page.locator('#credit-ai-title').locator('..').locator('..').textContent(),lang==='es'?/pendiente/:/pending/);
     if(lang==='es'&&[390,1366].includes(width)){await resetScroll(page);await page.screenshot({path:path.join(output,`${width}-technology-${sub}.png`)});}
    }
   }
   report.viewports.push({width,languages:2,methodScreens:1,technologyScreens:5,filters:0,horizontalOverflow:false});await context.close();
  }
  assert.deepEqual(report.errors,[]);report.checks.push('Method and Technology in both languages at five viewport widths');
  report.checks.push('Technology categories preserve sources and exclude unused planned services');
  report.checks.push('Scientific interpretation, sources and documented AI credit remain visible');
  report.checks.forEach(check=>console.log('PASS',check));
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
async function checkOverflow(page,label){const nodes=await page.evaluate(()=>[...document.querySelectorAll('.in *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(el).visibility!=='hidden';}).map(el=>el.tagName+'.'+el.className).slice(0,8));assert.deepEqual(nodes,[],label);}
async function resetScroll(page){await page.locator('.scr').evaluate(el=>{el.scrollTop=0;window.scrollTo(0,0);});}
main().catch(error=>{console.error(error);process.exitCode=1;});
