"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Circle, Pencil, Trash2, Check, X } from "lucide-react";
import { useHabits } from "@/lib/hooks/useHabits";
import type { HabitWithDone } from "@/types";

export default function HabitPanel() {
  const { habits, loading, toggleHabit, addHabit, updateHabit, deleteHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addEndDate, setAddEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const done = habits.filter((h) => h.is_done).length;

  function handleAdd() {
    if (!addTitle.trim()) return;
    addHabit(addTitle, addEndDate || null);
    setAddTitle("");
    setAddEndDate("");
    setShowAddForm(false);
  }

  function startEdit(habit: HabitWithDone) {
    setEditingId(habit.id);
    setEditTitle(habit.title);
    setEditEndDate(habit.end_date ?? "");
  }

  function handleUpdate() {
    if (!editingId || !editTitle.trim()) return;
    updateHabit(editingId, editTitle, editEndDate || null);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col rounded-2xl border bg-[var(--surface)] border-[var(--border)] flex-shrink-0">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="font-serif text-base">오늘의 루틴</h2>
          {habits.length > 0 && (
            <p className="text-xs text-gray-400">
              {done}/{habits.length} 완료
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowAddForm((v) => !v); setAddTitle(""); setAddEndDate(""); }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "var(--point)", color: "var(--point-fg)" }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 인라인 추가 폼 */}
      {showAddForm && (
        <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] space-y-2">
          <input
            type="text"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="영양제 먹기, 앱 출석체크..."
            autoFocus
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
          />
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={addEndDate}
              onChange={(e) => setAddEndDate(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-xl border text-xs outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]"
            />
            <span className="text-[10px] text-gray-300 whitespace-nowrap">종료일 (선택)</span>
            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--point)", color: "var(--point-fg)" }}
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 루틴 목록 */}
      <div className="overflow-y-auto max-h-52 px-3 py-2 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-10">
            <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            + 버튼으로 매일 할 루틴을 추가해보세요
          </p>
        ) : (
          habits.map((habit) =>
            editingId === habit.id ? (
              /* 인라인 수정 폼 */
              <div key={habit.id} className="space-y-1.5 px-2 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  autoFocus
                  className="w-full px-2 py-1 rounded-lg border text-sm outline-none focus:border-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text)]"
                />
                <div className="flex gap-1.5 items-center">
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border text-xs outline-none bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                  />
                  <button onClick={handleUpdate} className="p-1 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => deleteHabit(habit.id)} className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* 루틴 행 */
              <div
                key={habit.id}
                className={`flex items-center gap-2 px-2 py-2 rounded-xl border transition-all group ${
                  habit.is_done
                    ? "bg-[var(--border-subtle)] border-[var(--border-subtle)] opacity-70"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--text-muted)]"
                }`}
              >
                <button
                  onClick={() => toggleHabit(habit)}
                  className="flex-shrink-0 transition-colors"
                >
                  {habit.is_done ? (
                    <CheckCircle2 size={18} className="text-[var(--point)]" />
                  ) : (
                    <Circle size={18} className="text-gray-300 hover:text-gray-500" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm leading-tight truncate ${
                    habit.is_done ? "line-through text-[var(--text-muted)]" : "text-[var(--text)]"
                  }`}
                >
                  {habit.title}
                </span>
                <button
                  onClick={() => startEdit(habit)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-lg text-gray-300 hover:text-gray-600 transition-all"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
