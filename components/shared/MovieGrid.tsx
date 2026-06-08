import type { TmdbMovie } from "@/lib/types";
import MovieCard from "./MovieCard";
import EmptyState from "./EmptyState";

interface MovieGridProps {
  movies: TmdbMovie[];
  emptyMessage?: string;
  cardSize?: "sm" | "md" | "lg";
}

export default function MovieGrid({ movies, emptyMessage = "暂无电影", cardSize = "sm" }: MovieGridProps) {
  if (movies.length === 0) return <EmptyState message={emptyMessage} />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} size={cardSize} />
      ))}
    </div>
  );
}
