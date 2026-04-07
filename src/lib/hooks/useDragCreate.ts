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
  // 터치 종료 후 합성 마우스 이벤트(ghost click) 무시용
  const lastTouchEnd = useRef(0);

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

  function computeOffset(clientX: number, clientY: number, container: HTMLDivElement) {
    const rect = container.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top + container.scrollTop,
    };
  }

  // ── Mouse handlers ──────────────────────────────────────────────────────────

  const onMouseDown = useCallback(
    (e: React.MouseEvent, dateStr: string, container: HTMLDivElement) => {
      if (e.button !== 0) return;
      // 터치 종료 직후 합성 마우스 이벤트 무시 (500ms)
      if (Date.now() - lastTouchEnd.current < 500) return;
      if ((e.target as HTMLElement).closest("[data-event-block]")) return;

      e.preventDefault();
      isDragging.current = true;
      hasMoved.current = false;
      longPressActive.current = false;
      mouseDownPos.current = { x: e.clientX, y: e.clientY };
      dateStrRef.current = dateStr;

      const { x, y } = computeOffset(e.clientX, e.clientY, container);
      anchorMin.current = snap(posToMin(x, y, container.clientWidth));

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
        if (dx > CANCEL_MOVE_PX || dy > CANCEL_MOVE_PX) {
          clearTimer();
          isDragging.current = false;
        }
        return;
      }

      if (!hasMoved.current && dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      hasMoved.current = true;

      const { x, y } = computeOffset(e.clientX, e.clientY, container);
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
        const { y } = computeOffset(e.clientX, e.clientY, container);
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
        onComplete(current.dateStr, current.startMin, current.endMin);
      } else {
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

  // ── Touch handlers ──────────────────────────────────────────────────────────

  const onTouchStart = useCallback(
    (e: React.TouchEvent, dateStr: string, container: HTMLDivElement) => {
      if ((e.target as HTMLElement).closest("[data-event-block]")) return;
      const touch = e.touches[0];

      isDragging.current = true;
      hasMoved.current = false;
      longPressActive.current = false;
      mouseDownPos.current = { x: touch.clientX, y: touch.clientY };
      dateStrRef.current = dateStr;

      const { x, y } = computeOffset(touch.clientX, touch.clientY, container);
      anchorMin.current = snap(posToMin(x, y, container.clientWidth));

      longPressTimer.current = setTimeout(() => {
        longPressActive.current = true;
        setIsLongPressed(true);
      }, LONG_PRESS_MS);
    },
    [],
  );

  // 네이티브 TouchEvent 수신 (non-passive 리스너로 등록해야 preventDefault 가능)
  const onTouchMove = useCallback(
    (e: TouchEvent, container: HTMLDivElement) => {
      if (!isDragging.current) return;
      const touch = e.touches[0];

      const dx = Math.abs(touch.clientX - mouseDownPos.current.x);
      const dy = Math.abs(touch.clientY - mouseDownPos.current.y);

      if (!longPressActive.current) {
        // long press 전 — 많이 움직이면 스크롤로 간주하고 취소
        if (dx > CANCEL_MOVE_PX || dy > CANCEL_MOVE_PX) {
          clearTimer();
          isDragging.current = false;
        }
        return;
      }

      // long press 활성 — 스크롤 막고 드래그 처리
      e.preventDefault();

      if (!hasMoved.current && dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      hasMoved.current = true;

      const { x, y } = computeOffset(touch.clientX, touch.clientY, container);
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

  const onTouchEnd = useCallback(
    (
      e: React.TouchEvent,
      onCellClick: (dateStr: string, hour: number) => void,
      container: HTMLDivElement,
    ) => {
      lastTouchEnd.current = Date.now();
      if (!isDragging.current) return;
      isDragging.current = false;
      clearTimer();

      const touch = e.changedTouches[0];

      if (!longPressActive.current) {
        // 짧은 탭 — 모달 열기
        const { y } = computeOffset(touch.clientX, touch.clientY, container);
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
        onComplete(current.dateStr, current.startMin, current.endMin);
      } else {
        const hour = Math.floor(anchorMin.current / 60);
        onCellClick(dateStrRef.current, hour);
      }

      setDragStateSync(null);
      hasMoved.current = false;
    },
    [onComplete],
  );

  return {
    dragState,
    isLongPressed,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
