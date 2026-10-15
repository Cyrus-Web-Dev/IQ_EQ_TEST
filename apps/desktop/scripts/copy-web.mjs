// Salin hasil `expo export --platform web` (apps/app/dist) ke apps/desktop/web
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "../../app/dist");
const dest = join(here, "../web");

if (!existsSync(join(src, "index.html"))) {
  console.error(`Build web tidak ditemukan di ${src}\nJalankan dulu: npm run build:web -w @tesiqeq/app`);
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log(`Web disalin: ${src} -> ${dest}`);
