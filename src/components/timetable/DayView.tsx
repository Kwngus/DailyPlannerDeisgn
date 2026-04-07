'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { Copy } from 'lucide-react';
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
  onCopyDay?: (toDate: string) => void;
  label?: string;
};

export default function DayView({
  dateStr, events, onEventClick, onCellClick, onDragCreate, onMoveEvent, onCopyDay, label,
}: Props) {
  const HOURS = getHours();
  const { timeFormat } = useSettingsStore();
  const allDayEvents = useMemo(() => events.filter((e) => e.date === dateStr && e.is_allday), [events, dateStr]);
  const regularEvents = useMemo(() => events.filter((e) => e.date === dateStr && !e.is_note && !e.is_allday), [events, dateStr]);
  const notes = useMemo(() => events.filter((e) => e.date === dateStr && e.is_note), [events, dateStr]);
  const columnRef = useRef<HTMLDivElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const [showCopyPicker, setShowCopyPicker] = useState(false);
  const [copyTarget, setCopyTarget] = useState('');
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);

  function openCopyPicker() {
    const rect = copyBtnRef.current?.getBoundingClientRect();
    if (rect) {
      const POPUP_WIDTH = 220;
      const left = Math.min(rect.right - POPUP_WIDTH, window.innerWidth - POPUP_WIDTH - 8);
      setPickerPos({ top: rect.bottom + 6, left: Math.max(8, left) });
    }
    setShowCopyPicker((v) => !v);
  }

  function handleCopySubmit() {
    if (!copyTarget || !onCopyDay) return;
    onCopyDay(copyTarget);
    setShowCopyPicker(false);
    setCopyTarget('');
  }

  // 팝업 외부 클릭 시 닫기
  useEffect(() => {
    if (!showCopyPicker) return;
    function handleOutside(e: MouseEvent) {
      if (copyBtnRef.current?.contains(e.target as Node)) return;
      setShowCopyPicker(false);
      setCopyTarget('');
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showCopyPicker]);

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
          className={`py-1.5 text-center border-l border-[var(--border)] relative ${isToday(dateStr) ? 'bg-gray-50 dark:bg-[#2C2820]' : ''}`}
        >
          {label && (
            <div className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--point)' }}>
              {label}
            </div>
          )}
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

          {/* 복사 버튼 — onCopyDay prop이 있을 때만 표시 */}
          {onCopyDay && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                ref={copyBtnRef}
                onClick={openCopyPicker}
                title="이 날 일정 복사"
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Copy size={13} />
              </button>
            </div>
          )}

          {/* 날짜 선택 팝업 — portal로 body에 렌더링해 SwipeContainer transform 영향 차단 */}
          {showCopyPicker && pickerPos && createPortal(
            <div
              className="fixed z-[200] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-3 flex flex-col gap-2"
              style={{ top: pickerPos.top, left: pickerPos.left, minWidth: 220 }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-semibold text-[var(--text)] whitespace-nowrap">
                복사할 날짜 선택
              </p>
              <input
                type="date"
                value={copyTarget}
                min={dayjs(dateStr).add(1, 'day').format('YYYY-MM-DD')}
                onChange={(e) => setCopyTarget(e.target.value)}
                className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setShowCopyPicker(false); setCopyTarget(''); }}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCopySubmit}
                  disabled={!copyTarget}
                  className="flex-1 text-xs py-1.5 rounded-lg font-bold transition-colors disabled:opacity-40"
                  style={{ background: 'var(--point)', color: 'var(--point-fg)' }}
                >
                  복사
                </button>
              </div>
            </div>,
            document.body
          )}
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
