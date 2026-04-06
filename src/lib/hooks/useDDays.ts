"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/lib/handleError";
import dayjs from "dayjs";
import type { DDay } from "@/types";

function sortByDate(list: DDay[]): DDay[] {
  const today = dayjs().startOf("day");
  return [...list].sort((a, b) => {
    const diffA = dayjs(a.target_date).startOf("day").diff(today, "day"); // 양수=미래, 음수=과거
    const diffB = dayjs(b.target_date).startOf("day").diff(today, "day");
    const futureA = diffA >= 0 ? 0 : 1;
    const futureB = diffB >= 0 ? 0 : 1;
    // 미래(0) → 과거(1) 순
    if (futureA !== futureB) return futureA - futureB;
    // 미래끼리: 가까운 것 먼저 (diff 오름차순)
    // 과거끼리: 최근에 지난 것 먼저 (diff 내림차순 = 0에 가까운 음수 먼저)
    return diffA - diffB;
  });
}

export function useDDays() {
  const [ddays, setDDays] = useState<DDay[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToastStore();
  const supabase = createClient();

  useEffect(() => {
    fetchDDays();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDDays() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("ddays")
      .select("*")
      .eq("user_id", session.user.id)
      .order("sort_order")
      .order("created_at");

    if (error) { show(getErrorMessage(error), "error"); setLoading(false); return; }
    setDDays(sortByDate(data ?? []));
    setLoading(false);
  }

  async function addDDay(title: string, targetDate: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("ddays")
      .insert({ user_id: session.user.id, title: title.trim(), target_date: targetDate, sort_order: ddays.length })
      .select()
      .single();

    if (error) { show(getErrorMessage(error), "error"); return; }
    setDDays((prev) => sortByDate([...prev, data]));
    show("D-Day가 추가됐어요 ✓");
  }

  async function updateDDay(id: string, title: string, targetDate: string) {
    const { error } = await supabase
      .from("ddays")
      .update({ title: title.trim(), target_date: targetDate })
      .eq("id", id);

    if (error) { show(getErrorMessage(error), "error"); return; }
    setDDays((prev) =>
      sortByDate(prev.map((d) => d.id === id ? { ...d, title: title.trim(), target_date: targetDate } : d))
    );
  }

  async function deleteDDay(id: string) {
    setDDays((prev) => prev.filter((d) => d.id !== id));
    await supabase.from("ddays").delete().eq("id", id);
    show("D-Day가 삭제됐어요", "info");
  }

  return { ddays, loading, addDDay, updateDDay, deleteDDay };
}
