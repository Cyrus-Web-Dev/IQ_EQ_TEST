const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Tanpa Intl supaya konsisten di Hermes (Android/iOS) dan browser. */
export function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}.${pad(d.getMinutes())}`;
}

export const pct = (v: number): string => `${Math.round(v * 100)}%`;

export function seconds(v: number): string {
  return `${v >= 10 ? Math.round(v) : Math.round(v * 10) / 10} dtk`;
}
