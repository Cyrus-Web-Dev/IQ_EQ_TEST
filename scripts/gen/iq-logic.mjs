import { buildOptions, NAMES } from "./lib.mjs";

const mk = (q, o, explanation) => ({ category: "deductive_logic", question: q, ...o, explanation });

/* ---------- 1. Urutan transitif ---------- */
const ATTR = [
  ["lebih tinggi", "lebih pendek", "tertinggi", "terpendek"],
  ["lebih berat", "lebih ringan", "terberat", "teringan"],
  ["lebih cepat", "lebih lambat", "tercepat", "terlambat"],
  ["lebih tua", "lebih muda", "tertua", "termuda"],
  ["lebih tinggi nilainya", "lebih rendah nilainya", "nilai tertinggi", "nilai terendah"],
];
const ORD = ["pertama", "kedua", "ketiga", "keempat", "kelima", "keenam"];

function ordering(g, n, askKind) {
  const people = g.sample(NAMES, n);          // people[0] = paling "besar"
  const [hi, lo, top, bottom] = g.pick(ATTR);
  const stmts = [];
  for (let i = 0; i < n - 1; i++) stmts.push(g.chance(0.5) ? `${people[i]} ${hi} daripada ${people[i + 1]}` : `${people[i + 1]} ${lo} daripada ${people[i]}`);
  const shown = g.shuffle(stmts);
  let q, ans, expl;
  const chain = people.join(" > ");
  if (askKind === "top") { q = `Siapakah yang ${top}?`; ans = people[0]; }
  else if (askKind === "bottom") { q = `Siapakah yang ${bottom}?`; ans = people[n - 1]; }
  else { const k = g.int(1, n - 2); q = `Jika diurutkan dari yang ${top}, siapakah yang berada di urutan ke-${k + 1}?`; ans = people[k]; }
  expl = `Susun dari premis: ${chain} (dari ${top} ke ${bottom}). Jawabannya ${ans}.`;
  return mk(`${shown.join(". ")}. ${q}`, buildOptions(g, ans, people.filter((p) => p !== ans), () => g.pick(NAMES.filter((x) => !people.includes(x)))), expl);
}

/* ---------- 2. Silogisme (kata fiktif) ---------- */
const TERMS = ["zibu", "karo", "melu", "tonak", "ferin", "gadu", "pelo", "sinta", "rukan", "bolat", "vimo", "dekar", "lupin", "narto", "kesep"];
const PAIRS = [
  ["hujan turun", "jalanan basah"], ["lampu menyala", "listrik mengalir"], ["alarm berbunyi", "ada gangguan"], ["Rina belajar", "Rina lulus ujian"],
  ["bunga mekar", "musim semi tiba"], ["sinyal kuat", "video lancar"], ["mesin dipanaskan", "mesin menyala normal"], ["tanaman disiram", "tanah lembap"],
  ["kereta terlambat", "penumpang menunggu"], ["tombol ditekan", "pintu terbuka"],
];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

