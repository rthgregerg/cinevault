import SectionHeader from "@/components/shared/SectionHeader";
import MovieGrid from "@/components/shared/MovieGrid";
import type { TmdbMovie } from "@/lib/types";

export default function RelatedMovies({ movies }: { movies: TmdbMovie[] }) {
  if (movies.length === 0) return null;
  return (
    <section className="mt-section">
      <SectionHeader title="相关推荐" subtitle="你可能也会喜欢" />
      <MovieGrid movies={movies} />
    </section>
  );
}
