# ESPuino Firmware Tool — Specification

A browser-based USB flashing tool for ESPuino. Static website, hosted on GitHub Pages, no
backend. It serves as a **lifeline**: for beginners whose ESP32 has no firmware (or a broken
one), so the Wi-Fi web interface is unreachable and who don't want to set up a VSCode +
PlatformIO environment.

> Scope: ESPuino's **web interface** can already flash firmware itself, but only via the
> `/update` OTA endpoint — i.e. the device must already be running ESPuino on Wi-Fi. This
> tool covers the other case: **first flash and recovery over USB.**

## 1. Goals & non-goals

**Goals**

- Flash firmware over USB (esptool-js over Web Serial)
- Serial console (read-only) for the boot/log output
- Flash erase for problem cases
- Selection of branch, platform, language and build
- Safely "guide" users so they don't do the wrong thing

**Non-goals**

- No backend / no server
- No sending commands to ESPuino from the console
- No OTA update (the web interface does that)
- No build/compile function (custom builds still need VSCode + PlatformIO)

## 2. Hosting & technology

- **GitHub Pages** from this repo (`ESPuino-Firmware-Tool`), served over HTTPS.
- Purely static: HTML + hand-written CSS + vanilla JS. **No Bootstrap.**
- **esptool-js** for flash, erase and chip detection; Web Serial for the log console. Runs
  entirely client-side in the browser (Chrome/Edge; Web Serial required). esptool-js is
  vendored locally (no runtime CDN dependency).
- Icons as **inline SVG** (no Font Awesome dependency).

## 3. Firmware source

Repo: **`biologist79/ESPuino-Firmware`**

```
Firmwares/<branch>/<platform>/firmware-<LANG>.bin
```

- `<branch>`: `master`, `dev`
- `<platform>`: `complete`, `lolin_d32_pro`, `lolin_d32_pro_sdmmc_pe`
- `<LANG>`: `DE`, `EN`, `FR` — the language is in the **filename**, not in subfolders.

**Important:** these `firmware-<LANG>.bin` are **app-only images** (ESP magic `0xE9` at
offset `0x0`, ~3.36 MB), intended for the OTA `/update` endpoint. They contain **neither the
bootloader nor the partition table** (verified by byte inspection).

Files are addressed by a **git ref** (a build commit sha, or `main` for the latest), so a
specific build can be flashed. Manifests are built **dynamically at runtime** from a fixed
naming scheme + offsets (variant A2).

## 4. Flash modes

Because the repo binaries are app-only, there are two modes:

### Mode A — "Update app only" (default, fast)

- Flashes `firmware-<LANG>.bin` @ `0x10000` (ota_0) **plus `boot_app0.bin` @ otadata (`0x9000`)**.
- Works **only** if the bootloader + partition table are already on the chip (a
  pre-flashed/shipped device, or one that has run ESPuino before).
- **Why `boot_app0` here too:** ESPuino writes OTA updates to the inactive slot and flips
  the selection; `otadata` may therefore point at `ota_1`. Without resetting the OTA
  selection the device would keep booting the **old** app in `ota_1` after the app flash.
  `boot_app0` deterministically selects `ota_0` (where we flash) → the update reliably takes.
- Source: app live from the firmware repo, `boot_app0` static from this repo.

### Mode B — "Full flash / recovery"

- Flashes the **complete set**:

  | File                  | Offset ESP32 | Offset ESP32-S3 | Source                                    |
  |-----------------------|--------------|-----------------|-------------------------------------------|
  | `bootloader.bin`      | `0x1000`     | `0x0`           | firmware repo (pipeline)                  |
  | `partitions.bin`      | `0x8000`     | `0x8000`        | firmware repo (pipeline)                  |
  | `boot_app0.bin`       | `0x9000`     | `0x9000`        | static: `static_binaries/boot_app0.bin`   |
  | `firmware-<LANG>.bin` | `0x10000`    | `0x10000`       | live from firmware repo                   |

- Needed for: a blank/new chip, after an erase, or when the device no longer boots.

> **Offsets come from the partition table, not from convention.** ESPuino's
> `custom_16mb_ota.csv` puts `otadata` at **`0x9000`** (not the Arduino default `0xe000`)
> and `app0` (ota_0) at `0x10000`. The flasher **parses the fetched `partitions.bin` at
> runtime** and derives the offsets for `boot_app0.bin` (→ `otadata`) and
> `firmware-<LANG>.bin` (→ `ota_0`) from it. This is robust against future CSV changes.
> Only the bootloader offset is chip-dependent (ESP32 `0x1000`, ESP32-S3 `0x0`); the
> partition table itself is conventionally at `0x8000`.

### Origin of the full-flash set (variant 2)

So that the bootloader/partition table **always match the app** (the IDF version moves every
few weeks/months), the **firmware build pipeline** ships them — from the same build as the
app, so they are guaranteed consistent, no drift.

- `bootloader.bin` + `partitions.bin`: from `.pio/build/<env>/`, placed per platform build
  into `Firmwares/<branch>/<platform>/`. Language-independent → copied once per build.
