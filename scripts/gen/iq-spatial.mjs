import { buildOptions, comb, numOptions } from "./lib.mjs";

const mk = (q, o, explanation) => ({ category: "spatial_logic", question: q, ...o, explanation });

const DIR4 = ["Utara", "Timur", "Selatan", "Barat"];
const DIR8 = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];

function facing(g, nTurns, eight) {
  const dirs = eight ? DIR8 : DIR4, step = eight ? 1 : 1, unit = eight ? 45 : 90, size = dirs.length;
  let idx = g.int(0, size - 1);
  const start = dirs[idx];
  const turns = [];
  for (let i = 0; i < nTurns; i++) {
    const kinds = eight
      ? [["belok kanan 90°", 2], ["belok kiri 90°", -2], ["belok kanan 45°", 1], ["belok kiri 45°", -1], ["berbalik arah (180°)", 4]]
      : [["belok kanan", 1], ["belok kiri", -1], ["berbalik arah (putar 180°)", 2]];
    const [txt, delta] = g.pick(kinds);
    turns.push(txt);
    idx = (idx + delta + size * 4) % size;
  }
  const ans = dirs[idx];
  const wrongs = dirs.filter((d) => d !== ans);
  return mk(`Seseorang menghadap ke arah ${start}. Ia ${turns.join(", lalu ")}. Sekarang ia menghadap ke arah mana?`,
    buildOptions(g, ans, wrongs), `Hitung perubahan arah satu per satu mulai dari ${start}; hasil akhirnya menghadap ${ans}.`);
}

const TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]];
function gridWalk(g, extra) {
  const [a, b, c] = g.pick(TRIPLES);
  const ex = g.int(1, extra), ey = g.int(1, extra);
  const dirX = g.pick(["timur", "barat"]), dirY = g.pick(["utara", "selatan"]);
  const opX = dirX === "timur" ? "barat" : "timur", opY = dirY === "utara" ? "selatan" : "utara";
  const moves = g.shuffle([`${a + ex} langkah ke ${dirX}`, `${ex} langkah ke ${opX}`, `${b + ey} langkah ke ${dirY}`, `${ey} langkah ke ${opY}`]);
  return mk(`Dari titik awal, seseorang berjalan: ${moves.join(", lalu ")}. Berapa langkah jarak garis lurus dari titik awal ke posisi akhirnya?`,
    numOptions(g, c, [a + b, a + b + ex + ey, c + 1, c - 1, a * 2], { spread: 3 }), `Perpindahan bersih: ${a} langkah horizontal dan ${b} langkah vertikal. Jarak = √(${a}² + ${b}²) = ${c}.`);
}

function paintedCube(g, tier) {
  const n = g.int(3, tier === "easy" ? 4 : tier === "normal" ? 5 : 7);
  const k = g.pick([3, 2, 1, 0]);
  const ans = k === 3 ? 8 : k === 2 ? 12 * (n - 2) : k === 1 ? 6 * (n - 2) ** 2 : (n - 2) ** 3;
  const kk = k === 0 ? "tidak terkena cat sama sekali" : `terkena cat tepat pada ${k} sisi`;
  const expl = k === 3 ? "Kubus kecil di 8 sudut kubus besar memiliki 3 sisi bercat." : k === 2 ? `Kubus kecil di rusuk (bukan sudut): 12 rusuk × (${n} − 2) = ${ans}.` : k === 1 ? `Kubus kecil di tengah tiap sisi: 6 × (${n} − 2)² = ${ans}.` : `Kubus di bagian dalam: (${n} − 2)³ = ${ans}.`;
  return mk(`Sebuah kubus besar berukuran ${n} × ${n} × ${n} dicat pada seluruh permukaannya, lalu dipotong menjadi kubus-kubus kecil berukuran 1 × 1 × 1. Berapa banyak kubus kecil yang ${kk}?`,
    numOptions(g, ans, [n ** 3 - ans, 12 * (n - 2) + 1, 6 * (n - 2), 8 + ans, (n - 2) ** 2, 6 * n ** 2], { spread: 4 }), expl);
}

const fmtT = (m) => `${Math.floor(m / 60) % 12 === 0 ? 12 : Math.floor(m / 60) % 12}.${String(m % 60).padStart(2, "0")}`;
function clockAngle(g, hard) {
  const h = g.int(1, 11), m = hard ? g.int(1, 59) : g.pick([0, 10, 15, 20, 30, 40, 45, 50]);
  let ang = Math.abs(30 * h - 5.5 * m); if (ang > 180) ang = 360 - ang;
  const fm = (n) => `${Number.isInteger(n) ? n : n.toFixed(1)}°`;
  return mk(`Berapa besar sudut terkecil yang dibentuk jarum jam dan jarum menit pada pukul ${h}.${String(m).padStart(2, "0")}?`,
    numOptions(g, ang, [Math.abs(30 * h - 6 * m), 360 - ang, ang + 15, ang - 15, Math.abs(30 * h - 5 * m)], { fmt: fm, spread: 12 }), `Jarum jam: 30°×${h} + 0,5°×${m} = ${30 * h + 0.5 * m}°. Jarum menit: 6°×${m} = ${6 * m}°. Selisih terkecil = ${fm(ang)}.`);
}

