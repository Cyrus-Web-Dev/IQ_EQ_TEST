import type {
  AnswerRecord,
  Difficulty,
  Question,
  Session,
  SessionItem,
  SessionMode,
  TestType,
} from "./types";
import { DIFFICULTIES } from "./types";
import { QUESTIONS_PER_TIER_MIXED, QUESTIONS_PER_TIER_SESSION } from "./config";
import { getPool } from "./bank";
import { randomId, shuffle, type Rng } from "./random";
import type { SeenMap } from "./seen";

export interface PickResult {
  picked: Question[];
  /** true bila soal belum-pernah-muncul tidak cukup, sehingga riwayat 'seen' tingkat ini perlu direset. */
  exhausted: boolean;
}

/**
 * Pilih `count` soal dari `pool`:
 *  - prioritas soal yang belum pernah muncul;
 *  - dibagi merata antar-kategori (round-robin) supaya tiap sesi bervariasi;
 *  - kalau soal baru tidak cukup, sisanya diambil dari soal lama (exhausted = true).
 */
export function pickQuestions(
  pool: readonly Question[],
  count: number,
  seenIds: ReadonlySet<string>,
  rng: Rng = Math.random,
): PickResult {
  const fresh = pool.filter((q) => !seenIds.has(q.id));
  const picked = roundRobinByCategory(fresh, Math.min(count, fresh.length), rng);
  let exhausted = false;
  if (picked.length < count) {
    exhausted = true;
    const used = new Set(picked.map((q) => q.id));
    const stale = pool.filter((q) => !used.has(q.id));
    picked.push(...roundRobinByCategory(stale, count - picked.length, rng));
  }
  return { picked, exhausted };
}

function roundRobinByCategory(qs: readonly Question[], count: number, rng: Rng): Question[] {
  const groups = new Map<string, Question[]>();
  for (const q of qs) {
    const g = groups.get(q.category);
    if (g) g.push(q);
    else groups.set(q.category, [q]);
  }
  const queues = shuffle([...groups.keys()], rng).map((k) => shuffle(groups.get(k) as Question[], rng));
  const out: Question[] = [];
  while (out.length < count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.pop();
      if (next) out.push(next);
      if (out.length >= count) break;
    }
  }
  return out;
}

/** Acak urutan opsi; `correct` dihitung ulang mengikuti posisi barunya. */
export function toSessionItem(q: Question, rng: Rng = Math.random): SessionItem {
  const order = shuffle([0, 1, 2, 3], rng);
  const options = order.map((i) => q.options[i] as string);
  return {
    id: q.id,
    difficulty: q.difficulty,
    category: q.category,
    question: q.question,
    options,
    correct: order.indexOf(q.correct),
    explanation: q.explanation,
  };
}

export interface CreateSessionOptions {
  type: TestType;
  mode: SessionMode;
  tier?: Difficulty;
  seen: SeenMap;
  rng?: Rng;
  now?: number;
}

export interface CreateSessionResult {
  session: Session;
  /** Tingkat yang riwayat 'seen'-nya sudah habis dan sebaiknya direset oleh pemanggil. */
  exhaustedTiers: Difficulty[];
}

export function createSession(opts: CreateSessionOptions): CreateSessionResult {
  const { type, mode, seen, rng = Math.random } = opts;
  const seenSet = new Set(seen[type]);
  const exhaustedTiers: Difficulty[] = [];
  let questions: Question[] = [];

  if (mode === "tier") {
    const tier = opts.tier;
    if (!tier) throw new Error('Mode "tier" memerlukan parameter tier.');
    const r = pickQuestions(getPool(type, tier), QUESTIONS_PER_TIER_SESSION, seenSet, rng);
    questions = r.picked;
    if (r.exhausted) exhaustedTiers.push(tier);
  } else {
    for (const d of DIFFICULTIES) {
      const r = pickQuestions(getPool(type, d), QUESTIONS_PER_TIER_MIXED, seenSet, rng);
      questions.push(...r.picked);
      if (r.exhausted) exhaustedTiers.push(d);
    }
  }

  // Urutan akhir diacak penuh: nomor & posisi soal tidak pernah sama antar sesi.
  const items = shuffle(questions, rng).map((q) => toSessionItem(q, rng));
  const session: Session = {
    id: randomId(rng),
    type,
    mode,
    tier: opts.tier,
    startedAt: opts.now ?? Date.now(),
    items,
  };
  return { session, exhaustedTiers };
}

export function isCorrect(item: SessionItem, answer: AnswerRecord | undefined): boolean {
  return !!answer && answer.selected !== null && answer.selected === item.correct;
}

/** ID soal yang tercakup sesi — untuk dimasukkan ke riwayat 'seen'. */
export function sessionQuestionIds(session: Session): string[] {
  return session.items.map((i) => i.id);
}
