"""Create a new portable TerraSonic package from a committed source tree and selected QA evidence."""
import argparse
from datetime import datetime, timezone
from hashlib import sha256
import io
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SECRET_PATTERNS = [
    re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(rb"\bgh[pousr]_[A-Za-z0-9]{30,}\b"),
    re.compile(rb"\bgithub_pat_[A-Za-z0-9_]{60,}\b"),
    re.compile(rb"\bAKIA[0-9A-Z]{16}\b"),
]
FORBIDDEN = {".git", ".env", ".vercel", "node_modules", "_work", "__pycache__"}


def allowed(path: str, data: bytes) -> None:
    parts = PurePosixPath(path).parts
    if not parts or PurePosixPath(path).is_absolute() or ".." in parts or any(part in FORBIDDEN or part.startswith(".env.") for part in parts):
        raise ValueError(f"Forbidden package path: {path}")
    if any(pattern.search(data) for pattern in SECRET_PATTERNS):
        raise ValueError(f"Possible private credential in {path}; no package was accepted")


def git(*args: str) -> bytes:
    return subprocess.check_output(["git", *args], cwd=ROOT)


def create(output: Path, commit: str, evidence: list[Path], preview: str | None, preview_commit: str | None, baseline_commit: str | None) -> Path:
    full_commit = git("rev-parse", "--verify", f"{commit}^{{commit}}").decode().strip()
    if not re.fullmatch(r"[0-9a-f]{40}", full_commit):
        raise ValueError("The source commit must resolve to a full Git object ID")
    destination = output.resolve()
    if destination.exists():
        raise ValueError("Choose a new output directory; the packager never deletes an existing package")
    if destination == ROOT or destination in ROOT.parents:
        raise ValueError("Package output must not replace the project or a parent directory")
    portable = destination.with_suffix(".zip")
    staging = destination.parent / (destination.name + "-source-check")
    if portable.exists() or staging.exists():
        raise ValueError("Package ZIP or source verification directory already exists; choose another output name")
    archive_data = git("archive", "--format=zip", full_commit)
    with zipfile.ZipFile(io.BytesIO(archive_data)) as source:
        for entry in source.infolist():
            if entry.is_dir():
                continue
            allowed(entry.filename, source.read(entry))
    destination.mkdir(parents=True)
    (destination / "source.zip").write_bytes(archive_data)
    baseline_sha = None
    if baseline_commit:
        baseline_sha = git("rev-parse", "--verify", f"{baseline_commit}^{{commit}}").decode().strip()
        backup = git("archive", "--format=zip", baseline_sha, "--", "assets/avatares/terrasonic-banda.blend", "prototipos/I11-eic/modelos")
        with zipfile.ZipFile(io.BytesIO(backup)) as original:
            for entry in original.infolist():
                if not entry.is_dir():
                    allowed(entry.filename, original.read(entry))
        (destination / "baseline-models.zip").write_bytes(backup)
    # A new, isolated staging tree proves the build does not depend on ignored local files.
    staging.mkdir()
    with zipfile.ZipFile(io.BytesIO(archive_data)) as source:
        source.extractall(staging)
    subprocess.run([sys.executable, str(staging / "scripts" / "verify_fonts.py")], check=True, cwd=staging)
    subprocess.run([sys.executable, str(staging / "scripts" / "build_pages.py"), str(destination / "site")], check=True, cwd=staging)
    evidence_dir = destination / "evidence"
    evidence_dir.mkdir()
    evidence_sources = []
    for number, folder in enumerate(evidence, 1):
        folder = folder.resolve()
        if not folder.is_dir():
            raise ValueError(f"Evidence folder is missing: {folder.name}")
        label = f"{number:02d}-{folder.name}"
        copied = 0
        for file in sorted(folder.rglob("*")):
            if not file.is_file() or file.suffix.lower() not in {".json", ".png", ".webp"}:
                continue
            relative = file.relative_to(folder)
            target = evidence_dir / label / relative
            data = file.read_bytes()
            allowed(target.relative_to(destination).as_posix(), data)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            copied += 1
        evidence_sources.append({"label": label, "sourceFolderName": folder.name, "files": copied})
    serve = '''"""Serve the bundled static site locally; no installation or account is needed."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    directory = Path(__file__).resolve().parent / "site"
    if not (directory / "index.html").is_file():
        parser.error("The bundled site/index.html is missing")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(SimpleHTTPRequestHandler, directory=str(directory)))
    print(f"TerraSonic: http://127.0.0.1:{server.server_port}/ — Ctrl+C to stop", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
'''
    (destination / "serve.py").write_text(serve, encoding="utf-8")
    preview_note = f"La vista publicada corresponde al código de aplicación `{preview_commit}`; puede diferir de este paquete." if preview_commit else "La URL puede servir una versión distinta; consulta docs/PUBLICACION.md del archivo fuente antes de atribuirle cambios."
    (destination / "README.md").write_text(f'''# TerraSonic · copia portable de revisión

Fuente: Nishix03/TerraSonic-NASA-Space-APPS, rama piero-mejoras, commit `{full_commit}`.
Vista independiente: {preview or 'consultar docs/PUBLICACION.md en source.zip'}.
{preview_note} La huella de este paquete identifica esta copia.

1. Extrae el ZIP completo en una carpeta nueva.
2. Con Python 3 instalado, ejecuta `python serve.py` desde esa carpeta.
3. Abre http://127.0.0.1:8765/. Para detener el servidor, pulsa Ctrl+C.

`site/` contiene el producto estático listo para un host. No requiere Node, Blender, cuenta, backend, AWS ni base de datos. Archivos, fuentes, mapas, modelos y poses se incluyen. El audio requiere una acción del usuario y un navegador con Web Audio. Voz/vibración dependen del dispositivo y las voces instaladas; el texto y las poses permiten continuar sin esas APIs. Los enlaces documentales externos requieren red. Abrir index.html con file:// no es el modo soportado.

`source.zip` contiene solo archivos del commit Git. Extráelo en otra carpeta para editar: `python scripts/build_pages.py _site`; `node scripts/test_guides.cjs _site/index.html`. Node solo es necesario para pruebas; Blender solo para regenerar modelos. Instrucciones y límites en docs/PIERO-MEJORAS.md, AUDITORIA_2026-11-13.md, MODELOS_3D.md y PUBLICACION.md.

{('baseline-models.zip conserva el .blend y los cinco GLB originales del commit '+baseline_sha+', separados de la propuesta nueva.') if baseline_sha else 'Los modelos anteriores se pueden recuperar del commit base indicado en la documentación del repositorio.'}

`evidence/` conserva una selección de JSON/capturas. Son pruebas automatizadas y renders de esta laptop; no acreditan certificación WCAG, prueba con personas, escucha humana ni aprobación cultural. Los 420 minutos efectivos y requisitos pendientes siguen en el registro fuente; el paquete es un checkpoint, no una declaración automática de cierre.

`manifest.json` enumera bytes y SHA-256. `python verify_package.py` comprueba la integridad. El empaquetador rechaza rutas de credenciales y patrones de claves conocidos; también evita .git, .env, .vercel, node_modules y _work. No se incluyen tokens, el enlace privado de reclamación de Vercel ni logs privados. Una búsqueda de patrones no demuestra ausencia universal de secretos; las entradas se limitan a fuente comprometida y evidencia seleccionada.
''', encoding="utf-8")
    verifier = '''"""Verify every package file against manifest.json, rejecting extras and unsafe paths."""
from hashlib import sha256
import json
from pathlib import Path, PurePosixPath

root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
expected={item['path']:item for item in manifest['files']}
actual={file.relative_to(root).as_posix() for file in root.rglob('*') if file.is_file() and file.name!='manifest.json'}
if actual!=set(expected): raise SystemExit('Package files differ from the manifest')
for name,item in expected.items():
    target=(root/name).resolve()
    if not target.is_relative_to(root) or PurePosixPath(name).is_absolute() or '..' in PurePosixPath(name).parts: raise SystemExit('Unsafe manifest path')
    data=target.read_bytes()
    if len(data)!=item['bytes'] or sha256(data).hexdigest()!=item['sha256']: raise SystemExit('File integrity failed: '+name)
print('PASS package integrity:',len(expected),'files; source commit',manifest['sourceCommit'])
'''
    (destination / "verify_package.py").write_text(verifier, encoding="utf-8")
    files = []
    for file in sorted(destination.rglob("*")):
        if not file.is_file():
            continue
        relative, data = file.relative_to(destination).as_posix(), file.read_bytes()
        allowed(relative, data)
        files.append({"path": relative, "bytes": len(data), "sha256": sha256(data).hexdigest()})
    manifest = {"version": 1, "createdAt": datetime.now(timezone.utc).isoformat(), "sourceCommit": full_commit,
                "branch": "piero-mejoras", "preview": preview, "previewSourceCommit": preview_commit,
                "baselineModelsCommit": baseline_sha, "evidence": evidence_sources, "files": files}
    (destination / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    subprocess.run([sys.executable, str(destination / "verify_package.py")], check=True)
    with zipfile.ZipFile(portable, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
        for file in sorted(destination.rglob("*")):
            if file.is_file():
                bundle.write(file, file.relative_to(destination).as_posix())
    fingerprint = sha256(portable.read_bytes()).hexdigest()
    portable.with_suffix(".zip.sha256").write_text(f"{fingerprint}  {portable.name}\n", encoding="ascii")
    print(json.dumps({"archive": str(portable), "bytes": portable.stat().st_size, "sha256": fingerprint,
                      "sourceCommit": full_commit, "files": len(files) + 1}, ensure_ascii=False))
    return portable


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--commit", default="HEAD")
    parser.add_argument("--evidence", type=Path, action="append", default=[])
    parser.add_argument("--preview")
    parser.add_argument("--preview-source-commit", help="source application commit verified at the independent URL")
    parser.add_argument("--baseline-models-commit", help="also include the original .blend and five GLB from this Git commit")
    options = parser.parse_args()
    create(options.output, options.commit, options.evidence, options.preview, options.preview_source_commit, options.baseline_models_commit)
