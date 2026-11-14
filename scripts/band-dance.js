// The four drawings and the dance order come from the original 2D band.
const frames = [0, 1, 2, 3, 2, 1, 2, 0];
const media = matchMedia('(prefers-reduced-motion: reduce)');
const version = new URL(import.meta.url).search;
const drawings = new Map();
const reduced = () => media.matches || document.documentElement.dataset.tsReducedMotion === 'true';
const label = (es, en) => document.documentElement.lang === 'es' ? es : en;

function loadDrawings(character) {
  if (!drawings.has(character)) {
    const images = Array.from({ length: 4 }, (_, index) => {
      const img = new Image();
      img.fetchPriority = 'low';
      img.src = new URL(`../sprites/${character}/baile/0${index}.webp${version}`, import.meta.url).href;
      return img;
    });
    drawings.set(character, Promise.all(images.map(img => img.decode())).then(() => images).catch(error => {
      drawings.delete(character);
      throw error;
    }));
  }
  return drawings.get(character);
}

class BandDance extends HTMLElement {
  static observedAttributes = ['data-character'];
  index = 0;
  run = 0;

  connectedCallback() {
    // The template can connect before its image child has been inserted.
    queueMicrotask(() => {
      if (!this.isConnected) return;
      this.image = this.querySelector('img');
      if (!this.image) return;
      this.art = document.createElement('img');
      this.art.className = 'bportrait dance-frame';
      this.art.alt = '';
      this.append(this.art);
      if (typeof IntersectionObserver === 'function') {
        this.visibility = new IntersectionObserver(([entry]) => {
          this.inView = entry.isIntersecting;
          this.sync();
        }, { rootMargin: '40px' });
        this.visibility.observe(this.closest('.bshow') || this);
      } else this.inView = true;
      this.refresh = () => this.sync();
      document.addEventListener('visibilitychange', this.refresh);
      window.addEventListener('terrasonic:motion', this.refresh);
      media.addEventListener('change', this.refresh);
      if (this.inView) this.sync();
    });
  }

  disconnectedCallback() {
    this.visibility?.disconnect();
    document.removeEventListener('visibilitychange', this.refresh);
    window.removeEventListener('terrasonic:motion', this.refresh);
    media.removeEventListener('change', this.refresh);
    this.stop(false);
    this.art?.remove();
  }

  attributeChangedCallback(_, previous, next) {
    if (previous === next || !this.art) return;
    this.paused = false;
    this.index = 0;
    this.images = null;
    this.stop(false);
    this.art.removeAttribute('src');
    this.removeAttribute('data-dancing');
    this.removeAttribute('data-frame');
    this.sync();
  }

  sync() {
    if (!this.isConnected || !this.art) return;
    if (reduced()) {
      this.stop(false);
      this.removeAttribute('data-dancing');
    } else if (document.hidden || !this.inView) this.stop(true);
    else if (!this.paused && !this.running && !this.loading) this.start();
    this.notify();
  }

  async start() {
    if (this.loading || this.running || !this.dataset.character || reduced()) return;
    this.loading = true;
    this.failed = false;
    const run = ++this.run;
    this.notify();
    try {
      const images = await loadDrawings(this.dataset.character);
      if (run !== this.run || !this.isConnected) return;
      this.images = images;
      this.loading = false;
      this.running = true;
      if (this.motion) this.motion.play();
      else this.motion = this.art.animate?.([
        { transform: 'translateY(0) rotate(-2deg)' },
        { transform: 'translateY(-2%) rotate(2deg)', offset: .5 },
        { transform: 'translateY(0) rotate(-2deg)' },
      ], { duration: 1280, iterations: Infinity, easing: 'ease-in-out' });
      this.tick();
    } catch {
      if (run !== this.run) return;
      this.failed = true;
      this.stop(false);
    }
  }

  tick() {
    const frame = frames[this.index];
    this.art.src = this.images[frame].src;
    this.dataset.frame = String(frame);
    this.setAttribute('data-dancing', '');
    this.notify();
    this.timer = setTimeout(() => {
      this.index = (this.index + 1) % frames.length;
      this.tick();
    }, 160);
  }

  stop(freeze) {
    ++this.run;
    clearTimeout(this.timer);
    this.running = this.loading = false;
    if (freeze) this.motion?.pause();
    else { this.motion?.cancel(); this.motion = null; }
    this.notify();
  }

  toggle() {
    if (reduced()) return;
    this.paused = this.running || this.loading;
    if (this.paused) this.stop(true);
    else this.sync();
  }

  notify() { this.dispatchEvent(new Event('dance-state')); }
}

class BandDanceControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<button type="button" class="btn sm"></button><p class="sprite-readout" role="status"></p>';
    this.dance = this.closest('.bshow').querySelector('earthbeat-dance');
    this.button = this.querySelector('button');
    this.status = this.querySelector('p');
    this.button.onclick = () => this.dance.toggle();
    this.update = () => {
      const { running, loading, failed } = this.dance;
      this.button.disabled = reduced();
      const action = running || loading ? label('Pausar baile', 'Pause dance') : label('Bailar', 'Dance');
      const status = reduced() ? label('Movimiento reducido', 'Reduced motion') : failed ? label('No se pudo cargar el baile.', 'The dance could not load.') : loading ? label('Cargando el baile…', 'Loading the dance…') : running ? label('Baile en reproducción', 'Dance is playing') : label('Baile en pausa', 'Dance is paused');
      if (this.button.textContent !== action) this.button.textContent = action;
      if (this.status.textContent !== status) this.status.textContent = status;
    };
    this.dance.addEventListener('dance-state', this.update);
    this.language = new MutationObserver(this.update);
    this.language.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    this.update();
  }

  disconnectedCallback() {
    this.dance?.removeEventListener('dance-state', this.update);
    this.language?.disconnect();
  }
}

customElements.define('earthbeat-dance', BandDance);
customElements.define('earthbeat-dance-controls', BandDanceControls);
