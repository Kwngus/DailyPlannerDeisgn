"use client";

import { useEffect } from "react";
import { useThemeStore, BG_THEMES, POINT_COLORS } from "@/store/themeStore";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import duration from "dayjs/plugin/duration";

dayjs.locale("ko");
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(duration);

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
  const { theme, bgTheme, pointColor, customPointColor, customBgTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(isDark: boolean) {
      // glass 잔재 항상 초기화
      root.classList.remove("is-glass");
      root.style.removeProperty("--text");
      root.style.removeProperty("--text-muted");

      if (isDark) {
        root.classList.add("dark");
        // 다크 모드: 배경 테마 override 제거 (globals.css .dark 변수 사용)
        (["--bg", "--surface", "--accent", "--accent-fg", "--border", "--border-subtle"] as const)
          .forEach((v) => root.style.removeProperty(v));
      } else {
        root.classList.remove("dark");

        if (bgTheme === "glass") {
          root.classList.add("is-glass");
          // transparent: 레이아웃 래퍼까지 완전 투명 → html 그라디언트가 그대로 투과됨
          root.style.setProperty("--bg",           "transparent");
          root.style.setProperty("--surface",       "rgba(255,255,255,0.22)");
          root.style.setProperty("--accent",        "#4338ca");
          root.style.setProperty("--accent-fg",     "#ffffff");
          root.style.setProperty("--border",        "rgba(255,255,255,0.30)");
          root.style.setProperty("--border-subtle", "rgba(255,255,255,0.14)");
          root.style.setProperty("--text",          "#1c1917");
          root.style.setProperty("--text-muted",    "#6b6b6b");
        } else if (bgTheme === "custom") {
          const { bg, surface, accent } = customBgTheme;
          root.style.setProperty("--bg", bg);
          root.style.setProperty("--surface", surface);
          root.style.setProperty("--accent", accent);
          root.style.setProperty("--accent-fg", getContrastFg(accent));
          root.style.setProperty("--border", shadeColor(bg, -14));
          root.style.setProperty("--border-subtle", shadeColor(bg, -6));
        } else {
          const t = BG_THEMES[bgTheme];
          root.style.setProperty("--bg", t.bg);
          root.style.setProperty("--surface", t.surface);
          root.style.setProperty("--accent", t.accent);
          root.style.setProperty("--accent-fg", t.accentFg);
          root.style.setProperty("--border", shadeColor(t.bg, -14));
          root.style.setProperty("--border-subtle", shadeColor(t.bg, -6));
        }
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
  }, [theme, bgTheme, customBgTheme]);

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
