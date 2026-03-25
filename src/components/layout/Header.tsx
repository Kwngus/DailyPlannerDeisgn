"use client";

import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

type Props = {
  onMenuClick: () => void;
  showDateNav?: boolean;
};

export default function Header({ onMenuClick, showDateNav = true }: Props) {
  const { viewMode, currentDate, setViewMode, navigate } = usePlannerStore();

  const dateLabel = (() => {
    if (viewMode === "day") return dayjs(currentDate).format("M월 D일 dddd");
    if (viewMode === "week") {
      const start = dayjs(currentDate).startOf("week");
      const end = dayjs(currentDate).endOf("week");
      return `${start.format("M/D")} — ${end.format("M/D")}`;
    }
    return dayjs(currentDate).format("YYYY년 M월");
  })();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#F7F5F0] border-b border-gray-200 flex items-center px-4 gap-3 z-30">
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Menu size={20} />
      </button>

      <span className="font-serif text-lg flex-1 tracking-tight truncate">
        {showDateNav ? dateLabel : "플래너"}
      </span>

      {showDateNav && (
        <>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex gap-0.5 bg-gray-200 rounded-lg p-1">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-widest uppercase transition-all ${
                  viewMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {mode === "day" ? "DAY" : mode === "week" ? "WEEK" : "MON"}
              </button>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
