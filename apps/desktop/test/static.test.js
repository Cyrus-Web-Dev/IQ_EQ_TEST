"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { handle, resolveFile, mimeFor } = require("../lib/static");

let root, outside;
before(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "web-"));
  outside = path.join(path.dirname(root), "rahasia-" + path.basename(root) + ".txt");
  fs.writeFileSync(outside, "RAHASIA");
  fs.writeFileSync(path.join(root, "index.html"), "<html>beranda</html>");
  fs.mkdirSync(path.join(root, "_expo", "static"), { recursive: true });
  fs.writeFileSync(path.join(root, "_expo", "static", "app.js"), "console.log(1)");
  fs.mkdirSync(path.join(root, "sub"));
  fs.writeFileSync(path.join(root, "sub", "index.html"), "<html>sub</html>");
  fs.writeFileSync(path.join(root, "my font.woff2"), "x");
});
after(() => {
  fs.rmSync(root, { recursive: true, force: true });
  fs.rmSync(outside, { force: true });
});

const get = (p) => handle(root, "app://bundle" + p);

test("berkas ada: isi dan content-type benar", async () => {
  const r = await get("/_expo/static/app.js");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /javascript/);
  assert.equal(await r.text(), "console.log(1)");
});

test("akar '/' dan query string -> index.html", async () => {
  assert.equal(await (await get("/")).text(), "<html>beranda</html>");
  assert.equal(await (await get("/?x=1")).text(), "<html>beranda</html>");
});

test("fallback SPA: rute tanpa ekstensi -> index.html", async () => {
  const r = await get("/start");
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "<html>beranda</html>");
});

test("direktori dengan index.html -> index.html direktori itu", async () => {
  assert.equal(await (await get("/sub")).text(), "<html>sub</html>");
});

test("aset berekstensi yang tidak ada -> 404 (bukan index.html)", async () => {
  assert.equal((await get("/_expo/static/hilang.js")).status, 404);
  assert.equal((await get("/gambar.png")).status, 404);
});

test("path traversal tidak bisa keluar dari webRoot", async () => {
  const name = path.basename(outside);
  for (const p of [`/../${name}`, `/..%2F${name}`, `/%2e%2e/${name}`, `/_expo/../../${name}`]) {
    const r = await get(p);
    const body = await r.text();
    assert.ok(!body.includes("RAHASIA"), `bocor lewat ${p}`);
  }
  const direct = await resolveFile(root, "/../" + path.basename(outside));
  assert.ok(!direct.file || direct.file.startsWith(root));
});

test("nama berkas dengan spasi (URL-encoded) terbaca", async () => {
  assert.equal((await get("/my%20font.woff2")).status, 200);
});

test("encoding rusak -> 400", async () => {
  assert.equal((await get("/%E0%A4%A")).status, 400);
});

test("mimeFor: ekstensi umum dan fallback", () => {
  assert.equal(mimeFor("a.css"), "text/css; charset=utf-8");
  assert.equal(mimeFor("a.PNG"), "image/png");
  assert.equal(mimeFor("a.xyz"), "application/octet-stream");
});
