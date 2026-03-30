import type { Event } from "@/types";
import dayjs from "dayjs";
import { useSettingsStore } from "@/store/settingsStore";

export const HOURS = [...Array.from({ length: 19 }, (_, i) => i + 5), 0, 1]; // 05~23, 00, 01
export const HOUR_START = 5;
export const ROW_HEIGHT = 56; // px per hour

/** settingsStore의 timetableStart 기준으로 19시간 배열 반환 */
export function getHours(): number[] {
  const start = useSettingsStore.getState().timetableStart;
  return Array.from({ length: 19 }, (_, i) => (start + i) % 24);
}

/** getHours()의 첫 번째 값 (HOUR_START 대신 동적으로 사용) */
export function getHourStart(): number {
  return useSettingsStore.getState().timetableStart;
}
export const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function minToTime(min: number, format: "24h" | "12h" = "24h"): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (format === "12h") {
    const period = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getWeekDates(dateStr: string, weekStart: "sun" | "mon" = "sun"): string[] {
  const date = new Date(dateStr);
  const dow = date.getDay();
  const startOffset = weekStart === "mon" ? (dow === 0 ? -6 : 1 - dow) : -dow;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(date.getDate() + startOffset + i);
    return d.toISOString().slice(0, 10);
  });
}

export function isToday(dateStr: string): boolean {
  return dateStr === dayjs().format("YYYY-MM-DD");
}

/** 이벤트를 시간 행(hour)별로 분할한 세그먼트를 반환 */
export function getSegmentsForHour(
  events: Event[],
  hour: number
): Array<{ event: Event; leftPct: number; widthPct: number; isFirst: boolean }> {
  const result: Array<{ event: Event; leftPct: number; widthPct: number; isFirst: boolean }> = [];
  for (const event of events) {
    const startHour = Math.floor(event.start_min / 60);
    const endHour = Math.floor(event.end_min / 60);
    if (hour < startHour || hour > endHour) continue;

    const rowStart = hour * 60;
    const segStart = Math.max(event.start_min, rowStart);
    const segEnd = Math.min(event.end_min, rowStart + 60);
    if (segEnd <= segStart) continue;

    result.push({
      event,
      leftPct: ((segStart - rowStart) / 60) * 100,
      widthPct: ((segEnd - segStart) / 60) * 100,
      isFirst: hour === startHour,
    });
  }
  return result;
}

/** 메모를 시간 행(hour)별로 분할한 세그먼트를 반환 */
export function getNotesForHour(
  notes: Event[],
  hour: number
): Array<{ event: Event; leftPct: number; widthPct: number; isFirst: boolean }> {
  const result: Array<{ event: Event; leftPct: number; widthPct: number; isFirst: boolean }> = [];
  for (const note of notes) {
    const startHour = Math.floor(note.start_min / 60);
    const endHour = Math.floor(note.end_min / 60);
    if (hour < startHour || hour > endHour) continue;

    const rowStart = hour * 60;
    const segStart = Math.max(note.start_min, rowStart);
    const segEnd = Math.min(note.end_min, rowStart + 60);
    if (segEnd <= segStart) continue;

    result.push({
      event: note,
      leftPct: ((segStart - rowStart) / 60) * 100,
      widthPct: ((segEnd - segStart) / 60) * 100,
      isFirst: hour === startHour,
    });
  }
  return result;
}

