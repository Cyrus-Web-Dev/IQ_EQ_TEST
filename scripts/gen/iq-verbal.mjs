import { buildOptions } from "./lib.mjs";

const ANALOGY = (q, o, e) => ({ category: "verbal_analogy", question: q, ...o, explanation: e });
const CLASS = (q, o, e) => ({ category: "classification", question: q, ...o, explanation: e });

/* ===================== ANALOGI ===================== */
const REL = {
  antonim: { desc: "lawan kata (antonim)", pairs: [["panas", "dingin"], ["besar", "kecil"], ["siang", "malam"], ["tinggi", "rendah"], ["cepat", "lambat"], ["naik", "turun"], ["terang", "gelap"], ["kaya", "miskin"], ["awal", "akhir"], ["panjang", "pendek"], ["tebal", "tipis"], ["berat", "ringan"], ["penuh", "kosong"], ["jauh", "dekat"], ["rajin", "malas"], ["buka", "tutup"]] },
  suara: { desc: "hewan dan suaranya", pairs: [["kucing", "mengeong"], ["anjing", "menggonggong"], ["sapi", "melenguh"], ["ayam jago", "berkokok"], ["katak", "berkoak"], ["singa", "mengaum"], ["kuda", "meringkik"], ["burung", "berkicau"], ["kambing", "mengembik"], ["bebek", "menguak"]] },
  tempat: { desc: "profesi dan tempat kerjanya", pairs: [["guru", "sekolah"], ["dokter", "rumah sakit"], ["petani", "sawah"], ["nelayan", "laut"], ["hakim", "pengadilan"], ["juru masak", "dapur"], ["pustakawan", "perpustakaan"], ["apoteker", "apotek"], ["pendeta?", ""]].slice(0, 8) },
  organ: { desc: "organ tubuh dan fungsinya", pairs: [["mata", "melihat"], ["telinga", "mendengar"], ["hidung", "mencium"], ["lidah", "mengecap"], ["jantung", "memompa darah"], ["paru-paru", "bernapas"], ["gigi", "mengunyah"], ["kaki", "berjalan"], ["otak", "berpikir"]] },
  ibukota: { desc: "negara dan ibu kotanya", pairs: [["Indonesia", "Jakarta"], ["Jepang", "Tokyo"], ["Prancis", "Paris"], ["Mesir", "Kairo"], ["Australia", "Canberra"], ["Kanada", "Ottawa"], ["Brasil", "Brasilia"], ["Thailand", "Bangkok"], ["Italia", "Roma"], ["Korea Selatan", "Seoul"]] },
  bagian: { desc: "bagian dan keseluruhannya", pairs: [["jari", "tangan"], ["roda", "mobil"], ["daun", "pohon"], ["halaman", "buku"], ["sayap", "burung"], ["layar", "televisi"], ["tuts", "piano"], ["sisik", "ikan"], ["kelopak", "bunga"], ["lensa", "kamera"]] },
  alat: { desc: "alat dan kegunaannya", pairs: [["pisau", "memotong"], ["pena", "menulis"], ["sapu", "menyapu"], ["palu", "memukul"], ["gunting", "menggunting"], ["kompas", "menunjukkan arah"], ["timbangan", "menimbang"], ["jarum", "menjahit"], ["kunci", "membuka"], ["cangkul", "menggali"]] },
  sumber: { desc: "hasil dan sumbernya", pairs: [["susu", "sapi"], ["madu", "lebah"], ["wol", "domba"], ["telur", "ayam"], ["sutra", "ulat sutra"], ["kayu", "pohon"], ["garam", "laut"], ["getah karet", "pohon karet"]] },
  kategori: { desc: "kelompok dan contohnya", pairs: [["mamalia", "paus"], ["serangga", "semut"], ["buah", "mangga"], ["logam", "besi"], ["planet", "Mars"], ["bahasa", "Jepang"], ["olahraga", "renang"], ["sayuran", "bayam"]] },
  pencipta: { desc: "pencipta dan karyanya", pairs: [["arsitek", "rancangan bangunan"], ["penulis", "naskah"], ["komposer", "lagu"], ["pemahat", "patung"], ["koki", "hidangan"], ["sutradara", "film"], ["pelukis", "lukisan"], ["penerjemah", "terjemahan"]] },
  ukur: { desc: "alat ukur dan besaran yang diukur", pairs: [["termometer", "suhu"], ["barometer", "tekanan udara"], ["speedometer", "kecepatan"], ["higrometer", "kelembapan"], ["seismograf", "getaran gempa"], ["anemometer", "kecepatan angin"], ["amperemeter", "kuat arus listrik"], ["odometer", "jarak tempuh"]] },
  ilmu: { desc: "ilmu dan objek kajiannya", pairs: [["biologi", "makhluk hidup"], ["astronomi", "benda langit"], ["geologi", "batuan"], ["entomologi", "serangga"], ["ornitologi", "burung"], ["antropologi", "manusia"], ["meteorologi", "cuaca"], ["hidrologi", "air"]] },
  tokoh: { desc: "tokoh dan penemuannya", pairs: [["Thomas Edison", "bola lampu"], ["Alexander Graham Bell", "telepon"], ["Isaac Newton", "hukum gravitasi"], ["Wright bersaudara", "pesawat terbang"], ["Johannes Gutenberg", "mesin cetak"], ["Guglielmo Marconi", "radio"], ["Charles Darwin", "teori evolusi"], ["Alexander Fleming", "penisilin"]] },
  tingkat: { desc: "tingkat intensitas (lemah ke kuat)", pairs: [["hangat", "panas"], ["gerimis", "hujan deras"], ["sejuk", "dingin"], ["bisik", "teriak"], ["suka", "cinta"], ["lelah", "kehabisan tenaga"], ["lapar", "kelaparan"], ["bising", "memekakkan"]] },
  sinonim: { desc: "persamaan kata (sinonim)", pairs: [["gigih", "tekun"], ["lugas", "terus terang"], ["arif", "bijaksana"], ["lazim", "umum"], ["fana", "sementara"], ["kikir", "pelit"], ["tangkas", "cekatan"], ["bimbang", "ragu"], ["mutakhir", "terbaru"], ["andal", "terpercaya"], ["karib", "akrab"], ["jamak", "banyak"]] },
  antonimSulit: { desc: "lawan kata (antonim) tingkat lanjut", pairs: [["fana", "abadi"], ["kikir", "dermawan"], ["lugas", "berbelit-belit"], ["tulus", "munafik"], ["lazim", "janggal"], ["gigih", "mudah menyerah"], ["bimbang", "yakin"], ["mutakhir", "usang"], ["tangkas", "lamban"], ["hemat", "boros"], ["sahih", "keliru"], ["arif", "ceroboh"]] },
  kausal: { desc: "tindakan dan hasil akhirnya", pairs: [["menabung", "kaya"], ["berlatih", "mahir"], ["menanam", "panen"], ["belajar", "pandai"], ["memasak", "matang"], ["mendaki", "puncak"], ["menyiram", "basah"], ["memanaskan", "mendidih"]].slice(0, 8) },
};
REL.tempat.pairs = REL.tempat.pairs.filter((p) => p[1]);

