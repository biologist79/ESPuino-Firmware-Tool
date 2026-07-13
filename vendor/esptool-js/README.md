# Vendored: esptool-js

A local copy of [esptool-js](https://github.com/espressif/esptool-js) so the tool
works without an external CDN dependency (offline-capable — it is meant as a "lifeline").

- **esptool.js** — `esptool-js@0.6.0` (unmodified ESM bundle from jsDelivr). Exports
  `ESPLoader`, `Transport`.
- **_npm/** — every module the bundle imports, mirrored locally: its static deps
  (`pako`, `atob-lite`) **and** the modules it loads **dynamically at runtime** (per-chip
  target classes + stub-flasher JSONs). jsDelivr's `+esm` build references all of these via
  absolute `/npm/...` URLs; self-hosting them breaks unless remapped. They are mirrored here
  with a `.js` extension (so static hosts serve the correct MIME type) and wired up by an
  **import map** in `../../index.html` that maps each `/npm/...` specifier to its local file.

> **Breaking change in 0.6.0:** `writeFlash`'s `fileArray[].data` must be a **`Uint8Array`**
> (older releases accepted a "binary string"). Passing a binary string to 0.6.0 corrupts
> large compressed writes (*"Failed to write compressed data to flash … status 201,0"*,
> esptool-js issue #233), so `flasher.js` passes `Uint8Array`. We stay on 0.6.0 because 0.5.7
> failed to connect to some CH340 adapters.

Do not hand-edit `esptool.js`, `_npm/`, or the import map in `index.html` — they are generated
by `update.py`.

## Licenses

Each bundled dependency keeps its upstream license text in this folder:

| Library    | Version | License    | Text                                             |
| ---------- | ------- | ---------- | ------------------------------------------------ |
| esptool-js | 0.6.0   | Apache-2.0 | [LICENSE-esptool-js.txt](LICENSE-esptool-js.txt) |
| pako       | 2.1.0   | MIT        | [LICENSE-pako.txt](LICENSE-pako.txt)             |
| atob-lite  | 2.0.0   | MIT        | [LICENSE-atob-lite.txt](LICENSE-atob-lite.txt)   |

## Updating

Bump `ESPTOOL_VER` at the top of [`update.py`](update.py), then run it. It downloads the
bundle, mirrors the entire referenced module graph (deps + dynamic chip modules) into
`_npm/`, and rewrites the import map in `index.html`:

```sh
python3 update.py
```
