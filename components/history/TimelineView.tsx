import Link from "next/link";
import type { FilmMovement } from "@/lib/types";

export default function TimelineView({ movements }: { movements: FilmMovement[] }) {
  const sorted = [...movements].sort((a, b) => {
    const startA = parseInt(a.years.split("-")[0]);
    const startB = parseInt(b.years.split("-")[0]);
    return startA - startB;
  });

  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gold/30" />
      <div className="space-y-8">
        {sorted.map((movement) => (
          <div key={movement.id} className="relative">
            <div className="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 border-gold bg-bg" />
            <Link href={`/history/${movement.id}`} className="block group">
              <span className="text-xs text-gold font-medium">{movement.years}</span>
              <h3 className="text-base font-display font-semibold text-text-primary mt-0.5 group-hover:text-gold transition-colors">
                {movement.name}
              </h3>
              <p className="text-text-secondary text-xs mt-1 line-clamp-2">{movement.description.slice(0, 100)}...</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