const ANALOGY_PLAN = {
  easy: ["antonim", "suara", "tempat", "organ", "ibukota"],
  normal: ["bagian", "alat", "sumber", "kategori", "pencipta"],
  hard: ["ukur", "ilmu", "tokoh", "tingkat", "sumber", "kausal"],
  extreme: ["sinonim", "antonimSulit", "tokoh", "ilmu", "ukur"],
};

function analogy(g, tier) {
  const relKey = g.pick(ANALOGY_PLAN[tier]);
  const rel = REL[relKey];
  const [p1, p2] = g.sample(rel.pairs, 2);
  const others = rel.pairs.filter((p) => p !== p1 && p !== p2).map((p) => p[1]);
  const cross = g.pick(Object.keys(REL).filter((k) => k !== relKey && ANALOGY_PLAN[tier].includes(k) || k === "suara"));
  const crossB = g.pick(REL[cross].pairs)[1];
  const format2 = g.chance(0.35) && tier !== "easy";
  if (format2) {
    // Pilih pasangan kata dengan hubungan paling mirip
    const wrongRels = g.sample(Object.keys(REL).filter((k) => k !== relKey && !(REL[k].desc === rel.desc)), 3);
    const wrongs = wrongRels.map((k) => { const [a, b] = g.pick(REL[k].pairs); return `${a} : ${b}`; });
    wrongs.push(`${p2[1]} : ${p2[0]}`);
    return ANALOGY(`Manakah pasangan kata yang hubungannya paling mirip dengan "${p1[0]} : ${p1[1]}"?`,
      buildOptions(g, `${p2[0]} : ${p2[1]}`, wrongs.slice(0, 4)), `Hubungan "${p1[0]} : ${p1[1]}" adalah ${rel.desc}; pasangan yang sama jenisnya adalah "${p2[0]} : ${p2[1]}".`);
  }
  const wr = g.sample(others, 2).concat([crossB]);
  return ANALOGY(`${cap(p1[0])} berhubungan dengan ${p1[1]}, sebagaimana ${p2[0]} berhubungan dengan ...`,
    buildOptions(g, p2[1], wr.concat(others)), `Hubungannya adalah ${rel.desc}: ${p1[0]} → ${p1[1]}, maka ${p2[0]} → ${p2[1]}.`);
}
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/* Analogi angka */
const NUM_REL = [
  ["dikuadratkan", (n) => n * n, [2, 3, 4, 5, 6, 7, 8, 9, 11, 12]],
  ["dipangkatkan tiga", (n) => n ** 3, [2, 3, 4, 5, 6]],
  ["digandakan lalu ditambah 1", (n) => 2 * n + 1, [3, 4, 5, 6, 7, 8, 9, 10, 12, 15]],
  ["dikali (n + 1)", (n) => n * (n + 1), [3, 4, 5, 6, 7, 8, 9, 10, 11]],
  ["dikuadratkan lalu dikurangi 1", (n) => n * n - 1, [3, 4, 5, 6, 7, 8, 9, 10]],
  ["dikali 3 lalu dikurangi 2", (n) => 3 * n - 2, [3, 4, 5, 6, 7, 8, 9, 10, 12]],
];
function numAnalogy(g) {
  const [desc, f, dom] = g.pick(NUM_REL);
  const [a, c] = g.sample(dom, 2), ans = f(c);
  return ANALOGY(`${a} : ${f(a)} = ${c} : ...`,
    buildOptions(g, String(ans), [f(c) + 1, f(c) - 1, f(c) + c, c * c, ans + 2 * c].map(String).filter((x) => x !== String(ans))),
    `Pola: bilangan ${desc}. ${a} → ${f(a)}, maka ${c} → ${ans}.`);
}

