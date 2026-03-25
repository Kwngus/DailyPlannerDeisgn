"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Calendar, CheckSquare } from "lucide-react";
import { useSearch } from "@/lib/hooks/useSearch";
import { usePlannerStore } from "@/store/plannerStore";
import { minToTime } from "@/lib/timeUtils";
import type { Event } from "@/types";
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

export default function SearchModal({ isOpen, onClose, onEventClick }: Props) {
  const { query, results, loading, search, clear } = useSearch();
  const { setCurrentDate, setViewMode } = usePlannerStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      clear();
    }
  }, [isOpen]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => search(val), 300);
    setDebounceTimer(timer);
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

  const hasResults = results.events.length > 0 || results.todos.length > 0;
  const searched = query.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.2s_cubic-bezier(0.34,1.56,0.64,1)]">
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="일정이나 할 일 검색..."
            onChange={handleInput}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* 결과 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!searched ? (
            <div className="py-12 text-center">
              <Search size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">제목, 메모로 검색해보세요</p>
            </div>
          ) : !hasResults && !loading ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-600">"{query}"</span>{" "}
                에 대한 결과가 없어요
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* 일정 결과 */}
              {results.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      일정 {results.events.length}개
                    </span>
                  </div>
                  {results.events.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => handleEventClick(ev)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      {/* 분류 색상 점 */}
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: ev.category?.color
                            ? hexToRgba(ev.category.color, 0.9)
                            : "#FFD250",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {highlightText(ev.title, query)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {dayjs(ev.date).format("M월 D일 dddd")} ·{" "}
                          {minToTime(ev.start_min)}–{minToTime(ev.end_min)}
                          {ev.category && (
                            <span
                              className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                              style={{
                                background: hexToRgba(ev.category.color, 0.2),
                              }}
                            >
                              {ev.category.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 구분선 */}
              {results.events.length > 0 && results.todos.length > 0 && (
                <div className="border-t border-gray-100 my-1" />
              )}

              {/* 할 일 결과 */}
              {results.todos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <CheckSquare size={12} className="text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      할 일 {results.todos.length}개
                    </span>
                  </div>
                  {results.todos.map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() =>
                        todo.due_date
                          ? handleTodoDateClick(todo.due_date)
                          : onClose()
                      }
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
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
                            todo.is_done
                              ? "line-through text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {highlightText(todo.title, query)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {todo.due_date
                            ? dayjs(todo.due_date).format("M월 D일") + " 마감"
                            : "날짜 없음"}
                          {todo.category && (
                            <span
                              className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                              style={{
                                background: hexToRgba(todo.category.color, 0.2),
                              }}
                            >
                              {todo.category.name}
                            </span>
                          )}
                        </p>
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

// 검색어 하이라이트
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
