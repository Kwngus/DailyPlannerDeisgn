"use client";

import { useState, useEffect } from "react";
import { X, Trash2, ChevronDown } from "lucide-react";
import type { Event, Category } from "@/types";
import type { EventPayload } from "@/lib/hooks/useEvents";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: EventPayload) => void;
  onDelete?: () => void;
  categories: Category[];
  defaultDate: string;
  defaultHour?: number;
  editingEvent?: Event | null;
};

const TIME_HOURS = [...Array.from({ length: 19 }, (_, i) => i + 5), 0, 1]; // 5~23, 0, 1
const TIME_MINUTES = [0, 30, 50];

function snapMinute(m: number): number {
  return TIME_MINUTES.reduce((prev, curr) =>
    Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev
  );
}

const SELECT_CLS =
  "w-full rounded-xl border border-gray-200 bg-[#F7F5F0] px-3 py-2.5 text-sm " +
  "outline-none focus:border-gray-800 transition-colors appearance-none cursor-pointer";

function TimeSelect({
  value,
  onChange,
  options,
}: {
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div className="relative flex-1">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={SELECT_CLS}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
  defaultDate,
  defaultHour,
  editingEvent,
}: Props) {
  const [isNote, setIsNote] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startHour, setStartHour] = useState(9);
  const [startMin, setStartMin] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMin, setEndMin] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingEvent) {
      setIsNote(editingEvent.is_note ?? false);
      setTitle(editingEvent.title);
      setNote(editingEvent.note ?? "");
      setDate(editingEvent.date);
      setStartHour(Math.floor(editingEvent.start_min / 60));
      setStartMin(snapMinute(editingEvent.start_min % 60));
      setEndHour(Math.floor(editingEvent.end_min / 60));
      setEndMin(snapMinute(editingEvent.end_min % 60));
      setCategoryId(editingEvent.category_id);
    } else {
      setIsNote(false);
      setTitle("");
      setNote("");
      setDate(defaultDate);
      const h = defaultHour ?? new Date().getHours();
      setStartHour(Math.min(h, 23));
      setStartMin(0);
      setEndHour(Math.min(h + 1, 23));
      setEndMin(0);
      setCategoryId(categories[0]?.id ?? null);
    }
    setError(null);
  }, [isOpen, editingEvent, defaultDate, defaultHour]);

  function handleSave() {
    if (!title.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    const startMinTotal = startHour * 60 + startMin;

    if (!isNote) {
      const endMinTotal = endHour * 60 + endMin;
      if (endMinTotal <= startMinTotal) {
        setError("종료 시간은 시작 시간보다 늦어야 해요.");
        return;
      }
      onSave({
        title: title.trim(),
        note,
        date,
        start_min: startMinTotal,
        end_min: endMinTotal,
        category_id: categoryId,
        is_note: false,
      });
    } else {
      onSave({
        title: title.trim(),
        note: "",
        date,
        start_min: startMinTotal,
        end_min: startMinTotal,
        category_id: null,
        is_note: true,
      });
    }
    onClose();
  }

  if (!isOpen) return null;

  const hourOptions = TIME_HOURS.map((h) => ({
    value: h,
    label: `${String(h).padStart(2, "0")}시`,
  }));
  const minuteOptions = TIME_MINUTES.map((m) => ({
    value: m,
    label: `${String(m).padStart(2, "0")}분`,
  }));

  const isEditing = !!editingEvent;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden
                      animate-[slideUp_0.22s_cubic-bezier(0.34,1.56,0.64,1)]"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {/* 일정 / 메모 탭 — 수정 모드에서는 잠금 */}
          {isEditing ? (
            <h2 className="font-serif text-xl">
              {isNote ? "메모 수정" : "일정 수정"}
            </h2>
          ) : (
            <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
              <button
                onClick={() => { setIsNote(false); setError(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  !isNote ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                }`}
              >
                일정
              </button>
              <button
                onClick={() => { setIsNote(true); setError(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isNote ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                }`}
              >
                메모
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isEditing && onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
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

        {/* 바디 */}
        <div className="px-6 py-4 space-y-4">
          {/* 내용 / 제목 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              {isNote ? "내용" : "제목"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isNote ? "이동, 준비, 휴식..." : "무엇을 할 예정인가요?"}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F7F5F0]
                         text-sm outline-none focus:border-gray-800 transition-colors"
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F7F5F0]
                         text-sm outline-none focus:border-gray-800 transition-colors"
            />
          </div>

          {/* 시간 */}
          {isNote ? (
            /* 메모: 시작 시간만 */
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                위치 (시간)
              </label>
              <div className="flex gap-1.5">
                <TimeSelect value={startHour} onChange={setStartHour} options={hourOptions} />
                <TimeSelect value={startMin} onChange={setStartMin} options={minuteOptions} />
              </div>
            </div>
          ) : (
            /* 일정: 시작 + 종료 */
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  시작
                </label>
                <div className="flex gap-1.5">
                  <TimeSelect value={startHour} onChange={setStartHour} options={hourOptions} />
                  <TimeSelect value={startMin} onChange={setStartMin} options={minuteOptions} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  종료
                </label>
                <div className="flex gap-1.5">
                  <TimeSelect value={endHour} onChange={setEndHour} options={hourOptions} />
                  <TimeSelect value={endMin} onChange={setEndMin} options={minuteOptions} />
                </div>
              </div>
            </div>
          )}

          {/* 분류 — 일정 모드에서만 */}
          {!isNote && categories.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                분류
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                      ${categoryId === cat.id ? "border-gray-800 opacity-100" : "border-transparent opacity-60"}`}
                    style={{ background: cat.color + "99" }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 메모 — 일정 모드에서만 */}
          {!isNote && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                메모
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="내용 (선택사항)"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F7F5F0]
                           text-sm outline-none focus:border-gray-800 transition-colors resize-none"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold
                       text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-2.5 rounded-xl bg-[#1A1714] text-white text-sm font-semibold
                       hover:bg-[#3D3430] transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
