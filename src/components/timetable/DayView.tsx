'use client';

import { useRef, useMemo, useEffect } from 'react';
import { getHours, ROW_HEIGHT, isToday, getSegmentsForHour, getNotesForHour } from '@/lib/timeUtils';
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

const TIME_COL_WIDTH = 56; // px

type Props = {
  dateStr: string;
  events: Event[];
  onEventClick: (event: Event) => void;
  onCellClick: (dateStr: string, hour: number) => void;
  onDragCreate?: (dateStr: string, startMin: number, endMin: number) => void;
  onMoveEvent?: (id: string, startMin: number, endMin: number) => void;
};

export default function DayView({
  dateStr, events, onEventClick, onCellClick, onDragCreate, onMoveEvent,
}: Props) {
  const HOURS = getHours();
  const { timeFormat } = useSettingsStore();
  const allDayEvents = useMemo(() => events.filter((e) => e.date === dateStr && e.is_allday), [events, dateStr]);
  const regularEvents = useMemo(() => events.filter((e) => e.date === dateStr && !e.is_note && !e.is_allday), [events, dateStr]);
  const notes = useMemo(() => events.filter((e) => e.date === dateStr && e.is_note), [events, dateStr]);
  const columnRef = useRef<HTMLDivElement>(null);

  const { dragState, isLongPressed, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd } =
    useDragCreate((date, start, end) => {
      onDragCreate?.(date, start, end);
    });

  // touchmove는 non-passive로 등록해야 long press 후 스크롤을 막을 수 있음
  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;
    const handle = (e: TouchEvent) => onTouchMove(e, el);
    el.addEventListener('touchmove', handle, { passive: false });
    return () => el.removeEventListener('touchmove', handle);
  }, [onTouchMove]);

  const { draggingId, moveState, onEventMouseDown, onMouseMove: onMoveMouseMove, onMouseUp: onMoveMouseUp, cancelDrag } =
    useDragMove((id, startMin, endMin) => {
      onMoveEvent?.(id, startMin, endMin);
    });

  /** 시간 라벨 포맷: 12h 모드일 때 AM/PM 포함 */
  function formatHourLabel(h: number): { main: string; sub: string | null } {
    if (timeFormat === '12h') {
      const period = h < 12 ? 'AM' : 'PM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return { main: String(h12), sub: period };
    }
    return { main: String(h).padStart(2, '0'), sub: null };
  }

  return (
    /* 모바일: 테두리 없이 full-screen / 데스크탑(sm+): 카드 스타일 */
    <div className="sm:rounded-2xl sm:border mr-3 sm:mx-4 overflow-hidden bg-[var(--surface)] sm:border-[var(--border)]">

      {/* 날짜 헤더 — 모바일 숨김 (상단 Header에서 이미 표시) */}
      <div
        className="hidden sm:grid border-b-2 border-[var(--border)]"
        style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px 1fr` }}
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
                ? 'w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs [background:var(--point)] [color:var(--point-fg)]'
                : ''
            }`}
          >
            {dayjs(dateStr).date()}
          </div>
        </div>
      </div>

      {/* 종일 일정 row */}
      {allDayEvents.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px 1fr` }}>
          <div className="border-r border-[var(--border)] flex items-center justify-center">
            <span className="text-[8px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">종일</span>
          </div>
          <AllDayRow events={allDayEvents} onClick={onEventClick} />
        </div>
      )}

      {/* 시간 그리드 — NowLine이 이 컨테이너 기준으로 absolute 배치됨 */}
      <div className="grid" style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px 1fr` }}>

        {/* 시간 라벨 컬럼 */}
        <div className="border-r border-[var(--border)]">
          {HOURS.map((h) => {
            const { main, sub } = formatHourLabel(h);
            return (
              <div
                key={h}
                className="flex flex-col items-end justify-start pr-2 pt-1"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <span className="text-[10px] font-semibold text-gray-400 leading-none tracking-wide">
                  {main}
                </span>
                {sub && (
                  <span className="text-[8px] font-bold text-gray-300 leading-none mt-0.5 sm:hidden">
                    {sub}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 이벤트 컬럼 */}
        <div
          ref={columnRef}
          className="relative select-none"
          onMouseDown={(e) => columnRef.current && onMouseDown(e, dateStr, columnRef.current)}
          onMouseMove={(e) => { if (!columnRef.current) return; onMouseMove(e, columnRef.current); onMoveMouseMove(e, columnRef.current); }}
          onMouseUp={(e) => { if (!columnRef.current) return; onMouseUp(e, onCellClick, columnRef.current); onMoveMouseUp(); }}
          onMouseLeave={() => { onMouseLeave(); cancelDrag(); }}
          onTouchStart={(e) => columnRef.current && onTouchStart(e, dateStr, columnRef.current)}
          onTouchEnd={(e) => columnRef.current && onTouchEnd(e, onCellClick, columnRef.current)}
          onTouchCancel={() => { onMouseLeave(); cancelDrag(); }}
        >
          {HOURS.map((h) => {
            const segs = getSegmentsForHour(regularEvents, h);
            const noteSegs = getNotesForHour(notes, h);
            return (
              <div
                key={h}
                className={`relative border-b border-[var(--border-subtle)] transition-colors ${isLongPressed ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {/* 30분 구분선 — 데스크탑에서만 표시 */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none hidden sm:block"
                  style={{ left: '50%', width: '1px', background: 'rgba(0,0,0,0.06)' }}
                />
                {/* 10·20·40·50분 세로선 — 데스크탑에서만 표시 */}
                {[10, 20, 40, 50].map((m) => (
                  <div
                    key={m}
                    className="absolute top-0 bottom-0 pointer-events-none hidden sm:block"
                    style={{ left: `${(m / 60) * 100}%`, width: '1px', background: 'rgba(0,0,0,0.03)' }}
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
                    onMouseDown={(e) => columnRef.current && onEventMouseDown(e, event, columnRef.current)}
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

          {/* 드래그 생성 프리뷰 */}
          {dragState?.dateStr === dateStr && dragState.isCreating && (
            <DragPreview dragState={dragState} />
          )}

          {/* 드래그 이동 프리뷰 */}
          {moveState && <DragMovePreview moveState={moveState} />}

          {isToday(dateStr) && <NowLine />}
        </div>
      </div>
    </div>
  );
}
