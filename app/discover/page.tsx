"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import MovieGrid from "@/components/shared/MovieGrid";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import SearchOverlay from "@/components/search/SearchOverlay";
import ParticleGlobe from "@/components/globe/ParticleGlobe";
import type { TmdbMovie, TmdbGenre } from "@/lib/types";

type SortLabel = "popular" | "rating" | "date" | "title";
const SORT_MAP: Record<SortLabel, string> = {
  popular: "popularity.desc",
  rating: "vote_average.desc",
  date: "primary_release_date.desc",
  title: "original_title.asc",
};

export default function DiscoverPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sort, setSort] = useState<SortLabel>("popular");
  const [activeGenre, setActiveGenre] = useState<string>("");
  const [genres, setGenres] = useState<TmdbGenre[]>([]);

  useEffect(() => {
    fetch("/api/movies?type=genres")
      .then((r) => r.json())
      .then((d) => setGenres(d.genres || []))
      .catch(() => {});
  }, []);

  const fetchMovies = useCallback(async (pageNum: number, reset: boolean) => {
    setLoading(true);
    const params = new URLSearchParams({
      type: "discover", page: String(pageNum), sort_by: SORT_MAP[sort],
    });
    if (activeGenre) params.set("with_genres", activeGenre);

    try {
      const res = await fetch(`/api/movies?${params}`);
      const data = await res.json();
      setMovies((prev) => reset ? data.results : [...prev, ...data.results]);
      setHasMore(data.page < data.total_pages);
    } catch {} finally { setLoading(false); }
  }, [sort, activeGenre]);

  useEffect(() => { fetchMovies(1, true); }, [fetchMovies]);

  return (
    <PageWrapper>
      <div className="pt-4 lg:pt-8">
        {/* 3D 粒子地球仪 */}
        <div className="mb-6">
          <ParticleGlobe
            onMovieClick={(movieId) => router.push(`/movie/${movieId}`)}
          />
        </div>

        <div className="mb-4">
          <button onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-bg-card rounded-card border border-white/5 text-text-muted text-sm hover:border-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            搜索电影、导演、演员...
          </button>
        </div>

        {/* Sort + Genre Filter */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {( ["popular", "rating", "date", "title"] as SortLabel[] ).map((opt) => (
              <button key={opt} onClick={() => { setSort(opt); setPage(1); }}
                className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors
                  ${sort === opt ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary hover:border-white/30"}`}
              >
                {opt === "popular" && "热门"}{opt === "rating" && "评分最高"}{opt === "date" && "最新"}{opt === "title" && "片名"}
              </button>
            ))}
          </div>
          {/* Genre tags */}
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveGenre("")}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${!activeGenre ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary"}`}
            >全部</button>
            {genres.slice(0, 15).map((g) => (
              <button key={g.id} onClick={() => setActiveGenre(String(g.id))}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${activeGenre === String(g.id) ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary"}`}
              >{g.name}</button>
            ))}
          </div>
        </div>

        {loading && movies.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            <MovieGrid movies={movies} emptyMessage="没有找到匹配的电影" />
            {hasMore && (
              <div className="flex justify-center mt-8 mb-4">
                <button onClick={() => { const n = page + 1; setPage(n); fetchMovies(n, false); }}
                  className="px-8 py-2.5 border border-white/10 rounded-full text-text-secondary text-sm hover:border-gold hover:text-gold transition-colors"
                >加载更多</button>
              </div>
            )}
          </>
        )}
      </div>
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </PageWrapper>
  );
}
