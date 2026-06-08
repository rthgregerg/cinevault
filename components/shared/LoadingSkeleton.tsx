export default function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bg-card rounded-card overflow-hidden animate-pulse">
          <div className="h-44 bg-bg-elevated" />
          <div className="p-2.5 space-y-2">
            <div className="h-3 bg-bg-elevated rounded w-3/4" />
            <div className="h-2.5 bg-bg-elevated rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
