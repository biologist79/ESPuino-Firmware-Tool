// Localization: DE / EN / FR. Default = browser language.

export const translations = {
  DE: {
    "nav.title": "ESPuino Flash Tool",
    "unsupported.title": "Browser nicht unterstützt",
    "unsupported.body":
      "Dieses Tool braucht die Web-Serial-Schnittstelle. Bitte öffne die Seite in <strong>Chrome</strong> oder <strong>Edge</strong> an einem <strong>Computer</strong> (nicht am Handy/Tablet, nicht in Firefox oder Safari).",
    "intro.body":
      "Flashe deinen ESPuino direkt per USB — ganz ohne Visual Studio Code. Schließe den ESP32 per USB an, wähle unten deine Firmware und lege los.",
    "fw.title": "1. Firmware wählen",
    "fw.branch": "Branch",
    "fw.platform": "Plattform",
    "fw.language": "Sprache",
    "fw.languageHint": "bestimmt Oberfläche und Firmware-Sprache",
    "fw.build": "Firmware-Build",
    "fw.commit": "Commit:",
    "fw.buildLoading": "Builds werden geladen …",
    "fw.noBuilds": "Keine Builds gefunden.",
    "fw.buildError": "Builds konnten nicht geladen werden (evtl. GitHub-Limit).",
    "fw.baud": "USB-Geschwindigkeit",
    "fw.baudHint":
      "Bei Verbindungsabbrüchen (z. B. CH340-Adapter) einen niedrigeren Wert wählen. 115200 ist am sichersten.",
    "action.title": "2. Aktion wählen",
    "action.app": "Nur App aktualisieren",
    "action.appHint":
      "Empfohlen für ein Gerät, das schon läuft oder vorgeflasht geliefert wurde. Schnell.",
    "action.full": "Komplett flashen / Recovery",
    "action.fullHint":
      "Für einen neuen/leeren ESP32, nach einem Erase oder wenn nichts mehr geht.",
    "action.custom": "Eigene Firmware flashen …",
    "action.customHint": "Für Fortgeschrittene mit eigenem PlatformIO-Build.",
    "action.erase": "Flash komplett löschen (Erase)",
    "action.eraseHint":
      "Löscht den gesamten Speicher inkl. Bootloader. Danach ist ein Komplett-Flash nötig. Es werden alle ESPuino-Einstellungen gelöscht.",
    "action.console": "Serielle Konsole öffnen",
    "action.consoleHint": "Zeigt die Ausgabe des ESP32 (nur lesen).",
    "custom.title": "Eigene Firmware",
    "custom.body":
      "Lade die Dateien aus deinem PlatformIO-Build (<code>.pio/build/&lt;env&gt;/</code>). Der Partition-Table wird mitgeschrieben — bestehende Daten/NVS gehen verloren.",
    "custom.bootloader": "bootloader.bin",
    "custom.partitions": "partitions.bin",
    "custom.bootapp0": "boot_app0.bin (optional)",
    "custom.app": "firmware.bin (App)",
    "custom.offset": "Offset",
    "custom.flash": "Eigene Firmware flashen",
    "progress.title": "Fortschritt",
    "progress.idle": "Bereit.",
    "console.title": "Serielle Konsole",
    "console.open": "Verbinden",
    "console.close": "Trennen",
    "console.clear": "Leeren",
    "console.hint":
      "Nur-Lese-Ansicht der Boot-/Logausgabe (115200 Baud). Beim Verbinden wird das Gerät kurz neu gestartet, damit der Boot-Log erscheint.",
    "btn.cancel": "Abbrechen",
    "btn.close": "Schließen",
    "msg.connecting": "Verbinde … bitte im Dialog den seriellen Port wählen.",
    "msg.chip": "Verbunden. Erkannter Chip: {chip}.",
    "msg.mismatch":
      "Achtung: Angeschlossen ist {chip}, die gewählte Plattform erwartet aber {expected}. Abgebrochen, um Schaden zu vermeiden.",
    "msg.downloading": "Lade Firmware-Dateien …",
    "msg.flashing": "Schreibe Flash … Gerät bitte nicht trennen.",
    "msg.writing": "Schreibe {name} …",
    "msg.done": "Fertig! Der ESPuino startet jetzt neu.",
    "msg.eraseConfirm":
      "Wirklich den kompletten Flash löschen? Danach ist ein Komplett-Flash nötig, damit das Gerät wieder bootet.",
    "msg.erasing": "Lösche Flash … das kann eine Weile dauern.",
    "msg.eraseDone": "Flash gelöscht. Bitte jetzt einen Komplett-Flash durchführen.",
    "msg.eraseChain": "Jetzt komplett flashen",
    "msg.error": "Fehler: {error}",
    "msg.needFiles": "Bitte mindestens die App-Datei (firmware.bin) auswählen.",
  },
  EN: {
    "nav.title": "ESPuino Flash Tool",
    "unsupported.title": "Browser not supported",
    "unsupported.body":
      "This tool needs the Web Serial API. Please open it in <strong>Chrome</strong> or <strong>Edge</strong> on a <strong>computer</strong> (not on a phone/tablet, not in Firefox or Safari).",
    "intro.body":
      "Flash your ESPuino directly over USB — no Visual Studio Code needed. Connect the ESP32 via USB, pick your firmware below and go.",
    "fw.title": "1. Choose firmware",
    "fw.branch": "Branch",
    "fw.platform": "Platform",
    "fw.language": "Language",
    "fw.languageHint": "sets the interface and firmware language",
    "fw.build": "Firmware build",
    "fw.commit": "Commit:",
    "fw.buildLoading": "Loading builds …",
    "fw.noBuilds": "No builds found.",
    "fw.buildError": "Could not load builds (maybe a GitHub rate limit).",
    "fw.baud": "USB speed",
    "fw.baudHint":
      "If the connection drops (e.g. CH340 adapters), pick a lower value. 115200 is the safest.",
    "action.title": "2. Choose an action",
    "action.app": "Update app only",
    "action.appHint":
      "Recommended for a device that already runs or was shipped pre-flashed. Fast.",
    "action.full": "Full flash / recovery",
    "action.fullHint":
      "For a new/blank ESP32, after an erase, or when nothing boots anymore.",
    "action.custom": "Flash custom firmware …",
    "action.customHint": "For advanced users with their own PlatformIO build.",
    "action.erase": "Erase entire flash",
    "action.eraseHint":
      "Wipes all memory incl. the bootloader. A full flash is required afterwards. All ESPuino settings will be erased.",
    "action.console": "Open serial console",
    "action.consoleHint": "Shows the ESP32 output (read-only).",
    "custom.title": "Custom firmware",
    "custom.body":
      "Upload the files from your PlatformIO build (<code>.pio/build/&lt;env&gt;/</code>). The partition table is written too — existing data/NVS will be lost.",
    "custom.bootloader": "bootloader.bin",
    "custom.partitions": "partitions.bin",
    "custom.bootapp0": "boot_app0.bin (optional)",
    "custom.app": "firmware.bin (app)",
    "custom.offset": "Offset",
    "custom.flash": "Flash custom firmware",
    "progress.title": "Progress",
    "progress.idle": "Ready.",
    "console.title": "Serial console",
    "console.open": "Connect",
    "console.close": "Disconnect",
    "console.clear": "Clear",
    "console.hint":
      "Read-only view of the boot/log output (115200 baud). Connecting briefly restarts the device so the boot log appears.",
    "btn.cancel": "Cancel",
    "btn.close": "Close",
    "msg.connecting": "Connecting … please pick the serial port in the dialog.",
    "msg.chip": "Connected. Detected chip: {chip}.",
    "msg.mismatch":
      "Warning: a {chip} is connected, but the chosen platform expects {expected}. Aborted to avoid damage.",
    "msg.downloading": "Downloading firmware files …",
    "msg.flashing": "Writing flash … do not disconnect the device.",
    "msg.writing": "Writing {name} …",
    "msg.done": "Done! The ESPuino is restarting now.",
    "msg.eraseConfirm":
      "Really erase the entire flash? A full flash will be required afterwards for the device to boot again.",
    "msg.erasing": "Erasing flash … this can take a while.",
    "msg.eraseDone": "Flash erased. Please run a full flash now.",
    "msg.eraseChain": "Full flash now",
    "msg.error": "Error: {error}",
    "msg.needFiles": "Please select at least the app file (firmware.bin).",
  },
  FR: {
    "nav.title": "ESPuino Flash Tool",
    "unsupported.title": "Navigateur non pris en charge",
    "unsupported.body":
      "Cet outil nécessite l'API Web Serial. Ouvrez-le dans <strong>Chrome</strong> ou <strong>Edge</strong> sur un <strong>ordinateur</strong> (pas sur téléphone/tablette, ni Firefox ou Safari).",
    "intro.body":
      "Flashez votre ESPuino directement par USB — sans Visual Studio Code. Branchez l'ESP32 en USB, choisissez le firmware ci-dessous et lancez-vous.",
    "fw.title": "1. Choisir le firmware",
    "fw.branch": "Branche",
    "fw.platform": "Plateforme",
    "fw.language": "Langue",
    "fw.languageHint": "définit la langue de l'interface et du firmware",
    "fw.build": "Build firmware",
    "fw.commit": "Commit :",
    "fw.buildLoading": "Chargement des builds …",
    "fw.noBuilds": "Aucun build trouvé.",
    "fw.buildError": "Impossible de charger les builds (limite GitHub ?).",
    "fw.baud": "Vitesse USB",
    "fw.baudHint":
      "En cas de coupure (ex. adaptateurs CH340), choisissez une valeur plus basse. 115200 est la plus sûre.",
    "action.title": "2. Choisir une action",
    "action.app": "Mettre à jour l'app",
    "action.appHint":
      "Recommandé pour un appareil déjà fonctionnel ou livré pré-flashé. Rapide.",
    "action.full": "Flash complet / récupération",
    "action.fullHint":
      "Pour un ESP32 neuf/vierge, après un effacement, ou si plus rien ne démarre.",
    "action.custom": "Flasher un firmware perso …",
    "action.customHint": "Pour les utilisateurs avancés avec leur propre build PlatformIO.",
    "action.erase": "Effacer toute la mémoire flash",
    "action.eraseHint":
      "Efface toute la mémoire, bootloader compris. Un flash complet est ensuite nécessaire. Tous les réglages ESPuino seront effacés.",
    "action.console": "Ouvrir la console série",
    "action.consoleHint": "Affiche la sortie de l'ESP32 (lecture seule).",
    "custom.title": "Firmware personnalisé",
    "custom.body":
      "Chargez les fichiers de votre build PlatformIO (<code>.pio/build/&lt;env&gt;/</code>). La table de partitions est aussi écrite — les données/NVS existantes seront perdues.",
    "custom.bootloader": "bootloader.bin",
    "custom.partitions": "partitions.bin",
    "custom.bootapp0": "boot_app0.bin (optionnel)",
    "custom.app": "firmware.bin (app)",
    "custom.offset": "Offset",
    "custom.flash": "Flasher le firmware perso",
    "progress.title": "Progression",
    "progress.idle": "Prêt.",
    "console.title": "Console série",
    "console.open": "Connecter",
    "console.close": "Déconnecter",
    "console.clear": "Effacer",
    "console.hint":
      "Vue en lecture seule de la sortie boot/log (115200 bauds). La connexion redémarre brièvement l'appareil pour afficher le boot log.",
    "btn.cancel": "Annuler",
    "btn.close": "Fermer",
    "msg.connecting": "Connexion … choisissez le port série dans la boîte de dialogue.",
    "msg.chip": "Connecté. Puce détectée : {chip}.",
    "msg.mismatch":
      "Attention : une puce {chip} est connectée, mais la plateforme choisie attend {expected}. Annulé pour éviter tout dommage.",
    "msg.downloading": "Téléchargement des fichiers firmware …",
    "msg.flashing": "Écriture de la flash … ne débranchez pas l'appareil.",
    "msg.writing": "Écriture de {name} …",
    "msg.done": "Terminé ! L'ESPuino redémarre maintenant.",
    "msg.eraseConfirm":
      "Effacer vraiment toute la flash ? Un flash complet sera ensuite nécessaire pour que l'appareil redémarre.",
    "msg.erasing": "Effacement de la flash … cela peut prendre un moment.",
    "msg.eraseDone": "Flash effacée. Veuillez lancer un flash complet maintenant.",
    "msg.eraseChain": "Flash complet maintenant",
    "msg.error": "Erreur : {error}",
    "msg.needFiles": "Veuillez sélectionner au moins le fichier app (firmware.bin).",
  },
};

const SUPPORTED = ["DE", "EN", "FR"];
let current = "EN";

export function detectLang() {
  const l = (navigator.language || "en").slice(0, 2).toUpperCase();
  return SUPPORTED.includes(l) ? l : "EN";
}
export function setLang(l) {
  current = SUPPORTED.includes(l) ? l : "EN";
}
export function getLang() {
  return current;
}
export function t(key, vars) {
  let s =
    (translations[current] && translations[current][key]) ||
    translations.EN[key] ||
    key;
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
  return s;
}
export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });
}
