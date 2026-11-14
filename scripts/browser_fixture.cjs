// Shared launcher for isolated QA contexts. It never uses a personal browser profile.
const playwright=require(process.env.TERRASONIC_PLAYWRIGHT||'playwright-core');
const browserName=process.env.TERRASONIC_BROWSER||'chromium';
if(!['chromium','firefox','webkit'].includes(browserName))throw Error('Unsupported TERRASONIC_BROWSER');
async function launchBrowser(options={}){
 const {executablePath:chromiumPath,args:chromiumArgs,...common}=options;
 const executablePath=browserName==='chromium'?chromiumPath:process.env['TERRASONIC_'+browserName.toUpperCase()];
 const browser=await playwright[browserName].launch({...common,headless:true,...(executablePath?{executablePath}:{}),...(browserName==='chromium'?{args:chromiumArgs}:{} )});
 console.log('BROWSER',browserName,browser.version());return browser;
}
async function dismissEntry(page,{staticMotion=false}={}){
 await page.waitForFunction(()=>!!document.querySelector('.px.app'));
 const skip=page.locator('.ts-cinema button');
 if(await skip.count())await skip.click();
 // Layout/a11y fixtures deliberately choose the reduced-motion UI after the
 // required intro. Entry and dance fixtures keep the actual animated default.
 if(staticMotion){
  const choice=page.locator('#preferences-reducedMotion');
  if(await choice.count())await choice.check();
  else{await page.locator('#tour-a11y>summary').click();const toggle=page.getByRole('button',{name:/^(Movimiento reducido|Reduced motion)$/});if(await toggle.getAttribute('aria-pressed')!=='true')await toggle.click();await page.keyboard.press('Escape');}
 }
}
module.exports={launchBrowser,browserName,dismissEntry};
