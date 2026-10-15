import { useMemo } from "react";
import { Text, View } from "react-native";
import { CATEGORY_LABEL, computeStats, type TypeStats } from "@tesiqeq/core";
import { pct } from "../src/format";
import { useStore } from "../src/store";
import { TYPE_NAME, typeColor, useTheme } from "../src/theme";
import { Body, Card, H2, ProgressBar, Screen } from "../src/ui";

function ScoreChart({ stats, color }: { stats: TypeStats; color: string }) {
  const t = useTheme();
  if (stats.recentScores.length === 0) return <Body muted>Belum ada data.</Body>;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 90 }}>
        {stats.recentScores.map((s, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <Text style={{ fontSize: 10, color: t.muted }}>{s}</Text>
            <View style={{ width: "100%", height: Math.max(6, ((s - 60) / 90) * 70), backgroundColor: color, borderRadius: 4 }} />
          </View>
        ))}
      </View>
      <Body muted style={{ fontSize: 12 }}>
        {stats.count} tes · rata-rata {stats.avgScore} · terbaik {stats.bestScore} · terakhir {stats.lastScore} (10 sesi terakhir, lama → baru)
      </Body>
    </View>
  );
}

export default function StatsScreen() {
  const t = useTheme();
  const history = useStore((s) => s.history);
  const stats = useMemo(() => computeStats(history), [history]);

  return (
    <Screen>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {[
          ["Tes selesai", String(stats.totalTests)],
          ["Soal dijawab", String(stats.totalQuestions)],
          ["Akurasi total", pct(stats.overallAccuracy)],
          ["Streak saat ini", `${stats.streak} hari`],
          ["Streak terpanjang", `${stats.longestStreak} hari`],
        ].map(([label, value]) => (
          <View key={label} style={{ flex: 1, minWidth: 110, backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: t.text }}>{value}</Text>
            <Text style={{ fontSize: 12, color: t.muted }}>{label}</Text>
          </View>
        ))}
      </View>

      {(["iq", "eq"] as const).map((type) => (
        <Card key={type} accent={typeColor(type, t)}>
          <H2>{TYPE_NAME[type]}: skor terakhir</H2>
          <ScoreChart stats={stats[type]} color={typeColor(type, t)} />
        </Card>
      ))}

      {stats.categories.length > 0 && (
        <Card>
          <H2>Aspek (terlemah ke terkuat)</H2>
          {stats.categories.map((c) => (
            <View key={c.category} style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: t.text, fontWeight: "600" }}>{CATEGORY_LABEL[c.category]}</Text>
                <Text style={{ color: t.muted }}>
                  {c.correct}/{c.total} · {pct(c.accuracy)}
                </Text>
              </View>
              <ProgressBar value={c.accuracy} color={t.primary} />
            </View>
          ))}
        </Card>
      )}

      <H2>Lencana ({stats.badges.filter((b) => b.earned).length}/{stats.badges.length})</H2>
      {stats.badges.map((b) => (
        <View
          key={b.id}
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            backgroundColor: t.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: b.earned ? t.success : t.border,
            padding: 14,
            opacity: b.earned ? 1 : 0.55,
          }}
        >
          <Text style={{ fontSize: 26 }}>{b.earned ? "🏅" : "🔒"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", color: t.text }}>{b.title}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>{b.description}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
