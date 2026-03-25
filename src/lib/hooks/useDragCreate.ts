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
const DRAG_THRESHOLD = 6; // px — 이 이상 움직여야 드래그로 인식

export function useDragCreate(
  onComplete: (dateStr: string, startMin: number, endMin: number) => void,
) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const anchorMin = useRef(0); // 마우스다운 시점의 분
  const dateStrRef = useRef("");

  /** (x, y, containerWidth) → 절대 분 */
  function posToMin(x: number, y: number, containerWidth: number): number {
    const rowIndex = Math.floor(Math.max(0, y) / ROW_HEIGHT);
    const hour = HOUR_START + rowIndex;
    const realHour = hour >= 24 ? hour - 24 : hour;
    const minute = Math.floor(
      Math.max(0, Math.min(1, x / containerWidth)) * 60,
    );
    return realHour * 60 + minute;
  }

  function snap(min: number, interval = 5): number {
    return Math.round(min / interval) * interval;
  }

  function getOffset(
    e: React.MouseEvent,
    container: HTMLDivElement,
  ): { x: number; y: number } {
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
      mouseDownPos.current = { x: e.clientX, y: e.clientY };
      dateStrRef.current = dateStr;

      const { x, y } = getOffset(e, container);
      anchorMin.current = snap(posToMin(x, y, container.clientWidth));
    },
    [],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent, container: HTMLDivElement) => {
      if (!isDragging.current) return;

      const dx = Math.abs(e.clientX - mouseDownPos.current.x);
      const dy = Math.abs(e.clientY - mouseDownPos.current.y);
      if (!hasMoved.current && dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      hasMoved.current = true;

      const { x, y } = getOffset(e, container);
      const currentMin = snap(posToMin(x, y, container.clientWidth));

      const startMin = Math.min(anchorMin.current, currentMin);
      const endMin = Math.max(anchorMin.current, currentMin, startMin + MIN_DURATION);

      setDragState({
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

      if (!hasMoved.current) {
        // 단순 클릭 → 해당 행의 시간으로 모달 열기
        const { y } = getOffset(e, container);
        const rowIndex = Math.floor(y / ROW_HEIGHT);
        const hour = HOUR_START + rowIndex;
        const realHour = hour >= 24 ? hour - 24 : hour;
        onCellClick(dateStrRef.current, realHour);
        setDragState(null);
        return;
      }

      if (dragState && dragState.endMin - dragState.startMin >= MIN_DURATION) {
        onComplete(dragState.dateStr, dragState.startMin, dragState.endMin);
      }
      setDragState(null);
      hasMoved.current = false;
    },
    [dragState, onComplete],
  );

  const onMouseLeave = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      hasMoved.current = false;
      setDragState(null);
    }
  }, []);

  return { dragState, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}
