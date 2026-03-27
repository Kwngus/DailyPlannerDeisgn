"use client";

import { useEffect } from "react";
import { useThemeStore, BG_THEMES, POINT_COLORS } from "@/store/themeStore";

function shadeColor(hex: string, amount: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amount);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amount);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function getContrastFg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1A1714" : "#FFFFFF";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, bgTheme, pointColor, customPointColor } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(isDark: boolean) {
      if (isDark) {
        root.classList.add("dark");
        // 다크 모드: 배경 테마 override 제거 (globals.css .dark 변수 사용)
        (["--bg", "--surface", "--accent", "--accent-fg", "--border", "--border-subtle"] as const)
          .forEach((v) => root.style.removeProperty(v));
      } else {
        root.classList.remove("dark");
        const t = BG_THEMES[bgTheme];
        root.style.setProperty("--bg", t.bg);
        root.style.setProperty("--surface", t.surface);
        root.style.setProperty("--accent", t.accent);
        root.style.setProperty("--accent-fg", t.accentFg);
        root.style.setProperty("--border", shadeColor(t.bg, -14));
        root.style.setProperty("--border-subtle", shadeColor(t.bg, -6));
      }
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme, bgTheme]);

  useEffect(() => {
    const root = document.documentElement;
    let point: string;
    let pointFg: string;

    if (pointColor === "custom") {
      point = customPointColor;
      pointFg = getContrastFg(customPointColor);
    } else {
      const p = POINT_COLORS[pointColor];
      point = p.point;
      pointFg = p.pointFg;
    }

    root.style.setProperty("--point", point);
    root.style.setProperty("--point-fg", pointFg);
  }, [pointColor, customPointColor]);

  return <>{children}</>;
}
