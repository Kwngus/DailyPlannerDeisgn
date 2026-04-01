import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { getWeekDates } from "@/lib/timeUtils";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/lib/handleError";
import { useRealtimeEvents } from "./useRealtimeEvents";
import type { Event, ViewMode, RecurrenceType } from "@/types";
import dayjs from "dayjs";

export type EventPayload = {
  title: string;
  note: string;
  location: string;
  image_url: string | null;
  date: string;
  start_min: number;
  end_min: number;
  category_id: string | null;
  is_note: boolean;
  is_allday: boolean;
  is_cancelled: boolean;
  recurrence_type: RecurrenceType;
  recurrence_days: number[] | null;
  recurrence_end_date: string | null;
};

export function useEvents(currentDate: string, viewMode: ViewMode) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { show } = useToastStore();

  const fetchEvents = useCallback(async () => {
    if (viewMode === "month") {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const dates =
      viewMode === "week" ? getWeekDates(currentDate) : [currentDate];
    const { data, error } = await supabase
      .from("events")
      .select("*, category:categories(*)")
      .in("date", dates)
      .order("start_min", { ascending: true });

    if (!error && data) setEvents(data as Event[]);
    setLoading(false);
  }, [currentDate, viewMode]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 실시간 동기화 — 다른 기기나 탭에서 변경 시 자동 반영
  useRealtimeEvents({
    onInsert: fetchEvents,
    onUpdate: fetchEvents,
    onDelete: fetchEvents,
  });

  async function addEvent(payload: EventPayload) {
    // getSession(): 로컬 캐시에서 읽음 (네트워크 없음)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const groupId =
      payload.recurrence_type !== "none" ? crypto.randomUUID() : null;

    const dates = generateRecurrenceDates(
      payload.date,
      payload.recurrence_type,
      payload.recurrence_end_date,
      payload.recurrence_days,
    );

    const rows = dates.map((date) => ({
      user_id: session.user.id,
      title: payload.title,
      note: payload.note,
      location: payload.location || null,
      image_url: payload.image_url ?? null,
      date,
      start_min: payload.is_allday ? 0 : payload.start_min,
      end_min: payload.is_allday ? 0 : payload.end_min,
      category_id: payload.category_id,
      is_note: payload.is_note,
      is_allday: payload.is_allday,
      is_cancelled: payload.is_cancelled,
      recurrence_type: payload.recurrence_type,
      recurrence_days: payload.recurrence_days,
      recurrence_end_date: payload.recurrence_end_date,
      recurrence_group_id: groupId,
    }));

    const { data: inserted, error } = await supabase
      .from("events")
      .insert(rows)
      .select("*, category:categories(*)");

    if (error) { show(getErrorMessage(error), "error"); return; }

    const msg =
      dates.length > 1
        ? `${dates.length}개의 반복 일정이 추가됐어요 ✓`
        : "일정이 추가됐어요 ✓";
    show(msg);

    // 낙관적 업데이트: 현재 뷰 날짜에 해당하는 이벤트만 추가
    if (inserted) {
      const viewDates = viewMode === "week" ? getWeekDates(currentDate) : [currentDate];
      const visible = (inserted as Event[]).filter((e) => viewDates.includes(e.date));
      setEvents((prev) =>
        [...prev, ...visible].sort((a, b) => a.start_min - b.start_min)
      );
    }
  }

  async function updateEvent(
    id: string,
    payload: EventPayload,
    updateMode: "single" | "future" | "all" = "single",
  ) {
    const target = events.find((e) => e.id === id);

    const commonFields = {
      title: payload.title,
      note: payload.note,
      location: payload.location || null,
      image_url: payload.image_url ?? null,
      start_min: payload.is_allday ? 0 : payload.start_min,
      end_min: payload.is_allday ? 0 : payload.end_min,
      category_id: payload.category_id,
      is_note: payload.is_note,
      is_allday: payload.is_allday,
      is_cancelled: payload.is_cancelled,
    };

    if (updateMode === "single" || !target?.recurrence_group_id) {
      const { error } = await supabase
        .from("events")
        .update({ ...commonFields, date: payload.date })
        .eq("id", id);
      if (error) { show(getErrorMessage(error), "error"); return; }
      // 낙관적 업데이트
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, ...commonFields, date: payload.date }
            : e
        )
      );
      show("일정이 수정됐어요 ✓");
    } else if (updateMode === "future") {
      const { error } = await supabase
        .from("events")
        .update(commonFields)
        .eq("recurrence_group_id", target.recurrence_group_id)
        .gte("date", target.date);
      if (error) { show(getErrorMessage(error), "error"); return; }
      show("이후 반복 일정이 수정됐어요 ✓");
      await fetchEvents();
    } else {
      // 전체 수정: 기존 그룹 삭제 후 새 날짜/설정으로 재생성
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: groupEvents } = await supabase
        .from("events")
        .select("date")
        .eq("recurrence_group_id", target.recurrence_group_id)
        .order("date", { ascending: true })
        .limit(1);
      const firstDate = groupEvents?.[0]?.date ?? payload.date;

      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("recurrence_group_id", target.recurrence_group_id);
      if (deleteError) { show(getErrorMessage(deleteError), "error"); return; }

      const dates = generateRecurrenceDates(
        firstDate,
        payload.recurrence_type,
        payload.recurrence_end_date,
        payload.recurrence_days,
      );

      const rows = dates.map((date) => ({
        user_id: session.user.id,
        title: payload.title,
        note: payload.note,
        location: payload.location || null,
        image_url: payload.image_url ?? null,
        date,
        start_min: payload.is_allday ? 0 : payload.start_min,
        end_min: payload.is_allday ? 0 : payload.end_min,
        category_id: payload.category_id,
        is_note: payload.is_note,
        is_allday: payload.is_allday,
        is_cancelled: payload.is_cancelled,
        recurrence_type: payload.recurrence_type,
        recurrence_days: payload.recurrence_days,
        recurrence_end_date: payload.recurrence_end_date,
        recurrence_group_id: target.recurrence_group_id,
      }));

      const { error } = await supabase.from("events").insert(rows);
      if (error) { show(getErrorMessage(error), "error"); return; }
      show("반복 일정 전체가 수정됐어요 ✓");
      await fetchEvents();
    }
  }

  async function moveEvent(id: string, startMin: number, endMin: number) {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    // 낙관적 업데이트: 즉시 이동
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, start_min: startMin, end_min: endMin } : e))
    );

    const { error } = await supabase
      .from("events")
      .update({ start_min: startMin, end_min: endMin })
      .eq("id", id);

    if (error) {
      show(getErrorMessage(error), "error");
      // 실패 시 원복
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, start_min: target.start_min, end_min: target.end_min } : e
        )
      );
      return;
    }

    show("일정이 이동됐어요 ✓", "info", async () => {
      await supabase
        .from("events")
        .update({ start_min: target.start_min, end_min: target.end_min })
        .eq("id", id);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, start_min: target.start_min, end_min: target.end_min } : e
        )
      );
    });
  }

  async function deleteEvent(id: string, deleteAll = false) {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    if (deleteAll && target.recurrence_group_id) {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("recurrence_group_id", target.recurrence_group_id);
      if (error) { show(getErrorMessage(error), "error"); return; }
      // 낙관적 업데이트: 그룹 전체 제거
      setEvents((prev) =>
        prev.filter((e) => e.recurrence_group_id !== target.recurrence_group_id)
      );
      show("반복 일정 전체가 삭제됐어요", "info");
    } else {
      // 낙관적 업데이트: 즉시 제거
      setEvents((prev) => prev.filter((e) => e.id !== id));

      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        show(getErrorMessage(error), "error");
        setEvents((prev) => [...prev, target].sort((a, b) => a.start_min - b.start_min));
        return;
      }

      show("일정이 삭제됐어요", "info", async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data } = await supabase
          .from("events")
          .insert({
            user_id: session.user.id,
            title: target.title,
            note: target.note,
            location: target.location ?? null,
            image_url: target.image_url ?? null,
            date: target.date,
            start_min: target.start_min,
            end_min: target.end_min,
            category_id: target.category_id,
            is_note: target.is_note ?? false,
            is_allday: target.is_allday ?? false,
            is_cancelled: target.is_cancelled ?? false,
            recurrence_type: "none",
            recurrence_group_id: null,
          })
          .select("*, category:categories(*)")
          .single();
        if (data)
          setEvents((prev) =>
            [...prev, data as Event].sort((a, b) => a.start_min - b.start_min)
          );
      });
    }
  }

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    moveEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}

// 반복 날짜 배열 생성
function generateRecurrenceDates(
  startDate: string,
  type: RecurrenceType,
  endDate: string | null,
  recurrenceDays?: number[] | null,
): string[] {
  if (type === "none") return [startDate];

  const dates: string[] = [];
  const end = endDate ? dayjs(endDate) : dayjs(startDate).add(3, "month");
  let current = dayjs(startDate);

  if (type === "weekly" && recurrenceDays && recurrenceDays.length > 0) {
    while (current.isBefore(end) || current.isSame(end, "day")) {
      if (recurrenceDays.includes(current.day())) {
        dates.push(current.format("YYYY-MM-DD"));
      }
      current = current.add(1, "day");
      if (dates.length > 365) break;
    }
    return dates;
  }

  while (current.isBefore(end) || current.isSame(end, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    if (type === "daily") current = current.add(1, "day");
    else if (type === "weekly") current = current.add(1, "week");
    else if (type === "monthly") current = current.add(1, "month");

    if (dates.length > 365) break;
  }

  return dates;
}
