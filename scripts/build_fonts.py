#!/usr/bin/env python3
"""Build web fonts for the landing page.

Subsets Noto Serif SC (the app's serif) and Roboto Mono down to the
characters actually used by index.html and assets/js/main.js, then
writes woff2 files into assets/fonts/.

Usage:
    python scripts/build_fonts.py

Requires: fonttools, brotli. Sources are read from the sibling fqapp
repository (../fqapp/assets/fonts); adjust SRC if the layout differs.
"""
from __future__ import annotations

import html
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "fqapp" / "assets" / "fonts"
OUT = ROOT / "assets" / "fonts"

# Extra characters that may be injected at runtime or added in edits.
SAFETY = (
    "，。、；：？！“”‘’（）《》〈〉【】—…·￥ %+×÷=<>@#&*_|/\\[]{}"
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
)

JOBS = [
    ("NotoSerifSC-Regular.otf", "NotoSerifSC-Regular-subset.woff2", True),
    ("NotoSerifSC-Bold.otf", "NotoSerifSC-Bold-subset.woff2", True),
    ("RobotoMono-Medium.ttf", "RobotoMono-Medium.woff2", False),
]


def used_characters() -> str:
    chunks = []
    for path in (ROOT / "index.html", ROOT / "assets" / "js" / "main.js"):
        chunks.append(path.read_text(encoding="utf-8"))
    text = "\n".join(chunks)
    text = re.sub(r"<script.*?</script>", " ", text, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    chars = set(text) | set(SAFETY)
    return "".join(sorted(chars))


def main() -> int:
    if not SRC.exists():
        print(f"source font dir not found: {SRC}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    chars = used_characters()
    print(f"subsetting to {len(chars)} characters")

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as fh:
        fh.write(chars)
        text_file = fh.name

    for source, target, is_cjk in JOBS:
        src = SRC / source
        if not src.exists():
            print(f"missing: {src}", file=sys.stderr)
            return 1
        cmd = [
            sys.executable, "-m", "fontTools.subset", str(src),
            f"--text-file={text_file}",
            "--flavor=woff2",
            f"--output-file={OUT / target}",
            "--no-hinting",
            "--desubroutinize",
            "--layout-features=*",
            "--name-IDs=1,2,3,4,5,6",
        ]
        subprocess.run(cmd, check=True)
        size = (OUT / target).stat().st_size
        print(f"{target}: {size / 1024:.0f} KB")

    Path(text_file).unlink(missing_ok=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
