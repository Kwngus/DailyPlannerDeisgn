import { useState, useCallback } from "react";
import type { Category, Event } from "@/types";
import type { EventPayload } from "./useEvents";

const STORAGE_KEY = "planner-draft-events";

// DraftEvent는 Event와 호환되도록 동일한 shape 유지
export type DraftEvent = Omit<Event, "user_id" | "location" | "image_url" | "recurrence_type" | "recurrence_days" | "recurrence_end_date" | "recurrence_group_id" | "created_at"> & {
  user_id: string;
  location: null;
  image_url: null;
  recurrence_type: "none";
  recurrence_days: null;
  recurrence_end_date: null;
  recurrence_group_id: null;
  created_at: string;
};

function loadAll(): DraftEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftEvent[]) : [];
  } catch {
    return [];
  }
}

function saveAll(events: DraftEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {}
}

export function useDraftEvents(
  dateStr: string,
  categories: Category[],
  onAddActual: (payload: EventPayload) => Promise<void>,
) {
  const [allDrafts, setAllDrafts] = useState<DraftEvent[]>(() => loadAll());

  const draftEvents = allDrafts.filter((e) => e.date === dateStr);

  const addDraftEvent = useCallback(
    async (payload: EventPayload) => {
      const cat = categories.find((c) => c.id === payload.category_id) ?? undefined;
      const newDraft: DraftEvent = {
        id: crypto.randomUUID(),
        user_id: "",
        title: payload.title,
        date: payload.date,
        start_min: payload.start_min,
        end_min: payload.end_min,
        category_id: payload.category_id,
        category: cat,
        is_note: payload.is_note,
        is_allday: payload.is_allday,
        is_cancelled: payload.is_cancelled,
        note: payload.note || null,
        location: null,
        image_url: null,
        recurrence_type: "none",
        recurrence_days: null,
        recurrence_end_date: null,
        recurrence_group_id: null,
        created_at: new Date().toISOString(),
      };

      const updated = [...loadAll(), newDraft];
      saveAll(updated);
      setAllDrafts(updated);

      // 실제 이벤트도 DB에 동시 저장
      await onAddActual(payload);
    },
    [categories, onAddActual],
  );

  const updateDraftEvent = useCallback((id: string, changes: Partial<DraftEvent>) => {
    const all = loadAll();
    const updated = all.map((e) => (e.id === id ? { ...e, ...changes } : e));
    saveAll(updated);
    setAllDrafts(updated);
  }, []);

  const deleteDraftEvent = useCallback((id: string) => {
    const all = loadAll();
    const updated = all.filter((e) => e.id !== id);
    saveAll(updated);
    setAllDrafts(updated);
  }, []);

  return { draftEvents, addDraftEvent, updateDraftEvent, deleteDraftEvent };
}
