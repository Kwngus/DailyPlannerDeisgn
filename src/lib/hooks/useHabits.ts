"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/lib/handleError";
import dayjs from "dayjs";
import type { Habit, HabitWithDone } from "@/types";

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithDone[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToastStore();
  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    fetchHabits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchHabits() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: habitsData, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order("sort_order")
      .order("created_at");

    if (error) { show(getErrorMessage(error), "error"); setLoading(false); return; }

    const { data: logsData } = await supabase
      .from("habit_logs")
      .select("id, habit_id")
      .eq("user_id", user.id)
      .eq("date", today);

    const logMap = new Map((logsData ?? []).map((l: { id: string; habit_id: string }) => [l.habit_id, l.id]));

    setHabits(
      (habitsData ?? []).map((h: Habit) => ({
        ...h,
        is_done: logMap.has(h.id),
        log_id: logMap.get(h.id) ?? null,
      }))
    );
    setLoading(false);
  }

  async function toggleHabit(habit: HabitWithDone) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (habit.is_done && habit.log_id) {
      await supabase.from("habit_logs").delete().eq("id", habit.log_id);
      setHabits((prev) =>
        prev.map((h) => h.id === habit.id ? { ...h, is_done: false, log_id: null } : h)
      );
    } else {
      const { data } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habit.id, user_id: user.id, date: today })
        .select()
        .single();
      setHabits((prev) =>
        prev.map((h) => h.id === habit.id ? { ...h, is_done: true, log_id: data?.id ?? null } : h)
      );
    }
  }

  async function addHabit(title: string, endDate: string | null) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: user.id, title: title.trim(), end_date: endDate || null, sort_order: habits.length })
      .select()
      .single();

    if (error) { show(getErrorMessage(error), "error"); return; }
    setHabits((prev) => [...prev, { ...data, is_done: false, log_id: null }]);
    show("루틴이 추가됐어요 ✓");
  }

  async function updateHabit(id: string, title: string, endDate: string | null) {
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ title: title.trim(), end_date: endDate || null })
      .eq("id", id);

    if (error) { show(getErrorMessage(error), "error"); return; }
    setHabits((prev) =>
      prev.map((h) => h.id === id ? { ...h, title: title.trim(), end_date: endDate } : h)
    );
  }

  async function deleteHabit(id: string) {
    const supabase = createClient();
    await supabase.from("habits").delete().eq("id", id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    show("루틴이 삭제됐어요", "info");
  }

  return { habits, loading, toggleHabit, addHabit, updateHabit, deleteHabit };
}
