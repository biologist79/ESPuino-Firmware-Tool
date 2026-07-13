// Orchestration: UI wiring, state, guardrails.

import {
  BRANCHES,
  DEFAULT_BRANCH,
  PLATFORMS,
  DEFAULT_PLATFORM,
  BOOTLOADER_OFFSET,
  PARTITIONS_OFFSET,
  FALLBACK_OTADATA_OFFSET,
  FALLBACK_APP_OFFSET,
  CONSOLE_BAUD,
  FLASH_BAUD_OPTIONS,
  DEFAULT_FLASH_BAUD,
  SOURCE_COMMIT_URL,
} from "./config.js";
import { t, setLang, getLang, detectLang, applyTranslations } from "./i18n.js";
import { webSerialSupported, fileToUint8 } from "./util.js";
import {
  loadApp,
  loadBootloader,
  loadPartitions,
  loadBootApp0,
  fetchBuilds,
  fetchCommitMessage,
} from "./firmware.js";
import { parsePartitionTable, findOtadataOffset, findAppOffset } from "./partitions.js";
import { Flasher } from "./flasher.js";
import { SerialConsole } from "./serialconsole.js";

const $ = (id) => document.getElementById(id);

// ---- State ----
let sharedPort = null; // reusable SerialPort (flash -> console)
let busy = false;
let builds = []; // recent firmware builds for the selected branch/platform (newest first)
const serialConsole = new SerialConsole({
  onData: (d) => appendConsole(d),
  onOpen: () => setConsoleButtons(true),
  onClose: () => setConsoleButtons(false),
});

// ---- Elements ----
const els = {};
[
  "branchSelect",
  "platformSelect",
  "buildSelect",
  "buildCommit",
  "baudSelect",
  "langSelect",
  "btnFlashApp",
  "btnFlashFull",
  "btnCustomToggle",
  "btnConsole",
  "btnErase",
  "customPanel",
  "consolePanel",
  "progressBar",
  "status",
  "log",
  "btnFlashCustom",
  "btnConsoleOpen",
  "btnConsoleClose",
  "btnConsoleClear",
  "consoleOutput",
].forEach((id) => (els[id] = $(id)));

const actionButtons = [
  els.btnFlashApp,
  els.btnFlashFull,
  els.btnErase,
  els.btnFlashCustom,
];

// ---- UI helpers ----
function setStatus(msg, kind) {
  els.status.textContent = msg;
  els.status.className = "status" + (kind ? " " + kind : "");
}
function appendLog(text) {
  els.log.textContent += text;
  els.log.scrollTop = els.log.scrollHeight;
}
function appendConsole(text) {
  els.consoleOutput.textContent += text;
  els.consoleOutput.scrollTop = els.consoleOutput.scrollHeight;
}
function setProgress(fraction) {
  els.progressBar.style.width = Math.max(0, Math.min(1, fraction)) * 100 + "%";
}
function setBusy(b) {
  busy = b;
  actionButtons.forEach((btn) => (btn.disabled = b));
}
function setConsoleButtons(open) {
  els.btnConsoleOpen.disabled = open;
  els.btnConsoleClose.disabled = !open;
}

// ---- Read the current selection ----
function currentBranch() {
  return els.branchSelect.value;
}
function currentPlatform() {
  return PLATFORMS.find((p) => p.id === els.platformSelect.value) || PLATFORMS[0];
}
function currentLang() {
  return getLang();
}
function currentBaud() {
  return parseInt(els.baudSelect.value, 10) || DEFAULT_FLASH_BAUD;
}
function currentBuild() {
  const i = els.buildSelect.selectedIndex;
  return i >= 0 ? builds[i] : null;
}
function currentRef() {
  const b = currentBuild();
  return b ? b.fwSha : "main";
}

// ---- Populate dropdowns ----
function fillBranches() {
  els.branchSelect.innerHTML = "";
  for (const b of BRANCHES) {
    const o = document.createElement("option");
    o.value = b.id;
    o.textContent = b.label;
    els.branchSelect.appendChild(o);
  }
  els.branchSelect.value = DEFAULT_BRANCH;
}
function fillBaud() {
  els.baudSelect.innerHTML = "";
  for (const b of FLASH_BAUD_OPTIONS) {
    const o = document.createElement("option");
    o.value = String(b);
    o.textContent = b.toLocaleString() + " Baud";
    els.baudSelect.appendChild(o);
  }
  els.baudSelect.value = String(DEFAULT_FLASH_BAUD);
}
function fillPlatforms() {
  const prev = els.platformSelect.value;
  els.platformSelect.innerHTML = "";
  for (const p of PLATFORMS) {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.label;
    els.platformSelect.appendChild(o);
  }
  const stillThere = Array.from(els.platformSelect.options).some((o) => o.value === prev);
  els.platformSelect.value = stillThere ? prev : DEFAULT_PLATFORM;
  if (!els.platformSelect.value && els.platformSelect.options.length) {
    els.platformSelect.selectedIndex = 0;
  }
}

