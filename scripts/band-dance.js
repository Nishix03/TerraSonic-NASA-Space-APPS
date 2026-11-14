// The four drawings and the dance order come from the original 2D band.
const frames = [0, 1, 2, 3, 2, 1, 2, 0];
const media = matchMedia('(prefers-reduced-motion: reduce)');
const version = new URL(import.meta.url).search;
const drawings = new Map();
const reduced = () => media.matches || document.documentElement.dataset.tsReducedMotion === 'true';
const playingFrames = [0, 1, 2, 3, 2, 1, 0];
const timings = {
  silbo: [210, 230, 260, 175, 280, 210, 260], inti: [180, 250, 170, 145, 210, 170, 245],
  mama: [180, 240, 280, 180, 230, 240, 250], yaku: [135, 175, 175, 155, 180, 170, 210],
  illapa: [240, 210, 155, 150, 220, 175, 280],
};

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
  static observedAttributes = ['data-character', 'data-playing'];
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

  attributeChangedCallback(name, previous, next) {
    if (previous === next || !this.art) return;
    if (name === 'data-playing') { this.sync(); return; }
    this.userPaused = false;
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
    if (reduced() || this.dataset.playing === 'false') {
      this.stop(false);
      this.removeAttribute('data-dancing');
    } else if (document.hidden || !this.inView) this.stop(true);
    else if (!this.userPaused && !this.running && !this.loading) this.start();
    this.report();
  }

  async start() {
    if (this.loading || this.running || !this.dataset.character || reduced()) return;
    this.loading = true;
    this.report();
    const run = ++this.run;
    try {
      const images = await loadDrawings(this.dataset.character);
      if (run !== this.run || !this.isConnected) return;
      this.images = images;
      this.loading = false;
      this.running = true;
      this.report();
      if (this.motion) this.motion.play();
      else if (!this.dataset.playing) this.motion = this.art.animate?.([
        { transform: 'translateY(0) rotate(-2deg)' },
        { transform: 'translateY(-2%) rotate(2deg)', offset: .5 },
        { transform: 'translateY(0) rotate(-2deg)' },
      ], { duration: 1280, iterations: Infinity, easing: 'ease-in-out' });
      this.tick();
    } catch {
      if (run !== this.run) return;
      this.stop(false);
      this.report();
    }
  }

  tick() {
    const sequence = this.dataset.playing ? playingFrames : frames;
    const frame = sequence[this.index];
    this.art.src = this.images[frame].src;
    this.dataset.frame = String(frame);
    this.setAttribute('data-dancing', '');
    this.timer = setTimeout(() => {
      this.index = (this.index + 1) % sequence.length;
      this.tick();
    }, this.dataset.playing ? timings[this.dataset.character][this.index] : 160);
  }

  stop(freeze) {
    ++this.run;
    clearTimeout(this.timer);
    this.running = this.loading = false;
    if (freeze) this.motion?.pause();
    else { this.motion?.cancel(); this.motion = null; }
  }

  toggleDance() {
    if (reduced()) return;
    this.userPaused = this.running || this.loading;
    if (this.userPaused) this.stop(true);
    else this.sync();
    this.report();
  }

  report() {
    if (this.dataset.playing === undefined) this.dispatchEvent(new CustomEvent('earthbeat-dance-state', { bubbles: true }));
  }
}

class DanceButton extends HTMLElement {
  connectedCallback() {
    this.dance = this.closest('.bshow').querySelector('earthbeat-dance');
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'btn sm';
    this.button.onclick = () => this.dance.toggleDance();
    this.replaceChildren(this.button);
    this.update = () => {
      const on = this.dance.running || this.dance.loading;
      const spanish = document.documentElement.lang === 'es';
      this.button.textContent = on ? (spanish ? 'Pausar baile' : 'Pause dance') : (spanish ? 'Bailar' : 'Dance');
      this.button.disabled = reduced();
    };
    this.dance.addEventListener('earthbeat-dance-state', this.update);
    this.language = new MutationObserver(this.update);
    this.language.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    this.update();
  }

  disconnectedCallback() {
    this.dance?.removeEventListener('earthbeat-dance-state', this.update);
    this.language?.disconnect();
  }
}

customElements.define('earthbeat-dance', BandDance);
customElements.define('earthbeat-dance-button', DanceButton);

class StageNoteTrack extends HTMLElement {
  static observedAttributes = ['data-hit'];
  cues = new Map();

  clear = () => {
    for (const note of this.cues.keys()) this.removeCue(note);
  };

  connectedCallback() {
    window.addEventListener('terrasonic:motion', this.clear);
    document.addEventListener('visibilitychange', this.clear);
    this.showCue(this.dataset.hit);
  }

  disconnectedCallback() {
    window.removeEventListener('terrasonic:motion', this.clear);
    document.removeEventListener('visibilitychange', this.clear);
    this.clear();
  }

  attributeChangedCallback(_, previous, hit) {
    if (previous === hit) return;
    if (hit && this.isConnected) this.showCue(hit);
    else if (!hit) this.clear();
  }

  showCue(hit) {
    if (!hit) return;
    // Read the labels after the template has applied this attack's attributes.
    queueMicrotask(() => {
      if (this.isConnected && this.dataset.hit === hit && !document.hidden) this.addCue();
    });
  }

  addCue() {
    const still = this.closest('.band-stage')?.dataset.noteMotion !== 'full' || typeof this.animate !== 'function';
    // Keep the most recent attack readable with reduced motion.
    if (still) this.clear();
    const note = document.createElement('span');
    note.className = still ? 'stage-note is-static' : 'stage-note';
    note.dataset.note = this.dataset.kind;
    if (this.dataset.label) {
      const text = document.createElement('small');
      text.textContent = this.dataset.label;
      note.append(text);
    }
    this.append(note);
    const arrive = 'translate(-50%, calc(var(--stage-drop) - 7px))';
    const animation = still ? null : note.animate([
      { transform: 'translate(-50%, -12px)' },
      { transform: arrive, offset: .80 },
      { transform: arrive, opacity: .85 },
    ], { duration: 780, fill: 'both' });
    const timeout = setTimeout(() => this.removeCue(note), still ? 680 : 780);
    this.cues.set(note, { animation, timeout });
  }

  removeCue(note) {
    const cue = this.cues.get(note);
    clearTimeout(cue.timeout);
    cue.animation?.cancel();
    this.cues.delete(note);
    note.remove();
  }
}

customElements.define('earthbeat-note-track', StageNoteTrack);
