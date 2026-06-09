import Link from "next/link";
import type { Collection } from "@/lib/types";

export default function CollectionCard({ collection }: { collection: Collection }) {
  const coverUrl = collection.coverMovieId
    ? `/api/movie/${collection.coverMovieId}`
    : null;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="card block group h-36 relative overflow-hidden"
    >
      {/* 封面占位 */}
      <div className="absolute inset-0 bg-bg-elevated flex items-center justify-center">
        {coverUrl ? (
          <div className="w-full h-full bg-gradient-to-br from-gold/20 to-blue-500/10" />
        ) : (
          <div className="text-center">
            <span className="text-3xl opacity-30">📁</span>
          </div>
        )}
      </div>

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />

      {/* 信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-base font-semibold text-text-primary truncate">
          {collection.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
          <span>{collection.movieIds.length} 部电影</span>
          {collection.description && (
            <>
              <span>·</span>
              <span className="truncate">{collection.description}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
