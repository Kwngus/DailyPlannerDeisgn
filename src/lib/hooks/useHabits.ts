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

  // supabase 인스턴스 한 번만 생성
  const supabase = createClient();

  useEffect(() => {
    fetchHabits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchHabits() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    // 두 쿼리를 병렬 실행
    const [habitsResult, logsResult] = await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", session.user.id)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order("sort_order")
        .order("created_at"),
      supabase
        .from("habit_logs")
        .select("id, habit_id")
        .eq("user_id", session.user.id)
        .eq("date", today),
    ]);

    if (habitsResult.error) {
      show(getErrorMessage(habitsResult.error), "error");
      setLoading(false);
      return;
    }

    const logMap2 = new Map<string, string>(
      (logsResult.data ?? []).map((l: { id: string; habit_id: string }) => [l.habit_id, l.id])
    );

    setHabits(
      (habitsResult.data ?? []).map((h: Habit) => ({
        ...h,
        is_done: logMap2.has(h.id),
        log_id: logMap2.get(h.id) ?? null,
      }))
    );
    setLoading(false);
  }

  async function toggleHabit(habit: HabitWithDone) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (habit.is_done && habit.log_id) {
      // 낙관적 업데이트
      setHabits((prev) =>
        prev.map((h) => h.id === habit.id ? { ...h, is_done: false, log_id: null } : h)
      );
      await supabase.from("habit_logs").delete().eq("id", habit.log_id);
    } else {
      const { data } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habit.id, user_id: session.user.id, date: today })
        .select()
        .single();
      // 낙관적 업데이트
      setHabits((prev) =>
        prev.map((h) => h.id === habit.id ? { ...h, is_done: true, log_id: data?.id ?? null } : h)
      );
    }
  }

  async function addHabit(title: string, endDate: string | null) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: session.user.id, title: title.trim(), end_date: endDate || null, sort_order: habits.length })
      .select()
      .single();

    if (error) { show(getErrorMessage(error), "error"); return; }
    setHabits((prev) => [...prev, { ...data, is_done: false, log_id: null }]);
    show("루틴이 추가됐어요 ✓");
  }

  async function updateHabit(id: string, title: string, endDate: string | null) {
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
    setHabits((prev) => prev.filter((h) => h.id !== id));
    await supabase.from("habits").delete().eq("id", id);
    show("루틴이 삭제됐어요", "info");
  }

  return { habits, loading, toggleHabit, addHabit, updateHabit, deleteHabit };
}
