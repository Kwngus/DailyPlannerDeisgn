import { create } from "zustand";
import dayjs from "dayjs";
import type { ViewMode } from "@/types";

type PlannerStore = {
  viewMode: ViewMode;
  currentDate: string;
  showPlanned: boolean;
  showActual: boolean;
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: string) => void;
  navigate: (dir: 1 | -1) => void;
  setShowPlanned: (v: boolean) => void;
  setShowActual: (v: boolean) => void;
};

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  viewMode: "day",
  currentDate: dayjs().format("YYYY-MM-DD"),
  showPlanned: false,
  showActual: true,

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

  setShowPlanned: (v) => {
    const { showActual } = get();
    // 둘 다 false가 되는 것 방지: 계획을 끄려는데 실제도 꺼져있으면 실제를 킴
    if (!v && !showActual) {
      set({ showPlanned: false, showActual: true });
    } else {
      set({ showPlanned: v });
    }
  },

  setShowActual: (v) => {
    const { showPlanned } = get();
    // 둘 다 false가 되는 것 방지: 실제를 끄려는데 계획도 꺼져있으면 계획을 킴
    if (!v && !showPlanned) {
      set({ showActual: false, showPlanned: true });
    } else {
      set({ showActual: v });
    }
  },
}));