function paperFold(g, hard) {
  const folds = g.int(2, hard ? 4 : 3), holes = hard ? g.int(2, 3) : 1;
  const ans = holes * 2 ** folds;
  return mk(`Selembar kertas dilipat menjadi dua bagian sama besar sebanyak ${folds} kali berturut-turut. Kertas lipatan itu kemudian dilubangi ${holes === 1 ? "satu kali" : holes + " kali"} (tembus semua lapisan). Berapa banyak lubang pada kertas saat dibuka kembali?`,
    numOptions(g, ans, [holes * folds, ans / 2, ans * 2, holes + folds, ans + holes], { spread: 2 }), `Setiap lipatan menggandakan jumlah lapisan: 2^${folds} = ${2 ** folds} lapisan. Lubang = ${holes} × ${2 ** folds} = ${ans}.`);
}

function mirrorClock(g) {
  const real = g.int(1, 11) * 60 + g.pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
  const shown = (720 - real) % 720 || 720;
  return mk(`Bayangan sebuah jam di cermin menunjukkan pukul ${fmtT(shown)}. Pukul berapa waktu sebenarnya?`,
    buildOptions(g, fmtT(real), [fmtT(shown + 60), fmtT(real + 60 > 720 ? real - 60 : real + 60), fmtT(shown + 120), fmtT(real + 30), fmtT(720 - shown + 15)], () => fmtT(g.int(60, 719))),
    `Waktu sebenarnya = 12.00 − waktu pada bayangan = 12.00 − ${fmtT(shown)} = ${fmtT(real)}.`);
}

function dice(g, hard) {
  if (!hard) {
    const t = g.int(1, 6);
    return mk(`Pada sebuah dadu standar, jumlah titik pada dua sisi yang berhadapan selalu 7. Jika sisi atas menunjukkan ${t} titik, berapa titik pada sisi bawah?`,
      buildOptions(g, 7 - t, [1, 2, 3, 4, 5, 6].filter((x) => x !== 7 - t)), `Sisi atas dan bawah berhadapan: 7 − ${t} = ${7 - t}.`);
  }
  const a = g.int(1, 6), b = g.pick([1, 2, 3, 4, 5, 6].filter((x) => x !== a && x !== 7 - a));
  const ans = 14 - a - b;
  return mk(`Pada dadu standar (sisi berhadapan berjumlah 7), sisi atas bertitik ${a} dan sisi depan bertitik ${b}. Berapa jumlah titik pada sisi bawah dan sisi belakang?`,
    numOptions(g, ans, [a + b, 7, 14 - a, 14 - b, ans + 1], { spread: 2 }), `Bawah = 7 − ${a} = ${7 - a}; belakang = 7 − ${b} = ${7 - b}. Jumlah = ${ans}.`);
}

function countSquares(g, rect) {
  if (!rect) {
    const n = g.int(3, 6);
    let ans = 0; for (let k = 1; k <= n; k++) ans += k * k;
    return mk(`Sebuah papan berbentuk kisi ${n} × ${n} kotak kecil. Berapa banyak persegi (dari semua ukuran) yang dapat dihitung pada kisi tersebut?`,
      numOptions(g, ans, [n * n, n * n + n, ans - n, ans + n, 2 * n * n], { spread: 3 }), `Jumlah persegi = 1² + 2² + ... + ${n}² = ${ans}.`);
  }
  const m = g.int(3, 5), n = g.int(m + 1, 7), ans = comb(m + 1, 2) * comb(n + 1, 2);
  return mk(`Sebuah kisi berukuran ${m} × ${n} kotak kecil. Berapa banyak persegi panjang (termasuk persegi, dari semua ukuran) yang dapat dibentuk dari garis-garis kisi?`,
    numOptions(g, ans, [m * n, ans - m * n, comb(m + n, 2), ans + m, (m + 1) * (n + 1)], { spread: 5 }), `Pilih 2 garis horizontal dari ${m + 1} dan 2 garis vertikal dari ${n + 1}: C(${m + 1},2) × C(${n + 1},2) = ${ans}.`);
}

