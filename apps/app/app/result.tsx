import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CATEGORY_LABEL, DISCLAIMER, TIER_LABEL } from "@tesiqeq/core";
import { useStore } from "../src/store";
import { pct, seconds } from "../src/format";
import { TYPE_NAME, tierColor, typeColor, useTheme } from "../src/theme";
import { Body, Button, Card, H2, ProgressBar, Screen } from "../src/ui";

export default function Result() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entry = useStore((s) => s.history.find((h) => h.id === id));

  if (!entry) {
    return (
      <Screen>
        <H2>Hasil tidak ditemukan</H2>
        <Body muted>Data tes ini mungkin sudah dihapus dari riwayat.</Body>
        <Button title="Kembali ke beranda" onPress={() => router.replace("/")} />
      </Screen>
    );
  }

  const r = entry.result;
  const accent = typeColor(r.type, t);
  const modeLabel = r.mode === "mixed" ? "Campuran" : `Tingkat ${entry.tier ? TIER_LABEL[entry.tier] : ""}`;

  return (
    <Screen>
      <Card accent={accent}>
        <Text style={{ color: t.muted, fontWeight: "700" }}>
          {TYPE_NAME[r.type]} · {modeLabel}
        </Text>
        <Text style={{ fontSize: 64, fontWeight: "900", color: accent, lineHeight: 72 }}>{r.score}</Text>
        <H2>{r.label}</H2>
        <Body muted>{r.description}</Body>
      </Card>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {[
          ["Benar", `${r.correct}/${r.total}`],
          ["Akurasi", pct(r.accuracy)],
          ["Rata-rata waktu", seconds(r.avgTimeSec)],
        ].map(([label, value]) => (
          <View key={label} style={{ flex: 1, backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: t.text }}>{value}</Text>
            <Text style={{ fontSize: 12, color: t.muted }}>{label}</Text>
          </View>
        ))}
      </View>

      <Card>
        <H2>Per tingkat</H2>
        {r.byDifficulty.map((b) => (
          <View key={b.difficulty} style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: t.text, fontWeight: "600" }}>{TIER_LABEL[b.difficulty]}</Text>
              <Text style={{ color: t.muted }}>
                {b.correct}/{b.total} · {pct(b.accuracy)}
              </Text>
            </View>
            <ProgressBar value={b.accuracy} color={tierColor[b.difficulty]} />
          </View>
        ))}
      </Card>

      <Card>
        <H2>Per aspek</H2>
        {[...r.byCategory]
          .sort((a, b) => b.accuracy - a.accuracy)
          .map((c) => (
            <View key={c.category} style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: t.text, fontWeight: "600" }}>{CATEGORY_LABEL[c.category]}</Text>
                <Text style={{ color: t.muted }}>
                  {c.correct}/{c.total} · {pct(c.accuracy)}
                </Text>
              </View>
              <ProgressBar value={c.accuracy} color={accent} />
            </View>
          ))}
      </Card>

      <Card>
        <H2>Saran</H2>
        {r.suggestions.map((s, i) => (
          <Body key={i}>• {s}</Body>
        ))}
      </Card>

      <Body muted style={{ fontSize: 12 }}>
        {DISCLAIMER}
      </Body>

      <Button title="Tinjau Jawaban" onPress={() => router.push({ pathname: "/review", params: { id: entry.id } })} color={accent} />
      <Button title={`Tes ${r.type.toUpperCase()} Lagi`} variant="outline" color={accent} onPress={() => router.replace({ pathname: "/start", params: { type: r.type } })} />
      <Button title="Beranda" variant="ghost" onPress={() => router.replace("/")} />
    </Screen>
  );
}