export const analogyFor = (tier) => (g) => (tier === "hard" || tier === "extreme") && g.chance(0.2) ? numAnalogy(g) : analogy(g, tier);

/* ===================== KLASIFIKASI ===================== */
const SET = (cat, members, intruders, why) => ({ cat, members, intruders, why });
const WORD_SETS = {
  easy: [
    SET("buah", ["apel", "jeruk", "mangga", "pisang", "anggur", "melon"], ["bayam", "wortel", "kangkung", "sawi"], "yang lain adalah buah, sedangkan itu sayuran"),
    SET("hewan darat", ["kucing", "anjing", "sapi", "kuda", "kambing"], ["tuna", "lele", "salmon"], "yang lain hewan darat, sedangkan itu ikan"),
    SET("alat tulis", ["pena", "pensil", "penghapus", "penggaris", "spidol"], ["wajan", "panci", "spatula"], "yang lain alat tulis, sedangkan itu alat dapur"),
    SET("warna", ["merah", "biru", "hijau", "kuning", "ungu"], ["lingkaran", "segitiga", "persegi"], "yang lain adalah warna, sedangkan itu bentuk"),
    SET("kendaraan", ["mobil", "motor", "bus", "kereta", "kapal"], ["rumah", "gedung", "jembatan"], "yang lain kendaraan, sedangkan itu bangunan/struktur"),
    SET("anggota tubuh", ["tangan", "kaki", "kepala", "perut", "bahu"], ["baju", "celana", "topi"], "yang lain bagian tubuh, sedangkan itu pakaian"),
    SET("hari", ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], ["Maret", "Juni", "Agustus"], "yang lain nama hari, sedangkan itu nama bulan"),
    SET("alat musik", ["gitar", "piano", "biola", "seruling", "drum"], ["renang", "voli", "catur"], "yang lain alat musik, sedangkan itu cabang olahraga/permainan"),
  ],
  normal: [
    SET("planet", ["Mars", "Venus", "Bumi", "Saturnus", "Merkurius"], ["Bulan"], "yang lain adalah planet, sedangkan Bulan adalah satelit alami"),
    SET("logam", ["besi", "tembaga", "aluminium", "emas", "perak"], ["kaca", "karet", "plastik"], "yang lain adalah logam, sedangkan itu bukan logam"),
    SET("ibu kota negara", ["Jakarta", "Tokyo", "Paris", "Kairo", "Bangkok"], ["Surabaya", "Osaka", "Marseille"], "yang lain adalah ibu kota negara, sedangkan itu bukan ibu kota"),
    SET("gas pada suhu ruang", ["oksigen", "nitrogen", "helium", "hidrogen"], ["raksa", "air", "bensin"], "yang lain berwujud gas pada suhu ruang, sedangkan itu berwujud cair"),
    SET("bangun ruang", ["kubus", "balok", "tabung", "kerucut", "bola"], ["persegi", "lingkaran", "segitiga"], "yang lain bangun ruang (3 dimensi), sedangkan itu bangun datar (2 dimensi)"),
    SET("samudra/laut besar", ["Pasifik", "Atlantik", "Hindia", "Arktik"], ["Sahara", "Amazon", "Himalaya"], "yang lain samudra, sedangkan itu gurun/hutan/pegunungan"),
    SET("sumber energi", ["batu bara", "minyak bumi", "gas alam", "panas bumi"], ["pasir", "kapur", "tanah liat"], "yang lain sumber energi, sedangkan itu bahan galian non-energi"),
    SET("profesi medis", ["dokter", "perawat", "apoteker", "bidan"], ["arsitek", "pilot", "hakim"], "yang lain bergerak di bidang kesehatan, sedangkan itu bukan"),
  ],
  hard: [
    SET("mamalia", ["paus", "kelelawar", "lumba-lumba", "kangguru", "gajah"], ["hiu", "penyu", "pari"], "yang lain mamalia, sedangkan itu ikan/reptil"),
    SET("reptil", ["buaya", "kadal", "ular", "penyu"], ["katak", "kodok", "salamander"], "yang lain reptil, sedangkan itu amfibi"),
    SET("serangga (6 kaki)", ["semut", "lebah", "kupu-kupu", "belalang", "kumbang"], ["laba-laba", "kalajengking", "tungau"], "yang lain serangga berkaki enam, sedangkan itu arakhnida berkaki delapan"),
    SET("ikan", ["tuna", "hiu", "salmon", "lele", "pari"], ["lumba-lumba", "paus", "anjing laut"], "yang lain ikan, sedangkan itu mamalia laut"),
    SET("energi terbarukan", ["surya", "angin", "air", "panas bumi"], ["batu bara", "minyak bumi", "gas alam"], "yang lain energi terbarukan, sedangkan itu bahan bakar fosil"),
    SET("alat musik tiup", ["seruling", "terompet", "klarinet", "saksofon"], ["biola", "gitar", "harpa"], "yang lain alat musik tiup, sedangkan itu alat musik petik/gesek"),
    SET("benua", ["Asia", "Afrika", "Eropa", "Amerika Utara", "Antartika"], ["Madagaskar", "Greenland", "Sumatra"], "yang lain adalah benua, sedangkan itu adalah pulau"),
    SET("burung", ["elang", "merpati", "kakaktua", "pipit", "pinguin"], ["kelelawar", "tupai terbang", "capung"], "yang lain adalah burung, sedangkan itu hewan lain yang bisa terbang/meluncur"),
  ],
  extreme: [
    SET("gas mulia", ["helium", "neon", "argon", "kripton", "xenon"], ["nitrogen", "oksigen", "klorin", "hidrogen"], "yang lain gas mulia (golongan 18), sedangkan itu bukan gas mulia"),
    SET("logam alkali", ["litium", "natrium", "kalium", "rubidium"], ["kalsium", "magnesium", "barium"], "yang lain logam alkali (golongan 1), sedangkan itu logam alkali tanah (golongan 2)"),
    SET("planet gas raksasa", ["Jupiter", "Saturnus", "Uranus", "Neptunus"], ["Mars", "Venus", "Merkurius"], "yang lain planet gas raksasa, sedangkan itu planet berbatu"),
    SET("invertebrata", ["cacing tanah", "ubur-ubur", "siput", "cumi-cumi", "bintang laut"], ["kadal", "ikan mas", "katak"], "yang lain tidak bertulang belakang, sedangkan itu vertebrata"),
    SET("vitamin larut lemak", ["A", "D", "E", "K"], ["B", "C"], "yang lain larut dalam lemak, sedangkan vitamin B dan C larut dalam air"),
    SET("bangun datar bersisi empat", ["persegi", "jajar genjang", "trapesium", "belah ketupat", "layang-layang"], ["segitiga", "lingkaran", "segi lima"], "yang lain bersisi empat, sedangkan itu tidak"),
  ],
};

