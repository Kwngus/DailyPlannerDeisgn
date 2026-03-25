import Skeleton from "@/components/ui/Skeleton";

export default function TodoPanelSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="space-y-1.5">
          <Skeleton className="w-16 h-4 rounded" />
          <Skeleton className="w-12 h-3 rounded" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* 그룹 */}
      <div className="flex-1 px-3 py-2 space-y-4">
        {[1, 2].map((g) => (
          <div key={g}>
            <Skeleton className="w-16 h-3 rounded mb-2" />
            <div className="space-y-2">
              {Array.from({ length: g === 1 ? 3 : 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100"
                >
                  <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="w-full h-3.5 rounded" />
                    <Skeleton className="w-1/2 h-3 rounded" />
                  </div>
                  <Skeleton className="w-3 h-3 rounded flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
