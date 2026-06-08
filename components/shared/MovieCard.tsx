import Link from "next/link";
import type { TmdbMovie } from "@/lib/types";
import { posterUrl, getYear } from "@/lib/utils";

interface MovieCardProps {
  movie: TmdbMovie;
  size?: "sm" | "md" | "lg";
}

export default function MovieCard({ movie, size = "sm" }: MovieCardProps) {
  const posterH = size === "lg" ? "h-64" : size === "md" ? "h-52" : "h-44";

  return (
    <Link href={`/movie/${movie.id}`} className="card block group">
      <div className={`${posterH} relative overflow-hidden bg-bg-elevated`}>
        <img
          src={posterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {movie.vote_average > 0 && (
          <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gold text-xs font-medium px-1.5 py-0.5 rounded">
            {movie.vote_average.toFixed(1)}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-12 gradient-overlay" />
      </div>
      <div className="p-2.5">
        <h3 className="text-text-primary text-sm font-medium truncate">{movie.title}</h3>
        <p className="text-text-secondary text-xs mt-0.5 truncate">{getYear(movie.release_date)} / {movie.original_title}</p>
      </div>
    </Link>
  );
}
