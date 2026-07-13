// Read-only serial console (boot/log output). Never sends anything to the device.

export class SerialConsole {
  constructor({ onData, onOpen, onClose } = {}) {
    this.onData = onData || (() => {});
    this.onOpen = onOpen || (() => {});
    this.onClose = onClose || (() => {});
    this.port = null;
    this.reader = null;
    this.keepReading = false;
  }

  get isOpen() {
    return this.keepReading;
  }

  // port: optional already-chosen SerialPort (reused after flashing).
  async open(baud, port) {
    if (port) this.port = port;
    if (!this.port) this.port = await navigator.serial.requestPort();
    // Make sure the port is closed before we reopen it at a new baud rate.
    try {
      if (this.port.readable) await this.port.close();
    } catch (e) {
      // was not open
    }
    await this.port.open({ baudRate: baud });
    this.keepReading = true;
    this.onOpen();
    this._readLoop();
    // Reboot the device so its one-shot boot log streams into the (already running)
    // reader. Without this, opening the console after a flash shows nothing, because the
    // boot output was emitted while the port was closed.
    await this._resetDevice();
  }

  // Pulse the reset line (DTR/RTS) to restart the ESP32 into run mode. This mirrors
  // esptool-js's HardReset sequence. It only toggles hardware control lines — no data is
  // sent to the device, so the console stays read-only.
  async _resetDevice() {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let dtr = false;
    const setDTR = async (v) => {
      dtr = v;
      await this.port.setSignals({ dataTerminalReady: v });
    };
    const setRTS = async (v) => {
      await this.port.setSignals({ requestToSend: v });
      // Re-assert DTR: on some platforms toggling RTS also flips DTR.
      await this.port.setSignals({ dataTerminalReady: dtr });
    };
    try {
      // Pulse EN (via RTS) while keeping IO0 (via DTR) HIGH, so the chip boots into
      // RUN mode — NOT download mode. (Asserting DTR here would pull IO0 low and land
      // the device in "waiting for download".)
      await setDTR(false); // IO0 high
      await setRTS(true); // EN low (reset asserted)
      await sleep(100);
      await setRTS(false); // EN high -> boot into run mode
    } catch (e) {
      // setSignals may be unsupported — the console still works passively.
    }
  }

  async _readLoop() {
    const decoder = new TextDecoder();
    while (this.port && this.port.readable && this.keepReading) {
      this.reader = this.port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) this.onData(decoder.decode(value));
        }
      } catch (e) {
        this.onData(`\n[Connection lost: ${e.message}]\n`);
      } finally {
        try {
          this.reader.releaseLock();
        } catch (e) {
          // ignore
        }
      }
    }
  }

  async close() {
    this.keepReading = false;
    try {
      if (this.reader) await this.reader.cancel();
    } catch (e) {
      // ignore
    }
    try {
      if (this.port) await this.port.close();
    } catch (e) {
      // ignore
    }
    this.onClose();
  }
}
