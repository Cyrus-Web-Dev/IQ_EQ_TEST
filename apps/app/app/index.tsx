import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { computeStats } from "@tesiqeq/core";
import { useStore } from "../src/store";
import { TYPE_NAME, useTheme } from "../src/theme";
import { Body, Button, Card, H1, H2, Screen } from "../src/ui";

function StatTile({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 90, backgroundColor: t.cardAlt, borderRadius: 12, padding: 12, gap: 2 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: t.text }}>{value}</Text>
      <Text style={{ fontSize: 12, color: t.muted }}>{label}</Text>
    </View>
  );
}

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  const history = useStore((s) => s.history);
  const stats = useMemo(() => computeStats(history), [history]);

  const start = (type: "iq" | "eq") => router.push({ pathname: "/start", params: { type } });

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <H1>Tes IQ & EQ</H1>
        <Body muted>Latih penalaran logis dan kecerdasan emosionalmu. Semua soal dan hasil tersimpan di perangkatmu, tanpa internet.</Body>
      </View>

      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <StatTile label="Tes selesai" value={String(stats.totalTests)} />
        <StatTile label="Streak hari" value={String(stats.streak)} />
        <StatTile label="Skor IQ terbaik" value={stats.iq.count ? String(stats.iq.bestScore) : "-"} />
        <StatTile label="Skor EQ terbaik" value={stats.eq.count ? String(stats.eq.bestScore) : "-"} />
      </View>

      {(["iq", "eq"] as const).map((type) => (
        <Pressable key={type} onPress={() => start(type)} accessibilityRole="button">
          <Card accent={type === "iq" ? t.iq : t.eq}>
            <H2>{TYPE_NAME[type]}</H2>
            <Body muted>
              {type === "iq"
                ? "Pola angka, matematika, logika, analogi, klasifikasi, dan penalaran spasial. 400 soal dalam 4 tingkat."
                : "Situasi sosial dan emosional dalam 8 aspek, dari kesadaran diri sampai pengambilan keputusan. 400 soal dalam 4 tingkat."}
            </Body>
            <Text style={{ color: type === "iq" ? t.iq : t.eq, fontWeight: "700" }}>Mulai {TYPE_NAME[type]} →</Text>
          </Card>
        </Pressable>
      ))}

      <View style={{ gap: 10 }}>
        <Button title="Statistik & Lencana" variant="outline" onPress={() => router.push("/stats")} />
        <Button title="Riwayat Tes" variant="outline" onPress={() => router.push("/history")} />
        <Button title="Tentang & Pengaturan" variant="ghost" onPress={() => router.push("/about")} />
      </View>
    </Screen>
  );
}
