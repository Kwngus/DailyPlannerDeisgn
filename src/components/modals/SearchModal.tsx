"use client";

import { useEffect, useRef, useState } from "react";
import { useEscClose } from "@/lib/hooks/useEscClose";
import { Search, X, Calendar, CheckSquare } from "lucide-react";
import { useSearch } from "@/lib/hooks/useSearch";
import { useCategories } from "@/lib/hooks/useCategories";
import { usePlannerStore } from "@/store/plannerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { minToTime } from "@/lib/timeUtils";
import type { Event, Category } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEventClick: (event: Event) => void;
};

function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function SearchModal({ isOpen, onClose, onEventClick }: Props) {
  const { query, results, loading, search, clear } = useSearch();
  const { categories } = useCategories();
  const { setCurrentDate, setViewMode } = usePlannerStore();
  const { timeFormat } = useSettingsStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      clear();
      setInputValue("");
      setSelectedCategoryId(null);
    }
  }, [isOpen]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => search(val, selectedCategoryId), 300);
    setDebounceTimer(timer);
  }

  function handleCategorySelect(id: string | null) {
    const newId = selectedCategoryId === id ? null : id;
    setSelectedCategoryId(newId);
    // 분류 변경 시 현재 검색어와 함께 다시 검색
    search(inputValue, newId);
  }

  function handleEventClick(event: Event) {
    setCurrentDate(event.date);
    setViewMode("day");
    onEventClick(event);
    onClose();
  }

  function handleTodoDateClick(date: string) {
    setCurrentDate(date);
    setViewMode("day");
    onClose();
  }

  // 분류 필터 적용
  const filteredEvents = selectedCategoryId
    ? results.events.filter((e) => e.category_id === selectedCategoryId)
    : results.events;

  const filteredTodos = selectedCategoryId
    ? results.todos.filter((t) => t.category_id === selectedCategoryId)
    : results.todos;

  const hasResults = filteredEvents.length > 0 || filteredTodos.length > 0;
  const searched = query.trim().length > 0 || selectedCategoryId !== null;

  useEscClose(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ background: "var(--surface)" }}
      >
        {/* 검색 입력 */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder="일정이나 할 일 검색..."
            onChange={handleInput}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "var(--text)" }}
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />
          )}
          {(inputValue || selectedCategoryId) && (
            <button
              onClick={() => {
                setInputValue("");
                setSelectedCategoryId(null);
                clear();
              }}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* 분류 필터 */}
        {categories.length > 0 && (
          <div
            className="px-4 py-2.5 border-b flex gap-2 flex-wrap"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ${
                selectedCategoryId === null
                  ? "border-gray-800 bg-gray-800 text-white dark:border-gray-200 dark:bg-gray-200 dark:text-gray-900"
                  : "border-transparent text-gray-400 hover:border-gray-300"
              }`}
              style={{
                borderColor:
                  selectedCategoryId === null ? "var(--accent)" : undefined,
              }}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ${
                  selectedCategoryId === cat.id
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-75"
                }`}
                style={{
                  background: hexToRgba(cat.color, 0.3),
                  borderColor:
                    selectedCategoryId === cat.id ? cat.color : "transparent",
                  color: "var(--text)",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* 결과 */}
        <div className="max-h-[55vh] overflow-y-auto">
          {!searched ? (
            <div className="py-12 text-center">
              <Search size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                제목, 메모로 검색하거나 분류를 선택해보세요
              </p>
            </div>
          ) : !hasResults && !loading ? (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {selectedCategoryId && !query ? (
                  "해당 분류의 결과가 없어요"
                ) : (
                  <>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      "{query}"
                    </span>{" "}
                    에 대한 결과가 없어요
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* 일정 결과 */}
              {filteredEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      일정 {filteredEvents.length}개
                    </span>
                  </div>
                  {filteredEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => handleEventClick(ev)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left hover:bg-gray-50 dark:hover:bg-[#2C2820]"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: ev.category?.color
                            ? hexToRgba(ev.category.color, 0.9)
                            : "#FFD250",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {highlightText(ev.title, query)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {dayjs(ev.date).format("M월 D일 dddd")} ·{" "}
                            {minToTime(ev.start_min, timeFormat)}–{minToTime(ev.end_min, timeFormat)}
                          </span>
                          {ev.category && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: hexToRgba(ev.category.color, 0.2),
                                color: "var(--text)",
                              }}
                            >
                              {ev.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 구분선 */}
              {filteredEvents.length > 0 && filteredTodos.length > 0 && (
                <div
                  className="border-t my-1"
                  style={{ borderColor: "var(--border)" }}
                />
              )}

              {/* 할 일 결과 */}
              {filteredTodos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <CheckSquare size={12} className="text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      할 일 {filteredTodos.length}개
                    </span>
                  </div>
                  {filteredTodos.map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() =>
                        todo.due_date
                          ? handleTodoDateClick(todo.due_date)
                          : onClose()
                      }
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left hover:bg-gray-50 dark:hover:bg-[#2C2820]"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 border-2 ${
                          todo.is_done
                            ? "bg-gray-300 border-gray-300"
                            : "border-gray-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            todo.is_done ? "line-through text-gray-400" : ""
                          }`}
                          style={{
                            color: todo.is_done ? undefined : "var(--text)",
                          }}
                        >
                          {highlightText(todo.title, query)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {todo.due_date
                              ? dayjs(todo.due_date).format("M월 D일") + " 마감"
                              : "날짜 없음"}
                          </span>
                          {todo.category && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: hexToRgba(todo.category.color, 0.2),
                                color: "var(--text)",
                              }}
                            >
                              {todo.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          todo.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : todo.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {todo.priority === "high"
                          ? "높음"
                          : todo.priority === "medium"
                            ? "보통"
                            : "낮음"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
