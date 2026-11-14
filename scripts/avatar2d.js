// The team's original 2D poses and four registered keyframes. No WebGL or mesh.
const keys = new Set(['silbo','inti','mama','yaku','illapa']);
const media = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => document.documentElement.dataset.tsMotionMode === 'full' ? false : document.documentElement.dataset.tsMotionMode === 'reduced' || media.matches || document.documentElement.dataset.tsReducedMotion === 'true';
const lang = () => document.documentElement.lang.startsWith('es') ? 'es' : 'en';
const t = (es,en) => lang()==='es' ? es : en;
const version = new URL(import.meta.url).search;
const asset = (key,file) => new URL(`../sprites/${key}/${file}${version}`,import.meta.url).href;
const sequences = {
  Play: [0,1,2,3,2,1,0],
  Dance: [0,1,2,3,2,1,2,0]
};
// Durations from each original banda/keyframes/animacion.json.
const timings = {
  silbo:[210,230,260,175,280,210,260], inti:[180,250,170,145,210,170,245],
  mama:[180,240,280,180,230,240,250], yaku:[135,175,175,155,180,170,210],
  illapa:[240,210,155,150,220,175,280]
};
const instances = new Set();
const decoded = new Map();
function imageReady(url) {
  if (!decoded.has(url)) {
    const image = new Image(); image.decoding='async'; image.src=url;
    const result=image.decode().then(()=>url).catch(error=>{decoded.delete(url);throw error;});
    decoded.set(url,result);
  }
  return decoded.get(url);
}
const intersection = new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  // A portrait and its controls form one stage. On a short phone viewport the
  // drawing can leave the viewport while its transport is still being used.
  for (const avatar of instances) if (avatar.visibilityTarget===target) {
    avatar.inView=isIntersecting;
    if (isIntersecting) avatar.sync(); else avatar.cancel(false);
  }
}),{rootMargin:'40px'});

class Sprite extends HTMLElement {
  static get observedAttributes(){return ['data-character','data-cue','data-active','data-muted','data-view'];}
  connectedCallback(){
    if (!this.image) {
      this.image=document.createElement('img');this.image.className='sprite-frame';this.image.alt='';
      this.image.decoding='async';this.image.draggable=false;this.image.setAttribute('aria-hidden','true');
      this.append(this.image);
    }
    this.visibilityTarget=this.closest('.bshow')||this;
    instances.add(this);intersection.observe(this.visibilityTarget);this.sync();
  }
  disconnectedCallback(){this.cancel(false);this.epoch=(this.epoch||0)+1;instances.delete(this);if(![...instances].some(a=>a.visibilityTarget===this.visibilityTarget))intersection.unobserve(this.visibilityTarget);}
  motionBlocked(){return reduced()&&!this.allowMotion;}
  attributeChangedCallback(name,old,value){if(old!==value&&this.isConnected&&this.image)this.sync(name==='data-character');}
  async sync(changed=false){
    const key=this.dataset.character;if(!keys.has(key))return;
    if(this.key!==key||changed){
      this.cancel(true);this.allowMotion=false;this.userPaused=false;this.resting=true;this.epoch=(this.epoch||0)+1;this.key=key;this.cue='';this.currentFrame=0;
      this.removeAttribute('data-rendered');this.removeAttribute('data-error');
      const url=asset(key,'pose-banda.webp');this.image.src=url;
      try{await imageReady(url);if(!this.isConnected||this.key!==key)return;this.setAttribute('data-rendered','');}
      catch{if(this.key===key)this.setAttribute('data-error','');}
      this.notify();
    }
    if(!this.inView||document.hidden||this.motionBlocked()||this.dataset.muted==='true'){this.cancel(false);return;}
    if(this.dataset.view==='portrait'){
      if(!this.userPaused&&!this.running&&!this.loading)this.start('Dance',false);
      return;
    }
    if(this.manual)return;
    if(this.dataset.active==='true'&&!this.timer)this.start('Play',false);
    else if(this.dataset.cue&&this.dataset.cue!==this.cue){this.cue=this.dataset.cue;this.start('Play',false);}
    else if(this.dataset.active==='false')this.cancel(false);
  }
  cancel(reset=false,freeze=false){
    this.epoch=(this.epoch||0)+1;clearTimeout(this.timer);this.timer=0;this.running=false;this.loading=false;
    if(this.motion){if(freeze){const held=this.motion.currentTime;this.motion.pause();if(held!==null)this.motion.currentTime=held;}else{this.motion.cancel();this.motion=null;}}
    if(this.image&&!freeze)this.image.style.transform='';
    if(reset){this.manual=null;this.index=0;this.mode='Play';}
    this.notify();
  }
  async start(mode='Play',manual=true){
    if(!sequences[mode]||this.motionBlocked()||!this.inView||document.hidden)return;
    this.cancel(false);this.userPaused=false;this.resting=false;this.mode=mode;this.manual=manual;this.index=0;this.running=true;this.loading=true;this.notify();
    const token=++this.epoch,key=this.key;
    // Decode all four originals before changing a frame: no blank flashes.
    try{await Promise.all([0,1,2,3].map(n=>imageReady(asset(key,`keyframes/0${n}.png`))));}
    catch{if(token===this.epoch){this.cancel(true);this.setAttribute('data-error','');}return;}
    if(!this.isConnected||token!==this.epoch||!this.inView||this.motionBlocked()||document.hidden)return;
    this.preparedKey=key;this.loading=false;this.cycles=this.dataset.view==='portrait'?Infinity:1;this.startDanceMotion();this.tick();
  }
  startDanceMotion(){
    if(this.mode!=='Dance')return;
    if(this.motion){this.motion.play();return;}
    try{if(typeof this.image.animate==='function')this.motion=this.image.animate([
      {transform:'translateY(0) rotate(-2deg)'},
      {transform:'translateY(-2%) rotate(2deg)',offset:.5},
      {transform:'translateY(0) rotate(-2deg)'}
    ],{duration:1280,iterations:Infinity,easing:'ease-in-out'});}catch{this.motion=null;}
  }
  tick(){
    if(!this.running||!this.isConnected||!this.inView||document.hidden||this.motionBlocked()){this.cancel(false);return;}
    this.paint();const delay=this.mode==='Play'?timings[this.key][this.index%7]:160;
    this.timer=setTimeout(()=>{
      this.index++;
      if(this.index>=sequences[this.mode].length){this.index=0;if(--this.cycles<=0){this.cancel(false);this.manual=null;this.paint();return;}}
      this.tick();
    },delay);
  }
  paint(){
    const sequence=sequences[this.mode||'Play'],index=this.index||0,n=sequence[index%sequence.length];
    this.resting=false;this.currentFrame=n;this.dataset.frame=String(n);this.dataset.step=String(index);this.dataset.motion=this.mode||'Play';
    this.image.src=asset(this.key,`keyframes/0${n}.png`);
    const phase=index/(sequence.length-1),sway=Math.sin(phase*Math.PI*2);
    // Smooth 2D dance over the original drawings, without inventing body parts.
    this.image.style.transform=!this.motion&&this.running&&this.mode==='Dance'?`translateY(${-Math.abs(sway)*2}%) rotate(${sway*3}deg)`:'';
    this.notify();
  }
  pause(){
    if(this.running){this.cancel(false,true);this.manual=true;this.userPaused=true;}
    else{this.allowMotion=true;this.userPaused=false;if(this.preparedKey!==this.key){this.start('Dance',true);return;}this.mode='Dance';this.manual=true;this.running=true;this.cycles=Infinity;this.startDanceMotion();this.tick();}
    this.notify();
  }
  notify(){this.dispatchEvent(new CustomEvent('sprite-state',{bubbles:true}));}
}
customElements.define('ts-avatar',Sprite);

