// The team's original 2D poses and four registered keyframes. No WebGL or mesh.
const keys = new Set(['silbo','inti','mama','yaku','illapa']);
const media = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => media.matches || document.documentElement.dataset.tsReducedMotion === 'true';
const lang = () => document.documentElement.lang.startsWith('es') ? 'es' : 'en';
const t = (es,en) => lang()==='es' ? es : en;
const version = new URL(import.meta.url).search;
const asset = (key,file) => new URL(`../sprites/${key}/${file}${version}`,import.meta.url).href;
const sequences = {
  Play: [0,1,2,3,2,1,0],
  Walk: [0,1,2,1,0,1,2,0],
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
  target.inView=isIntersecting;
  if (isIntersecting) target.sync(); else target.cancel(false);
}),{rootMargin:'40px'});

class Sprite extends HTMLElement {
  static get observedAttributes(){return ['data-character','data-cue','data-active','data-muted','data-view'];}
  connectedCallback(){
    if (!this.image) {
      this.image=document.createElement('img');this.image.className='sprite-frame';this.image.alt='';
      this.image.decoding='async';this.image.draggable=false;this.image.setAttribute('aria-hidden','true');
      this.append(this.image);
    }
    instances.add(this);intersection.observe(this);this.sync();
  }
  disconnectedCallback(){this.cancel(false);this.epoch=(this.epoch||0)+1;instances.delete(this);intersection.unobserve(this);}
  attributeChangedCallback(name,old,value){if(old!==value&&this.isConnected&&this.image)this.sync(name==='data-character');}
  async sync(changed=false){
    const key=this.dataset.character;if(!keys.has(key))return;
    if(this.key!==key||changed){
      this.cancel(true);this.epoch=(this.epoch||0)+1;this.key=key;this.cue='';this.currentFrame=0;
      this.removeAttribute('data-rendered');this.removeAttribute('data-error');
      const url=asset(key,'pose-banda.webp');this.image.src=url;
      try{await imageReady(url);if(!this.isConnected||this.key!==key)return;this.setAttribute('data-rendered','');}
      catch{if(this.key===key)this.setAttribute('data-error','');}
      this.notify();
    }
    if(!this.inView||document.hidden||reduced()||this.dataset.muted==='true'){this.cancel(false);return;}
    if(this.manual)return;
    if(this.dataset.active==='true'&&!this.timer)this.start('Play',false);
    else if(this.dataset.cue&&this.dataset.cue!==this.cue){this.cue=this.dataset.cue;this.start('Play',false);}
    else if(this.dataset.active==='false')this.cancel(false);
  }
  cancel(reset=false){
    this.epoch=(this.epoch||0)+1;clearTimeout(this.timer);this.timer=0;this.running=false;this.loading=false;
    if(this.image)this.image.style.transform='';
    if(reset){this.manual=null;this.index=0;this.mode='Play';}
    this.notify();
  }
  async start(mode='Play',manual=true){
    if(!sequences[mode]||reduced()||!this.inView||document.hidden)return;
    this.cancel(false);this.mode=mode;this.manual=manual;this.index=0;this.running=true;this.loading=true;this.notify();
    const token=++this.epoch,key=this.key;
    // Decode all four originals before changing a frame: no blank flashes.
    try{await Promise.all([0,1,2,3].map(n=>imageReady(asset(key,`keyframes/0${n}.png`))));}
    catch{if(token===this.epoch){this.cancel(true);this.setAttribute('data-error','');}return;}
    if(!this.isConnected||token!==this.epoch||!this.inView||reduced()||document.hidden)return;
    this.preparedKey=key;this.loading=false;this.cycles=manual?3:1;this.tick();
  }
  tick(){
    if(!this.running||!this.isConnected||!this.inView||document.hidden||reduced()){this.cancel(false);return;}
    this.paint();const delay=this.mode==='Play'?timings[this.key][this.index%7]:this.mode==='Walk'?190:160;
    this.timer=setTimeout(()=>{
      this.index++;
      if(this.index>=sequences[this.mode].length){this.index=0;if(--this.cycles<=0){this.cancel(false);this.manual=null;this.paint();return;}}
      this.tick();
    },delay);
  }
  paint(){
    const sequence=sequences[this.mode||'Play'],index=this.index||0,n=sequence[index%sequence.length];
    this.currentFrame=n;this.dataset.frame=String(n);this.dataset.step=String(index);this.dataset.motion=this.mode||'Play';
    this.image.src=asset(this.key,`keyframes/0${n}.png`);
    const phase=index/(sequence.length-1),sway=Math.sin(phase*Math.PI*2);
    // Stage travel and dance are 2D choreography over the original drawings.
    // They do not invent unseen body parts or claim a new anatomical walk cycle.
    this.image.style.transform=this.running&&this.mode==='Walk'?`translateX(${sway*9}%) rotate(${sway*1.4}deg)`:
      this.running&&this.mode==='Dance'?`translateY(${-Math.abs(sway)*2}%) rotate(${sway*3}deg)`:'';
    this.notify();
  }
  replay(mode){return this.start(mode,true);}
  pause(){if(this.running){this.cancel(false);this.manual=true;}else if(!reduced()){if(this.preparedKey!==this.key){this.start(this.mode||'Play',true);return;}this.running=true;this.cycles=1;this.tick();}this.notify();}
  stop(){this.cancel(true);this.paint();}
  step(delta){this.cancel(false);this.manual=true;const seq=sequences[this.mode||'Play'];this.index=((this.index||0)+delta+seq.length)%seq.length;this.paint();}
  selectFrame(n){this.cancel(false);this.manual=true;this.mode='Play';this.index=[0,1,2,3,2,1,0].indexOf(n);this.paint();}
  notify(){this.dispatchEvent(new CustomEvent('sprite-state',{bubbles:true}));}
}
customElements.define('ts-avatar',Sprite);

