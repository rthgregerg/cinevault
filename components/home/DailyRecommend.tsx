"use client";
import { useState, useEffect, useCallback } from "react";
import MovieCard from "@/components/shared/MovieCard";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import type { TmdbMovie, Mood, Scene } from "@/lib/types";
import { ALL_MOODS, ALL_SCENES, MOOD_EMOJI, SCENE_EMOJI } from "@/lib/recommendation-engine";

export default function DailyRecommend() {
  const [activeMood, setActiveMood] = useState<Mood>("放松");
  const [activeScene, setActiveScene] = useState<Scene>("周末放松");
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommend = useCallback(async (mood: Mood, scene: Scene) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommend?mood=${encodeURIComponent(mood)}&scene=${encodeURIComponent(scene)}`);
      const data = await res.json();
      setMovies(data.results || []);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommend(activeMood, activeScene);
  }, [activeMood, activeScene, fetchRecommend]);

  return (
    <section className="mb-section">
      {/* 标题 */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-display font-semibold text-text-primary">每日推荐</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
            每日更新
          </span>
        </div>
        <p className="text-text-muted text-xs mt-0.5">告诉我你的心情和场景，为你定制今日片单</p>
      </div>

      {/* 心情选择 */}
      <div className="mb-3">
        <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1.5">观影心情</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => setActiveMood(mood)}
              className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-all
                ${activeMood === mood
                  ? "border-gold bg-gold/10 text-gold scale-105"
                  : "border-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary"
                }`}
            >
              <span className="mr-1">{MOOD_EMOJI[mood]}</span>
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* 场景选择 */}
      <div className="mb-4">
        <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1.5">观影场景</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SCENES.map((scene) => (
            <button
              key={scene}
              onClick={() => setActiveScene(scene)}
              className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-all
                ${activeScene === scene
                  ? "border-gold bg-gold/10 text-gold scale-105"
                  : "border-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary"
                }`}
            >
              <span className="mr-1">{SCENE_EMOJI[scene]}</span>
              {scene}
            </button>
          ))}
        </div>
      </div>

      {/* 推荐结果 */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size="sm" />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-text-muted text-sm">
          暂无推荐，换个心情试试？
        </div>
      )}
    </section>
  );
}
