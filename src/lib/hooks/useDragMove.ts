import { useState, useRef, useCallback } from "react";
import { ROW_HEIGHT, getHourStart } from "@/lib/timeUtils";
import type { Event } from "@/types";

const SNAP_MIN = 15;

export type DragMoveState = {
  event: Event;
  startMin: number;
  endMin: number;
};

export function useDragMove(
  onMoveComplete: (id: string, startMin: number, endMin: number) => void,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [moveState, setMoveState] = useState<DragMoveState | null>(null);

  const isDragging = useRef(false);
  const eventRef = useRef<Event | null>(null);
  const dragOffsetMin = useRef(0);
  const activeContainer = useRef<HTMLDivElement | null>(null);
  const moveStateRef = useRef<DragMoveState | null>(null);

  function syncMoveState(s: DragMoveState | null) {
    moveStateRef.current = s;
    setMoveState(s);
  }

  function posToMin(x: number, y: number, containerWidth: number): number {
    const hourStart = getHourStart();
    const rowIndex = Math.floor(Math.max(0, y) / ROW_HEIGHT);
    const hour = hourStart + rowIndex;
    const realHour = hour >= 24 ? hour - 24 : hour;
    const minute =
      Math.round((Math.max(0, Math.min(1, x / containerWidth)) * 60) / SNAP_MIN) * SNAP_MIN;
    return realHour * 60 + minute;
  }

  function getOffset(e: React.MouseEvent, container: HTMLDivElement) {
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + container.scrollTop,
    };
  }

  const onEventMouseDown = useCallback(
    (e: React.MouseEvent, event: Event, container: HTMLDivElement) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      isDragging.current = true;
      eventRef.current = event;
      activeContainer.current = container;
      setDraggingId(event.id);

      const { x, y } = getOffset(e, container);
      const clickMin = posToMin(x, y, container.clientWidth);
      dragOffsetMin.current = clickMin - event.start_min;
    },
    [],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent, container: HTMLDivElement) => {
      if (!isDragging.current || !eventRef.current) return;
      if (container !== activeContainer.current) return;

      const { x, y } = getOffset(e, container);
      const rawMin = posToMin(x, y, container.clientWidth);
      const duration = eventRef.current.end_min - eventRef.current.start_min;
      const newStartMin =
        Math.round((rawMin - dragOffsetMin.current) / SNAP_MIN) * SNAP_MIN;
      const clamped = Math.max(0, newStartMin);

      syncMoveState({
        event: eventRef.current,
        startMin: clamped,
        endMin: clamped + duration,
      });
    },
    [],
  );

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDraggingId(null);

    const current = moveStateRef.current;
    const orig = eventRef.current;
    if (current && orig && (current.startMin !== orig.start_min || current.endMin !== orig.end_min)) {
      onMoveComplete(orig.id, current.startMin, current.endMin);
    }

    eventRef.current = null;
    activeContainer.current = null;
    syncMoveState(null);
  }, [onMoveComplete]);

  const cancelDrag = useCallback(() => {
    isDragging.current = false;
    eventRef.current = null;
    activeContainer.current = null;
    setDraggingId(null);
    syncMoveState(null);
  }, []);

  return { draggingId, moveState, onEventMouseDown, onMouseMove, onMouseUp, cancelDrag };
}
