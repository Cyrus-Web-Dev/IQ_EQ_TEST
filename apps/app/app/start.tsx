import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  DIFFICULTIES,
  QUESTIONS_PER_TIER_MIXED,
  QUESTIONS_PER_TIER_SESSION,
  TIER_LABEL,
  TIME_LIMIT,
  getPool,
  type Difficulty,
  type TestType,
} from "@tesiqeq/core";
import { startSession, useStore } from "../src/store";
import { TYPE_NAME, tierColor, typeColor, useTheme } from "../src/theme";
import { Body, Button, Card, H2, Screen } from "../src/ui";

const TIER_HINT: Record<Difficulty, string> = {
  easy: "Dasar, cocok untuk pemanasan.",
  normal: "Butuh sedikit berpikir.",
  hard: "Menantang, beberapa jawaban tampak mirip.",
  extreme: "Sangat sulit, waktu paling ketat.",
};

type Choice = "mixed" | Difficulty;

export default function Start() {
  const t = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const testType: TestType = type === "eq" ? "eq" : "iq";
  const seen = useStore((s) => s.seen);
  const [choice, setChoice] = useState<Choice>("mixed");
  const color = typeColor(testType, t);

  const fresh = useMemo(() => {
    const seenSet = new Set(seen[testType]);
    const out = {} as Record<Difficulty, number>;
    for (const d of DIFFICULTIES) out[d] = getPool(testType, d).filter((q) => !seenSet.has(q.id)).length;
    return out;
  }, [seen, testType]);

  const begin = () => {
    if (choice === "mixed") startSession(testType, "mixed");
    else startSession(testType, "tier", choice);
    router.replace("/test");
  };

  const Option = ({ value, title, subtitle, accent }: { value: Choice; title: string; subtitle: string; accent: string }) => {
    const active = choice === value;
    return (
      <Pressable onPress={() => setChoice(value)} accessibilityRole="radio" accessibilityState={{ selected: active }}>
        <View
          style={{
            borderRadius: 14,
            borderWidth: 2,
            borderColor: active ? accent : t.border,
            backgroundColor: active ? accent + "18" : t.card,
            padding: 14,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: t.text }}>{title}</Text>
          <Text style={{ fontSize: 13, color: t.muted }}>{subtitle}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen>
      <H2 style={{ color }}>{TYPE_NAME[testType]}</H2>
      <Card>
        <Body>Pilih cara bermain. Soal dan urutan opsi selalu diacak, dan soal yang sudah pernah muncul tidak diulang sampai soal tingkat itu habis.</Body>
      </Card>

      <Option
        value="mixed"
        accent={color}
        title={`Campuran · ${QUESTIONS_PER_TIER_MIXED * 4} soal`}
        subtitle={`${QUESTIONS_PER_TIER_MIXED} soal dari tiap tingkat, diacak penuh. Skor memakai bobot kesulitan, jadi bisa mencapai 145.`}
      />
      {DIFFICULTIES.map((d) => (
        <Option
          key={d}
          value={d}
          accent={tierColor[d]}
          title={`${TIER_LABEL[d]} · ${QUESTIONS_PER_TIER_SESSION} soal · ${TIME_LIMIT[d]} dtk/soal`}
          subtitle={`${TIER_HINT[d]} Soal baru tersisa: ${fresh[d]} dari 100.`}
        />
      ))}
      <Body muted style={{ fontSize: 13 }}>
        Waktu habis dihitung salah. Jawaban yang sudah kamu pilih tetap dihitung saat waktu habis.
      </Body>
      <Button title="Mulai" onPress={begin} color={color} />
    </Screen>
  );
}
