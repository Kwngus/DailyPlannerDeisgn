import type { Event } from "@/types";

interface PrefetchCache {
  events: Event[];
  datesKey: string;
}

let cache: PrefetchCache | null = null;

export function storePrefetched(events: Event[], dates: string[]) {
  cache = { events, datesKey: dates.join(",") };
}

/** 캐시가 날짜와 일치하면 반환 후 소비(한 번만 사용). 불일치 시 null. */
export function consumePrefetched(dates: string[]): Event[] | null {
  if (!cache) return null;
  if (cache.datesKey !== dates.join(",")) return null;
  const result = cache.events;
  cache = null;
  return result;
}
