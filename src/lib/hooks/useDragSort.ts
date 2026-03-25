import { useState, useRef } from "react";

export function useDragSort<T extends { id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overIds, setOverId] = useState<string | null>(null);
  const dragItem = useRef<T | null>(null);

  function handleDragStart(item: T) {
    setDraggingId(item.id);
    dragItem.current = item;
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragItem.current || dragItem.current.id === targetId) return;
    setOverId(targetId);
  }

  function handleDrop(targetId: string) {
    if (!dragItem.current || dragItem.current.id === targetId) return;

    const fromIdx = items.findIndex((i) => i.id === dragItem.current!.id);
    const toIdx = items.findIndex((i) => i.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newItems = [...items];
    const [moved] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, moved);
    onReorder(newItems);

    setDraggingId(null);
    setOverId(null);
    dragItem.current = null;
  }

  function handleDragEnd() {
    setDraggingId(null);
    setOverId(null);
    dragItem.current = null;
  }

  // 모바일 터치 드래그
  const touchStartY = useRef<number>(0);
  const touchItemId = useRef<string | null>(null);

  function handleTouchStart(e: React.TouchEvent, item: T) {
    touchStartY.current = e.touches[0].clientY;
    touchItemId.current = item.id;
    setDraggingId(item.id);
    dragItem.current = item;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!dragItem.current) return;
    const currentY = e.touches[0].clientY;
    const el = document.elementFromPoint(e.touches[0].clientX, currentY);
    const targetEl = el?.closest("[data-todo-id]");
    const targetId = targetEl?.getAttribute("data-todo-id");
    if (targetId && targetId !== dragItem.current.id) {
      setOverId(targetId);
    }
  }

  function handleTouchEnd() {
    if (dragItem.current && overIds) {
      handleDrop(overIds);
    } else {
      setDraggingId(null);
      setOverId(null);
      dragItem.current = null;
    }
  }

  return {
    draggingId,
    overId: overIds,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
