import { useEffect, useRef } from "react";
import { HOURS, ROW_HEIGHT } from "@/lib/timeUtils";

export function useScrollToNow(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!containerRef.current) return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 현재 시간이 타임테이블 범위(05~01)인지 확인
    const HOUR_START = 5;
    let rowIndex: number;
    if (hour === 0) rowIndex = 19;
    else if (hour === 1) rowIndex = 20;
    else if (hour < HOUR_START)
      return; // 범위 밖
    else rowIndex = hour - HOUR_START;

    const topPx = rowIndex * ROW_HEIGHT + (minute / 60) * ROW_HEIGHT;

    // 화면 중앙에 현재 시간이 오도록 스크롤
    const containerHeight = containerRef.current.clientHeight;
    const scrollTo = topPx - containerHeight / 2 + ROW_HEIGHT;

    containerRef.current.scrollTo({
      top: Math.max(0, scrollTo),
      behavior: "smooth",
    });
  }, [enabled]);

  return containerRef;
}
