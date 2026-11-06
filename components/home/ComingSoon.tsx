import MovieCard from "@/components/shared/MovieCard";
import SectionHeader from "@/components/shared/SectionHeader";
import type { TmdbMovie } from "@/lib/types";

export default function ComingSoon({ movies }: { movies: TmdbMovie[] }) {
  return (
    <section className="mb-section">
      <SectionHeader title="即将上映" subtitle="Coming Soon" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} size="sm" />
        ))}
      </div>
    </section>
  );
}
