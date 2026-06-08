import type { TmdbCredits } from "@/lib/types";

export default function CastSection({ credits }: { credits: TmdbCredits }) {
  const directors = credits.crew.filter((c) => c.job === "Director");
  const topCast = credits.cast.slice(0, 10);

  return (
    <div>
      <h3 className="text-base font-semibold text-text-primary font-display mb-3">演职员</h3>
      <div className="space-y-2 text-sm">
        {directors.length > 0 && (
          <div className="flex">
            <span className="text-text-muted w-16 shrink-0">导演</span>
            <span className="text-text-primary">{directors.map((d) => d.name).join(" / ")}</span>
          </div>
        )}
        {topCast.length > 0 && (
          <div className="flex">
            <span className="text-text-muted w-16 shrink-0">主演</span>
            <span className="text-text-primary">{topCast.map((c) => c.name).join(" / ")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
