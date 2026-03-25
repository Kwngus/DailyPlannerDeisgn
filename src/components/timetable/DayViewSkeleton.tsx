import Skeleton from "@/components/ui/Skeleton";
import { HOURS, ROW_HEIGHT } from "@/lib/timeUtils";

export default function DayViewSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mx-4">
      {/* 날짜 헤더 */}
      <div
        className="grid border-b-2 border-gray-200"
        style={{ gridTemplateColumns: "52px 1fr" }}
      >
        <div />
        <div className="py-3 px-4 border-l border-gray-200 flex flex-col items-center gap-1">
          <Skeleton className="w-6 h-3 rounded" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* 시간 행 */}
      <div className="grid" style={{ gridTemplateColumns: "52px 1fr" }}>
        <div className="border-r border-gray-200">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex items-start justify-end pr-2 pt-1"
              style={{ height: `${ROW_HEIGHT}px` }}
            >
              <Skeleton className="w-6 h-3 rounded" />
            </div>
          ))}
        </div>

        <div className="relative">
          {HOURS.map((h, i) => (
            <div
              key={h}
              className="border-b border-gray-100 relative"
              style={{ height: `${ROW_HEIGHT}px` }}
            >
              {/* 랜덤하게 일부 행에만 스켈레톤 이벤트 표시 */}
              {[2, 5, 8, 12, 15].includes(i) && (
                <Skeleton
                  className="absolute left-1 right-8 rounded-md"
                  style={
                    {
                      top: "6px",
                      height: i === 5 ? "96px" : "44px",
                    } as React.CSSProperties
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
