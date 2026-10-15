/**
 * Validasi bank soal. Jalankan: npm run validate   (tambah --partial saat bank belum lengkap)
 * ERROR  -> exit 1. WARN -> hanya peringatan.
 */
import { DIFFICULTIES, EQ_TRAITS, IQ_CATEGORIES } from "../packages/core/src/types";
import { getPool } from "../packages/core/src/bank";
import { BANK_SIZE_PER_TIER } from "../packages/core/src/config";
import type { Question, TestType } from "../packages/core/src/types";

const partial = process.argv.includes("--partial");
let errors = 0;
let warns = 0;
const err = (m: string) => (errors++, console.error("  ERROR  " + m));
const warn = (m: string) => (warns++, console.warn("  WARN   " + m));
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

for (const type of ["iq", "eq"] as TestType[]) {
  const validCats = new Set<string>(type === "iq" ? IQ_CATEGORIES : EQ_TRAITS);
  const seenText = new Map<string, string>();
  const seenIds = new Set<string>();
  console.log(`\n== ${type.toUpperCase()} ==`);

  for (const tier of DIFFICULTIES) {
    const pool = getPool(type, tier) as Question[];
    const tag = `${type}/${tier}`;
    if (pool.length !== BANK_SIZE_PER_TIER) {
      (partial ? warn : err)(`${tag}: jumlah soal ${pool.length}, seharusnya ${BANK_SIZE_PER_TIER}`);
    }
    const idxCount = [0, 0, 0, 0];
    let longestIsCorrect = 0;
    const catCount = new Map<string, number>();

    pool.forEach((q, i) => {
      const where = `${tag}#${i} (${q.id})`;
      if (!new RegExp(`^${type}-${tier}-\\d{3}$`).test(q.id)) err(`${where}: format id harus ${type}-${tier}-NNN`);
      if (seenIds.has(q.id)) err(`${where}: id duplikat`);
      seenIds.add(q.id);
      if (q.type !== type) err(`${where}: field type salah`);
      if (q.difficulty !== tier) err(`${where}: field difficulty salah`);
      if (!validCats.has(q.category)) err(`${where}: kategori tidak dikenal "${q.category}"`);
      catCount.set(q.category, (catCount.get(q.category) ?? 0) + 1);
      if (!q.question || q.question.trim().length < 8) err(`${where}: teks soal kosong/terlalu pendek`);
      if (!q.explanation || q.explanation.trim().length < 8) err(`${where}: penjelasan kosong`);
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        err(`${where}: harus tepat 4 opsi`);
        return;
      }
      if (new Set(q.options.map(norm)).size !== 4) err(`${where}: ada opsi kembar`);
      if (q.options.some((o) => !String(o).trim())) err(`${where}: ada opsi kosong`);
      if (![0, 1, 2, 3].includes(q.correct)) err(`${where}: correct harus 0-3`);
      else {
        idxCount[q.correct]!++;
        const lens = q.options.map((o) => o.length);
        if (lens[q.correct] === Math.max(...lens) && lens.filter((l) => l === Math.max(...lens)).length === 1) longestIsCorrect++;
      }
      const key = norm(q.question);
      const prev = seenText.get(key);
      if (prev) err(`${where}: teks soal sama dengan ${prev}`);
      else seenText.set(key, q.id);
    });

    if (pool.length >= 20) {
      const worst = Math.max(...idxCount) / pool.length;
      if (worst > 0.4) warn(`${tag}: posisi jawaban benar condong (${idxCount.join("/")}) — tidak masalah karena opsi diacak saat tes`);
      if (type === "eq" && longestIsCorrect / pool.length > 0.5)
        warn(`${tag}: jawaban benar adalah opsi terpanjang di ${Math.round((100 * longestIsCorrect) / pool.length)}% soal (bias panjang)`);
    }
    console.log(
      `  ${tag.padEnd(12)} ${String(pool.length).padStart(3)} soal | kategori: ` +
        [...catCount.entries()].map(([k, v]) => `${k}=${v}`).join(", "),
    );
  }
}

console.log(`\n${errors} error, ${warns} peringatan`);
process.exit(errors ? 1 : 0);
