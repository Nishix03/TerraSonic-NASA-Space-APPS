const characters = new Set(["silbo", "inti", "mama", "yaku", "illapa"]);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const models = new Map();
const pending = new Set();
const visible = new Set();
let engine;
let enginePromise;
let camera;
let scene;

let renderer;
let frame;
let lastPaint = -Infinity;
let unavailable = false;

async function prepareEngine() {
  if (!enginePromise) {
    enginePromise = import("./vendor/three-gltf.js").then(api => {
      engine = api;
      camera = new api.OrthographicCamera();
      scene = new api.Scene();
      scene.add(new api.AmbientLight(0xe6edff, 1.4));
      const keyLight = new api.DirectionalLight(0xfff0df, 2.4);
      keyLight.position.set(-3, 4, 5);
      scene.add(keyLight);
      const rimLight = new api.DirectionalLight(0x839dff, 2);
      rimLight.position.set(3, 2, -4);
      scene.add(rimLight);
      return api;
    }).catch(error => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

function schedule() {
  if (frame || unavailable || !pending.size || document.hidden) return;
  frame = requestAnimationFrame(now => {
    frame = 0;
    if (now - lastPaint < 31) {
      schedule();
      return;
    }
    lastPaint = now;
    for (const avatar of [...pending]) {
      pending.delete(avatar);
      try {
        if (avatar.draw(now)) pending.add(avatar);
      } catch {
        avatar.showError();
      }
    }
    schedule();
  });
}

function queue(avatar) {
  if (avatar.inView && avatar.model && !unavailable) {
    pending.add(avatar);
    schedule();
  }
}

function prepareRenderer() {
  if (unavailable) return false;
  if (renderer) return true;
  try {
    renderer = new engine.WebGLRenderer({ alpha: true, antialias: true });
    renderer.outputColorSpace = engine.SRGBColorSpace;
    renderer.setClearColor(0, 0);
    renderer.domElement.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      unavailable = true;
      pending.clear();
      for (const avatar of visible) avatar.showError();
    });
    renderer.domElement.addEventListener("webglcontextrestored", () => {
      unavailable = false;
      for (const avatar of visible) avatar.sync();
    });
    return true;
  } catch {
    unavailable = true;
    return false;
  }
}

function load(key) {
  if (!models.has(key)) {
    const url = new URL(`../modelos/${key}.glb`, import.meta.url);
    url.search = new URL(import.meta.url).search;
    const request = prepareEngine().then(api => {
      if (!prepareRenderer()) throw new Error("3D context unavailable");
      return new api.GLTFLoader().loadAsync(url.href);
    }).then(gltf => {
      const box = new engine.Box3().setFromObject(gltf.scene);
      let face = { faceX: 0, faceY: box.max.y * .76 };
      gltf.scene.traverse(node => {
        if (typeof node.userData.faceY === "number") face = node.userData;
      });
      return {
        scene: gltf.scene, clips: gltf.animations,
        size: box.getSize(new engine.Vector3()), center: box.getCenter(new engine.Vector3()), face,
      };
    }).catch(error => {
      models.delete(key);
      throw error;
    });
    models.set(key, request);
  }
  return models.get(key);
}

function cloneModel(source) {
  const model = source.clone(true);
  const originals = [];
  const copies = [];
  source.traverse(node => originals.push(node));
  model.traverse(node => copies.push(node));
  const copyOf = new Map(originals.map((node, index) => [node, copies[index]]));
  for (const node of originals) {
    if (!node.isSkinnedMesh) continue;
    const skeleton = node.skeleton.clone();
    skeleton.bones = node.skeleton.bones.map(bone => copyOf.get(bone));
    copyOf.get(node).bind(skeleton, node.bindMatrix);
  }
  return model;
}

const intersection = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    target.inView = isIntersecting;
    if (isIntersecting) {
      visible.add(target);
      target.sync();
    } else {
      visible.delete(target);
      pending.delete(target);
      if (unavailable) target.removeAttribute("data-rendered");
    }
  }
});

