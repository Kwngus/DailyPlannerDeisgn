"use client";

import { Menu, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/ko";

dayjs.extend(isBetween);
dayjs.locale("ko");

type Props = {
  onMenuClick: () => void;
  onSearchClick: () => void;
  showDateNav?: boolean;
};

export default function Header({
  onMenuClick,
  onSearchClick,
  showDateNav = true,
}: Props) {
  const { viewMode, currentDate, setViewMode, navigate, setCurrentDate } =
    usePlannerStore();

  const isToday = currentDate === dayjs().format("YYYY-MM-DD");
  const isThisWeek =
    viewMode === "week" &&
    dayjs().isBetween(
      dayjs(currentDate).startOf("week"),
      dayjs(currentDate).endOf("week"),
      "day",
      "[]",
    );
  const isThisMonth =
    viewMode === "month" &&
    dayjs(currentDate).format("YYYY-MM") === dayjs().format("YYYY-MM");

  const showTodayBtn = !(
    (viewMode === "day" && isToday) ||
    (viewMode === "week" && isThisWeek) ||
    (viewMode === "month" && isThisMonth)
  );

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
    <header
      className="fixed top-0 left-0 right-0 h-14 border-b border-[var(--border)] flex items-center px-4 gap-2 z-30 bg-[var(--bg)]"
    >
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      <span className="font-serif text-lg flex-1 tracking-tight truncate">
        {showDateNav ? dateLabel : "플래너"}
      </span>

      {showDateNav && (
        <>
          {showTodayBtn && (
            <button
              onClick={() => setCurrentDate(dayjs().format("YYYY-MM-DD"))}
              className="px-3 py-1.5 text-xs font-bold tracking-wide border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 flex-shrink-0"
            >
              오늘
            </button>
          )}

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 검색 버튼 */}
          <button
            onClick={onSearchClick}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 flex-shrink-0"
          >
            <Search size={18} />
          </button>

          <div className="flex gap-0.5 bg-gray-200 rounded-lg p-1 flex-shrink-0">
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
