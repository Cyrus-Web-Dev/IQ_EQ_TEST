import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "./theme";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const t = useTheme();
  const inner = <View style={styles.inner}>{children}</View>;
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={{ flex: 1, backgroundColor: t.bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{inner}</ScrollView>
      ) : (
        <View style={styles.fixed}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, accent }: { children: ReactNode; accent?: string }) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.border },
        accent ? { borderLeftColor: accent, borderLeftWidth: 5 } : null,
      ]}
    >
      {children}
    </View>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 28, fontWeight: "800", color: t.text }, style]}>{children}</Text>;
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 18, fontWeight: "700", color: t.text }, style]}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 15, lineHeight: 22, color: muted ? t.muted : t.text }, style]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  color,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "danger" | "ghost";
  disabled?: boolean;
  color?: string;
}) {
  const t = useTheme();
  const filled = variant === "primary" || variant === "danger";
  const base = variant === "danger" ? t.danger : color ?? t.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        filled ? { backgroundColor: base } : { borderColor: variant === "ghost" ? "transparent" : base, borderWidth: 1.5 },
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={{ color: filled ? t.onPrimary : variant === "ghost" ? t.muted : base, fontWeight: "700", fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}

export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + "26", borderColor: color }]}>
      <Text style={{ color, fontWeight: "700", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color, height = 10 }: { value: number; color: string; height?: number }) {
  const t = useTheme();
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.cardAlt, overflow: "hidden" }}>
      <View style={{ width: `${clamped * 100}%`, height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  danger,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  const t = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: t.card, borderColor: t.border }]}>
          <H2>{title}</H2>
          <Body muted>{message}</Body>
          <View style={{ gap: 10, marginTop: 6 }}>
            <Button title={confirmLabel} onPress={onConfirm} variant={danger ? "danger" : "primary"} />
            <Button title={cancelLabel} onPress={onCancel} variant="ghost" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: { alignItems: "center", paddingBottom: 40 },
  fixed: { flex: 1, alignItems: "center" },
  inner: { width: "100%", maxWidth: 720, padding: 16, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  button: { minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, paddingVertical: 10 },
  pill: { alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  backdrop: { flex: 1, backgroundColor: "#000a", alignItems: "center", justifyContent: "center", padding: 20 },
  dialog: { width: "100%", maxWidth: 420, borderRadius: 18, borderWidth: 1, padding: 20, gap: 12 },
});
