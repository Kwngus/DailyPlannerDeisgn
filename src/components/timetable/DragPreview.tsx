import { ROW_HEIGHT } from "@/lib/timeUtils";
import { minToTime } from "@/lib/timeUtils";
import type { DragState } from "@/lib/hooks/useDragCreate";

const HOUR_START = 5;

type Props = {
  dragState: DragState;
};

function hourToRowIndex(h: number): number {
  if (h === 0) return 19;
  if (h === 1) return 20;
  return h - HOUR_START;
}

export default function DragPreview({ dragState }: Props) {
  const { startMin, endMin } = dragState;
  const durationMin = endMin - startMin;

  const startHour = Math.floor(startMin / 60);
  // endMin이 정각(예: 600=10:00)이면 마지막 행은 이전 시(9시) 끝
  const endHour = endMin % 60 === 0
    ? Math.floor(endMin / 60) - 1
    : Math.floor(endMin / 60);

  const segments: {
    hour: number;
    leftPct: number;
    widthPct: number;
    topPx: number;
    isFirst: boolean;
  }[] = [];

  for (let h = startHour; h <= endHour; h++) {
    const segStartMin = h === startHour ? startMin % 60 : 0;
    const segEndMin   = h === endHour
      ? (endMin % 60 === 0 ? 60 : endMin % 60)
      : 60;

    const leftPct  = (segStartMin / 60) * 100;
    const widthPct = ((segEndMin - segStartMin) / 60) * 100;
    const topPx    = hourToRowIndex(h) * ROW_HEIGHT + 3;

    segments.push({ hour: h, leftPct, widthPct, topPx, isFirst: h === startHour });
  }

  return (
    <>
      {segments.map(({ hour, leftPct, widthPct, topPx, isFirst }) => (
        <div
          key={hour}
          className="absolute pointer-events-none z-20 rounded-md border-2 border-dashed border-gray-400"
          style={{
            top: `${topPx}px`,
            height: `${ROW_HEIGHT - 6}px`,
            left: `${leftPct}%`,
            width: `max(${widthPct}%, 4px)`,
            background: "rgba(100,100,100,0.15)",
          }}
        >
          {isFirst && (
            <div className="px-1.5 py-0.5 overflow-hidden whitespace-nowrap">
              <p className="text-[10px] font-semibold text-gray-600 leading-none">
                {minToTime(startMin)} – {minToTime(endMin)}
              </p>
              <p className="text-[9px] text-gray-400">{durationMin}분</p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
