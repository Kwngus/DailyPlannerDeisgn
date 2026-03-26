import { useState, useRef, useCallback } from "react";
import { ROW_HEIGHT } from "@/lib/timeUtils";

export type DragState = {
  dateStr: string;
  startMin: number;
  endMin: number;
  isCreating: boolean;
};

const HOUR_START = 5;
const MIN_DURATION = 10;
const DRAG_THRESHOLD = 6;    // px — 이 이상 움직여야 드래그로 인식
const LONG_PRESS_MS = 350;   // ms — 이 이상 누르면 long press 활성
const CANCEL_MOVE_PX = 10;   // px — long press 전 이 이상 움직이면 스크롤로 간주

export function useDragCreate(
  onComplete: (dateStr: string, startMin: number, endMin: number) => void,
) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const longPressActive = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const anchorMin = useRef(0);
  const dateStrRef = useRef("");
  const dragStateRef = useRef<DragState | null>(null);

  // dragState를 ref에도 동기화 (onMouseUp 클로저 문제 방지)
  function setDragStateSync(s: DragState | null) {
    dragStateRef.current = s;
    setDragState(s);
  }

  function clearTimer() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function fullReset() {
    clearTimer();
    isDragging.current = false;
    hasMoved.current = false;
    longPressActive.current = false;
    setIsLongPressed(false);
    setDragStateSync(null);
  }

  function posToMin(x: number, y: number, containerWidth: number): number {
    const rowIndex = Math.floor(Math.max(0, y) / ROW_HEIGHT);
    const hour = HOUR_START + rowIndex;
    const realHour = hour >= 24 ? hour - 24 : hour;
    const minute = Math.floor(Math.max(0, Math.min(1, x / containerWidth)) * 60);
    return realHour * 60 + minute;
  }

  function snap(min: number, interval = 5): number {
    return Math.round(min / interval) * interval;
  }

  function getOffset(e: React.MouseEvent, container: HTMLDivElement) {
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + container.scrollTop,
    };
  }

  const onMouseDown = useCallback(
    (e: React.MouseEvent, dateStr: string, container: HTMLDivElement) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("[data-event-block]")) return;

      e.preventDefault();
      isDragging.current = true;
      hasMoved.current = false;
      longPressActive.current = false;
      mouseDownPos.current = { x: e.clientX, y: e.clientY };
      dateStrRef.current = dateStr;

      const { x, y } = getOffset(e, container);
      anchorMin.current = snap(posToMin(x, y, container.clientWidth));

      // long press 타이머 시작
      longPressTimer.current = setTimeout(() => {
        longPressActive.current = true;
        setIsLongPressed(true);
      }, LONG_PRESS_MS);
    },
    [],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent, container: HTMLDivElement) => {
      if (!isDragging.current) return;

      const dx = Math.abs(e.clientX - mouseDownPos.current.x);
      const dy = Math.abs(e.clientY - mouseDownPos.current.y);

      if (!longPressActive.current) {
        // long press 전 — 많이 움직이면 스크롤로 간주하고 취소
        if (dx > CANCEL_MOVE_PX || dy > CANCEL_MOVE_PX) {
          clearTimer();
          isDragging.current = false;
        }
        return;
      }

      // long press 활성 — 드래그 처리
      if (!hasMoved.current && dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      hasMoved.current = true;

      const { x, y } = getOffset(e, container);
      const currentMin = snap(posToMin(x, y, container.clientWidth));

      const startMin = Math.min(anchorMin.current, currentMin);
      const endMin = Math.max(anchorMin.current, currentMin, startMin + MIN_DURATION);

      setDragStateSync({
        dateStr: dateStrRef.current,
        startMin,
        endMin,
        isCreating: true,
      });
    },
    [],
  );

  const onMouseUp = useCallback(
    (
      e: React.MouseEvent,
      onCellClick: (dateStr: string, hour: number) => void,
      container: HTMLDivElement,
    ) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      clearTimer();

      if (!longPressActive.current) {
        // 짧은 클릭 — 모달 열기
        const { y } = getOffset(e, container);
        const rowIndex = Math.floor(y / ROW_HEIGHT);
        const hour = HOUR_START + rowIndex;
        const realHour = hour >= 24 ? hour - 24 : hour;
        onCellClick(dateStrRef.current, realHour);
        fullReset();
        return;
      }

      longPressActive.current = false;
      setIsLongPressed(false);

      const current = dragStateRef.current;
      if (hasMoved.current && current && current.endMin - current.startMin >= MIN_DURATION) {
        // 드래그 완료 → 일정 생성
        onComplete(current.dateStr, current.startMin, current.endMin);
      } else {
        // long press만 하고 드래그 안 함 → 클릭과 동일하게 모달 열기
        const hour = Math.floor(anchorMin.current / 60);
        onCellClick(dateStrRef.current, hour);
      }

      setDragStateSync(null);
      hasMoved.current = false;
    },
    [onComplete],
  );

  const onMouseLeave = useCallback(() => {
    fullReset();
  }, []);

  return { dragState, isLongPressed, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}
