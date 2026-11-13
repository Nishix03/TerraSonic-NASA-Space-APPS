// Native JPEG EXIF orientation and WebP decoding, using only synthetic fixtures.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./browser_fixture.cjs');
const site=path.resolve(process.argv[2]||'_site'),output=path.resolve(process.argv[3]||'_work/convert/formats'),base='http://terrasonic.test/';
// Four quadrants generated once by Chromium Canvas, with no third-party imagery.
const webp=Buffer.from('UklGRmICAABXRUJQVlA4WAoAAAAgAAAAjwEAxwAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDhMcwAAAC+PwTEAHyAQSFxm2J8gQIFAEsv+KEMJBJKg9keaYf6jTh6AQbaRJjnJkxzF5yP6H9u2bdu2bdu2bdu2bdu2bdu2bZuqqqqqqqqqqqqqqqq+/9fq/QcAAAAAAAAAAAAAAICqqqqqqqqqqqqqqqp6/4/V+x8A','base64');
function exifJpeg(jpeg,orientation){
 const metadata=Buffer.alloc(32);metadata.write('Exif\0\0',0,'binary');metadata.write('II',6);metadata.writeUInt16LE(42,8);metadata.writeUInt32LE(8,10);metadata.writeUInt16LE(1,14);metadata.writeUInt16LE(0x112,16);metadata.writeUInt16LE(3,18);metadata.writeUInt32LE(1,20);metadata.writeUInt16LE(orientation,24);
 const marker=Buffer.from([255,225,0,metadata.length+2]);return Buffer.concat([jpeg.subarray(0,2),marker,metadata,jpeg.subarray(2)]);
}
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await launchBrowser({executablePath:process.env.TERRASONIC_CHROMIUM,args:['--no-sandbox']});
 const report={fixture:'Native Image/File/Canvas; eight synthetic EXIF orientations and a real WebP; no personal files, physical camera or device claims',checks:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=route.request().url();if(/^(blob:|data:)/.test(url))return route.continue();if(!url.startsWith(base))return route.abort();const file=path.resolve(site,new URL(url).pathname.slice(1)||'index.html');return file.startsWith(site+path.sep)&&fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404});});
  await context.addInitScript(()=>{localStorage.setItem('ts_lang','es');localStorage.setItem('ts_prefs',JSON.stringify({version:1,configured:true,values:{sfx:false}}));Object.defineProperty(window,'DCLogic',{configurable:true,set(value){Object.defineProperty(window,'DCLogic',{value,writable:true,configurable:true});const original=value.prototype.setState;value.prototype.setState=function(...args){window.__app=this;return original.apply(this,args);};}});});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.getByRole('button',{name:'¿Cómo funciona?',exact:true}).click();await page.getByRole('button',{name:'Prueba práctica',exact:true}).click();
  const jpeg=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=200;const x=c.getContext('2d');['#ee2222','#22ee22','#2222ee','#eeee22'].forEach((color,i)=>{x.fillStyle=color;x.fillRect((i%2)*200,Math.floor(i/2)*100,200,100);});return c.toDataURL('image/jpeg',1).split(',')[1];}),'base64');
  const orders=[[0,1,2,3],[1,0,3,2],[3,2,1,0],[2,3,0,1],[0,2,1,3],[2,0,3,1],[3,1,2,0],[1,3,0,2]],colors=[[238,34,34],[34,238,34],[34,34,238],[238,238,34]];
  const fixtures=orders.map((order,i)=>({name:`orientation-${i+1}.jpg`,mimeType:'image/jpeg',buffer:exifJpeg(jpeg,i+1),order,portrait:i>=4}));fixtures.push({name:'quadrants.webp',mimeType:'image/webp',buffer:webp,order:orders[0],portrait:false});
  for(const fixture of fixtures){
   await page.locator('#tour-drop input').setInputFiles({name:fixture.name,mimeType:fixture.mimeType,buffer:fixture.buffer});await page.waitForFunction(name=>__app.state.custom?.name===name&&__app.state.sub===1,fixture.name);
   const result=await page.evaluate(async portrait=>{
    const image=new Image();image.src=__app.state.custom.url;await image.decode();const c=document.createElement('canvas');c.width=560;c.height=320;const x=c.getContext('2d');x.drawImage(image,0,0);
    const width=portrait?160:560,height=portrait?320:280,left=(560-width)/2,top=(320-height)/2;
    const pixels=[0,1,2,3].map(i=>[...x.getImageData(Math.round(left+width*(i%2?.75:.25)),Math.round(top+height*(i>=2?.75:.25)),1,1).data]);
    const outside=[...x.getImageData(portrait?0:280,portrait?160:0,1,1).data];return {pixels,outside,width:image.naturalWidth,height:image.naturalHeight,ready:!!__app.cur()};
   },fixture.portrait);
   assert.equal(result.width,560);assert.equal(result.height,320);assert(result.ready);assert.equal(result.outside[3],0,'letterboxing preserves the oriented aspect ratio');
   result.pixels.forEach((pixel,index)=>{assert.equal(pixel[3],255);colors[fixture.order[index]].forEach((channel,k)=>assert(Math.abs(pixel[k]-channel)<=12,`${fixture.name} quadrant ${index}: ${pixel}`));});
   report.checks.push({name:fixture.name,orientedQuadrants:fixture.order,...result});
  }
  assert.deepEqual(report.errors,[]);await page.screenshot({path:path.join(output,'formats.png')});await context.close();console.log('PASS native image formats',report.checks.length);
 }finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
