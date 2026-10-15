import type { Category } from "./types";

export const CATEGORY_LABEL: Record<Category, string> = {
  // IQ
  number_pattern: "Pola Angka",
  verbal_analogy: "Analogi Verbal",
  deductive_logic: "Logika Deduktif",
  math_reasoning: "Penalaran Matematika",
  classification: "Klasifikasi",
  spatial_logic: "Logika Spasial",
  // EQ
  self_awareness: "Kesadaran Diri",
  self_regulation: "Regulasi Diri",
  impulse_control: "Kontrol Impuls",
  empathy: "Empati",
  social_awareness: "Kesadaran Sosial",
  relationship_management: "Manajemen Relasi",
  conflict_management: "Manajemen Konflik",
  decision_making: "Pengambilan Keputusan",
};

export interface Bracket {
  max: number;
  label: string;
  description: string;
}

export const IQ_BRACKETS: Bracket[] = [
  { max: 84, label: "Di Bawah Rata-rata", description: "Performa penalaran logis masih bisa banyak ditingkatkan dengan latihan rutin." },
  { max: 99, label: "Rata-rata Bawah", description: "Penalaran logis sedikit di bawah rata-rata umum, dan ini bukan hal tetap — bisa berkembang." },
  { max: 109, label: "Rata-rata", description: "Penalaran logis berada di kisaran rata-rata populasi umum." },
  { max: 119, label: "Rata-rata Atas", description: "Penalaran logis di atas rata-rata; pemahaman pola dan logika sudah baik." },
  { max: 129, label: "Superior", description: "Penalaran logis tergolong tinggi; mampu memecahkan masalah kompleks dengan cukup cepat." },
  { max: Infinity, label: "Sangat Superior", description: "Penalaran logis berada di level sangat tinggi dibanding populasi umum." },
];

export const EQ_BRACKETS: Bracket[] = [
  { max: 84, label: "Perlu Banyak Pengembangan", description: "Kesadaran dan pengelolaan emosi dalam situasi sosial masih perlu banyak dilatih." },
  { max: 99, label: "Berkembang", description: "Kecerdasan emosional mulai terbentuk; beberapa aspek masih perlu penguatan." },
  { max: 109, label: "Rata-rata", description: "Kecerdasan emosional di kisaran rata-rata; cukup mampu mengelola situasi sosial umum." },
  { max: 119, label: "Baik", description: "Kecerdasan emosional di atas rata-rata; cukup matang merespons situasi sosial dan emosional." },
  { max: 129, label: "Sangat Baik", description: "Kecerdasan emosional tinggi; mampu mengelola diri dan hubungan dengan baik di banyak situasi." },
  { max: Infinity, label: "Unggul", description: "Kecerdasan emosional di level unggul; sangat matang dalam empati, regulasi diri, dan relasi." },
];

export const DISCLAIMER =
  "Skor ini adalah estimasi self-assessment berbasis performa, bukan hasil tes psikometrik klinis (seperti WAIS-IV atau MSCEIT). Untuk hasil resmi, konsultasikan ke psikolog berlisensi.";
