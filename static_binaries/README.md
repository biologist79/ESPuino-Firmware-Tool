# Static binaries

## boot_app0.bin

Initial content of the `otadata` partition. It resets the OTA selection so the bootloader
boots the first app slot (`ota_0`). The tool writes it in every mode so a freshly
flashed app reliably takes effect (see `SPEC.md`).

- **Source:** Espressif [arduino-esp32](https://github.com/espressif/arduino-esp32),
  `tools/partitions/boot_app0.bin`.
- **License:** LGPL-2.1-or-later (see the arduino-esp32 repository).
- Generic and version-independent — identical across ESP32 variants and framework versions.
- Size: 8192 bytes (`0x2000`, two flash sectors).
