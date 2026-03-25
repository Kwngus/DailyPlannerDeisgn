'use client'

import { useState } from 'react'
import { usePlannerStore } from '@/store/plannerStore'
import { useEvents } from '@/lib/hooks/useEvents'
import type { EventPayload } from '@/lib/hooks/useEvents'
import { useCategories } from '@/lib/hooks/useCategories'
import DayView from '@/components/timetable/DayView'
import WeekView from '@/components/timetable/WeekView'
import MonthView from '@/components/timetable/MonthView'
import EventModal from '@/components/modals/EventModal'
import TodoPanel from '@/components/todos/TodoPanel'
import Fab from '@/components/layout/Fab'
import type { Event } from '@/types'

export default function AppPage() {
  const { viewMode, currentDate } = usePlannerStore()
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEvents(currentDate, viewMode)
  const { categories } = useCategories()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [defaultDate, setDefaultDate] = useState(currentDate)
  const [defaultHour, setDefaultHour] = useState<number | undefined>()

  function openAddModal(dateStr: string, hour: number) {
    setSelectedEvent(null)
    setDefaultDate(dateStr)
    setDefaultHour(hour)
    setModalOpen(true)
  }

  function openEditModal(event: Event) {
    setSelectedEvent(event)
    setDefaultDate(event.date)
    setModalOpen(true)
  }

  async function handleSave(payload: EventPayload) {
    if (selectedEvent) await updateEvent(selectedEvent.id, payload)
    else await addEvent(payload)
  }

  async function handleDelete() {
    if (selectedEvent) await deleteEvent(selectedEvent.id)
  }

  return (
    <div className={`flex gap-3 p-3 pb-4 ${
      viewMode === 'month' ? 'h-auto min-h-[calc(100vh-56px)]' : 'h-[calc(100vh-56px)]'
    }`}>

      {/* 타임테이블 / 캘린더 */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {viewMode === 'month' ? (
          <MonthView currentDate={currentDate} />
        ) : loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : viewMode === 'day' ? (
          <DayView
            dateStr={currentDate} events={events}
            onEventClick={openEditModal} onCellClick={openAddModal}
          />
        ) : (
          <WeekView
            currentDate={currentDate} events={events}
            onEventClick={openEditModal} onCellClick={openAddModal}
          />
        )}
      </div>

      {/* Todo 패널 — 데스크탑, month 뷰 아닐 때만 표시 */}
      {viewMode !== 'month' && (
        <div className="hidden lg:flex flex-col w-72 flex-shrink-0">
          <TodoPanel />
        </div>
      )}

      {/* FAB — month 뷰에선 숨김 */}
      {viewMode !== 'month' && (
        <Fab onClick={() => openAddModal(currentDate, new Date().getHours())} />
      )}

      <EventModal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={selectedEvent ? handleDelete : undefined}
        categories={categories} defaultDate={defaultDate}
        defaultHour={defaultHour} editingEvent={selectedEvent}
      />
    </div>
  )
}
