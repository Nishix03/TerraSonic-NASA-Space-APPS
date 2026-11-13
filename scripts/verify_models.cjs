// Browser regression checks for the 3D runtime and the static safety net.
// Set TERRASONIC_PLAYWRIGHT and TERRASONIC_CHROMIUM to existing installations.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.TERRASONIC_PLAYWRIGHT || "playwright-core");

const site = path.resolve(process.argv[2] || "_site");
const output = path.resolve(process.argv[3] || "_work/models/browser");
const base = "http://terrasonic.test/";
const keys = ["silbo", "inti", "mama", "yaku", "illapa"];

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.TERRASONIC_CHROMIUM,
    args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const results = [];
  try {
    for (const scenario of ["normal", "reduced", "no-webgl", "slow-model", "missing-model", "missing-runtime"]) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, reducedMotion: "reduce", deviceScaleFactor: 1,
      });
      let release;
      const delayed = new Promise(resolve => { release = resolve; });
      const requests = [];
      await context.route(base + "**", async route => {
        const relative = new URL(route.request().url()).pathname.slice(1) || "index.html";
        requests.push(relative);
        if (scenario === "missing-model" && relative.endsWith(".glb")) {
          await route.fulfill({ status: 404, body: "Fixture: unavailable model" });
          return;
        }
        if (scenario === "missing-runtime" && relative.includes("avatar3d.js")) {
          await route.abort();
          return;
        }
        if (scenario === "slow-model" && relative.endsWith(".glb")) await delayed;
        const file = path.resolve(site, relative);
        if (file.startsWith(site + path.sep) && fs.existsSync(file)) await route.fulfill({ path: file });
        else await route.fulfill({ status: 404 });
      });
      if (scenario === "no-webgl") {
        await context.addInitScript(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(type, ...args) {
            return String(type).includes("webgl") ? null : original.call(this, type, ...args);
          };
        });
      }
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.locator(".hero .btn.primary").waitFor();
      assert(!requests.some(url => url.includes("three-gltf") || url.endsWith(".glb")),
        "Home uses static guide imagery, without downloading the 3D engine");
      if (scenario === "normal") {
        await page.locator("#tour-nav button").nth(0).click();
        await page.locator(".discgrid .dcard").first().click();
        assert.equal(await page.locator(".listen-member ts-avatar").count(), 5);
        const musician = page.locator(".listen-member").nth(1);
        const before = await musician.getAttribute("aria-pressed");
        await musician.click();
        const expected = before === "true" ? "false" : "true";
        assert.equal(await musician.getAttribute("aria-pressed"), expected);
        await page.locator(".bar .side.r button").click();
        assert.equal(await page.locator(".band.two .bchip").nth(1).getAttribute("aria-pressed"), expected,
          "Listen and Stage must use the same musician activation");
      }
      await page.locator("#tour-nav button").nth(1).click();
      const portrait = page.locator(".bportrait-live");
      const report = { scenario, characters: [], errors };
      for (let i = 0; i < keys.length; i++) {
        await page.locator(".bpick button").nth(i).click();
        await portrait.scrollIntoViewIfNeeded();
        await page.waitForFunction(key => document.querySelector(".bportrait-live")?.dataset.character === key, keys[i]);
        const fallback = await portrait.evaluate(async element => {
          const style = getComputedStyle(element, "::before");
          const url = style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
          const image = new Image();
          image.src = url;
          await image.decode();
          return { width: image.naturalWidth, height: image.naturalHeight,
            visible: style.display !== "none", url };
        });
        assert(fallback.width > 100 && fallback.height > 100);
        if (["normal", "reduced"].includes(scenario)) {
          await page.waitForFunction(() => document.querySelector(".bportrait-live")?.hasAttribute("data-rendered"));
          const info = await portrait.evaluate(element => ({
            clips: [...element.clips.keys()], key: element.key,
            bounds: element.asset.size.toArray(), skinned: !!element.model.getObjectByProperty("isSkinnedMesh", true),
            static: element.animation(performance.now())[2] === false,
          }));
          assert.equal(info.key, keys[i]);
          assert(info.skinned);
          assert(info.bounds.every(value => Number.isFinite(value) && value > .1));
          for (const clip of ["Idle", "Play", "Walk", "Dance", "Speak"]) assert(info.clips.includes(clip));
          assert(info.static);
          await portrait.evaluate(element => element.replay("Walk"));
          assert.equal(await portrait.evaluate(element => element.manual), null,
            "A requested clip must respect reduced motion too");
          if (scenario === "normal") {
            await page.emulateMedia({ reducedMotion: "no-preference" });
            await portrait.evaluate(element => element.replay("Play"));
            assert(await portrait.evaluate(element => element.manual?.clip === "Play"));
            await page.waitForTimeout(180);
            await page.emulateMedia({ reducedMotion: "reduce" });
            await page.waitForTimeout(80);
            assert.equal(await portrait.evaluate(element => element.manual), null);
            assert.equal(await portrait.evaluate(element => element.animation(performance.now())[2]), false);
          }
          const staticCanvas = await portrait.evaluate(element => element.canvas.toDataURL());
          await page.waitForTimeout(60);
          assert.equal(await portrait.evaluate(element => element.canvas.toDataURL()), staticCanvas,
            "A paused or reduced-motion character should remain still");
          report.characters.push(info);
        } else {
          assert(fallback.visible, "A real pose must remain visible while 3D is unavailable or pending");
          report.characters.push({ key: keys[i], fallback });
        }
        await page.screenshot({ path: path.join(output, scenario + "-" + keys[i] + ".png") });
      }
      if (scenario === "slow-model") {
        release();
        await page.waitForFunction(() => document.querySelector(".bportrait-live")?.hasAttribute("data-rendered"));
        assert.equal(await portrait.getAttribute("data-character"), "illapa",
          "A late earlier character must not replace the current selection");
      }
      assert.deepEqual(errors, []);
      results.push(report);
      fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(results, null, 2));
      release();
      await context.close();
      console.log("PASS", scenario, "five characters");
    }
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
