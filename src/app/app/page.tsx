"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePlannerStore } from "@/store/plannerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useEvents } from "@/lib/hooks/useEvents";
import { useCategories } from "@/lib/hooks/useCategories";
import { useScrollToNow } from "@/lib/hooks/useScrollToNow";
import { useDragSort } from "@/lib/hooks/useDragSort";
import { useDraftEvents } from "@/lib/hooks/useDraftEvents";
import DayViewSkeleton from "@/components/timetable/DayViewSkeleton";
import WeekViewSkeleton from "@/components/timetable/WeekViewSkeleton";
import MonthViewSkeleton from "@/components/timetable/MonthViewSkeleton";
import TodoPanelSkeleton from "@/components/todos/TodoPanelSkeleton";
import SwipeContainer from "@/components/ui/SwipeContainer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { Event } from "@/types";
import type { EventPayload } from "@/lib/hooks/useEvents";

const DayView = dynamic(() => import("@/components/timetable/DayView"), {
  loading: () => <DayViewSkeleton />,
  ssr: false,
});
const WeekView = dynamic(() => import("@/components/timetable/WeekView"), {
  loading: () => <WeekViewSkeleton />,
  ssr: false,
});
const MonthView = dynamic(() => import("@/components/timetable/MonthView"), {
  loading: () => <MonthViewSkeleton />,
  ssr: false,
});
const EventModal = dynamic(() => import("@/components/modals/EventModal"), {
  ssr: false,
});
const TodoPanel = dynamic(() => import("@/components/todos/TodoPanel"), {
  loading: () => <TodoPanelSkeleton />,
  ssr: false,
});
const HabitPanel = dynamic(() => import("@/components/habits/HabitPanel"), {
  ssr: false,
});
const DDayPanel = dynamic(() => import("@/components/ddays/DDayPanel"), {
  ssr: false,
});
const Fab = dynamic(() => import("@/components/layout/Fab"), { ssr: false });

