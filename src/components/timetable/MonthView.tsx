"use client";

import { usePlannerStore } from "@/store/plannerStore";
import { useMonthEvents } from "@/lib/hooks/useMonthEvents";
import { minToTime } from "@/lib/timeUtils";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  currentDate: string;
};

function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function MonthView({ currentDate }: Props) {
  const { setViewMode, setCurrentDate } = usePlannerStore();
  const { events, todos, loading } = useMonthEvents(currentDate);

  const today = dayjs().format("YYYY-MM-DD");
  const startOfMonth = dayjs(currentDate).startOf("month");
  const endOfMonth = dayjs(currentDate).endOf("month");

  // 달력 시작: 해당 월 1일이 포함된 주의 일요일
  const calStart = startOfMonth.startOf("week");
  // 달력 끝: 해당 월 마지막 날이 포함된 주의 토요일
  const calEnd = endOfMonth.endOf("week");

  // 달력에 표시할 날짜 배열 생성
  const days: dayjs.Dayjs[] = [];
  let cursor = calStart;
  while (cursor.isBefore(calEnd) || cursor.isSame(calEnd, "day")) {
    days.push(cursor);
    cursor = cursor.add(1, "day");
  }

  const weeks: dayjs.Dayjs[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  function handleDayClick(dateStr: string) {
    setCurrentDate(dateStr);
    setViewMode("day");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mx-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b-2 border-gray-200">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`py-2.5 text-center text-xs font-bold tracking-widest uppercase
              ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7 border-b border-gray-100 last:border-b-0"
            >
              {week.map((day) => {
                const dateStr = day.format("YYYY-MM-DD");
                const isToday = dateStr === today;
                const isThisMonth = day.month() === dayjs(currentDate).month();
                const isSun = day.day() === 0;
                const isSat = day.day() === 6;

                const dayEvents = events
                  .filter((e) => e.date === dateStr)
                  .slice(0, 3);
                const dayTodos = todos.filter(
                  (t) => t.due_date === dateStr && !t.is_done,
                );
                const hasMore =
                  events.filter((e) => e.date === dateStr).length > 3;

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDayClick(dateStr)}
                    className={`min-h-[100px] p-1.5 border-r border-gray-100 last:border-r-0 cursor-pointer
                      transition-colors hover:bg-gray-50
                      ${!isThisMonth ? "bg-gray-50/50" : ""}
                    `}
                  >
                    {/* 날짜 숫자 */}
                    <div className="flex justify-end mb-1">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold
                          ${
                            isToday
                              ? "bg-[#1A1714] text-white"
                              : isSun
                                ? "text-red-400"
                                : isSat
                                  ? "text-blue-400"
                                  : isThisMonth
                                    ? "text-gray-800"
                                    : "text-gray-300"
                          }`}
                      >
                        {day.date()}
                      </span>
                    </div>

                    {/* 일정 미리보기 */}
                    <div className="space-y-0.5">
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate leading-tight"
                          style={{
                            background: ev.category?.color
                              ? hexToRgba(ev.category.color, 0.4)
                              : "rgba(255,210,80,0.4)",
                            borderLeft: `2px solid ${ev.category?.color ?? "#FFD250"}`,
                          }}
                          onClick={(e) => e.stopPropagation()}
                          title={`${minToTime(ev.start_min)} ${ev.title}`}
                        >
                          {minToTime(ev.start_min)} {ev.title}
                        </div>
                      ))}

                      {/* 더 있는 경우 */}
                      {hasMore && (
                        <div className="text-[10px] text-gray-400 px-1 font-medium">
                          +{events.filter((e) => e.date === dateStr).length - 3}
                          개 더
                        </div>
                      )}

                      {/* Todo 마감일 */}
                      {dayTodos.map((todo) => (
                        <div
                          key={todo.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate leading-tight flex items-center gap-1"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            borderLeft: "2px solid rgba(239,68,68,0.5)",
                            color: "rgba(185,28,28,0.8)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                          title={todo.title}
                        >
                          ✓ {todo.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