function solids(g, hard) {
  const n = g.int(3, hard ? 9 : 7), prism = g.chance(0.5);
  const what = g.pick(["rusuk", "sisi", "titik sudut"]);
  const nm = prism ? `prisma tegak dengan alas segi-${n}` : `limas dengan alas segi-${n}`;
  const val = prism ? { rusuk: 3 * n, sisi: n + 2, "titik sudut": 2 * n } : { rusuk: 2 * n, sisi: n + 1, "titik sudut": n + 1 };
  const ans = val[what];
  return mk(`Berapa banyak ${what} yang dimiliki ${nm}?`,
    numOptions(g, ans, [ans + 1, ans - 1, ans + n, 2 * n, 3 * n, n + 2].filter((x) => x !== ans), { spread: 3 }),
    prism ? `Prisma segi-${n}: rusuk = 3n = ${3 * n}, sisi = n + 2 = ${n + 2}, titik sudut = 2n = ${2 * n}.` : `Limas segi-${n}: rusuk = 2n = ${2 * n}, sisi = n + 1 = ${n + 1}, titik sudut = n + 1 = ${n + 1}.`);
}

function cuts(g) {
  const a = g.int(1, 3), b = g.int(1, 3), c = g.int(1, 3), ans = (a + 1) * (b + 1) * (c + 1);
  return mk(`Sebuah balok dipotong dengan ${a} bidang potong sejajar sisi panjang, ${b} bidang sejajar sisi lebar, dan ${c} bidang sejajar sisi tinggi. Berapa banyak potongan balok kecil yang dihasilkan?`,
    numOptions(g, ans, [a + b + c + 1, a * b * c, ans + a, ans - 1, (a + b + c) * 2], { spread: 3 }), `Setiap arah memberi (potongan + 1) bagian: (${a}+1)(${b}+1)(${c}+1) = ${ans}.`);
}

function transform(g, steps) {
  let x = g.int(1, 6), y = g.int(1, 6);
  const sx = x, sy = y;
  const ops = [];
  let prevT = "";
  for (let i = 0; i < steps; i++) {
    let t = g.pick(["rot90", "refx", "refy", "refyx", "trans"]);
    while (t === prevT) t = g.pick(["rot90", "refx", "refy", "refyx", "trans"]);
    prevT = t;
    if (t === "rot90") { [x, y] = [-y, x]; ops.push("diputar 90° berlawanan arah jarum jam terhadap titik asal (0, 0)"); }
    else if (t === "refx") { y = -y; ops.push("dicerminkan terhadap sumbu-x"); }
    else if (t === "refy") { x = -x; ops.push("dicerminkan terhadap sumbu-y"); }
    else if (t === "refyx") { [x, y] = [y, x]; ops.push("dicerminkan terhadap garis y = x"); }
    else { const dx = g.int(-4, 4), dy = g.int(-4, 4); x += dx; y += dy; ops.push(`digeser ${dx >= 0 ? dx + " ke kanan" : -dx + " ke kiri"} dan ${dy >= 0 ? dy + " ke atas" : -dy + " ke bawah"}`); }
  }
  const ans = `(${x}, ${y})`;
  return mk(`Titik (${sx}, ${sy}) ${ops.join(", kemudian ")}. Di manakah letak akhir titik tersebut?`,
    buildOptions(g, ans, [`(${y}, ${x})`, `(${-x}, ${y})`, `(${x}, ${-y})`, `(${-x}, ${-y})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`]),
    `Terapkan transformasi satu per satu; hasil akhirnya ${ans}.`);
}

export const easySpatial = [
  (g) => facing(g, 2, false), (g) => facing(g, 3, false), (g) => paperFold(g, false), (g) => dice(g, false),
  (g) => solids(g, false), (g) => paintedCube(g, "easy"), (g) => gridWalk(g, 3), (g) => countSquares(g, false), (g) => clockAngle(g, false),
];
export const normalSpatial = [
  (g) => facing(g, 4, false), (g) => facing(g, 5, false), (g) => gridWalk(g, 6), (g) => paintedCube(g, "normal"), (g) => clockAngle(g, false),
  (g) => mirrorClock(g), (g) => countSquares(g, false), (g) => solids(g, true), (g) => paperFold(g, true), (g) => transform(g, 1),
];
export const hardSpatial = [
  (g) => facing(g, 4, true), (g) => facing(g, 5, true), (g) => paintedCube(g, "hard"), (g) => clockAngle(g, true), (g) => mirrorClock(g),
  (g) => dice(g, true), (g) => countSquares(g, true), (g) => cuts(g), (g) => transform(g, 2), (g) => gridWalk(g, 9),
];
export const extremeSpatial = [
  (g) => facing(g, 6, true), (g) => paintedCube(g, "extreme"), (g) => clockAngle(g, true), (g) => countSquares(g, true), (g) => cuts(g),
  (g) => transform(g, 3), (g) => transform(g, 4), (g) => facing(g, 7, true), (g) => dice(g, true), (g) => paperFold(g, true),
];
