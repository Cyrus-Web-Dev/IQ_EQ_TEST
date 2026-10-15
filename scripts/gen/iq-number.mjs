import { buildOptions, digitSum, fact, numOptions, PRIMES, reverseNum } from "./lib.mjs";

const show = (terms, hideIdx = -1) => terms.map((t, i) => (i === hideIdx ? "?" : t)).join(", ") + (hideIdx < 0 ? ", ..." : "") + (hideIdx < 0 ? " ?" : "");

/** Bangun soal pola: tampilkan `shownCount` suku pertama dari `seq`, tanyakan suku berikutnya. */
function nextTerm(g, seq, shownCount, explanation, opt = {}) {
  const shown = seq.slice(0, shownCount);
  const ans = seq[shownCount];
  const last = shown[shown.length - 1];
  const prev = shown[shown.length - 2];
  const traps = [last + (last - prev), ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, Math.round(ans * 1.1)];
  if (prev) traps.push(Math.round((last * last) / prev));
  const o = numOptions(g, ans, traps, { allowNegative: opt.allowNegative ?? false });
  return {
    category: "number_pattern",
    question: `Lanjutkan pola angka berikut: ${shown.join(", ")}, ... ?`,
    ...o,
    explanation,
  };
}

/** Soal suku hilang di tengah. */
function missingTerm(g, seq, hide, explanation) {
  const ans = seq[hide];
  const d = seq[hide + 1] - seq[hide - 1];
  const traps = [ans + 1, ans - 1, ans + 2, ans - 2, Math.round((seq[hide - 1] + seq[hide + 1]) / 2), seq[hide - 1] + d];
  const o = numOptions(g, ans, traps);
  return {
    category: "number_pattern",
    question: `Tentukan angka yang hilang pada pola berikut: ${show(seq, hide)}`,
    ...o,
    explanation,
  };
}

const gen = (n, f) => Array.from({ length: n }, (_, i) => f(i));
const sgn = (v) => (v >= 0 ? "+" : "−") + " " + Math.abs(v);
const polyStr = (p, q, r) => `${p === 1 ? "" : p}n²${q === 0 ? "" : " " + (q >= 0 ? "+" : "−") + " " + (Math.abs(q) === 1 ? "" : Math.abs(q)) + "n"}${r === 0 ? "" : " " + sgn(r)}`;

