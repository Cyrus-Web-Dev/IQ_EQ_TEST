import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initStore, useStore } from "../src/store";
import { useTheme } from "../src/theme";

export default function RootLayout() {
  const t = useTheme();
  const ready = useStore((s) => s.ready);

  useEffect(() => {
    void initStore();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.card },
          headerTintColor: t.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Tes IQ & EQ" }} />
        <Stack.Screen name="start" options={{ title: "Mulai Tes" }} />
        <Stack.Screen name="test" options={{ title: "Tes", headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ title: "Hasil Tes" }} />
        <Stack.Screen name="review" options={{ title: "Tinjau Jawaban" }} />
        <Stack.Screen name="history" options={{ title: "Riwayat" }} />
        <Stack.Screen name="stats" options={{ title: "Statistik & Lencana" }} />
        <Stack.Screen name="about" options={{ title: "Tentang" }} />
      </Stack>
    </>
  );
}
