# ESPuino Flash Tool

A browser-based USB flasher for [ESPuino](https://github.com/biologist79/ESPuino), the
ESP32-based RFID audio player.

It is meant as a **lifeline / emergency tool**: it lets you flash an ESPuino over USB
straight from your browser, without installing Visual Studio Code or PlatformIO. That
matters when an ESP32 has no working firmware yet (or a broken one) — then ESPuino's own
Wi-Fi web interface, which can update firmware over the air, isn't reachable. This tool
covers the other case: **first flash and recovery over USB.**

## What it does

- **Flash firmware over USB** (via [esptool-js](https://github.com/espressif/esptool-js) /
  Web Serial):
  - **Update app only** — fast; for a device that already runs ESPuino or was shipped
    pre-flashed.
  - **Full flash / recovery** — for a blank/new ESP32, after an erase, or when nothing
    boots anymore.
  - **Custom firmware** — flash your own PlatformIO build (bootloader / partitions /
    boot_app0 / app with editable offsets).
- **Erase** the entire flash for recovery.
- **Serial console** (read-only) — watch the boot/log output; it opens automatically after
  a flash and restarts the device so the boot log appears.
- Choose **branch** (master/dev), **platform**, **language** (DE / EN / FR, defaulting to
  your browser language) and a specific **build** (the last 10, each linking to the ESPuino
  commit it was built from).

Firmware is pulled live from the
[ESPuino-Firmware](https://github.com/biologist79/ESPuino-Firmware) repository; the tool
itself is fully self-contained (esptool-js is vendored, no runtime CDN dependency).

## Requirements

- A **Chromium-based desktop browser** — Chrome, Edge, Opera, Brave, Vivaldi. Web Serial is
  **not** available in Firefox, Safari, or on any phone/tablet.
- An ESP32-based ESPuino connected via USB.

## Usage

1. Open the tool in Chrome or Edge on a computer.
2. Connect your ESP32 via USB.
3. Pick branch / platform / language (and, if you want, a specific build).
4. Click an action (e.g. **Full flash / recovery**) and select the serial port when asked.
5. Watch it flash; the serial console opens automatically so you can see it boot.

If flashing aborts with a cheap USB-serial adapter (e.g. a CH340), lower the **USB speed**
and try again (115200 is the safest).

## Development

This is a static site — no build step. Serve it locally and open it in Chrome/Edge:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

esptool-js and its dependencies are vendored under `vendor/esptool-js/` and refreshed with
`vendor/esptool-js/update.py` (see that folder's README). The generic `boot_app0.bin` lives
in `static_binaries/`.

## License

[GPL-3.0](LICENSE), matching ESPuino.
