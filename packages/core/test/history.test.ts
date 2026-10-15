import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addHistory,
  computeStats,
  computeStreak,
  createSession,
  computeResult,
  emptySeen,
  HISTORY_LIMIT,
  mulberry32,
  createHistoryEntry,
  type HistoryEntry,
} from "../src/index";

function entry(daysAgo: number, now: number, opts: { type?: "iq" | "eq"; correctAll?: boolean; idSuffix?: string } = {}): HistoryEntry {
  const rng = mulberry32(daysAgo * 7 + (opts.type === "eq" ? 1000 : 0) + 1);
  const type = opts.type ?? "iq";
  const { session } = createSession({ type, mode: "mixed", seen: emptySeen(), rng });
  const answers = session.items.map((it) => ({ questionId: it.id, selected: opts.correctAll ? it.correct : null, timeSec: 10 }));
  const result = computeResult(session, answers);
  const e = createHistoryEntry(session, answers, result, now - daysAgo * 86_400_000);
  return { ...e, id: `${e.id}-${daysAgo}-${opts.idSuffix ?? ""}` };
}

const NOW = new Date(2026, 9, 14, 15, 0, 0).getTime(); // 14 Okt 2026, 15.00 lokal

test("streak: hari ini + kemarin + 2 hari lalu = 3, putus bila ada celah", () => {
  const h = [entry(0, NOW), entry(1, NOW), entry(2, NOW), entry(5, NOW)];
  assert.deepEqual(computeStreak(h, NOW), { current: 3, longest: 3 });
});

test("streak: belum tes hari ini tetapi kemarin ya -> streak masih hidup", () => {
  const h = [entry(1, NOW), entry(2, NOW)];
  assert.equal(computeStreak(h, NOW).current, 2);
});

test("streak: terakhir tes 3 hari lalu -> current 0, longest tetap", () => {
  const h = [entry(3, NOW), entry(4, NOW), entry(5, NOW)];
  assert.deepEqual(computeStreak(h, NOW), { current: 0, longest: 3 });
});

test("streak: riwayat kosong", () => {
  assert.deepEqual(computeStreak([], NOW), { current: 0, longest: 0 });
});

test("addHistory: terbaru di depan, id sama diganti, dibatasi HISTORY_LIMIT", () => {
  let h: HistoryEntry[] = [];
  for (let i = 0; i < HISTORY_LIMIT + 5; i++) h = addHistory(h, entry(0, NOW, { idSuffix: String(i) }));
  assert.equal(h.length, HISTORY_LIMIT);
  const again = addHistory(h, h[3]!);
  assert.equal(again.length, HISTORY_LIMIT);
  assert.equal(again[0]!.id, h[3]!.id);
});

test("computeStats: ringkasan IQ/EQ, akurasi, lencana", () => {
  const h = [entry(0, NOW, { correctAll: true }), entry(1, NOW, { type: "eq", correctAll: true }), entry(2, NOW)];
  const s = computeStats(h, NOW);
  assert.equal(s.totalTests, 3);
  assert.equal(s.iq.count, 2);
  assert.equal(s.eq.count, 1);
  assert.equal(s.iq.bestScore, 145);
  assert.equal(s.streak, 3);
  const earned = new Set(s.badges.filter((b) => b.earned).map((b) => b.id));
  for (const id of ["first_test", "both_types", "streak3", "perfect", "extreme_ace"]) assert.ok(earned.has(id), id);
  assert.ok(!earned.has("five_tests"));
  assert.ok(s.categories.length > 0 && s.categories[0]!.accuracy <= s.categories[s.categories.length - 1]!.accuracy);
});
