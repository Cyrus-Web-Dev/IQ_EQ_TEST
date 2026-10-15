import type { Difficulty } from "./types";

export const TIER_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  extreme: "Extreme",
};

/** Batas waktu per soal (detik) — makin sulit, makin ketat. */
export const TIME_LIMIT: Record<Difficulty, number> = {
  easy: 60,
  normal: 50,
  hard: 40,
  extreme: 30,
};

/** Jumlah soal per sesi. */
export const QUESTIONS_PER_TIER_SESSION = 20; // mode "tier"
export const QUESTIONS_PER_TIER_MIXED = 10; // mode "mixed" -> 40 soal

/**
 * Rentang skor per tingkat: akurasi 0% -> floor, 100% -> ceil.
 * Jadi menjawab sempurna di Easy saja tidak bisa menghasilkan skor "genius".
 */
export const SCORE_RANGE: Record<Difficulty, { floor: number; ceil: number }> = {
  easy: { floor: 70, ceil: 100 },
  normal: { floor: 85, ceil: 115 },
  hard: { floor: 100, ceil: 130 },
  extreme: { floor: 115, ceil: 145 },
};

/** Bobot kesulitan untuk mode campuran. */
export const TIER_WEIGHT: Record<Difficulty, number> = { easy: 1, normal: 2, hard: 3, extreme: 4 };

export const SCORE_MIN = 70;
export const SCORE_MAX = 145;

export const BANK_SIZE_PER_TIER = 100;
