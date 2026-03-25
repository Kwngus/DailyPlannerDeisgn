import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { getWeekDates } from "@/lib/timeUtils";
import { useToastStore } from "@/store/toastStore";
import type { Event, ViewMode } from "@/types";

export type EventPayload = {
  title: string;
  note: string;
  date: string;
  start_min: number;
  end_min: number;
  category_id: string | null;
  is_note: boolean;
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
    const { error } = await supabase
      .from("events")
      .insert({ ...payload, user_id: user.id });
    if (error) {
      show("저장에 실패했어요.", "error");
      return;
    }
    show("일정이 추가됐어요 ✓");
    await fetchEvents();
  }

  async function updateEvent(id: string, payload: EventPayload) {
    const { error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", id);
    if (error) {
      show("수정에 실패했어요.", "error");
      return;
    }
    show("일정이 수정됐어요 ✓");
    await fetchEvents();
  }

  async function deleteEvent(id: string) {
    // Undo를 위해 삭제 전 데이터 백업
    const target = events.find((e) => e.id === id);
    if (!target) return;

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      show("삭제에 실패했어요.", "error");
      return;
    }

    await fetchEvents();

    // Undo 액션
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
      });
      await fetchEvents();
    });
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
