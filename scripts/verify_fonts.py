"""Verify the vendored font copies; optionally restore the exact public originals."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen


def verify(download: bool = False) -> None:
    folder = Path(__file__).resolve().parents[1] / "assets" / "fonts"
    manifest = json.loads((folder / "sources.json").read_text(encoding="utf-8"))
    for item in manifest["files"]:
        target = (folder / item["file"]).resolve()
        if target.parent != folder.resolve():
            raise ValueError("The font manifest must name direct child files.")
        if download:
            url = urlparse(item["url"])
            if url.scheme != "https" or url.hostname not in {"fonts.gstatic.com", "raw.githubusercontent.com"}:
                raise ValueError("Unexpected font source.")
            with urlopen(item["url"], timeout=30) as response:
                data = response.read(2 * 1024 * 1024 + 1)
        else:
            data = target.read_bytes()
        if len(data) != item["bytes"] or sha256(data).hexdigest() != item["sha256"]:
            raise ValueError(f"Font source does not match the recorded copy: {item['file']}")
        if target.suffix == ".woff2" and data[:4] != b"wOF2":
            raise ValueError("Invalid WOFF2 signature.")
        if download:
            target.write_bytes(data)
    print(f"PASS {len(manifest['files'])} font binaries and license notices")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true", help="restore only files matching the pinned hashes")
    verify(parser.parse_args().download)
