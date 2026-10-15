import { useColorScheme } from "react-native";
import type { Difficulty, TestType } from "@tesiqeq/core";

export interface Theme {
  dark: boolean;
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  iq: string;
  eq: string;
}

const light: Theme = {
  dark: false,
  bg: "#f4f6fb",
  card: "#ffffff",
  cardAlt: "#eef1f8",
  text: "#0f172a",
  muted: "#64748b",
  border: "#dbe1ee",
  primary: "#2563eb",
  onPrimary: "#ffffff",
  success: "#15803d",
  successBg: "#dcfce7",
  danger: "#b91c1c",
  dangerBg: "#fee2e2",
  iq: "#2563eb",
  eq: "#9333ea",
};

const dark: Theme = {
  dark: true,
  bg: "#0b1120",
  card: "#151c2f",
  cardAlt: "#1c2540",
  text: "#e5e9f5",
  muted: "#94a3b8",
  border: "#2a3558",
  primary: "#60a5fa",
  onPrimary: "#0b1120",
  success: "#4ade80",
  successBg: "#14351f",
  danger: "#f87171",
  dangerBg: "#3b1717",
  iq: "#60a5fa",
  eq: "#c084fc",
};

export const useTheme = (): Theme => (useColorScheme() === "dark" ? dark : light);

export const tierColor: Record<Difficulty, string> = {
  easy: "#16a34a",
  normal: "#2563eb",
  hard: "#d97706",
  extreme: "#dc2626",
};

export const TYPE_NAME: Record<TestType, string> = { iq: "Tes IQ", eq: "Tes EQ" };
export const typeColor = (type: TestType, t: Theme): string => (type === "iq" ? t.iq : t.eq);