function wordClass(g, tier) {
  const set = g.pick(WORD_SETS[tier]);
  const three = g.sample(set.members, 3);
  const intruder = g.pick(set.intruders);
  return CLASS(`Manakah yang TIDAK termasuk dalam kelompok yang sama dengan tiga lainnya?`.replace("?", `?\n(${g.shuffle([...three, intruder]).join(" / ")})`),
    buildOptions(g, intruder, three), `Tiga lainnya termasuk ${set.cat}; ${intruder}: ${set.why}.`);
}

const isPrime = (n) => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) }, (_, i) => i + 2).every((d) => n % d !== 0);
const FIB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
const NUM_SETS = [
  { name: "bilangan prima", mem: () => [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97], out: (g) => g.pick([21, 27, 33, 39, 49, 51, 57, 87, 91, 77, 85]), why: (n) => `${n} bukan bilangan prima (habis dibagi selain 1 dan dirinya)` },
  { name: "bilangan kuadrat", mem: () => [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144], out: (g) => g.pick([18, 24, 32, 40, 48, 50, 60, 72, 80, 90]), why: (n) => `${n} bukan kuadrat sempurna` },
  { name: "bilangan Fibonacci", mem: () => FIB.slice(3), out: (g) => g.pick([9, 10, 15, 20, 25, 30, 35, 40, 50]), why: (n) => `${n} tidak muncul dalam barisan Fibonacci` },
  { name: "kelipatan 7", mem: () => [14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91], out: (g) => g.pick([15, 22, 30, 36, 45, 55, 60, 66, 75, 80]), why: (n) => `${n} bukan kelipatan 7` },
  { name: "pangkat dari 2", mem: () => [2, 4, 8, 16, 32, 64, 128, 256], out: (g) => g.pick([12, 24, 48, 20, 40, 96, 100, 60]), why: (n) => `${n} bukan pangkat dari 2` },
  { name: "bilangan segitiga", mem: () => [3, 6, 10, 15, 21, 28, 36, 45, 55, 66], out: (g) => g.pick([12, 14, 18, 20, 25, 30, 40, 50]), why: (n) => `${n} bukan bilangan segitiga` },
  { name: "pangkat tiga sempurna", mem: () => [8, 27, 64, 125, 216, 343], out: (g) => g.pick([9, 16, 36, 50, 100, 150, 200]), why: (n) => `${n} bukan kubik sempurna` },
  { name: "kelipatan 6 yang juga genap", mem: () => [12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72], out: (g) => g.pick([14, 16, 20, 22, 26, 28, 34, 40]), why: (n) => `${n} bukan kelipatan 6` },
];
function numClass(g) {
  const s = g.pick(NUM_SETS);
  const three = g.sample(s.mem(), 3);
  let out = s.out(g), guard = 0;
  while ((three.includes(out) || s.mem().includes(out)) && guard++ < 30) out = s.out(g);
  if (s.mem().includes(out)) throw new Error("intruder bentrok");
  const four = g.shuffle([...three.map(String), String(out)]);
  return CLASS(`Manakah bilangan yang TIDAK termasuk dalam kelompok yang sama dengan tiga lainnya?\n(${four.join(" / ")})`,
    buildOptions(g, String(out), three.map(String)), `Tiga lainnya adalah ${s.name}; ${s.why(out)}.`);
}

export const classFor = (tier) => (g) => {
  if (tier === "easy") return wordClass(g, tier);
  if (tier === "normal") return g.chance(0.2) ? numClass(g) : wordClass(g, tier);
  if (tier === "hard") return g.chance(0.4) ? numClass(g) : wordClass(g, tier);
  return g.chance(0.6) ? numClass(g) : wordClass(g, tier);
};
