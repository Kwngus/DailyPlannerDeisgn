import Skeleton from "@/components/ui/Skeleton";
import { HOURS, ROW_HEIGHT } from "@/lib/timeUtils";

export default function WeekViewSkeleton() {
  const days = Array.from({ length: 7 });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mx-4">
      {/* 요일 헤더 */}
      <div
        className="grid border-b-2 border-gray-200"
        style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}
      >
        <div />
        {days.map((_, i) => (
          <div
            key={i}
            className="py-3 border-l border-gray-200 flex flex-col items-center gap-1"
          >
            <Skeleton className="w-6 h-3 rounded" />
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        ))}
      </div>

      {/* 시간 그리드 */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}
      >
        {/* 시간 라벨 */}
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

        {/* 날짜 컬럼 */}
        {days.map((_, di) => (
          <div key={di} className="relative border-l border-gray-200">
            {HOURS.map((h, hi) => (
              <div
                key={h}
                className="border-b border-gray-100"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {/* 각 컬럼에 1~2개 랜덤 이벤트 */}
                {di % 2 === 0 && hi === 3 && (
                  <Skeleton
                    className="absolute left-0.5 right-0.5 rounded top-1"
                    style={{ height: "40px" } as React.CSSProperties}
                  />
                )}
                {di % 3 === 1 && hi === 7 && (
                  <Skeleton
                    className="absolute left-0.5 right-0.5 rounded top-1"
                    style={{ height: "28px" } as React.CSSProperties}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
