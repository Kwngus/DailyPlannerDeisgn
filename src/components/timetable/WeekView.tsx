'use client';

import { useRef, useMemo } from 'react';
import { getHours, ROW_HEIGHT, getWeekDates, isToday, getSegmentsForHour, getNotesForHour } from '@/lib/timeUtils';
import { useSettingsStore } from '@/store/settingsStore';
import EventBlock from './EventBlock';
import NoteBlock from './NoteBlock';
import NowLine from './NowLine';
import DragPreview from './DragPreview';
import DragMovePreview from './DragMovePreview';
import AllDayRow from './AllDayRow';
import { useDragCreate } from '@/lib/hooks/useDragCreate';
import { useDragMove } from '@/lib/hooks/useDragMove';
import type { Event } from '@/types';
import dayjs from 'dayjs';

type Props = {
  currentDate: string;
  events: Event[];
  onEventClick: (event: Event) => void;
  onCellClick: (dateStr: string, hour: number) => void;
  onDragCreate?: (dateStr: string, startMin: number, endMin: number) => void;
  onMoveEvent?: (id: string, startMin: number, endMin: number) => void;
};

export default function WeekView({
  currentDate, events, onEventClick, onCellClick, onDragCreate, onMoveEvent,
}: Props) {
  const HOURS = getHours();
  const { weekStart } = useSettingsStore();
  const weekDates = getWeekDates(currentDate, weekStart);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 날짜별 이벤트 사전 분류 (매 렌더마다 반복 filter 방지)
  const eventsByDate = useMemo(() => {
    const map: Record<string, { allDay: typeof events; regular: typeof events; notes: typeof events }> = {};
    for (const date of weekDates) {
      map[date] = {
        allDay: events.filter((e) => e.date === date && e.is_allday),
        regular: events.filter((e) => e.date === date && !e.is_note && !e.is_allday),
        notes: events.filter((e) => e.date === date && e.is_note),
      };
    }
    return map;
  }, [events, weekDates]);

  const { dragState, isLongPressed, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useDragCreate((date, start, end) => {
      onDragCreate?.(date, start, end);
    });

  const { draggingId, moveState, onEventMouseDown, onMouseMove: onMoveMouseMove, onMouseUp: onMoveMouseUp, cancelDrag } =
    useDragMove((id, startMin, endMin) => {
      onMoveEvent?.(id, startMin, endMin);
    });

  return (
    <div className="sm:rounded-2xl border overflow-hidden sm:mx-4 bg-[var(--surface)] border-[var(--border)]">
      {/* 요일 헤더 */}
      <div
        className="grid border-b-2 border-[var(--border)]"
        style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
      >
        <div />
        {weekDates.map((dateStr) => (
          <div
            key={dateStr}
            className={`py-1.5 text-center border-l border-[var(--border)] ${isToday(dateStr) ? 'bg-gray-50 dark:bg-[#2C2820]' : ''}`}
          >
            <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              {dayjs(dateStr).format('ddd')}
            </div>
            <div
              className={`text-sm font-serif leading-tight mt-0.5 ${
                isToday(dateStr)
                  ? 'w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs [background:var(--point)] [color:var(--point-fg)]'
                  : ''
              }`}
            >
              {dayjs(dateStr).date()}
            </div>
          </div>
        ))}
      </div>

      {/* 종일 일정 row */}
      {weekDates.some((d) => events.some((e) => e.date === d && e.is_allday)) && (
        <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
          <div className="border-r border-[var(--border)] flex items-center justify-center">
            <span className="text-[8px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">종일</span>
          </div>
          {weekDates.map((dateStr) => {
            const dayAllDay = eventsByDate[dateStr]?.allDay ?? [];
            return (
              <div key={dateStr} className="border-l border-[var(--border)]">
                <AllDayRow events={dayAllDay} onClick={onEventClick} />
              </div>
            );
          })}
        </div>
      )}

      {/* 시간 그리드 */}
      <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
        {/* 시간 라벨 */}
        <div className="border-r border-[var(--border)]">
          {HOURS.map((h) => (
            <div
              key={h}
              className="text-[10px] font-semibold text-gray-400 text-right pr-2 pt-1 tracking-wide"
              style={{ height: `${ROW_HEIGHT}px` }}
            >
              {String(h).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* 날짜별 컬럼 */}
        {weekDates.map((dateStr, di) => {
          const dayEvents = eventsByDate[dateStr]?.regular ?? [];
          const dayNotes = eventsByDate[dateStr]?.notes ?? [];
          return (
            <div
              key={dateStr}
              ref={(el) => { colRefs.current[di] = el; }}
              className="relative border-l border-[var(--border)] select-none"
              onMouseDown={(e) => colRefs.current[di] && onMouseDown(e, dateStr, colRefs.current[di]!)}
              onMouseMove={(e) => { const col = colRefs.current[di]; if (!col) return; onMouseMove(e, col); onMoveMouseMove(e, col); }}
              onMouseUp={(e) => { const col = colRefs.current[di]; if (!col) return; onMouseUp(e, onCellClick, col); onMoveMouseUp(); }}
              onMouseLeave={() => { onMouseLeave(); cancelDrag(); }}
            >
              {HOURS.map((h) => {
                const segs = getSegmentsForHour(dayEvents, h);
                const noteSegs = getNotesForHour(dayNotes, h);
                return (
                  <div
                    key={h}
                    className={`relative border-b border-[var(--border-subtle)] transition-colors ${isLongPressed ? 'cursor-crosshair' : 'cursor-default'}`}
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    {/* 10분 간격 세로선 */}
                    {[10, 20, 30, 40, 50].map((m) => (
                      <div
                        key={m}
                        className="absolute top-0 bottom-0 pointer-events-none"
                        style={{
                          left: `${(m / 60) * 100}%`,
                          width: '1px',
                          background: m === 30 ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                        }}
                      />
                    ))}
                    {segs.map(({ event, leftPct, widthPct, isFirst }) => (
                      <EventBlock
                        key={`${event.id}-${h}`}
                        event={event}
                        leftPct={leftPct}
                        widthPct={widthPct}
                        isFirst={isFirst}
                        onClick={onEventClick}
                        onMouseDown={(e) => { const col = colRefs.current[di]; if (col) onEventMouseDown(e, event, col); }}
                        isDragging={draggingId === event.id}
                      />
                    ))}
                    {noteSegs.map(({ event, leftPct, widthPct, isFirst }) => (
                      <NoteBlock
                        key={`${event.id}-${h}`}
                        event={event}
                        leftPct={leftPct}
                        widthPct={widthPct}
                        isFirst={isFirst}
                        onClick={onEventClick}
                      />
                    ))}
                  </div>
                );
              })}

              {isToday(dateStr) && <NowLine />}

              {/* 드래그 생성 프리뷰 */}
              {dragState?.dateStr === dateStr && dragState.isCreating && (
                <DragPreview dragState={dragState} />
              )}

              {/* 드래그 이동 프리뷰 */}
              {moveState?.event && events.some((ev) => ev.date === dateStr && ev.id === moveState.event.id) && (
                <DragMovePreview moveState={moveState} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
