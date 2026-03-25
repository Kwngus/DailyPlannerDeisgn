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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const maxOrder =
      todos.length > 0 ? Math.max(...todos.map((t) => t.sort_order ?? 0)) : 0;

    const { error } = await supabase.from("todos").insert({
      ...payload,
      user_id: user.id,
      sort_order: maxOrder + 1,
    });
    if (error) {
      show(getErrorMessage(error), "error");
      return;
    }
    show("할 일이 추가됐어요 ✓");
    await fetchTodos();
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
    const { error } = await supabase.from("todos").update(payload).eq("id", id);
    if (error) {
      show(getErrorMessage(error), "error");
      return;
    }
    if ("is_done" in payload) {
      show(
        payload.is_done ? "완료했어요 ✓" : "다시 진행 중으로 변경됐어요",
        "info",
      );
    } else {
      show("수정됐어요 ✓");
    }
    await fetchTodos();
  }

  async function deleteTodo(id: string) {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      show(getErrorMessage(error), "error");
      return;
    }
    await fetchTodos();
    show("할 일이 삭제됐어요", "info", async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("todos").insert({
        user_id: user.id,
        title: target.title,
        memo: target.memo,
        due_date: target.due_date,
        priority: target.priority,
        category_id: target.category_id,
        is_done: false,
        sort_order: target.sort_order,
      });
      await fetchTodos();
    });
  }

  async function toggleDone(id: string, current: boolean) {
    await updateTodo(id, { is_done: !current });
  }

  // 순서 변경 — 낙관적 업데이트 후 DB 반영
  async function reorderTodos(newTodos: Todo[]) {
    // 즉시 UI 반영
    setTodos(newTodos);

    // DB 업데이트 (배치)
    const updates = newTodos.map((todo, idx) => ({
      id: todo.id,
      sort_order: idx,
    }));

    for (const { id, sort_order } of updates) {
      await supabase.from("todos").update({ sort_order }).eq("id", id);
    }
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
