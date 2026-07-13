// Central configuration for the ESPuino Flash Tool.

// Source of the ready-built firmwares (separate repo). Files are addressed by a git ref
// (a build commit sha, or "main" for the latest) so a specific build can be flashed.
export const FIRMWARE_RAW_ROOT =
  "https://raw.githubusercontent.com/biologist79/ESPuino-Firmware";
export const FIRMWARE_API_BASE =
  "https://api.github.com/repos/biologist79/ESPuino-Firmware";
// The ESPuino source repo the firmware was built from (for the per-build commit link).
export const SOURCE_COMMIT_URL = "https://github.com/biologist79/ESPuino/commit/";
export const SOURCE_API_BASE = "https://api.github.com/repos/biologist79/ESPuino";
export const MAX_BUILDS = 10;

// ESPuino branches that firmwares are built from.
export const BRANCHES = [
  { id: "master", label: "master (stable)" },
  { id: "dev", label: "dev (development)" },
];
export const DEFAULT_BRANCH = "master";

// Platforms (folder names in the firmware repo). Focus boards first.
export const PLATFORMS = [
  { id: "complete", label: "ESPuino Complete", chip: "ESP32" },
  {
    id: "lolin_d32_pro_sdmmc_pe",
    label: "Lolin D32 pro (SD-MMC, port expander)",
    chip: "ESP32",
  },
  { id: "lolin_d32_pro", label: "Lolin D32 pro", chip: "ESP32" },
];
export const DEFAULT_PLATFORM = "complete";

// Firmware languages (encoded in the filename: firmware-<LANG>.bin).
export const LANGUAGES = ["DE", "EN", "FR"];

// Static asset in this repo (generic, version-independent).
export const BOOT_APP0_PATH = "./static_binaries/boot_app0.bin";

// Flash offsets. The bootloader offset is chip-dependent; otadata/app offsets are
// derived at runtime from the parsed partitions.bin (fallbacks defined here).
export const BOOTLOADER_OFFSET = { ESP32: 0x1000, "ESP32-S3": 0x0, "ESP32-S2": 0x1000, "ESP32-C3": 0x0 };
export const PARTITIONS_OFFSET = 0x8000;
export const FALLBACK_OTADATA_OFFSET = 0x9000;
export const FALLBACK_APP_OFFSET = 0x10000;

// Flash baud rate the stub switches up to. Selectable, because cheap USB-serial
// adapters (e.g. CH340) are unreliable at high rates. 115200 = no upshift (safest).
export const FLASH_BAUD_OPTIONS = [921600, 460800, 230400, 115200];
export const DEFAULT_FLASH_BAUD = 460800;
export const CONSOLE_BAUD = 115200;

// URL helpers for the firmware files. `ref` = build commit sha or "main".
export function firmwareUrl(ref, branch, platform, lang) {
  return `${FIRMWARE_RAW_ROOT}/${ref}/Firmwares/${branch}/${platform}/firmware-${lang}.bin`;
}
export function bootloaderUrl(ref, branch, platform) {
  return `${FIRMWARE_RAW_ROOT}/${ref}/Firmwares/${branch}/${platform}/bootloader.bin`;
}
export function partitionsUrl(ref, branch, platform) {
  return `${FIRMWARE_RAW_ROOT}/${ref}/Firmwares/${branch}/${platform}/partitions.bin`;
}
