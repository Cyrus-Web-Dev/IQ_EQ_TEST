"use strict";
// Penyaji berkas statis untuk protokol app://bundle/ — dipisah dari Electron agar bisa diuji dengan Node biasa.
const fs = require("node:fs/promises");
const path = require("node:path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function mimeFor(file) {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Terjemahkan path URL menjadi berkas di dalam webRoot.
 * - path traversal ditolak/dikurung di dalam webRoot
 * - direktori -> index.html di dalamnya
 * - path tanpa ekstensi yang tidak ada -> index.html (fallback SPA untuk expo-router)
 * - path berekstensi yang tidak ada -> 404
 */
async function resolveFile(webRoot, pathname) {
  const root = path.resolve(webRoot);
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return { status: 400 };
  }
  const abs = path.resolve(root, "." + path.posix.normalize("/" + rel));
  if (abs !== root && !abs.startsWith(root + path.sep)) return { status: 403 };

  try {
    const st = await fs.stat(abs);
    if (st.isFile()) return { file: abs };
    if (st.isDirectory()) {
      const idx = path.join(abs, "index.html");
      try {
        if ((await fs.stat(idx)).isFile()) return { file: idx };
      } catch {
        /* lanjut ke fallback */
      }
    }
  } catch {
    /* tidak ada */
  }
  if (path.extname(abs)) return { status: 404 };
  return { file: path.join(root, "index.html") };
}

/** Handler untuk protocol.handle: menerima URL penuh, mengembalikan Response. */
async function handle(webRoot, url) {
  const { pathname } = new URL(url);
  const r = await resolveFile(webRoot, pathname);
  if (!r.file) return new Response("Tidak ditemukan", { status: r.status ?? 404 });
  try {
    const data = await fs.readFile(r.file);
    return new Response(data, { status: 200, headers: { "content-type": mimeFor(r.file), "cache-control": "no-cache" } });
  } catch {
    return new Response("Tidak ditemukan", { status: 404 });
  }
}

module.exports = { handle, resolveFile, mimeFor };