// Fetch the recent builds for the current branch/platform and fill the dropdown.
async function refreshBuilds() {
  els.buildSelect.innerHTML = "";
  els.buildCommit.textContent = t("fw.buildLoading");
  try {
    builds = await fetchBuilds(currentBranch(), currentPlatform().id);
  } catch (e) {
    builds = [];
    els.buildCommit.textContent = t("fw.buildError");
    return;
  }
  if (!builds.length) {
    els.buildCommit.textContent = t("fw.noBuilds");
    return;
  }
  renderBuilds();
}

// (Re)render the build dropdown from the cached list, preserving the selection.
function renderBuilds() {
  const prev = els.buildSelect.selectedIndex;
  els.buildSelect.innerHTML = "";
  builds.forEach((b, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = b.date
      ? new Date(b.date).toLocaleString(getLang().toLowerCase())
      : `#${i + 1}`;
    els.buildSelect.appendChild(o);
  });
  els.buildSelect.selectedIndex = prev >= 0 && prev < builds.length ? prev : 0;
  updateCommitInfo();
}

// Show the ESPuino source-commit link (with the commit message as a hover tooltip)
// for the selected build.
async function updateCommitInfo() {
  const b = currentBuild();
  if (!b) {
    els.buildCommit.textContent = "";
    return;
  }
  const suffix = ` · <code>firmware-${currentLang()}.bin</code>`;
  if (b.sourceSha) {
    const short = b.sourceSha.slice(0, 10);
    els.buildCommit.innerHTML =
      `${t("fw.commit")} <a href="${SOURCE_COMMIT_URL}${b.sourceSha}" target="_blank" rel="noopener noreferrer">${short}</a>` +
      suffix;
    const link = els.buildCommit.querySelector("a");
    const msg = await fetchCommitMessage(b.sourceSha); // best-effort tooltip
    if (msg && link) link.title = msg;
  } else {
    els.buildCommit.innerHTML = `${t("fw.commit")} ${b.fwSha.slice(0, 10)}` + suffix;
  }
}

// ---- Chip guardrail ----
// Reduce a chip name/description to its family, e.g.
//   "ESP32-D0WD-V3 (revision 3)" -> "ESP32"
//   "ESP32-S3" -> "ESP32-S3"
// so base-ESP32 variants all match "ESP32" while other families are rejected.
function chipFamily(name) {
  const n = (name || "").toUpperCase().replace(/\s+/g, "");
  // Longer variant codes first (C61 before C6) to avoid partial matches.
  const m = n.match(/ESP32-(S2|S3|C2|C3|C5|C61|C6|H2|P4)/);
  if (m) return "ESP32-" + m[1];
  if (n.includes("ESP32")) return "ESP32";
  if (n.includes("ESP8266")) return "ESP8266";
  return n;
}
function chipMatches(chipName, expected) {
  return chipFamily(chipName) === chipFamily(expected);
}

// ---- Build file sets ----
async function buildFileArray(mode, ref, branch, platform, lang) {
  // partitions.bin gives us the real offsets for otadata and the app.
  const partitionsBin = await loadPartitions(ref, branch, platform);
  const table = parsePartitionTable(partitionsBin);
  const otadataOffset = findOtadataOffset(table) ?? FALLBACK_OTADATA_OFFSET;
  const appOffset = findAppOffset(table) ?? FALLBACK_APP_OFFSET;

  const [appBin, bootApp0Bin] = await Promise.all([
    loadApp(ref, branch, platform, lang),
    loadBootApp0(),
  ]);

  if (mode === "app") {
    return [
      { name: `firmware-${lang}.bin`, data: appBin, address: appOffset },
      { name: "boot_app0.bin", data: bootApp0Bin, address: otadataOffset },
    ];
  }

  // Full flash
  const platformObj = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];
  const blOffset = BOOTLOADER_OFFSET[platformObj.chip] ?? 0x1000;
  const bootloaderBin = await loadBootloader(ref, branch, platform);
  return [
    { name: "bootloader.bin", data: bootloaderBin, address: blOffset },
    { name: "partitions.bin", data: partitionsBin, address: PARTITIONS_OFFSET },
    { name: "boot_app0.bin", data: bootApp0Bin, address: otadataOffset },
    { name: `firmware-${lang}.bin`, data: appBin, address: appOffset },
  ];
}

