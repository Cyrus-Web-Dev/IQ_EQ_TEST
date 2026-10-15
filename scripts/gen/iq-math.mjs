import { buildOptions, comb, fact, frac, gcd, NAMES, numOptions, rp } from "./lib.mjs";

const ITEMS = ["buku tulis", "pensil", "apel", "kue", "jeruk", "kelereng", "pulpen", "roti", "stiker", "permen", "telur", "kartu"];
const mk = (q, o, explanation) => ({ category: "math_reasoning", question: q, ...o, explanation });
const hhmm = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}.${String(min % 60).padStart(2, "0")}`;

export const easyMath = [
  (g) => {
    const n = g.pick(NAMES), item = g.pick(ITEMS), a = g.int(3, 12), p = g.int(2, 15) * 500;
    return mk(`${n} membeli ${a} ${item} dengan harga ${rp(p)} per buah. Berapa total yang harus dibayar?`,
      numOptions(g, a * p, [a * p + p, a * p - p, (a + 1) * p / 2, a + p], { spread: 4, fmt: rp, }), `${a} × ${rp(p)} = ${rp(a * p)}.`);
  },
  (g) => {
    const n = g.pick(NAMES), cost = g.int(7, 48) * 1000 + g.pick([0, 500]), pay = Math.ceil((cost + 1000) / 10000) * 10000;
    return mk(`${n} membayar ${rp(pay)} untuk barang seharga ${rp(cost)}. Berapa uang kembaliannya?`,
      numOptions(g, pay - cost, [pay - cost + 1000, pay - cost - 1000, pay - cost + 500, pay + cost], { fmt: rp }), `${rp(pay)} − ${rp(cost)} = ${rp(pay - cost)}.`);
  },
  (g) => {
    const item = g.pick(ITEMS), k = g.int(3, 9), per = g.int(4, 15), tot = k * per;
    return mk(`${tot} ${item} dibagi rata ke ${k} kotak. Berapa isi tiap kotak?`,
      numOptions(g, per, [per + 1, per - 1, per + 2, tot - k, tot / 2]), `${tot} ÷ ${k} = ${per}.`);
  },
  (g) => {
    const p = g.pick([10, 20, 25, 50]), N = g.pick([40, 60, 80, 120, 160, 200, 240, 400]);
    const ans = (p * N) / 100;
    return mk(`Berapakah ${p}% dari ${N}?`, numOptions(g, ans, [ans * 2, N - ans, ans + 10, ans - 10, p + N]), `${p}% × ${N} = ${p}/100 × ${N} = ${ans}.`);
  },
  (g) => {
    const start = g.int(6, 17) * 60 + g.pick([0, 15, 30, 45]), dur = g.pick([45, 75, 90, 105, 120, 135]);
    const end = start + dur;
    return mk(`Sebuah film mulai pukul ${hhmm(start)} dan berdurasi ${dur} menit. Pukul berapa film selesai?`,
      buildOptions(g, hhmm(end), [hhmm(end + 10), hhmm(end - 15), hhmm(end + 30), hhmm(end - 30), hhmm(start + dur + 60)], () => hhmm(end + g.int(-6, 6) * 5)),
      `${hhmm(start)} + ${dur} menit = ${hhmm(end)}.`);
  },
  (g) => {
    const nums = [g.int(6, 20)]; nums.push(g.int(6, 20));
    let s = nums[0] + nums[1]; const third = (3 - (s % 3)) % 3 + g.int(2, 8) * 3; nums.push(third); s += third;
    const avg = s / 3;
    return mk(`Berapakah rata-rata dari bilangan ${nums.join(", ")}?`, numOptions(g, avg, [avg + 1, avg - 1, s, nums[1], Math.round(s / 2)]), `(${nums.join(" + ")}) ÷ 3 = ${s} ÷ 3 = ${avg}.`);
  },
  (g) => {
    const a = g.int(1, 4), b = g.int(a + 1, 6), k = g.int(3, 9), tot = (a + b) * k, n1 = g.pick(NAMES);
    return mk(`${n1} dan temannya membagi ${tot} kelereng dengan perbandingan ${a} : ${b}. Berapa kelereng yang diterima bagian yang lebih kecil?`,
      numOptions(g, a * k, [b * k, tot / 2, (a + b), a * k + k, a * k - k]), `Satu bagian = ${tot} ÷ ${a + b} = ${k}. Bagian kecil = ${a} × ${k} = ${a * k}.`);
  },
  (g) => {
    const l = g.int(8, 20), w = g.int(3, l - 2), area = l * w, per = 2 * (l + w), what = g.pick(["keliling", "luas"]);
    const ans = what === "keliling" ? per : area;
    return mk(`Sebuah persegi panjang berukuran panjang ${l} cm dan lebar ${w} cm. Berapa ${what}nya?`,
      numOptions(g, ans, [what === "keliling" ? area : per, l + w, ans + 2, ans - 2, 2 * l + w]), what === "keliling" ? `Keliling = 2 × (${l} + ${w}) = ${per} cm.` : `Luas = ${l} × ${w} = ${area} cm².`);
  },
  (g) => {
    const x = g.int(3, 9), mult = g.int(3, 5), sum = x * (mult + 1);
    return mk(`Umur seorang ayah ${mult} kali umur anaknya. Jika jumlah umur mereka ${sum} tahun, berapa umur anak tersebut?`,
      numOptions(g, x, [sum - x, x * mult, x + 1, x - 1, sum / 2]), `Anak = x, ayah = ${mult}x, jumlah ${mult + 1}x = ${sum} sehingga x = ${x}.`);
  },
  (g) => {
    const every = g.int(2, 5), days = every * g.int(4, 9), n = g.pick(NAMES);
    return mk(`${n} menabung setiap ${every} hari sekali. Berapa kali ${n} menabung dalam ${days} hari?`,
      numOptions(g, days / every, [days / every + 1, days / every - 1, days - every, days * every]), `${days} ÷ ${every} = ${days / every} kali.`);
  },
  (g) => {
    const tot = g.int(20, 60), take = g.int(5, tot - 5), more = g.int(3, 12), item = g.pick(ITEMS);
    return mk(`Sebuah toko memiliki ${tot} ${item}. Sebanyak ${take} terjual dan datang kiriman ${more} lagi. Berapa ${item} sekarang?`,
      numOptions(g, tot - take + more, [tot + take + more, tot - take - more, tot + more, tot - take], { spread: 3 }), `${tot} − ${take} + ${more} = ${tot - take + more}.`);
  },
];

export const normalMath = [
  (g) => {
    const P = g.int(2, 20) * 50000, d = g.pick([10, 15, 20, 25, 30, 40]), ans = P * (100 - d) / 100;
    return mk(`Sebuah tas berharga ${rp(P)} mendapat diskon ${d}%. Berapa harga yang harus dibayar?`,
      numOptions(g, ans, [P * d / 100, P - d * 1000, P * (100 + d) / 100, P - 2 * P * d / 100], { fmt: rp, spread: 3 }), `Diskon = ${d}% × ${rp(P)} = ${rp(P * d / 100)}. Harga akhir = ${rp(P)} − ${rp(P * d / 100)} = ${rp(ans)}.`);
  },
  (g) => {
    const v = g.pick([40, 50, 60, 72, 80, 90]), t = g.pick([2, 3, 4, 5]), d = v * t;
    return mk(`Sebuah mobil melaju dengan kecepatan rata-rata ${v} km/jam. Berapa lama waktu yang dibutuhkan untuk menempuh ${d} km?`,
      numOptions(g, t, [t + 1, t - 1, v / 10, d / 10, t * 2], { fmt: (n) => `${n} jam` }), `Waktu = jarak ÷ kecepatan = ${d} ÷ ${v} = ${t} jam.`);
  },
  (g) => {
    const k = g.pick([3, 4, 5, 6]), avg = g.int(70, 85), want = avg + g.int(2, 6), last = want * (k + 1) - avg * k;
    return mk(`Rata-rata ${k} nilai ulangan seorang siswa adalah ${avg}. Berapa nilai ulangan berikutnya agar rata-ratanya menjadi ${want}?`,
      numOptions(g, last, [want, want + (want - avg), avg + 1, last - 5, last + 5]), `Total yang dibutuhkan = ${want} × ${k + 1} = ${want * (k + 1)}. Total sekarang = ${avg} × ${k} = ${avg * k}. Nilai berikutnya = ${last}.`);
  },
  (g) => {
    const a = g.int(1, 3), b = g.int(a + 1, 5), c = g.int(1, 4), sum = a + b + c, unit = g.int(2, 9) * 10000, N = sum * unit;
    return mk(`Uang ${rp(N)} dibagikan kepada tiga orang dengan perbandingan ${a} : ${b} : ${c}. Berapa bagian terbesar?`,
      numOptions(g, Math.max(a, b, c) * unit, [N / 3, Math.max(a, b, c) * unit - unit, N / sum * (sum - 1), Math.min(a, b, c) * unit], { fmt: rp }), `Jumlah bagian = ${sum}; satu bagian = ${rp(N)} ÷ ${sum} = ${rp(unit)}. Bagian terbesar = ${Math.max(a, b, c)} × ${rp(unit)} = ${rp(Math.max(a, b, c) * unit)}.`);
  },
  (g) => {
    const P = g.int(4, 20) * 10000, inc = g.pick([10, 20, 25, 50]), X = P * (100 + inc) / 100;
    return mk(`Setelah naik ${inc}%, harga sebuah barang menjadi ${rp(X)}. Berapa harga semula?`,
      numOptions(g, P, [X - X * inc / 100, X * (100 - inc) / 100, X - inc * 1000, X - P / 2], { fmt: rp }), `Harga semula × ${(100 + inc) / 100} = ${rp(X)}, sehingga harga semula = ${rp(P)}.`);
  },
  (g) => {
    const pairs = [[6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [15, 30, 10], [8, 24, 6], [12, 36, 9], [18, 36, 12]];
    const [a, b, t] = g.pick(pairs), [n1, n2] = g.sample(NAMES, 2);
    return mk(`${n1} dapat menyelesaikan suatu pekerjaan dalam ${a} hari, sedangkan ${n2} dalam ${b} hari. Jika bekerja bersama, berapa hari pekerjaan itu selesai?`,
      numOptions(g, t, [(a + b) / 2, a + b, t + 1, t - 1, Math.abs(b - a)], { fmt: (n) => `${n} hari` }), `Laju bersama = 1/${a} + 1/${b} = 1/${t} per hari, sehingga selesai dalam ${t} hari.`);
  },
  (g) => {
    const P = g.int(1, 10) * 1000000, r = g.pick([4, 5, 6, 8, 10]), t = g.int(2, 5), I = P * r * t / 100;
    return mk(`${rp(P)} ditabung dengan bunga tunggal ${r}% per tahun. Berapa total tabungan setelah ${t} tahun?`,
      numOptions(g, P + I, [I, P + P * r / 100, P + I + P * r / 100, P * (1 + r / 100) ** t], { fmt: rp, spread: 2 }), `Bunga = ${rp(P)} × ${r}% × ${t} = ${rp(I)}. Total = ${rp(P + I)}.`);
  },
  (g) => {
    const v = g.pick([36, 54, 72, 90, 108]), ans = v * 1000 / 3600;
    return mk(`Kecepatan ${v} km/jam sama dengan berapa meter per detik?`,
      numOptions(g, ans, [v / 3.6 + 2, v / 36, v / 6, ans * 2, ans + 5], { fmt: (n) => `${n} m/s` }), `${v} km/jam = ${v} × 1000 ÷ 3600 = ${ans} m/s.`);
  },
  (g) => {
    const tot = g.pick([40, 60, 80, 120]), pf = g.pick([[3, 5], [1, 2], [3, 4]]), male = tot * pf[0] / pf[1];
    const frac2 = g.pick([[1, 2], [1, 4], [1, 3]]);
    const ans = male * frac2[0] / frac2[1];
    if (!Number.isInteger(ans) || !Number.isInteger(male)) return normalMath[7](g);
    return mk(`Dari ${tot} siswa, ${pf[0]}/${pf[1]} adalah laki-laki. Jika ${frac2[0]}/${frac2[1]} dari siswa laki-laki memakai kacamata, berapa siswa laki-laki yang berkacamata?`,
      numOptions(g, ans, [tot * frac2[0] / frac2[1], male, tot - male, ans + 3, ans - 3]), `Laki-laki = ${pf[0]}/${pf[1]} × ${tot} = ${male}. Berkacamata = ${frac2[0]}/${frac2[1]} × ${male} = ${ans}.`);
  },
  (g) => {
    const P = g.int(5, 30) * 10000, pr = g.pick([10, 20, 25, 30]), sell = P * (100 + pr) / 100;
    return mk(`Seorang pedagang membeli barang seharga ${rp(P)} dan menjualnya dengan untung ${pr}%. Berapa harga jualnya?`,
      numOptions(g, sell, [P + pr * 1000, P * pr / 100, P * (100 - pr) / 100, sell + P / 10], { fmt: rp }), `Untung = ${pr}% × ${rp(P)} = ${rp(P * pr / 100)}. Harga jual = ${rp(sell)}.`);
  },
  (g) => {
    const x = g.int(10, 40) * 2, sum = x + (x + 2) + (x + 4);
    return mk(`Jumlah tiga bilangan genap berurutan adalah ${sum}. Berapakah bilangan yang terbesar?`,
      numOptions(g, x + 4, [x + 2, x, x + 6, sum / 3 + 4 + 2], { spread: 2 }), `Misal bilangannya x, x+2, x+4 → 3x + 6 = ${sum}, x = ${x}. Terbesar = ${x + 4}.`);
  },
];

export const hardMath = [
  (g) => {
    const d1 = g.pick([10, 20, 25, 30, 40]), d2 = g.pick([10, 20, 25, 50]);
    const total = 100 - (100 - d1) * (100 - d2) / 100;
    const fmtP = (n) => `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
    return mk(`Sebuah toko memberi diskon ${d1}% lalu diskon tambahan ${d2}% dari harga setelah diskon pertama. Berapa persen total potongan harga dari harga awal?`,
      numOptions(g, total, [d1 + d2, d1 + d2 - 5, total + 2, total - 2, Math.abs(d1 - d2)], { fmt: fmtP, spread: 4 }), `Harga akhir = (100 − ${d1})% × (100 − ${d2})% = ${(100 - total)}% dari harga awal, jadi total potongan ${fmtP(total)} (bukan ${d1 + d2}%).`);
  },
  (g) => {
    const triples = [[10, 15, 30, 5], [12, 12, 6, 3], [6, 12, 12, 3], [20, 30, 60, 10], [15, 20, 12, 5], [12, 24, 24, 6], [8, 8, 8, 8 / 3]];
    const [a, b, c, t] = g.pick(triples.slice(0, 6));
    const [n1, n2, n3] = g.sample(NAMES, 3);
    return mk(`${n1}, ${n2}, dan ${n3} masing-masing dapat menyelesaikan suatu proyek sendirian dalam ${a}, ${b}, dan ${c} hari. Jika ketiganya bekerja bersama, berapa hari proyek selesai?`,
      numOptions(g, t, [t + 1, t - 1, (a + b + c) / 3, Math.min(a, b, c) / 2, t + 2], { fmt: (n) => `${n} hari`, spread: 2 }), `Laju gabungan = 1/${a} + 1/${b} + 1/${c} = 1/${t} per hari → ${t} hari.`);
  },
  (g) => {
    const fill = g.pick([[12, 20, 30], [10, 15, 30], [6, 12, 12], [20, 30, 60], [15, 30, 30]]);
    const [f, dr, net] = fill;
    return mk(`Sebuah keran dapat mengisi bak kosong hingga penuh dalam ${f} jam. Saat bak penuh, lubang pembuangan dapat mengosongkannya dalam ${dr} jam. Jika keran dan lubang pembuangan dibuka bersamaan pada bak kosong, berapa jam bak akan penuh?`,
      numOptions(g, net, [f + dr, dr - f, (f + dr) / 2, net + 2, net - 2, f], { fmt: (n) => `${n} jam` }), `Laju bersih = 1/${f} − 1/${dr} = 1/${net} per jam, jadi bak penuh dalam ${net} jam.`);
  },
  (g) => {
    const L = g.pick([20, 30, 40, 50]), p = g.pick([20, 30, 40]), q = g.pick([10, 15, 20]);
    // L liter larutan p% diencerkan hingga q%: tambah air x => L*p = (L+x)*q
    const x = (L * p) / q - L;
    if (!Number.isInteger(x) || x <= 0) return hardMath[3](g);
    return mk(`Terdapat ${L} liter larutan garam berkadar ${p}%. Berapa liter air yang harus ditambahkan agar kadarnya menjadi ${q}%?`,
      numOptions(g, x, [L * p / 100, L - x, x + 5, x - 5, L * q / 100], { fmt: (n) => `${n} liter`, spread: 3 }), `Garam = ${p}% × ${L} = ${L * p / 100} liter. Volume akhir = ${L * p / 100} ÷ ${q}% = ${L * p / q}. Air tambahan = ${L * p / q} − ${L} = ${x} liter.`);
  },
  (g) => {
    const dif = g.pick([5, 6, 8, 10]), mult = g.pick([3, 4]), ago = g.int(2, 5);
    // ago tahun lalu: A = mult*B ; sekarang jumlah S. B_sekarang = y, A = mult*(y-ago)+ago
    const y = g.int(10, 20), A = mult * (y - ago) + ago, S = A + y;
    return mk(`${ago} tahun yang lalu, umur Ayah ${mult} kali umur Dina. Sekarang jumlah umur mereka ${S} tahun. Berapa umur Dina sekarang?`,
      numOptions(g, y, [y - ago, y + ago, S - A + 1, S / 2, y - 1]), `Misal umur Dina sekarang d. Ayah = ${mult}(d − ${ago}) + ${ago}. Jumlah: ${mult}(d − ${ago}) + ${ago} + d = ${S} → d = ${y}.`.replace("× ", ""));
  },
  (g) => {
    const v1 = g.pick([40, 50, 60, 70]), v2 = g.pick([50, 60, 70, 80]), d = (v1 + v2) * g.int(2, 4), t = d / (v1 + v2);
    return mk(`Dua kota berjarak ${d} km. Sebuah mobil berangkat dari kota A dengan kecepatan ${v1} km/jam dan sebuah motor dari kota B dengan kecepatan ${v2} km/jam, berangkat bersamaan dan saling berhadapan. Setelah berapa jam keduanya bertemu?`,
      numOptions(g, t, [d / v1, d / v2, t + 1, t - 1, d / Math.abs(v1 - v2)], { fmt: (n) => `${n} jam`, spread: 1 }), `Kecepatan gabungan = ${v1} + ${v2} = ${v1 + v2} km/jam. Waktu = ${d} ÷ ${v1 + v2} = ${t} jam.`);
  },
  (g) => {
    const P = g.int(1, 5) * 10000, r = g.pick([10, 20]), amount = P * (1 + r / 100) ** 2;
    if (!Number.isInteger(Math.round(amount * 100) / 100)) return hardMath[6](g);
    return mk(`${rp(P)} diinvestasikan dengan bunga majemuk ${r}% per tahun. Berapa nilai investasi setelah 2 tahun?`,
      numOptions(g, Math.round(amount), [P * (1 + 2 * r / 100), P + P * r / 100, Math.round(amount) + P / 10, Math.round(amount) - P / 20], { fmt: rp, spread: 3 }), `Tahun 1: ${rp(P)} × ${1 + r / 100} = ${rp(P * (1 + r / 100))}. Tahun 2: × ${1 + r / 100} = ${rp(Math.round(amount))}. (Bunga tunggal hanya ${rp(P * (1 + 2 * r / 100))}.)`);
  },
  (g) => {
    const pairs = [[40, 60, 48], [30, 60, 40], [60, 90, 72], [20, 30, 24], [40, 120, 60], [50, 75, 60]];
    const [a, b, avg] = g.pick(pairs);
    return mk(`Seseorang pergi ke suatu kota dengan kecepatan ${a} km/jam dan pulang melalui jalan yang sama dengan kecepatan ${b} km/jam. Berapa kecepatan rata-rata untuk seluruh perjalanan?`,
      numOptions(g, avg, [(a + b) / 2, avg + 2, avg - 2, Math.round(Math.sqrt(a * b))], { fmt: (n) => `${n} km/jam`, spread: 3 }), `Jarak pergi = pulang = d. Waktu total = d/${a} + d/${b}; kecepatan rata-rata = 2d ÷ waktu = ${avg} km/jam (bukan rata-rata hitung ${(a + b) / 2}).`);
  },
  (g) => {
    const red = g.int(3, 7), blue = g.int(2, 6), tot = red + blue;
    const num = red * (red - 1), den = tot * (tot - 1);
    return mk(`Sebuah kantong berisi ${red} bola merah dan ${blue} bola biru. Dua bola diambil satu per satu tanpa pengembalian. Berapa peluang kedua bola berwarna merah?`,
      buildOptions(g, frac(num, den), [frac(red * red, tot * tot), frac(red, tot), frac(num, den + 2), frac(red - 1, tot), frac(red * 2, tot * 2 - 1)], () => frac(g.int(1, 9), g.int(10, 30))),
      `Peluang bola pertama merah = ${red}/${tot}; kedua merah = ${red - 1}/${tot - 1}. Hasil kali = ${frac(num, den)}.`);
  },
  (g) => {
    const [a, b] = g.pick([[5, 8], [5, 9], [5, 11], [7, 8], [7, 9], [7, 11], [6, 11], [6, 7]]), ra = g.int(1, a - 1), rb = g.int(1, b - 1);
    let n = 1; while (n <= a * b && !(n % a === ra && n % b === rb)) n++;
    return mk(`Sebuah bilangan jika dibagi ${a} bersisa ${ra}, dan jika dibagi ${b} bersisa ${rb}. Berapakah bilangan positif terkecil yang memenuhi?`,
      numOptions(g, n, [n + a, n - a > 0 ? n - a : n + 2, n + b, n + a * b, n - 1], { spread: 5 }), `Cari bilangan yang memenuhi n mod ${a} = ${ra} dan n mod ${b} = ${rb}: bilangan terkecil adalah ${n}.`);
  },
];

