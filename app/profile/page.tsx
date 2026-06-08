"use client";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import StatCards from "@/components/profile/StatCards";
import RatingChart from "@/components/profile/RatingChart";
import MovieGrid from "@/components/shared/MovieGrid";
import { getMarkedMovieIds } from "@/lib/storage";
import type { TmdbMovie } from "@/lib/types";

async function fetchMoviesByIds(ids: string[]): Promise<TmdbMovie[]> {
  if (ids.length === 0) return [];
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`/api/movie/${id}`);
        return await res.json();
      } catch { return null; }
    })
  );
  return results.filter(Boolean) as TmdbMovie[];
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"watched" | "wantToWatch" | "collected" | "liked">("watched");
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [watched, setWatched] = useState(0);
  const [wantToWatch, setWantToWatch] = useState(0);
  const [collected, setCollected] = useState(0);
  const [liked, setLiked] = useState(0);

  useEffect(() => {
    setWatched(getMarkedMovieIds("watched").length);
    setWantToWatch(getMarkedMovieIds("wantToWatch").length);
    setCollected(getMarkedMovieIds("collected").length);
    setLiked(getMarkedMovieIds("liked").length);
  }, []);

  useEffect(() => {
    setLoading(true);
    const ids = getMarkedMovieIds(activeTab);
    fetchMoviesByIds(ids).then((m) => { setMovies(m); setLoading(false); });
  }, [activeTab]);

  const tabs = [
    { key: "watched" as const, label: "看过" },
    { key: "wantToWatch" as const, label: "想看" },
    { key: "collected" as const, label: "收藏" },
    { key: "liked" as const, label: "喜欢" },
  ];

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <h1 className="text-xl font-display font-semibold text-text-primary mb-1">我的</h1>
        <p className="text-text-muted text-sm mb-6">观影记录与统计</p>
        <StatCards watched={watched} wantToWatch={wantToWatch} collected={collected} liked={liked} />
        <div className="mt-4"><RatingChart /></div>
        <div className="flex gap-2 mt-6 mb-4 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`shrink-0 px-4 py-2 text-sm rounded-full border transition-colors ${activeTab === key ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary hover:border-white/20"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? <div className="text-center py-10 text-text-muted text-sm">加载中...</div> : <MovieGrid movies={movies} emptyMessage="暂无记录" />}
      </div>
    </PageWrapper>
  );
}
