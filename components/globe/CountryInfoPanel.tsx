"use client";
import { useState, useEffect, useMemo } from "react";
import type { CountryFilmData } from "@/lib/types";
import type { TmdbMovie } from "@/lib/types";

// ===== 国家边界 SVG 数据 =====
const COUNTRY_SVG: Record<string, [number, number][]> = {
  US: [[72,-168],[70,-142],[72,-125],[68,-85],[60,-65],[47,-53],[38,-76],[28,-83],[16,-89],[8,-78],[20,-97],[30,-112],[34,-120],[44,-124],[55,-132],[64,-148],[72,-168]],
  FR: [[51,2],[48,-5],[43,-3],[36,-5],[37,0],[38,5],[36,10],[37,14],[41,26],[43,34],[45,40],[47,38],[50,40],[53,42],[55,45],[51,2]],
  JP: [[45.5,142],[40,141],[34,137],[31,131],[31.5,130],[35,133],[38,138],[41,140],[45.5,142]],
  KR: [[38.5,126],[35,127],[34.5,128.5],[37,129.5],[39,128.5],[38.5,126]],
  GB: [[58.5,-6.5],[57,-3],[54,-1.5],[51,0],[50,-4],[52.5,-5.5],[57,-7],[58.5,-6.5]],
  IT: [[46,8],[44,8],[42,12],[40,14],[38,15],[37,15],[38,17],[40,18],[42,16],[44,14],[46,12],[46,8]],
  DE: [[55,6],[54,10],[52,14],[50,13],[48,10],[47,7],[48,6],[50,6],[52,7],[54,6],[55,6]],
  IN: [[35,72],[28,68],[22,72],[10,78],[7,80],[10,84],[20,90],[25,85],[30,74],[35,72]],
  CN: [[53,123],[48,127],[42,120],[35,119],[30,122],[25,118],[22,108],[22,100],[24,98],[28,98],[35,105],[40,108],[45,115],[50,120],[53,123]],
  HK: [[22.5,114],[22.3,114.3],[22.2,114.3],[22.1,114.1],[22.3,113.9],[22.5,114]],
  TW: [[25.3,121.5],[24,120.5],[22,120.5],[22.5,121.5],[24.5,122],[25.3,121.5]],
  IR: [[39,45],[37,48],[35,50],[32,48],[30,52],[32,54],[35,56],[38,56],[39,50],[39,45]],
  ES: [[43.5,-8],[42,-7],[40,-5],[37,-4],[36,-6],[37,-7],[39,-8],[41,-9],[43,-8],[43.5,-8]],
  RU: [[70,35],[70,50],[68,60],[64,70],[60,80],[55,85],[50,80],[45,75],[42,65],[44,55],[50,50],[55,45],[60,40],[65,35],[70,35]],
  AU: [[-12,130],[-20,120],[-30,116],[-35,128],[-30,140],[-22,150],[-15,146],[-12,140],[-12,130]],
  BR: [[5,-68],[-3,-60],[-10,-50],[-20,-42],[-25,-40],[-30,-50],[-33,-55],[-28,-58],[-20,-55],[-10,-65],[0,-70],[5,-68]],
  NZ: [[-34.5,173],[-40,176],[-45,170],[-46.5,168],[-44,168],[-38,173],[-34.5,173]],
  AR: [[-22,-65],[-25,-60],[-30,-58],[-40,-65],[-55,-68],[-50,-70],[-35,-60],[-22,-65]],
  TH: [[20,100],[18,104],[14,109],[10,106],[6,104],[8,100],[12,98],[16,98],[20,100]],
  EG: [[32,25],[30,32],[28,34],[24,36],[22,34],[22,30],[24,28],[28,26],[32,25]],
  ZA: [[-22,18],[-25,20],[-30,26],[-35,22],[-34,18],[-32,16],[-28,16],[-22,18]],
  MX: [[32,-117],[30,-115],[26,-110],[22,-105],[18,-98],[16,-93],[18,-88],[20,-97],[25,-103],[30,-112],[32,-117]],
  TR: [[42,26],[40,30],[38,36],[36,32],[36,28],[38,26],[42,26]],
  SE: [[69,20],[65,22],[60,18],[56,14],[58,12],[60,14],[63,18],[66,22],[69,20]],
  CA: [[72,-140],[68,-120],[60,-95],[55,-78],[50,-68],[48,-80],[50,-90],[55,-100],[60,-110],[65,-125],[72,-140]],
  PL: [[54,14],[53,18],[52,23],[50,24],[49,22],[50,18],[51,14],[54,14]],
  DK: [[57,8],[56,10],[55,12],[55,9],[56,7],[57,8]],
  NG: [[14,3],[10,4],[5,3],[5,8],[8,12],[13,13],[14,3]],
};

interface CountryInfoPanelProps {
  country: CountryFilmData | null;
  onClose: () => void;
  onMovieClick: (movieId: number) => void;
}

function CountryMapSvg({ countryCode, name }: { countryCode: string; name: string }) {
  const poly = COUNTRY_SVG[countryCode];
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
