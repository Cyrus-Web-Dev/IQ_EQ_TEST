import type { TestType } from "./types";

/** ID soal yang sudah pernah muncul, per tipe tes. Disimpan oleh aplikasi (AsyncStorage/localStorage). */
export type SeenMap = Record<TestType, string[]>;

export const emptySeen = (): SeenMap => ({ iq: [], eq: [] });

export function markSeen(seen: SeenMap, type: TestType, ids: string[]): SeenMap {
  const merged = new Set(seen[type]);
  for (const id of ids) merged.add(id);
  return { ...seen, [type]: [...merged] };
}

export function clearSeenFor(seen: SeenMap, type: TestType, idsToForget: Iterable<string>): SeenMap {
  const drop = new Set(idsToForget);
  return { ...seen, [type]: seen[type].filter((id) => !drop.has(id)) };
}
