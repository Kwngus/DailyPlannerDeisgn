'use client';

import { useRef } from 'react';
import { HOURS, ROW_HEIGHT, getWeekDates, isToday, getSegmentsForHour, getNotesForHour } from '@/lib/timeUtils';
import EventBlock from './EventBlock';
import NoteBlock from './NoteBlock';
import NowLine from './NowLine';
import DragPreview from './DragPreview';
import AllDayRow from './AllDayRow';
import { useDragCreate } from '@/lib/hooks/useDragCreate';
import type { Event } from '@/types';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

type Props = {
  currentDate: string;
  events: Event[];
  onEventClick: (event: Event) => void;
  onCellClick: (dateStr: string, hour: number) => void;
  onDragCreate?: (dateStr: string, startMin: number, endMin: number) => void;
};

export default function WeekView({
  currentDate, events, onEventClick, onCellClick, onDragCreate,
}: Props) {
  const weekDates = getWeekDates(currentDate);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { dragState, isLongPressed, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useDragCreate((date, start, end) => {
      onDragCreate?.(date, start, end);
    });

  return (
    <div className="rounded-2xl border overflow-hidden mx-4 bg-[var(--surface)] border-[var(--border)]">
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
                  ? 'w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs [background:var(--accent)] [color:var(--accent-fg)]'
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
            <span className="text-[8px] font-bold tracking-widest text-gray-400 uppercase rotate-[-90deg] whitespace-nowrap">종일</span>
          </div>
          {weekDates.map((dateStr) => {
            const dayAllDay = events.filter((e) => e.date === dateStr && e.is_allday);
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
          const dayEvents = events.filter((e) => e.date === dateStr && !e.is_note && !e.is_allday);
          const dayNotes = events.filter((e) => e.date === dateStr && e.is_note);
          return (
            <div
              key={dateStr}
              ref={(el) => { colRefs.current[di] = el; }}
              className="relative border-l border-[var(--border)] select-none"
              onMouseDown={(e) => colRefs.current[di] && onMouseDown(e, dateStr, colRefs.current[di]!)}
              onMouseMove={(e) => colRefs.current[di] && onMouseMove(e, colRefs.current[di]!)}
              onMouseUp={(e) => colRefs.current[di] && onMouseUp(e, onCellClick, colRefs.current[di]!)}
              onMouseLeave={onMouseLeave}
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
                      />
                    ))}
                    {noteSegs.map(({ event, leftPct, widthPct }) => (
                      <NoteBlock
                        key={event.id}
                        event={event}
                        leftPct={leftPct}
                        widthPct={widthPct}
                        onClick={onEventClick}
                      />
                    ))}
                  </div>
                );
              })}

              {isToday(dateStr) && <NowLine />}

              {/* 드래그 프리뷰 */}
              {dragState?.dateStr === dateStr && dragState.isCreating && (
                <DragPreview dragState={dragState} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
