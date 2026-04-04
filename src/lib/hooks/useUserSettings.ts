"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useThemeStore } from "@/store/themeStore";
import { useSettingsStore } from "@/store/settingsStore";

export function useUserSettings() {
  const supabase = createClient();

  const {
    theme, bgTheme, pointColor, customPointColor, customBgTheme,
    setTheme, setBgTheme, setPointColor, setCustomPointColor, setCustomBgTheme,
  } = useThemeStore();
  const {
    defaultView, weekStart, timeFormat, fontSize, timetableStart,
    setDefaultView, setWeekStart, setTimeFormat, setFontSize, setTimetableStart,
  } = useSettingsStore();

  const isLoadingRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 앱 진입 시 Supabase에서 설정 불러와 store 덮어쓰기
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { isLoadingRef.current = false; return; }

      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setTheme(data.theme ?? "system");
        setBgTheme(data.bg_theme ?? "cream");
        setPointColor(data.point_color ?? "charcoal");
        setCustomPointColor(data.custom_point_color ?? "#1A1714");
        if (data.custom_bg_theme) setCustomBgTheme(data.custom_bg_theme);
        setDefaultView(data.default_view ?? "day");
        setWeekStart(data.week_start ?? "sun");
        setTimeFormat(data.time_format ?? "24h");
        setFontSize(data.font_size ?? "medium");
        setTimetableStart(data.timetable_start ?? 5);
      }

      // React가 store 업데이트를 처리한 뒤 저장 활성화
      setTimeout(() => { isLoadingRef.current = false; }, 0);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 설정 변경 시 Supabase에 debounce 저장 (로딩 중에는 스킵)
  useEffect(() => {
    if (isLoadingRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          theme,
          bg_theme: bgTheme,
          point_color: pointColor,
          custom_point_color: customPointColor,
          custom_bg_theme: customBgTheme,
          default_view: defaultView,
          week_start: weekStart,
          time_format: timeFormat,
          font_size: fontSize,
          timetable_start: timetableStart,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    theme, bgTheme, pointColor, customPointColor, customBgTheme,
    defaultView, weekStart, timeFormat, fontSize, timetableStart,
  ]);
}
