import type { Difficulty, Question, TestType } from "./types";
import { DIFFICULTIES } from "./types";

import iqEasy from "../data/iq/easy.json";
import iqNormal from "../data/iq/normal.json";
import iqHard from "../data/iq/hard.json";
import iqExtreme from "../data/iq/extreme.json";
import eqEasy from "../data/eq/easy.json";
import eqNormal from "../data/eq/normal.json";
import eqHard from "../data/eq/hard.json";
import eqExtreme from "../data/eq/extreme.json";

const BANK: Record<TestType, Record<Difficulty, Question[]>> = {
  iq: {
    easy: iqEasy as Question[],
    normal: iqNormal as Question[],
    hard: iqHard as Question[],
    extreme: iqExtreme as Question[],
  },
  eq: {
    easy: eqEasy as Question[],
    normal: eqNormal as Question[],
    hard: eqHard as Question[],
    extreme: eqExtreme as Question[],
  },
};

export function getPool(type: TestType, difficulty: Difficulty): readonly Question[] {
  return BANK[type][difficulty];
}

export function getAllQuestions(type: TestType): Question[] {
  return DIFFICULTIES.flatMap((d) => BANK[type][d]);
}

export function bankCounts(): Record<TestType, Record<Difficulty, number>> {
  const out = {} as Record<TestType, Record<Difficulty, number>>;
  for (const t of ["iq", "eq"] as const) {
    out[t] = {} as Record<Difficulty, number>;
    for (const d of DIFFICULTIES) out[t][d] = BANK[t][d].length;
  }
  return out;
}