class Controls extends HTMLElement {
  connectedCallback(){
    if(this.ready)return;this.ready=true;
    this.innerHTML='<div class="sprite-actions"><button type="button" class="btn sm" data-action="dance"></button></div><p class="sprite-readout" role="status"></p>';
    this.avatar=this.closest('.bshow').querySelector('.bportrait-live');
    this.querySelector('button').addEventListener('click',()=>this.avatar.pause());
    this.change=()=>this.update();this.avatar.addEventListener('sprite-state',this.change);this.update();
  }
  disconnectedCallback(){this.avatar?.removeEventListener('sprite-state',this.change);this.ready=false;}
  update(){
    if(!this.avatar)return;
    const a=this.avatar,button=this.querySelector('button'),label=a.running?t('Pausar baile','Pause dance'):t('Bailar','Dance');
    if(button.textContent!==label)button.textContent=label;
    const status=a.loading?t('Cargando el baile…','Loading the dance…'):a.running?t('Baile en reproducción','Dance is playing'):t('Baile en pausa','Dance is paused');
    if(this.querySelector('.sprite-readout').textContent!==status)this.querySelector('.sprite-readout').textContent=status;
  }
}
customElements.define('ts-sprite-controls',Controls);
function refresh(resetPermission=false){for(const a of instances){if(resetPermission)a.allowMotion=false;if(a.motionBlocked()||document.hidden){a.epoch++;a.cancel(true);}else a.sync();}for(const c of document.querySelectorAll('ts-sprite-controls'))c.update();}
media.addEventListener('change',()=>refresh(true));
new MutationObserver(records=>refresh(records.some(r=>r.attributeName==='data-ts-reduced-motion'||r.attributeName==='data-ts-motion-mode'))).observe(document.documentElement,{attributes:true,attributeFilter:['data-ts-reduced-motion','data-ts-motion-mode','lang']});
document.addEventListener('visibilitychange',()=>refresh());
window.addEventListener('pagehide',()=>{for(const a of instances){a.epoch++;a.cancel(true);}});
