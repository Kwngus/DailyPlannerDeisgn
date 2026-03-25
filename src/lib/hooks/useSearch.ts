import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Event, Todo } from "@/types";

export type SearchResults = {
  events: Event[];
  todos: Todo[];
};

export function useSearch() {
  const [results, setResults] = useState<SearchResults>({
    events: [],
    todos: [],
  });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const supabase = createClient();

  const search = useCallback(async (q: string) => {
    setQuery(q);

    if (!q.trim()) {
      setResults({ events: [], todos: [] });
      return;
    }

    setLoading(true);

    const [evRes, todoRes] = await Promise.all([
      supabase
        .from("events")
        .select("*, category:categories(*)")
        .or(`title.ilike.%${q}%,note.ilike.%${q}%`)
        .order("date", { ascending: false })
        .order("start_min", { ascending: true })
        .limit(20),
      supabase
        .from("todos")
        .select("*, category:categories(*)")
        .or(`title.ilike.%${q}%,memo.ilike.%${q}%`)
        .order("due_date", { ascending: false })
        .limit(20),
    ]);

    setResults({
      events: (evRes.data as Event[]) ?? [],
      todos: (todoRes.data as Todo[]) ?? [],
    });
    setLoading(false);
  }, []);

  function clear() {
    setQuery("");
    setResults({ events: [], todos: [] });
  }

  return { query, results, loading, search, clear };
}
