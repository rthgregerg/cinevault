import { posterUrl, backdropUrl, getYear } from "@/lib/utils";
import type { TmdbMovie } from "@/lib/types";

export default function MovieHero({ movie }: { movie: TmdbMovie }) {
  const bgImg = backdropUrl(movie.backdrop_path) || posterUrl(movie.poster_path);

  return (
    <div className="relative h-[420px] md:h-[500px] lg:h-[400px] overflow-hidden">
      <img src={bgImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent hidden lg:block" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 lg:max-w-lg">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-white leading-tight">
          {movie.title}
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {movie.original_title} · {getYear(movie.release_date)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {movie.genres?.slice(0, 3).map((g) => (
            <span key={g.id} className="text-xs px-2 py-0.5 rounded-full border border-white/30 text-white/80">
              {g.name}
            </span>
          ))}
          {movie.runtime && (
            <span className="text-xs text-white/60">{movie.runtime}分钟</span>
          )}
        </div>
      </div>
    </div>
  );
}