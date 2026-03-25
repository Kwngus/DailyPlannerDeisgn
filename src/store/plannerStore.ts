import { create } from "zustand";
import dayjs from "dayjs";
import type { ViewMode } from "@/types";

type PlannerStore = {
  viewMode: ViewMode;
  currentDate: string;
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: string) => void;
  navigate: (dir: 1 | -1) => void;
};

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  viewMode: "day",
  currentDate: dayjs().format("YYYY-MM-DD"),

  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentDate: (date) => set({ currentDate: date }),

  navigate: (dir) => {
    const { viewMode, currentDate } = get();
    const unit =
      viewMode === "week" ? "week" : viewMode === "month" ? "month" : "day";
    set({
      currentDate: dayjs(currentDate).add(dir, unit).format("YYYY-MM-DD"),
    });
  },
}));