function syllogism(g, kinds) {
  const kind = g.pick(kinds);
  const [A, B, C, D] = g.sample(TERMS, 4);
  const O = (c, ws) => buildOptions(g, c, ws);
  switch (kind) {
    case "barbara":
      return mk(`Semua ${A} adalah ${B}. Semua ${B} adalah ${C}. Kesimpulan manakah yang PASTI benar?`,
        O(`Semua ${A} adalah ${C}.`, [`Semua ${C} adalah ${A}.`, `Tidak ada ${A} yang merupakan ${C}.`, `Sebagian ${C} bukan ${B}.`]),
        `Jika semua ${A} termasuk ${B} dan semua ${B} termasuk ${C}, maka semua ${A} termasuk ${C}. Kebalikannya tidak dijamin.`);
    case "celarent":
      return mk(`Semua ${A} adalah ${B}. Tidak ada ${B} yang merupakan ${C}. Kesimpulan manakah yang PASTI benar?`,
        O(`Tidak ada ${A} yang merupakan ${C}.`, [`Sebagian ${A} adalah ${C}.`, `Semua ${A} adalah ${C}.`, `Semua ${C} adalah ${A}.`]),
        `${A} berada di dalam ${B}, dan ${B} tidak beririsan dengan ${C}; maka ${A} juga tidak beririsan dengan ${C}.`);
    case "darii":
      return mk(`Semua ${B} adalah ${C}. Sebagian ${A} adalah ${B}. Kesimpulan manakah yang PASTI benar?`,
        O(`Sebagian ${A} adalah ${C}.`, [`Semua ${A} adalah ${C}.`, `Tidak ada ${A} yang merupakan ${C}.`, `Semua ${C} adalah ${A}.`]),
        `${A} yang termasuk ${B} otomatis termasuk ${C}, sehingga sebagian ${A} adalah ${C}. Tetapi tidak dijamin semua.`);
    case "tollens": {
      const [P, Q] = g.pick(PAIRS);
      return mk(`Jika ${P}, maka ${Q}. Ternyata tidak benar bahwa ${Q}. Kesimpulan manakah yang PASTI benar?`,
        O(`Tidak benar bahwa ${P}.`, [`${cap(P)}.`, `${cap(Q)}.`, `Tidak ada kesimpulan yang dapat ditarik.`]),
        `Modus tollens: jika P → Q dan Q tidak terjadi, maka P tidak terjadi.`);
    }
    case "affirm": {
      const [P, Q] = g.pick(PAIRS);
      return mk(`Jika ${P}, maka ${Q}. Ternyata ${Q}. Kesimpulan manakah yang PASTI benar?`,
        O(`Tidak ada kesimpulan pasti tentang apakah ${P}.`, [`Pasti ${P}.`, `Pasti tidak benar bahwa ${P}.`, `Tidak benar bahwa ${Q}.`]),
        `Mengafirmasi konsekuen adalah kekeliruan logika: ${Q} bisa terjadi karena sebab lain, sehingga ${P} tidak pasti.`);
    }
    case "undistributed":
      return mk(`Sebagian ${A} adalah ${B}. Sebagian ${B} adalah ${C}. Kesimpulan manakah yang PASTI benar?`,
        O(`Tidak ada kesimpulan pasti tentang hubungan ${A} dan ${C}.`, [`Sebagian ${A} adalah ${C}.`, `Semua ${A} adalah ${C}.`, `Tidak ada ${A} yang merupakan ${C}.`]),
        `Bagian ${B} yang beririsan dengan ${A} belum tentu sama dengan bagian ${B} yang beririsan dengan ${C}.`);
    case "camestres":
      return mk(`Tidak ada ${A} yang merupakan ${B}. Semua ${C} adalah ${B}. Kesimpulan manakah yang PASTI benar?`,
        O(`Tidak ada ${A} yang merupakan ${C}.`, [`Semua ${A} adalah ${C}.`, `Sebagian ${A} adalah ${C}.`, `Semua ${C} adalah ${A}.`]),
        `${C} berada seluruhnya di dalam ${B}, sedangkan ${A} tidak memiliki anggota di ${B}; jadi ${A} dan ${C} tidak beririsan.`);
    case "bocardo":
      return mk(`Semua ${A} adalah ${B}. Sebagian ${C} bukan ${B}. Kesimpulan manakah yang PASTI benar?`,
        O(`Sebagian ${C} bukan ${A}.`, [`Semua ${C} adalah ${A}.`, `Semua ${C} bukan ${A}.`, `Sebagian ${A} bukan ${B}.`]),
        `${C} yang berada di luar ${B} pasti di luar ${A} (karena semua ${A} ada di ${B}).`);
    case "chain4":
      return mk(`Semua ${A} adalah ${B}. Semua ${B} adalah ${C}. Tidak ada ${C} yang merupakan ${D}. Kesimpulan manakah yang PASTI benar?`,
        O(`Tidak ada ${A} yang merupakan ${D}.`, [`Sebagian ${A} adalah ${D}.`, `Semua ${D} adalah ${A}.`, `Semua ${A} adalah ${D}.`]),
        `${A} ⊂ ${B} ⊂ ${C}, dan ${C} terpisah dari ${D}; maka ${A} terpisah dari ${D}.`);
    case "chainCond": {
      const ps = g.sample(PAIRS.map((p) => p[0]).concat(PAIRS.map((p) => p[1])), 4);
      return mk(`Jika ${ps[0]}, maka ${ps[1]}. Jika ${ps[1]}, maka ${ps[2]}. Jika ${ps[2]}, maka ${ps[3]}. Ternyata tidak benar bahwa ${ps[3]}. Kesimpulan manakah yang PASTI benar?`,
        O(`Tidak benar bahwa ${ps[0]}.`, [`${cap(ps[0])}.`, `${cap(ps[1])}.`, `Tidak ada kesimpulan yang dapat ditarik.`]),
        `Rantai ${ps[0]} → ${ps[1]} → ${ps[2]} → ${ps[3]}; karena ujungnya tidak terjadi, seluruh rantai ke belakang tidak terjadi (kontraposisi).`);
    }
  }
}
export const SYL = {
  easy: ["barbara", "tollens"],
  normal: ["barbara", "celarent", "darii", "tollens"],
  hard: ["celarent", "darii", "affirm", "undistributed", "camestres", "bocardo"],
  extreme: ["affirm", "undistributed", "camestres", "bocardo", "chain4", "chainCond"],
};

