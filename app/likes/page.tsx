"use client";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import MovieGrid from "@/components/shared/MovieGrid";
import EmptyState from "@/components/shared/EmptyState";
import { getMarkedMovieIds } from "@/lib/storage";
import type { TmdbMovie } from "@/lib/types";

export default function LikesPage() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);

  useEffect(() => {
    const ids = getMarkedMovieIds("liked");
    if (ids.length === 0) { setMovies([]); return; }
    // 逐个获取喜欢的电影详情
    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/movie/${id}`);
          return await res.json();
        } catch { return null; }
      })
    ).then((results) => setMovies(results.filter(Boolean) as TmdbMovie[]));
  }, []);

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <h1 className="text-xl font-display font-semibold text-text-primary mb-1">♥ 我的喜欢</h1>
        <p className="text-text-muted text-sm mb-6">你标记为喜欢的电影</p>
        {movies.length === 0 ? (
          <EmptyState message="还没有喜欢的电影，去发现页逛逛吧" />
        ) : (
          <MovieGrid movies={movies} />
        )}
      </div>
    </PageWrapper>
  );
}
