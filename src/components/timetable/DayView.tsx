'use client';

import { useRef } from 'react';
import { HOURS, ROW_HEIGHT, isToday, getSegmentsForHour, getNotesForHour } from '@/lib/timeUtils';
import EventBlock from './EventBlock';
import NoteBlock from './NoteBlock';
import NowLine from './NowLine';
import DragPreview from './DragPreview';
import { useDragCreate } from '@/lib/hooks/useDragCreate';
import type { Event } from '@/types';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

type Props = {
  dateStr: string;
  events: Event[];
  onEventClick: (event: Event) => void;
  onCellClick: (dateStr: string, hour: number) => void;
  onDragCreate?: (dateStr: string, startMin: number, endMin: number) => void;
};

export default function DayView({
  dateStr, events, onEventClick, onCellClick, onDragCreate,
}: Props) {
  const regularEvents = events.filter((e) => e.date === dateStr && !e.is_note);
  const notes = events.filter((e) => e.date === dateStr && e.is_note);
  const columnRef = useRef<HTMLDivElement>(null);

  const { dragState, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useDragCreate((date, start, end) => {
      onDragCreate?.(date, start, end);
    });

  return (
    <div className="rounded-2xl border overflow-hidden mx-4 bg-[var(--surface)] border-[var(--border)]">
      {/* 날짜 헤더 */}
      <div
        className="grid border-b-2 border-[var(--border)]"
        style={{ gridTemplateColumns: '52px 1fr' }}
      >
        <div />
        <div
          className={`py-1.5 text-center border-l border-[var(--border)] ${isToday(dateStr) ? 'bg-gray-50 dark:bg-[#2C2820]' : ''}`}
        >
          <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
            {dayjs(dateStr).format('ddd')}
          </div>
          <div
            className={`text-base font-serif leading-tight mt-0.5 ${
              isToday(dateStr)
                ? 'w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs [background:var(--accent)] [color:var(--accent-fg)]'
                : ''
            }`}
          >
            {dayjs(dateStr).date()}
          </div>
        </div>
      </div>

      {/* 시간 그리드 */}
      <div className="grid" style={{ gridTemplateColumns: '52px 1fr' }}>
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

        {/* 이벤트 컬럼 */}
        <div
          ref={columnRef}
          className="relative select-none"
          onMouseDown={(e) => columnRef.current && onMouseDown(e, dateStr, columnRef.current)}
          onMouseMove={(e) => columnRef.current && onMouseMove(e, columnRef.current)}
          onMouseUp={(e) => columnRef.current && onMouseUp(e, onCellClick, columnRef.current)}
          onMouseLeave={onMouseLeave}
        >
          {HOURS.map((h) => {
            const segs = getSegmentsForHour(regularEvents, h);
            const noteSegs = getNotesForHour(notes, h);
            return (
              <div
                key={h}
                className="relative border-b border-[var(--border-subtle)] transition-colors cursor-crosshair"
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
                {noteSegs.map(({ event, leftPct }) => (
                  <NoteBlock
                    key={event.id}
                    event={event}
                    leftPct={leftPct}
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
      </div>
    </div>
  );
}
