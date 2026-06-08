import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";
import type { TmdbMovie } from "@/lib/types";
import { posterUrl, getYear } from "@/lib/utils";

export default function TopRated({ movies }: { movies: TmdbMovie[] }) {
  return (
    <section className="mb-section">
      <SectionHeader title="本周高分" subtitle="Top Rated This Week" href="/discover?sort=rating" />
      <div className="space-y-2">
        {movies.map((movie, i) => (
          <Link key={movie.id} href={`/movie/${movie.id}`}
            className="flex items-center gap-3 p-2.5 bg-bg-card rounded-card hover:bg-bg-elevated transition-colors group"
          >
            <span className={`w-6 text-center text-sm font-display font-semibold shrink-0 ${i < 3 ? "text-gold" : "text-text-muted"}`}>
              {i + 1}
            </span>
            <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-bg-elevated">
              <img src={posterUrl(movie.poster_path)} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text-primary truncate">{movie.title}</h3>
              <p className="text-xs text-text-muted mt-0.5">{getYear(movie.release_date)} / {movie.original_title}</p>
            </div>
            <span className="text-gold text-sm font-semibold font-display shrink-0">{movie.vote_average.toFixed(1)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
