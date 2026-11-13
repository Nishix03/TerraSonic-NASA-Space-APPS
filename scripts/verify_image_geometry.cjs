// Uploaded images must keep their proportions and match the fixed 28×16 analysis.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/convert/geometry'),base='http://terrasonic.test/';
// Tiny test-only GIF89a: two solid frames, with an LZW clear code before each pixel.
function animatedGif(){
 const header=Buffer.from('GIF89a\x10\x00\x10\x00\x80\x00\x00','binary'),palette=Buffer.from([240,30,20,20,30,240]);
 const loop=Buffer.from('\x21\xff\x0bNETSCAPE2.0\x03\x01\x00\x00\x00','binary'),frames=[];
 for(const index of [0,1]){
  const codes=Array.from({length:256},()=>[4,index]).flat().concat(5),bytes=[];let bits=0,accumulator=0;
  for(const code of codes){accumulator|=code<<bits;bits+=3;while(bits>=8){bytes.push(accumulator&255);accumulator>>=8;bits-=8;}}
  if(bits)bytes.push(accumulator&255);
  frames.push(Buffer.from('\x21\xf9\x04\x04\x0f\x00\x00\x00\x2c\x00\x00\x00\x00\x10\x00\x10\x00\x00\x02','binary'),Buffer.from([bytes.length]),Buffer.from(bytes),Buffer.from([0]));
 }
 return Buffer.concat([header,palette,loop,...frames,Buffer.from([0x3b])]);
}
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'Native image/File/Canvas decoding with synthetic local fixtures; no personal files or external upload',checks:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=route.request().url();if(/^(blob:|data:)/.test(url))return route.continue();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{
   localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));
   window.__imageUrls=new Map();const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
   URL.createObjectURL=blob=>{const url=create(blob);__imageUrls.set(url,{type:blob.type,revoked:false});return url;};URL.revokeObjectURL=url=>{if(__imageUrls.has(url))__imageUrls.get(url).revoked=true;return revoke(url);};
   Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.__app);await page.locator('#tour-nav button').nth(2).click();
  const fixtures=[];
  for(const [name,width,height]of [['wide',800,200],['tall',200,800],['square',200,200],['transparent',200,200]]){
   const encoded=await page.evaluate(({name,width,height})=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(name==='transparent'){ctx.fillStyle='#f22';ctx.fillRect(width/4,height/4,width/2,height/2);}else{ctx.fillStyle='#f22';ctx.fillRect(0,0,width/2,height);ctx.fillStyle='#22f';ctx.fillRect(width/2,0,width/2,height);}return canvas.toDataURL('image/png').split(',')[1];},{name,width,height});
   fixtures.push({name:name+'.png',mimeType:'image/png',buffer:Buffer.from(encoded,'base64'),shape:name});
  }
  fixtures.push({name:'animated.gif',mimeType:'image/gif',buffer:animatedGif(),shape:'animated'});
  for(const fixture of fixtures){
   await page.locator('#tour-drop input').setInputFiles({name:fixture.name,mimeType:fixture.mimeType,buffer:fixture.buffer});
   await page.waitForFunction(name=>__app.state.custom?.name===name&&__app.state.sub===1,fixture.name).catch(async error=>{report.failure={fixture:fixture.name,state:await page.evaluate(()=>({custom:__app.state.custom,message:__app.renderVals().upMsg,sub:__app.state.sub,pending:__app.pendingImageUrl,urls:[...__imageUrls.values()]}))};await page.screenshot({path:path.join(output,'failure.png')});throw error;});
   const result=await page.evaluate(async()=>{
    const custom=__app.state.custom,img=new Image();img.src=custom.url;await img.decode();const blob=await (await fetch(custom.url)).blob(),cells=__app.cur().cells;
    return {name:custom.name,type:blob.type,width:img.naturalWidth,height:img.naturalHeight,top:cells.slice(0,28),left:cells.filter((_,i)=>i%28===0),nonempty:cells.filter(value=>value!==null).length,activeUrls:[...__imageUrls.values()].filter(item=>!item.revoked).length,pending:__app.pendingImageUrl};
   });
   report.checks.push(result);await page.screenshot({path:path.join(output,fixture.shape+'.png')});
   assert.equal(result.width,560,'a static preview and grid use the same normalized frame');assert.equal(result.height,320);assert.equal(result.type,'image/png');assert.equal(result.activeUrls,1);assert(!result.pending);
   assert(result.nonempty>0&&result.nonempty<448,'transparent padding stays absent rather than becoming neutral data');
   if(fixture.shape==='wide')assert(result.top.every(value=>value===null));
   else assert(result.left.every(value=>value===null));
   const url=await page.evaluate(()=>__app.state.custom.url);await page.evaluate(()=>__app.setMode('palette'));await page.waitForFunction(()=>__app.cur()&&__app.state.customMode==='palette');assert.equal(await page.evaluate(()=>__app.state.custom.url),url,'changing interpretation preserves the frozen image');
   await page.locator('.headtools button').click();
  }
  assert.deepEqual(report.errors,[]);console.log('PASS image geometry',report.checks.length,'local fixtures');
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