/* ---------- 3. Jujur-bohong (dicek brute force) ---------- */
function liars(g, n) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const ppl = g.sample(NAMES, n);
    const stmts = ppl.map((_, i) => {
      const others = ppl.map((_, j) => j).filter((j) => j !== i);
      const kind = g.pick(["jujur", "bohong", "bohong", "jujur", "count"]);
      if (kind === "count") {
        const k = g.int(0, n);
        return { text: `"Tepat ${k} orang di antara kami ${n === 3 ? "bertiga" : "berempat"} yang berbohong."`, f: (a) => a.filter((v) => !v).length === k };
      }
      const j = g.pick(others);
      if (kind === "jujur") return { text: `"${ppl[j]} berkata jujur."`, f: (a) => a[j] };
      return { text: `"${ppl[j]} berbohong."`, f: (a) => !a[j] };
    });
    const sols = [];
    for (let mask = 0; mask < 1 << n; mask++) {
      const a = ppl.map((_, i) => !!((mask >> i) & 1));
      if (stmts.every((s, i) => a[i] === s.f(a))) sols.push(a);
    }
    if (sols.length !== 1) continue;
    const sol = sols[0];
    const liarsSet = ppl.filter((_, i) => !sol[i]);
    if (liarsSet.length < 1 || liarsSet.length === n) continue;
    const label = (set) => (set.length === 0 ? "Tidak ada yang berbohong" : set.length === 1 ? `${set[0]} saja` : set.length === 2 ? set.join(" dan ") : set.slice(0, -1).join(", ") + ", dan " + set[set.length - 1]);
    const correct = label(liarsSet);
    const wrongs = [];
    for (let mask = 0; mask < 1 << n; mask++) {
      const set = ppl.filter((_, i) => (mask >> i) & 1);
      if (set.length === 0 || set.length === n) continue;
      const l = label(set);
      if (l !== correct) wrongs.push(l);
    }
    const intro = `Setiap orang hanya selalu berkata jujur atau selalu berbohong. ${ppl.map((p, i) => `${p} berkata: ${stmts[i].text}`).join(" ")} Siapa saja yang berbohong?`;
    return mk(intro, buildOptions(g, correct, g.shuffle(wrongs)), `Uji kemungkinan jujur/bohong tiap orang: hanya satu kombinasi yang konsisten dengan semua pernyataan, yaitu yang berbohong: ${correct.toLowerCase()}.`);
  }
  throw new Error("Gagal membuat soal jujur-bohong");
}