class Controls extends HTMLElement {
  connectedCallback(){
    if(this.ready)return;this.ready=true;
    this.innerHTML='<div class="sprite-actions"></div><div class="sprite-transport"></div><p class="sprite-readout"></p><details class="sprite-inspector"><summary></summary><p></p><div class="sprite-frames"></div></details>';
    this.avatar=this.closest('.bshow').querySelector('.bportrait-live');
    const add=(selector,action,handler)=>{const b=document.createElement('button');b.type='button';b.className='btn sm';b.dataset.action=action;b.addEventListener('click',handler);this.querySelector(selector).append(b);return b;};
    for(const mode of ['Play','Walk','Dance'])add('.sprite-actions',mode,()=>this.avatar.replay(mode));
    add('.sprite-transport','previous',()=>this.avatar.step(-1));
    add('.sprite-transport','pause',()=>this.avatar.pause());
    add('.sprite-transport','next',()=>this.avatar.step(1));
    add('.sprite-transport','stop',()=>this.avatar.stop());
    this.querySelector('details').addEventListener('toggle',()=>{if(this.querySelector('details').open)this.loadFrames();});
    this.change=()=>this.update();this.avatar.addEventListener('sprite-state',this.change);this.update();
  }
  disconnectedCallback(){this.avatar?.removeEventListener('sprite-state',this.change);this.ready=false;}
  loadFrames(){
    const key=this.avatar.dataset.character,holder=this.querySelector('.sprite-frames');
    if(holder.dataset.character===key)return;holder.dataset.character=key;holder.replaceChildren();
    for(let n=0;n<4;n++){const b=document.createElement('button');b.type='button';b.dataset.original=String(n);b.addEventListener('click',()=>this.avatar.selectFrame(n));
      const image=document.createElement('img');image.src=asset(key,`keyframes/0${n}.png`);image.alt='';image.loading='lazy';image.width=512;image.height=768;
      const label=document.createElement('span');label.textContent=String(n+1).padStart(2,'0');b.append(image,label);holder.append(b);}
    this.updateFrameLabels();
  }
  updateFrameLabels(){for(const b of this.querySelectorAll('[data-original]')){b.setAttribute('aria-label',t('Ver dibujo original ','View original drawing ')+String(Number(b.dataset.original)+1).padStart(2,'0'));b.setAttribute('aria-pressed',String(Number(b.dataset.original)===this.avatar.currentFrame));}}
  update(){
    if(!this.avatar)return;
    const a=this.avatar,labels={Play:t('Animar','Animate'),Walk:t('Caminar','Walk'),Dance:t('Bailar','Dance'),previous:t('Paso anterior','Previous step'),pause:a.running?t('Pausar','Pause'):t('Reanudar','Resume'),next:t('Paso siguiente','Next step'),stop:t('Reposo','Rest')};
    for(const button of this.querySelectorAll('[data-action]')){const action=button.dataset.action;button.textContent=labels[action];button.disabled=reduced()&&['Play','Walk','Dance','pause'].includes(action);if(sequences[action])button.setAttribute('aria-pressed',String(a.running&&a.mode===action));}
    const modes={Play:t('Animación original','Original animation'),Walk:t('Recorrido en escena','Stage walk'),Dance:t('Baile','Dance')},seq=sequences[a.mode||'Play'];
    this.querySelector('.sprite-readout').textContent=a.loading?t('Cargando los dibujos originales… Puedes usar Reposo para cancelar.','Loading the original drawings… Use Rest to cancel.'):(reduced()?t('Movimiento reducido · ','Reduced motion · '):a.running?t('En movimiento · ','Playing · '):t('En pausa · ','Paused · '))+modes[a.mode||'Play']+' · '+t('paso ','step ')+((a.index||0)+1)+' / '+seq.length+' · '+t('dibujo ','drawing ')+((a.currentFrame||0)+1)+' / 4';
    this.querySelector('summary').textContent=t('Ver los cuatro dibujos originales','View the four original drawings');
    this.querySelector('details>p').textContent=t('Revisa cada dibujo sin movimiento. Caminar desplaza el sprite por la escena y Bailar lo acompaña con balanceo; conservan los cuatro dibujos del equipo, no añaden un ciclo de piernas nuevo.','Inspect each still drawing. Walk moves the sprite across the stage and Dance adds a sway; both keep the team’s four drawings rather than adding a new leg cycle.');
    if(this.querySelector('details').open)this.loadFrames();this.updateFrameLabels();
  }
}
customElements.define('ts-sprite-controls',Controls);
function refresh(){for(const a of instances){if(reduced()||document.hidden){a.epoch++;a.cancel(true);}else a.sync();}for(const c of document.querySelectorAll('ts-sprite-controls'))c.update();}
media.addEventListener('change',refresh);
new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['data-ts-reduced-motion','lang']});
document.addEventListener('visibilitychange',refresh);
window.addEventListener('pagehide',()=>{for(const a of instances){a.epoch++;a.cancel(true);}});
