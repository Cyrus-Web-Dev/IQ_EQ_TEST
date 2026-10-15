// Membangun versi web (apps/app/dist) dengan pemeriksaan prasyarat dan log lengkap.
// Dipakai oleh: npm run app:export, desktop:dev, desktop:build.   Tambah --debug untuk log Expo yang lebih rinci.
import { spawn } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "apps", "app");
const logPath = join(root, "export-log.txt");
const fail = (msg) => {
  console.error("\n[build-web] " + msg);
  process.exit(1);
};

// 1) versi Node (Expo SDK 56+ memerlukan >= 20.19.4)
const [maj, min, pat] = process.versions.node.split(".").map(Number);
if (maj < 20 || (maj === 20 && (min < 19 || (min === 19 && pat < 4)))) {
  fail(`Node ${process.versions.node} terlalu lama. Pasang Node 20.19.4 atau lebih baru (disarankan versi LTS terbaru) dari nodejs.org.`);
}

// 2) paket yang wajib ada untuk build web
const req = createRequire(join(appDir, "package.json"));
const needed = ["expo", "expo-router", "react", "react-dom", "react-native", "react-native-web", "@expo/metro-runtime", "react-native-screens", "react-native-safe-area-context", "@react-native-async-storage/async-storage", "expo-status-bar", "expo-linking", "expo-constants"];
const missing = needed.filter((p) => {
  try {
    req.resolve(p + "/package.json");
    return false;
  } catch {
    return true;
  }
});
if (missing.length) {
  fail(`Paket belum terpasang: ${missing.join(", ")}\nJalankan dari folder root:  npm run app:setup`);
}

// 3) jalankan expo export dengan semua keluaran (stdout + stderr) disimpan ke export-log.txt
console.log(`[build-web] Node ${process.versions.node}, membangun web... (log: ${logPath})`);
const env = { ...process.env, CI: "1", EXPO_NO_TELEMETRY: "1", FORCE_COLOR: "0" };
if (process.argv.includes("--debug")) env.EXPO_DEBUG = "1";
const log = createWriteStream(logPath);
const child = spawn("npx", ["expo", "export", "--platform", "web", "--clear"], { cwd: appDir, shell: true, env });
const tee = (stream, out) =>
  stream.on("data", (d) => {
    out.write(d);
    log.write(d);
  });
tee(child.stdout, process.stdout);
tee(child.stderr, process.stderr);
child.on("error", (e) => fail("Gagal menjalankan expo: " + e.message));
child.on("close", (code) => {
  log.end(() => {
    if (code === 0 && existsSync(join(appDir, "dist", "index.html"))) {
      console.log("\n[build-web] Selesai: apps/app/dist/index.html siap.");
      process.exit(0);
    }
    fail(`expo export gagal (kode ${code}). Seluruh keluaran tersimpan di:\n  ${logPath}\nKirim ISI file itu (salin teksnya) agar penyebabnya bisa dipastikan. Coba juga: node scripts/build-web.mjs --debug`);
  });
});
