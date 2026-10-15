import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeResult,
  mulberry32,
  pickQuestions,
  toSessionItem,
  type AnswerRecord,
  type Question,
  type Session,
} from "../src/index";

function fakePool(n: number, difficulty: Question["difficulty"] = "easy"): Question[] {
  const cats = ["number_pattern", "verbal_analogy", "deductive_logic", "math_reasoning"] as const;
  return Array.from({ length: n }, (_, i) => ({
    id: `t_${difficulty}_${i}`,
    type: "iq",
    difficulty,
    category: cats[i % cats.length]!,
    question: `Soal ${i}`,
    options: [`a${i}`, `b${i}`, `c${i}`, `d${i}`],
    correct: (i % 4) as 0 | 1 | 2 | 3,
    explanation: "x",
  }));
}

test("toSessionItem: jawaban benar tetap menunjuk opsi yang sama setelah diacak", () => {
  const rng = mulberry32(7);
  for (const q of fakePool(50)) {
    const item = toSessionItem(q, rng);
    assert.equal(item.options[item.correct], q.options[q.correct]);
    assert.equal(new Set(item.options).size, 4);
  }
});

test("pickQuestions: prioritas soal belum pernah muncul, tanpa duplikat", () => {
  const pool = fakePool(40);
  const seen = new Set(pool.slice(0, 30).map((q) => q.id));
  const r = pickQuestions(pool, 10, seen, mulberry32(1));
  assert.equal(r.picked.length, 10);
  assert.equal(r.exhausted, false);
  assert.ok(r.picked.every((q) => !seen.has(q.id)));
  assert.equal(new Set(r.picked.map((q) => q.id)).size, 10);
});

test("pickQuestions: exhausted bila soal baru kurang, tetap penuh & tanpa duplikat", () => {
  const pool = fakePool(12);
  const seen = new Set(pool.slice(0, 8).map((q) => q.id));
  const r = pickQuestions(pool, 10, seen, mulberry32(2));
  assert.equal(r.picked.length, 10);
  assert.equal(r.exhausted, true);
  assert.equal(new Set(r.picked.map((q) => q.id)).size, 10);
});

test("pickQuestions: kategori terbagi merata", () => {
  const r = pickQuestions(fakePool(40), 8, new Set(), mulberry32(3));
  const counts = new Map<string, number>();
  for (const q of r.picked) counts.set(q.category, (counts.get(q.category) ?? 0) + 1);
  assert.ok([...counts.values()].every((c) => c === 2));
});

test("urutan soal & opsi berbeda antar sesi (seed berbeda)", () => {
  const pool = fakePool(40);
  const a = pickQuestions(pool, 20, new Set(), mulberry32(11)).picked.map((q) => q.id);
  const b = pickQuestions(pool, 20, new Set(), mulberry32(12)).picked.map((q) => q.id);
  assert.notDeepEqual(a, b);
});

function sessionOf(difficulty: Question["difficulty"], n: number): Session {
  const rng = mulberry32(5);
  return {
    id: "s",
    type: "iq",
    mode: "tier",
    tier: difficulty,
    startedAt: 0,
    items: fakePool(n, difficulty).map((q) => toSessionItem(q, rng)),
  };
}

const answersFor = (s: Session, okCount: number): AnswerRecord[] =>
  s.items.map((it, i) => ({ questionId: it.id, selected: i < okCount ? it.correct : (it.correct + 1) % 4, timeSec: 10 }));

test("skor: sempurna di Easy tidak melebihi 100; sempurna di Extreme = 145; kosong = 70", () => {
  const easy = sessionOf("easy", 20);
  assert.equal(computeResult(easy, answersFor(easy, 20)).score, 100);
  const ext = sessionOf("extreme", 20);
  assert.equal(computeResult(ext, answersFor(ext, 20)).score, 145);
  assert.equal(computeResult(ext, []).score, 115); // 0% di Extreme = floor 115
  const eas = sessionOf("easy", 20);
  assert.equal(computeResult(eas, []).score, 70);
});

test("waktu habis (selected null) dihitung salah", () => {
  const s = sessionOf("normal", 10);
  const res = computeResult(
    s,
    s.items.map((it) => ({ questionId: it.id, selected: null, timeSec: 50 })),
  );
  assert.equal(res.correct, 0);
});

test("mode campuran: sempurna = 145, kosong = 70, hanya Easy benar = skor rendah", () => {
  const rng = mulberry32(9);
  const items = (["easy", "normal", "hard", "extreme"] as const).flatMap((d) => fakePool(10, d).map((q) => toSessionItem(q, rng)));
  const s: Session = { id: "m", type: "iq", mode: "mixed", startedAt: 0, items };
  const all: AnswerRecord[] = items.map((it) => ({ questionId: it.id, selected: it.correct, timeSec: 5 }));
  assert.equal(computeResult(s, all).score, 145);
  assert.equal(computeResult(s, []).score, 70);
  const onlyEasy = items.map((it) => ({ questionId: it.id, selected: it.difficulty === "easy" ? it.correct : null, timeSec: 5 }));
  assert.ok(computeResult(s, onlyEasy).score < 85);
});
