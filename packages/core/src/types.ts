export type TestType = "iq" | "eq";

export const DIFFICULTIES = ["easy", "normal", "hard", "extreme"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const IQ_CATEGORIES = [
  "number_pattern",
  "verbal_analogy",
  "deductive_logic",
  "math_reasoning",
  "classification",
  "spatial_logic",
] as const;
export type IqCategory = (typeof IQ_CATEGORIES)[number];

export const EQ_TRAITS = [
  "self_awareness",
  "self_regulation",
  "impulse_control",
  "empathy",
  "social_awareness",
  "relationship_management",
  "conflict_management",
  "decision_making",
] as const;
export type EqTrait = (typeof EQ_TRAITS)[number];

export type Category = IqCategory | EqTrait;

/** Soal mentah seperti tersimpan di JSON (opsi belum diacak). */
export interface Question {
  id: string;
  type: TestType;
  difficulty: Difficulty;
  category: Category;
  question: string;
  /** Tepat 4 opsi, semua berbeda. */
  options: [string, string, string, string];
  /** Indeks (0-3) opsi yang benar pada `options` di atas. */
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

/** Soal siap tampil: opsi sudah diacak, `correct` menunjuk ke urutan baru. */
export interface SessionItem {
  id: string;
  difficulty: Difficulty;
  category: Category;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export type SessionMode = "tier" | "mixed";

export interface Session {
  id: string;
  type: TestType;
  mode: SessionMode;
  /** Hanya terisi untuk mode "tier". */
  tier?: Difficulty;
  startedAt: number;
  items: SessionItem[];
}

export interface AnswerRecord {
  questionId: string;
  /** null = waktu habis / dilewati. */
  selected: number | null;
  timeSec: number;
}

export interface TierBreakdown {
  difficulty: Difficulty;
  total: number;
  correct: number;
  accuracy: number;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  correct: number;
  accuracy: number;
}

export interface TestResult {
  type: TestType;
  mode: SessionMode;
  score: number;
  label: string;
  description: string;
  total: number;
  correct: number;
  accuracy: number;
  avgTimeSec: number;
  byDifficulty: TierBreakdown[];
  byCategory: CategoryBreakdown[];
  suggestions: string[];
}