/* ---------- 4. Susunan tempat duduk (brute force) ---------- */
function perms(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
}
function seating(g, n) {
  const people = g.sample(NAMES, n);
  const all = perms(people);
  const truth = g.pick(all);
  const pos = (arr, p) => arr.indexOf(p);
  const clueMakers = [
    (p) => { const a = g.pick(p); const last = g.chance(0.5); return { text: `${a} duduk di ujung ${last ? "paling kanan" : "paling kiri"}`, f: (arr) => (last ? pos(arr, a) === n - 1 : pos(arr, a) === 0) }; },
    (p) => { const [a, b] = g.sample(p, 2); return { text: `${a} duduk tepat di sebelah ${b}`, f: (arr) => Math.abs(pos(arr, a) - pos(arr, b)) === 1 }; },
    (p) => { const [a, b] = g.sample(p, 2); return { text: `${a} duduk langsung di sebelah kiri ${b}`, f: (arr) => pos(arr, a) + 1 === pos(arr, b) }; },
    (p) => { const [a, b] = g.sample(p, 2); return { text: `${a} tidak duduk bersebelahan dengan ${b}`, f: (arr) => Math.abs(pos(arr, a) - pos(arr, b)) > 1 }; },
    (p) => { const [a, b] = g.sample(p, 2); return { text: `${a} duduk di sebelah kiri ${b} (tidak harus bersebelahan)`, f: (arr) => pos(arr, a) < pos(arr, b) }; },
    (p) => { const [a, b, c] = g.sample(p, 3); return { text: `${a} duduk tepat di antara ${b} dan ${c}`, f: (arr) => Math.abs(pos(arr, b) - pos(arr, c)) === 2 && pos(arr, a) === (pos(arr, b) + pos(arr, c)) / 2 }; },
    (p) => { const a = g.pick(p); const k = g.int(1, n); return { text: `${a} duduk pada urutan ke-${k} dari kiri`, f: (arr) => pos(arr, a) === k - 1 }; },
  ];
  const clues = [];
  let sols = all;
  let guard = 0;
  while (sols.length > 1 && guard++ < 200) {
    const c = clueMakers[g.int(0, clueMakers.length - 1)](people);
    if (!c.f(truth)) continue;
    const next = sols.filter((s) => c.f(s));
    if (next.length < sols.length) { clues.push(c); sols = next; }
  }
  if (sols.length !== 1) return seating(g, n);
  // buang petunjuk redundan agar soal tidak terlalu mudah
  for (let i = clues.length - 1; i >= 0; i--) {
    const rest = clues.filter((_, j) => j !== i);
    if (all.filter((s) => rest.every((c) => c.f(s))).length === 1) clues.splice(i, 1);
  }
  const k = g.int(1, n);
  const ans = truth[k - 1];
  return mk(`${n} orang (${people.join(", ")}) duduk berjajar dalam satu baris menghadap ke depan. ${g.shuffle(clues).map((c) => cap(c.text) + ".").join(" ")} Siapa yang duduk pada urutan ke-${k} dari kiri?`,
    buildOptions(g, ans, people.filter((p) => p !== ans), () => g.pick(NAMES.filter((x) => !people.includes(x)))),
    `Dari semua petunjuk hanya satu susunan yang cocok: ${truth.join(" – ")}. Urutan ke-${k} dari kiri adalah ${ans}.`);
}

