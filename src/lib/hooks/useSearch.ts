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

  const search = useCallback(async (q: string, categoryId?: string | null) => {
    setQuery(q);

    // 검색어도 없고 분류도 없으면 초기화
    if (!q.trim() && !categoryId) {
      setResults({ events: [], todos: [] });
      return;
    }

    setLoading(true);

    // events 쿼리 빌드
    let evQuery = supabase
      .from("events")
      .select("*, category:categories(*)")
      .order("date", { ascending: false })
      .order("start_min", { ascending: true })
      .limit(30);

    // 텍스트 검색 조건
    if (q.trim()) {
      evQuery = evQuery.or(`title.ilike.%${q}%,note.ilike.%${q}%`);
    }

    // 분류 필터 조건
    if (categoryId) {
      evQuery = evQuery.eq("category_id", categoryId);
    }

    // todos 쿼리 빌드
    let todoQuery = supabase
      .from("todos")
      .select("*, category:categories(*)")
      .order("due_date", { ascending: false })
      .limit(30);

    if (q.trim()) {
      todoQuery = todoQuery.or(`title.ilike.%${q}%,memo.ilike.%${q}%`);
    }

    if (categoryId) {
      todoQuery = todoQuery.eq("category_id", categoryId);
    }

    const [evRes, todoRes] = await Promise.all([evQuery, todoQuery]);

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
