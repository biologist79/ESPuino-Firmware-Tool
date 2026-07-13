// Wraps esptool-js: connect, detect chip, flash, erase.

import { ESPLoader, Transport } from "../vendor/esptool-js/esptool.js";
import { DEFAULT_FLASH_BAUD } from "./config.js";

export class Flasher {
  constructor({ onLog, baud, port } = {}) {
    this.onLog = onLog || (() => {});
    this.baud = baud || DEFAULT_FLASH_BAUD;
    this.port = port || null;
    this.transport = null;
    this.esploader = null;
    this.chipName = null;
  }

  // Minimal terminal interface expected by esptool-js.
  get _terminal() {
    return {
      clean: () => {},
      writeLine: (d) => this.onLog(d + "\n"),
      write: (d) => this.onLog(d),
    };
  }

  async requestPort() {
    this.port = await navigator.serial.requestPort();
    return this.port;
  }

  // Connects and returns the detected chip name (e.g. "ESP32").
  async connect() {
    if (!this.port) await this.requestPort();
    // 2nd arg is `tracing` — keep it OFF; when enabled it appends every byte to an
    // ever-growing in-memory log, which stalls long writes and can corrupt them.
    this.transport = new Transport(this.port);
    this.esploader = new ESPLoader({
      transport: this.transport,
      baudrate: this.baud,
      romBaudrate: 115200,
      terminal: this._terminal,
    });
    const ret = await this.esploader.main();
    this.chipName =
      (typeof ret === "string" && ret) ||
      (this.esploader.chip && this.esploader.chip.CHIP_NAME) ||
      "unknown";
    return this.chipName;
  }

  // fileArray: [{ data: Uint8Array, address: Number }]
  // esptool-js 0.6.0+ requires each data entry to be a Uint8Array (not a binary string);
  // passing a binary string corrupts large compressed writes (issue #233).
  async flash(fileArray, onProgress) {
    const files = fileArray.map((f) => ({ data: f.data, address: f.address }));
    await this.esploader.writeFlash({
      fileArray: files,
      flashSize: "keep",
      flashMode: "keep",
      flashFreq: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (idx, written, total) => {
        if (onProgress) onProgress(idx, written, total);
      },
    });
  }

  async erase() {
    await this.esploader.eraseFlash();
  }

  async reset() {
    try {
      await this.esploader.hardReset();
    } catch (e) {
      // reset is best-effort
    }
  }

  // Releases (closes) the port so the console can open it afterwards.
  async release() {
    try {
      if (this.transport) await this.transport.disconnect();
    } catch (e) {
      // ignore
    }
    this.transport = null;
    this.esploader = null;
  }
}
