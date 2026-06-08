import Link from "next/link";
import type { TmdbMovie } from "@/lib/types";
import { posterUrl } from "@/lib/utils";

export default function DailyPick({ movie }: { movie: TmdbMovie }) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <section className="relative mb-section rounded-card overflow-hidden h-48 group cursor-pointer">
        <img src={posterUrl(movie.poster_path)} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <p className="text-gold text-xs font-medium tracking-wider mb-1">✦ 今日推荐 · Daily Pick</p>
          <h2 className="text-white text-xl font-display font-semibold">{movie.title}</h2>
          <p className="text-text-secondary text-xs mt-1 line-clamp-2">{movie.overview}</p>
          <p className="text-gold text-sm font-semibold mt-2">{movie.vote_average.toFixed(1)}</p>
        </div>
      </section>
    </Link>
  );
}
