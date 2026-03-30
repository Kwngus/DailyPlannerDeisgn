"use client";

import { useState, useEffect } from "react";
import { useEscClose } from "@/lib/hooks/useEscClose";
import { X, Trash2 } from "lucide-react";
import type { Todo, Category, Priority } from "@/types";

type Payload = {
  title: string;
  memo: string;
  due_date: string | null;
  priority: Priority;
  category_id: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Payload) => void;
  onDelete?: () => void;
  categories: Category[];
  editingTodo?: Todo | null;
};

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "high",   label: "높음", color: "bg-red-100 text-red-600 border-red-300"    },
  { value: "medium", label: "보통", color: "bg-yellow-100 text-yellow-600 border-yellow-300" },
  { value: "low",    label: "낮음", color: "bg-green-100 text-green-600 border-green-300"  },
];

const INPUT_CLS =
  "w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors";

export default function TodoModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
  editingTodo,
}: Props) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setMemo(editingTodo.memo ?? "");
      setDueDate(editingTodo.due_date ?? "");
      setPriority(editingTodo.priority);
      setCategoryId(editingTodo.category_id);
    } else {
      setTitle("");
      setMemo("");
      setDueDate("");
      setPriority("medium");
      setCategoryId(null);
    }
    setError(null);
  }, [isOpen, editingTodo]);

  function handleSave() {
    if (!title.trim()) {
      setError("할 일을 입력해주세요.");
      return;
    }
    onSave({
      title: title.trim(),
      memo,
      due_date: dueDate || null,
      priority,
      category_id: categoryId,
    });
    onClose();
  }

  useEscClose(isOpen, onClose);

  if (!isOpen) return null;

  const isEditing = !!editingTodo;

  return (
    <>
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" aria-hidden="true" />
    <div role="dialog" aria-modal="true" aria-labelledby="todo-modal-title" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.22s_cubic-bezier(0.34,1.56,0.64,1)] bg-[var(--surface)] pointer-events-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 id="todo-modal-title" className="font-serif text-xl">
            {isEditing ? "할 일 수정" : "할 일 추가"}
          </h2>
          <div className="flex items-center gap-2">
            {isEditing && onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                aria-label="할 일 삭제"
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="닫기"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 바디 */}
        <div className="px-6 py-4 space-y-4">

          {/* 제목 */}
          <div>
            <label htmlFor="todo-title" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              할 일
            </label>
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="무엇을 해야 하나요?"
              autoFocus
              className={INPUT_CLS + " bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"}
            />
          </div>

          {/* 우선순위 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              우선순위
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                    ${priority === p.value ? p.color + " border-current" : "bg-[var(--border-subtle)] text-[var(--text-muted)] border-transparent hover:border-[var(--border)]"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 마감일 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              마감일 <span className="text-gray-300 normal-case font-normal">(선택)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={INPUT_CLS + " bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"}
            />
          </div>

          {/* 분류 */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                분류 <span className="text-gray-300 normal-case font-normal">(선택)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryId(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                    ${categoryId === null ? "border-[var(--accent)] bg-[var(--border-subtle)]" : "border-transparent bg-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border)]"}`}
                >
                  없음
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                      ${categoryId === cat.id ? "border-[var(--accent)] opacity-100" : "border-transparent opacity-60"}`}
                    style={{ background: cat.color + "99" }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              메모 <span className="text-gray-300 normal-case font-normal">(선택)</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 내용..."
              rows={3}
              className={INPUT_CLS + " resize-none bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"}
            />
          </div>

          {error && <p role="alert" className="text-red-500 text-xs text-center">{error}</p>}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold
                       text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "var(--point)", color: "var(--point-fg)" }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
