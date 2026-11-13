"""Run named browser regressions sequentially, retaining logs and exact exit codes."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import os
import shutil
import signal
import subprocess
import time

CHECKS = {
    "home": "verify_home.cjs", "preferences": "verify_preferences_layout.cjs",
    "fonts": "verify_fonts_browser.cjs", "reflow": "verify_reflow.cjs",
    "keyboard": "verify_keyboard.cjs", "a11y": "verify_a11y.cjs",
    "method": "verify_method.cjs", "characters": "verify_characters.cjs",
    "convert": "verify_convert.cjs", "brisa": "verify_brisa.cjs",
    "player": "verify_player.cjs", "impacts": "verify_impacts.cjs",
    "models": "verify_models.cjs", "full-disc": "verify_full_disc.cjs",
    "image-geometry": "verify_image_geometry.cjs",
    "image-formats": "verify_image_formats.cjs",
    "expanded-layout": "verify_expanded_layout.cjs",
    "page-lifecycle": "verify_page_lifecycle.cjs", "memory": "measure_memory.cjs",
    "fallback-audio": "verify_fallback_audio.cjs",
    "avatar-interactions": "verify_avatar_interactions.cjs",
    "compact-player": "verify_compact_player.cjs",
    "models-framing": "verify_model_framing.cjs",
    "themes": "verify_themes.cjs",
    "sprites": "verify_sprites.cjs",
    "mobile-guide": "verify_mobile_guide.cjs",
    "reto05": "verify_reto05.cjs",
    "short-viewport": "verify_short_viewport.cjs",
    "space-background": "verify_space_background.cjs",
    "haptics": "verify_haptics.cjs",
}
DEFAULT = ["home", "preferences", "reflow", "method", "characters", "convert", "brisa", "player", "impacts"]


def run_check(command: list[str], env: dict[str, str], stream, timeout: int) -> int:
    """Own the process group so a timeout cannot leave isolated test browsers."""
    windows = os.name == "nt"
    options = {"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW} if windows else {"start_new_session": True}
    process = subprocess.Popen(command, env=env, stdout=stream, stderr=subprocess.STDOUT, **options)
    try:
        return process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        stream.write(f"\nRUNNER TIMEOUT after {timeout} seconds\n")
        stream.flush()
        if process.poll() is None:
            if windows:
                # The Popen handle still identifies our live child; /T only
                # follows descendants of that owned test command.
                result = subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], capture_output=True, timeout=20)
                stream.write(f"Owned process-tree termination exit code: {result.returncode}\n")
            else:
                os.killpg(process.pid, signal.SIGKILL)
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=10)
        return 124


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, default=Path("_site"))
    parser.add_argument("--evidence", type=Path, default=Path("_work/qa"))
    parser.add_argument("--browser", choices=["chromium", "firefox", "webkit"], default="chromium")
    parser.add_argument("--only", nargs="+", choices=CHECKS)
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--timeout", type=int, default=300, help="Maximum seconds per owned test process tree")
    args = parser.parse_args()
    if args.timeout < 1:
        parser.error("--timeout must be positive")
    if args.list:
        print("\n".join(f"{key}: {value}" for key, value in CHECKS.items()))
        return 0
    checks = args.only or DEFAULT
    if args.browser != "chromium" and any(key in {"fonts", "keyboard", "memory"} for key in checks):
        parser.error("fonts, keyboard and memory collect Chrome DevTools evidence; run these with chromium")
    site, output = args.site.resolve(), args.evidence.resolve()
    if not (site / "index.html").is_file():
        parser.error("Generate the static site before running browser checks")
    node = shutil.which("node")
    if not node:
        parser.error("Node.js is required for browser checks, but not to serve the static site")
    output.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, TERRASONIC_BROWSER=args.browser)
    report = {"startedAt": datetime.now(timezone.utc).isoformat(), "browser": args.browser,
              "site": str(site), "nodeOldSpaceLimitMiB": 256, "checks": [], "note": "Durations are process wall time, not active human work time. The JS heap limit does not bound native or browser memory."}
    scripts = Path(__file__).resolve().parent
    failed = False
    for key in checks:
        print(f"RUN {args.browser} {key}", flush=True)
        start = time.monotonic()
        log = output / f"{key}.log"
        with log.open("w", encoding="utf-8") as stream:
            code = run_check([node, "--max-old-space-size=256", str(scripts / CHECKS[key]), str(site), str(output / key)], env, stream, args.timeout)
        report["checks"].append({"name": key, "exitCode": code, "wallSeconds": round(time.monotonic() - start, 3), "timeoutSeconds":args.timeout, "log": str(log)})
        (output / "run.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{'PASS' if code == 0 else 'FAIL'} {args.browser} {key} ({code})", flush=True)
        if code:
            print(log.read_text(encoding="utf-8", errors="replace")[-4000:])
            failed = True
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())
