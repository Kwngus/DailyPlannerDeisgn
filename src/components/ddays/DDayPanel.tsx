"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useDDays } from "@/lib/hooks/useDDays";
import dayjs from "dayjs";
import type { DDay } from "@/types";

function calcDDay(targetDate: string): string {
  const today = dayjs().startOf("day");
  const target = dayjs(targetDate).startOf("day");
  const diff = target.diff(today, "day");
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function DDayBadge({ targetDate }: { targetDate: string }) {
  const today = dayjs().startOf("day");
  const target = dayjs(targetDate).startOf("day");
  const diff = target.diff(today, "day");
  const label = calcDDay(targetDate);

  let colorClass = "text-[var(--point)]";
  if (diff < 0) colorClass = "text-[var(--text-muted)]";
  else if (diff === 0) colorClass = "text-[var(--point)]";

  return (
    <span className={`text-sm font-bold tabular-nums ${colorClass}`}>
      {label}
    </span>
  );
}

export default function DDayPanel() {
  const { ddays, loading, addDDay, updateDDay, deleteDDay } = useDDays();
  const [open, setOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDate, setAddDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  function handleAdd() {
    if (!addTitle.trim() || !addDate) return;
    addDDay(addTitle, addDate);
    setAddTitle("");
    setAddDate("");
    setShowAddForm(false);
  }

  function startEdit(dday: DDay) {
    setEditingId(dday.id);
    setEditTitle(dday.title);
    setEditDate(dday.target_date);
  }

  function handleUpdate() {
    if (!editingId || !editTitle.trim() || !editDate) return;
    updateDDay(editingId, editTitle, editDate);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col rounded-2xl border bg-[var(--surface)] border-[var(--border)] flex-shrink-0">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-1.5">
          {open ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
          <div>
            <h2 className="font-serif text-base">D-Day</h2>
            {ddays.length > 0 && (
              <p className="text-xs text-gray-400">{ddays.length}개</p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowAddForm((v) => !v); setAddTitle(""); setAddDate(""); }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "var(--point)", color: "var(--point-fg)" }}
        >
          <Plus size={16} />
        </button>
      </div>

      {open && <div className="border-t border-[var(--border-subtle)]" />}

      {/* 인라인 추가 폼 */}
      {open && showAddForm && (
        <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] space-y-2">
          <input
            type="text"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="수능, 기말고사, 여행..."
            autoFocus
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
          />
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-xl border text-xs outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]"
            />
            <button
              onClick={handleAdd}
              disabled={!addTitle.trim() || !addDate}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{ background: "var(--point)", color: "var(--point-fg)" }}
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      )}

      {/* D-Day 목록 */}
      {open && <div className="overflow-y-auto max-h-48 px-3 py-2 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-10">
            <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        ) : ddays.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            + 버튼으로 D-Day를 추가해보세요
          </p>
        ) : (
          ddays.map((dday) =>
            editingId === dday.id ? (
              <div key={dday.id} className="space-y-1.5 px-2 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
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
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border text-xs outline-none bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                  />
                  <button onClick={handleUpdate} className="p-1 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => deleteDDay(dday.id)} className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={dday.id}
                className="flex items-center gap-2 px-2 py-2 rounded-xl border bg-[var(--surface)] border-[var(--border)] hover:border-[var(--text-muted)] transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-[var(--text)]">{dday.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {dayjs(dday.target_date).format("YYYY.MM.DD")}
                  </p>
                </div>
                <DDayBadge targetDate={dday.target_date} />
                <button
                  onClick={() => startEdit(dday)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-lg text-gray-300 hover:text-gray-600 transition-all"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )
          )
        )}
      </div>}
    </div>
  );
}
