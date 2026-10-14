import type { ColorKey, HeroHeight } from "./types";

export const PALETTE: Record<ColorKey, { label: string; css: string }> = {
  blue: { label: "Azul", css: "#3b82f6" },
  green: { label: "Verde", css: "#22c55e" },
  yellow: { label: "Oro", css: "#C9A15A" },
  orange: { label: "Naranja", css: "#f97316" },
  magenta: { label: "Magenta", css: "#d946ef" },
  red: { label: "Brasa", css: "#A63D24" },
  cyan: { label: "Cian", css: "#06b6d4" },
  violet: { label: "Violeta", css: "#8b5cf6" },
  gray: { label: "Arena", css: "#BFB3A3" },
  sky: { label: "Azul cielo", css: "#60a5fa" },
  purple: { label: "Morado", css: "#c084fc" },
  amber: { label: "Ámbar", css: "#fbbf24" },
  lime: { label: "Lima", css: "#a3e635" },
  tangerine: { label: "Mandarina", css: "#fb923c" },
  gold: { label: "Dorado", css: "#d97706" },
  rust: { label: "Óxido", css: "#ea580c" },
  crimson: { label: "Carmesí", css: "#ef4444" },
  rose: { label: "Rosa", css: "#f43f5e" },
  pink: { label: "Rosa mexicano", css: "#ec4899" },
};

export const colorCss = (key: string | undefined) =>
  PALETTE[key as ColorKey]?.css ?? "hsl(var(--primary))";

export const HERO_HEIGHTS: Record<HeroHeight, { label: string; vh: number }> = {
  short: { label: "Baja (50%)", vh: 50 },
  medium: { label: "Media (70%)", vh: 70 },
  tall: { label: "Alta (85%)", vh: 85 },
  full: { label: "Pantalla completa", vh: 100 },
};
