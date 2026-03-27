import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/lib/handleError";
import { useRealtimeTodos } from "./useRealtimeTodos";
import type { Todo, Priority } from "@/types";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { show } = useToastStore();

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("todos")
      .select("*, category:categories(*)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (data) setTodos(data as Todo[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 실시간 동기화 — 다른 기기나 탭에서 변경 시 자동 반영
  useRealtimeTodos({
    onInsert: fetchTodos,
    onUpdate: fetchTodos,
    onDelete: fetchTodos,
  });

  async function addTodo(payload: {
    title: string;
    memo: string;
    due_date: string | null;
    priority: Priority;
    category_id: string | null;
  }) {
    // getSession(): 로컬 캐시에서 읽음 (네트워크 없음)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const maxOrder =
      todos.length > 0 ? Math.max(...todos.map((t) => t.sort_order ?? 0)) : 0;

    const { data, error } = await supabase
      .from("todos")
      .insert({ ...payload, user_id: session.user.id, sort_order: maxOrder + 1 })
      .select("*, category:categories(*)")
      .single();

    if (error) { show(getErrorMessage(error), "error"); return; }
    // 낙관적 업데이트: fetchTodos() 대신 직접 추가
    if (data) setTodos((prev) => [...prev, data as Todo]);
    show("할 일이 추가됐어요 ✓");
  }

  async function updateTodo(
    id: string,
    payload: Partial<{
      title: string;
      memo: string;
      due_date: string | null;
      priority: Priority;
      category_id: string | null;
      is_done: boolean;
    }>,
  ) {
    // 낙관적 업데이트: DB 응답 전에 UI 즉시 반영
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)));

    const { error } = await supabase.from("todos").update(payload).eq("id", id);
    if (error) {
      show(getErrorMessage(error), "error");
      await fetchTodos(); // 실패 시 DB에서 복원
      return;
    }
    if ("is_done" in payload) {
      show(payload.is_done ? "완료했어요 ✓" : "다시 진행 중으로 변경됐어요", "info");
    } else {
      show("수정됐어요 ✓");
    }
  }

  async function deleteTodo(id: string) {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    // 낙관적 업데이트: 즉시 제거
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      show(getErrorMessage(error), "error");
      // 실패 시 원복
      setTodos((prev) =>
        [...prev, target].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      );
      return;
    }

    show("할 일이 삭제됐어요", "info", async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("todos")
        .insert({
          user_id: session.user.id,
          title: target.title,
          memo: target.memo,
          due_date: target.due_date,
          priority: target.priority,
          category_id: target.category_id,
          is_done: false,
          sort_order: target.sort_order,
        })
        .select("*, category:categories(*)")
        .single();
      if (data)
        setTodos((prev) =>
          [...prev, data as Todo].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        );
    });
  }

  async function toggleDone(id: string, current: boolean) {
    await updateTodo(id, { is_done: !current });
  }

  // 순서 변경 — 병렬 업데이트
  async function reorderTodos(newTodos: Todo[]) {
    setTodos(newTodos);

    const updates = newTodos.map((todo, idx) => ({ id: todo.id, sort_order: idx }));
    await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from("todos").update({ sort_order }).eq("id", id)
      )
    );
  }

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleDone,
    reorderTodos,
  };
}