export const easyPatterns = [
  (g) => {
    const d = g.int(2, 9), s = g.int(1, 30);
    const seq = gen(7, (i) => s + i * d);
    return nextTerm(g, seq, 5, `Setiap suku bertambah ${d}, sehingga suku berikutnya ${seq[4]} + ${d} = ${seq[5]}.`);
  },
  (g) => {
    const r = g.pick([2, 3]), s = g.int(1, 5);
    const seq = gen(6, (i) => s * r ** i);
    return nextTerm(g, seq, 4, `Setiap suku dikalikan ${r}, sehingga ${seq[3]} × ${r} = ${seq[4]}.`);
  },
  (g) => {
    const d = g.int(3, 9), s = g.int(45, 100);
    const seq = gen(7, (i) => s - i * d);
    return nextTerm(g, seq, 5, `Setiap suku berkurang ${d}, sehingga ${seq[4]} − ${d} = ${seq[5]}.`);
  },
  (g) => {
    const k = g.int(2, 9);
    const seq = gen(6, (i) => (k + i) ** 2);
    return nextTerm(g, seq, 4, `Pola bilangan kuadrat berurutan (${k}², ${k + 1}², ...). Suku berikutnya ${k + 4}² = ${seq[4]}.`);
  },
  (g) => {
    const a = g.int(2, 7), b = g.int(1, 4), s = g.int(1, 20);
    const seq = [s];
    for (let i = 1; i < 8; i++) seq.push(seq[i - 1] + (i % 2 ? a : b));
    return nextTerm(g, seq, 6, `Pola berselang-seling: +${a}, +${b}, +${a}, +${b}, ... Setelah +${b} berikutnya +${a}: ${seq[5]} + ${a} = ${seq[6]}.`);
  },
  (g) => {
    const s = g.int(1, 8), d0 = g.int(1, 2);
    const seq = [s];
    for (let i = 0; i < 7; i++) seq.push(seq[i] + d0 + i);
    return nextTerm(g, seq, 5, `Selisih antar suku naik 1 tiap langkah (${d0}, ${d0 + 1}, ${d0 + 2}, ...). Selisih berikutnya ${d0 + 4}: ${seq[4]} + ${d0 + 4} = ${seq[5]}.`);
  },
  (g) => {
    const a = g.int(1, 5), b = g.int(1, 6);
    const seq = [a, b];
    for (let i = 2; i < 8; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return nextTerm(g, seq, 6, `Setiap suku adalah jumlah dua suku sebelumnya: ${seq[4]} + ${seq[5]} = ${seq[6]}.`);
  },
  (g) => {
    const step = g.int(3, 12), k = g.int(1, 6);
    const seq = gen(6, (i) => step * (k + i));
    return missingTerm(g, seq, g.int(1, 4), `Beda tiap suku adalah ${step} (kelipatan ${step} berurutan), sehingga suku yang hilang melengkapi pola tersebut.`);
  },
  (g) => {
    const s = g.int(1, 9), m = g.pick([5, 10, 20]);
    const seq = [];
    for (let i = 0; i < 4; i++) seq.push(s + i, (s + i) * m);
    return nextTerm(g, seq, 7, `Ada dua pola bergantian: bilangan naik 1 (${s}, ${s + 1}, ...) dan kelipatan ${m} dari bilangan itu. Suku berikutnya adalah kelipatan ${m} dari ${s + 3} = ${seq[7]}.`);
  },
];

export const normalPatterns = [
  (g) => {
    const s = g.int(1, 10), d0 = g.int(1, 4), k = g.int(1, 3);
    const seq = [s];
    for (let i = 0; i < 8; i++) seq.push(seq[i] + d0 + i * k);
    return nextTerm(g, seq, 6, `Selisih antar suku: ${d0}, ${d0 + k}, ${d0 + 2 * k}, ... (naik ${k} tiap langkah). Selisih berikutnya ${d0 + 5 * k}, jadi ${seq[5]} + ${d0 + 5 * k} = ${seq[6]}.`);
  },
  (g) => {
    const a = g.pick([2, 3]), b = g.pick([-2, -1, 1, 2, 3]), s = g.int(2, 6);
    const seq = [s];
    for (let i = 0; i < 7; i++) seq.push(seq[i] * a + b);
    const sign = b >= 0 ? `+ ${b}` : `− ${-b}`;
    return nextTerm(g, seq, 5, `Setiap suku = suku sebelumnya × ${a} ${sign}. Jadi ${seq[4]} × ${a} ${sign} = ${seq[5]}.`);
  },
  (g) => {
    const k0 = g.int(1, 4), c = g.pick([0, 0, 1, -1, 2]);
    const seq = gen(7, (i) => (k0 + i) ** 3 + c);
    const cs = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`;
    return nextTerm(g, seq, 4, `Suku berpola n³${cs} dengan n = ${k0}, ${k0 + 1}, ... Suku berikutnya ${k0 + 4}³${cs} = ${seq[4]}.`);
  },
  (g) => {
    const a = g.int(1, 9), d = g.int(2, 6), b = g.int(1, 3), m = g.pick([2, 3]);
    const A = (i) => a + d * i, B = (i) => b * m ** i;
    const seq = [];
    for (let i = 0; i < 5; i++) seq.push(A(i), B(i));
    const shown = g.chance(0.5) ? 7 : 6;
    return nextTerm(g, seq, shown, `Ada dua pola bergantian: suku ganjil naik ${d} (${a}, ${A(1)}, ${A(2)}, ...) dan suku genap dikali ${m} (${b}, ${B(1)}, ${B(2)}, ...). Suku berikutnya = ${seq[shown]}.`);
  },
  (g) => {
    const st = g.int(0, 6);
    const seq = PRIMES.slice(st, st + 8);
    return nextTerm(g, seq, 5, `Barisan bilangan prima berurutan. Bilangan prima setelah ${seq[4]} adalah ${seq[5]}.`);
  },
  (g) => {
    const st = g.int(1, 4);
    const tri = (n) => (n * (n + 1)) / 2;
    const seq = gen(8, (i) => tri(st + i));
    return nextTerm(g, seq, 5, `Bilangan segitiga: selisih antar suku naik 1 tiap langkah (${st + 1}, ${st + 2}, ...). Suku berikutnya ${seq[4]} + ${st + 5} = ${seq[5]}.`);
  },
  (g) => {
    const a = g.int(2, 9), b = g.int(1, 9);
    const seq = [a, b];
    for (let i = 2; i < 9; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return nextTerm(g, seq, 7, `Setiap suku adalah jumlah dua suku sebelumnya: ${seq[5]} + ${seq[6]} = ${seq[7]}.`);
  },
  (g) => {
    const s = g.int(2, 6), k = g.int(1, 5);
    if (s === k) return normalPatterns[7](g);
    const seq = [s];
    for (let i = 0; i < 8; i++) seq.push(i % 2 === 0 ? seq[i] * 2 : seq[i] - k);
    return nextTerm(g, seq, 6, `Operasi berselang-seling: ×2, −${k}, ×2, −${k}, ... Setelah ×2 berikutnya −${k}: ${seq[5]} − ${k} = ${seq[6]}.`);
  },
  (g) => {
    const c = g.pick([1, 2, 3]), st = g.int(1, 4);
    const f = (n) => n * (n + c);
    const seq = gen(8, (i) => f(st + i));
    return nextTerm(g, seq, 5, `Suku ke-n berpola n × (n + ${c}) dengan n mulai ${st}. Suku berikutnya ${st + 5} × ${st + 5 + c} = ${seq[5]}.`);
  },
  (g) => {
    const p = g.int(1, 3), c = g.int(-4, 6);
    const seq = gen(7, (i) => p * (i + 1) ** 2 + c);
    return missingTerm(g, seq, g.int(2, 4), `Suku ke-n berpola ${polyStr(p, 0, c)} (n = 1, 2, 3, ...). Suku yang hilang mengikuti rumus tersebut.`);
  },
];

export const hardPatterns = [
  (g) => {
    const s = g.int(1, 3);
    const seq = [s];
    for (let i = 1; i < 8; i++) seq.push(seq[i - 1] * 2 + i);
    return nextTerm(g, seq, 5, `Setiap suku = 2 × suku sebelumnya + n (n = 1, 2, 3, ...). Jadi ${seq[4]} × 2 + 5 = ${seq[5]}.`);
  },
  (g) => {
    const a = g.int(0, 3), b = g.int(1, 3), c = g.int(1, 4);
    const seq = [a, b, c];
    for (let i = 3; i < 10; i++) seq.push(seq[i - 1] + seq[i - 2] + seq[i - 3]);
    return nextTerm(g, seq, 7, `Setiap suku adalah jumlah tiga suku sebelumnya: ${seq[4]} + ${seq[5]} + ${seq[6]} = ${seq[7]}.`);
  },
  (g) => {
    const st = g.int(2, 4);
    const seq = gen(8, (i) => (st + i) ** 3 - (st + i));
    return nextTerm(g, seq, 5, `Suku ke-n berpola n³ − n dengan n mulai ${st}. Suku berikutnya ${st + 5}³ − ${st + 5} = ${seq[5]}.`);
  },
  (g) => {
    const st = g.int(1, 2);
    const seq = [];
    for (let i = 0; i < 6; i++) seq.push((st + i) ** 2, (st + i) ** 3);
    const shown = 7;
    return nextTerm(g, seq, shown, `Dua pola bergantian: kuadrat (${st}², ${st + 1}², ...) dan pangkat tiga (${st}³, ${st + 1}³, ...). Suku berikutnya ${st + 3}³ = ${seq[shown]}.`);
  },
  (g) => {
    const s = g.int(1, 9), r = g.pick([2, 3]), d0 = g.int(1, 3);
    const seq = [s];
    for (let i = 0; i < 8; i++) seq.push(seq[i] + d0 * r ** i);
    return nextTerm(g, seq, 6, `Selisih antar suku: ${d0}, ${d0 * r}, ${d0 * r * r}, ... (dikali ${r} tiap langkah). Selisih berikutnya ${d0 * r ** 5}: ${seq[5]} + ${d0 * r ** 5} = ${seq[6]}.`);
  },
  (g) => {
    const s = g.int(7, 29);
    const seq = [s];
    for (let i = 0; i < 8; i++) seq.push(seq[i] + digitSum(seq[i]));
    return nextTerm(g, seq, 5, `Setiap suku = suku sebelumnya + jumlah digitnya. ${seq[4]} + ${digitSum(seq[4])} = ${seq[5]}.`);
  },
  (g) => {
    const st = g.int(2, 4);
    const seq = gen(7, (i) => fact(st + i));
    return nextTerm(g, seq, 5, `Barisan faktorial berurutan (${st}!, ${st + 1}!, ...). Suku berikutnya ${st + 5}! = ${seq[5]}.`);
  },
  (g) => {
    const a = g.int(1, 4), b = g.int(2, 5);
    const seq = [a, b];
    for (let i = 2; i < 9; i++) seq.push(seq[i - 1] + seq[i - 2] + 1);
    return nextTerm(g, seq, 6, `Setiap suku = jumlah dua suku sebelumnya + 1: ${seq[4]} + ${seq[5]} + 1 = ${seq[6]}.`);
  },
  (g) => {
    const s = g.int(2, 6), a = g.pick([2, 3]), b = g.int(2, 5), c = g.int(1, 4);
    const seq = [s];
    for (let i = 0; i < 9; i++) seq.push(i % 3 === 0 ? seq[i] * a : i % 3 === 1 ? seq[i] + b : seq[i] - c);
    return nextTerm(g, seq, 7, `Tiga operasi berulang: ×${a}, +${b}, −${c}. Setelah −${c} kembali ke ×${a}: ${seq[6]} × ${a} = ${seq[7]}.`);
  },
  (g) => {
    const k = g.int(1, 2);
    const seq = [0];
    for (let n = 1; n < 9; n++) seq.push(seq[n - 1] + (n + k - 1) ** 2);
    const sub = seq.slice(1);
    return nextTerm(g, sub, 5, `Selisih antar suku adalah bilangan kuadrat berurutan (${k}², ${k + 1}², ...). Suku berikutnya ${sub[4]} + ${k + 5}² = ${sub[5]}.`);
  },
];

export const extremePatterns = [
  (g) => {
    const a = g.int(1, 2), b = g.int(2, 3);
    const seq = [a, b];
    for (let i = 2; i < 9; i++) seq.push(2 * seq[i - 1] + seq[i - 2]);
    return nextTerm(g, seq, 6, `Setiap suku = 2 × suku sebelumnya + suku dua langkah sebelumnya: 2 × ${seq[5]} + ${seq[4]} = ${seq[6]}.`);
  },
  (g) => {
    const s = g.pick([2, 3]), c = g.pick([1, 2, 3]);
    const seq = [s];
    for (let i = 0; i < 4; i++) seq.push(seq[i] ** 2 - c);
    if (seq[1] <= seq[0] || seq[2] <= seq[1]) return extremePatterns[1](g);
    return nextTerm(g, seq, 3, `Setiap suku = kuadrat suku sebelumnya − ${c}. Jadi ${seq[2]}² − ${c} = ${seq[3]}.`);
  },
  (g) => {
    const a = g.int(1, 9), da = g.int(2, 5), b = g.int(1, 3), c = g.int(30, 60), dc = g.int(2, 5);
    const seq = [];
    for (let i = 0; i < 4; i++) seq.push(a + da * i, b * 2 ** i, c - dc * i);
    const shown = 7;
    return nextTerm(g, seq, shown, `Tiga pola bergantian: (+${da}), (×2), (−${dc}). Suku berikutnya masuk pola kedua (×2): ${seq[4]} × 2 = ${seq[shown]}.`);
  },
  (g) => {
    const n0 = g.int(1, 2), sub = g.pick([0, 0, 1]);
    const seq = gen(7, (i) => (n0 + i) ** (n0 + i) - sub);
    return nextTerm(g, seq, 4, `Suku ke-n berpola nⁿ${sub ? " − 1" : ""}. Suku berikutnya ${n0 + 4}^${n0 + 4}${sub ? " − 1" : ""} = ${seq[4]}.`);
  },
  (g) => {
    let s = g.int(12, 19);
    if (s === 11) s = 12;
    const seq = [s];
    for (let i = 0; i < 6; i++) seq.push(seq[i] + reverseNum(seq[i]));
    return nextTerm(g, seq, 4, `Setiap suku = suku sebelumnya + balikan angkanya. ${seq[3]} + ${reverseNum(seq[3])} = ${seq[4]}.`);
  },
  (g) => {
    const m = g.int(1, 3), st = g.int(1, 2);
    const seq = gen(8, (i) => fact(st + i) + m * (st + i));
    return nextTerm(g, seq, 5, `Suku ke-n berpola n! + ${m === 1 ? "" : m}n dengan n mulai ${st}. Suku berikutnya ${st + 5}! + ${m * (st + 5)} = ${seq[5]}.`);
  },
  (g) => {
    const p = g.int(2, 4), q = g.int(-3, 5), r = g.int(-5, 5);
    const seq = gen(8, (i) => p * (i + 1) ** 2 + q * (i + 1) + r);
    return missingTerm(g, seq, g.int(2, 4), `Suku ke-n berpola ${polyStr(p, q, r)} (n = 1, 2, 3, ...). Substitusi n untuk posisi yang hilang.`);
  },
  (g) => {
    const a = g.int(1, 3), b = g.int(1, 3);
    const seq = [a, b];
    for (let i = 2; i < 9; i++) seq.push(seq[i - 1] + 2 * seq[i - 2]);
    return nextTerm(g, seq, 6, `Setiap suku = suku sebelumnya + 2 × suku dua langkah sebelumnya: ${seq[5]} + 2 × ${seq[4]} = ${seq[6]}.`);
  },
  (g) => {
    const st = g.int(0, 8);
    const seq = gen(8, (i) => PRIMES[st + i] + PRIMES[st + i + 1]);
    return nextTerm(g, seq, 5, `Setiap suku adalah jumlah dua bilangan prima berurutan (${PRIMES[st]}+${PRIMES[st + 1]}, ${PRIMES[st + 1]}+${PRIMES[st + 2]}, ...). Suku berikutnya ${PRIMES[st + 5]} + ${PRIMES[st + 6]} = ${seq[5]}.`);
  },
  (g) => {
    const s = g.int(1, 9), st = g.int(0, 3);
    const seq = [s];
    for (let i = 0; i < 8; i++) seq.push(seq[i] + PRIMES[st + i]);
    return nextTerm(g, seq, 6, `Selisih antar suku adalah bilangan prima berurutan (${PRIMES[st]}, ${PRIMES[st + 1]}, ...). Selisih berikutnya ${PRIMES[st + 5]}: ${seq[5]} + ${PRIMES[st + 5]} = ${seq[6]}.`);
  },
];
