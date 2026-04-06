"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useTodos } from "@/lib/hooks/useTodos";
import { useHabits } from "@/lib/hooks/useHabits";
import { useDDays } from "@/lib/hooks/useDDays";
import { usePlannerStore } from "@/store/plannerStore";
import { minToTime } from "@/lib/timeUtils";
import type { Event } from "@/types";
import dayjs from "dayjs";

function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function calcDDay(targetDate: string): { label: string; diff: number } {
  const today = dayjs().startOf("day");
  const target = dayjs(targetDate).startOf("day");
  const diff = target.diff(today, "day");
  if (diff === 0) return { label: "D-Day", diff: 0 };
  if (diff > 0) return { label: `D-${diff}`, diff };
  return { label: `D+${Math.abs(diff)}`, diff };
}

function nowMin() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function DashboardPage() {
  const router = useRouter();
  const now = useNow();
  const { setCurrentDate, setViewMode } = usePlannerStore();

  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const { todos } = useTodos();
  const { habits, loading: habitsLoading, toggleHabit } = useHabits();
  const { ddays, loading: ddaysLoading } = useDDays();

  const today = dayjs().format("YYYY-MM-DD");
  const todayLabel = dayjs().format("M월 D일 dddd");

  // 오늘 + 향후 14일 이벤트 fetch
  useEffect(() => {
    async function fetchEvents() {
      setLoadingEvents(true);
      const supabase = createClient();
      const dates = Array.from({ length: 15 }, (_, i) =>
        dayjs().add(i, "day").format("YYYY-MM-DD"),
      );
      const { data } = await supabase
        .from("events")
        .select("*, category:categories(*)")
        .in("date", dates)
        .eq("is_note", false)
        .order("date", { ascending: true })
        .order("start_min", { ascending: true });

      if (data) {
        setTodayEvents((data as Event[]).filter((e) => e.date === today));
        setUpcomingEvents((data as Event[]).filter((e) => e.date !== today));
      }
      setLoadingEvents(false);
    }
    fetchEvents();
  }, [today]);

  // 현재 분
  const currentMin = now.getHours() * 60 + now.getMinutes();

  // 다음 일정 계산
  const nextEvent = todayEvents.find((e) => e.start_min > currentMin);
  const currentEvent = todayEvents.find(
    (e) => e.start_min <= currentMin && e.end_min > currentMin,
  );

  function timeUntilNext() {
    if (!nextEvent) return null;
    const diffMin = nextEvent.start_min - currentMin;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    if (h === 0) return `${m}분 후`;
    if (m === 0) return `${h}시간 후`;
    return `${h}시간 ${m}분 후`;
  }

  function goToDate(dateStr: string) {
    setCurrentDate(dateStr);
    setViewMode("day");
    router.push("/app");
  }

  // 할 일 요약
  const todayTodos = todos.filter(
    (t) => !t.is_done && (t.due_date === today || !t.due_date),
  );
  const overdueTodos = todos.filter(
    (t) => !t.is_done && t.due_date && t.due_date < today,
  );
  const doneTodayCount = todos.filter((t) => t.is_done).length;

  // 다가오는 일정 날짜별 그룹
  const upcomingByDate = upcomingEvents.reduce<Record<string, Event[]>>(
    (acc, e) => {
      if (!acc[e.date]) acc[e.date] = [];
      acc[e.date].push(e);
      return acc;
    },
    {},
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-10">

      {/* 날짜 헤더 */}
      <div>
        <p className="text-sm text-[var(--text-muted)]">
          {now.getHours() < 12 ? "좋은 아침이에요 ☀️" : now.getHours() < 18 ? "좋은 오후예요 🌤️" : "좋은 저녁이에요 🌙"}
        </p>
        <h1 className="font-serif text-3xl font-bold mt-0.5">{todayLabel}</h1>
      </div>

      {/* 오늘의 일정 */}
      <section className="rounded-2xl border bg-[var(--surface)] border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
          <span className="font-serif text-base font-semibold">오늘의 일정</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{todayEvents.length}개</span>
            <button
              onClick={() => goToDate(today)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        ) : todayEvents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">오늘 일정이 없어요</p>
            <button
              onClick={() => goToDate(today)}
              className="mt-2 text-xs underline text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              일정 추가하기
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 space-y-1">
            {/* 현재 진행 중 */}
            {currentEvent && (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
                style={{
                  background: currentEvent.category
                    ? hexToRgba(currentEvent.category.color, 0.15)
                    : "var(--border-subtle)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                  style={{ background: currentEvent.category?.color ?? "var(--accent)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    진행 중
                  </p>
                  <p className="text-sm font-semibold truncate">{currentEvent.title}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                  {minToTime(currentEvent.start_min)} – {minToTime(currentEvent.end_min)}
                </span>
              </div>
            )}

            {/* 다음 일정까지 */}
            {nextEvent && !currentEvent && (
              <div className="flex items-center gap-2 px-1 py-1.5 mb-1">
                <Clock size={12} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">다음 일정까지</span>
                <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
                  {timeUntilNext()}
                </span>
              </div>
            )}

            {/* 일정 목록 */}
            {todayEvents.map((event) => {
              const isPast = event.end_min <= currentMin;
              const isOngoing = event.start_min <= currentMin && event.end_min > currentMin;
              if (isOngoing) return null; // 이미 위에 표시됨
              return (
                <div
                  key={event.id}
                  onClick={() => goToDate(today)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[var(--border-subtle)] transition-colors ${isPast ? "opacity-40" : ""}`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: event.category?.color ?? "var(--accent)" }}
                  />
                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0 w-12 font-mono">
                    {minToTime(event.start_min)}
                  </span>
                  <span className="text-sm font-medium flex-1 truncate">{event.title}</span>
                  {event.category && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{ background: hexToRgba(event.category.color, 0.2) }}
                    >
                      {event.category.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 할 일 요약 */}
      <section className="rounded-2xl border bg-[var(--surface)] border-[var(--border)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
          <span className="font-serif text-base font-semibold">할 일 요약</span>
          <button
            onClick={() => router.push("/app/todos")}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="px-4 py-3 flex gap-4">
          <div className="flex-1 text-center py-2">
            <p className="text-2xl font-serif font-bold">{todayTodos.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">남은 할 일</p>
          </div>
          <div className="w-px bg-[var(--border)]" />
          <div className="flex-1 text-center py-2">
            <p className="text-2xl font-serif font-bold text-red-500">{overdueTodos.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">기한 초과</p>
          </div>
          <div className="w-px bg-[var(--border)]" />
          <div className="flex-1 text-center py-2">
            <p className="text-2xl font-serif font-bold text-green-500">{doneTodayCount}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">완료</p>
          </div>
        </div>

        {/* 오늘 할 일 목록 (최대 3개) */}
        {todayTodos.length > 0 && (
          <div className="px-4 pb-3 space-y-1 border-t border-[var(--border-subtle)] pt-2">
            {todayTodos.slice(0, 3).map((todo) => (
              <div key={todo.id} className="flex items-center gap-2 py-1.5">
                <Circle size={15} className="text-[var(--text-muted)] flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{todo.title}</span>
                {todo.category && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: hexToRgba(todo.category.color, 0.2) }}
                  >
                    {todo.category.name}
                  </span>
                )}
              </div>
            ))}
            {todayTodos.length > 3 && (
              <p className="text-xs text-[var(--text-muted)] pl-5">
                외 {todayTodos.length - 3}개 더
              </p>
            )}
          </div>
        )}
      </section>

      {/* 오늘의 루틴 */}
      {(habitsLoading || habits.length > 0) && (
        <section className="rounded-2xl border bg-[var(--surface)] border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="font-serif text-base font-semibold">오늘의 루틴</span>
            {!habitsLoading && habits.length > 0 && (
              <span className="text-xs text-[var(--text-muted)]">
                {habits.filter((h) => h.is_done).length}/{habits.length} 완료
              </span>
            )}
          </div>

          {habitsLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* 진행률 바 */}
              {habits.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <div className="w-full h-1.5 rounded-full bg-[var(--border)]">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(habits.filter((h) => h.is_done).length / habits.length) * 100}%`,
                        background: "var(--point)",
                      }}
                    />
                  </div>
                  {habits.every((h) => h.is_done) && (
                    <p className="text-xs text-center mt-2 font-semibold" style={{ color: "var(--point)" }}>
                      오늘 루틴 모두 완료! 🎉
                    </p>
                  )}
                </div>
              )}

              {/* 루틴 목록 */}
              <div className="px-4 py-2 space-y-1">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      habit.is_done
                        ? "bg-[var(--border-subtle)] border-[var(--border-subtle)] opacity-70"
                        : "bg-[var(--surface)] border-[var(--border)]"
                    }`}
                  >
                    <button
                      onClick={() => toggleHabit(habit)}
                      className="flex-shrink-0 transition-colors"
                    >
                      {habit.is_done ? (
                        <CheckCircle2 size={18} style={{ color: "var(--point)" }} />
                      ) : (
                        <Circle size={18} className="text-gray-300 hover:text-gray-500" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm font-medium ${
                        habit.is_done ? "line-through text-[var(--text-muted)]" : "text-[var(--text)]"
                      }`}
                    >
                      {habit.title}
                    </span>
                    {habit.end_date && (
                      <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                        ~{dayjs(habit.end_date).format("M/D")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* D-Day */}
      {(ddaysLoading || ddays.length > 0) && (
        <section className="rounded-2xl border bg-[var(--surface)] border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="font-serif text-base font-semibold">D-Day</span>
            {!ddaysLoading && (
              <span className="text-xs text-[var(--text-muted)]">{ddays.length}개</span>
            )}
          </div>

          {ddaysLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="px-4 py-2 space-y-1">
              {ddays.map((dday) => {
                const { label, diff } = calcDDay(dday.target_date);
                const isPast = diff < 0;
                const isToday = diff === 0;
                return (
                  <div
                    key={dday.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      isPast
                        ? "opacity-50 bg-[var(--surface)] border-[var(--border)]"
                        : "bg-[var(--surface)] border-[var(--border)]"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[var(--text)]">{dday.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {dayjs(dday.target_date).format("YYYY.MM.DD")}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold tabular-nums flex-shrink-0"
                      style={{ color: isPast ? "var(--text-muted)" : isToday ? "var(--point)" : "var(--point)" }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 다가오는 일정 */}
      <section>
        <h2 className="font-serif text-lg mb-2 px-1">다가오는 일정</h2>

        {loadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        ) : Object.keys(upcomingByDate).length === 0 ? (
          <div className="rounded-2xl border bg-[var(--surface)] border-[var(--border)] py-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">다가오는 일정이 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(upcomingByDate).slice(0, 7).map(([dateStr, events]) => {
              const d = dayjs(dateStr);
              const isThisWeek = d.diff(dayjs(), "day") <= 6;
              return (
                <div
                  key={dateStr}
                  onClick={() => goToDate(dateStr)}
                  className="rounded-2xl border bg-[var(--surface)] border-[var(--border)] px-4 py-3 cursor-pointer hover:border-[var(--text-muted)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* 날짜 */}
                    <div className="text-center flex-shrink-0 w-10">
                      <p className="text-xs font-bold text-[var(--text-muted)]">
                        {d.format("M월")}
                      </p>
                      <p className="text-2xl font-serif font-bold leading-none">{d.format("D")}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{d.format("ddd")}</p>
                    </div>

                    {/* 일정 목록 */}
                    <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                      {events.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: event.category?.color ?? "var(--accent)" }}
                          />
                          <span className="text-xs text-[var(--text-muted)] font-mono flex-shrink-0">
                            {minToTime(event.start_min)}
                          </span>
                          <span className="text-sm font-medium truncate">{event.title}</span>
                        </div>
                      ))}
                      {events.length > 3 && (
                        <p className="text-xs text-[var(--text-muted)] pl-3">
                          외 {events.length - 3}개
                        </p>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
