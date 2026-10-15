// Merakit soal EQ dari berkas tulisan tangan eq/{tier}-{a,b}.mjs -> packages/core/data/eq/{tier}.json
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { makeRng } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../packages/core/data/eq");
const TRAIT = { sa: "self_awareness", sr: "self_regulation", ic: "impulse_control", em: "empathy", so: "social_awareness", rm: "relationship_management", cm: "conflict_management", dm: "decision_making" };
const SEEDS = { easy: 5501, normal: 6602, hard: 7703, extreme: 8804 };

/** Pangkas klausa terakhir jawaban benar bila lebih panjang dari opsi salah terpanjang (cegah bias "pilih yang terpanjang"). */
function trimBest(best, wrongs) {
  const target = Math.max(...wrongs.map((w) => w.length)) - 4;
  let out = best;
  for (let guard = 0; guard < 4 && out.length > target; guard++) {
    const re = /(, lalu | lalu |, dan | dan |, serta |, sambil | sambil )/g;
    let last = -1, m;
    while ((m = re.exec(out)) !== null) if (m.index >= 38) last = m.index;
    if (last < 0) break;
    out = out.slice(0, last).replace(/[,\s]+$/, "") + ".";
  }
  return out;
}
const AUTO_TRIM = { easy: 4, hard: 4, extreme: 8 }; // tingkat -> 1 dari N soal dibiarkan apa adanya
const trimLog = [];

let problems = 0;
for (const tier of ["easy", "normal", "hard", "extreme"]) {
  const rows = [];
  for (const part of ["a", "b", "c"]) {
    const f = join(HERE, "eq", `${tier}-${part}.mjs`);
    if (existsSync(f)) rows.push(...(await import(f)).default);
  }
  if (rows.length === 0) { console.log(`eq/${tier}: belum ada berkas, dilewati`); continue; }

  // koreksi (opsional): timpa opsi per indeks setelah memastikan awalan skenario cocok
  const fixFile = join(HERE, "eq", `${tier}-fix.mjs`);
  if (existsSync(fixFile)) {
    for (const [idx, prefix, best, w1, w2, w3] of (await import(fixFile)).default) {
      if (w1 === undefined && idx % 4 === 0) continue; // pangkasan hanya ke 3 dari 4 soal agar panjang jawaban benar tidak jadi petunjuk (terpanjang maupun terpendek)
      const r = rows[idx];
      if (!r || !r[1].startsWith(prefix)) throw new Error(`${tier}-fix #${idx}: awalan "${prefix}" tidak cocok dengan skenario "${r?.[1]?.slice(0, 30)}"`);
      r[2] = best; if (w1 !== undefined) { r[3] = w1; r[4] = w2; r[5] = w3; }
    }
  }

  if (AUTO_TRIM[tier]) {
    rows.forEach((r, idx) => {
      if (idx % AUTO_TRIM[tier] === 0) return; // sebagian soal dibiarkan agar polanya tidak terbaca
      const t = trimBest(r[2], [r[3], r[4], r[5]]);
      if (t !== r[2]) { if (trimLog.length < 400) trimLog.push(`${tier}#${idx}\n  - ${r[2]}\n  + ${t}`); r[2] = t; }
    });
  }

  const g = makeRng(SEEDS[tier]);
  const qs = rows.map((r, i) => {
    if (r.length !== 7) throw new Error(`${tier}#${i}: harus 7 elemen, dapat ${r.length}`);
    const [code, question, best, w1, w2, w3, explanation] = r;
    if (!TRAIT[code]) throw new Error(`${tier}#${i}: kode aspek tidak dikenal "${code}"`);
    const opts = g.shuffle([best, w1, w2, w3]);
    return { category: TRAIT[code], question, options: opts, correct: opts.indexOf(best), explanation };
  });
  const questions = g.shuffle(qs).map((q, i) => ({ id: `eq-${tier}-${String(i + 1).padStart(3, "0")}`, type: "eq", difficulty: tier, ...q }));
  const counts = {};
  for (const q of questions) counts[q.category] = (counts[q.category] ?? 0) + 1;
  const longest = questions.filter((q) => { const L = q.options.map((o) => o.length); return L[q.correct] === Math.max(...L); }).length;
  console.log(`eq/${tier}: ${questions.length} soal | jawaban terpanjang=benar: ${longest} | ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  if (questions.length !== 100) problems++;
  writeFileSync(join(OUT, `${tier}.json`), "[\n" + questions.map((q) => "  " + JSON.stringify(q)).join(",\n") + "\n]\n");
}
if (problems) console.log(`(!) ${problems} tingkat belum tepat 100 soal`);

import { writeFileSync as _w } from "node:fs";
_w("/tmp/trim-log.txt", trimLog.join("\n"));
