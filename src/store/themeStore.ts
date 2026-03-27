import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

export type BgThemeId =
  | "cream" | "blossom" | "sky" | "mint"
  | "lavender" | "peach" | "butter" | "cloud";

export type PointColorId =
  | "charcoal" | "rose" | "blue" | "green" | "purple"
  | "yellow" | "orange" | "gray" | "teal" | "pink";

export type BgThemeDef = {
  bg: string;
  surface: string;
  accent: string;
  accentFg: string;
  label: string;
  desc: string;
};

export const BG_THEMES: Record<BgThemeId, BgThemeDef> = {
  cream:    { bg: "#FAF8F3", surface: "#FFFFFF", accent: "#3D3830", accentFg: "#FAF8F3", label: "크림 아이보리", desc: "기본 테마" },
  blossom:  { bg: "#FDF0F3", surface: "#FFF5F7", accent: "#8B3A52", accentFg: "#FDF0F3", label: "블러섬 핑크",  desc: "로맨틱하고 따뜻한" },
  sky:      { bg: "#EEF6FF", surface: "#F7FBFF", accent: "#1E4D7B", accentFg: "#EEF6FF", label: "스카이 블루",  desc: "청량하고 깔끔한" },
  mint:     { bg: "#EDFAF4", surface: "#F5FCF9", accent: "#0F6E56", accentFg: "#EDFAF4", label: "민트 그린",   desc: "상쾌하고 자연스러운" },
  lavender: { bg: "#F2F1FE", surface: "#F8F7FF", accent: "#3C3489", accentFg: "#F2F1FE", label: "라벤더",      desc: "몽환적이고 차분한" },
  peach:    { bg: "#FEF3EE", surface: "#FFF8F5", accent: "#7A3520", accentFg: "#FEF3EE", label: "피치",        desc: "따뜻하고 생기있는" },
  butter:   { bg: "#FEFBEE", surface: "#FFFDF5", accent: "#6B4E00", accentFg: "#FEFBEE", label: "버터 옐로우", desc: "밝고 에너지 넘치는" },
  cloud:    { bg: "#F4F3F1", surface: "#FAFAF9", accent: "#444441", accentFg: "#F4F3F1", label: "클라우드 그레이", desc: "모던하고 절제된" },
};

export type PointColorDef = {
  point: string;
  pointFg: string;
  label: string;
};

export const POINT_COLORS: Record<PointColorId, PointColorDef> = {
  charcoal: { point: "#1A1714", pointFg: "#FFFFFF", label: "차콜" },
  rose:     { point: "#D4537E", pointFg: "#FFFFFF", label: "로즈" },
  blue:     { point: "#378ADD", pointFg: "#FFFFFF", label: "블루" },
  green:    { point: "#1D9E75", pointFg: "#FFFFFF", label: "그린" },
  purple:   { point: "#7F77DD", pointFg: "#FFFFFF", label: "퍼플" },
  yellow:   { point: "#EF9F27", pointFg: "#FFFFFF", label: "옐로우" },
  orange:   { point: "#D85A30", pointFg: "#FFFFFF", label: "오렌지" },
  gray:     { point: "#888780", pointFg: "#FFFFFF", label: "그레이" },
  teal:     { point: "#5DCAA5", pointFg: "#FFFFFF", label: "민트" },
  pink:     { point: "#ED93B1", pointFg: "#FFFFFF", label: "핑크" },
};

type ThemeStore = {
  theme: Theme;
  bgTheme: BgThemeId;
  pointColor: PointColorId | "custom";
  customPointColor: string;
  setTheme: (theme: Theme) => void;
  setBgTheme: (id: BgThemeId) => void;
  setPointColor: (id: PointColorId | "custom") => void;
  setCustomPointColor: (hex: string) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      bgTheme: "cream",
      pointColor: "charcoal",
      customPointColor: "#1A1714",
      setTheme: (theme) => set({ theme }),
      setBgTheme: (id) => set({ bgTheme: id }),
      setPointColor: (id) => set({ pointColor: id }),
      setCustomPointColor: (hex) => set({ customPointColor: hex }),
    }),
    { name: "planner-theme" },
  ),
);
