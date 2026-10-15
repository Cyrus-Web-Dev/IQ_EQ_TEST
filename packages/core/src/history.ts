import type { AnswerRecord, Difficulty, Session, SessionMode, TestResult, TestType } from "./types";
import { DIFFICULTIES } from "./types";
import type { Category } from "./types";

export const HISTORY_LIMIT = 60;

export interface HistoryEntry {
  id: string;
  type: TestType;
  mode: SessionMode;
  tier?: Difficulty;
  finishedAt: number;
  session: Session;
  answers: AnswerRecord[];
  result: TestResult;
}

export function createHistoryEntry(
  session: Session,
  answers: AnswerRecord[],
  result: TestResult,
  now: number = Date.now(),
): HistoryEntry {
  return { id: session.id, type: session.type, mode: session.mode, tier: session.tier, finishedAt: now, session, answers, result };
}

/** Terbaru di depan; id yang sama diganti; dipotong sampai `limit`. */
export function addHistory(history: readonly HistoryEntry[], entry: HistoryEntry, limit: number = HISTORY_LIMIT): HistoryEntry[] {
  return [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, limit);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Kunci hari lokal, mis. "2026-10-14". */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Nomor hari (bilangan bulat) dari kunci hari; memakai tengah hari agar aman dari pergeseran DST. */
function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return Math.floor(new Date(y, m - 1, d, 12).getTime() / 86_400_000);
}

export function computeStreak(history: readonly HistoryEntry[], now: number = Date.now()): { current: number; longest: number } {
  const days = [...new Set(history.map((h) => dayKey(h.finishedAt)))].map(dayNumber).sort((a, b) => a - b);
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 1, run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i]! - days[i - 1]! === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = dayNumber(dayKey(now));
  const set = new Set(days);
  let cursor = set.has(today) ? today : set.has(today - 1) ? today - 1 : null;
  let current = 0;
  while (cursor !== null && set.has(cursor)) {
    current++;
    cursor--;
  }
  return { current, longest };
}

export interface TypeStats {
  count: number;
  avgScore: number;
  bestScore: number;
  lastScore: number;
  /** Skor terbaru sampai 10 sesi, urut lama → baru (untuk grafik). */
  recentScores: number[];
}

export interface CategoryStat {
  category: Category;
  total: number;
  correct: number;
  accuracy: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
}

export interface Stats {
  totalTests: number;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
  streak: number;
  longestStreak: number;
  iq: TypeStats;
  eq: TypeStats;
  /** Diurutkan dari akurasi terendah (area yang perlu dilatih) ke tertinggi. */
  categories: CategoryStat[];
  badges: Badge[];
}

function typeStats(history: readonly HistoryEntry[], type: TestType): TypeStats {
  const mine = history.filter((h) => h.type === type); // terbaru di depan
  if (mine.length === 0) return { count: 0, avgScore: 0, bestScore: 0, lastScore: 0, recentScores: [] };
  const scores = mine.map((h) => h.result.score);
  return {
    count: mine.length,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    lastScore: scores[0]!,
    recentScores: scores.slice(0, 10).reverse(),
  };
}

export function computeBadges(history: readonly HistoryEntry[], longestStreak: number): Badge[] {
  const has = (type: TestType) => history.some((h) => h.type === type);
  const tierModesDone = (): boolean => {
    const done = new Set(history.filter((h) => h.mode === "tier" && h.tier).map((h) => h.tier as Difficulty));
    return DIFFICULTIES.every((d) => done.has(d));
  };
  const extremeAce = history.some((h) => {
    const e = h.result.byDifficulty.find((b) => b.difficulty === "extreme");
    return !!e && e.total >= 5 && e.accuracy >= 0.7;
  });
  const defs: [string, string, string, boolean][] = [
    ["first_test", "Langkah Pertama", "Selesaikan tes pertamamu.", history.length >= 1],
    ["five_tests", "Mulai Terbiasa", "Selesaikan 5 tes.", history.length >= 5],
    ["twenty_tests", "Konsisten", "Selesaikan 20 tes.", history.length >= 20],
    ["both_types", "Dua Sisi", "Selesaikan minimal satu tes IQ dan satu tes EQ.", has("iq") && has("eq")],
    ["streak3", "Tiga Hari Berturut", "Tes tiga hari berturut-turut.", longestStreak >= 3],
    ["streak7", "Seminggu Penuh", "Tes tujuh hari berturut-turut.", longestStreak >= 7],
    ["perfect", "Sempurna", "Jawab semua soal benar pada satu tes (minimal 10 soal).", history.some((h) => h.result.total >= 10 && h.result.accuracy === 1)],
    ["extreme_ace", "Taklukkan Extreme", "Capai akurasi 70% pada soal Extreme (minimal 5 soal).", extremeAce],
    ["speedy", "Cepat dan Tepat", "Rata-rata jawab ≤ 12 detik dengan akurasi ≥ 70%.", history.some((h) => h.result.avgTimeSec > 0 && h.result.avgTimeSec <= 12 && h.result.accuracy >= 0.7)],
    ["all_tiers", "Semua Tingkat", "Selesaikan tes mode satu tingkat untuk Easy, Normal, Hard, dan Extreme.", tierModesDone()],
  ];
  return defs.map(([id, title, description, earned]) => ({ id, title, description, earned }));
}

export function computeStats(history: readonly HistoryEntry[], now: number = Date.now()): Stats {
  const totalQuestions = history.reduce((a, h) => a + h.result.total, 0);
  const totalCorrect = history.reduce((a, h) => a + h.result.correct, 0);
  const { current, longest } = computeStreak(history, now);

  const cat = new Map<Category, { total: number; correct: number }>();
  for (const h of history) {
    for (const c of h.result.byCategory) {
      const s = cat.get(c.category) ?? { total: 0, correct: 0 };
      s.total += c.total;
      s.correct += c.correct;
      cat.set(c.category, s);
    }
  }
  const categories: CategoryStat[] = [...cat.entries()]
    .map(([category, s]) => ({ category, total: s.total, correct: s.correct, accuracy: s.correct / s.total }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    totalTests: history.length,
    totalQuestions,
    totalCorrect,
    overallAccuracy: totalQuestions ? totalCorrect / totalQuestions : 0,
    streak: current,
    longestStreak: longest,
    iq: typeStats(history, "iq"),
    eq: typeStats(history, "eq"),
    categories,
    badges: computeBadges(history, longest),
  };
}
