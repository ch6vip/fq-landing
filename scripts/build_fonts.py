#!/usr/bin/env python3
"""Build web fonts for the single-page landing page.

Subsets Noto Serif SC Regular (used for the serif mode inside the interactive
reader playground) and Roboto Mono Medium (used for version tags, filenames,
and numbers) into assets/fonts/.

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

SAFETY = (
    "，。、；：？！“”‘’（）《》〈〉【】—…·￥ %+×÷=<>@#&*_|/\\[]{}-."
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
)

JOBS = [
    ("NotoSerifSC-Regular.otf", "NotoSerifSC-Regular-subset.woff2"),
    ("RobotoMono-Medium.ttf", "RobotoMono-Medium.woff2"),
]


def main() -> int:
    if not SRC.exists():
        print(f"source font dir not found: {SRC}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    reader = re.search(r'<p class="demo-text"[^>]*>(.*?)</p>', page, flags=re.S)
    if not reader:
        print("reader sample not found in index.html", file=sys.stderr)
        return 1
    reader_chars = "".join(sorted(set(html.unescape(reader.group(1))) | set(SAFETY)))
    mono_chars = "".join(sorted(set(SAFETY)))

    with tempfile.TemporaryDirectory() as temp_dir:
        text_file = Path(temp_dir) / "characters.txt"
        for source, target in JOBS:
            src = SRC / source
            if not src.exists():
                print(f"missing: {src}", file=sys.stderr)
                return 1
            selected = reader_chars if source == "NotoSerifSC-Regular.otf" else mono_chars
            text_file.write_text(selected, encoding="utf-8")
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
            print(f"{target}: {len(selected)} characters, {size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