async function flashFiles(flasher, fileArray) {
  const n = fileArray.length;
  await flasher.flash(fileArray, (idx, written, total) => {
    const frac = (idx + (total ? written / total : 0)) / n;
    setProgress(frac);
    setStatus(t("msg.writing", { name: fileArray[idx]?.name || "" }));
  });
}

// ---- Actions ----
async function runFlash(mode) {
  if (busy) return;
  setBusy(true);
  els.log.textContent = "";
  setProgress(0);
  await ensurePortFree();
  // Reuse the one shared port (picked on the first action) so repeat flashes don't
  // re-prompt and don't trip the "requestPort needs a user gesture" rule after the
  // awaited console close. It was esptool-js 0.5.7 — not port reuse — that couldn't
  // connect earlier; 0.6.0 reopens a released port fine.
  const flasher = new Flasher({ onLog: appendLog, baud: currentBaud(), port: sharedPort });
  try {
    setStatus(t("msg.connecting"));
    const chip = await flasher.connect();
    setStatus(t("msg.chip", { chip }));
    const platform = currentPlatform();
    if (!chipMatches(chip, platform.chip)) {
      setStatus(t("msg.mismatch", { chip, expected: platform.chip }), "error");
      await flasher.release();
      return;
    }
    setStatus(t("msg.downloading"));
    const fileArray = await buildFileArray(
      mode,
      currentRef(),
      currentBranch(),
      platform.id,
      currentLang()
    );
    setStatus(t("msg.flashing"));
    await flashFiles(flasher, fileArray);
    setProgress(1);
    await flasher.reset();
    sharedPort = flasher.port;
    await flasher.release();
    setStatus(t("msg.done"), "success");
    await showConsoleAfterFlash();
  } catch (e) {
    setStatus(t("msg.error", { error: e.message || e }), "error");
    // Drop the shared port so the next attempt re-opens the picker with a fresh handle.
    sharedPort = null;
    try {
      await flasher.release();
    } catch (_) {}
  } finally {
    setBusy(false);
  }
}

async function runErase() {
  if (busy) return;
  if (!window.confirm(t("msg.eraseConfirm"))) return;
  setBusy(true);
  els.log.textContent = "";
  setProgress(0);
  await ensurePortFree();
  // Reuse the one shared port (picked on the first action) so repeat flashes don't
  // re-prompt and don't trip the "requestPort needs a user gesture" rule after the
  // awaited console close. It was esptool-js 0.5.7 — not port reuse — that couldn't
  // connect earlier; 0.6.0 reopens a released port fine.
  const flasher = new Flasher({ onLog: appendLog, baud: currentBaud(), port: sharedPort });
  try {
    setStatus(t("msg.connecting"));
    await flasher.connect();
    setStatus(t("msg.erasing"));
    await flasher.erase();
    sharedPort = flasher.port;
    await flasher.release();
    setStatus(t("msg.eraseDone"), "success");
    // Chaining: emphasize the full-flash action.
    els.btnFlashFull.classList.remove("btn-outline");
    els.btnFlashFull.classList.add("btn-primary");
    els.btnFlashFull.scrollIntoView({ behavior: "smooth", block: "center" });
    els.btnFlashFull.focus();
  } catch (e) {
    setStatus(t("msg.error", { error: e.message || e }), "error");
    // Drop the shared port so the next attempt re-opens the picker with a fresh handle.
    sharedPort = null;
    try {
      await flasher.release();
    } catch (_) {}
  } finally {
    setBusy(false);
  }
}

