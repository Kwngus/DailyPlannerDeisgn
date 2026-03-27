import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimeFormat = "24h" | "12h";
export type WeekStart = "sun" | "mon";
export type FontSize = "small" | "medium" | "large";
export type DefaultView = "day" | "week" | "month";

type SettingsStore = {
  defaultView: DefaultView;
  weekStart: WeekStart;
  timeFormat: TimeFormat;
  fontSize: FontSize;
  timetableStart: number; // 시작 시간 (0~12)
  setDefaultView: (v: DefaultView) => void;
  setWeekStart: (v: WeekStart) => void;
  setTimeFormat: (v: TimeFormat) => void;
  setFontSize: (v: FontSize) => void;
  setTimetableStart: (v: number) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultView: "day",
      weekStart: "sun",
      timeFormat: "24h",
      fontSize: "medium",
      timetableStart: 5,
      setDefaultView: (v) => set({ defaultView: v }),
      setWeekStart: (v) => set({ weekStart: v }),
      setTimeFormat: (v) => set({ timeFormat: v }),
      setFontSize: (v) => set({ fontSize: v }),
      setTimetableStart: (v) => set({ timetableStart: v }),
    }),
    { name: "planner-settings" },
  ),
);