/* ---------- 5. Hari/kalender ---------- */
const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
function days(g, level) {
  const d = g.int(0, 6);
  if (level === 0) {
    const off = g.int(1, 3), ask = g.pick([-2, -1, 1, 2, 3].filter((x) => x !== off));
    const ref = ["kemarin", "besok", "lusa", "kemarin lusa"], refV = [-1, 1, 2, -2];
    const ri = g.int(0, 3);
    const today = (d - refV[ri] + 70) % 7;
    const targets = [["kemarin", -1], ["besok", 1], ["lusa", 2], ["kemarin lusa", -2]];
    const [tn, tv] = g.pick(targets.filter((t) => t[1] !== refV[ri]));
    const ans = DAYS[(today + tv + 70) % 7];
    return mk(`Jika ${ref[ri]} adalah hari ${DAYS[d]}, maka ${tn} adalah hari apa?`, buildOptions(g, ans, DAYS.filter((x) => x !== ans)), `Hari ini = ${DAYS[today]}; ${tn} = ${ans}.`);
  }
  const n = g.int(10, level === 1 ? 60 : 200);
  const dir = g.chance(0.5) ? 1 : -1;
  const ans = DAYS[(d + dir * n + 7 * 40) % 7];
  return mk(`Hari ini adalah hari ${DAYS[d]}. Hari apakah ${n} hari ${dir === 1 ? "setelah" : "sebelum"} hari ini?`,
    buildOptions(g, ans, DAYS.filter((x) => x !== ans)), `${n} mod 7 = ${n % 7}, maka bergeser ${n % 7} hari ${dir === 1 ? "maju" : "mundur"} dari ${DAYS[d]} menjadi ${ans}.`);
}

/* ---------- 6. Tiga kotak berlabel salah ---------- */
const FRUITS = ["apel", "jeruk", "mangga", "pisang", "anggur", "melon", "pir", "nanas"];
function boxes(g) {
  const [a, b] = g.sample(FRUITS, 2);
  const pick = g.pick(["campuran", a, b]);
  const lbl = (x) => (x === "campuran" ? `"${a} + ${b}"` : `"${x}"`);
  return mk(`Ada tiga kotak berlabel: "${a}", "${b}", dan "${a} + ${b}". Satu kotak berisi ${a} saja, satu berisi ${b} saja, dan satu berisi campuran keduanya, tetapi SEMUA label salah. Kamu mengambil satu buah dari kotak berlabel "${a} + ${b}" dan ternyata itu ${a}. Apa isi kotak berlabel "${b}"?`,
    buildOptions(g, `Campuran ${a} + ${b}`, [`${cap(b)} saja`, `${cap(a)} saja`, "Tidak dapat ditentukan"]),
    `Kotak berlabel "${a} + ${b}" pasti salah label, dan buah yang keluar ${a}, maka isinya ${a} saja. Kotak berlabel "${b}" tidak boleh ${b} saja dan ${a} saja sudah terpakai, jadi isinya campuran.`);
}

export const easyLogic = [
  { w: 8, f: (g) => ordering(g, 3, g.pick(["top", "bottom"])) },
  { w: 6, f: (g) => syllogism(g, SYL.easy) },
  { w: 6, f: (g) => days(g, 0) },
];
export const normalLogic = [
  { w: 5, f: (g) => ordering(g, 4, g.pick(["top", "bottom", "mid"])) },
  { w: 5, f: (g) => syllogism(g, SYL.normal) },
  { w: 4, f: (g) => liars(g, 3) },
  { w: 3, f: (g) => seating(g, 4) },
  { w: 3, f: (g) => days(g, 1) },
];
export const hardLogic = [
  { w: 3, f: (g) => ordering(g, 5, g.pick(["mid", "mid", "top"])) },
  { w: 5, f: (g) => syllogism(g, SYL.hard) },
  { w: 4, f: (g) => liars(g, 3) },
  { w: 5, f: (g) => seating(g, 5) },
  { w: 3, f: (g) => days(g, 2) },
];
export const extremeLogic = [
  { w: 2, f: (g) => ordering(g, 6, "mid") },
  { w: 5, f: (g) => syllogism(g, SYL.extreme) },
  { w: 5, f: (g) => liars(g, 4) },
  { w: 6, f: (g) => seating(g, 6) },
  { w: 2, f: (g) => boxes(g) },
];
