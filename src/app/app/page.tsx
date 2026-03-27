"use client";

import { useState, useEffect } from "react";
import { usePlannerStore } from "@/store/plannerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useEvents } from "@/lib/hooks/useEvents";
import { useCategories } from "@/lib/hooks/useCategories";
import { useScrollToNow } from "@/lib/hooks/useScrollToNow";
import DayView from "@/components/timetable/DayView";
import WeekView from "@/components/timetable/WeekView";
import MonthView from "@/components/timetable/MonthView";
import DayViewSkeleton from "@/components/timetable/DayViewSkeleton";
import WeekViewSkeleton from "@/components/timetable/WeekViewSkeleton";
import MonthViewSkeleton from "@/components/timetable/MonthViewSkeleton";
import EventModal from "@/components/modals/EventModal";
import TodoPanel from "@/components/todos/TodoPanel";
import TodoPanelSkeleton from "@/components/todos/TodoPanelSkeleton";
import Fab from "@/components/layout/Fab";
import SwipeContainer from "@/components/ui/SwipeContainer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { Event } from "@/types";
import type { EventPayload } from "@/lib/hooks/useEvents";

export default function AppPage() {
  const { viewMode, currentDate, navigate, setViewMode } = usePlannerStore();
  const { defaultView } = useSettingsStore();

  useEffect(() => {
    setViewMode(defaultView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEvents(
    currentDate,
    viewMode,
  );
  const { categories, loading: catLoading } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [defaultDate, setDefaultDate] = useState(currentDate);
  const [defaultHour, setDefaultHour] = useState<number | undefined>();
  const [dragRange, setDragRange] = useState<{ startMin: number; endMin: number } | null>(null);

  const scrollRef = useScrollToNow(viewMode !== "month" && !loading);

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

  async function handleSave(payload: EventPayload) {
    if (selectedEvent) await updateEvent(selectedEvent.id, payload);
    else await addEvent(payload);
  }

  async function handleDelete(deleteAll: boolean = false) {
    if (selectedEvent) await deleteEvent(selectedEvent.id, deleteAll);
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
    return viewMode === "day" ? (
      <DayView
        dateStr={currentDate}
        events={events}
        onEventClick={openEditModal}
        onCellClick={openAddModal}
        onDragCreate={openDragModal}
      />
    ) : (
      <WeekView
        currentDate={currentDate}
        events={events}
        onEventClick={openEditModal}
        onCellClick={openAddModal}
        onDragCreate={openDragModal}
      />
    );
  }

  return (
    <div
      className={`flex gap-3 p-3 pb-4 ${
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

      {/* Todo 패널 */}
      {viewMode !== "month" && (
        <div className="hidden lg:flex flex-col w-72 flex-shrink-0">
          <ErrorBoundary>
            {catLoading ? <TodoPanelSkeleton /> : <TodoPanel />}
          </ErrorBoundary>
        </div>
      )}

      {viewMode !== "month" && (
        <Fab onClick={() => openAddModal(currentDate, new Date().getHours())} />
      )}

      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setDragRange(null); }}
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
