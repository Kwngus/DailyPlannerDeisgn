import type { Event } from "@/types";

export const HOURS = [...Array.from({ length: 19 }, (_, i) => i + 5), 0, 1]; // 05~23, 00, 01
export const HOUR_START = 5;
export const ROW_HEIGHT = 56; // px per hour
export const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getWeekDates(dateStr: string): string[] {
  const date = new Date(dateStr);
  const dow = date.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(date.getDate() - dow + i);
    return d.toISOString().slice(0, 10);
  });
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
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

/** 메모를 시간 행(hour)별로 필터링 + 가로 위치 반환 */
export function getNotesForHour(
  notes: Event[],
  hour: number
): Array<{ event: Event; leftPct: number }> {
  return notes
    .filter((n) => Math.floor(n.start_min / 60) === hour)
    .map((n) => ({
      event: n,
      leftPct: ((n.start_min % 60) / 60) * 100,
    }));
}

/** 시간 → 행 인덱스 (05~23: 0~18, 00: 19, 01: 20) */
function hourToRowIndex(hour: number): number {
  return hour >= HOUR_START ? hour - HOUR_START : 24 - HOUR_START + hour;
}

/** NowLine 위치: 현재 시간 행의 top(px)과 분 위치(%) */
export function getNowLinePos(): { topPx: number; leftPct: number } | null {
  const now = new Date();
  const hour = now.getHours();
  if (hour > 1 && hour < HOUR_START) return null; // 02~04시는 표시 안 함
  return {
    topPx: hourToRowIndex(hour) * ROW_HEIGHT,
    leftPct: (now.getMinutes() / 60) * 100,
  };
}
