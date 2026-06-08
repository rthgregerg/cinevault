import { notFound } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import MovieHero from "@/components/movie/MovieHero";
import RatingDisplay from "@/components/movie/RatingDisplay";
import ActionButtons from "@/components/movie/ActionButtons";
import CastSection from "@/components/movie/CastSection";
import RelatedMovies from "@/components/movie/RelatedMovies";
import { getMovieDetail, getMovieCredits, getSimilarMovies } from "@/lib/tmdb";
import type { TmdbMovie, TmdbCredits } from "@/lib/types";

interface Props {
  params: { slug: string };
}

export default async function MovieDetailPage({ params }: Props) {
  const movieId = parseInt(params.slug);
  if (isNaN(movieId)) notFound();

  let movie: TmdbMovie | null = null;
  let credits: TmdbCredits | null = null;
  let similar: TmdbMovie[] = [];

  try {
    [movie, credits, { results: similar }] = await Promise.all([
      getMovieDetail(movieId).catch(() => null),
      getMovieCredits(movieId).catch(() => null),
      getSimilarMovies(movieId).catch(() => ({ results: [] })),
    ]);
  } catch {}

  if (!movie) notFound();

  return (
    <PageWrapper withPadding={false}>
      <MovieHero movie={movie} />
      <div className="px-4 md:px-6 lg:px-8 lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 py-4">
          <ActionButtons movieId={String(movie.id)} />
          <div>
            <h3 className="text-base font-semibold text-text-primary font-display mb-2">剧情简介</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{movie.overview || "暂无简介"}</p>
          </div>
          {credits && <CastSection credits={credits} />}
          <div className="flex flex-wrap gap-1.5">
            {movie.genres?.map((g) => (
              <span key={g.id} className="px-2.5 py-1 text-xs bg-bg-card rounded-full text-text-muted">
                {g.name}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 pb-4 lg:pt-4">
          <div className="lg:sticky lg:top-8">
            <RatingDisplay rating={movie.vote_average} ratingCount={movie.vote_count} />
          </div>
        </div>
      </div>
      <div className="px-4 md:px-6 lg:px-8">
        {similar.length > 0 && <RelatedMovies movies={similar.slice(0, 6)} />}
      </div>
      <div className="h-8" />
    </PageWrapper>
  );
}
