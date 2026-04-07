"use client";

import { Menu, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";
import { useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";

type Props = {
  onMenuClick: () => void;
  onSearchClick: () => void;
  showDateNav?: boolean;
  sidebarCollapsed?: boolean;
};

export default function Header({
  onMenuClick,
  onSearchClick,
  showDateNav = true,
  sidebarCollapsed = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { viewMode, currentDate, setViewMode, navigate, setCurrentDate, showPlanned, showActual, setShowPlanned, setShowActual } =
    usePlannerStore();

  function handleSetViewMode(mode: "day" | "week" | "month") {
    setViewMode(mode);
    if (pathname !== "/app") router.push("/app");
  }

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
      className={`fixed top-0 right-0 h-14 border-b border-[var(--border)] flex items-center px-4 gap-2 z-30 bg-[var(--bg)] transition-[left] duration-300 ease-in-out ${sidebarCollapsed ? "left-0" : "left-0 md:left-[70px]"}`}
    >
      {/* 모바일 항상 표시 / 데스크탑은 사이드바 접혔을 때만 표시 */}
      <button
        onClick={onMenuClick}
        aria-label="메뉴 열기"
        className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ${sidebarCollapsed ? "" : "md:hidden"}`}
      >
        <Menu size={20} aria-hidden="true" />
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

          {/* 계획/실제 토글 — DAY 뷰에서만 표시 */}
          {viewMode === "day" && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {(["planned", "actual"] as const).map((type) => {
                const isActive = type === "planned" ? showPlanned : showActual;
                const label = type === "planned" ? "계획" : "실제";
                const toggle = type === "planned" ? setShowPlanned : setShowActual;
                return (
                  <button
                    key={type}
                    onClick={() => toggle(!isActive)}
                    className="rounded-lg text-xs font-bold tracking-wide transition-colors flex-shrink-0"
                    style={{
                      padding: "4px 10px",
                      background: isActive ? "var(--point)" : "rgba(120,113,108,0.12)",
                      color: isActive ? "var(--point-fg)" : "rgba(100,95,90,0.65)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              aria-label="이전"
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate(1)}
              aria-label="다음"
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          {/* 검색 버튼 */}
          <button
            onClick={onSearchClick}
            aria-label="검색"
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 flex-shrink-0"
          >
            <Search size={18} aria-hidden="true" />
          </button>

          {(() => {
            const modes = ["day", "week", "month"] as const;
            const labels = { day: "DAY", week: "WK", month: "MON" };
            const activeIndex = modes.indexOf(viewMode);
            return (
              <div
                className="relative flex flex-shrink-0 rounded-full select-none"
                style={{
                  padding: 3,
                  background: "rgba(120,113,108,0.12)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.28)",
                }}
              >
                {/* 슬라이딩 썸 */}
                <div
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: 3,
                    bottom: 3,
                    left: 3,
                    width: "calc((100% - 6px) / 3)",
                    transform: `translateX(calc(${activeIndex} * 100%))`,
                    transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "rgba(255,255,255,0.82)",
                    boxShadow:
                      "0 1px 6px rgba(0,0,0,0.13), 0 0 0 0.5px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                />

                {/* 버튼들 */}
                {modes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleSetViewMode(mode)}
                    className="relative z-10 rounded-full transition-colors duration-200"
                    style={{
                      width: 44,
                      height: 26,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color:
                        viewMode === mode
                          ? "#1A1714"
                          : "rgba(100,95,90,0.65)",
                    }}
                  >
                    {labels[mode]}
                  </button>
                ))}
              </div>
            );
          })()}
        </>
      )}
    </header>
  );
}
