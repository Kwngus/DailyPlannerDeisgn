import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import dayjs from "dayjs";
import type { Event, Todo } from "@/types";

export function useMonthEvents(currentDate: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const startOfMonth = dayjs(currentDate)
      .startOf("month")
      .format("YYYY-MM-DD");
    const endOfMonth = dayjs(currentDate).endOf("month").format("YYYY-MM-DD");

    const [evRes, todoRes] = await Promise.all([
      supabase
        .from("events")
        .select("*, category:categories(*)")
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .order("start_min", { ascending: true }),
      supabase
        .from("todos")
        .select("*, category:categories(*)")
        .gte("due_date", startOfMonth)
        .lte("due_date", endOfMonth),
    ]);

    if (evRes.data) setEvents(evRes.data as Event[]);
    if (todoRes.data) setTodos(todoRes.data as Todo[]);
    setLoading(false);
  }, [currentDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { events, todos, loading };
}
