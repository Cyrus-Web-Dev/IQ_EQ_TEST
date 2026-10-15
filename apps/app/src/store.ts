import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import {
  addHistory,
  clearSeenFor,
  computeResult,
  createHistoryEntry,
  createSession,
  emptySeen,
  getPool,
  markSeen,
  sessionQuestionIds,
  type AnswerRecord,
  type Difficulty,
  type HistoryEntry,
  type SeenMap,
  type Session,
  type SessionMode,
  type TestType,
} from "@tesiqeq/core";

const K_SEEN = "tesiqeq:v2:seen";
const K_HISTORY = "tesiqeq:v2:history";

export interface AppState {
  ready: boolean;
  seen: SeenMap;
  history: HistoryEntry[];
  session: Session | null;
}

let state: AppState = { ready: false, seen: emptySeen(), history: [], session: null };
const listeners = new Set<() => void>();

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** Selector harus mengembalikan nilai yang stabil (bagian dari state), bukan objek baru. */
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

async function persist() {
  try {
    await AsyncStorage.multiSet([
      [K_SEEN, JSON.stringify(state.seen)],
      [K_HISTORY, JSON.stringify(state.history)],
    ]);
  } catch {
    /* penyimpanan gagal: aplikasi tetap berjalan, hanya tidak tersimpan */
  }
}

function sanitizeSeen(raw: unknown): SeenMap {
  const out = emptySeen();
  if (raw && typeof raw === "object") {
    for (const t of ["iq", "eq"] as const) {
      const v = (raw as Record<string, unknown>)[t];
      if (Array.isArray(v)) out[t] = v.filter((x): x is string => typeof x === "string");
    }
  }
  return out;
}

let initPromise: Promise<void> | null = null;
export function initStore(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const [s, h] = await Promise.all([AsyncStorage.getItem(K_SEEN), AsyncStorage.getItem(K_HISTORY)]);
        const parsedHistory = h ? JSON.parse(h) : [];
        set({
          seen: s ? sanitizeSeen(JSON.parse(s)) : emptySeen(),
          history: Array.isArray(parsedHistory) ? (parsedHistory as HistoryEntry[]) : [],
          ready: true,
        });
      } catch {
        set({ ready: true });
      }
    })();
  }
  return initPromise;
}

export function startSession(type: TestType, mode: SessionMode, tier?: Difficulty): Session {
  const { session, exhaustedTiers } = createSession({ type, mode, tier, seen: state.seen });
  let seen = state.seen;
  // pool tingkat yang habis: lupakan riwayat 'seen' tingkat itu agar siklus soal mulai lagi
  for (const t of exhaustedTiers) seen = clearSeenFor(seen, type, getPool(type, t).map((q) => q.id));
  set({ session, seen });
  void persist();
  return session;
}

export function finishSession(answers: AnswerRecord[]): string | null {
  const session = state.session;
  if (!session) return null;
  const result = computeResult(session, answers);
  const entry = createHistoryEntry(session, answers, result);
  set({
    history: addHistory(state.history, entry),
    seen: markSeen(state.seen, session.type, sessionQuestionIds(session)),
    session: null,
  });
  void persist();
  return entry.id;
}

export function abandonSession() {
  set({ session: null });
}

export function resetAllData() {
  set({ history: [], seen: emptySeen(), session: null });
  void persist();
}
