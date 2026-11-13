"""Packaging integration controls in a new disposable Git fixture, not the project history."""
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile

import package_portable as packager


class PortableTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.project = packager.ROOT
        workspace = cls.project / "_work"
        workspace.mkdir(exist_ok=True)
        # Keep the small fixture for diagnosis; never remove an existing directory.
        cls.folder = Path(tempfile.mkdtemp(prefix="package-controls-", dir=workspace))
        cls.repo = cls.folder / "repo"
        cls.repo.mkdir()
        scripts = cls.repo / "scripts"
        scripts.mkdir()
        (scripts / "verify_fonts.py").write_text("print('Fixture build precondition')\n", encoding="utf-8")
        (scripts / "build_pages.py").write_text(
            "import pathlib,sys\np=pathlib.Path(sys.argv[1]);p.mkdir()\n"
            "(p/'index.html').write_text('<!doctype html><title>Packaging fixture</title>',encoding='utf-8')\n"
            "(p/'asset.bin').write_bytes(b'fixture bytes'*200000)\n", encoding="utf-8")
        (cls.repo / "tracked.txt").write_text("Committed fixture\n", encoding="utf-8")
        cls.git("init", "--quiet")
        cls.git("add", ".")
        cls.git("-c", "user.name=Packaging fixture", "-c", "user.email=fixture@example.invalid", "commit", "--quiet", "-m", "Fixture source")
        cls.commit = cls.git("rev-parse", "HEAD").decode().strip()
        (cls.repo / ".env").write_text("Untracked fixture value; exclude from archive\n", encoding="utf-8")
        cls.evidence = cls.folder / "chosen-evidence"
        cls.evidence.mkdir()
        (cls.evidence / "results.json").write_text('{"fixture":true}\n', encoding="utf-8")
        (cls.evidence / "ignored.log").write_text("Do not include this log\n", encoding="utf-8")
        packager.ROOT = cls.repo
        cls.package = cls.folder / "accepted"
        cls.archive = packager.create(cls.package, cls.commit, [cls.evidence], None, None, None)

    @classmethod
    def tearDownClass(cls):
        packager.ROOT = cls.project
        print("Packaging control evidence:", cls.folder)

    @classmethod
    def git(cls, *args):
        return subprocess.check_output(["git", *args], cwd=cls.repo, stderr=subprocess.STDOUT)

    def verify(self):
        return subprocess.run([sys.executable, str(self.package / "verify_package.py")], cwd=self.folder,
                              capture_output=True, text=True)

    def test_01_committed_source_and_selected_evidence_only(self):
        self.assertEqual(self.verify().returncode, 0)
        with zipfile.ZipFile(self.package / "source.zip") as source:
            self.assertEqual(source.read("tracked.txt").decode().splitlines(), ["Committed fixture"])
            self.assertNotIn(".env", source.namelist())
        names = [file.relative_to(self.package).as_posix() for file in self.package.rglob("*") if file.is_file()]
        self.assertTrue(any(name.endswith("results.json") for name in names))
        self.assertFalse(any(name.endswith("ignored.log") for name in names))
        manifest = json.loads((self.package / "manifest.json").read_text(encoding="utf-8"))
        asset = next(item for item in manifest["files"] if item["path"] == "site/asset.bin")
        self.assertGreater(asset["bytes"], 2 * 1024 * 1024)
        self.assertEqual(asset["sha256"], sha256((self.package / "site/asset.bin").read_bytes()).hexdigest())

    def test_02_changed_file_rejected_and_restore_accepted(self):
        target = self.package / "site/index.html"
        original = target.read_bytes()
        try:
            target.write_bytes(original + b" changed")
            self.assertNotEqual(self.verify().returncode, 0)
        finally:
            target.write_bytes(original)
        self.assertEqual(self.verify().returncode, 0)

    def test_03_nested_manifest_is_an_unexpected_file(self):
        extra = self.package / "site/manifest.json"
        self.assertFalse(extra.exists())
        try:
            extra.write_text("{}", encoding="utf-8")
            self.assertNotEqual(self.verify().returncode, 0)
        finally:
            extra.unlink()
        self.assertEqual(self.verify().returncode, 0)

    def test_04_existing_package_cannot_be_overwritten(self):
        previous = packager.file_hash(self.archive)
        with self.assertRaises(ValueError):
            packager.create(self.package, self.commit, [], None, None, None)
        self.assertEqual(packager.file_hash(self.archive), previous)

    def test_05_credential_shaped_evidence_rejects_the_zip(self):
        evidence = self.folder / "rejected-evidence"
        evidence.mkdir()
        marker = "-----BEGIN " + "PRIVATE KEY-----"
        (evidence / "sample.json").write_text(json.dumps(marker), encoding="utf-8")
        target = self.folder / "rejected-package"
        with self.assertRaises(ValueError):
            packager.create(target, self.commit, [evidence], None, None, None)
        self.assertFalse(target.with_suffix(".zip").exists())

    def test_06_unsafe_outputs_and_windows_path_aliases_rejected(self):
        for target in [self.repo, self.repo.parent]:
            with self.assertRaises(ValueError):
                packager.create(target, self.commit, [], None, None, None)
        for name in ["../outside.txt", "/absolute.txt", ".ENV", "nested/.ENV.local", "nested\\.env", "C:/private.txt", "file:stream"]:
            with self.subTest(path=name), self.assertRaises(ValueError):
                packager.allowed(name, b"fixture")


if __name__ == "__main__":
    program = unittest.main(verbosity=2, exit=False)
    result = program.result
    report = {"fixture": "New local Git repository and small synthetic build; does not certify the real product build",
              "testsRun": result.testsRun, "successful": result.wasSuccessful(),
              "failures": [str(test) for test, _ in result.failures], "errors": [str(test) for test, _ in result.errors]}
    if getattr(PortableTests, "folder", None):
        (PortableTests.folder / "results.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    raise SystemExit(0 if result.wasSuccessful() else 1)
