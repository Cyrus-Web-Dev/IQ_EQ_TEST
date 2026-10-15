import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { CATEGORY_LABEL, TIER_LABEL } from "@tesiqeq/core";
import { useStore } from "../src/store";
import { tierColor, useTheme } from "../src/theme";
import { Body, Card, H2, Pill, Screen } from "../src/ui";

const LETTERS = ["A", "B", "C", "D"];

export default function Review() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entry = useStore((s) => s.history.find((h) => h.id === id));
  const [onlyWrong, setOnlyWrong] = useState(false);

  if (!entry) {
    return (
      <Screen>
        <H2>Data tidak ditemukan</H2>
      </Screen>
    );
  }

  const byId = new Map(entry.answers.map((a) => [a.questionId, a]));
  const rows = entry.session.items
    .map((item, i) => ({ item, i, ans: byId.get(item.id) }))
    .filter(({ item, ans }) => !onlyWrong || !ans || ans.selected !== item.correct);

  return (
    <Screen>
      <Pressable onPress={() => setOnlyWrong(!onlyWrong)} accessibilityRole="switch" accessibilityState={{ checked: onlyWrong }}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 26,
              borderRadius: 13,
              backgroundColor: onlyWrong ? t.primary : t.cardAlt,
              justifyContent: "center",
              paddingHorizontal: 3,
            }}
          >
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", alignSelf: onlyWrong ? "flex-end" : "flex-start" }} />
          </View>
          <Text style={{ color: t.text, fontWeight: "600" }}>Hanya yang salah atau terlewat</Text>
        </View>
      </Pressable>

      {rows.length === 0 && <Body muted>Tidak ada soal yang salah. Kerja bagus!</Body>}

      {rows.map(({ item, i, ans }) => {
        const timedOut = !ans || ans.selected === null;
        const correct = !!ans && ans.selected === item.correct;
        return (
          <Card key={item.id} accent={correct ? t.success : t.danger}>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Text style={{ fontWeight: "800", color: t.muted }}>#{i + 1}</Text>
              <Pill label={TIER_LABEL[item.difficulty]} color={tierColor[item.difficulty]} />
              <Pill label={CATEGORY_LABEL[item.category]} color={t.primary} />
            </View>
            <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: t.text }}>{item.question}</Text>
            {item.options.map((opt, k) => {
              const isCorrect = k === item.correct;
              const isChosen = ans?.selected === k;
              const bg = isCorrect ? t.successBg : isChosen ? t.dangerBg : t.cardAlt;
              return (
                <View key={k} style={{ flexDirection: "row", gap: 10, backgroundColor: bg, borderRadius: 10, padding: 10 }}>
                  <Text style={{ fontWeight: "800", color: isCorrect ? t.success : isChosen ? t.danger : t.muted }}>{LETTERS[k]}</Text>
                  <Text style={{ flex: 1, color: t.text, lineHeight: 21 }}>
                    {opt}
                    {isCorrect ? "  ✓ benar" : isChosen ? "  ✗ pilihanmu" : ""}
                  </Text>
                </View>
              );
            })}
            {timedOut && <Text style={{ color: t.danger, fontWeight: "600" }}>Waktu habis atau dilewati</Text>}
            <View style={{ backgroundColor: t.cardAlt, borderRadius: 10, padding: 10 }}>
              <Text style={{ color: t.muted, fontSize: 13, lineHeight: 20 }}>Penjelasan: {item.explanation}</Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
