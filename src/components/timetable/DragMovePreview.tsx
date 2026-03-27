import { ROW_HEIGHT, getHourStart, minToTime } from "@/lib/timeUtils";
import type { DragMoveState } from "@/lib/hooks/useDragMove";

type Props = {
  moveState: DragMoveState;
};

function hourToRowIndex(h: number): number {
  const hourStart = getHourStart();
  return h >= hourStart ? h - hourStart : 24 - hourStart + h;
}

export default function DragMovePreview({ moveState }: Props) {
  const { event, startMin, endMin } = moveState;

  const startHour = Math.floor(startMin / 60);
  const endHour =
    endMin % 60 === 0 ? Math.floor(endMin / 60) - 1 : Math.floor(endMin / 60);

  const segments: {
    hour: number;
    leftPct: number;
    widthPct: number;
    topPx: number;
    isFirst: boolean;
  }[] = [];

  for (let h = startHour; h <= endHour; h++) {
    const segStartMin = h === startHour ? startMin % 60 : 0;
    const segEndMin =
      h === endHour ? (endMin % 60 === 0 ? 60 : endMin % 60) : 60;

    segments.push({
      hour: h,
      leftPct: (segStartMin / 60) * 100,
      widthPct: ((segEndMin - segStartMin) / 60) * 100,
      topPx: hourToRowIndex(h) * ROW_HEIGHT + 3,
      isFirst: h === startHour,
    });
  }

  return (
    <>
      {segments.map(({ hour, leftPct, widthPct, topPx, isFirst }) => (
        <div
          key={hour}
          className="absolute pointer-events-none z-20 rounded-md border-2 border-blue-400"
          style={{
            top: `${topPx}px`,
            height: `${ROW_HEIGHT - 6}px`,
            left: `${leftPct}%`,
            width: `max(${widthPct}%, 28px)`,
            background: "rgba(59,130,246,0.18)",
          }}
        >
          {isFirst && (
            <div className="px-1.5 py-0.5 overflow-hidden whitespace-nowrap">
              <p className="text-[10px] font-semibold text-blue-700 leading-none truncate">
                {event.title}
              </p>
              <p className="text-[9px] text-blue-500">
                {minToTime(startMin)} – {minToTime(endMin)}
              </p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
