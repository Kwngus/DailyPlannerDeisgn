import Skeleton from "@/components/ui/Skeleton";

export default function MonthViewSkeleton() {
  const weeks = Array.from({ length: 5 });
  const days = Array.from({ length: 7 });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mx-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b-2 border-gray-200">
        {days.map((_, i) => (
          <div key={i} className="py-2.5 flex justify-center">
            <Skeleton className="w-6 h-3 rounded" />
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      {weeks.map((_, wi) => (
        <div
          key={wi}
          className="grid grid-cols-7 border-b border-gray-100 last:border-b-0"
        >
          {days.map((_, di) => (
            <div
              key={di}
              className="min-h-[100px] p-2 border-r border-gray-100 last:border-r-0"
            >
              {/* 날짜 숫자 */}
              <div className="flex justify-end mb-2">
                <Skeleton className="w-7 h-7 rounded-full" />
              </div>
              {/* 이벤트 미리보기 */}
              {(wi + di) % 3 === 0 && (
                <Skeleton className="w-full h-4 rounded mb-1" />
              )}
              {(wi * di) % 5 === 0 && (
                <Skeleton className="w-3/4 h-4 rounded" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
