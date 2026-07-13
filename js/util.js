// Small helpers.

export async function fetchBinary(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status} while loading ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function fileToUint8(file) {
  return new Uint8Array(await file.arrayBuffer());
}

export function fmtBytes(n) {
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
}

export function hex(n) {
  return "0x" + n.toString(16);
}

export function webSerialSupported() {
  return typeof navigator !== "undefined" && "serial" in navigator;
}
