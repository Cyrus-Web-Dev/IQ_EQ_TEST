import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Redirect, Stack, useRouter } from "expo-router";
import { CATEGORY_LABEL, TIER_LABEL, TIME_LIMIT, type AnswerRecord } from "@tesiqeq/core";
import { abandonSession, finishSession, useStore } from "../src/store";
import { tierColor, typeColor, useTheme } from "../src/theme";
import { Body, Button, Card, ConfirmDialog, Pill, ProgressBar, Screen } from "../src/ui";

const LETTERS = ["A", "B", "C", "D"];

export default function TestScreen() {
  const t = useTheme();
  const router = useRouter();
  const session = useStore((s) => s.session);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [showQuit, setShowQuit] = useState(false);

  const answers = useRef<AnswerRecord[]>([]);
  const selectedRef = useRef<number | null>(null);
  const startedAt = useRef(Date.now());
  const locked = useRef(false);
  const finished = useRef(false);

  const item = session?.items[index];

  const commit = (choice: number | null) => {
    if (!session || !item || locked.current) return;
    locked.current = true;
    const limit = TIME_LIMIT[item.difficulty];
    const timeSec = Math.min(limit, (Date.now() - startedAt.current) / 1000);
    answers.current.push({ questionId: item.id, selected: choice, timeSec });
    if (index + 1 >= session.items.length) {
      finished.current = true;
      const id = finishSession(answers.current);
      if (id) router.replace({ pathname: "/result", params: { id } });
      else router.replace("/");
    } else {
      setIndex(index + 1);
    }
  };

  useEffect(() => {
    if (!session || !item) return;
    locked.current = false;
    selectedRef.current = null;
    setSelected(null);
    const limit = TIME_LIMIT[item.difficulty];
    const t0 = Date.now();
    startedAt.current = t0;
    setRemaining(limit);
    const timer = setInterval(() => {
      const left = limit - (Date.now() - t0) / 1000;
      if (left <= 0) {
        clearInterval(timer);
        commit(selectedRef.current);
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, index]);

  if (!session || !item) {
    return finished.current ? null : <Redirect href="/" />;
  }

  const limit = TIME_LIMIT[item.difficulty];
  const accent = typeColor(session.type, t);
  const urgent = remaining <= 10;
  const isLast = index + 1 >= session.items.length;

  const choose = (i: number) => {
    if (locked.current) return;
    selectedRef.current = i;
    setSelected(i);
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: `Soal ${index + 1} / ${session.items.length}`,
          headerLeft: () => (
            <Pressable onPress={() => setShowQuit(true)} accessibilityRole="button" style={{ paddingHorizontal: 8 }}>
              <Text style={{ color: t.danger, fontWeight: "700" }}>Keluar</Text>
            </Pressable>
          ),
        }}
      />

      <ProgressBar value={(index + 1) / session.items.length} color={accent} height={6} />

      <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Pill label={TIER_LABEL[item.difficulty]} color={tierColor[item.difficulty]} />
        <Pill label={CATEGORY_LABEL[item.category]} color={accent} />
        <View style={{ flex: 1 }} />
        <Text style={{ fontWeight: "800", fontSize: 16, color: urgent ? t.danger : t.text }}>{Math.ceil(remaining)} dtk</Text>
      </View>
      <ProgressBar value={remaining / limit} color={urgent ? t.danger : t.primary} height={6} />

      <Card>
        <Text selectable style={{ fontSize: 18, lineHeight: 27, fontWeight: "600", color: t.text }}>
          {item.question}
        </Text>
      </Card>

      <View style={{ gap: 10 }}>
        {item.options.map((opt, i) => {
          const active = selected === i;
          return (
            <Pressable key={i} onPress={() => choose(i)} accessibilityRole="radio" accessibilityState={{ selected: active }}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "flex-start",
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: active ? accent : t.border,
                  backgroundColor: active ? accent + "1f" : t.card,
                  padding: 14,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: active ? accent : t.cardAlt,
                  }}
                >
                  <Text style={{ fontWeight: "800", color: active ? t.onPrimary : t.muted }}>{LETTERS[i]}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 16, lineHeight: 23, color: t.text }}>{opt}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button title={isLast ? "Selesai" : "Lanjut"} onPress={() => commit(selected)} disabled={selected === null} color={accent} />
      <Button title="Lewati soal ini" variant="ghost" onPress={() => commit(null)} />

      <ConfirmDialog
        visible={showQuit}
        danger
        title="Keluar dari tes?"
        message="Progres tes ini tidak akan disimpan."
        confirmLabel="Keluar"
        cancelLabel="Lanjutkan tes"
        onConfirm={() => {
          finished.current = true;
          abandonSession();
          router.replace("/");
        }}
        onCancel={() => setShowQuit(false)}
      />
    </Screen>
  );
}
