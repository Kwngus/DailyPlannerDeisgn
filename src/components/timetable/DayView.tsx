"use client";

import { HOURS, ROW_HEIGHT, isToday, getSegmentsForHour, getNotesForHour } from "@/lib/timeUtils";
import EventBlock from "./EventBlock";
import NoteBlock from "./NoteBlock";
import NowLine from "./NowLine";
import type { Event } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

type Props = {
  dateStr: string;
  events: Event[];
  onEventClick: (event: Event) => void;
  onCellClick: (dateStr: string, hour: number) => void;
};

export default function DayView({
  dateStr,
  events,
  onEventClick,
  onCellClick,
}: Props) {
  const regularEvents = events.filter((e) => e.date === dateStr && !e.is_note);
  const notes = events.filter((e) => e.date === dateStr && e.is_note);

  return (
    <div className="rounded-2xl border overflow-hidden mx-4 bg-[var(--surface)] border-[var(--border)]">
      {/* 날짜 헤더 */}
      <div
        className="grid border-b-2 border-[var(--border)]"
        style={{ gridTemplateColumns: "52px 1fr" }}
      >
        <div />
        <div
          className={`py-1.5 text-center border-l border-[var(--border)] ${isToday(dateStr) ? "bg-gray-50 dark:bg-[#2C2820]" : ""}`}
        >
          <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
            {dayjs(dateStr).format("ddd")}
          </div>
          <div
            className={`text-base font-serif leading-tight mt-0.5 ${
              isToday(dateStr)
                ? "w-6 h-6 bg-[#1A1714] text-white rounded-full flex items-center justify-center mx-auto text-xs"
                : ""
            }`}
          >
            {dayjs(dateStr).date()}
          </div>
        </div>
      </div>

      {/* 시간 그리드 */}
      <div className="grid" style={{ gridTemplateColumns: "52px 1fr" }}>
        {/* 시간 라벨 */}
        <div className="border-r border-[var(--border)]">
          {HOURS.map((h) => (
            <div
              key={h}
              className="text-[10px] font-semibold text-gray-400 text-right pr-2 pt-1 tracking-wide"
              style={{ height: `${ROW_HEIGHT}px` }}
            >
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* 이벤트 컬럼: NowLine을 위한 relative 래퍼 */}
        <div className="relative">
          {HOURS.map((h) => {
            const segs = getSegmentsForHour(regularEvents, h);
            const noteSegs = getNotesForHour(notes, h);
            return (
              <div
                key={h}
                className="relative border-b border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[#2C2820] transition-colors cursor-pointer"
                style={{ height: `${ROW_HEIGHT}px` }}
                onClick={() => onCellClick(dateStr, h)}
              >
                {/* 10분 간격 세로선 */}
                {[10, 20, 30, 40, 50].map((m) => (
                  <div
                    key={m}
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{
                      left: `${(m / 60) * 100}%`,
                      width: "1px",
                      background: m === 30 ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
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

          {/* NowLine: 외부 relative에 절대 위치 → 현재 시간 행의 정확한 위치 */}
          {isToday(dateStr) && <NowLine />}
        </div>
      </div>
    </div>
  );
}