export default function AppPage() {
  const { viewMode, currentDate, navigate, setViewMode, showPlanned, showActual } = usePlannerStore();
  const { defaultView } = useSettingsStore();

  useEffect(() => {
    setViewMode(defaultView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { events, loading, addEvent, updateEvent, moveEvent, deleteEvent, copyDayEvents, getEventCountForDate } = useEvents(
    currentDate,
    viewMode,
  );
  const { categories, loading: catLoading } = useCategories();
  const { draftEvents, addDraftEvent } = useDraftEvents(currentDate, categories, addEvent);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [defaultDate, setDefaultDate] = useState(currentDate);
  const [defaultHour, setDefaultHour] = useState<number | undefined>();
  const [dragRange, setDragRange] = useState<{ startMin: number; endMin: number } | null>(null);
  const [isDraftMode, setIsDraftMode] = useState(false);

  const scrollRef = useScrollToNow(viewMode !== "month" && !loading);

  type PanelItem = { id: "habit" | "dday" | "todo" };
  const DEFAULT_ORDER: PanelItem[] = [{ id: "habit" }, { id: "dday" }, { id: "todo" }];

  const [panelOrder, setPanelOrder] = useState<PanelItem[]>(() => {
    try {
      const saved = localStorage.getItem("sidebar-panel-order");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ORDER;
  });

  const {
    draggingId: panelDraggingId,
    overId: panelOverId,
    handleDragStart: panelDragStart,
    handleDragOver: panelDragOver,
    handleDrop: panelDrop,
    handleDragEnd: panelDragEnd,
  } = useDragSort(panelOrder, (newOrder) => {
    setPanelOrder(newOrder);
    localStorage.setItem("sidebar-panel-order", JSON.stringify(newOrder));
  });

  function openAddModal(dateStr: string, hour: number) {
    setSelectedEvent(null);
    setDefaultDate(dateStr);
    setDefaultHour(hour);
    setModalOpen(true);
  }

  function openDragModal(dateStr: string, startMin: number, endMin: number) {
    setSelectedEvent(null);
    setDefaultDate(dateStr);
    setDefaultHour(Math.floor(startMin / 60));
    setDragRange({ startMin, endMin });
    setModalOpen(true);
  }

  function openEditModal(event: Event) {
    setSelectedEvent(event);
    setDefaultDate(event.date);
    setModalOpen(true);
  }

  async function handleSave(payload: EventPayload, updateMode?: "single" | "future" | "all") {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, payload, updateMode);
    } else if (isDraftMode) {
      await addDraftEvent(payload);
    } else {
      await addEvent(payload);
    }
  }

  async function handleDelete(deleteAll: boolean = false) {
    if (selectedEvent) await deleteEvent(selectedEvent.id, deleteAll);
  }

  async function handleCopyDay(toDate: string) {
    const count = await getEventCountForDate(toDate);
    if (count > 0) {
      const ok = window.confirm(`${toDate}에 이미 ${count}개의 일정이 있어요.\n그래도 추가로 복사할까요?`);
      if (!ok) return;
    }
    await copyDayEvents(currentDate, toDate);
  }

  // 계획 뷰에서 이벤트 추가 시 draft로 저장 + 실제에도 복사
  function openDraftAddModal(dateStr: string, hour: number) {
    setSelectedEvent(null);
    setDefaultDate(dateStr);
    setDefaultHour(hour);
    setIsDraftMode(true);
    setModalOpen(true);
  }

  function openDraftDragModal(dateStr: string, startMin: number, endMin: number) {
    setSelectedEvent(null);
    setDefaultDate(dateStr);
    setDefaultHour(Math.floor(startMin / 60));
    setDragRange({ startMin, endMin });
    setIsDraftMode(true);
    setModalOpen(true);
  }

  function renderTimetable() {
    if (viewMode === "month") {
      return loading ? (
        <MonthViewSkeleton />
      ) : (
        <MonthView currentDate={currentDate} />
      );
    }
    if (loading) {
      return viewMode === "day" ? <DayViewSkeleton /> : <WeekViewSkeleton />;
    }

    // 분할 뷰 (계획 + 실제 동시)
    if (viewMode === "day" && showPlanned && showActual) {
      return (
        <div className="flex gap-0 h-full">
          <div className="flex-1 min-w-0 overflow-y-auto">
            <DayView
              dateStr={currentDate}
              events={draftEvents as Event[]}
              onEventClick={openEditModal}
              onCellClick={openDraftAddModal}
              onDragCreate={openDraftDragModal}
              label="계획"
            />
          </div>
          <div className="w-px bg-[var(--border)] flex-shrink-0" />
          <div className="flex-1 min-w-0 overflow-y-auto">
            <DayView
              dateStr={currentDate}
              events={events}
              onEventClick={openEditModal}
              onCellClick={openAddModal}
              onDragCreate={openDragModal}
              onMoveEvent={moveEvent}
              onCopyDay={handleCopyDay}
              label="실제"
            />
          </div>
        </div>
      );
    }

    if (viewMode === "day") {
      const dayEvents = showPlanned ? (draftEvents as Event[]) : events;
      return (
        <DayView
          dateStr={currentDate}
          events={dayEvents}
          onEventClick={openEditModal}
          onCellClick={showPlanned ? openDraftAddModal : openAddModal}
          onDragCreate={showPlanned ? openDraftDragModal : openDragModal}
          onMoveEvent={showPlanned ? undefined : moveEvent}
          onCopyDay={showPlanned ? undefined : handleCopyDay}
        />
      );
    }

    return (
      <WeekView
        currentDate={currentDate}
        events={events}
        onEventClick={openEditModal}
        onCellClick={openAddModal}
        onDragCreate={openDragModal}
        onMoveEvent={moveEvent}
      />
    );
  }

  return (
    <div
      className={`flex gap-3 pt-3 pb-4 sm:px-3 ${
        viewMode === "month"
          ? "h-auto min-h-[calc(100vh-56px)]"
          : "h-[calc(100vh-56px)]"
      }`}
    >
      {/* 타임테이블 */}
      <SwipeContainer
        onSwipeLeft={() => navigate(1)}
        onSwipeRight={() => navigate(-1)}
        className="flex-1 min-w-0"
      >
        <ErrorBoundary>
          <div ref={scrollRef} className="h-full overflow-y-auto">
            {renderTimetable()}
          </div>
        </ErrorBoundary>
      </SwipeContainer>

      {/* 사이드 패널 — 분할 뷰일 때는 숨김 */}
      {viewMode !== "month" && !(viewMode === "day" && showPlanned && showActual) && (
        <div className="hidden lg:flex flex-col w-72 flex-shrink-0 gap-3 min-h-0">
          {panelOrder.map((panel) => {
            const isTodo = panel.id === "todo";
            const dragHandleProps = {
              draggable: true as const,
              onDragStart: (e: React.DragEvent) => { e.stopPropagation(); panelDragStart(panel); },
              onDragEnd: panelDragEnd,
            };
            return (
              <div
                key={panel.id}
                data-todo-id={panel.id}
                className={`${isTodo ? "flex-1 min-h-0" : ""} transition-opacity ${
                  panelDraggingId === panel.id ? "opacity-40" : ""
                } ${panelOverId === panel.id && panelDraggingId !== panel.id ? "ring-2 ring-[var(--accent)] rounded-2xl" : ""}`}
                onDragOver={(e) => panelDragOver(e, panel.id)}
                onDrop={() => panelDrop(panel.id)}
              >
                <ErrorBoundary>
                  {panel.id === "habit" && <HabitPanel dragHandleProps={dragHandleProps} />}
                  {panel.id === "dday" && <DDayPanel dragHandleProps={dragHandleProps} />}
                  {panel.id === "todo" && (
                    catLoading ? <TodoPanelSkeleton /> : <TodoPanel dragHandleProps={dragHandleProps} />
                  )}
                </ErrorBoundary>
              </div>
            );
          })}
        </div>
      )}

      {viewMode !== "month" && !(viewMode === "day" && showPlanned && showActual) && (
        <Fab onClick={() => openAddModal(currentDate, new Date().getHours())} />
      )}

      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setDragRange(null); setIsDraftMode(false); }}
        onSave={handleSave}
        onDelete={selectedEvent ? handleDelete : undefined}
        categories={categories}
        defaultDate={defaultDate}
        defaultHour={defaultHour}
        defaultStartMin={dragRange?.startMin}
        defaultEndMin={dragRange?.endMin}
        editingEvent={selectedEvent}
      />
    </div>
  );
}
