"use client";
import { useState, useEffect } from "react";
import type { CountryFilmData } from "@/lib/types";
import type { TmdbMovie } from "@/lib/types";

interface CountryInfoPanelProps {
  country: CountryFilmData | null;
  onClose: () => void;
  onMovieClick: (movieId: number) => void;
}

export default function CountryInfoPanel({ country, onClose, onMovieClick }: CountryInfoPanelProps) {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!country) return;
    setLoading(true);
    // 加载推荐电影详情
    Promise.all(
      country.recommendedFilms.slice(0, 6).map(async (id) => {
        try {
          const res = await fetch(`/api/movie/${id}`);
          if (!res.ok) return null;
          return await res.json();
        } catch { return null; }
      })
    ).then((results) => {
      setMovies(results.filter(Boolean) as TmdbMovie[]);
      setLoading(false);
    });
  }, [country]);

  if (!country) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-bg/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto animate-in slide-in-from-right">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-card border border-white/10 text-text-muted hover:text-text-primary hover:border-white/20 transition-colors z-10"
      >
        ✕
      </button>

      <div className="p-6 pt-16">
        {/* 头部 */}
        <div className="mb-6">
          <p className="text-gold text-xs tracking-wider mb-1">
            {country.countryName}
          </p>
          <h2 className="text-xl font-display font-semibold text-text-primary">
            {country.countryNameZh}
          </h2>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {country.styleTags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded-full border border-gold/20 text-gold/80">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 电影发展历史 */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-gold rounded-full" />
            电影发展历史
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {country.filmHistory}
          </p>
        </section>

        {/* 知名导演 */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gold rounded-full" />
            本土知名导演
          </h3>
          <div className="space-y-3">
            {country.notableDirectors.slice(0, 4).map((d, i) => (
              <div key={i} className="bg-bg-card rounded-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary">{d.name}</span>
                  <span className="text-text-muted text-xs">{d.nameEn}</span>
                </div>
                <p className="text-text-secondary text-xs leading-relaxed">{d.bio}</p>
                {d.representativeWorks.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {d.representativeWorks.slice(0, 3).map((id) => (
                      <button
                        key={id}
                        onClick={() => onMovieClick(id)}
                        className="text-xs text-gold hover:underline"
                      >
                        代表作 →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 优质电影推荐 */}
        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gold rounded-full" />
            优质电影推荐
          </h3>
          {loading ? (
            <div className="text-center py-6 text-text-muted text-xs">加载中...</div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {movies.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMovieClick(m.id)}
                  className="text-left group"
                >
                  <div className="aspect-[2/3] rounded overflow-hidden bg-bg-elevated mb-1.5">
                    {m.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${m.poster_path}`}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                        暂无
                      </div>
                    )}
                  </div>
                  <p className="text-text-primary text-xs truncate">{m.title}</p>
                  {m.vote_average > 0 && (
                    <span className="text-gold text-[10px]">{m.vote_average.toFixed(1)}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-xs">暂无推荐</p>
          )}
        </section>
      </div>
    </div>
  );
}
