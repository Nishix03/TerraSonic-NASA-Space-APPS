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
module.exports={launchBrowser,browserName};
