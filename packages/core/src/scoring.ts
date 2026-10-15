import type {
  AnswerRecord,
  CategoryBreakdown,
  Session,
  TestResult,
  TierBreakdown,
} from "./types";
import { DIFFICULTIES } from "./types";
import { SCORE_MAX, SCORE_MIN, SCORE_RANGE, TIER_WEIGHT } from "./config";
import { CATEGORY_LABEL, EQ_BRACKETS, IQ_BRACKETS } from "./labels";
import { isCorrect } from "./engine";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Mode "tier": skor = floor + (ceil - floor) × akurasi, dengan rentang per tingkat.
 *   Sempurna di Easy tidak bisa melampaui 100; sempurna di Extreme = 145.
 * Mode "mixed": skor = 70 + 75 × (akurasi berbobot tingkat), bobot Easy 1 … Extreme 4.
 * Soal yang waktunya habis (selected = null) dihitung salah.
 */
export function computeResult(session: Session, answers: readonly AnswerRecord[]): TestResult {
  const byId = new Map(answers.map((a) => [a.questionId, a]));

  const tierStats = new Map<string, { total: number; correct: number }>();
  const catStats = new Map<string, { total: number; correct: number }>();
  let correct = 0;
  let timeSum = 0;
  let timeCount = 0;

  for (const item of session.items) {
    const ans = byId.get(item.id);
    const ok = isCorrect(item, ans);
    if (ok) correct++;
    if (ans) {
      timeSum += ans.timeSec;
      timeCount++;
    }
    const t = tierStats.get(item.difficulty) ?? { total: 0, correct: 0 };
    t.total++;
    if (ok) t.correct++;
    tierStats.set(item.difficulty, t);
    const c = catStats.get(item.category) ?? { total: 0, correct: 0 };
    c.total++;
    if (ok) c.correct++;
    catStats.set(item.category, c);
  }

  const byDifficulty: TierBreakdown[] = DIFFICULTIES.filter((d) => tierStats.has(d)).map((d) => {
    const s = tierStats.get(d)!;
    return { difficulty: d, total: s.total, correct: s.correct, accuracy: s.correct / s.total };
  });

  const byCategory: CategoryBreakdown[] = [...catStats.entries()]
    .map(([category, s]) => ({
      category: category as CategoryBreakdown["category"],
      total: s.total,
      correct: s.correct,
      accuracy: s.correct / s.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const total = session.items.length;
  let raw = SCORE_MIN;
  if (total > 0) {
    if (session.mode === "mixed") {
      // Mode campuran: soal sulit berbobot lebih besar; sempurna = SCORE_MAX, kosong = SCORE_MIN.
      let num = 0, den = 0;
      for (const t of byDifficulty) {
        const w = TIER_WEIGHT[t.difficulty];
        num += w * t.correct;
        den += w * t.total;
      }
      raw = SCORE_MIN + (SCORE_MAX - SCORE_MIN) * (den ? num / den : 0);
    } else {
      // Mode satu tingkat: skor dibatasi rentang tingkat itu (floor..ceil).
      let weighted = 0;
      for (const t of byDifficulty) {
        const r = SCORE_RANGE[t.difficulty];
        weighted += (r.floor + (r.ceil - r.floor) * t.accuracy) * t.total;
      }
      raw = weighted / total;
    }
  }
  const score = Math.round(clamp(raw, SCORE_MIN, SCORE_MAX));

  const brackets = session.type === "iq" ? IQ_BRACKETS : EQ_BRACKETS;
  const bracket = brackets.find((b) => score <= b.max) ?? brackets[brackets.length - 1]!;

  return {
    type: session.type,
    mode: session.mode,
    score,
    label: bracket.label,
    description: bracket.description,
    total,
    correct,
    accuracy: total ? correct / total : 0,
    avgTimeSec: timeCount ? timeSum / timeCount : 0,
    byDifficulty,
    byCategory,
    suggestions: buildSuggestions(session, byCategory, byDifficulty),
  };
}

function buildSuggestions(
  session: Session,
  byCategory: CategoryBreakdown[],
  byDifficulty: TierBreakdown[],
): string[] {
  const out: string[] = [];
  const weak = byCategory.filter((c) => c.total >= 2 && c.accuracy < 0.6).slice(0, 2);
  for (const w of weak) {
    out.push(`Area yang paling perlu dilatih: ${CATEGORY_LABEL[w.category]} (${Math.round(w.accuracy * 100)}% benar).`);
  }
  const strong = [...byCategory].reverse().find((c) => c.total >= 2 && c.accuracy >= 0.8);
  if (strong) out.push(`Kekuatanmu: ${CATEGORY_LABEL[strong.category]} (${Math.round(strong.accuracy * 100)}% benar).`);

  if (byDifficulty.length > 1) {
    const first = byDifficulty[0]!;
    const last = byDifficulty[byDifficulty.length - 1]!;
    if (last.accuracy < first.accuracy - 0.3) {
      out.push("Performamu turun cukup tajam di tingkat yang lebih sulit — coba latihan di tingkat Hard dan Extreme secara terpisah.");
    }
  }
  out.push(
    session.type === "iq"
      ? "Latihan rutin pola, logika, dan soal cerita 10–15 menit per hari lebih efektif daripada maraton sesekali."
      : "Refleksi singkat setelah situasi sulit (apa yang kurasakan, apa yang kuinginkan, apa respons terbaik) melatih kecerdasan emosional.",
  );
  return out;
}