const resize = new ResizeObserver(entries => {
  for (const { target, contentRect } of entries) {
    target.width = contentRect.width;
    target.height = contentRect.height;
    queue(target);
  }
});

class TerrasonicAvatar extends HTMLElement {
  static observedAttributes = ["data-character", "data-cue", "data-seconds", "data-muted", "data-active"];

  connectedCallback() {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("aria-hidden", "true");
      this.context = this.canvas.getContext("2d");
      this.append(this.canvas);
      this.yaw = .32;
      this.targetYaw = .32;
      if (this.dataset.view === "portrait") {
        this.addEventListener("pointerdown", event => {
          if (event.button !== 0 || !this.model) return;
          this.dragX = event.clientX;
          this.dragY = event.clientY;
          this.rotating = event.pointerType !== "touch";
          this.setPointerCapture(event.pointerId);
        });
        this.addEventListener("pointermove", event => {
          if (!this.hasPointerCapture(event.pointerId)) return;
          const deltaX = event.clientX - this.dragX;
          if (!this.rotating) {
            const deltaY = event.clientY - this.dragY;
            if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
            this.rotating = true;
          }
          this.targetYaw += deltaX * .015;
          this.dragX = event.clientX;
          queue(this);
        });
      }
    }
    intersection.observe(this);
    resize.observe(this);
  }

  disconnectedCallback() {
    intersection.unobserve(this);
    resize.unobserve(this);
    visible.delete(this);
    pending.delete(this);
    this.inView = false;
    this.removeAttribute("data-rendered");
    this.clearModel();
  }

  clearModel() {
    this.mixer?.stopAllAction();
    if (this.mixer && this.model) this.mixer.uncacheRoot(this.model);
    this.mixer = this.model = this.action = this.key = this.requested = null;
    this.asset = this.clips = null;
    this.cue = "";
    this.manual = null;
    this.yaw = this.targetYaw = .32;
    this.removeAttribute("data-error");
  }

  replay(clip = "Play") {
    if (reduced.matches || !this.clips?.has(clip)) return;
    this.manual = { clip, started: performance.now() };
    queue(this);
  }

  rotate() {
    this.targetYaw += Math.PI / 4;
    queue(this);
  }

  showError() {
    this.removeAttribute("data-rendered");
    this.setAttribute("data-error", "");
  }

  attributeChangedCallback(name, previous, next) {
    if (previous === next) return;
    if (name === "data-character") {
      this.clearModel();
      this.removeAttribute("data-rendered");
    }
    this.sync();
  }

  sync() {
    const key = this.dataset.character;
    if (!this.inView || !this.context || !characters.has(key)) return;
    // Small thumbnails and guide portraits use the rendered static pose.
    // Their text controls remain usable before the 3D runtime is downloaded.
    if (["mini", "face", "bust"].includes(this.dataset.view)) return;
    if (["stage", "member"].includes(this.dataset.view) && this.dataset.muted === "true" && !this.model) {
      pending.delete(this);
      return;
    }
    if (this.key === key) {
      this.updateCue();
      queue(this);
    } else if (this.requested !== key) {
      this.requested = key;
      load(key).then(asset => {
        if (!this.isConnected || this.dataset.character !== key || this.requested !== key) return;
        if (!prepareRenderer()) { this.showError(); return; }
        this.key = key;
        this.asset = asset;
        this.model = cloneModel(asset.scene);
        this.mixer = new engine.AnimationMixer(this.model);
        this.clips = new Map(asset.clips.map(clip => [clip.name, clip]));
        this.updateCue();
        queue(this);
      }).catch(() => {
        if (this.requested !== key || this.dataset.character !== key) return;
        this.showError();
      });
    }
  }

  updateCue() {
    const cue = this.dataset.muted === "true" ? "" : this.dataset.cue || "";
    if (cue !== this.cue) {
      this.cue = cue;
      this.started = performance.now();
    }
  }

  animation(now) {
    const idle = this.clips.get("Idle");
    if (reduced.matches || this.dataset.muted === "true") {
      this.manual = null;
      return [idle, 0, false];
    }
    if (this.manual) {
      const time = (now - this.manual.started) / 1000;
      const clip = this.clips.get(this.manual.clip);
      if (time < clip.duration * (this.manual.clip === "Walk" ? 2 : 1)) {
        return [clip, Math.max(0, time) % clip.duration, true];
      }
      this.manual = null;
    }
    if (this.cue) {
      const name = this.cue.startsWith("entry-") ? "Walk" : this.cue.startsWith("speak-") ? "Speak" : "Play";
      const clip = this.clips.get(name);
      const duration = Number.parseFloat(this.dataset.seconds) || clip.duration;
      const elapsed = Math.max(0, (now - this.started) / 1000);
      if (elapsed < duration) return [clip, elapsed / duration * clip.duration, true];
    }
    if (["stage", "member"].includes(this.dataset.view) && this.dataset.active === "true") {
      const dance = this.clips.get("Dance");
      return [dance, now / 1000 % dance.duration, true];
    }
    return [idle, 0, false];
  }

  draw(now) {
    if (!this.inView || !this.model || !this.width || !this.height) return false;
    const view = this.dataset.view;
    if (view === "stage" && this.dataset.muted === "true") return false;
    const { size, center, face } = this.asset;
    const [clip, time, animate] = this.animation(now);
    if (clip) {
      if (this.action?.getClip() !== clip) {
        this.action?.stop();
        this.action = this.mixer.clipAction(clip).reset().play();
        this.action.paused = true;
      }
      this.action.time = time;
      this.mixer.update(0);
    }
    const targetYaw = view === "portrait" ? this.targetYaw : view === "stage" ? .17 : .12;
    this.yaw = reduced.matches ? targetYaw : this.yaw + (targetYaw - this.yaw) * .29;
    this.model.rotation.y = this.yaw;

    const aspect = this.width / this.height;
    const bust = view === "bust" || view === "face";
    const height = bust ? (view === "face" ? 1.05 : 1.73) : Math.max(size.y * 1.17, Math.max(size.x, size.z) * 1.23 / aspect);
    const x = bust ? face.faceX : center.x;
    const y = bust ? face.faceY + (view === "bust" ? -.12 : .035) : center.y;
    camera.left = -height * aspect / 2;
    camera.right = -camera.left;
    camera.top = height / 2;
    camera.bottom = -camera.top;
    camera.near = .1;
    camera.far = 12;
    camera.position.set(x, y + (bust ? .13 : .38), 5);
    camera.lookAt(x, y, 0);
    camera.updateProjectionMatrix();

    const ratio = Math.min(devicePixelRatio || 1, 1.5, 720 / Math.max(this.width, this.height));
    const width = Math.max(1, Math.round(this.width * ratio));
    const pixels = Math.max(1, Math.round(this.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== pixels) {
      this.canvas.width = width;
      this.canvas.height = pixels;
    }
    if (renderer.domElement.width !== width || renderer.domElement.height !== pixels) {
      renderer.setSize(width, pixels, false);
    }
    scene.add(this.model);
    renderer.render(scene, camera);
    scene.remove(this.model);
    this.context.clearRect(0, 0, width, pixels);
    this.context.drawImage(renderer.domElement, 0, 0);
    this.setAttribute("data-rendered", "");
    this.removeAttribute("data-error");
    return animate || Math.abs(this.yaw - targetYaw) > .003;
  }
}

customElements.define("ts-avatar", TerrasonicAvatar);
reduced.addEventListener("change", () => {
  for (const avatar of visible) {
    if (reduced.matches) avatar.manual = null;
    queue(avatar);
  }
});
document.addEventListener("visibilitychange", schedule);
