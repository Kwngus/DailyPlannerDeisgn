import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { getWeekDates } from "@/lib/timeUtils";
import { useToastStore } from "@/store/toastStore";
import type { Event, ViewMode, RecurrenceType } from "@/types";
import dayjs from "dayjs";

export type EventPayload = {
  title: string;
  note: string;
  date: string;
  start_min: number;
  end_min: number;
  category_id: string | null;
  is_note: boolean;
  recurrence_type: RecurrenceType;
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

  async function addEvent(payload: EventPayload) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const groupId =
      payload.recurrence_type !== "none" ? crypto.randomUUID() : null;

    // 반복 일정 날짜 배열 생성
    const dates = generateRecurrenceDates(
      payload.date,
      payload.recurrence_type,
      payload.recurrence_end_date,
    );

    const rows = dates.map((date) => ({
      user_id: user.id,
      title: payload.title,
      note: payload.note,
      date,
      start_min: payload.start_min,
      end_min: payload.end_min,
      category_id: payload.category_id,
      is_note: payload.is_note,
      recurrence_type: payload.recurrence_type,
      recurrence_end_date: payload.recurrence_end_date,
      recurrence_group_id: groupId,
    }));

    const { error } = await supabase.from("events").insert(rows);
    if (error) {
      show("저장에 실패했어요.", "error");
      return;
    }

    const msg =
      dates.length > 1
        ? `${dates.length}개의 반복 일정이 추가됐어요 ✓`
        : "일정이 추가됐어요 ✓";
    show(msg);
    await fetchEvents();
  }

  async function updateEvent(id: string, payload: EventPayload) {
    const { error } = await supabase
      .from("events")
      .update({
        title: payload.title,
        note: payload.note,
        date: payload.date,
        start_min: payload.start_min,
        end_min: payload.end_min,
        category_id: payload.category_id,
        is_note: payload.is_note,
      })
      .eq("id", id);
    if (error) {
      show("수정에 실패했어요.", "error");
      return;
    }
    show("일정이 수정됐어요 ✓");
    await fetchEvents();
  }

  async function deleteEvent(id: string, deleteAll = false) {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    if (deleteAll && target.recurrence_group_id) {
      // 반복 그룹 전체 삭제
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("recurrence_group_id", target.recurrence_group_id);
      if (error) {
        show("삭제에 실패했어요.", "error");
        return;
      }
      show("반복 일정 전체가 삭제됐어요", "info");
    } else {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        show("삭제에 실패했어요.", "error");
        return;
      }

      show("일정이 삭제됐어요", "info", async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("events").insert({
          user_id: user.id,
          title: target.title,
          note: target.note,
          date: target.date,
          start_min: target.start_min,
          end_min: target.end_min,
          category_id: target.category_id,
          is_note: target.is_note ?? false,
          recurrence_type: "none",
          recurrence_group_id: null,
        });
        await fetchEvents();
      });
    }
    await fetchEvents();
  }

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}

// 반복 날짜 배열 생성
function generateRecurrenceDates(
  startDate: string,
  type: RecurrenceType,
  endDate: string | null,
): string[] {
  if (type === "none") return [startDate];

  const dates: string[] = [];
  const end = endDate ? dayjs(endDate) : dayjs(startDate).add(3, "month");
  let current = dayjs(startDate);

  while (current.isBefore(end) || current.isSame(end, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    if (type === "daily") current = current.add(1, "day");
    else if (type === "weekly") current = current.add(1, "week");
    else if (type === "monthly") current = current.add(1, "month");

    if (dates.length > 365) break; // 안전 제한
  }

  return dates;
}
