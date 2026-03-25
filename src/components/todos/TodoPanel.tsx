"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Flag,
} from "lucide-react";
import { useTodos } from "@/lib/hooks/useTodos";
import { useCategories } from "@/lib/hooks/useCategories";
import TodoModal from "@/components/modals/TodoModal";
import type { Todo, Priority } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
dayjs.locale("ko");

const PRIORITY_COLOR: Record<Priority, string> = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

function groupByDate(todos: Todo[]) {
  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  const groups: { label: string; key: string; todos: Todo[] }[] = [];

  // 기한 초과
  const overdue = todos.filter(
    (t) => !t.is_done && t.due_date && t.due_date < today,
  );
  if (overdue.length > 0)
    groups.push({ label: "⚠️ 기한 초과", key: "overdue", todos: overdue });

  // 오늘
  const todayTodos = todos.filter((t) => t.due_date === today);
  if (todayTodos.length > 0)
    groups.push({ label: "오늘", key: "today", todos: todayTodos });

  // 내일
  const tomorrowTodos = todos.filter((t) => t.due_date === tomorrow);
  if (tomorrowTodos.length > 0)
    groups.push({ label: "내일", key: "tomorrow", todos: tomorrowTodos });

  // 이번 주
  const weekEnd = dayjs().endOf("week").format("YYYY-MM-DD");
  const thisWeek = todos.filter(
    (t) => t.due_date && t.due_date > tomorrow && t.due_date <= weekEnd,
  );
  if (thisWeek.length > 0)
    groups.push({ label: "이번 주", key: "week", todos: thisWeek });

  // 이후
  const later = todos.filter((t) => t.due_date && t.due_date > weekEnd);
  if (later.length > 0)
    groups.push({ label: "이후", key: "later", todos: later });

  // 날짜 없음
  const noDate = todos.filter((t) => !t.due_date && !t.is_done);
  if (noDate.length > 0)
    groups.push({ label: "날짜 없음", key: "nodate", todos: noDate });

  // 완료
  const done = todos.filter((t) => t.is_done);
  if (done.length > 0)
    groups.push({ label: `완료 (${done.length})`, key: "done", todos: done });

  return groups;
}

export default function TodoPanel() {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleDone } =
    useTodos();
  const { categories } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    done: true,
  });

  const groups = groupByDate(todos);
  const remaining = todos.filter((t) => !t.is_done).length;

  function openAdd() {
    setEditingTodo(null);
    setModalOpen(true);
  }
  function openEdit(todo: Todo) {
    setEditingTodo(todo);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div>
          <h2 className="font-serif text-base">할 일</h2>
          {remaining > 0 && (
            <p className="text-xs text-gray-400">{remaining}개 남음</p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="w-8 h-8 bg-[#1A1714] text-white rounded-full flex items-center justify-center hover:bg-[#3D3430] transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm text-gray-400">할 일이 없어요!</p>
            <p className="text-xs text-gray-300 mt-1">
              + 버튼으로 추가해보세요
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="mb-3">
              {/* 그룹 헤더 */}
              <button
                onClick={() =>
                  setCollapsed((p) => ({ ...p, [group.key]: !p[group.key] }))
                }
                className="flex items-center gap-1.5 w-full text-left mb-1.5 px-1"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {group.label}
                </span>
                <span className="text-xs text-gray-300 ml-1">
                  {group.todos.length}
                </span>
                <span className="ml-auto text-gray-300">
                  {collapsed[group.key] ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronUp size={14} />
                  )}
                </span>
              </button>

              {/* 할 일 목록 */}
              {!collapsed[group.key] && (
                <div className="space-y-1">
                  {group.todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer group
                        ${
                          todo.is_done
                            ? "bg-gray-50 border-gray-100 opacity-60"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      onClick={() => openEdit(todo)}
                    >
                      {/* 체크버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDone(todo.id, todo.is_done);
                        }}
                        className="mt-0.5 flex-shrink-0 transition-colors"
                      >
                        {todo.is_done ? (
                          <CheckCircle2 size={18} className="text-gray-400" />
                        ) : (
                          <Circle
                            size={18}
                            className="text-gray-300 hover:text-gray-600"
                          />
                        )}
                      </button>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium leading-tight truncate
                          ${todo.is_done ? "line-through text-gray-400" : "text-gray-800"}`}
                        >
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {/* 마감일 */}
                          {todo.due_date && (
                            <span
                              className={`text-[10px] font-semibold
                              ${
                                todo.due_date < dayjs().format("YYYY-MM-DD") &&
                                !todo.is_done
                                  ? "text-red-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {dayjs(todo.due_date).format("M/D")}
                            </span>
                          )}
                          {/* 분류 */}
                          {todo.category && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: todo.category.color + "55" }}
                            >
                              {todo.category.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 우선순위 */}
                      <Flag
                        size={13}
                        className={`mt-0.5 flex-shrink-0 ${PRIORITY_COLOR[todo.priority]}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 모달 */}
      <TodoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={
          editingTodo
            ? (payload) => updateTodo(editingTodo.id, payload)
            : addTodo
        }
        onDelete={editingTodo ? () => deleteTodo(editingTodo.id) : undefined}
        categories={categories}
        editingTodo={editingTodo}
      />
    </div>
  );
}