- `boot_app0.bin`: generic/version-independent (only the initial OTA selection), lives in
  the framework package, not in `.pio/build/`. Stored **once, statically**, at
  `static_binaries/boot_app0.bin` (8192 B; sector 0 selects slot `ota_0` via `ota_seq=1`).

**Pipeline change** (`.github/workflows/firmware-builds.yml`, DE build step): two extra `cp`
lines after `platformio run`:

```yaml
cp .pio/build/${{ matrix.variant }}/bootloader.bin binaries/bootloader.bin
cp .pio/build/${{ matrix.variant }}/partitions.bin binaries/partitions.bin
```

`upload-artifact` and the commit job carry them along automatically. On the first run, check
that the files are really named `bootloader.bin` / `partitions.bin` (not e.g.
`bootloader_dio_40m.bin`).

## 5. Custom firmware (advanced)

- Upload the components from `.pio/build/<env>/`: `bootloader.bin`, `partitions.bin`,
  `boot_app0.bin`, `firmware.bin`.
- Offsets are **pre-filled per detected chip** (see the table in §4) and stay editable.
- The partition table is **always flashed too** → self-consistent, no layout guessing.
- Clear note in the UI: a custom flash overwrites the partition table; NVS/stored data is
  lost.

## 6. Erase flash

- Available to all users.
- Erases the **entire** flash including the bootloader + partition table (and all ESPuino
  settings).
- **Chaining:** after the erase the tool actively steers to Mode B ("the chip is now empty,
  please do a full flash"), so nobody is left with a bricked device.
- Confirmation dialog with a clear data-loss warning.

## 7. Language & build selection

- UI languages: **DE / EN / FR**. Default = browser language (fallback EN).
- The chosen language **also** determines the firmware to flash (`firmware-<LANG>.bin`).
- Switchable; separate from the chip/platform selection.
- **Build selection** (like the ESPuino web interface): the last up to **10 builds** for the
  chosen branch/platform are listed (by date) and selectable. Flashing pulls all files from
  that build's firmware-repo commit, so the set is consistent. Each build shows a link to the
  **ESPuino source commit** it was built from (parsed from the build message
  `...built from commit ESPuino@<sha>`), with the commit message shown as a hover tooltip
  (best-effort, skipped on GitHub rate limits).

## 8. Serial console

- **Read-only**: shows the ESP32's boot/log output after flashing. Never sends to the device.
- On connect it pulses the reset line (DTR/RTS) so the device reboots into run mode and its
  one-shot boot log is captured.
- Opens and connects **automatically** after a successful flash.
- Baud rate 115200; auto-scrolling view.

## 9. UX & guardrails

- **Plain-language mode choice** instead of jargon: "Update app only" (recommended) vs.
  "Full flash / recovery".
- **Chip check:** esptool-js detects the connected chip; if it doesn't match the chosen
  platform's family (e.g. ESP32-S3 vs. ESP32) → **block + warn**. Matching is by family, so
  base-ESP32 variants (e.g. `ESP32-D0WD-V3`) pass.
- **Erase → full-flash chaining** (see §6).
- **Single shared serial port**, picked once and reused across flash/erase/console; the
  console is auto-closed before a flash so esptool can take the port.
- **USB speed selectable** (default 460800; 115200 is safest for cheap CH340 adapters).
- All platforms are shown directly in the dropdown (only three today, all fully supported).
- Clear error messages (port not selectable, connection lost, wrong chip, GitHub rate limit …).

## 10. Look & feel (ESPuino style)

Modeled on the ESPuino web interface, but without its ballast:

- **Navbar:** blue bar (`#0d6efd`, as a CSS variable), the E32 chip logo on the left
  (`assets/logo.webp`, ~35 px) + the title **"ESPuino Firmware Tool"** in white.
- **Buttons:** solid blue (primary action) / blue outline (secondary), modeled on ESPuino.
- **Icons:** the few needed ones as inline SVG.
- **Dropped:** the heartbeat indicator (top right) and the tab bar (the tool is
  single-purpose).
- Logo asset taken from ESPuino `html/vendor/branding/`.

## 11. Status

- [x] Firmware pipeline (`firmware-builds.yml`) extended with the two `cp` lines so
      `bootloader.bin` + `partitions.bin` ship per platform (variant 2).
- [x] `boot_app0.bin` stored statically → `static_binaries/boot_app0.bin` (verified).
- [x] Logo taken from `html/vendor/branding/` → `assets/logo.webp` + `assets/favicon.ico`.
- [x] Theme blue nailed down → stock Bootstrap primary **`#0d6efd`**.
- [x] Per-language builds: fixed a pipeline bug (a leading tab made the `LANGUAGE` `sed` a
      no-op, so all languages were identical) — DE/EN/FR now build differently.
- ESP32-S3 is **not planned for now** (no S3 builds in the firmware repo). The flasher only
  serves the ESP32 platforms; the chip-mismatch warning stays active in case someone
  accidentally connects an S3.
