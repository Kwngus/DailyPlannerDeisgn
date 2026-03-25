import { useRef, useCallback } from "react";

type SwipeOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // 최소 스와이프 거리 (px)
  preventScroll?: boolean;
};

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  preventScroll = false,
}: SwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = false;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return;

      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      // 수직 스크롤 중이면 스와이프 무시
      if (!isDragging.current && Math.abs(dy) > Math.abs(dx)) {
        startX.current = null;
        return;
      }

      isDragging.current = true;

      if (preventScroll && Math.abs(dx) > 10) {
        e.preventDefault();
      }
    },
    [preventScroll],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null) return;

      const dx = e.changedTouches[0].clientX - startX.current;

      if (Math.abs(dx) >= threshold && isDragging.current) {
        if (dx < 0)
          onSwipeLeft?.(); // 왼쪽 스와이프 → 다음
        else onSwipeRight?.(); // 오른쪽 스와이프 → 이전
      }

      startX.current = null;
      startY.current = null;
      isDragging.current = false;
    },
    [onSwipeLeft, onSwipeRight, threshold],
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
