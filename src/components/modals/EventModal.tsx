"use client";

import { useState, useEffect } from "react";
import { useEscClose } from "@/lib/hooks/useEscClose";
import { X, Trash2 } from "lucide-react";
import { minToTime, timeToMin } from "@/lib/timeUtils";
import dayjs from "dayjs";
import type { Event, Category, RecurrenceType } from "@/types";
import type { EventPayload } from "@/lib/hooks/useEvents";

export type UpdateMode = "single" | "future" | "all";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: EventPayload, updateMode?: UpdateMode) => void;
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
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<EventPayload | null>(null);
  const [modalTab, setModalTab] = useState<"regular" | "fixed">("regular");

  // 고정 일정 전용 상태
  const [fixedDays, setFixedDays] = useState<number[]>([]);
  const [fixedStart, setFixedStart] = useState("09:00");
  const [fixedEnd, setFixedEnd] = useState("10:00");
  const [fixedTitle, setFixedTitle] = useState("");
  const [fixedNote, setFixedNote] = useState("");
  const [fixedCategoryId, setFixedCategoryId] = useState<string | null>(null);
  const [fixedRecurrenceEnd, setFixedRecurrenceEnd] = useState("");

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
      setRecurrenceDays(editingEvent.recurrence_days ?? []);
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
      setRecurrenceDays([]);
      setRecurrenceEnd("");
    }
    setError(null);
    setShowDeleteConfirm(false);
    setShowUpdateConfirm(false);
    setPendingPayload(null);
    // 고정 일정 탭 초기화
    setModalTab("regular");
    setFixedTitle("");
    setFixedNote("");
    setFixedDays([]);
    setFixedStart("09:00");
    setFixedEnd("10:00");
    setFixedCategoryId(categories[0]?.id ?? null);
    setFixedRecurrenceEnd("");
  }, [isOpen, editingEvent, defaultDate, defaultHour, defaultStartMin, defaultEndMin]);

  function handleQuickCancel() {
    if (!editingEvent) return;
    const startMin = timeToMin(startTime);
    const endMin = timeToMin(endTime);
    const payload: EventPayload = {
      title: editingEvent.title,
      note: editingEvent.note ?? "",
      date: editingEvent.date,
      start_min: startMin,
      end_min: endMin,
      category_id: editingEvent.category_id,
      is_note: editingEvent.is_note,
      is_allday: editingEvent.is_allday,
      is_cancelled: !editingEvent.is_cancelled,
      recurrence_type: "none",
      recurrence_days: null,
      recurrence_end_date: null,
    };
    onSave(payload, "single");
    onClose();
  }

  function handleSaveFixed() {
    if (!fixedTitle.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (fixedDays.length === 0) {
      setError("요일을 하나 이상 선택해주세요.");
      return;
    }
    const startMin = timeToMin(fixedStart);
    const endMin = timeToMin(fixedEnd);
    if (endMin <= startMin) {
      setError("종료 시간은 시작 시간보다 늦어야 해요.");
      return;
    }
    // 첫 번째 선택 요일에 해당하는 가장 가까운 날짜를 date로 설정
    const today = dayjs();
    const todayDay = today.day();
    const firstDay = fixedDays.sort((a, b) => a - b)[0];
    const diff = (firstDay - todayDay + 7) % 7;
    const firstDate = today.add(diff === 0 ? 0 : diff, "day").format("YYYY-MM-DD");
    const payload: EventPayload = {
      title: fixedTitle.trim(),
      note: fixedNote,
      date: firstDate,
      start_min: startMin,
      end_min: endMin,
      category_id: fixedCategoryId,
      is_note: false,
      is_allday: false,
      is_cancelled: false,
      recurrence_type: "weekly",
      recurrence_days: fixedDays,
      recurrence_end_date: fixedRecurrenceEnd || null,
    };
    onSave(payload);
    onClose();
  }

  function handleRecurrenceChange(val: RecurrenceType) {
    setRecurrence(val);
    if (val === "weekly" && recurrenceDays.length === 0) {
      setRecurrenceDays([dayjs(date).day()]);
    }
  }

  function toggleRecurrenceDay(day: number) {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

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
    if (recurrence === "weekly" && recurrenceDays.length === 0) {
      setError("반복 요일을 하나 이상 선택해주세요.");
      return;
    }

    const payload: EventPayload = {
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
      recurrence_days: recurrence === "weekly" ? recurrenceDays : null,
      recurrence_end_date: recurrenceEnd || null,
    };

    // 반복 일정 수정 시 선택 다이얼로그
    if (editingEvent?.recurrence_group_id) {
      setPendingPayload(payload);
      setShowUpdateConfirm(true);
      return;
    }

    onSave(payload);
    onClose();
  }

  function handleUpdateConfirm(mode: UpdateMode) {
    if (!pendingPayload) return;
    onSave(pendingPayload, mode);
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

        {/* 수정 범위 선택 (반복 일정인 경우) */}
        {showUpdateConfirm ? (
          <div className="px-6 py-6 space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              어떤 일정을 수정할까요?
            </p>
            <button
              onClick={() => handleUpdateConfirm("single")}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors text-left px-4"
            >
              이 일정만 수정
            </button>
            <button
              onClick={() => handleUpdateConfirm("future")}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors text-left px-4"
            >
              이 일정 이후 모두 수정
            </button>
            <button
              onClick={() => handleUpdateConfirm("all")}
              className="w-full py-2.5 rounded-xl border border-[var(--point)] text-sm font-medium text-[var(--point)] hover:opacity-80 transition-colors text-left px-4"
            >
              반복 일정 전체 수정
            </button>
            <button
              onClick={() => setShowUpdateConfirm(false)}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        ) : showDeleteConfirm && editingEvent?.recurrence_group_id ? (
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
              {/* 오늘 휴강 빠른 취소 — 반복 일정 수정 시에만 노출 */}
              {editingEvent?.recurrence_group_id && !editingEvent.is_note && (
                <button
                  onClick={handleQuickCancel}
                  className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
                    editingEvent.is_cancelled
                      ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "border-dashed border-amber-300 text-amber-600 hover:bg-amber-50"
                  }`}
                >
                  {editingEvent.is_cancelled ? "↩ 휴강 취소 — 수업 복원" : "오늘 휴강 처리"}
                </button>
              )}

              {/* 모달 탭 — 일반 일정 / 고정 일정 */}
              {!editingEvent && (
                <div className="flex p-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <button
                    onClick={() => setModalTab("regular")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      modalTab === "regular"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    일반 일정
                  </button>
                  <button
                    onClick={() => setModalTab("fixed")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      modalTab === "fixed"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    고정 일정
                  </button>
                </div>
              )}

              {/* 고정 일정 폼 */}
              {modalTab === "fixed" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">제목</label>
                    <input
                      type="text"
                      value={fixedTitle}
                      onChange={(e) => setFixedTitle(e.target.value)}
                      placeholder="예) 알고리즘, 영어회화"
                      autoFocus
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      요일 <span className="text-gray-300 normal-case font-normal">(복수 선택 가능)</span>
                    </label>
                    <div className="flex gap-1.5">
                      {["일","월","화","수","목","금","토"].map((label, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            setFixedDays((prev) =>
                              prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort()
                            )
                          }
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            fixedDays.includes(idx)
                              ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                              : "border-[var(--border)] text-[var(--text-muted)] hover:border-gray-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">시작</label>
                      <input
                        type="time"
                        value={fixedStart}
                        onChange={(e) => setFixedStart(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">종료</label>
                      <input
                        type="time"
                        value={fixedEnd}
                        onChange={(e) => setFixedEnd(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                      />
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">분류</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setFixedCategoryId(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                              fixedCategoryId === cat.id ? "border-gray-800 opacity-100" : "border-transparent opacity-60"
                            }`}
                            style={{ background: cat.color + "99" }}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      반복 종료일 <span className="text-gray-300 normal-case font-normal">(미설정 시 3개월)</span>
                    </label>
                    <input
                      type="date"
                      value={fixedRecurrenceEnd}
                      onChange={(e) => setFixedRecurrenceEnd(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">메모</label>
                    <textarea
                      value={fixedNote}
                      onChange={(e) => setFixedNote(e.target.value)}
                      placeholder="강의실, 담당 교수 등 (선택사항)"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
                    />
                  </div>

                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                </>
              ) : (
                <>
                  {/* 일반 일정 타입 선택 (일정/메모) */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsNote(false)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        !isNote
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                          : "border-[var(--border)] text-gray-400 hover:border-gray-400"
                      }`}
                    >
                      일정
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      날짜
                    </label>
                    {!isNote && (
                      <button
                        onClick={() => setIsAllday((v) => !v)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          isAllday
                            ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                        }`}
                      >
                        종일
                      </button>
                    )}
                  </div>
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
                      onClick={() => handleRecurrenceChange(opt.value)}
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

                {/* 매주 요일 선택 */}
                {recurrence === "weekly" && (
                  <div className="mt-2 flex gap-1.5">
                    {["일","월","화","수","목","금","토"].map((label, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleRecurrenceDay(idx)}
                        className={`w-8 h-8 rounded-full text-xs font-semibold border-2 transition-all ${
                          recurrenceDays.includes(idx)
                            ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                            : "border-gray-200 text-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

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
                </>
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
                onClick={modalTab === "fixed" ? handleSaveFixed : handleSave}
                className="flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "var(--point)", color: "var(--point-fg)" }}
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
