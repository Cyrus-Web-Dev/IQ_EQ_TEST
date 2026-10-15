"use strict";
const { app, BrowserWindow, Menu, dialog, protocol, screen, session } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { handle } = require("./lib/static");

// Origin tetap (app://bundle) supaya localStorage — tempat riwayat tes disimpan — bertahan antar peluncuran.
const SCHEME = "app";
const START_URL = `${SCHEME}://bundle/`;
const WEB_ROOT = path.join(__dirname, "web");
const DEV_URL = process.env.TESIQEQ_DEV_URL || ""; // mis. http://localhost:8081 untuk `expo start --web`

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

const stateFile = () => path.join(app.getPath("userData"), "window-state.json");

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile(), "utf8"));
  } catch {
    return {};
  }
}

function saveState(win) {
  try {
    if (win.isMinimized() || win.isFullScreen()) return;
    fs.writeFileSync(stateFile(), JSON.stringify({ ...win.getNormalBounds(), maximized: win.isMaximized() }));
  } catch {
    /* abaikan */
  }
}

/** Buang posisi tersimpan bila monitor tempat jendela dulu berada sudah tidak ada. */
function visiblePosition(st) {
  if (typeof st.x !== "number" || typeof st.y !== "number") return {};
  const rect = { x: st.x, y: st.y, width: st.width || 800, height: st.height || 600 };
  const ok = screen.getAllDisplays().some((d) => {
    const a = d.workArea;
    return rect.x < a.x + a.width && rect.x + rect.width > a.x && rect.y < a.y + a.height && rect.y + rect.height > a.y;
  });
  return ok ? { x: st.x, y: st.y } : {};
}

function buildMenu() {
  const view = [
    { role: "togglefullscreen", label: "Layar penuh" },
    { type: "separator" },
    { role: "zoomIn", label: "Perbesar" },
    { role: "zoomOut", label: "Perkecil" },
    { role: "resetZoom", label: "Ukuran asli" },
  ];
  if (!app.isPackaged) view.push({ type: "separator" }, { role: "reload" }, { role: "toggleDevTools" });
  return Menu.buildFromTemplate([
    { label: "Aplikasi", submenu: [{ role: "quit", label: "Keluar" }] },
    { label: "Tampilan", submenu: view },
  ]);
}

function createWindow() {
  const st = loadState();
  const win = new BrowserWindow({
    width: st.width || 1000,
    height: st.height || 780,
    ...visiblePosition(st),
    minWidth: 420,
    minHeight: 640,
    title: "Tes IQ & EQ",
    backgroundColor: "#0b1120",
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });

  win.once("ready-to-show", () => {
    if (st.maximized) win.maximize();
    win.show();
  });
  win.on("close", () => saveState(win));

  // Aplikasi sepenuhnya lokal: tolak jendela baru dan navigasi ke luar.
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event, url) => {
    const allowed = url.startsWith(START_URL) || (DEV_URL && url.startsWith(DEV_URL));
    if (!allowed) event.preventDefault();
  });

  win.loadURL(DEV_URL || START_URL);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) {
      if (w.isMinimized()) w.restore();
      w.focus();
    }
  });

  app.whenReady().then(() => {
    if (!DEV_URL && !fs.existsSync(path.join(WEB_ROOT, "index.html"))) {
      dialog.showErrorBox(
        "Berkas web belum disiapkan",
        "Folder 'web' tidak berisi index.html.\nJalankan: npm run build:web -w @tesiqeq/app lalu npm run prepare:web -w @tesiqeq/desktop",
      );
      app.quit();
      return;
    }

    protocol.handle(SCHEME, (request) => handle(WEB_ROOT, request.url));
    session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) => callback(false));
    Menu.setApplicationMenu(buildMenu());
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
