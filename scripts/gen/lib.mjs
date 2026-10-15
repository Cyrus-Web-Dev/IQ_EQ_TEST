// Utilitas bersama generator soal. Semua deterministik (seed) supaya hasil JSON bisa direproduksi.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  const r = mulberry32(seed);
  const rng = {
    next: r,
    int: (a, b) => a + Math.floor(r() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
    shuffle: (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    sample: (arr, n) => rng.shuffle(arr).slice(0, n),
  };
  return rng;
}

/** Susun 4 opsi (1 benar + 3 salah unik). `wrongs` urut prioritas; sisanya diisi fallback. */
export function buildOptions(rng, correct, wrongs, fallback = () => null) {
  const c = String(correct);
  const seen = new Set([c.toLowerCase()]);
  const picked = [];
  for (const w of wrongs) {
    const s = String(w);
    if (w === null || w === undefined || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    picked.push(s);
  }
  // wrongs berprioritas: ambil acak 3 dari semua kandidat valid supaya distraktor bervariasi
  let wrongPool = rng.shuffle(picked);
  let guard = 0;
  while (wrongPool.length < 3 && guard++ < 200) {
    const f = fallback();
    if (f === null || f === undefined) break;
    const s = String(f);
    if (seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    wrongPool.push(s);
  }
  if (wrongPool.length < 3) throw new Error("Distraktor kurang untuk jawaban " + c);
  const opts = rng.shuffle([c, ...wrongPool.slice(0, 3)]);
  return { options: opts, correct: opts.indexOf(c) };
}

/** Opsi numerik: trap (kesalahan umum) + fallback ±k di sekitar jawaban. */
export function numOptions(rng, ans, traps = [], { spread = 6, allowNegative = false, fmt = String } = {}) {
  const valid = (n) => Number.isFinite(n) && n !== ans && (allowNegative || n >= 0);
  const cand = traps.filter(valid).map((n) => fmt(n));
  const fb = () => {
    const k = rng.int(1, spread) * (rng.chance(0.5) ? 1 : -1);
    const n = ans + k;
    return valid(n) ? fmt(n) : null;
  };
  return buildOptions(rng, fmt(ans), cand, fb);
}

export const rp = (n) => "Rp" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const frac = (n, d) => {
  const g = gcd(n, d);
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
};
export const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
export const comb = (n, k) => fact(n) / (fact(k) * fact(n - k));
export const digitSum = (n) => String(n).split("").reduce((a, d) => a + Number(d), 0);
export const reverseNum = (n) => Number(String(n).split("").reverse().join(""));
export const PRIMES = (() => {
  const out = [];
  for (let n = 2; out.length < 60; n++) if (out.every((p) => n % p !== 0)) out.push(n);
  return out;
})();

export const NAMES = ["Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hana", "Indra", "Joko", "Kiki", "Lina", "Maya", "Nando", "Oki", "Putri", "Rizky", "Sari", "Tono", "Umar", "Vina", "Wawan", "Yuni", "Zaki", "Bayu", "Dian", "Farhan", "Intan", "Reza", "Salsa"];

/**
 * Jalankan generator `fn` berulang sampai terkumpul `count` soal dengan teks unik.
 * `seenTexts` dibagi lintas-generator agar tidak ada teks kembar.
 */
export function collect(count, fn, seenTexts, label) {
  const out = [];
  let guard = 0;
  while (out.length < count) {
    if (guard++ > count * 400) throw new Error(`Gagal mengumpulkan ${count} soal unik untuk ${label} (dapat ${out.length})`);
    let q;
    try { q = fn(out.length, guard); } catch { continue; }
    const key = q.question.toLowerCase().replace(/\s+/g, " ").trim();
    if (seenTexts.has(key)) continue;
    seenTexts.add(key);
    out.push(q);
  }
  return out;
}
