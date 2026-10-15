// Merakit 400 soal IQ (4 tingkat × 100) -> packages/core/data/iq/{tier}.json
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { collect, makeRng } from "./lib.mjs";
import * as N from "./iq-number.mjs";
import * as M from "./iq-math.mjs";
import * as S from "./iq-spatial.mjs";
import * as L from "./iq-logic.mjs";
import { analogyFor, classFor } from "./iq-verbal.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../../packages/core/data/iq");
const SEEDS = { easy: 1101, normal: 2202, hard: 3303, extreme: 4404 };

// komposisi 100 soal per tingkat
const PLAN = { number_pattern: 25, math_reasoning: 20, deductive_logic: 20, verbal_analogy: 15, classification: 10, spatial_logic: 10 };

const FAMILIES = {
  easy: { number: N.easyPatterns, math: M.easyMath, spatial: S.easySpatial, logic: L.easyLogic },
  normal: { number: N.normalPatterns, math: M.normalMath, spatial: S.normalSpatial, logic: L.normalLogic },
  hard: { number: N.hardPatterns, math: M.hardMath, spatial: S.hardSpatial, logic: L.hardLogic },
  extreme: { number: N.extremePatterns, math: M.extremeMath, spatial: S.extremeSpatial, logic: L.extremeLogic },
};

const seenTexts = new Set(); // dibagi lintas tingkat: tidak ada teks soal kembar di seluruh bank IQ

for (const tier of ["easy", "normal", "hard", "extreme"]) {
  const g = makeRng(SEEDS[tier]);
  const fam = FAMILIES[tier];
  const all = [];
  const cycle = (list, count, label) =>
    collect(count, (i, att) => list[(i + Math.floor(att / 25)) % list.length](g), seenTexts, `${tier}/${label}`);

  all.push(...cycle(fam.number, PLAN.number_pattern, "number"));
  all.push(...cycle(fam.math, PLAN.math_reasoning, "math"));
  all.push(...cycle(fam.spatial, PLAN.spatial_logic, "spatial"));

  const deck = fam.logic.flatMap((x) => Array(x.w).fill(x.f));
  all.push(...collect(PLAN.deductive_logic, (i, att) => deck[(i + Math.floor(att / 25)) % deck.length](g), seenTexts, `${tier}/logic`));

  const an = analogyFor(tier), cl = classFor(tier);
  all.push(...collect(PLAN.verbal_analogy, () => an(g), seenTexts, `${tier}/analogy`));
  all.push(...collect(PLAN.classification, () => cl(g), seenTexts, `${tier}/class`));

  const questions = g.shuffle(all).map((q, i) => ({
    id: `iq-${tier}-${String(i + 1).padStart(3, "0")}`,
    type: "iq",
    difficulty: tier,
    category: q.category,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  }));
  if (questions.length !== 100) throw new Error(`${tier}: ${questions.length} soal`);

  const body = "[\n" + questions.map((q) => "  " + JSON.stringify(q)).join(",\n") + "\n]\n";
  writeFileSync(join(OUT, `${tier}.json`), body);
  console.log(`iq/${tier}.json  ${questions.length} soal`);
}
