const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.TERRASONIC_PLAYWRIGHT || 'playwright-core');
const site = path.resolve(process.argv[2] || '_site');
const output = path.resolve(process.argv[3] || '_work/characters/browser');
const base = 'http://terrasonic.test/';
const keys = ['silbo','inti','mama','yaku','illapa'];

async function main() {
  fs.mkdirSync(output,{recursive:true});
  const browser = await chromium.launch({executablePath:process.env.TERRASONIC_CHROMIUM,
    args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report = {checks:[],errors:[],viewports:[]};
  try {
    for(const width of [320,390,768,1366,1920]) {
      const context=await browser.newContext({viewport:{width,height:width<768?844:768},reducedMotion:'reduce'});
      await context.route('**/*',async route=>{
        if(!route.request().url().startsWith(base))return route.abort();
        const file=path.resolve(site,new URL(route.request().url()).pathname.slice(1)||'index.html');
        if(file.startsWith(site+path.sep)&&fs.existsSync(file))return route.fulfill({path:file});
        return route.fulfill({status:404});
      });
      await context.addInitScript(()=>{
        localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{}}));
        Object.defineProperty(window,'DCLogic',{configurable:true,set(value){
          Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;
          value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};
        }});
      });
      const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
      await page.goto(base);await page.waitForFunction(()=>window.__app);
      await page.evaluate(()=>{__app.state.sfx=false;});
      await page.locator('#tour-nav button').nth(1).click();
      for(const lang of ['es','en']) {
        await page.locator('#tour-lang button').nth(lang==='es'?0:1).click();
        for(const [index,key] of keys.entries()) {
          await page.locator('.bsel').nth(index).click();
          assert.equal(await page.locator('.bportrait-live').getAttribute('data-character'),key);
          const persona=await page.evaluate(()=>__app.renderVals().bandCur.persona);
          assert.match(await page.locator('.bsummary').textContent(),new RegExp(persona.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
          const data=await page.evaluate(()=>({cur:__app.renderVals().bandCur,playing:__app.state.playing}));
          assert(data.cur.story && data.cur.impactFact && data.cur.references.length);
          for(const detail of await page.locator('.bnotes details').all()) {
            await detail.locator('summary').click();
            const box=await detail.boundingBox();assert(box.width<=width);
            await page.keyboard.press('End');
          }
          const urls=await page.locator('.bsource a').evaluateAll(links=>links.map(link=>link.href));
          assert(urls.length>=3);assert(urls.every(url=>url.startsWith('https://')));
          assert.equal(await page.evaluate(()=>__app.state.playing),data.playing,'reading references must not start audio');
          const overflowing=await page.evaluate(()=>[...document.querySelectorAll('.bpage *')].filter(el=>{
            const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width && cs.display!=='none' && r.right>innerWidth+2;
          }).map(el=>el.className).slice(0,8));
          assert.deepEqual(overflowing,[],`${width} ${lang} ${key} horizontal overflow`);
          for(const detail of await page.locator('.bnotes details').all()) await detail.locator('summary').click();
          if((width===390||width===1366)&&lang==='es') {
            await page.locator('.bpage').evaluate(el=>{const scroller=el.closest('.scr');if(scroller)scroller.scrollTop=0;window.scrollTo(0,0);});
            await page.screenshot({path:path.join(output,`${width}-${key}.png`)});
          }
        }
      }
      report.viewports.push({width,characters:5,languages:2,horizontalOverflow:false});
      await context.close();
    }
    report.checks.push('Five complete profiles in Spanish and English at five viewport widths');
    report.checks.push('Native disclosure controls expose facts, source links, limitations and original inspiration');
    report.checks.push('Reading a story or source does not start or change audio');
    assert.deepEqual(report.errors,[]);report.checks.forEach(check=>console.log('PASS',check));
  } finally {fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
