"use client";

import { useState, useEffect } from "react";
import { useEscClose } from "@/lib/hooks/useEscClose";
import { X, Trash2 } from "lucide-react";
import { minToTime, timeToMin } from "@/lib/timeUtils";
import type { Event, Category, RecurrenceType } from "@/types";
import type { EventPayload } from "@/lib/hooks/useEvents";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: EventPayload) => void;
  onDelete?: (deleteAll: boolean) => void;
  categories: Category[];
  defaultDate: string;
  defaultHour?: number;
  defaultStartMin?: number;
  defaultEndMin?: number; 
  editingEvent?: Event | null;
};

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "반복 없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
  defaultDate,
  defaultHour,
  defaultStartMin,
  defaultEndMin,
  editingEvent,
}: Props) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isNote, setIsNote] = useState(false);
  const [isAllday, setIsAllday] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setNote(editingEvent.note ?? "");
      setDate(editingEvent.date);
      setStartTime(minToTime(editingEvent.start_min));
      setEndTime(minToTime(editingEvent.end_min));
      setCategoryId(editingEvent.category_id);
      setIsNote(editingEvent.is_note ?? false);
      setIsAllday(editingEvent.is_allday ?? false);
      setIsCancelled(editingEvent.is_cancelled ?? false);
      setRecurrence(editingEvent.recurrence_type ?? "none");
      setRecurrenceEnd(editingEvent.recurrence_end_date ?? "");
    } else {
      setTitle("");
      setNote("");
      setDate(defaultDate);
      if (defaultStartMin !== undefined && defaultEndMin !== undefined) {
        setStartTime(minToTime(defaultStartMin));
        setEndTime(minToTime(defaultEndMin));
      } else {
        const h = defaultHour ?? new Date().getHours();
        setStartTime(`${String(h).padStart(2, "0")}:00`);
        setEndTime(`${String(Math.min(h + 1, 23)).padStart(2, "0")}:00`);
      }
      setCategoryId(categories[0]?.id ?? null);
      setIsNote(false);
      setIsAllday(false);
      setIsCancelled(false);
      setRecurrence("none");
      setRecurrenceEnd("");
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [isOpen, editingEvent, defaultDate, defaultHour, defaultStartMin, defaultEndMin]);

  function handleSave() {
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    const startMin = timeToMin(startTime);
    const endMin = timeToMin(endTime);
    if (!isAllday && endMin <= startMin) {
      setError("종료 시간은 시작 시간보다 늦어야 해요.");
      return;
    }

    onSave({
      title: title.trim(),
      note,
      date,
      start_min: startMin,
      end_min: endMin,
      category_id: categoryId,
      is_note: isNote,
      is_allday: isAllday,
      is_cancelled: isCancelled,
      recurrence_type: recurrence,
      recurrence_end_date: recurrenceEnd || null,
    });
    onClose();
  }

  useEscClose(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.22s_cubic-bezier(0.34,1.56,0.64,1)] bg-[var(--surface)]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-serif text-xl">
            {editingEvent
              ? isNote ? "메모 수정" : isAllday ? "종일 일정 수정" : "일정 수정"
              : isNote ? "메모 추가" : isAllday ? "종일 일정 추가" : "일정 추가"}
          </h2>
          <div className="flex items-center gap-2">
            {editingEvent && onDelete && !showDeleteConfirm && (
              <button
                onClick={() => {
                  if (editingEvent?.recurrence_group_id) {
                    setShowDeleteConfirm(true);
                  } else {
                    onDelete?.(false);
                    onClose();
                  }
                }}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 삭제 확인 (반복 일정인 경우) */}
        {showDeleteConfirm && editingEvent?.recurrence_group_id ? (
          <div className="px-6 py-6 space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              어떤 일정을 삭제할까요?
            </p>
            <button
              onClick={() => {
                onDelete?.(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors text-left px-4"
            >
              이 일정만 삭제
            </button>
            <button
              onClick={() => {
                onDelete?.(true);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left px-4"
            >
              반복 일정 전체 삭제
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        ) : (
          <>
            {/* 바디 */}
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* 타입 선택 */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsNote(false); setIsAllday(false); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    !isNote && !isAllday
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                      : "border-[var(--border)] text-gray-400 hover:border-gray-400"
                  }`}
                >
                  일정
                </button>
                <button
                  onClick={() => { setIsNote(false); setIsAllday(true); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    isAllday
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                      : "border-[var(--border)] text-gray-400 hover:border-gray-400"
                  }`}
                >
                  종일
                </button>
                <button
                  onClick={() => { setIsNote(true); setIsAllday(false); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    isNote
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                      : "border-[var(--border)] text-gray-400 hover:border-gray-400"
                  }`}
                >
                  메모
                </button>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="무엇을 할 예정인가요?"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-gray-800 transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                />
              </div>

              {/* 날짜 + 시간 */}
              <div className={`grid gap-3 ${isAllday ? "grid-cols-1" : "grid-cols-3"}`}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                  />
                </div>
                {!isAllday && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        시작
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        종료
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* 반복 설정 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  반복
                </label>
                <div className="flex gap-2 flex-wrap">
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRecurrence(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        recurrence === opt.value
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                          : "border-gray-200 text-gray-500 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* 반복 종료일 */}
                {recurrence !== "none" && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      반복 종료일{" "}
                      <span className="text-gray-300">(미설정 시 3개월)</span>
                    </label>
                    <input
                      type="date"
                      value={recurrenceEnd}
                      onChange={(e) => setRecurrenceEnd(e.target.value)}
                      min={date}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-gray-800 transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                    />
                  </div>
                )}
              </div>

              {/* 분류 */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    분류
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                          categoryId === cat.id
                            ? "border-gray-800 opacity-100"
                            : "border-transparent opacity-60"
                        }`}
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
                  메모
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="내용 (선택사항)"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-gray-800 transition-colors resize-none bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                />
              </div>

              {/* 취소 처리 (수정 모드만) */}
              {editingEvent && !isNote && (
                <button
                  onClick={() => setIsCancelled((v) => !v)}
                  className={`w-full py-2 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    isCancelled
                      ? "border-gray-400 bg-gray-100 text-gray-500 line-through"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-gray-400"
                  }`}
                >
                  <span>{isCancelled ? "취소됨 — 되돌리기" : "일정 취소 처리"}</span>
                </button>
              )}

              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
              >
                저장
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