const divisors = (n) => { let c = 0; for (let i = 1; i <= n; i++) if (n % i === 0) c++; return c; };

export const extremeMath = [
  (g) => {
    const l1 = g.pick([100, 120, 150, 180, 200]), l2 = g.pick([100, 120, 150, 200]), v1 = g.pick([54, 72, 90]), v2 = g.pick([36, 54, 72]);
    if (v1 === v2) return extremeMath[0](g);
    const rel = (v1 + v2) * 1000 / 3600, t = (l1 + l2) / rel;
    if (Math.abs(t - Math.round(t * 10) / 10) > 1e-9) return extremeMath[0](g);
    return mk(`Dua kereta api berjalan berlawanan arah di rel sejajar. Kereta pertama panjangnya ${l1} m dengan kecepatan ${v1} km/jam, kereta kedua ${l2} m dengan kecepatan ${v2} km/jam. Berapa detik waktu yang dibutuhkan keduanya untuk saling melewati sepenuhnya?`,
      numOptions(g, Math.round(t * 10) / 10, [(l1 + l2) / (v1 * 1000 / 3600), (l1 + l2) / (Math.abs(v1 - v2) * 1000 / 3600), t + 2, t - 2], { fmt: (n) => `${Math.round(n * 10) / 10} detik`, spread: 3 }), `Kecepatan relatif = ${v1 + v2} km/jam = ${rel} m/s. Jarak = ${l1} + ${l2} = ${l1 + l2} m. Waktu = ${l1 + l2} ÷ ${rel} = ${Math.round(t * 10) / 10} detik.`);
  },
  (g) => {
    const opts = [[12, 18, 4], [10, 15, 3], [12, 24, 3], [15, 30, 5], [20, 30, 4]];
    const [a, b, w] = g.pick(opts);
    const done = w * (1 / a + 1 / b), rest = 1 - done, days = rest * b;
    if (rest <= 0 || Math.abs(days - Math.round(days)) > 1e-9) return extremeMath[1](g);
    return mk(`A dapat menyelesaikan pekerjaan dalam ${a} hari dan B dalam ${b} hari. Keduanya bekerja bersama selama ${w} hari, kemudian A berhenti. Berapa hari lagi yang dibutuhkan B untuk menyelesaikan sisa pekerjaan sendirian?`,
      numOptions(g, Math.round(days), [Math.round(days) + 1, Math.round(days) - 1, b - w, Math.round(days) * 2], { fmt: (n) => `${n} hari`, spread: 2 }), `Dalam ${w} hari bersama selesai ${w}(1/${a} + 1/${b}) = ${frac(Math.round(done * a * b), a * b)} bagian. Sisa ${frac(Math.round(rest * a * b), a * b)} bagian dikerjakan B (1/${b} per hari) → ${Math.round(days)} hari.`);
  },
  (g) => {
    const P = g.int(1, 9) * 1000, r = g.pick([10, 20]), y = g.pick([3, 3, 4]);
    const ans = Math.round(P * (1 + r / 100) ** y);
    return mk(`Populasi suatu desa ${P} jiwa dan bertambah ${r}% setiap tahun (dari jumlah tahun sebelumnya). Berapa kira-kira populasinya setelah ${y} tahun (dibulatkan ke bilangan bulat terdekat)?`,
      numOptions(g, ans, [Math.round(P * (1 + y * r / 100)), Math.round(P * (1 + r / 100) ** (y - 1)), ans + Math.round(P / 20), ans - Math.round(P / 20)], { spread: 8 }), `${P} × ${1 + r / 100}^${y} ≈ ${ans} (bukan ${Math.round(P * (1 + y * r / 100))} yang merupakan pertambahan tunggal).`);
  },
  (g) => {
    const t = g.pick(["KATAK", "SAMA", "BUKU", "KAKAK", "MAMA", "TOKO", "TATA", "BABAK"]);
    const cnt = {}; for (const c of t) cnt[c] = (cnt[c] ?? 0) + 1;
    let ans = fact(t.length); for (const v of Object.values(cnt)) ans /= fact(v);
    const reps = Object.entries(cnt).filter(([, v]) => v > 1).map(([k, v]) => `${k} (${v}×)`).join(", ");
    return mk(`Berapa banyak susunan huruf berbeda yang dapat dibuat dari semua huruf pada kata "${t}"?`,
      numOptions(g, ans, [fact(t.length), ans * 2, ans / 2, ans + 6, ans - 6], { spread: 8 }), `Total huruf ${t.length} dengan huruf berulang ${reps}. Susunan = ${t.length}! ÷ (pengulangan!) = ${ans}.`);
  },
  (g) => {
    const n = g.int(5, 9), k = g.int(2, 4), ans = comb(n, k);
    const who = g.pick(["siswa", "pegawai", "pemain", "anggota"]);
    return mk(`Dari ${n} ${who}, akan dipilih ${k} orang untuk menjadi tim (urutan tidak diperhatikan). Berapa banyak cara memilih tim tersebut?`,
      numOptions(g, ans, [ans * fact(k), n * k, ans + n, ans - 2, comb(n, k - 1) === ans ? ans + 3 : comb(n, k - 1)], { spread: 6 }), `C(${n},${k}) = ${n}! ÷ (${k}! × ${n - k}!) = ${ans}.`);
  },
  (g) => {
    const k = g.pick([6, 7, 8, 9, 11, 12, 13]), lo = g.int(1, 20), hi = lo + g.int(40, 120);
    let first = Math.ceil(lo / k) * k, last = Math.floor(hi / k) * k;
    const n = (last - first) / k + 1, sum = (n * (first + last)) / 2;
    return mk(`Berapakah jumlah semua kelipatan ${k} dari ${lo} sampai ${hi} (inklusif)?`,
      numOptions(g, sum, [sum + k, sum - k, sum + first, (n + 1) * (first + last) / 2, sum + last], { spread: 7 }), `Suku pertama ${first}, terakhir ${last}, banyaknya ${n}. Jumlah = ${n} × (${first} + ${last}) ÷ 2 = ${sum}.`);
  },
  (g) => {
    const n = g.pick([60, 72, 84, 90, 96, 120, 126, 144, 180, 240, 360]);
    const ans = divisors(n);
    return mk(`Berapa banyak faktor positif dari ${n}?`,
      numOptions(g, ans, [ans + 2, ans - 2, ans + 4, Math.round(n / 10), ans - 1], { spread: 4 }), `Faktorisasi prima dari ${n} menghasilkan ${ans} faktor positif (kalikan tiap pangkat prima + 1).`);
  },
  (g) => {
    const base = g.pick([2, 3, 7, 8, 9]), e = g.int(15, 99);
    let r = 1; for (let i = 0; i < e; i++) r = (r * base) % 10;
    return mk(`Berapakah angka satuan (digit terakhir) dari ${base}^${e}?`,
      numOptions(g, r, [(r + 1) % 10, (r + 2) % 10, (r + 4) % 10, (r + 6) % 10, base % 10], { spread: 3 }), `Angka satuan ${base}ⁿ berulang dalam siklus. Dengan pangkat ${e}, angka satuannya ${r}.`);
  },
  (g) => {
    const up = g.pick([20, 25, 50, 10]), down = Math.round((up / (100 + up)) * 1000) / 10;
    const ans = `${down}%`;
    return mk(`Harga sebuah barang naik ${up}%. Berapa persen penurunan harga yang diperlukan agar harga kembali ke semula?`,
      buildOptions(g, ans, [`${up}%`, `${Math.round(up / 2 * 10) / 10}%`, `${Math.round((down + 5) * 10) / 10}%`, `${Math.round((down - 3) * 10) / 10}%`, `${up + 5}%`]),
      `Misal harga awal 100 → ${100 + up}. Turun x% agar kembali 100: x = ${up} ÷ ${100 + up} × 100% = ${ans}.`);
  },
  (g) => {
    const tot = g.pick([100, 120, 150, 200]), A = g.int(Math.floor(tot * 0.4), Math.floor(tot * 0.6)), B = g.int(Math.floor(tot * 0.35), Math.floor(tot * 0.55)), none = g.int(5, 20);
    const both = A + B - (tot - none);
    if (both <= 0 || both > Math.min(A, B)) return extremeMath[9](g);
    return mk(`Dalam kelompok ${tot} orang, ${A} orang suka kopi, ${B} orang suka teh, dan ${none} orang tidak suka keduanya. Berapa orang yang suka kopi sekaligus teh?`,
      numOptions(g, both, [A + B - tot, A + B, tot - none - A, both + 5, both - 5], { spread: 4 }), `Yang suka minimal salah satu = ${tot} − ${none} = ${tot - none}. Irisan = ${A} + ${B} − ${tot - none} = ${both}.`);
  },
  (g) => {
    const lo = g.pick([100, 100, 200]), hi = lo + 899 > 999 ? 999 : lo + g.pick([299, 399, 499, 899]), k = g.pick([7, 9, 11, 13]);
    const first = Math.ceil(lo / k) * k, last = Math.floor(hi / k) * k, n = (last - first) / k + 1;
    return mk(`Ada berapa bilangan dari ${lo} sampai ${hi} (inklusif) yang habis dibagi ${k}?`,
      numOptions(g, n, [n + 1, n - 1, Math.floor((hi - lo) / k), Math.ceil((hi - lo + 1) / k) + 1, n + 2], { spread: 3 }), `Kelipatan ${k} pertama ${first}, terakhir ${last}: banyaknya (${last} − ${first}) ÷ ${k} + 1 = ${n}.`);
  },
];
