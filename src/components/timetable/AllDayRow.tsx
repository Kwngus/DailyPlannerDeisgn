"use client";

import type { Event } from "@/types";

type Props = {
  events: Event[];           // is_allday === true 인 것들만
  onClick: (event: Event) => void;
};

function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function AllDayRow({ events, onClick }: Props) {
  if (events.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-[var(--border)] bg-[var(--border-subtle)] min-h-[32px] justify-center items-center">
      {events.map((event) => {
        const color = event.category?.color ?? "#8A847C";
        return (
          <button
            key={event.id}
            onClick={() => onClick(event)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold truncate max-w-full transition-opacity hover:opacity-80"
            style={{
              background: hexToRgba(color, 0.25),
              borderLeft: `3px solid ${color}`,
              color: color,
            }}
          >
            {event.title}
          </button>
        );
      })}
    </div>
  );
}
