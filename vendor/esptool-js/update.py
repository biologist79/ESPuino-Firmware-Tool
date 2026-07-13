#!/usr/bin/env python3
"""Vendor esptool-js (and everything it imports) for offline use.

esptool-js ships as split ES modules: the main bundle statically imports its deps
(pako, atob-lite) and dynamically imports per-chip target classes + stub-flasher JSON
at runtime. jsDelivr's +esm build references all of these via absolute /npm/... URLs,
which break when self-hosted.

This script:
  1. downloads the main +esm bundle unchanged (its /npm/... imports are kept as-is),
  2. crawls and mirrors the ENTIRE referenced module graph (static deps AND dynamic
     chip modules) under _npm/, saved with a .js extension so static hosts serve the
     correct MIME type,
  3. writes an import map into ../../index.html that maps every /npm/... specifier to
     its mirrored local file.

Because every /npm/ import is remapped, nothing in esptool.js is rewritten and no
dependency version is hard-coded here — bump ESPTOOL_VER and re-run.

Usage:  python3 update.py

Note: esptool-js 0.6.0 introduced a breaking change — writeFlash's fileArray[].data must
be a Uint8Array (older versions took a "binary string"). Passing a binary string to 0.6.0
corrupts large compressed writes ("Failed to write compressed data ... status 201,0",
issue #233). flasher.js therefore passes Uint8Array. 0.5.7 additionally failed to connect
to some CH340 adapters, so we stay on 0.6.0.
"""
import os
import re
import json
import urllib.request

ESPTOOL_VER = "0.6.0"

CDN = "https://cdn.jsdelivr.net"
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))
INDEX = os.path.join(REPO, "index.html")
MIRROR = os.path.join(HERE, "_npm")
SPEC_RE = re.compile(r"/npm/[A-Za-z0-9@._/-]+/\+esm")


def get(url):
    return urllib.request.urlopen(url, timeout=60).read()


def local_for(spec):
    # "/npm/<pkg>/.../esp32.js/+esm"             -> "_npm/<pkg>/.../esp32.js"
    # "/npm/<pkg>/.../stub_flasher_32.json/+esm" -> "_npm/<pkg>/.../stub_flasher_32.js"
    # "/npm/pako@2.1.0/+esm"                      -> "_npm/pako@2.1.0.js"
    # Normalize to a single .js extension so static hosts serve the correct MIME type.
    rel = spec[len("/npm/"):-len("/+esm")]
    if rel.endswith(".js"):
        pass
    elif rel.endswith(".json"):
        rel = rel[: -len(".json")] + ".js"
    else:
        rel = rel + ".js"
    return os.path.join(MIRROR, rel)


# 1) main bundle (kept unchanged; all its /npm/ imports are remapped below)
esptool = get(f"{CDN}/npm/esptool-js@{ESPTOOL_VER}/+esm").decode("utf-8")
open(os.path.join(HERE, "esptool.js"), "w", encoding="utf-8").write(esptool)

# 2) crawl + mirror the entire referenced module graph
seen, mapping = set(), {}
queue = list(dict.fromkeys(SPEC_RE.findall(esptool)))
while queue:
    spec = queue.pop()
    if spec in seen:
        continue
    seen.add(spec)
    data = get(CDN + spec)
    path = local_for(spec)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "wb").write(data)
    mapping[spec] = "./" + os.path.relpath(path, REPO).replace(os.sep, "/")
    for m in SPEC_RE.findall(data.decode("utf-8", "replace")):
        if m not in seen:
            queue.append(m)
print(f"mirrored {len(mapping)} modules")

# 3) inject the import map into index.html
imap = {"imports": dict(sorted(mapping.items()))}
tag = '<script type="importmap">\n' + json.dumps(imap, indent=6) + "\n    </script>"
html = open(INDEX, encoding="utf-8").read()
if 'type="importmap"' in html:
    html = re.sub(r'<script type="importmap">.*?</script>', tag, html, flags=re.S)
else:
    marker = '<link rel="stylesheet" href="css/style.css" />'
    html = html.replace(marker, tag + "\n    " + marker)
open(INDEX, "w", encoding="utf-8").write(html)
print("import map written to index.html")