async function runCustom() {
  if (busy) return;
  const appFile = $("fileApp").files[0];
  if (!appFile) {
    setStatus(t("msg.needFiles"), "error");
    return;
  }
  const parts = [
    { id: "fileBootloader", off: "offBootloader", name: "bootloader.bin" },
    { id: "filePartitions", off: "offPartitions", name: "partitions.bin" },
    { id: "fileBootApp0", off: "offBootApp0", name: "boot_app0.bin" },
    { id: "fileApp", off: "offApp", name: "firmware.bin" },
  ];
  setBusy(true);
  els.log.textContent = "";
  setProgress(0);
  await ensurePortFree();
  // Reuse the one shared port (picked on the first action) so repeat flashes don't
  // re-prompt and don't trip the "requestPort needs a user gesture" rule after the
  // awaited console close. It was esptool-js 0.5.7 — not port reuse — that couldn't
  // connect earlier; 0.6.0 reopens a released port fine.
  const flasher = new Flasher({ onLog: appendLog, baud: currentBaud(), port: sharedPort });
  try {
    const fileArray = [];
    for (const p of parts) {
      const f = $(p.id).files[0];
      if (!f) continue;
      const address = parseInt($(p.off).value, 16);
      if (Number.isNaN(address)) throw new Error(`Invalid offset for ${p.name}`);
      fileArray.push({ name: p.name, data: await fileToUint8(f), address });
    }
    fileArray.sort((a, b) => a.address - b.address);
    setStatus(t("msg.connecting"));
    await flasher.connect();
    setStatus(t("msg.flashing"));
    await flashFiles(flasher, fileArray);
    setProgress(1);
    await flasher.reset();
    sharedPort = flasher.port;
    await flasher.release();
    setStatus(t("msg.done"), "success");
    await showConsoleAfterFlash();
  } catch (e) {
    setStatus(t("msg.error", { error: e.message || e }), "error");
    // Drop the shared port so the next attempt re-opens the picker with a fresh handle.
    sharedPort = null;
    try {
      await flasher.release();
    } catch (_) {}
  } finally {
    setBusy(false);
  }
}

// ---- Console ----
async function openConsole() {
  try {
    await serialConsole.open(CONSOLE_BAUD, sharedPort);
    sharedPort = serialConsole.port;
  } catch (e) {
    appendConsole(`\n[${t("msg.error", { error: e.message || e })}]\n`);
  }
}
async function closeConsole() {
  await serialConsole.close();
}
// After a successful flash: reveal the console and connect it, so the user immediately
// sees the device boot (the console reset reboots it and streams the boot log).
async function showConsoleAfterFlash() {
  els.consolePanel.classList.remove("hidden");
  els.consolePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  await openConsole();
}
// A serial port can only be opened by one consumer at a time: free it (close the
// read-only console) before esptool takes over for flashing/erasing.
async function ensurePortFree() {
  if (serialConsole.isOpen) await serialConsole.close();
}

// ---- Language ----
function onLangChange(lang) {
  setLang(lang);
  document.documentElement.lang = lang.toLowerCase();
  els.langSelect.value = lang;
  applyTranslations();
  if (builds.length) renderBuilds();
}

// ---- Init ----
function init() {
  // Language
  const initial = detectLang();
  setLang(initial);
  els.langSelect.value = initial;
  document.documentElement.lang = initial.toLowerCase();
  applyTranslations();

  // Browser check
  if (!webSerialSupported()) {
    $("unsupported").classList.remove("hidden");
    $("app").classList.add("hidden");
    return;
  }

  fillBranches();
  fillPlatforms();
  fillBaud();
  setConsoleButtons(false);
  refreshBuilds();

  // Events
  els.langSelect.addEventListener("change", (e) => onLangChange(e.target.value));
  els.branchSelect.addEventListener("change", refreshBuilds);
  els.platformSelect.addEventListener("change", refreshBuilds);
  els.buildSelect.addEventListener("change", updateCommitInfo);

  els.btnFlashApp.addEventListener("click", () => runFlash("app"));
  els.btnFlashFull.addEventListener("click", () => runFlash("full"));
  els.btnErase.addEventListener("click", runErase);
  els.btnFlashCustom.addEventListener("click", runCustom);

  els.btnCustomToggle.addEventListener("click", () => {
    els.customPanel.classList.toggle("hidden");
    if (!els.customPanel.classList.contains("hidden")) {
      els.customPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  els.btnConsole.addEventListener("click", () => {
    els.consolePanel.classList.remove("hidden");
    els.consolePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  els.btnConsoleOpen.addEventListener("click", openConsole);
  els.btnConsoleClose.addEventListener("click", closeConsole);
  els.btnConsoleClear.addEventListener("click", () => {
    els.consoleOutput.textContent = "";
  });
}

init();
