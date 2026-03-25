"use client";

import { HOURS, ROW_HEIGHT, getWeekDates, isToday, getSegmentsForHour, getNotesForHour } from "@/lib/timeUtils";
import EventBlock from "./EventBlock";
import NoteBlock from "./NoteBlock";
import NowLine from "./NowLine";
import type { Event } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

type Props = {
  currentDate: string;
  events: Event[];
  onEventClick: (event: Event) => void;
  onCellClick: (dateStr: string, hour: number) => void;
};

export default function WeekView({
  currentDate,
  events,
  onEventClick,
  onCellClick,
}: Props) {
  const weekDates = getWeekDates(currentDate);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mx-4">
      {/* 요일 헤더 */}
      <div
        className="grid border-b-2 border-gray-200"
        style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}
      >
        <div />
        {weekDates.map((dateStr) => (
          <div
            key={dateStr}
            className={`py-1.5 text-center border-l border-gray-200 ${isToday(dateStr) ? "bg-gray-50" : ""}`}
          >
            <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              {dayjs(dateStr).format("ddd")}
            </div>
            <div
              className={`text-sm font-serif leading-tight mt-0.5 ${
                isToday(dateStr)
                  ? "w-6 h-6 bg-[#1A1714] text-white rounded-full flex items-center justify-center mx-auto text-xs"
                  : ""
              }`}
            >
              {dayjs(dateStr).date()}
            </div>
          </div>
        ))}
      </div>

      {/* 시간 그리드 */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}
      >
        {/* 시간 라벨 */}
        <div className="border-r border-gray-200">
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

        {/* 날짜별 컬럼 */}
        {weekDates.map((dateStr) => {
          const dayEvents = events.filter((e) => e.date === dateStr && !e.is_note);
          const dayNotes = events.filter((e) => e.date === dateStr && e.is_note);
          return (
            <div key={dateStr} className="relative border-l border-gray-200">
              {HOURS.map((h) => {
                const segs = getSegmentsForHour(dayEvents, h);
                const noteSegs = getNotesForHour(dayNotes, h);
                return (
                  <div
                    key={h}
                    className="relative border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
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

              {isToday(dateStr) && <NowLine />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
