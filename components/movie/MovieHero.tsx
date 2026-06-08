import { posterUrl, backdropUrl, getYear } from "@/lib/utils";
import type { TmdbMovie } from "@/lib/types";

export default function MovieHero({ movie }: { movie: TmdbMovie }) {
  const bgImg = backdropUrl(movie.backdrop_path) || posterUrl(movie.poster_path);

  return (
    <div className="relative -mx-4 md:-mx-6 lg:-mx-8 h-[420px] md:h-[500px] lg:h-[400px] overflow-hidden">
      <img src={bgImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent hidden lg:block" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 lg:max-w-lg">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-white leading-tight">
          {movie.title}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{movie.original_title} · {getYear(movie.release_date)}</p>
        <div className="flex items-center gap-2 mt-2">
          {movie.genres?.slice(0, 3).map((g) => (
            <span key={g.id} className="text-xs px-2 py-0.5 rounded-full border border-white/20 text-text-secondary">
              {g.name}
            </span>
          ))}
          {movie.runtime && (
            <span className="text-xs text-text-muted">{movie.runtime}分钟</span>
          )}
        </div>
      </div>
    </div>
  );
}
