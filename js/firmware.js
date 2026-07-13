// Loading the firmware files from the ESPuino-Firmware repo (dynamic, variant A2).

import {
  firmwareUrl,
  bootloaderUrl,
  partitionsUrl,
  BOOT_APP0_PATH,
  FIRMWARE_API_BASE,
  SOURCE_API_BASE,
  MAX_BUILDS,
} from "./config.js";
import { fetchBinary } from "./util.js";

// `ref` = a firmware-repo build commit sha (or "main" for the latest).
export function loadApp(ref, branch, platform, lang) {
  return fetchBinary(firmwareUrl(ref, branch, platform, lang));
}
export function loadBootloader(ref, branch, platform) {
  return fetchBinary(bootloaderUrl(ref, branch, platform));
}
export function loadPartitions(ref, branch, platform) {
  return fetchBinary(partitionsUrl(ref, branch, platform));
}
export function loadBootApp0() {
  return fetchBinary(BOOT_APP0_PATH);
}

// Up to MAX_BUILDS recent builds for a platform, newest first. Each entry carries the
// firmware-repo commit sha (used to fetch that exact build), its date, and the ESPuino
// source commit sha parsed from the build message ("...built from commit ESPuino@<sha>").
export async function fetchBuilds(branch, platform) {
  const path = `Firmwares/${branch}/${platform}`;
  const url = `${FIRMWARE_API_BASE}/commits?path=${encodeURIComponent(
    path
  )}&per_page=${MAX_BUILDS}&sha=main`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const commits = await res.json();
  return commits.map((c) => {
    const m = /ESPuino@([0-9a-f]{7,40})/.exec(c.commit.message || "");
    const author = c.commit.author || c.commit.committer || {};
    return { fwSha: c.sha, date: author.date || null, sourceSha: m ? m[1] : null };
  });
}

// The ESPuino source commit's message, for the hover tooltip (best-effort; may be
// skipped silently on a GitHub rate limit).
export async function fetchCommitMessage(sourceSha) {
  try {
    const res = await fetch(`${SOURCE_API_BASE}/commits/${sourceSha}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.commit ? data.commit.message : null;
  } catch (e) {
    return null;
  }
}
