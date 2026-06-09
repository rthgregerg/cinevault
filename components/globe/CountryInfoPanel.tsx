"use client";
import { useState, useEffect, useMemo } from "react";
import type { CountryFilmData } from "@/lib/types";
import type { TmdbMovie } from "@/lib/types";
import { COUNTRY_BORDERS } from "@/data/country-borders";

interface CountryInfoPanelProps {
  country: CountryFilmData | null;
  onClose: () => void;
  onMovieClick: (movieId: number) => void;
}

function CountryMapSvg({ countryCode, name }: { countryCode: string; name: string }) {
  const poly = COUNTRY_BORDERS[countryCode];
  const svgPath = useMemo(() => {
    if (!poly || poly.length < 3) return null;
    // 计算包围盒
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const [lat, lon] of poly) {
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    }
    const pad = 5;
    const vw = 240, vh = 160;
    const scaleX = (vw - pad * 2) / (maxLon - minLon || 1);
    const scaleY = (vh - pad * 2) / (maxLat - minLat || 1);
    const scale = Math.min(scaleX, scaleY);

    const cx = vw / 2 - ((maxLon + minLon) / 2 - minLon) * scale + pad * 0;
    const cy = vh / 2 + ((maxLat + minLat) / 2 - minLat) * scale;

    // 简化计算居中
    const pts = poly.map(([lat, lon]) => {
      const x = pad + (lon - minLon) * scale;
      const y = pad + (maxLat - lat) * scale;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // 重新居中
    let xs = poly.map(([, lon]) => pad + (lon - minLon) * scale);
    let ys = poly.map(([lat]) => pad + (maxLat - lat) * scale);
    const actualCx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const actualCy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const offsetX = vw / 2 - actualCx;
    const offsetY = vh / 2 - actualCy;

    return {
      d: `M ${poly.map(([lat, lon]) => {
        const x = pad + (lon - minLon) * scale + offsetX;
        const y = pad + (maxLat - lat) * scale + offsetY;
        return `${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(" L ")} Z`,
      vw,
      vh,
    };
  }, [poly]);

  if (!svgPath) return null;

  return (
    <div className="flex justify-center mb-4">
      <svg
        viewBox={`0 0 ${svgPath.vw} ${svgPath.vh}`}
        className="w-full max-w-[240px] opacity-90"
        style={{ filter: "drop-shadow(0 0 6px rgba(200,169,81,0.25))" }}
      >
        {/* 填充 */}
        <path
          d={svgPath.d}
          fill="rgba(200,169,81,0.08)"
          stroke="rgba(200,169,81,0.5)"
          strokeWidth="1"
        />
        {/* 辉光层 */}
        <path
          d={svgPath.d}
          fill="none"
          stroke="rgba(240,208,96,0.4)"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

export default function CountryInfoPanel({ country, onClose, onMovieClick }: CountryInfoPanelProps) {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!country) return;
    setLoading(true);
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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-card border border-white/10 text-text-muted hover:text-text-primary hover:border-white/20 transition-colors z-10"
      >
        ✕
      </button>

      <div className="p-6 pt-16">
        {/* 头部 */}
        <div className="mb-4">
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

        {/* 2D 精确国界地图 SVG */}
        <CountryMapSvg countryCode={country.countryCode} name={country.countryNameZh} />

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
