import Link from "next/link";
import type { FilmMovement } from "@/lib/types";

export default function MovementCard({ movement }: { movement: FilmMovement }) {
  return (
    <Link href={`/history/${movement.id}`} className="card block group">
      <div className="h-36 relative overflow-hidden bg-bg-elevated flex">
        {movement.posterCollage.length > 0 ? (
          movement.posterCollage.slice(0, 3).map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className={`object-cover ${movement.posterCollage.length === 1 ? "w-full" : "w-1/2"}`}
              loading="lazy"
            />
          ))
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: movement.bannerColor }} />
        )}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
      </div>
      <div className="p-4">
        <h3 className="text-base font-display font-semibold text-text-primary">{movement.name}</h3>
        <p className="text-gold text-xs mt-0.5">{movement.nameEn}</p>
        <p className="text-text-muted text-xs mt-0.5">{movement.years}</p>
        <p className="text-text-secondary text-xs mt-2 line-clamp-2">{movement.description.slice(0, 80)}...</p>
      </div>
    </Link>
  );
}
