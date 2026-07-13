// Parser for the ESP32 partition table (partitions.bin).
// Each partition is a 32-byte entry starting with magic 0xAA 0x50.

const MAGIC0 = 0xaa;
const MAGIC1 = 0x50;
const MD5_MAGIC0 = 0xeb; // end / MD5 marker
const MD5_MAGIC1 = 0xeb;

export const TYPE_APP = 0x00;
export const TYPE_DATA = 0x01;
export const SUBTYPE_OTA = 0x00; // for TYPE_DATA: otadata
export const SUBTYPE_FACTORY = 0x00; // for TYPE_APP
export const SUBTYPE_OTA_0 = 0x10; // for TYPE_APP

export function parsePartitionTable(bytes) {
  const parts = [];
  for (let i = 0; i + 32 <= bytes.length; i += 32) {
    if (bytes[i] === MD5_MAGIC0 && bytes[i + 1] === MD5_MAGIC1) break;
    if (bytes[i] !== MAGIC0 || bytes[i + 1] !== MAGIC1) continue;
    const type = bytes[i + 2];
    const subtype = bytes[i + 3];
    const dv = new DataView(bytes.buffer, bytes.byteOffset + i + 4, 8);
    const offset = dv.getUint32(0, true);
    const size = dv.getUint32(4, true);
    let label = "";
    for (let j = i + 12; j < i + 28; j++) {
      if (bytes[j] === 0) break;
      label += String.fromCharCode(bytes[j]);
    }
    parts.push({ type, subtype, offset, size, label });
  }
  return parts;
}

// Offset of the otadata partition (this is where boot_app0.bin goes).
export function findOtadataOffset(parts) {
  const p = parts.find((x) => x.type === TYPE_DATA && x.subtype === SUBTYPE_OTA);
  return p ? p.offset : null;
}

// Offset of the first app slot (ota_0 or factory) — this is where the app goes.
export function findAppOffset(parts) {
  const ota0 = parts.find((x) => x.type === TYPE_APP && x.subtype === SUBTYPE_OTA_0);
  if (ota0) return ota0.offset;
  const factory = parts.find((x) => x.type === TYPE_APP && x.subtype === SUBTYPE_FACTORY);
  return factory ? factory.offset : null;
}
