import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { TIER_LABEL } from "@tesiqeq/core";
import { formatDate, pct } from "../src/format";
import { useStore } from "../src/store";
import { TYPE_NAME, typeColor, useTheme } from "../src/theme";
import { Body, Card, H2, Screen } from "../src/ui";

export default function History() {
  const t = useTheme();
  const router = useRouter();
  const history = useStore((s) => s.history);

  return (
    <Screen>
      {history.length === 0 ? (
        <Card>
          <H2>Belum ada riwayat</H2>
          <Body muted>Selesaikan satu tes dan hasilnya akan muncul di sini.</Body>
        </Card>
      ) : (
        history.map((h) => {
          const color = typeColor(h.type, t);
          return (
            <Pressable key={h.id} onPress={() => router.push({ pathname: "/result", params: { id: h.id } })} accessibilityRole="button">
              <Card accent={color}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <Text style={{ fontSize: 34, fontWeight: "900", color, minWidth: 64 }}>{h.result.score}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontWeight: "700", color: t.text }}>
                      {TYPE_NAME[h.type]} · {h.mode === "mixed" ? "Campuran" : h.tier ? TIER_LABEL[h.tier] : "Tingkat"}
                    </Text>
                    <Text style={{ color: t.muted, fontSize: 13 }}>
                      {h.result.label} · {h.result.correct}/{h.result.total} benar ({pct(h.result.accuracy)})
                    </Text>
                    <Text style={{ color: t.muted, fontSize: 12 }}>{formatDate(h.finishedAt)}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}
